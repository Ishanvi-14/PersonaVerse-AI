/**
 * Bedrock Mock Service - Credit Discipline
 * 
 * High-quality mock responses for development without AWS costs.
 * Follows PersonaVerse quality bar and cultural authenticity.
 */

import { BedrockGenerationRequest, BedrockGenerationResponse } from './bedrockService';

/**
 * Mock persona-aware content generation
 */
export function generateWithBedrockMock(
  request: BedrockGenerationRequest
): BedrockGenerationResponse {
  console.log(`[Bedrock Mock] Generating content for persona ${request.personaId} on ${request.platform}`);

  const mockResponses = getMockResponsesByPlatform(request.platform, request.personaId);
  const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];

  // Simulate processing time
  const latencyMs = 800 + Math.random() * 400; // 800-1200ms

  console.log(`[Bedrock Mock] Generation complete in ${latencyMs.toFixed(0)}ms`);
  console.log(`[Bedrock Mock] Persona alignment: ${(response.personaAlignment.overallScore * 100).toFixed(1)}%`);

  return {
    ...response,
    metadata: {
      modelId: 'mock-claude-4.5',
      tokensUsed: 0,
      latencyMs: Math.round(latencyMs)
    }
  };
}

/**
 * Get mock responses by platform and persona
 */
function getMockResponsesByPlatform(platform: string, personaId: string): BedrockGenerationResponse[] {
  const platformKey = platform.toLowerCase();
  
  const responses: Record<string, BedrockGenerationResponse[]> = {
    linkedin: getLinkedInMocks(personaId),
    twitter: getTwitterMocks(personaId),
    instagram: getInstagramMocks(personaId),
    whatsapp: getWhatsAppMocks(personaId),
    email: getEmailMocks(personaId)
  };

  return responses[platformKey] || responses.linkedin;
}

/**
 * LinkedIn mock responses - Professional but personable
 */
function getLinkedInMocks(personaId: string): BedrockGenerationResponse[] {
  return [
    {
      content: `Here's what I've learned building in public for the past year:

Most founders treat LinkedIn like a highlight reel. Perfect launches, hockey stick growth, and "we did it!" posts. But real growth? It's messy.

Last quarter, we missed our revenue target by 30%. Our best engineer quit. A competitor copied our core feature. And you know what? Sharing that openly led to three advisor conversations and two investor intros who'd "been there."

The Indian startup ecosystem is maturing. We're moving past the "fake it till you make it" culture. Investors want to see resilience, not just results. Customers want authenticity, not perfection.

My advice? Share the struggle, not just the success. Your next breakthrough might come from someone who relates to your current challenge, not someone who's impressed by your past wins.

What's one hard truth about your journey you've been hesitant to share? 🤔`,
      reasoning: 'Establishes founder credibility through vulnerability while maintaining professional authority. Uses personal narrative arc that feels human, not AI-generated.',
      personaAlignment: {
        linguisticMatch: 0.85,
        valueAlignment: 0.90,
        emotionalConsistency: 0.88,
        overallScore: 0.88
      },
      culturalAdaptations: [
        {
          type: 'reference',
          original: "Silicon Valley's 'move fast and break things' mentality",
          adapted: "Indian startup ecosystem's evolution from 'fake it till you make it'",
          reason: "Grounds the insight in Bharat's actual startup culture shift"
        },
        {
          type: 'idiom',
          original: 'transparency is the new currency',
          adapted: 'share the struggle, not just the success',
          reason: 'More action-oriented and less corporate-speak'
        }
      ],
      metadata: {
        modelId: 'mock-claude-4.5',
        tokensUsed: 0,
        latencyMs: 1000
      }
    },
    {
      content: `Three years ago, I pitched to 47 investors. Got 47 rejections.

Today, we closed our Series A. But here's what nobody tells you about fundraising in India:

The "no" that hurt most came from someone who said: "Your idea is great, but you're not from IIT/IIM." That rejection taught me more than any acceptance ever could.

I doubled down on execution. Built a product so good that customers became our best advocates. Revenue spoke louder than pedigree ever could.

The Bharat startup ecosystem is changing. Tier-2 founders are building world-class products. Regional language users are becoming our biggest growth drivers. And investors are finally seeing beyond the usual suspects.

To every founder grinding in silence: Your background doesn't define your ceiling. Your execution does.

Keep building. The market doesn't care about your resume. 💪`,
      reasoning: 'Addresses real barriers in Indian startup ecosystem while maintaining optimistic, action-oriented tone. Authentic founder voice.',
      personaAlignment: {
        linguisticMatch: 0.87,
        valueAlignment: 0.92,
        emotionalConsistency: 0.85,
        overallScore: 0.88
      },
      culturalAdaptations: [
        {
          type: 'reference',
          original: 'Ivy League credentials',
          adapted: 'IIT/IIM pedigree',
          reason: 'Reflects actual Indian startup ecosystem dynamics'
        },
        {
          type: 'metaphor',
          original: 'breaking through the glass ceiling',
          adapted: 'your background doesn\'t define your ceiling',
          reason: 'More direct and action-oriented for Indian audience'
        }
      ],
      metadata: {
        modelId: 'mock-claude-4.5',
        tokensUsed: 0,
        latencyMs: 950
      }
    }
  ];
}

/**
 * Twitter mock responses - Punchy and engaging
 */
function getTwitterMocks(personaId: string): BedrockGenerationResponse[] {
  return [
    {
      content: `Hot take: Indian startups don't need more funding. They need more patience.

We're optimizing for the next round instead of the next decade. Building for VCs instead of customers.

The best companies I know? They took 5 years to find PMF. Stayed lean. Stayed focused.

Slow is smooth. Smooth is fast. 🎯`,
      reasoning: 'Twitter-optimized: controversial opener, clear thesis, memorable closer. Bharat-specific insight.',
      personaAlignment: {
        linguisticMatch: 0.82,
        valueAlignment: 0.88,
        emotionalConsistency: 0.86,
        overallScore: 0.85
      },
      culturalAdaptations: [
        {
          type: 'idiom',
          original: 'Rome wasn\'t built in a day',
          adapted: 'Slow is smooth. Smooth is fast.',
          reason: 'More tactical and founder-friendly phrasing'
        }
      ],
      metadata: {
        modelId: 'mock-claude-4.5',
        tokensUsed: 0,
        latencyMs: 850
      }
    },
    {
      content: `Just realized: We spend more time on pitch decks than talking to customers.

Last week I deleted our 40-slide deck and replaced it with:
- 3 customer stories
- 1 demo video
- Our revenue chart

Got 2 term sheets. 

Sometimes less really is more. 📊`,
      reasoning: 'Personal anecdote with actionable insight. Numbers add credibility. Conversational tone.',
      personaAlignment: {
        linguisticMatch: 0.84,
        valueAlignment: 0.86,
        emotionalConsistency: 0.87,
        overallScore: 0.86
      },
      culturalAdaptations: [],
      metadata: {
        modelId: 'mock-claude-4.5',
        tokensUsed: 0,
        latencyMs: 900
      }
    }
  ];
}

/**
 * Instagram mock responses - Visual and relatable
 */
function getInstagramMocks(personaId: string): BedrockGenerationResponse[] {
  return [
    {
      content: `POV: You're a founder in 2026 🚀

6 AM: Wake up to customer complaints
8 AM: Team standup (someone's internet died)
10 AM: Investor call (they want "more traction")
12 PM: Product demo (prospect says "interesting, let's reconnect")
3 PM: Fix critical bug
6 PM: Realize you forgot lunch
9 PM: Still coding

But you know what? Wouldn't trade it for anything.

Because somewhere between the chaos and the coffee, you're building something that matters. Something that solves real problems for real people.

To every founder grinding today: You're not alone. We're all in this beautiful mess together. 💪

#StartupLife #FounderJourney #IndianStartups #BuildInPublic`,
      reasoning: 'Instagram-native format with POV hook, relatable daily struggles, inspirational closer. Emoji usage appropriate for platform.',
      personaAlignment: {
        linguisticMatch: 0.86,
        valueAlignment: 0.89,
        emotionalConsistency: 0.90,
        overallScore: 0.88
      },
      culturalAdaptations: [
        {
          type: 'reference',
          original: 'Silicon Valley hustle culture',
          adapted: 'Indian founder reality (internet issues, reconnect culture)',
          reason: 'Reflects actual day-to-day challenges in Indian startup ecosystem'
        }
      ],
      metadata: {
        modelId: 'mock-claude-4.5',
        tokensUsed: 0,
        latencyMs: 1100
      }
    }
  ];
}

/**
 * WhatsApp mock responses - Ultra-casual and friendly
 */
function getWhatsAppMocks(personaId: string): BedrockGenerationResponse[] {
  return [
    {
      content: `Yaar, just had the craziest investor meeting 😅

They asked: "What's your moat?"

I said: "We actually talk to our customers"

Dead silence. Then one guy laughed and said "that's rare these days"

Got the term sheet next day 🎉

Moral: Sometimes the simplest answer is the best answer. Don't overthink it!`,
      reasoning: 'WhatsApp-appropriate: casual tone, Hinglish touch ("yaar"), story format, quick punchline. Friend-to-friend vibe.',
      personaAlignment: {
        linguisticMatch: 0.90,
        valueAlignment: 0.87,
        emotionalConsistency: 0.89,
        overallScore: 0.89
      },
      culturalAdaptations: [
        {
          type: 'idiom',
          original: 'dude/bro',
          adapted: 'yaar',
          reason: 'Natural Hinglish code-switching for Indian audience'
        }
      ],
      metadata: {
        modelId: 'mock-claude-4.5',
        tokensUsed: 0,
        latencyMs: 750
      }
    }
  ];
}

/**
 * Email mock responses - Professional yet warm
 */
function getEmailMocks(personaId: string): BedrockGenerationResponse[] {
  return [
    {
      content: `Subject: Quick update on our progress

Hi team,

Hope this finds you well! Wanted to share some exciting updates from this quarter:

✅ Crossed 10,000 active users (up 40% from last quarter)
✅ Launched in 3 new cities: Pune, Jaipur, and Kochi
✅ Customer satisfaction score: 4.7/5

But more importantly, we learned something crucial: Our Tier-2 city users are 2x more engaged than metro users. This changes everything about our growth strategy.

Next quarter, we're doubling down on regional expansion. Would love your thoughts on this pivot.

Let's catch up this week?

Best,
[Your name]

P.S. - The team loved your feedback on the new feature. Keep it coming! 🙏`,
      reasoning: 'Email-appropriate: clear subject, structured content, actionable ask, warm closer. Professional but personable.',
      personaAlignment: {
        linguisticMatch: 0.84,
        valueAlignment: 0.88,
        emotionalConsistency: 0.86,
        overallScore: 0.86
      },
      culturalAdaptations: [
        {
          type: 'reference',
          original: 'expanding to new markets',
          adapted: 'Tier-2 city focus (Pune, Jaipur, Kochi)',
          reason: 'Specific to Indian market dynamics and growth patterns'
        }
      ],
      metadata: {
        modelId: 'mock-claude-4.5',
        tokensUsed: 0,
        latencyMs: 1050
      }
    }
  ];
}
