/**
 * Frontend service to interact with the Persona Engine API
 * This service provides a clean interface to the backend API
 */

import type {
  PersonaLayer,
  GenerationRequest,
  GenerationResponse,
  IdentityExtractionRequest,
  IdentityExtractionResponse,
  ApiResponse,
} from '@backend/shared/persona.types'

const API_BASE_URL = 'http://localhost:3001';

class PersonaService {
  private mockPersonas: PersonaLayer[] = [
    {
      id: 'founder',
      name: 'Founder Voice',
      userId: 'demo-user',
      description: 'Visionary, bold, and inspiring',
      linguisticDNA: {
        hinglishRatio: 0.3,
        cadence: 'high',
        formalityLevel: 7,
        preferredMetaphors: ['cricket', 'business', 'startup'],
        sentenceStructure: 'complex',
        vocabularyStyle: 'technical',
      },
      valueConstraints: {
        coreBeliefs: ['Innovation over tradition', 'Move fast and build', 'Bharat-first mindset'],
        avoidedTopics: ['Politics', 'Religion'],
        riskTolerance: 'bold',
        culturalAlignment: 'bharat-first',
      },
      emotionalBaseline: {
        optimismLevel: 9,
        authorityLevel: 8,
        enthusiasmLevel: 9,
        empathyLevel: 7,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'educator',
      name: 'Educator Voice',
      userId: 'demo-user',
      description: 'Patient, clear, and encouraging',
      linguisticDNA: {
        hinglishRatio: 0.5,
        cadence: 'medium',
        formalityLevel: 6,
        preferredMetaphors: ['learning', 'journey', 'growth'],
        sentenceStructure: 'simple',
        vocabularyStyle: 'conversational',
      },
      valueConstraints: {
        coreBeliefs: ['Learning is a journey', 'Everyone can grow', 'Knowledge should be accessible'],
        avoidedTopics: ['Controversial politics'],
        riskTolerance: 'safe',
        culturalAlignment: 'bharat-first',
      },
      emotionalBaseline: {
        optimismLevel: 8,
        authorityLevel: 7,
        enthusiasmLevel: 7,
        empathyLevel: 9,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'friend',
      name: 'Friend Voice',
      userId: 'demo-user',
      description: 'Casual, warm, and relatable',
      linguisticDNA: {
        hinglishRatio: 0.7,
        cadence: 'medium',
        formalityLevel: 3,
        preferredMetaphors: ['cricket', 'movies', 'food'],
        sentenceStructure: 'simple',
        vocabularyStyle: 'street',
      },
      valueConstraints: {
        coreBeliefs: ['Authenticity matters', 'Real talk only', 'Community first'],
        avoidedTopics: ['Corporate jargon'],
        riskTolerance: 'moderate',
        culturalAlignment: 'regional',
      },
      emotionalBaseline: {
        optimismLevel: 8,
        authorityLevel: 5,
        enthusiasmLevel: 8,
        empathyLevel: 9,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async getPersonas(): Promise<PersonaLayer[]> {
    // Return mock personas (backend doesn't have a list endpoint yet)
    return this.mockPersonas;
  }

  async getPersona(personaId: string): Promise<PersonaLayer | null> {
    // Return mock persona (backend doesn't have a get endpoint yet)
    return this.mockPersonas.find(p => p.id === personaId) || null;
  }

  async generateContent(request: Omit<GenerationRequest, 'userId'>): Promise<GenerationResponse> {
    try {
      // Call backend API
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          ...request,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Generation failed');
      }

      return data.data;
    } catch (error) {
      console.error('[PersonaService] Generation failed:', error);
      throw error;
    }
  }

  async extractIdentity(request: Omit<IdentityExtractionRequest, 'userId'>): Promise<IdentityExtractionResponse> {
    // Mock implementation (backend doesn't have this endpoint yet)
    return {
      extractionId: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      linguisticFingerprint: {
        cadence: 'conversational',
        hinglishRatio: 0.5,
        sentimentBias: 'neutral',
        preferredPhrases: ['basically', 'actually', 'you know'],
        vocabularyComplexity: 'moderate',
        culturalMarkers: ['Bharat-centric', 'Cricket metaphors', 'Jugaad philosophy'],
      },
      canonicalValues: ['Authenticity', 'Innovation', 'Community'],
      visualStyle: {
        aestheticType: 'modern',
        colorPalette: ['#FF6B35', '#004E89', '#1A936F'],
        styleKeywords: ['vibrant', 'urban', 'authentic'],
      },
      confidence: {
        linguistic: 0.87,
        values: 0.82,
        visual: 0.79,
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        processingTimeMs: 200,
        contentLength: request.content.length,
      },
    };
  }

  async simulateAudience(content: string, platform: string) {
    // Mock audience simulation
    return [
      {
        demographic: 'Tier-2 Student (Indore)',
        reaction: 'Feels authentic and relatable',
        sentiment: 'positive' as const,
        confidence: 0.88,
        culturalResonance: 0.92,
      },
      {
        demographic: 'Tier-1 Professional (Bangalore)',
        reaction: 'Appreciates the Bharat-first perspective',
        sentiment: 'positive' as const,
        confidence: 0.85,
        culturalResonance: 0.87,
      },
    ];
  }
}

export const personaService = new PersonaService()