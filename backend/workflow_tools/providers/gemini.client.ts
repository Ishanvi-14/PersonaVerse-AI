/**
 * Gemini API Client
 * 
 * Provides unified interface to Google's Gemini API for all workflow tools.
 * Handles authentication, error mapping, timeout management, and response validation.
 */

import { ToolError, ToolErrorCode } from '../types';

/**
 * Gemini API Client
 * 
 * Note: This is a placeholder implementation. In production, you would use
 * the official @google/generative-ai package.
 */
export class GeminiClient {
  private apiKey: string;
  private model: string;

  /**
   * Create a new Gemini API client
   * 
   * @param apiKey - Gemini API key from environment (optional in mock mode)
   * @param model - Model name (default: gemini-pro)
   */
  constructor(apiKey: string, model: string = 'gemini-pro') {
    // API key is optional - will be validated when actually calling the API
    this.apiKey = apiKey || '';
    this.model = model;
  }

  /**
   * Generate structured content from Gemini API
   * 
   * @param prompt - The prompt to send to Gemini
   * @param timeoutMs - Timeout in milliseconds
   * @returns Parsed JSON response
   * @throws {ToolError} On API errors, timeouts, or validation failures
   */
  async generateStructured<T>(
    prompt: string,
    timeoutMs: number = 30000
  ): Promise<T> {
    // Validate API key is present when calling the API
    if (!this.apiKey) {
      throw new ToolError(
        ToolErrorCode.MISSING_API_KEY,
        'GEMINI_API_KEY environment variable is required when not in mock mode'
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // In production, this would call the actual Gemini API
      // For now, this is a placeholder that will be replaced with real implementation
      // or mock mode will be used during development
      
      const response = await this.callGeminiAPI(prompt, controller.signal);
      clearTimeout(timeoutId);

      // Parse JSON response
      const parsed = JSON.parse(response);
      
      return parsed as T;

    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ToolError(
          ToolErrorCode.PROCESSING_TIMEOUT,
          `Processing exceeded ${timeoutMs / 1000} second limit`
        );
      }

      // Map Gemini API errors
      throw this.mapGeminiError(error);
    }
  }

  /**
   * Call Gemini API (placeholder for actual implementation)
   * 
   * @param prompt - The prompt to send
   * @param signal - Abort signal for timeout
   * @returns API response text
   */
  private async callGeminiAPI(prompt: string, signal: AbortSignal): Promise<string> {
    // Placeholder: In production, this would use @google/generative-ai
    // For development, mock mode should be enabled
    
    throw new ToolError(
      ToolErrorCode.GEMINI_API_ERROR,
      'Gemini API client not fully implemented. Please enable MOCK_MODE=true for development.'
    );
  }

  /**
   * Map Gemini API errors to ToolError
   * 
   * @param error - The error from Gemini API
   * @returns Mapped ToolError
   */
  private mapGeminiError(error: unknown): ToolError {
    // Type guard for error with status
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const statusError = error as { status: number; message?: string };
      
      if (statusError.status === 401 || statusError.status === 403) {
        return new ToolError(
          ToolErrorCode.INVALID_API_KEY,
          'Gemini API authentication failed. Check your API key.'
        );
      }

      if (statusError.status === 429) {
        return new ToolError(
          ToolErrorCode.RATE_LIMIT_EXCEEDED,
          'Gemini API rate limit exceeded. Please try again later.'
        );
      }
    }

    // Type guard for error with code
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const codeError = error as { code: string; message?: string };
      
      if (codeError.code === 'ECONNREFUSED') {
        return new ToolError(
          ToolErrorCode.GEMINI_API_ERROR,
          'Cannot connect to Gemini API'
        );
      }
    }

    // Generic error
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new ToolError(
      ToolErrorCode.GEMINI_API_ERROR,
      `Gemini API error: ${message}`
    );
  }
}
