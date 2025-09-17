import { Router, Response, Request } from 'express';
import { InterviewService } from '../services/interviewService';
import db from '../database/knex';

const router = Router();
const interviewService = new InterviewService(db);

// Create interview result
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, transcription, summary } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!transcription) {
      return res.status(400).json({ error: 'Transcription is required' });
    }

    if (!summary) {
      return res.status(400).json({ error: 'Summary is required' });
    }

    const result = await interviewService.createInterviewResult(email, {
      transcription,
      summary,
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

// Get interview results
router.get('/', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const results = await interviewService.getInterviewResultsByUserId(email, limit, offset);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific interview result
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    const result = await interviewService.getInterviewResultById(id, email);

    if (!result) {
      return res.status(404).json({ error: 'Interview result not found' });
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update interview result
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, transcription, summary } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await interviewService.updateInterviewResult(id, email, {
      transcription,
      summary,
    });

    if (!result) {
      return res.status(404).json({ error: 'Interview result not found' });
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete interview result
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const success = await interviewService.deleteInterviewResult(id, email);

    if (!success) {
      return res.status(404).json({ error: 'Interview result not found' });
    }

    res.json({ message: 'Interview result deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
