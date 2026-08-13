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
    
    // Create sessions table for chat memory
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        messages JSONB DEFAULT '[]',
        context_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create query_cache table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS query_cache (
        cache_key TEXT PRIMARY KEY,
        result JSONB NOT NULL,
        expires_at TIMESTAMP NOT NULL
      );
    `);
    
    // Create literature_reviews table for insights
    await pool.query(`
      CREATE TABLE IF NOT EXISTS literature_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type TEXT NOT NULL,
        paper_ids UUID[] NOT NULL,
        output_json JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
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
