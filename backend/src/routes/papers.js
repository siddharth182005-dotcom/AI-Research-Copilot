import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM papers ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Papers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM papers WHERE id = $1', [id]); // Cascade will handle chunks
    res.json({ success: true });
  } catch (error) {
    console.error('Paper delete error:', error);
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

export default router;
