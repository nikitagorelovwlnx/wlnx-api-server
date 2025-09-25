import express from 'express';
import { WELLNESS_FORM_SCHEMA } from '../config/wellnessFormSchema';
import { FormSchemaResponse } from '../types/form-spec';

const router = express.Router();

/**
 * GET /form-schemas
 * Get the current wellness form schema (hardcoded)
 */
router.get('/', async (req, res) => {
  try {
    const response: FormSchemaResponse = {
      success: true,
      data: WELLNESS_FORM_SCHEMA
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching form schema:', error);
    const response: FormSchemaResponse = {
      success: false,
      error: 'Failed to fetch form schema'
    };
    res.status(500).json(response);
  }
});

export default router;
