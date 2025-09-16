import { Router, Response } from 'express';
import { InterviewService } from '../services/interviewService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import db from '../database/knex';

const router = Router();
const interviewService = new InterviewService(db);

// Create interview result
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, metadata } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await interviewService.createInterviewResult(req.user!.id, {
      title,
      content,
      metadata,
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

// Get user's interview results
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const results = await interviewService.getInterviewResultsByUserId(req.user!.id, limit, offset);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific interview result
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await interviewService.getInterviewResultById(id, req.user!.id);

    if (!result) {
      return res.status(404).json({ error: 'Interview result not found' });
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update interview result
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, metadata } = req.body;

    const result = await interviewService.updateInterviewResult(id, req.user!.id, {
      title,
      content,
      metadata,
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
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await interviewService.deleteInterviewResult(id, req.user!.id);

    if (!success) {
      return res.status(404).json({ error: 'Interview result not found' });
    }

    res.json({ message: 'Interview result deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
