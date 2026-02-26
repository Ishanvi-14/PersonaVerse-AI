/**
 * Workflow Intelligence Tools - Main Entry Point
 * 
 * Provides three independent content workflow utilities:
 * - Content Simplifier
 * - Calendar Generator
 * - Gap Analyzer
 */

import express, { Router, Request, Response } from 'express';
import { loadConfig } from './config';
import { GeminiClient } from './providers/gemini.client';
import { MockProvider } from './providers/mock.provider';
import { InputValidator } from './validators/input.validator';
import { SimplifierService } from './services/simplifier.service';
import { CalendarService } from './services/calendar.service';
import { GapAnalyzerService } from './services/gap-analyzer.service';
import { JSONExporter } from './exporters/json.exporter';
import { TXTExporter } from './exporters/txt.exporter';
import { PDFExporter } from './exporters/pdf.exporter';
import { ToolError, ToolErrorCode } from './types';

/**
 * Create Workflow Tools Router
 * 
 * Sets up all routes and services for the workflow tools module.
 * This is a completely isolated module that doesn't modify existing code.
 * 
 * @returns Express router with all workflow tool routes
 */
export function createWorkflowToolsRouter(): Router {
  const router = express.Router();
  const config = loadConfig();

  console.log('[Workflow Tools] Initializing router...');

  // Initialize services
  const geminiClient = new GeminiClient(config.gemini.apiKey, config.gemini.model);
  const mockProvider = new MockProvider();
  const validator = new InputValidator(config.limits);

  const simplifierService = new SimplifierService(geminiClient, mockProvider, config);
  const calendarService = new CalendarService(geminiClient, mockProvider, config);
  const gapAnalyzerService = new GapAnalyzerService(geminiClient, mockProvider, config);

  const jsonExporter = new JSONExporter();
  const txtExporter = new TXTExporter();
  const pdfExporter = new PDFExporter();

  console.log('[Workflow Tools] Services initialized');

  // ============================================================================
  // POST /tools/simplify
  // ============================================================================
  router.post('/simplify', async (req: Request, res: Response) => {
    console.log('[Workflow Tools] POST /simplify called');
    const startTime = Date.now();

    try {
      // Validate input
      const validationResult = validator.validateSimplifierInput(req.body);
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          error_code: validationResult.error!.code,
          message: validationResult.error!.message,
          details: validationResult.error!.details,
          metadata: {
            timestamp: new Date().toISOString(),
            tool_name: 'content_simplifier',
          },
        });
      }

      // Process request
      const result = await simplifierService.simplify(req.body);

      // Return success response
      res.status(200).json({
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          processing_duration_ms: Date.now() - startTime,
          tool_name: 'content_simplifier',
          mock_mode: config.mock.enabled,
        },
      });

    } catch (error) {
      handleToolError(error, res, 'content_simplifier', startTime);
    }
  });

  // ============================================================================
  // POST /tools/calendar
  // ============================================================================
  router.post('/calendar', async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      // Validate input
      const validationResult = validator.validateCalendarInput(req.body);
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          error_code: validationResult.error!.code,
          message: validationResult.error!.message,
          details: validationResult.error!.details,
          metadata: {
            timestamp: new Date().toISOString(),
            tool_name: 'calendar_generator',
          },
        });
      }

      // Process request
      const result = await calendarService.generateCalendar(req.body);

      // Return success response
      res.status(200).json({
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          processing_duration_ms: Date.now() - startTime,
          tool_name: 'calendar_generator',
          mock_mode: config.mock.enabled,
        },
      });

    } catch (error) {
      handleToolError(error, res, 'calendar_generator', startTime);
    }
  });

  // ============================================================================
  // POST /tools/gap-analysis
  // ============================================================================
  router.post('/gap-analysis', async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      // Validate input
      const validationResult = validator.validateGapAnalyzerInput(req.body);
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          error_code: validationResult.error!.code,
          message: validationResult.error!.message,
          details: validationResult.error!.details,
          metadata: {
            timestamp: new Date().toISOString(),
            tool_name: 'gap_analyzer',
          },
        });
      }

      // Process request
      const result = await gapAnalyzerService.analyzeGaps(req.body);

      // Return success response
      res.status(200).json({
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          processing_duration_ms: Date.now() - startTime,
          tool_name: 'gap_analyzer',
          mock_mode: config.mock.enabled,
        },
      });

    } catch (error) {
      handleToolError(error, res, 'gap_analyzer', startTime);
    }
  });

  // ============================================================================
  // GET /tools/export/:format
  // ============================================================================
  router.get('/export/:format', async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const { format } = req.params;
      const { toolName, data } = req.query;

      // Validate format
      if (!['json', 'txt', 'pdf'].includes(format)) {
        return res.status(400).json({
          success: false,
          error_code: 'INVALID_FORMAT',
          message: 'Format must be json, txt, or pdf',
          metadata: {
            timestamp: new Date().toISOString(),
            tool_name: 'export_system',
          },
        });
      }

      // Validate required parameters
      if (!toolName || !data) {
        return res.status(400).json({
          success: false,
          error_code: 'MISSING_REQUIRED_FIELD',
          message: 'toolName and data query parameters are required',
          metadata: {
            timestamp: new Date().toISOString(),
            tool_name: 'export_system',
          },
        });
      }

      // Decode and parse data
      const decodedData = JSON.parse(
        Buffer.from(data as string, 'base64').toString('utf-8')
      );

      // Generate export
      let buffer: Buffer;
      let contentType: string;
      let filename: string;

      if (format === 'json') {
        buffer = jsonExporter.export(decodedData, toolName as string);
        contentType = 'application/json';
        filename = jsonExporter.generateFilename(toolName as string);
      } else if (format === 'txt') {
        buffer = txtExporter.export(decodedData, toolName as string);
        contentType = 'text/plain';
        filename = txtExporter.generateFilename(toolName as string);
      } else {
        buffer = pdfExporter.export(decodedData, toolName as string);
        contentType = 'application/pdf';
        filename = pdfExporter.generateFilename(toolName as string);
      }

      // Set headers and send file
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);

    } catch (error) {
      handleToolError(error, res, 'export_system', startTime);
    }
  });

  console.log('[Workflow Tools] Routes registered: /simplify, /calendar, /gap-analysis, /export/:format');

  return router;
}

// CommonJS export for compatibility
module.exports = { createWorkflowToolsRouter };

/**
 * Handle tool errors and return appropriate HTTP responses
 * 
 * @param error - The error that occurred
 * @param res - Express response object
 * @param toolName - Name of the tool
 * @param startTime - Request start time
 */
function handleToolError(error: unknown, res: Response, toolName: string, startTime: number): void {
  console.error(`[${toolName}] Error:`, error);

  if (error instanceof ToolError) {
    const statusCode = getStatusCodeForError(error.code);

    res.status(statusCode).json({
      success: false,
      error_code: error.code,
      message: error.message,
      details: error.details,
      metadata: {
        timestamp: new Date().toISOString(),
        tool_name: toolName,
        processing_duration_ms: Date.now() - startTime,
      },
    });
  } else {
    res.status(500).json({
      success: false,
      error_code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      metadata: {
        timestamp: new Date().toISOString(),
        tool_name: toolName,
        processing_duration_ms: Date.now() - startTime,
      },
    });
  }
}

/**
 * Map error codes to HTTP status codes
 * 
 * @param errorCode - Tool error code
 * @returns HTTP status code
 */
function getStatusCodeForError(errorCode: ToolErrorCode): number {
  const statusMap: Record<string, number> = {
    'INVALID_INPUT': 400,
    'INPUT_TOO_SHORT': 400,
    'INPUT_TOO_LONG': 400,
    'FILE_TOO_LARGE': 400,
    'UNSUPPORTED_FILE_TYPE': 400,
    'INSUFFICIENT_POSTS': 400,
    'TOO_MANY_POSTS': 400,
    'MISSING_REQUIRED_FIELD': 400,
    'MISSING_API_KEY': 401,
    'INVALID_API_KEY': 401,
    'RATE_LIMIT_EXCEEDED': 429,
    'PROCESSING_TIMEOUT': 504,
    'GEMINI_API_ERROR': 500,
    'EXPORT_GENERATION_FAILED': 500,
    'INTERNAL_ERROR': 500,
  };

  return statusMap[errorCode] || 500;
}
