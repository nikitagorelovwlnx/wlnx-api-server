import express from 'express';
import { WELLNESS_PROMPTS, WellnessPrompts } from '../config/wellnessPrompts';
import { getDb } from '../database';

const router = express.Router();

/**
 * GET /prompts
 * Get wellness interview prompts from database
 */
router.get('/', async (req, res) => {
  try {
    // Get custom prompts from database
    const customPrompts = await getDb()('custom_prompts').select('*');
    
    const finalPrompts: WellnessPrompts = JSON.parse(JSON.stringify(WELLNESS_PROMPTS));
    
    // Override with custom prompts if they exist
    customPrompts.forEach(custom => {
      if (finalPrompts[custom.stage_id]) {
        // If custom record exists, use it completely (overrides defaults)
        const validFields = ['question_prompt', 'extraction_prompt'];
        validFields.forEach(field => {
          if (custom[field] !== null) {
            (finalPrompts[custom.stage_id] as any)[field] = custom[field];
          }
        });
      }
    });
    
    res.json({
      success: true,
      data: finalPrompts
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
    });
  }
});

/**
 * PUT /prompts/:stageId
 * Update prompts for specific stage (only stores changes, not defaults)
 */
router.put('/:stageId', async (req, res) => {
  try {
    const { stageId } = req.params;
    const updates = req.body;

    // Validate stage exists in defaults
    if (!WELLNESS_PROMPTS[stageId]) {
      return res.status(404).json({
        success: false,
        error: `Stage '${stageId}' not found`
      });
    }

    const validFields = ['question_prompt', 'extraction_prompt'];
    
    // Check if we should delete (if any provided field is null or empty)
    const shouldDelete = validFields.some(field => {
      if (updates.hasOwnProperty(field)) {
        const value = updates[field];
        return value === null || value === undefined || value === '';
      }
      return false;
    });

    if (shouldDelete) {
      // Delete custom prompt to return to defaults
      await getDb()('custom_prompts').where('stage_id', stageId).del();
    } else {
      // Prepare update data
      const updateData: any = { stage_id: stageId };
      validFields.forEach(field => {
        if (updates.hasOwnProperty(field)) {
          updateData[field] = updates[field];
        }
      });

      // Check if custom prompt already exists
      const existing = await getDb()('custom_prompts').where('stage_id', stageId).first();
      
      if (existing) {
        // Update existing custom prompt
        await getDb()('custom_prompts')
          .where('stage_id', stageId)
          .update({
            ...updateData,
            updated_at: new Date()
          });
      } else {
        // Insert new custom prompt
        await getDb()('custom_prompts').insert(updateData);
      }
    }

    // Return current prompts for this stage (either defaults or custom)
    const updated = await getDb()('custom_prompts').where('stage_id', stageId).first();
    const stagePrompts = JSON.parse(JSON.stringify(WELLNESS_PROMPTS[stageId]));
    
    // If custom values exist, use them; otherwise keep defaults
    if (updated) {
      validFields.forEach(field => {
        if (updated[field] !== null) {
          (stagePrompts as any)[field] = updated[field];
        }
      });
    }

    res.json({
      success: true,
      data: {
        stage_id: stageId,
        prompts: stagePrompts
      },
      message: `Prompts for stage '${stageId}' updated successfully`
    });
  } catch (error) {
    console.error('Error updating prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update prompts'
    });
  }
});

/**
 * GET /prompts/debug/:stageId
 * Debug endpoint to check database state
 */
router.get('/debug/:stageId', async (req, res) => {
  try {
    const { stageId } = req.params;
    const db = getDb();
    
    // Get custom prompt from database
    const customPrompt = await db('custom_prompts').where('stage_id', stageId).first();
    
    // Get default prompt
    const defaultPrompt = WELLNESS_PROMPTS[stageId];
    
    res.json({
      success: true,
      debug: {
        stageId,
        database_type: db.client.constructor.name,
        database_config: {
          client: db.client.config.client,
          filename: db.client.config.connection?.filename,
          database: db.client.config.connection?.database
        },
        custom_prompt_from_db: customPrompt,
        default_prompt: defaultPrompt,
        final_merged: customPrompt ? {
          question_prompt: customPrompt.question_prompt !== null ? customPrompt.question_prompt : defaultPrompt?.question_prompt,
          extraction_prompt: customPrompt.extraction_prompt !== null ? customPrompt.extraction_prompt : defaultPrompt?.extraction_prompt
        } : defaultPrompt,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
