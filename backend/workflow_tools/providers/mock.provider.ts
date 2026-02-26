/**
 * Mock Provider for Workflow Intelligence Tools
 * 
 * Provides realistic Bharat-specific mock responses for development
 * without consuming Gemini API credits.
 */

import { SimplifierOutput, CalendarOutput, GapAnalysisOutput } from '../types';

/**
 * Mock Provider
 * 
 * Returns predefined responses that match the exact schema of real API responses.
 * All responses include realistic Bharat-specific content with proper Hinglish,
 * Indian cultural references, and regional context.
 */
export class MockProvider {
  /**
   * Simulate API latency
   * 
   * @param ms - Milliseconds to delay
   */
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get mock Content Simplifier response
   * 
   * @param input - Original input text (not used in mock)
   * @returns Mock SimplifierOutput with Bharat-specific content
   */
  async getSimplifierResponse(input: string): Promise<SimplifierOutput> {
    await this.simulateDelay(1000);

    return {
      grade5_explanation: "This is a simple explanation that a 5th grader can understand. " +
        "We use easy words and short sentences. Like explaining cricket to a friend! " +
        "The main idea is clear and simple. No big words needed.",

      bullet_summary: [
        "Main point explained in simple terms",
        "Second important thing to remember",
        "Third key takeaway for you",
        "One more helpful detail"
      ],

      whatsapp_version: "Arre yaar! 😊 Let me explain this simply. " +
        "Basically, the main idea is this... Makes sense na? 👍 " +
        "It's like when you're explaining something to your friend over chai. Simple and clear!",

      voice_script: "Hello friends. Today I want to share something interesting with you. " +
        "[Pause] Listen carefully. The main point is... [Pause] " +
        "Let me explain with an example. Think of it like this... [Pause] " +
        "So that's the key idea. Hope this helps!",

      regional_version: "Dekho yaar, main concept yeh hai ki... " +
        "It's actually quite simple once you understand the basics. " +
        "Samjhe? Let me break it down for you. Basically, what happens is... " +
        "Achha, so the point is clear now, right? Bas itna hi!"
    };
  }

  /**
   * Get mock Calendar Generator response
   * 
   * @param niche - Content niche (not used in mock)
   * @returns Mock CalendarOutput with Indian cultural context
   */
  async getCalendarResponse(niche: string): Promise<CalendarOutput> {
    await this.simulateDelay(1000);

    return {
      weekly_plan: [
        {
          day_name: "Monday",
          post_idea: "Share a motivational story from your journey",
          content_type: "Personal Story",
          hook: "3 years ago, I was exactly where you are today..."
        },
        {
          day_name: "Tuesday",
          post_idea: "Educational tip related to your niche",
          content_type: "Educational",
          hook: "Here's something nobody tells you about..."
        },
        {
          day_name: "Wednesday",
          post_idea: "Behind-the-scenes of your work process",
          content_type: "Behind-the-Scenes",
          hook: "Let me show you what really happens..."
        },
        {
          day_name: "Thursday",
          post_idea: "Quick win or actionable tip",
          content_type: "Quick Win",
          hook: "Try this today and see results by tomorrow..."
        },
        {
          day_name: "Friday",
          post_idea: "Community engagement question",
          content_type: "Community Engagement",
          hook: "I want to hear from you..."
        },
        {
          day_name: "Saturday",
          post_idea: "Weekend inspiration or reflection",
          content_type: "Inspiration",
          hook: "This weekend, remember..."
        },
        {
          day_name: "Sunday",
          post_idea: "Weekly recap and next week preview",
          content_type: "Recap",
          hook: "What a week! Here's what we learned..."
        }
      ],

      post_types: [
        "Personal Stories",
        "Educational Tips",
        "Behind-the-Scenes",
        "Quick Wins",
        "Community Engagement"
      ],

      hooks: [
        "Yaar, this changed everything for me...",
        "Nobody talks about this, but...",
        "Here's the truth about...",
        "3 years ago vs today...",
        "Stop doing this immediately...",
        "The one thing that made all the difference...",
        "Let me be honest with you...",
        "This is what they don't tell you..."
      ],

      platform_strategy: {
        instagram: "Focus on visual storytelling with carousel posts. Use Reels for quick tips. " +
          "Post during morning chai time (9-10 AM IST) and evening leisure (8-9 PM IST).",
        linkedin: "Share professional insights and case studies. Engage in comments. " +
          "Post during work hours (10 AM - 2 PM IST) for maximum reach.",
        youtube: "Create in-depth tutorials and weekly vlogs. Build community through consistency. " +
          "Upload on weekends when people have time to watch longer content."
      },

      best_times: [
        {
          time: "9:00 AM IST",
          reason: "Morning commute time, high engagement as people check phones"
        },
        {
          time: "1:00 PM IST",
          reason: "Lunch break scrolling, people taking a break from work"
        },
        {
          time: "8:30 PM IST",
          reason: "Evening leisure time, peak activity after dinner"
        }
      ],

      upcoming_festivals: [
        {
          festival_name: "Holi",
          date: "2026-03-14",
          content_angle: "Share colorful transformation stories or before/after content themed around colors and celebration"
        },
        {
          festival_name: "Diwali",
          date: "2026-10-24",
          content_angle: "Focus on new beginnings, light over darkness metaphors, and festive success stories"
        }
      ]
    };
  }

  /**
   * Get mock Gap Analyzer response
   * 
   * @param posts - Array of posts to analyze (not used in mock)
   * @returns Mock GapAnalysisOutput with pattern analysis
   */
  async getGapAnalysisResponse(posts: string[]): Promise<GapAnalysisOutput> {
    await this.simulateDelay(1000);

    return {
      overused_themes: [
        {
          theme: "Motivational quotes",
          frequency_percentage: 40,
          example_posts: [0, 2, 5, 8]
        },
        {
          theme: "Personal achievements",
          frequency_percentage: 30,
          example_posts: [1, 4, 7]
        }
      ],

      missing_topics: [
        "Behind-the-scenes process content",
        "Failure stories and lessons learned",
        "Community engagement posts",
        "Educational how-to guides",
        "Industry trends and analysis",
        "Collaborative content with others",
        "Day-in-the-life stories"
      ],

      fatigue_risk: {
        level: "medium",
        explanation: "You're posting similar motivational content frequently. " +
          "Audience may start scrolling past without engaging. The pattern is becoming predictable.",
        recommendation: "Diversify with educational content, behind-the-scenes, and community questions. " +
          "Mix in some vulnerability and real stories, not just wins."
      },

      suggested_angles: [
        "Share a recent failure and what you learned",
        "Do a Q&A post asking audience questions",
        "Create a step-by-step tutorial",
        "Share industry news with your take",
        "Post a day-in-the-life story",
        "Collaborate with someone in your niche",
        "Share a controversial opinion (respectfully)",
        "Do a myth-busting post"
      ],

      diversity_score: 55
    };
  }
}
