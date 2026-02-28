import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
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
  app.use(cookieParser());
  
  // Serve static files from public directory
  app.use(express.static('public'));
  
  // CORS for frontend (Bharat-first: support local development)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });

  // Mount routes
  const routesAdapter = new RoutesAdapter(config);
  app.use('/api', routesAdapter.getRouter());

  // Mount workflow tools routes (non-destructive addition)
  try {
    console.log('[Server] Attempting to load Workflow Intelligence Tools...');
    const workflowModule = require('../workflow_tools');
    console.log('[Server] Module loaded, exports:', Object.keys(workflowModule));
    
    const { createWorkflowToolsRouter } = workflowModule;
    if (!createWorkflowToolsRouter) {
      throw new Error('createWorkflowToolsRouter function not found in module');
    }
    
    const workflowRouter = createWorkflowToolsRouter();
    app.use('/tools', workflowRouter);
    console.log('✓ Workflow Intelligence Tools loaded successfully');
  } catch (error) {
    console.error('❌ Workflow Intelligence Tools failed to load:');
    console.error(error);
    console.log('ℹ Workflow Intelligence Tools not available (optional module)');
  }

  // Mount voice-to-text routes (non-destructive addition)
  try {
    console.log('[Server] Attempting to load Voice-to-Text Service...');
    const { createVoiceToTextRouter } = require('./voiceToTextRoutes');
    const voiceRouter = createVoiceToTextRouter();
    app.use('/voice', voiceRouter);
    console.log('✓ Voice-to-Text Service loaded successfully');
  } catch (error) {
    console.error('❌ Voice-to-Text Service failed to load:');
    console.error(error);
    console.log('ℹ Voice-to-Text Service not available (optional module)');
  }

  // Mount AWS-powered routes (production features)
  try {
    console.log('[Server] Attempting to load AWS Services...');
    const awsRoutes = require('./awsRoutes').default;
    app.use('/aws', awsRoutes);
    console.log('✓ AWS Services loaded successfully');
  } catch (error) {
    console.error('❌ AWS Services failed to load:');
    console.error(error);
    console.log('ℹ AWS Services not available (check AWS credentials in .env)');
  }

  // Mount authentication routes
  try {
    console.log('[Server] Attempting to load Authentication Service...');
    const authRoutes = require('./authRoutes').default;
    app.use('/api/auth', authRoutes);
    console.log('✓ Authentication Service loaded successfully');
  } catch (error) {
    console.error('❌ Authentication Service failed to load:');
    console.error(error);
    console.log('ℹ Authentication Service not available');
  }

  // Mount calendar routes
  try {
    console.log('[Server] Attempting to load Calendar Service...');
    const calendarRoutes = require('./calendarRoutes').default;
    app.use('/api/calendar', calendarRoutes);
    console.log('✓ Calendar Service loaded successfully');
  } catch (error) {
    console.error('❌ Calendar Service failed to load:');
    console.error(error);
    console.log('ℹ Calendar Service not available');
  }

  // Initialize Email and Scheduler Services
  try {
    console.log('[Server] Attempting to load Email & Scheduler Services...');
    const { emailService } = require('../services/email/emailService');
    const { schedulerService } = require('../services/email/schedulerService');
    
    // Test email connection
    emailService.testConnection().then((connected: boolean) => {
      if (connected) {
        console.log('✓ Email Service connected and ready');
      } else {
        console.log('ℹ Email Service configured but not connected (check credentials)');
      }
    });
    
    console.log('✓ Email & Scheduler Services loaded successfully');
  } catch (error) {
    console.error('❌ Email & Scheduler Services failed to load:');
    console.error(error);
    console.log('ℹ Email & Scheduler Services not available');
  }

  // Mount email test routes (development only)
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('[Server] Attempting to load Email Test Routes...');
      const emailTestRoutes = require('./emailTestRoutes').default;
      app.use('/test/email', emailTestRoutes);
      console.log('✓ Email Test Routes loaded successfully');
    } catch (error) {
      console.error('❌ Email Test Routes failed to load:');
      console.error(error);
      console.log('ℹ Email Test Routes not available');
    }
  }

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
