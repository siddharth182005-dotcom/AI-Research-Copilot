import express from 'express';
import { ReviewEngine } from '../services/ReviewEngine.js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = express.Router();

router.post('/literature', async (req, res) => {
  try {
    const { paperIds, topic } = req.body;
    if (!paperIds || paperIds.length === 0) return res.status(400).json({ error: 'paperIds required' });
    
    const result = await ReviewEngine.generateLiteratureReview(paperIds, topic, pool);
    res.json(result);
  } catch (error) {
    console.error('Literature review error:', error);
    res.status(500).json({ error: 'Failed to generate literature review' });
  }
});

router.post('/gaps', async (req, res) => {
  try {
    const { paperIds } = req.body;
    if (!paperIds || paperIds.length === 0) return res.status(400).json({ error: 'paperIds required' });
    
    const result = await ReviewEngine.detectResearchGaps(paperIds, pool);
    res.json(result);
  } catch (error) {
    console.error('Gap detection error:', error);
    res.status(500).json({ error: 'Failed to detect gaps' });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const { paperIds } = req.body;
    if (!paperIds || paperIds.length < 2) return res.status(400).json({ error: 'At least 2 paperIds required for comparison' });
    
    const result = await ReviewEngine.comparePapers(paperIds, pool);
    res.json(result);
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Failed to compare papers' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM literature_reviews ORDER BY created_at DESC LIMIT 20');
    res.json(result.rows);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch review history' });
  }
});

export default router;
