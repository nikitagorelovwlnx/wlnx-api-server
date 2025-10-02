import express from 'express';
import { getAllCoaches, getCoachById, updateCoachPrompt } from '../services/coachService';
import { UpdateCoachRequest } from '../types';

const router = express.Router();

/**
 * GET /coaches
 * Get all coaches
 */
router.get('/', async (req, res) => {
  try {
    const coaches = await getAllCoaches();
    
    res.json({
      success: true,
      data: coaches
    });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coaches'
    });
  }
});

/**
 * GET /coaches/:id
 * Get specific coach by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(404).json({
        success: false,
        error: `Coach with id ${id} not found`
      });
    }
    
    const coach = await getCoachById(id);
    
    if (!coach) {
      return res.status(404).json({
        success: false,
        error: `Coach with id ${id} not found`
      });
    }
    
    res.json({
      success: true,
      data: coach
    });
  } catch (error) {
    console.error('Error fetching coach:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coach'
    });
  }
});

/**
 * PUT /coaches/:id
 * Update coach prompt content only
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateCoachRequest = req.body;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(404).json({
        success: false,
        error: `Coach with id ${id} not found`
      });
    }
    
    // Validate required field
    if (!updateData.coach_prompt_content || updateData.coach_prompt_content.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'coach_prompt_content is required and cannot be empty'
      });
    }
    
    const updatedCoach = await updateCoachPrompt(id, updateData);
    
    res.json({
      success: true,
      data: updatedCoach,
      message: `Coach prompt updated successfully`
    });
  } catch (error) {
    console.error('Error updating coach:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update coach'
    });
  }
});

export default router;
