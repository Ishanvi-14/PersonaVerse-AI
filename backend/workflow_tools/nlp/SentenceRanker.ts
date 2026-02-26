/**
 * Sentence Ranker - Stage 2: Importance Scoring
 * 
 * Ranks sentences using hybrid scoring algorithm
 */

import { AnalyzedText } from './TextAnalyzer';

export interface RankedSentence {
  text: string;
  score: number;
  index: number;
}

export class SentenceRanker {
  /**
   * Rank sentences by importance
   */
  rank(analyzed: AnalyzedText, topN: number = 3): RankedSentence[] {
    const scores = analyzed.sentences.map((sentence, index) => {
      const score = this.calculateScore(sentence, index, analyzed);
      return { text: sentence, score, index };
    });
    
    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    
    // Apply redundancy penalty
    const filtered = this.removeRedundant(scores);
    
    return filtered.slice(0, topN);
  }
  
  /**
   * Calculate hybrid importance score
   */
  private calculateScore(
    sentence: string,
    index: number,
    analyzed: AnalyzedText
  ): number {
    let score = 0;
    
    // 1. Keyword frequency relevance (40%)
    score += this.keywordRelevance(sentence, analyzed.keywords) * 0.4;
    
    // 2. Entity presence weight (20%)
    score += this.entityPresence(sentence, analyzed.entities) * 0.2;
    
    // 3. Position weight (20%)
    score += this.positionWeight(index, analyzed.sentences.length) * 0.2;
    
    // 4. Length normalization (20%)
    score += this.lengthScore(sentence) * 0.2;
    
    return score;
  }
  
  /**
   * Score based on keyword presence
   */
  private keywordRelevance(sentence: string, keywords: string[]): number {
    const lowerSentence = sentence.toLowerCase();
    const matchCount = keywords.filter(kw => lowerSentence.includes(kw)).length;
    return Math.min(matchCount / Math.max(keywords.length * 0.3, 1), 1);
  }
  
  /**
   * Score based on entity presence
   */
  private entityPresence(sentence: string, entities: string[]): number {
    const matchCount = entities.filter(entity => sentence.includes(entity)).length;
    return Math.min(matchCount / Math.max(entities.length * 0.5, 1), 1);
  }
  
  /**
   * Score based on sentence position (first and last sentences score higher)
   */
  private positionWeight(index: number, total: number): number {
    if (index === 0) return 1.0; // First sentence
    if (index === total - 1) return 0.8; // Last sentence
    if (index === 1) return 0.7; // Second sentence
    return 0.5; // Middle sentences
  }
  
  /**
   * Score based on sentence length (prefer medium length)
   */
  private lengthScore(sentence: string): number {
    const words = sentence.split(/\s+/).length;
    if (words < 5) return 0.3; // Too short
    if (words > 30) return 0.5; // Too long
    return 1.0; // Optimal length
  }
  
  /**
   * Remove redundant sentences using similarity
   */
  private removeRedundant(sentences: RankedSentence[]): RankedSentence[] {
    const result: RankedSentence[] = [];
    
    for (const sentence of sentences) {
      const isDuplicate = result.some(existing => 
        this.similarity(sentence.text, existing.text) > 0.7
      );
      
      if (!isDuplicate) {
        result.push(sentence);
      }
    }
    
    return result;
  }
  
  /**
   * Calculate word-based similarity between sentences
   */
  private similarity(s1: string, s2: string): number {
    const words1 = new Set(s1.toLowerCase().split(/\s+/));
    const words2 = new Set(s2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}
