import { Router, Response } from 'express';
import { CalendarService } from '../services/calendarService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import db from '../database/knex';

const router = Router();
const calendarService = new CalendarService(db);

// Create calendar integration
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { provider, access_token, refresh_token, token_expires_at, calendar_id } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const integration = await calendarService.createIntegration(req.user!.id, {
      provider,
      access_token,
      refresh_token,
      token_expires_at,
      calendar_id,
    });

    res.status(201).json({ integration });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get user's calendar integrations
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const integrations = await calendarService.getIntegrationsByUserId(req.user!.id);
    res.json({ integrations });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update calendar integration
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { provider, access_token, refresh_token, token_expires_at, calendar_id } = req.body;

    const integration = await calendarService.updateIntegration(id, req.user!.id, {
      provider,
      access_token,
      refresh_token,
      token_expires_at,
      calendar_id,
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ integration });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete calendar integration
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await calendarService.deleteIntegration(id, req.user!.id);

    if (!success) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
