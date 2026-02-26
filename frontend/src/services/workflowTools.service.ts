/**
 * Workflow Tools Service
 * 
 * Frontend service layer for Workflow Intelligence Tools API.
 * Handles all HTTP communication with the backend workflow tools endpoints.
 */

const API_BASE_URL = 'http://localhost:3001';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SimplifierRequest {
  input: string;
  audienceContext?: string;
  inputType: 'text' | 'file';
  fileName?: string;
}

export interface SimplifierOutput {
  grade5_explanation: string;
  bullet_summary: string[];
  whatsapp_version: string;
  voice_script: string;
  regional_version: string;
}

export interface CalendarRequest {
  niche: string;
  targetAudience: string;
  frequency?: 'daily' | '3x-week' | 'weekly';
}

export interface CalendarOutput {
  weekly_plan: DayPlan[];
  post_types: string[];
  hooks: string[];
  platform_strategy: PlatformStrategy;
  best_times: PostingTime[];
  upcoming_festivals?: FestivalSuggestion[];
}

export interface DayPlan {
  day_name: string;
  post_idea: string;
  content_type: string;
  hook: string;
}

export interface PlatformStrategy {
  instagram: string;
  linkedin: string;
  youtube: string;
}

export interface PostingTime {
  time: string;
  reason: string;
}

export interface FestivalSuggestion {
  festival_name: string;
  date: string;
  content_angle: string;
}

export interface GapAnalyzerRequest {
  posts: string[];
  nicheContext?: string;
}

export interface GapAnalysisOutput {
  overused_themes: ThemeFrequency[];
  missing_topics: string[];
  fatigue_risk: FatigueRisk;
  suggested_angles: string[];
  diversity_score: number;
}

export interface ThemeFrequency {
  theme: string;
  frequency_percentage: number;
  example_posts: number[];
}

export interface FatigueRisk {
  level: 'low' | 'medium' | 'high';
  explanation: string;
  recommendation: string;
}

// ============================================================================
// Workflow Tools Service
// ============================================================================

export class WorkflowToolsService {
  /**
   * Simplify content into multiple formats
   */
  async simplifyContent(request: SimplifierRequest): Promise<SimplifierOutput> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(this.getUserFriendlyMessage(data.error_code, data.message));
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Generate weekly content calendar
   */
  async generateCalendar(request: CalendarRequest): Promise<CalendarOutput> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(this.getUserFriendlyMessage(data.error_code, data.message));
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Analyze content gaps and patterns
   */
  async analyzeGaps(request: GapAnalyzerRequest): Promise<GapAnalysisOutput> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/gap-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(this.getUserFriendlyMessage(data.error_code, data.message));
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Export tool results in specified format
   */
  async exportResults(
    toolName: string,
    data: any,
    format: 'json' | 'txt' | 'pdf'
  ): Promise<void> {
    try {
      // Encode data as base64
      const jsonString = JSON.stringify(data);
      const encodedData = btoa(jsonString);
      
      // Build URL with proper encoding
      const params = new URLSearchParams({
        toolName: toolName,
        data: encodedData
      });
      
      const url = `${API_BASE_URL}/tools/export/${format}?${params.toString()}`;
      
      console.log('[Export] Requesting:', url.substring(0, 100) + '...');

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Export] Server error:', errorText);
        throw new Error('Export failed');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Check if blob has content
      if (blob.size === 0) {
        console.error('[Export] Empty file received');
        throw new Error('Export generated empty file');
      }

      console.log('[Export] Received blob:', blob.size, 'bytes');

      // Trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename: string;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        filename = filenameMatch ? filenameMatch[1] : `${toolName}-export.${format}`;
      } else {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
        filename = `${toolName}-${timestamp}.${format}`;
      }
      
      link.download = filename;
      console.log('[Export] Downloading as:', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('[Export] Download triggered successfully');
    } catch (error) {
      console.error('[Export] Error:', error);
      throw new Error('Failed to export results. Please try again.');
    }
  }

  /**
   * Map error codes to user-friendly messages
   */
  private getUserFriendlyMessage(errorCode: string, defaultMessage: string): string {
    const messages: Record<string, string> = {
      'INPUT_TOO_SHORT': 'Please provide at least 50 characters of text to simplify.',
      'INPUT_TOO_LONG': 'Text is too long. Please limit to 10,000 characters.',
      'INSUFFICIENT_POSTS': 'Please provide at least 3 posts for analysis.',
      'TOO_MANY_POSTS': 'Too many posts. Please limit to 50 posts.',
      'MISSING_REQUIRED_FIELD': 'Please fill in all required fields.',
      'MISSING_API_KEY': 'System configuration error. Please contact support.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
      'PROCESSING_TIMEOUT': 'Processing took too long. Try with shorter content.',
      'GEMINI_API_ERROR': 'Service temporarily unavailable. Please try again later.',
    };

    return messages[errorCode] || defaultMessage;
  }
}

// Export singleton instance
export const workflowToolsService = new WorkflowToolsService();
