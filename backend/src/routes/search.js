import express from 'express';
import { RAGEngine } from '../services/RAGEngine.js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, section, topK, paperIds } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const k = topK ? parseInt(topK, 10) : 8;
    const pIds = paperIds ? paperIds.split(',') : [];

    const results = await RAGEngine.performSemanticSearch(q, k, section, pIds, pool);
    
    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
