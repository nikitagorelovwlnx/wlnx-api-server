import express from 'express';
import { WELLNESS_PROMPTS } from '../config/wellnessPrompts';

const router = express.Router();

/**
 * GET /prompts
 * Get wellness interview prompts map (hardcoded)
 */
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: WELLNESS_PROMPTS
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompts'
    });
  }
});

export default router;
