import express from 'express';
import { WELLNESS_PROMPTS, WellnessPrompts } from '../config/wellnessPrompts';
import { db } from '../database/knex';

const router = express.Router();

/**
 * GET /prompts
 * Get wellness interview prompts with fallback to hardcoded defaults
 */
router.get('/', async (req, res) => {
  try {
    // Try to get custom prompts from database
    const customPrompts = await db('custom_prompts').select('*');
    
    // Start with hardcoded defaults
    const finalPrompts: WellnessPrompts = { ...WELLNESS_PROMPTS };
    
    // Override with custom prompts if they exist
    customPrompts.forEach(custom => {
      if (finalPrompts[custom.stage_id]) {
        // Merge custom prompts with defaults, only override non-null values
        const validFields = ['question_prompt', 'extraction_prompt'];
        validFields.forEach(field => {
          if (custom[field]) {
            (finalPrompts[custom.stage_id] as any)[field] = custom[field];
          }
        });
      }
    });

    res.json(finalPrompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    // Fallback to hardcoded prompts if database fails
    res.json(WELLNESS_PROMPTS);
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

    // Validate prompt fields
    const validFields = ['question_prompt', 'extraction_prompt'];
    const updateData: any = { stage_id: stageId };
    
    validFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Check if custom prompt already exists
    const existing = await db('custom_prompts').where('stage_id', stageId).first();
    
    if (existing) {
      // Update existing custom prompt
      await db('custom_prompts')
        .where('stage_id', stageId)
        .update({
          ...updateData,
          updated_at: new Date()
        });
    } else {
      // Insert new custom prompt
      await db('custom_prompts').insert(updateData);
    }

    // Return updated prompts for this stage
    const updated = await db('custom_prompts').where('stage_id', stageId).first();
    const stagePrompts = { ...WELLNESS_PROMPTS[stageId] };
    
    // Merge with custom values
    if (updated) {
      validFields.forEach(field => {
        if (updated[field]) {
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

export default router;
