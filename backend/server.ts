/**
 * PersonaVerse Adaptive Intelligence Server
 * 
 * This server provides both legacy and adaptive endpoints for content generation.
 * It implements the non-destructive upgrade pattern, maintaining full backward
 * compatibility while adding new adaptive intelligence features.
 * 
 * Architecture:
 * - Stateless design (ready for AWS Lambda deployment)
 * - Mock-based Bedrock integration (credit discipline)
 * - File-based memory system (no database dependencies)
 * - Dual API endpoints (legacy + adaptive)
 */

import { createApp } from './api/routesAdapter';
import { AdaptiveConfig } from './shared/adaptive.types';
import * as fs from 'fs';
import * as path from 'path';

// Load configuration
const configPath = path.join(__dirname, 'config', 'adaptive.config.json');
const config: AdaptiveConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log('='.repeat(60));
console.log('PersonaVerse Adaptive Intelligence Server');
console.log('='.repeat(60));
console.log('Configuration:');
console.log(`  - Audience Engine: ${config.features.enable_audience_engine ? '✓' : '✗'}`);
console.log(`  - Domain Engine: ${config.features.enable_domain_engine ? '✓' : '✗'}`);
console.log(`  - Engagement Scoring: ${config.features.enable_engagement_scoring ? '✓' : '✗'}`);
console.log(`  - Retry Loop: ${config.features.enable_retry_loop ? '✓' : '✗'}`);
console.log(`  - Memory System: ${config.features.enable_memory_system ? '✓' : '✗'}`);
console.log(`  - Bedrock Mocks: ${config.bedrock.use_mocks ? '✓ (Credit Discipline)' : '✗ (Live)'}`);
console.log(`  - Engagement Threshold: ${config.thresholds.engagement_score_threshold}`);
console.log(`  - Max Retries: ${config.thresholds.max_retry_attempts}`);
console.log('='.repeat(60));

// Create Express app
const app = createApp(config);

// Server configuration
const PORT = process.env.PORT || 3001;

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  - Health Check: http://localhost:${PORT}/health`);
  console.log(`  - Legacy Generate: POST http://localhost:${PORT}/api/generate`);
  console.log(`  - Adaptive Generate: POST http://localhost:${PORT}/api/generate-adaptive`);
  console.log(`  - User Memory: GET http://localhost:${PORT}/api/memory/:userId`);
  console.log('\n✨ Ready for Bharat-first adaptive intelligence!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
