import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

import uploadRoutes from './src/routes/upload.js';
import searchRoutes from './src/routes/search.js';
import chatRoutes from './src/routes/chat.js';
import papersRoutes from './src/routes/papers.js';

app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/papers', papersRoutes);

// Basic health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      db_time: dbRes.rows[0].now,
      service: 'ai-research-backend'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
