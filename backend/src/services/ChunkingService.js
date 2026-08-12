export class ChunkingService {
  
  static chunkTextWithSections(text) {
    const sections = this.detectSections(text);
    const chunks = [];
    
    for (const section of sections) {
      // Split section content into sentences roughly
      const sentences = section.content.match(/[^.!?]+[.!?]+/g) || [section.content];
      
      let currentChunkText = '';
      // Rough token estimation: 1 word ~ 1.3 tokens
      const maxTokens = 350; 
      const overlapTokens = 50;
      
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (!sentence) continue;

        if (this.estimateTokens(currentChunkText + sentence) <= maxTokens) {
          currentChunkText += ' ' + sentence;
        } else {
          // Push current chunk
          if (currentChunkText.trim()) {
            chunks.push({
              content: currentChunkText.trim(),
              section: section.title
            });
          }
          
          // Start new chunk with overlap
          // Backtrack a couple of sentences for overlap
          let overlapText = sentence;
          let j = i - 1;
          while (j >= 0 && this.estimateTokens(overlapText + sentences[j]) <= overlapTokens) {
            overlapText = sentences[j].trim() + ' ' + overlapText;
            j--;
          }
          currentChunkText = overlapText;
        }
      }
      
      // Push remaining
      if (currentChunkText.trim()) {
        chunks.push({
          content: currentChunkText.trim(),
          section: section.title
        });
      }
    }
    
    return chunks;
  }

  static estimateTokens(text) {
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }

  static detectSections(text) {
    // Simple regex-based section detection
    const sectionHeaders = [
      'Abstract',
      'Introduction',
      'Background',
      'Related Work',
      'Methodology',
      'Methods',
      'Results',
      'Discussion',
      'Conclusion',
      'References'
    ];
    
    const regex = new RegExp(`^(${sectionHeaders.join('|')}):?\\s*$`, 'gim');
    const matches = [...text.matchAll(regex)];
    
    const sections = [];
    if (matches.length === 0) {
      sections.push({ title: 'General', content: text });
      return sections;
    }

    // Capture text before first recognized header
    if (matches[0].index > 0) {
      sections.push({
        title: 'General',
        content: text.substring(0, matches[0].index).trim()
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const title = match[1];
      const start = match.index + match[0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      
      sections.push({
        title: this.normalizeSectionTitle(title),
        content: text.substring(start, end).trim()
      });
    }

    return sections;
  }
  
  static normalizeSectionTitle(title) {
    const t = title.toLowerCase();
    if (t.includes('abstract')) return 'Abstract';
    if (t.includes('intro')) return 'Introduction';
    if (t.includes('method')) return 'Methodology';
    if (t.includes('result')) return 'Results';
    if (t.includes('discuss')) return 'Discussion';
    if (t.includes('conclu')) return 'Conclusion';
    if (t.includes('ref')) return 'References';
    return 'General';
  }
}
