/**
 * Simplifier Pipeline - Main Orchestrator
 * 
 * Coordinates all NLP stages to produce deterministic, high-quality output
 */

import { TextAnalyzer } from './TextAnalyzer';
import { SentenceRanker } from './SentenceRanker';
import { ReadabilityTransformer } from './ReadabilityTransformer';
import { FormatGenerator, FormattedOutputs } from './FormatGenerator';
import { OutputValidator } from './OutputValidator';

export class SimplifierPipeline {
  private analyzer = new TextAnalyzer();
  private ranker = new SentenceRanker();
  private transformer = new ReadabilityTransformer();
  private generator = new FormatGenerator();
  private validator = new OutputValidator();
  
  /**
   * Process input text through complete NLP pipeline
   */
  async process(input: string): Promise<FormattedOutputs> {
    // Stage 1: Text Understanding
    const analyzed = this.analyzer.analyze(input);
    
    // Stage 2: Importance Scoring - EXPANDED to get more content
    const rankedSentences = this.ranker.rank(analyzed, 5); // Increased from 3 to 5
    const coreSentences = rankedSentences.map(rs => rs.text);
    
    // Stage 3: Readability Transformation
    const simplifiedSentences = this.transformer.transform(coreSentences);
    
    // Stage 4: Format Generation
    const outputs = this.generator.generate(simplifiedSentences, analyzed.keywords);
    
    // Stage 5: Validation
    const validation = this.validator.validate(
      outputs.grade5_explanation,
      outputs.bullet_summary,
      outputs.whatsapp_version,
      outputs.voice_script,
      outputs.regional_version
    );
    
    // If validation fails, retry with fallback
    if (!validation.valid) {
      console.warn('[SimplifierPipeline] Validation failed:', validation.errors);
      return this.generateFallback(input, analyzed.keywords);
    }
    
    return outputs;
  }
  
  /**
   * Generate fallback output if validation fails
   */
  private generateFallback(input: string, keywords: string[]): FormattedOutputs {
    // Use first 300 chars as safe fallback (increased from 200)
    const safeText = input.substring(0, 300).trim();
    const sentences = safeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return this.generator.generate(sentences.slice(0, 3), keywords); // Increased from 2 to 3
  }
}
