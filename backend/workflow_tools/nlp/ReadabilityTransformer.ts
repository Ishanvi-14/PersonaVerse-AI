/**
 * Readability Transformer - Stage 3: Readability Transformation
 * 
 * Transforms sentences into grade 5 reading level using deterministic rules
 */

import { COMPLEX_TO_SIMPLE } from './vocabularies/complexToSimple';

export class ReadabilityTransformer {
  /**
   * Transform sentences to grade 5 readability
   */
  transform(sentences: string[]): string[] {
    return sentences.map(sentence => this.simplifySentence(sentence));
  }
  
  /**
   * Simplify a single sentence
   */
  private simplifySentence(sentence: string): string {
    let simplified = sentence;
    
    // 1. Replace complex words
    simplified = this.replaceComplexWords(simplified);
    
    // 2. Split long sentences
    simplified = this.splitLongSentence(simplified);
    
    // 3. Simplify numbers
    simplified = this.simplifyNumbers(simplified);
    
    // 4. Remove nested clauses
    simplified = this.removeNestedClauses(simplified);
    
    return simplified.trim();
  }
  
  /**
   * Replace complex words with simple alternatives
   */
  private replaceComplexWords(sentence: string): string {
    let result = sentence;
    
    // Replace each complex word
    Object.entries(COMPLEX_TO_SIMPLE).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      result = result.replace(regex, simple);
    });
    
    return result;
  }
  
  /**
   * Split long sentences at conjunctions
   */
  private splitLongSentence(sentence: string): string {
    const words = sentence.split(/\s+/);
    
    // If sentence is too long, split at first conjunction
    if (words.length > 20) {
      const conjunctions = ['and', 'but', 'because', 'although', 'while'];
      
      for (const conj of conjunctions) {
        const conjIndex = words.findIndex(w => w.toLowerCase() === conj);
        if (conjIndex > 5 && conjIndex < words.length - 5) {
          // Split here
          const firstPart = words.slice(0, conjIndex).join(' ');
          const secondPart = words.slice(conjIndex + 1).join(' ');
          return `${firstPart}. ${secondPart.charAt(0).toUpperCase()}${secondPart.slice(1)}`;
        }
      }
    }
    
    return sentence;
  }
  
  /**
   * Simplify number expressions
   */
  private simplifyNumbers(sentence: string): string {
    return sentence
      .replace(/\b(\d{4,})\b/g, (match) => {
        const num = parseInt(match);
        if (num >= 1000000) return `${Math.round(num / 1000000)} million`;
        if (num >= 1000) return `${Math.round(num / 1000)} thousand`;
        return match;
      })
      .replace(/\b(\d+)%\b/g, '$1 percent')
      .replace(/\$(\d+)/g, '$1 dollars');
  }
  
  /**
   * Remove nested clauses (text in parentheses or between commas)
   */
  private removeNestedClauses(sentence: string): string {
    // Remove parenthetical content
    let result = sentence.replace(/\([^)]*\)/g, '');
    
    // Remove excessive comma clauses (keep only first clause)
    const parts = result.split(',');
    if (parts.length > 3) {
      result = parts.slice(0, 2).join(',');
    }
    
    return result.replace(/\s+/g, ' ').trim();
  }
  
  /**
   * Calculate Flesch-Kincaid grade level (for validation)
   */
  calculateGradeLevel(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    // Flesch-Kincaid formula
    const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    return Math.max(0, Math.round(grade * 10) / 10);
  }
  
  /**
   * Count syllables in a word (simple heuristic)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    
    // Adjust for silent e
    if (word.endsWith('e')) count--;
    
    return Math.max(1, count);
  }
}
