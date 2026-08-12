import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const migrate = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Running database migrations...');
    
    // Enable uuid-ossp for UUID generation
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Enable pgvector for embeddings
    await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    // Create papers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS papers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT,
        authors TEXT[],
        year INT,
        keywords TEXT[],
        domain TEXT,
        status TEXT NOT NULL DEFAULT 'processing'
      );
    `);
    
    // Create chunks table
    // Embedding vector size for Gemini text-embedding-004 is 768
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chunks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        section TEXT,
        embedding VECTOR(768)
      );
    `);

    // Create IVFFlat index on embedding column (useful when table grows)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    `);

    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  migrate();
}

export default migrate;
