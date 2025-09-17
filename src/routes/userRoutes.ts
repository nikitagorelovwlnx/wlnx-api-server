import express from 'express';
import knex from '../database/knex';

const router = express.Router();

interface UserResult {
  email: string;
  session_count: string;
  last_session: Date;
  first_session: Date;
}

// Get all unique users (emails) from wellness sessions
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const users: UserResult[] = await knex('wellness_sessions')
      .distinct('user_id as email')
      .select(
        knex.raw('COUNT(*) as session_count'),
        knex.raw('MAX(created_at) as last_session'),
        knex.raw('MIN(created_at) as first_session')
      )
      .groupBy('user_id')
      .orderBy('last_session', 'desc');

    res.json({ 
      users: users.map((user: UserResult) => ({
        email: user.email,
        session_count: parseInt(user.session_count),
        last_session: user.last_session,
        first_session: user.first_session
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
