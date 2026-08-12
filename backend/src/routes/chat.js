import express from 'express';
import { RAGEngine } from '../services/RAGEngine.js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, sessionId, paperIds } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await RAGEngine.generateChatResponse(message, sessionId, paperIds || [], pool);
    
    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

export default router;
