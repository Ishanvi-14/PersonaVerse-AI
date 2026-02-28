/**
 * PersonaService - Main service orchestrator
 * 
 * This service coordinates between Groq AI and the shared types
 * to provide a clean interface for the frontend and API Gateway.
 */

import { MockBedrockProvider } from './__mocks__/bedrockProvider';
import { generateWithGroq } from '../groq/groqService';
import {
  PersonaLayer,
  GenerationRequest,
  GenerationResponse,
  IdentityExtractionRequest,
  IdentityExtractionResponse,
  ApiResponse,
  PersonaErrorCode,
  PersonaError,
} from '../../shared/persona.types';

export class PersonaService {
  private bedrockProvider: MockBedrockProvider;
  private useGroq: boolean;

  constructor() {
    this.bedrockProvider = new MockBedrockProvider();
    this.useGroq = process.env.USE_GROQ === 'true' && !!process.env.GROQ_API_KEY;
    
    console.log(`[PersonaService] Using ${this.useGroq ? 'Groq AI' : 'Mock Provider'} for content generation`);
  }

  /**
   * Generate content using a specific persona
   */
  async generateContent(request: GenerationRequest): Promise<ApiResponse<GenerationResponse>> {
    try {
      const startTime = Date.now();
      
      // Validate persona exists
      const persona = await this.bedrockProvider.getPersona(request.personaId);
      if (!persona) {
        throw new PersonaError(
          PersonaErrorCode.PERSONA_NOT_FOUND,
          `Persona '${request.personaId}' not found`
        );
      }

      let generatedContent: string;
      let personaAlignmentScore: number;

      // Use Groq if available, otherwise use mock
      if (this.useGroq) {
        try {
          const groqResponse = await generateWithGroq({
            prompt: request.content,
            personaId: request.personaId,
            platform: request.platform,
            domain: 'general',
            targetLanguage: 'en',
            culturalContext: 'urban',
          });
          
          generatedContent = groqResponse.content;
          personaAlignmentScore = groqResponse.personaAlignment?.overallScore || 0.85;
        } catch (error) {
          console.error('[PersonaService] Groq generation failed, falling back to mock:', error);
          const mockResponse = await this.bedrockProvider.generateContent(request);
          generatedContent = mockResponse.generatedContent;
          personaAlignmentScore = mockResponse.personaAlignmentScore;
        }
      } else {
        // Use mock provider
        const mockResponse = await this.bedrockProvider.generateContent(request);
        generatedContent = mockResponse.generatedContent;
        personaAlignmentScore = mockResponse.personaAlignmentScore;
      }

      // Get audience simulation from mock (Groq doesn't provide this)
      const mockResponse = await this.bedrockProvider.generateContent(request);

      // Transform to API response format
      const response: GenerationResponse = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generatedContent,
        personaAlignmentScore,
        voiceDriftAlert: personaAlignmentScore < 0.7 ? 'Content may not fully align with persona voice' : undefined,
        audienceSimulation: mockResponse.audienceSimulation?.map(sim => ({
          demographic: sim.demographic,
          reaction: sim.reaction,
          sentiment: sim.sentiment,
          confidence: 0.85,
          culturalResonance: 0.9,
        })),
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          modelVersion: this.useGroq ? 'groq-llama-3.3-70b' : 'mock-bedrock-v1.0',
          personaVersion: persona.id,
        },
      };

      return {
        success: true,
        data: response,
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Extract identity from uploaded content
   */
  async extractIdentity(request: IdentityExtractionRequest): Promise<ApiResponse<IdentityExtractionResponse>> {
    try {
      const startTime = Date.now();

      // Use mock provider for identity extraction
      const extraction = await this.bedrockProvider.extractIdentityVector(
        request.content,
        
        request.mediaType
      );

      const response: IdentityExtractionResponse = {
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
          colorPalette: ['#FF6B35', '#004E89', '#1A936F'], // Mock colors
          styleKeywords: ['vibrant', 'urban', 'authentic'],
        } : undefined,
        confidence: {
          linguistic: 0.87,
          values: 0.82,
          visual: extraction.visualStyle ? 0.79 : undefined,
        },
        metadata: {
          extractedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          contentLength: request.content.length,
        },
      };

      return {
        success: true,
        data: response,
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all available personas
   */
  async getPersonas(userId: string): Promise<ApiResponse<PersonaLayer[]>> {
    try {
      const startTime = Date.now();
      const personas = await this.bedrockProvider.listPersonas();
      
      // Add user context to personas (mock implementation)
      const userPersonas = personas.map(persona => ({
        ...persona,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return {
        success: true,
        data: userPersonas,
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a specific persona by ID
   */
  async getPersona(personaId: string, userId: string): Promise<ApiResponse<PersonaLayer>> {
    try {
      const startTime = Date.now();
      const persona = await this.bedrockProvider.getPersona(personaId);
      
      if (!persona) {
        throw new PersonaError(
          PersonaErrorCode.PERSONA_NOT_FOUND,
          `Persona '${personaId}' not found`
        );
      }

      const userPersona: PersonaLayer = {
        ...persona,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: userPersona,
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Simulate audience reaction to content
   */
  async simulateAudience(content: string, platform: string): Promise<ApiResponse<any>> {
    try {
      const startTime = Date.now();
      
      // Mock audience simulation
      const simulation = [
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

      return {
        success: true,
        data: { simulation },
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse<never> {
    if (error instanceof PersonaError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        metadata: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTimeMs: 0,
        },
      };
    }

    // Generic error handling
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error,
      },
      metadata: {
        requestId: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTimeMs: 0,
      },
    };
  }
}