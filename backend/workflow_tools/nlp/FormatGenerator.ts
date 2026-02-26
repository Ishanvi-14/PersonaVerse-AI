/**
 * Format Generator - Stage 4: Format Generators
 * 
 * Generates all 5 output formats from the same simplified core meaning
 */

import { HINGLISH_PATTERNS, CONVERSATIONAL_MARKERS } from './vocabularies/hinglishPatterns';

export interface FormattedOutputs {
  grade5_explanation: string;
  bullet_summary: string[];
  whatsapp_version: string;
  voice_script: string;
  regional_version: string;
}

export class FormatGenerator {
  private emojis = ['😊', '👍', '🎯', '💡', '✨', '🔥', '💪'];
  
  /**
   * Generate all 5 formats from simplified sentences
   */
  generate(simplifiedSentences: string[], keywords: string[]): FormattedOutputs {
    return {
      grade5_explanation: this.generateGrade5(simplifiedSentences),
      bullet_summary: this.generateBullets(simplifiedSentences, keywords),
      whatsapp_version: this.generateWhatsApp(simplifiedSentences),
      voice_script: this.generateVoiceScript(simplifiedSentences),
      regional_version: this.generateRegional(simplifiedSentences)
    };
  }
  
  /**
   * Generate grade 5 narrative explanation
   */
  private generateGrade5(sentences: string[]): string {
    // Create flowing narrative
    const narrative = sentences.join('. ');
    const closing = " This is like explaining cricket to a friend - simple and clear!";
    
    return narrative + '.' + closing;
  }
  
  /**
   * Generate bullet point summary
   */
  private generateBullets(sentences: string[], keywords: string[]): string[] {
    const bullets: string[] = [];
    
    // Each sentence becomes a bullet
    sentences.forEach(sentence => {
      // Ensure proper capitalization and punctuation
      let bullet = sentence.trim();
      bullet = bullet.charAt(0).toUpperCase() + bullet.slice(1);
      if (!bullet.match(/[.!?]$/)) {
        bullet += '.';
      }
      bullets.push(bullet);
    });
    
    // Add keyword-based bullet if we have room
    if (bullets.length < 5 && keywords.length > 0) {
      bullets.push(`Key topics: ${keywords.slice(0, 3).join(', ')}.`);
    }
    
    // Ensure 3-7 bullets
    while (bullets.length < 3) {
      bullets.push('Additional key point from the content.');
    }
    
    return bullets.slice(0, 7);
  }
  
  /**
   * Generate WhatsApp conversational version
   */
  private generateWhatsApp(sentences: string[]): string {
    const greeting = HINGLISH_PATTERNS.greeting[
      Math.floor(Math.random() * HINGLISH_PATTERNS.greeting.length)
    ];
    
    const emoji1 = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    const emoji2 = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    
    const confirmation = HINGLISH_PATTERNS.confirmation[
      Math.floor(Math.random() * HINGLISH_PATTERNS.confirmation.length)
    ];
    
    // Take first 2 sentences for brevity
    const content = sentences.slice(0, 2).join('. ');
    
    return `${greeting}! ${emoji1}\n\n${content}.\n\nMakes sense ${confirmation} ${emoji2} Simple hai!`;
  }
  
  /**
   * Generate voice script with pauses
   */
  private generateVoiceScript(sentences: string[]): string {
    const intro = "Hello friends. Let me share something important with you.";
    const outro = "So that's the main idea. I hope this was helpful!";
    
    // Insert pauses between sentences
    const mainContent = sentences
      .map(s => s.trim())
      .join('. [Pause] ');
    
    return `${intro} [Pause] ${mainContent}. [Pause] ${outro}`;
  }
  
  /**
   * Generate regional Hinglish version
   */
  private generateRegional(sentences: string[]): string {
    // Take first 2 sentences
    const content = sentences.slice(0, 2).join('. ');
    
    const closing = HINGLISH_PATTERNS.closing[
      Math.floor(Math.random() * HINGLISH_PATTERNS.closing.length)
    ];
    
    return `Dekho yaar, main concept yeh hai ki ${content}. Samjhe? It's actually quite simple once you understand. ${closing}!`;
  }
}
