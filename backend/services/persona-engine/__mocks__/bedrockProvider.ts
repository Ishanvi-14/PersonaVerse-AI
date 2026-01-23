/**
 * Mock Bedrock Provider for PersonaVerse AI
 * 
 * This mock implementation provides hard-coded, persona-aligned responses
 * to save credits during development while maintaining the expected behavior
 * patterns defined in our demo script.
 */

export interface PersonaLayer {
  id: string;
  name: string;
  linguisticDNA: {
    hinglishRatio: number;
    cadence: 'high' | 'medium' | 'low';
    formalityLevel: number; // 1-10 scale
    preferredMetaphors: string[];
  };
  valueConstraints: {
    coreBeliefs: string[];
    avoidedTopics: string[];
    riskTolerance: 'safe' | 'moderate' | 'bold';
  };
  emotionalBaseline: {
    optimismLevel: number; // 1-10 scale
    authorityLevel: number; // 1-10 scale
  };
}

export interface GenerationRequest {
  personaId: string;
  platform: 'linkedin' | 'whatsapp' | 'email' | 'twitter';
  content: string;
  emotionSliders?: {
    urgency?: number; // 1-10
    enthusiasm?: number; // 1-10
    formality?: number; // 1-10
  };
}

export interface GenerationResponse {
  generatedContent: string;
  personaAlignmentScore: number; // 0-1
  voiceDriftAlert?: string;
  audienceSimulation?: {
    demographic: string;
    reaction: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}

export class MockBedrockProvider {
  private personas: Map<string, PersonaLayer> = new Map();

  constructor() {
    this.initializePersonas();
  }

  private initializePersonas(): void {
    // Founder Persona - Professional, Strategic, Cricket metaphors
    this.personas.set('founder', {
      id: 'founder',
      name: 'Founder',
      linguisticDNA: {
        hinglishRatio: 0.2, // 20% Hinglish for professional contexts
        cadence: 'high',
        formalityLevel: 7,
        preferredMetaphors: ['cricket', 'business', 'strategy', 'hustle'],
      },
      valueConstraints: {
        coreBeliefs: ['Hard work beats talent', 'Jugaad as innovation', 'India-first mindset'],
        avoidedTopics: ['politics', 'religion'],
        riskTolerance: 'bold',
      },
      emotionalBaseline: {
        optimismLevel: 8,
        authorityLevel: 9,
      },
    });

    // Educator Persona - Nurturing, Explanatory, Accessible
    this.personas.set('educator', {
      id: 'educator',
      name: 'Educator',
      linguisticDNA: {
        hinglishRatio: 0.4, // 40% Hinglish for relatability
        cadence: 'medium',
        formalityLevel: 5,
        preferredMetaphors: ['learning', 'growth', 'journey', 'building'],
      },
      valueConstraints: {
        coreBeliefs: ['Knowledge sharing', 'Inclusive growth', 'Practical learning'],
        avoidedTopics: ['controversial subjects'],
        riskTolerance: 'moderate',
      },
      emotionalBaseline: {
        optimismLevel: 9,
        authorityLevel: 6,
      },
    });

    // Casual Persona - Friendly, Relatable, High Hinglish
    this.personas.set('casual', {
      id: 'casual',
      name: 'Casual',
      linguisticDNA: {
        hinglishRatio: 0.7, // 70% Hinglish for authenticity
        cadence: 'medium',
        formalityLevel: 3,
        preferredMetaphors: ['daily life', 'friendship', 'family', 'local culture'],
      },
      valueConstraints: {
        coreBeliefs: ['Authenticity', 'Community support', 'Simple joys'],
        avoidedTopics: ['heavy business topics'],
        riskTolerance: 'safe',
      },
      emotionalBaseline: {
        optimismLevel: 8,
        authorityLevel: 4,
      },
    });
  }

  async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    const persona = this.personas.get(request.personaId);
    if (!persona) {
      throw new Error(`Persona '${request.personaId}' not found`);
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const generatedContent = this.generatePersonaAlignedContent(request, persona);
    const alignmentScore = this.calculateAlignmentScore(generatedContent, persona);
    const voiceDriftAlert = this.checkVoiceDrift(generatedContent, persona);
    const audienceSimulation = this.simulateAudienceReaction(generatedContent, request.platform);

    return {
      generatedContent,
      personaAlignmentScore: alignmentScore,
      voiceDriftAlert,
      audienceSimulation,
    };
  }

  private generatePersonaAlignedContent(request: GenerationRequest, persona: PersonaLayer): string {
    const { personaId, platform, content } = request;

    // Demo script examples based on persona and platform
    if (personaId === 'founder') {
      if (platform === 'linkedin') {
        return this.getFounderLinkedInContent(content);
      } else if (platform === 'whatsapp') {
        return this.getFounderWhatsAppContent(content);
      }
    } else if (personaId === 'educator') {
      if (platform === 'linkedin') {
        return this.getEducatorLinkedInContent(content);
      } else if (platform === 'whatsapp') {
        return this.getEducatorWhatsAppContent(content);
      }
    } else if (personaId === 'casual') {
      if (platform === 'whatsapp') {
        return this.getCasualWhatsAppContent(content);
      } else if (platform === 'linkedin') {
        return this.getCasualLinkedInContent(content);
      }
    }

    // Fallback generic response
    return this.generateGenericResponse(content, persona, platform);
  }

  private getFounderLinkedInContent(input: string): string {
    // Based on demo script "Sixer Rule" example
    if (input.toLowerCase().includes('quarterly goals') || input.toLowerCase().includes('work hard')) {
      return "Success in Bharat isn't about quarterly spreadsheets. It's about the daily hustle on the pitch. You don't win by playing safe; you win by hitting the Sixers others are too afraid to chase. Let's get to work.";
    }
    
    if (input.toLowerCase().includes('synergy') || input.toLowerCase().includes('maximize')) {
      return "Let's hustle together and build something that matters. Real impact comes from authentic collaboration, not corporate buzzwords.";
    }

    return `Building in Bharat requires more than just strategy—it demands the courage to take calculated risks. ${input} This is our moment to create something meaningful for our community.`;
  }

  private getFounderWhatsAppContent(input: string): string {
    return `Arre boss, ${input.toLowerCase()}. But remember, success is like cricket - you need both technique and timing. Let's make it happen! 🏏`;
  }

  private getEducatorLinkedInContent(input: string): string {
    return `Learning is a journey, not a destination. ${input} Let me break this down in a way that makes sense for everyone in our community. Knowledge grows when shared! 📚`;
  }

  private getEducatorWhatsAppContent(input: string): string {
    return `Samjha kya? ${input} Step by step seekhenge, no tension. Education is about making complex things simple, hai na? 😊`;
  }

  private getCasualWhatsAppContent(input: string): string {
    // Based on demo script casual persona example
    if (input.toLowerCase().includes('quarterly') || input.toLowerCase().includes('work')) {
      return "Arre, quarter results will come and go, but the mehnat must stay constant. 😉 One Jugaad at a time, we'll reach there. Stay strong, team! 💪";
    }

    return `Yaar, ${input}. Life mein balance chahiye - thoda kaam, thoda masti. Sab kuch ho jayega, tension mat le! 😄`;
  }

  private getCasualLinkedInContent(input: string): string {
    return `Sometimes the best insights come from everyday conversations. ${input} This reminds me of what my dadi always said - simple wisdom often holds the deepest truths.`;
  }

  private generateGenericResponse(input: string, persona: PersonaLayer, platform: string): string {
    const hinglishElements = persona.linguisticDNA.hinglishRatio > 0.5 ? 
      ['yaar', 'arre', 'hai na', 'bas', 'jugaad'] : 
      ['indeed', 'certainly', 'absolutely'];
    
    const element = hinglishElements[Math.floor(Math.random() * hinglishElements.length)];
    
    return `${element}, ${input} - crafted with ${persona.name} persona for ${platform}.`;
  }

  private calculateAlignmentScore(content: string, persona: PersonaLayer): number {
    let score = 0.8; // Base score

    // Check for Hinglish ratio alignment
    const hinglishWords = ['arre', 'yaar', 'hai', 'na', 'bas', 'jugaad', 'mehnat', 'samjha', 'kya'];
    const hinglishCount = hinglishWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    const totalWords = content.split(' ').length;
    const actualHinglishRatio = hinglishCount / totalWords;
    
    // Adjust score based on Hinglish ratio alignment
    const ratioDiff = Math.abs(actualHinglishRatio - persona.linguisticDNA.hinglishRatio);
    score -= ratioDiff * 0.2;

    // Check for persona-specific metaphors
    const hasPersonaMetaphors = persona.linguisticDNA.preferredMetaphors.some(metaphor =>
      content.toLowerCase().includes(metaphor)
    );
    
    if (hasPersonaMetaphors) {
      score += 0.1;
    }

    return Math.max(0.6, Math.min(1.0, score));
  }

  private checkVoiceDrift(content: string, persona: PersonaLayer): string | undefined {
    // Check for generic AI language that violates authenticity
    const genericPhrases = [
      'maximize synergy',
      'leverage our core competencies',
      'circle back',
      'touch base',
      'low-hanging fruit'
    ];

    const foundGeneric = genericPhrases.find(phrase => 
      content.toLowerCase().includes(phrase.toLowerCase())
    );

    if (foundGeneric) {
      return `Voice Drift Alert: Phrase '${foundGeneric}' violates the 'Authentic Bharat' law. Consider using more natural language.`;
    }

    // Check for Western metaphors that should be localized
    const westernMetaphors = ['home run', 'touchdown', 'slam dunk'];
    const foundWestern = westernMetaphors.find(metaphor =>
      content.toLowerCase().includes(metaphor.toLowerCase())
    );

    if (foundWestern) {
      return `Voice Drift Alert: Western metaphor '${foundWestern}' detected. Consider using cricket or local metaphors instead.`;
    }

    return undefined;
  }

  private simulateAudienceReaction(content: string, platform: string): GenerationResponse['audienceSimulation'] {
    // Simulate different audience demographics based on demo script
    const reactions = [
      {
        demographic: 'Tier-2 Student (Indore)',
        reaction: 'Feels like a big brother giving advice.',
        sentiment: 'positive' as const,
      },
      {
        demographic: 'Tier-1 VC (Bangalore)',
        reaction: 'Appreciates the authentic Bharat perspective.',
        sentiment: 'positive' as const,
      },
      {
        demographic: 'Tech Professional (Pune)',
        reaction: 'Resonates with the practical approach.',
        sentiment: 'positive' as const,
      },
    ];

    // Return 2 random reactions for simulation
    return reactions.slice(0, 2);
  }

  async getPersona(personaId: string): Promise<PersonaLayer | null> {
    return this.personas.get(personaId) || null;
  }

  async listPersonas(): Promise<PersonaLayer[]> {
    return Array.from(this.personas.values());
  }

  // Simulate identity extraction from uploaded content
  async extractIdentityVector(content: string, mediaType?: 'text' | 'audio' | 'image'): Promise<{
    linguisticFingerprint: {
      cadence: string;
      hinglishRatio: number;
      sentimentBias: string;
      preferredPhrases: string[];
    };
    canonicalValues: string[];
    visualStyle?: string;
  }> {
    // Mock identity extraction based on demo script
    return {
      linguisticFingerprint: {
        cadence: 'High energy, confident delivery',
        hinglishRatio: 0.22,
        sentimentBias: 'Optimistic with strategic focus',
        preferredPhrases: ['Jugaad as innovation', 'Hustle on the pitch', 'Bharat-first mindset'],
      },
      canonicalValues: [
        'Hard work beats talent when talent doesn\'t work hard',
        'Innovation through resourcefulness (Jugaad)',
        'Community-first approach to business',
      ],
      visualStyle: mediaType === 'image' ? 'Vibrant/Urban Indian aesthetic' : undefined,
    };
  }
}