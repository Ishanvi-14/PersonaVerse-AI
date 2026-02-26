/**
 * Output Validator - Stage 5: Validation
 * 
 * Validates output quality and rejects invalid content
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class OutputValidator {
  private readonly MAX_AVG_SENTENCE_LENGTH = 20;
  private readonly MAX_GRADE_LEVEL = 7;
  
  /**
   * Validate all outputs
   */
  validate(
    grade5: string,
    bullets: string[],
    whatsapp: string,
    voice: string,
    regional: string
  ): ValidationResult {
    const errors: string[] = [];
    
    // Validate grade 5 explanation
    const grade5Errors = this.validateText(grade5, 'Grade 5');
    errors.push(...grade5Errors);
    
    // Validate bullets
    if (bullets.length < 3 || bullets.length > 7) {
      errors.push('Bullet summary must have 3-7 items');
    }
    
    bullets.forEach((bullet, i) => {
      const bulletErrors = this.validateText(bullet, `Bullet ${i + 1}`);
      errors.push(...bulletErrors);
    });
    
    // Validate WhatsApp version
    const whatsappErrors = this.validateText(whatsapp, 'WhatsApp');
    errors.push(...whatsappErrors);
    
    // Validate voice script
    if (!voice.includes('[Pause]')) {
      errors.push('Voice script must include pause markers');
    }
    
    // Validate regional version
    if (!this.containsHinglish(regional)) {
      errors.push('Regional version must contain Hinglish words');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate individual text output
   */
  private validateText(text: string, label: string): string[] {
    const errors: string[] = [];
    
    // Check for code patterns
    if (this.containsCode(text)) {
      errors.push(`${label} contains code fragments`);
    }
    
    // Check for structured data
    if (this.containsStructuredData(text)) {
      errors.push(`${label} contains structured data patterns`);
    }
    
    // Check for bracketed objects
    if (this.containsBracketedObjects(text)) {
      errors.push(`${label} contains bracketed objects`);
    }
    
    // Check average sentence length
    const avgLength = this.calculateAvgSentenceLength(text);
    if (avgLength > this.MAX_AVG_SENTENCE_LENGTH) {
      errors.push(`${label} has too long sentences (avg: ${avgLength} words)`);
    }
    
    return errors;
  }
  
  /**
   * Check if text contains code patterns
   */
  private containsCode(text: string): boolean {
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /class\s+\w+/,
      /import\s+.*from/,
      /export\s+(default|const|function)/,
      /<\w+>/,  // HTML tags
      /\{\s*\w+:\s*\w+\s*\}/  // Object literals
    ];
    
    return codePatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Check if text contains structured data
   */
  private containsStructuredData(text: string): boolean {
    const structuredPatterns = [
      /\[\s*\{/,  // Array of objects
      /\{\s*"\w+":/,  // JSON objects
      /\|\s*\w+\s*\|/,  // Table separators
      /^\s*[-*]\s+\w+:\s*/m  // Key-value lists
    ];
    
    return structuredPatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Check if text contains bracketed objects
   */
  private containsBracketedObjects(text: string): boolean {
    // Check for patterns like [object Object] or [Function]
    return /\[(?:object|function|Object|Function)\s*\w*\]/i.test(text);
  }
  
  /**
   * Calculate average sentence length in words
   */
  private calculateAvgSentenceLength(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalWords = sentences.reduce((sum, sentence) => {
      const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
      return sum + words.length;
    }, 0);
    
    return Math.round(totalWords / sentences.length);
  }
  
  /**
   * Check if text contains Hinglish words
   */
  private containsHinglish(text: string): boolean {
    const hinglishWords = ['yaar', 'dekho', 'samjhe', 'bas', 'achha', 'hai', 'na'];
    const lowerText = text.toLowerCase();
    return hinglishWords.some(word => lowerText.includes(word));
  }
}
