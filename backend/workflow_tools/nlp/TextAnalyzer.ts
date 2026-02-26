/**
 * Text Analyzer - Stage 1: Text Understanding
 * 
 * Performs linguistic preprocessing to understand document content
 */

import { STOPWORDS } from './vocabularies/stopwords';

export interface AnalyzedText {
  sentences: string[];
  tokens: string[][];
  keywords: string[];
  entities: string[];
  wordFrequency: Map<string, number>;
}

export class TextAnalyzer {
  /**
   * Analyze input text and extract linguistic features
   */
  analyze(text: string): AnalyzedText {
    // Clean structured data from input
    const cleanedText = this.cleanStructuredData(text);
    
    // Sentence segmentation
    const sentences = this.segmentSentences(cleanedText);
    
    // Tokenization
    const tokens = sentences.map(s => this.tokenize(s));
    
    // Word frequency (without stopwords)
    const wordFrequency = this.calculateWordFrequency(tokens);
    
    // Keyword extraction
    const keywords = this.extractKeywords(wordFrequency, 10);
    
    // Named entity recognition (simple pattern-based)
    const entities = this.extractEntities(cleanedText);
    
    return {
      sentences,
      tokens,
      keywords,
      entities,
      wordFrequency
    };
  }
  
  /**
   * Clean structured data patterns from text
   */
  private cleanStructuredData(text: string): string {
    let cleaned = text;
    
    // First pass: Remove obvious structured data
    // Remove JSON-like objects (including deeply nested ones) - multiple passes
    for (let i = 0; i < 5; i++) {
      cleaned = cleaned.replace(/\{[^{}]*\}/g, ' ');
    }
    
    // Remove array brackets and their contents
    cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ');
    
    // Remove key-value patterns (key: 'value' or key: "value" or key: value)
    cleaned = cleaned.replace(/\w+\s*:\s*['"][^'"]*['"]/g, ' ');
    cleaned = cleaned.replace(/\w+\s*:\s*[^,}\s]+/g, ' ');
    
    // Remove standalone colons (from structured data)
    cleaned = cleaned.replace(/:\s*/g, ' ');
    
    // Remove quotes
    cleaned = cleaned.replace(/['"]+/g, '');
    
    // Remove commas that are likely from structured data
    cleaned = cleaned.replace(/,\s+/g, ' ');
    
    // Remove underscores (common in keys like case_name)
    cleaned = cleaned.replace(/_/g, ' ');
    
    // Second pass: Extract meaningful sentences
    // Split into potential sentences
    const potentialSentences = cleaned.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    // Filter out sentences that look like structured data remnants
    const meaningfulSentences = potentialSentences.filter(sentence => {
      // Skip if too short
      if (sentence.length < 15) return false;
      
      // Skip if contains too many capital letters (likely keys/identifiers)
      const capitals = (sentence.match(/[A-Z]/g) || []).length;
      if (capitals > sentence.length * 0.3) return false;
      
      // Skip if looks like a list of words without structure
      const words = sentence.split(/\s+/);
      if (words.length < 4) return false;
      
      // Must have at least some common English words
      const commonWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and', 'or', 'but'];
      const hasCommonWords = words.some(w => commonWords.includes(w.toLowerCase()));
      if (!hasCommonWords) return false;
      
      return true;
    });
    
    // Rejoin meaningful sentences
    cleaned = meaningfulSentences.join('. ');
    
    // Final cleanup
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // If we ended up with nothing meaningful, try to extract from original
    if (cleaned.length < 30) {
      // Look for text in quotes
      const quotedText = text.match(/['"]([^'"]{30,})['"]/g);
      if (quotedText && quotedText.length > 0) {
        cleaned = quotedText.map(q => q.replace(/['"]/g, '')).join(' ');
      } else {
        // Last resort: just remove obvious markers and hope for the best
        cleaned = text
          .replace(/[{}[\]]/g, ' ')
          .replace(/\w+_\w+/g, ' ')
          .replace(/\w+:/g, '')
          .replace(/['"]/g, '')
          .replace(/,/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }
    
    return cleaned;
  }
  
  /**
   * Segment text into sentences
   */
  private segmentSentences(text: string): string[] {
    // Split on sentence boundaries
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    return sentences;
  }
  
  /**
   * Tokenize sentence into words
   */
  private tokenize(sentence: string): string[] {
    return sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }
  
  /**
   * Calculate word frequency (excluding stopwords)
   */
  private calculateWordFrequency(tokens: string[][]): Map<string, number> {
    const freq = new Map<string, number>();
    
    tokens.forEach(sentenceTokens => {
      sentenceTokens.forEach(word => {
        if (!STOPWORDS.has(word) && word.length > 2) {
          freq.set(word, (freq.get(word) || 0) + 1);
        }
      });
    });
    
    return freq;
  }
  
  /**
   * Extract top keywords by frequency
   */
  private extractKeywords(wordFrequency: Map<string, number>, topN: number): string[] {
    return Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  }
  
  /**
   * Extract named entities (capitalized words/phrases)
   */
  private extractEntities(text: string): string[] {
    const entities: string[] = [];
    
    // Find capitalized words (simple NER)
    const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const matches = text.match(capitalizedPattern);
    
    if (matches) {
      // Deduplicate and filter common words
      const uniqueEntities = [...new Set(matches)];
      entities.push(...uniqueEntities.filter(e => e.length > 2));
    }
    
    return entities;
  }
}
