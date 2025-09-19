import express from 'express';
import knex from '../database/knex';
import { Knex } from 'knex';

export function createUserRoutes(database?: Knex) {
  const router = express.Router();
  const dbInstance = database || knex;

interface WellnessSession {
  id: string;
  transcription: string;
  summary: string;
  analysis_results?: any;
  wellness_data?: any;
  created_at: Date;
  updated_at: Date;
}

interface UserWithSessions {
  email: string;
  session_count: number;
  last_session: Date;
  first_session: Date;
  sessions: WellnessSession[];
}

// Get all users with their complete session history
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    // Get all sessions grouped by user
    const allSessions = await dbInstance('wellness_sessions')
      .select('*')
      .orderBy('user_id')
      .orderBy('created_at', 'desc');

    // Group sessions by user
    const userMap = new Map<string, WellnessSession[]>();
    
    allSessions.forEach(session => {
      const email = session.user_id;
      if (!userMap.has(email)) {
        userMap.set(email, []);
      }
      // Parse wellness_data if it's a string
      let parsedWellnessData = session.wellness_data;
      if (session.wellness_data && typeof session.wellness_data === 'string') {
        try {
          parsedWellnessData = JSON.parse(session.wellness_data);
        } catch (error) {
          console.warn('Failed to parse wellness_data in userRoutes:', error);
        }
      }
      
      userMap.get(email)!.push({
        id: session.id,
        transcription: session.transcription,
        summary: session.summary,
        analysis_results: session.analysis_results,
        wellness_data: parsedWellnessData,
        created_at: session.created_at,
        updated_at: session.updated_at
      });
    });

    // Build user objects with complete session data
    const users: UserWithSessions[] = [];
    
    for (const [email, sessions] of userMap) {
      const sessionDates = sessions.map(s => new Date(s.created_at));
      users.push({
        email,
        session_count: sessions.length,
        last_session: new Date(Math.max(...sessionDates.map(d => d.getTime()))),
        first_session: new Date(Math.min(...sessionDates.map(d => d.getTime()))),
        sessions: sessions
      });
    }

    // Sort users by last session date (most recent first)
    users.sort((a, b) => b.last_session.getTime() - a.last_session.getTime());

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users with sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  return router;
}

// Default export for backward compatibility
export default createUserRoutes();
