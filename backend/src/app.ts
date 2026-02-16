import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Parse JSON request bodies
  app.use(express.json());

  // Enable CORS for all origins
  app.use(cors());

  // HTTP request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Mount API routes under /api
  app.use('/api', apiRouter);

  // Centralized error handler
  app.use(errorHandler);

  return app;
};