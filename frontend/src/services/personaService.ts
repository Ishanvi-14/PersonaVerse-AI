/**
 * Frontend service to interact with the mock Persona Engine
 * This service provides a clean interface to the backend mock provider
 */

import { MockBedrockProvider } from '@backend/services/persona-engine/__mocks__/bedrockProvider'
import type {
  PersonaLayer,
  GenerationRequest,
  GenerationResponse,
  IdentityExtractionRequest,
  IdentityExtractionResponse,
  ApiResponse,
} from '@backend/shared/persona.types'

class PersonaService {
  private mockProvider: MockBedrockProvider

  constructor() {
    this.mockProvider = new MockBedrockProvider()
  }

  async getPersonas(): Promise<PersonaLayer[]> {
    return await this.mockProvider.listPersonas()
  }

  async getPersona(personaId: string): Promise<PersonaLayer | null> {
    return await this.mockProvider.getPersona(personaId)
  }

  async generateContent(request: Omit<GenerationRequest, 'userId'>): Promise<GenerationResponse> {
    const mockResponse = await this.mockProvider.generateContent(request)
    
    return {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generatedContent: mockResponse.generatedContent,
      personaAlignmentScore: mockResponse.personaAlignmentScore,
      voiceDriftAlert: mockResponse.voiceDriftAlert,
      audienceSimulation: mockResponse.audienceSimulation?.map(sim => ({
        demographic: sim.demographic,
        reaction: sim.reaction,
        sentiment: sim.sentiment,
        confidence: 0.85,
        culturalResonance: 0.9,
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        processingTimeMs: 150, // Mock processing time
        modelVersion: 'mock-bedrock-v1.0',
        personaVersion: request.personaId,
      },
    }
  }

  async extractIdentity(request: Omit<IdentityExtractionRequest, 'userId'>): Promise<IdentityExtractionResponse> {
    const extraction = await this.mockProvider.extractIdentityVector(
      request.content,
      request.mediaType
    )

    return {
      extractionId: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      linguisticFingerprint: {
        cadence: extraction.linguisticFingerprint.cadence,
        hinglishRatio: extraction.linguisticFingerprint.hinglishRatio,
        sentimentBias: extraction.linguisticFingerprint.sentimentBias,
        preferredPhrases: extraction.linguisticFingerprint.preferredPhrases,
        vocabularyComplexity: 'moderate',
        culturalMarkers: ['Bharat-centric', 'Cricket metaphors', 'Jugaad philosophy'],
      },
      canonicalValues: extraction.canonicalValues,
      visualStyle: extraction.visualStyle ? {
        aestheticType: extraction.visualStyle,
        colorPalette: ['#FF6B35', '#004E89', '#1A936F'],
        styleKeywords: ['vibrant', 'urban', 'authentic'],
      } : undefined,
      confidence: {
        linguistic: 0.87,
        values: 0.82,
        visual: extraction.visualStyle ? 0.79 : undefined,
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        processingTimeMs: 200,
        contentLength: request.content.length,
      },
    }
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
    ]
  }
}

export const personaService = new PersonaService()