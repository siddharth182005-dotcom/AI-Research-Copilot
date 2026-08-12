export class VectorStore {
  
  static async insertChunks(paperId, chunks, pool) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN'); // Atomic transaction
      
      // Clean up any existing chunks for this paper (though CASCADE DELETE should handle this if paper is deleted)
      await client.query('DELETE FROM chunks WHERE paper_id = $1', [paperId]);
      
      // Batch insert chunks
      const insertQuery = `
        INSERT INTO chunks (paper_id, content, section, embedding) 
        VALUES ($1, $2, $3, $4)
      `;
      
      for (const chunk of chunks) {
        // pgvector expects embeddings formatted as a string array '[1.1, 2.2, ...]'
        const embeddingString = `[${chunk.embedding.join(',')}]`;
        
        await client.query(insertQuery, [
          paperId,
          chunk.content,
          chunk.section,
          embeddingString
        ]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
