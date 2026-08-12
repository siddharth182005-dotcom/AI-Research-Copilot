import express from 'express';
import multer from 'multer';
import { PDFProcessor } from '../services/PDFProcessor.js';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const router = express.Router();

// Configure multer for memory storage (up to 50MB)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf files are allowed'), false);
    }
  }
});

router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  let paperId;
  try {
    // 1. Insert into papers table with status 'processing'
    const result = await pool.query(
      `INSERT INTO papers (title, status) VALUES ($1, $2) RETURNING id`,
      [req.file.originalname, 'processing']
    );
    paperId = result.rows[0].id;

    // Return 202 Accepted immediately
    res.status(202).json({ 
      paperId, 
      status: 'processing',
      message: 'PDF uploaded successfully and is being processed in the background.' 
    });

  } catch (error) {
    console.error('Error inserting paper record:', error);
    return res.status(500).json({ error: 'Failed to initialize paper processing' });
  }

  // Run the 5-stage pipeline in the background
  // If we return 202, the request is closed, but the server continues processing this promise
  PDFProcessor.processPipeline(paperId, req.file.buffer, req.file.originalname, pool)
    .catch(err => {
      console.error(`Pipeline failed for paper ${paperId}:`, err);
      // Update status to error
      pool.query(`UPDATE papers SET status = 'error' WHERE id = $1`, [paperId]).catch(console.error);
    });
});

router.get('/status/:paperId', async (req, res) => {
  try {
    const { paperId } = req.params;
    const result = await pool.query('SELECT status, title FROM papers WHERE id = $1', [paperId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const paper = result.rows[0];
    
    // Get chunk count
    const chunkRes = await pool.query('SELECT COUNT(*) FROM chunks WHERE paper_id = $1', [paperId]);
    const chunkCount = parseInt(chunkRes.rows[0].count, 10);

    res.json({
      paperId,
      title: paper.title,
      status: paper.status,
      chunkCount
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default router;
