import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export class RAGEngine {
  static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Section weights for re-ranking
  static sectionWeights = {
    'Abstract': 1.5,
    'Results': 1.3,
    'Conclusion': 1.2,
    'Methodology': 1.1,
    'Introduction': 1.0,
    'General': 0.8,
    'Discussion': 1.0,
    'References': 0.1
  };

  static async performSemanticSearch(query, topK = 8, section = null, paperIds = [], pool) {
    // 1. Generate Query Embedding
    const hash = crypto.createHash('md5').update(query).digest('hex');
    const cacheKey = `search:${hash}:${topK}:${section || 'all'}:${paperIds.join(',')}`;
    
    // Check Cache
    const cacheResult = await pool.query('SELECT result FROM query_cache WHERE cache_key = $1 AND expires_at > NOW()', [cacheKey]);
    if (cacheResult.rows.length > 0) {
      return cacheResult.rows[0].result;
    }

    const response = await this.ai.models.embedContent({
      model: 'text-embedding-004',
      contents: [query]
    });
    const queryEmbedding = `[${response.embeddings[0].values.join(',')}]`;

    // 2. Perform Vector Search using pgvector cosine distance (<=>)
    // We fetch a larger candidate pool (topK * 3) for re-ranking
    let sqlQuery = `
      SELECT c.id, c.content, c.section, c.paper_id, p.title as paper_title, 
             1 - (c.embedding <=> $1) as cosine_similarity
      FROM chunks c
      JOIN papers p ON c.paper_id = p.id
      WHERE 1=1
    `;
    const params = [queryEmbedding];
    let paramIndex = 2;

    if (section) {
      sqlQuery += ` AND c.section = $${paramIndex}`;
      params.push(section);
      paramIndex++;
    }

    if (paperIds && paperIds.length > 0) {
      sqlQuery += ` AND c.paper_id = ANY($${paramIndex}::uuid[])`;
      params.push(paperIds);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY c.embedding <=> $1 LIMIT ${topK * 3}`;

    const searchResults = await pool.query(sqlQuery, params);
    let chunks = searchResults.rows;

    // 3. Re-rank based on section weight
    chunks = chunks.map(chunk => {
      const weight = this.sectionWeights[chunk.section] || 1.0;
      chunk.weighted_score = chunk.cosine_similarity * weight;
      return chunk;
    });

    chunks.sort((a, b) => b.weighted_score - a.weighted_score);
    chunks = chunks.slice(0, topK);

    // 4. Cache Result (1 hour TTL)
    await pool.query(`
      INSERT INTO query_cache (cache_key, result, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '1 hour')
      ON CONFLICT (cache_key) DO UPDATE SET result = $2, expires_at = NOW() + INTERVAL '1 hour'
    `, [cacheKey, JSON.stringify(chunks)]);

    return chunks;
  }

  static async generateChatResponse(message, sessionId, paperIds = [], pool) {
    let currentSessionId = sessionId;
    let history = [];
    let contextSummary = '';

    // Initialize or fetch session
    if (currentSessionId) {
      const sessionRes = await pool.query('SELECT messages, context_summary FROM sessions WHERE id = $1', [currentSessionId]);
      if (sessionRes.rows.length > 0) {
        history = sessionRes.rows[0].messages || [];
        contextSummary = sessionRes.rows[0].context_summary || '';
      }
    } else {
      const newSession = await pool.query('INSERT INTO sessions DEFAULT VALUES RETURNING id');
      currentSessionId = newSession.rows[0].id;
    }

    // 1. Semantic Search for Context
    const chunks = await this.performSemanticSearch(message, 8, null, paperIds, pool);
    
    // Assemble context (enforcing strict formatting for grounding)
    let contextStr = chunks.map((c, i) => `[Source ${i + 1}] (From ${c.paper_title}, Section: ${c.section}):\n${c.content}`).join('\n\n');

    // 2. Build Prompt
    const systemInstruction = `
      You are an expert AI Research Copilot. You MUST answer the user's question based ONLY on the provided Context Sources.
      If the answer is not contained in the sources, you must state that you do not have enough information. Do not hallucinate or guess.
      Always cite your sources using the [Source N] format in your response whenever you use information from a source.
      
      Previous Conversation Summary: ${contextSummary}
    `;

    // Format history for Gemini
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));
    
    // Append current turn
    contents.push({
      role: 'user',
      parts: [{ text: `Context Sources:\n${contextStr}\n\nQuestion: ${message}` }]
    });

    // 3. Generate Response
    const response = await this.ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2
      }
    });

    const answerText = response.text;

    // 4. Update Session Memory
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: answerText });

    // Auto-summarize if history gets too long (> 8 exchanges, meaning 16 messages)
    if (history.length > 16) {
      const summaryPrompt = `Summarize the following conversation history briefly to retain key context for future turns:\n${JSON.stringify(history)}`;
      const summaryRes = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: summaryPrompt
      });
      contextSummary = summaryRes.text;
      
      // Keep only the last 8 messages (4 exchanges) plus the summary
      history = history.slice(-8);
    }

    await pool.query(
      'UPDATE sessions SET messages = $1, context_summary = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(history), contextSummary, currentSessionId]
    );

    return {
      answer: answerText,
      sources: chunks.map((c, i) => ({
        id: i + 1,
        paper_title: c.paper_title,
        section: c.section,
        content: c.content,
        score: c.weighted_score
      })),
      sessionId: currentSessionId
    };
  }
}
