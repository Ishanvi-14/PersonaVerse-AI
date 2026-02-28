/**
 * Groq/Gemini API Client
 * 
 * Provides unified interface to Groq API (or Gemini) for all workflow tools.
 * Handles authentication, error mapping, timeout management, and response validation.
 */

import { ToolError, ToolErrorCode } from '../types';
import Groq from 'groq-sdk';

/**
 * API Client for LLM providers
 * 
 * Supports Groq API (primary) and Gemini API (fallback)
 */
export class GeminiClient {
  private apiKey: string;
  private model: string;
  private groqClient: Groq | null = null;

  /**
   * Create a new API client
   * 
   * @param apiKey - API key (Groq or Gemini)
   * @param model - Model name
   */
  constructor(apiKey: string, model: string = 'gemini-pro') {
    this.apiKey = apiKey || '';
    this.model = model;
    
    // Initialize Groq client if using Groq model
    if (this.apiKey && model.includes('llama')) {
      try {
        this.groqClient = new Groq({ apiKey: this.apiKey });
      } catch (error) {
        console.error('[Gemini Client] Failed to initialize Groq client:', error);
      }
    }
  }

  /**
   * Generate structured content from API
   * 
   * @param prompt - The prompt to send
   * @param timeoutMs - Timeout in milliseconds
   * @returns Parsed JSON response
   * @throws {ToolError} On API errors, timeouts, or validation failures
   */
  async generateStructured<T>(
    prompt: string,
    timeoutMs: number = 30000
  ): Promise<T> {
    // Validate API key is present
    if (!this.apiKey) {
      throw new ToolError(
        ToolErrorCode.MISSING_API_KEY,
        'API key is required (GROQ_API_KEY or GEMINI_API_KEY environment variable)'
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response: string;
      
      // Use Groq if available
      if (this.groqClient) {
        response = await this.callGroqAPI(prompt);
      } else {
        // Fallback to Gemini (not implemented)
        throw new ToolError(
          ToolErrorCode.GEMINI_API_ERROR,
          'Gemini API not implemented. Please use Groq API (GROQ_API_KEY)'
        );
      }
      
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

      // Re-throw ToolErrors
      if (error instanceof ToolError) {
        throw error;
      }

      // Map API errors
      throw this.mapAPIError(error);
    }
  }

  /**
   * Call Groq API
   * 
   * @param prompt - The prompt to send
   * @returns API response text
   */
  private async callGroqAPI(prompt: string): Promise<string> {
    if (!this.groqClient) {
      throw new ToolError(
        ToolErrorCode.GEMINI_API_ERROR,
        'Groq client not initialized'
      );
    }

    try {
      const completion = await this.groqClient.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that generates structured JSON responses. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from Groq API');
      }

      return content;

    } catch (error: any) {
      console.error('[Gemini Client] Groq API error:', error);
      
      if (error.status === 401) {
        throw new ToolError(
          ToolErrorCode.INVALID_API_KEY,
          'Invalid Groq API key. Please check your GROQ_API_KEY environment variable.'
        );
      }
      
      if (error.status === 429) {
        throw new ToolError(
          ToolErrorCode.RATE_LIMIT_EXCEEDED,
          'Groq API rate limit exceeded. Please try again later.'
        );
      }
      
      throw new ToolError(
        ToolErrorCode.GEMINI_API_ERROR,
        `Groq API error: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Map API errors to ToolError
   * 
   * @param error - The error from API
   * @returns Mapped ToolError
   */
  private mapAPIError(error: unknown): ToolError {
    // Type guard for error with status
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const statusError = error as { status: number; message?: string };
      
      if (statusError.status === 401 || statusError.status === 403) {
        return new ToolError(
          ToolErrorCode.INVALID_API_KEY,
          'API authentication failed. Check your API key.'
        );
      }

      if (statusError.status === 429) {
        return new ToolError(
          ToolErrorCode.RATE_LIMIT_EXCEEDED,
          'API rate limit exceeded. Please try again later.'
        );
      }
    }

    // Type guard for error with code
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const codeError = error as { code: string; message?: string };
      
      if (codeError.code === 'ECONNREFUSED') {
        return new ToolError(
          ToolErrorCode.GEMINI_API_ERROR,
          'Cannot connect to API'
        );
      }
    }

    // Generic error
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new ToolError(
      ToolErrorCode.GEMINI_API_ERROR,
      `API error: ${message}`
    );
  }
}
