import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export class ReviewEngine {
  static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  static async fetchPaperContext(paperIds, pool) {
    if (!paperIds || paperIds.length === 0) return '';
    
    // Fetch critical sections for the given papers
    const result = await pool.query(`
      SELECT p.title, c.section, c.content 
      FROM chunks c
      JOIN papers p ON c.paper_id = p.id
      WHERE p.id = ANY($1::uuid[])
      AND c.section IN ('Abstract', 'Introduction', 'Methodology', 'Results', 'Conclusion', 'Discussion')
    `, [paperIds]);

    // Group by paper
    const papers = {};
    result.rows.forEach(row => {
      if (!papers[row.title]) papers[row.title] = [];
      papers[row.title].push(`[${row.section}] ${row.content}`);
    });

    let contextStr = '';
    for (const [title, chunks] of Object.entries(papers)) {
      contextStr += `--- Paper: ${title} ---\n${chunks.join('\n\n')}\n\n`;
    }
    
    return contextStr;
  }

  static async saveInsight(type, paperIds, outputJson, pool) {
    const result = await pool.query(`
      INSERT INTO literature_reviews (type, paper_ids, output_json)
      VALUES ($1, $2, $3) RETURNING id
    `, [type, paperIds, outputJson]);
    return result.rows[0].id;
  }

  static async generateLiteratureReview(paperIds, topic, pool) {
    const context = await this.fetchPaperContext(paperIds, pool);
    
    const prompt = `
      You are an expert AI Research Assistant. Based ONLY on the following paper excerpts, generate a comprehensive Literature Review.
      ${topic ? `Focus the review specifically on the topic: "${topic}".` : ''}
      
      Return the response strictly as a JSON object with this exact structure (no markdown block, just raw JSON):
      {
        "title": "A synthesized title for this review",
        "introduction": "Paragraph introducing the field and papers",
        "methodologies": "Synthesis of methods used across the papers",
        "results": "Synthesis of key findings and results",
        "discussion": "Discussion of what these results mean collectively",
        "conclusion": "Final concluding thoughts"
      }
      
      Paper Excerpts:
      ${context}
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    let resultText = response.text.trim();
    if (resultText.startsWith('\`\`\`json')) {
      resultText = resultText.replace(/^\`\`\`json/i, '').replace(/\`\`\`$/, '').trim();
    }
    const jsonOutput = JSON.parse(resultText);

    await this.saveInsight('literature_review', paperIds, jsonOutput, pool);
    return jsonOutput;
  }

  static async detectResearchGaps(paperIds, pool) {
    const context = await this.fetchPaperContext(paperIds, pool);
    
    const prompt = `
      You are an expert AI Research Assistant. Based ONLY on the following paper excerpts, identify the research gaps, limitations, and future work directions.
      
      Return the response strictly as a JSON object with this exact structure (no markdown block, just raw JSON):
      {
        "gaps": [
          {
            "description": "Clear description of the gap or limitation",
            "severity": "High", // Can be High, Medium, or Low
            "related_papers": ["Paper Title 1", "Paper Title 2"],
            "suggested_approach": "How future research might address this"
          }
        ]
      }
      
      Paper Excerpts:
      ${context}
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    let resultText = response.text.trim();
    if (resultText.startsWith('\`\`\`json')) {
      resultText = resultText.replace(/^\`\`\`json/i, '').replace(/\`\`\`$/, '').trim();
    }
    const jsonOutput = JSON.parse(resultText);

    await this.saveInsight('gap_detection', paperIds, jsonOutput, pool);
    return jsonOutput;
  }

  static async comparePapers(paperIds, pool) {
    const context = await this.fetchPaperContext(paperIds, pool);
    
    const prompt = `
      You are an expert AI Research Assistant. Based ONLY on the following paper excerpts, create a comparative analysis table.
      
      Return the response strictly as a JSON object with this exact structure (no markdown block, just raw JSON):
      {
        "overview": "A brief paragraph summarizing the core differences and similarities",
        "dimensions": ["Approach", "Dataset", "Key Results", "Limitations"],
        "papers": [
          {
            "title": "Paper Title",
            "Approach": "value",
            "Dataset": "value",
            "Key Results": "value",
            "Limitations": "value"
          }
        ],
        "recommendation": "A brief recommendation on which paper is strongest for what use case"
      }
      
      Ensure the keys inside the "papers" objects exactly match the strings in the "dimensions" array.
      
      Paper Excerpts:
      ${context}
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    let resultText = response.text.trim();
    if (resultText.startsWith('\`\`\`json')) {
      resultText = resultText.replace(/^\`\`\`json/i, '').replace(/\`\`\`$/, '').trim();
    }
    const jsonOutput = JSON.parse(resultText);

    await this.saveInsight('comparison', paperIds, jsonOutput, pool);
    return jsonOutput;
  }
}
