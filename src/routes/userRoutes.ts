import express from 'express';
import knex from '../database/knex';

const router = express.Router();

interface UserResult {
  email: string;
  interview_count: string;
  last_interview: Date;
  first_interview: Date;
}

// Get all unique users (emails) from interview results
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const users: UserResult[] = await knex('interview_results')
      .distinct('user_id as email')
      .select(
        knex.raw('COUNT(*) as interview_count'),
        knex.raw('MAX(created_at) as last_interview'),
        knex.raw('MIN(created_at) as first_interview')
      )
      .groupBy('user_id')
      .orderBy('last_interview', 'desc');

    res.json({ 
      users: users.map((user: UserResult) => ({
        email: user.email,
        interview_count: parseInt(user.interview_count),
        last_interview: user.last_interview,
        first_interview: user.first_interview
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
