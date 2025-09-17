import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createInterviewRoutes } from '../routes/interviewRoutes';
import { createUserRoutes } from '../routes/userRoutes';
import { testDb } from '../database/knex.test';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes with test database
app.use('/api/interviews', createInterviewRoutes(testDb));
app.use('/api/users', createUserRoutes(testDb));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export { app };
