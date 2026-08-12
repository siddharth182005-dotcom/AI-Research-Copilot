import pdfParse from 'pdf-parse';
import { ChunkingService } from './ChunkingService.js';
import { EmbeddingService } from './EmbeddingService.js';
import { VectorStore } from './VectorStore.js';

export class PDFProcessor {
  
  static async processPipeline(paperId, pdfBuffer, filename, pool) {
    try {
      console.log(`[Paper ${paperId}] Starting pipeline...`);
      
      // 1. Extract Text
      const pdfData = await pdfParse(pdfBuffer);
      const rawText = pdfData.text;
      
      if (!rawText || rawText.trim() === '') {
        throw new Error('Could not extract text from PDF.');
      }
      
      // Extract basic metadata (mocked for now, can be enhanced with Gemini later)
      const metadata = {
        title: pdfData.info?.Title || filename,
        authors: [pdfData.info?.Author].filter(Boolean),
        year: null
      };

      await pool.query(
        `UPDATE papers SET title = COALESCE($1, title), authors = $2 WHERE id = $3`,
        [metadata.title, metadata.authors.length > 0 ? metadata.authors : null, paperId]
      );

      // 2. Section Detect & Chunk
      console.log(`[Paper ${paperId}] Chunking text...`);
      const chunks = ChunkingService.chunkTextWithSections(rawText);
      console.log(`[Paper ${paperId}] Generated ${chunks.length} chunks.`);

      // 3. Embed
      console.log(`[Paper ${paperId}] Generating embeddings...`);
      const chunksWithEmbeddings = await EmbeddingService.generateEmbeddings(chunks);

      // 4. Store
      console.log(`[Paper ${paperId}] Storing in vector database...`);
      await VectorStore.insertChunks(paperId, chunksWithEmbeddings, pool);

      // 5. Update Status
      await pool.query(`UPDATE papers SET status = 'ready' WHERE id = $1`, [paperId]);
      console.log(`[Paper ${paperId}] Pipeline completed successfully!`);

    } catch (error) {
      console.error(`[Paper ${paperId}] Pipeline failed:`, error);
      await pool.query(`UPDATE papers SET status = 'error' WHERE id = $1`, [paperId]);
      throw error;
    }
  }
}
