import { Router, Response, Request } from 'express';
import { WellnessSessionService } from '../services/wellnessSessionService';
import db from '../database/knex';
import { Knex } from 'knex';

export function createInterviewRoutes(database?: Knex) {
  const router = Router();
  const dbInstance = database || db;
  const wellnessSessionService = new WellnessSessionService(dbInstance);

// Create wellness session
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, transcription, summary, bot_conversation, wellness_data } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!transcription) {
      return res.status(400).json({ error: 'Transcription is required' });
    }

    if (!summary) {
      return res.status(400).json({ error: 'Summary is required' });
    }

    const result = await wellnessSessionService.createWellnessSession(email, {
      transcription,
      summary,
      bot_conversation,
      wellness_data,
    });

    res.status(201).json({ result });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get wellness sessions (email parameter required)
router.get('/', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const results = await wellnessSessionService.getWellnessSessionsByUserId(email, limit, offset);
      
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific wellness session
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    const result = await wellnessSessionService.getWellnessSessionById(id, email);

    if (!result) {
      return res.status(404).json({ error: 'Wellness session not found' });
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update wellness session
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, transcription, summary, bot_conversation, wellness_data } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await wellnessSessionService.updateWellnessSession(id, email, {
      transcription,
      summary,
      bot_conversation,
      wellness_data,
    });

    if (!result) {
      return res.status(404).json({ error: 'Wellness session not found' });
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete wellness session
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const success = await wellnessSessionService.deleteWellnessSession(id, email);

    if (!success) {
      return res.status(404).json({ error: 'Wellness session not found' });
    }

    res.json({ message: 'Interview result deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

  return router;
}

// Default export for backward compatibility
export default createInterviewRoutes();
