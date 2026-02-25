import express, { Request, Response } from 'express';
import { PersonaService } from '../services/persona-engine/personaService';
import { AdaptiveWrapper } from '../engines/adaptiveWrapper';
import { UserMemory } from '../memory/userMemory';
import { AdaptiveConfig } from '../shared/adaptive.types';
import { GenerationRequest } from '../shared/persona.types';

/**
 * API Adapter - Routing layer for legacy and adaptive endpoints
 * 
 * This adapter exposes both legacy and adaptive endpoints while maintaining
 * zero business logic (pure routing). This ensures backward compatibility
 * while enabling new adaptive features.
 * 
 * Endpoints:
 * - POST /generate - Legacy endpoint (routes to Core_Engine directly)
 * - POST /generate-adaptive - Adaptive endpoint (routes to Adaptive_Wrapper)
 * - GET /memory/:userId - Memory retrieval endpoint
 */
export class RoutesAdapter {
  private router: express.Router;
  private coreEngine: PersonaService;
  private adaptiveWrapper: AdaptiveWrapper;
  private userMemory: UserMemory;

  constructor(config: AdaptiveConfig) {
    this.router = express.Router();
    this.coreEngine = new PersonaService();
    this.adaptiveWrapper = new AdaptiveWrapper(config);
    this.userMemory = new UserMemory();
    
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Legacy endpoint - routes directly to Core_Engine
    this.router.post('/generate', this.handleLegacyGenerate.bind(this));

    // Adaptive endpoint - routes to Adaptive_Wrapper
    this.router.post('/generate-adaptive', this.handleAdaptiveGenerate.bind(this));

    // Memory endpoint - retrieves user profile
    this.router.get('/memory/:userId', this.handleGetMemory.bind(this));
  }

  /**
   * POST /generate - Legacy generation endpoint
   * 
   * Routes directly to Core_Engine without any intelligence layer processing.
   * Maintains complete backward compatibility with existing frontend.
   */
  private async handleLegacyGenerate(req: Request, res: Response): Promise<void> {
    try {
      const request: GenerationRequest = req.body;
      
      // Validate required fields
      if (!request.userId || !request.personaId || !request.platform || !request.content) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: userId, personaId, platform, content',
          },
        });
        return;
      }

      console.log(`[API] Legacy generation request from user: ${request.userId}`);

      // Route directly to Core_Engine (no intelligence layers)
      const response = await this.coreEngine.generateContent(request);
      
      res.status(200).json(response);

    } catch (error) {
      console.error('[API] Legacy generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: errorMessage,
        },
      });
    }
  }

  /**
   * POST /generate-adaptive - Adaptive generation endpoint
   * 
   * Routes to Adaptive_Wrapper which orchestrates all intelligence layers.
   * Provides enhanced generation with audience analysis, domain strategy,
   * engagement scoring, and memory learning.
   */
  private async handleAdaptiveGenerate(req: Request, res: Response): Promise<void> {
    try {
      const { userId, personaId, platform, prompt, domain, userMessage } = req.body;
      
      // Validate required fields
      if (!userId || !personaId || !platform || !prompt || !domain) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing required fields: userId, personaId, platform, prompt, domain',
          },
        });
        return;
      }

      console.log(`[API] Adaptive generation request from user: ${userId}, domain: ${domain}`);

      // Route to Adaptive_Wrapper
      const response = await this.adaptiveWrapper.generateContentAdaptive({
        userId,
        personaId,
        platform,
        prompt,
        domain,
        userMessage,
      });
      
      res.status(200).json({
        success: true,
        data: response,
      });

    } catch (error) {
      console.error('[API] Adaptive generation error:', error);
      const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'ADAPTIVE_GENERATION_FAILED';
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorDetails = error instanceof Error && 'details' in error ? (error as any).details : undefined;
      
      res.status(500).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          details: errorDetails,
        },
      });
    }
  }

  /**
   * GET /memory/:userId - Retrieve user profile
   * 
   * Returns stored user profile including preferences, domain usage,
   * and historical summaries. This enables the frontend to display
   * learning progress and personalization insights.
   */
  private async handleGetMemory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing userId parameter',
          },
        });
        return;
      }

      console.log(`[API] Memory retrieval request for user: ${userId}`);

      const profile = await this.userMemory.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: profile,
      });

    } catch (error) {
      console.error('[API] Memory retrieval error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({
        success: false,
        error: {
          code: 'MEMORY_RETRIEVAL_FAILED',
          message: errorMessage,
        },
      });
    }
  }

  public getRouter(): express.Router {
    return this.router;
  }
}

/**
 * Express app setup with routes
 * 
 * Creates a stateless Express application with CORS support
 * for frontend access and health check endpoint.
 */
export function createApp(config: AdaptiveConfig): express.Application {
  const app = express();
  
  app.use(express.json());
  
  // CORS for frontend (Bharat-first: support local development)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });

  // Mount routes
  const routesAdapter = new RoutesAdapter(config);
  app.use('/api', routesAdapter.getRouter());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'PersonaVerse Adaptive Intelligence',
    });
  });

  return app;
}
