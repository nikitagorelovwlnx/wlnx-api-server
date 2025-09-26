import express from 'express';
import { WELLNESS_FORM_SCHEMA } from '../config/wellnessFormSchema';
import { FormSchemaResponse } from '../types/form-spec';

const router = express.Router();

/**
 * GET /form-schemas
 * Get all form schemas (hardcoded wellness schema)
 */
router.get('/', async (req, res) => {
  try {
    const response = {
      success: true,
      data: {
        schemas: [WELLNESS_FORM_SCHEMA],
        total: 1
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching form schemas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch form schemas'
    });
  }
});

/**
 * GET /form-schemas/:name
 * Get specific form schema by name
 */
router.get('/:name', async (req, res) => {
  const { name } = req.params;
  
  if (name === 'wellness_intake') {
    res.json({
      success: true,
      data: WELLNESS_FORM_SCHEMA
    });
  } else {
    res.status(404).json({
      success: false,
      error: `Schema '${name}' not found`
    });
  }
});

/**
 * POST /form-schemas
 * Create new form schema (not supported for hardcoded schemas)
 */
router.post('/', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Schema creation not supported for hardcoded wellness schema'
  });
});

/**
 * POST /form-schemas/import/wellness
 * Import wellness schema (already exists)
 */
router.post('/import/wellness', async (req, res) => {
  res.json({
    success: true,
    data: WELLNESS_FORM_SCHEMA,
    message: 'Wellness schema already available'
  });
});

/**
 * POST /form-schemas/:name/versions
 * Create new version (not supported)
 */
router.post('/:name/versions', async (req, res) => {
  const { version } = req.body;
  
  if (!version) {
    return res.status(400).json({
      success: false,
      error: 'Version is required'
    });
  }
  
  res.status(501).json({
    success: false,
    error: 'Version management not supported for hardcoded schemas'
  });
});

/**
 * DELETE /form-schemas/:name
 * Delete form schema (not supported)
 */
router.delete('/:name', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Schema deletion not supported for hardcoded schemas'
  });
});

export default router;
