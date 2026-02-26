import { ValidationResult, ToolErrorCode, ToolsConfig } from '../types';

export class InputValidator {
  constructor(private limits: ToolsConfig['limits']) {}

  validateSimplifierInput(data: any): ValidationResult {
    if (!data.input) {
      return { valid: false, error: { code: ToolErrorCode.MISSING_REQUIRED_FIELD, message: 'Input text is required', details: { field: 'input' } } };
    }
    if (!data.inputType) {
      return { valid: false, error: { code: ToolErrorCode.MISSING_REQUIRED_FIELD, message: 'Input type is required', details: { field: 'inputType' } } };
    }
    if (data.input.length < this.limits.simplifier.minChars) {
      return { valid: false, error: { code: ToolErrorCode.INPUT_TOO_SHORT, message: 'Input must be at least ' + this.limits.simplifier.minChars + ' characters', details: { current: data.input.length, minimum: this.limits.simplifier.minChars } } };
    }
    if (data.input.length > this.limits.simplifier.maxChars) {
      return { valid: false, error: { code: ToolErrorCode.INPUT_TOO_LONG, message: 'Input must not exceed ' + this.limits.simplifier.maxChars + ' characters', details: { current: data.input.length, maximum: this.limits.simplifier.maxChars } } };
    }
    if (data.audienceContext && data.audienceContext.length > this.limits.simplifier.maxAudienceContextChars) {
      return { valid: false, error: { code: ToolErrorCode.INPUT_TOO_LONG, message: 'Audience context must not exceed ' + this.limits.simplifier.maxAudienceContextChars + ' characters', details: { current: data.audienceContext.length, maximum: this.limits.simplifier.maxAudienceContextChars } } };
    }
    return { valid: true };
  }

  validateCalendarInput(data: any): ValidationResult {
    if (!data.niche) {
      return { valid: false, error: { code: ToolErrorCode.MISSING_REQUIRED_FIELD, message: 'Niche is required', details: { field: 'niche' } } };
    }
    if (!data.targetAudience) {
      return { valid: false, error: { code: ToolErrorCode.MISSING_REQUIRED_FIELD, message: 'Target audience is required', details: { field: 'targetAudience' } } };
    }
    if (data.niche.length > this.limits.calendar.maxNicheChars) {
      return { valid: false, error: { code: ToolErrorCode.INPUT_TOO_LONG, message: 'Niche must not exceed ' + this.limits.calendar.maxNicheChars + ' characters', details: { current: data.niche.length, maximum: this.limits.calendar.maxNicheChars } } };
    }
    if (data.targetAudience.length > this.limits.calendar.maxAudienceChars) {
      return { valid: false, error: { code: ToolErrorCode.INPUT_TOO_LONG, message: 'Target audience must not exceed ' + this.limits.calendar.maxAudienceChars + ' characters', details: { current: data.targetAudience.length, maximum: this.limits.calendar.maxAudienceChars } } };
    }
    if (data.frequency && !['daily', '3x-week', 'weekly'].includes(data.frequency)) {
      return { valid: false, error: { code: ToolErrorCode.INVALID_INPUT, message: 'Frequency must be daily, 3x-week, or weekly', details: { field: 'frequency', value: data.frequency } } };
    }
    return { valid: true };
  }

  validateGapAnalyzerInput(data: any): ValidationResult {
    if (!data.posts) {
      return { valid: false, error: { code: ToolErrorCode.MISSING_REQUIRED_FIELD, message: 'Posts array is required', details: { field: 'posts' } } };
    }
    if (!Array.isArray(data.posts)) {
      return { valid: false, error: { code: ToolErrorCode.INVALID_INPUT, message: 'Posts must be an array', details: { field: 'posts' } } };
    }
    if (data.posts.length < this.limits.gapAnalyzer.minPosts) {
      return { valid: false, error: { code: ToolErrorCode.INSUFFICIENT_POSTS, message: 'At least ' + this.limits.gapAnalyzer.minPosts + ' posts are required', details: { current: data.posts.length, minimum: this.limits.gapAnalyzer.minPosts } } };
    }
    if (data.posts.length > this.limits.gapAnalyzer.maxPosts) {
      return { valid: false, error: { code: ToolErrorCode.TOO_MANY_POSTS, message: 'Maximum ' + this.limits.gapAnalyzer.maxPosts + ' posts allowed', details: { current: data.posts.length, maximum: this.limits.gapAnalyzer.maxPosts } } };
    }
    if (data.nicheContext && data.nicheContext.length > this.limits.gapAnalyzer.maxNicheContextChars) {
      return { valid: false, error: { code: ToolErrorCode.INPUT_TOO_LONG, message: 'Niche context must not exceed ' + this.limits.gapAnalyzer.maxNicheContextChars + ' characters', details: { current: data.nicheContext.length, maximum: this.limits.gapAnalyzer.maxNicheContextChars } } };
    }
    return { valid: true };
  }
}