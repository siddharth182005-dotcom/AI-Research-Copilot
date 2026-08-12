import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Create a local memory cache for embeddings to save API quota during dev
const embeddingCache = new Map();

export class EmbeddingService {
  
  static async generateEmbeddings(chunks) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const batchSize = parseInt(process.env.EMBEDDING_BATCH_SIZE || '20', 10);
    
    const results = [];
    
    // Process in batches
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Embedding batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(chunks.length / batchSize)}`);
      
      const batchToProcess = [];
      const batchIndices = [];
      
      // Check cache first
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const hash = crypto.createHash('md5').update(chunk.content).digest('hex');
        
        if (embeddingCache.has(hash)) {
          chunk.embedding = embeddingCache.get(hash);
          results.push(chunk);
        } else {
          batchToProcess.push(chunk.content);
          batchIndices.push(chunk);
        }
      }
      
      // Call Gemini API for those not in cache
      if (batchToProcess.length > 0) {
        try {
          // genai sdk batch embedding syntax
          const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: batchToProcess
          });
          
          const embeddings = response.embeddings;
          
          for (let k = 0; k < embeddings.length; k++) {
            const chunk = batchIndices[k];
            chunk.embedding = embeddings[k].values;
            
            const hash = crypto.createHash('md5').update(chunk.content).digest('hex');
            embeddingCache.set(hash, chunk.embedding);
            
            results.push(chunk);
          }
          
        } catch (error) {
          console.error('Error generating embeddings:', error);
          throw error;
        }
      }
    }
    
    return results;
  }
}
