/**
 * Calendar Generator Service
 * 
 * Produces strategic weekly content plans with Indian cultural awareness.
 */

import { GeminiClient } from '../providers/gemini.client';
import { MockProvider } from '../providers/mock.provider';
import { CalendarRequest, CalendarOutput, ToolsConfig } from '../types';

/**
 * Calendar Generator Service
 * 
 * Creates culturally-aware content calendars for Bharat creators with
 * Indian festival integration, IST timezone, and regional context.
 */
export class CalendarService {
  constructor(
    private geminiClient: GeminiClient,
    private mockProvider: MockProvider,
    private config: ToolsConfig
  ) {}

  /**
   * Generate weekly content calendar
   * 
   * @param request - Calendar request with niche and audience
   * @returns CalendarOutput with 7-day plan and strategy
   */
  async generateCalendar(request: CalendarRequest): Promise<CalendarOutput> {
    // Check if mock mode is enabled
    if (this.config.mock.enabled) {
      console.log('[MOCK MODE] Returning mock calendar response');
      return await this.mockProvider.getCalendarResponse(request.niche);
    }

    // Real Gemini API call
    const prompt = this.buildCalendarPrompt(request);
    return await this.geminiClient.generateStructured<CalendarOutput>(
      prompt,
      this.config.gemini.timeouts.calendar
    );
  }

  /**
   * Build Gemini prompt with Indian cultural intelligence
   * 
   * @param request - Calendar request
   * @returns Formatted prompt for Gemini API
   */
  private buildCalendarPrompt(request: CalendarRequest): string {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const frequencyNote = request.frequency 
      ? `\nPosting Frequency: ${request.frequency}` 
      : '';

    return `
You are a content strategist for Bharat (Indian) creators. Create a weekly content plan with cultural awareness.

CULTURAL RULES (MANDATORY):
- Check for Indian festivals between ${today.toISOString().split('T')[0]} and ${next30Days.toISOString().split('T')[0]}
  * Major festivals: Diwali, Holi, Eid, Dussehra, Pongal, Onam, Ganesh Chaturthi
  * Regional festivals: Durga Puja (Bengal), Bihu (Assam), Lohri (Punjab)
- Use IST timezone for all posting times
- Consider Indian audience engagement patterns:
  * Morning: 9-10 AM IST (commute time)
  * Afternoon: 1-2 PM IST (lunch break)
  * Evening: 8-10 PM IST (leisure time)
- Use language and references familiar to Bharat audiences
- Include Hinglish hooks where appropriate

CREATOR DETAILS:
Niche: ${request.niche}
Target Audience: ${request.targetAudience}${frequencyNote}

Respond with ONLY valid JSON matching this exact structure:
{
  "weekly_plan": [
    {
      "day_name": "Monday",
      "post_idea": "Specific content idea relevant to niche",
      "content_type": "Educational/Personal/Behind-the-scenes/etc",
      "hook": "Attention-grabbing opening line"
    }
  ],
  "post_types": ["Type 1", "Type 2", "Type 3"],
  "hooks": ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],
  "platform_strategy": {
    "instagram": "Strategy for Instagram with Indian context",
    "linkedin": "Strategy for LinkedIn with Indian context",
    "youtube": "Strategy for YouTube with Indian context"
  },
  "best_times": [
    {
      "time": "9:00 AM IST",
      "reason": "Why this time is optimal for Indian audience"
    }
  ],
  "upcoming_festivals": [
    {
      "festival_name": "Festival name",
      "date": "YYYY-MM-DD",
      "content_angle": "How to leverage this festival for content"
    }
  ]
}

IMPORTANT REQUIREMENTS:
- weekly_plan must have exactly 7 days (Monday through Sunday)
- post_types must have 3-5 items
- hooks must have 5-10 items with Bharat-appropriate language
- All times must include "IST" timezone
- Include upcoming_festivals if any Indian festivals in next 30 days
- Use Indian cultural references and metaphors (sixer, not home run)
`;
  }
}
