import { Router, Response } from 'express';
import { TelegramService } from '../services/telegramService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import db from '../database/knex';

const router = Router();
const telegramService = new TelegramService(db);

// Create telegram integration
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { telegram_user_id, username, first_name, last_name, chat_id } = req.body;

    if (!telegram_user_id) {
      return res.status(400).json({ error: 'Telegram user ID is required' });
    }

    const integration = await telegramService.createIntegration(req.user!.id, {
      telegram_user_id,
      username,
      first_name,
      last_name,
      chat_id,
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

// Get user's telegram integrations
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const integrations = await telegramService.getIntegrationsByUserId(req.user!.id);
    res.json({ integrations });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update telegram integration
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { telegram_user_id, username, first_name, last_name, chat_id } = req.body;

    const integration = await telegramService.updateIntegration(id, req.user!.id, {
      telegram_user_id,
      username,
      first_name,
      last_name,
      chat_id,
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ integration });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete telegram integration
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await telegramService.deleteIntegration(id, req.user!.id);

    if (!success) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
