import * as fs from 'fs/promises';
import * as path from 'path';
import { UserProfile, GenerationSummary, SupportedDomain, AdaptiveError, AdaptiveErrorCode } from '../shared/adaptive.types';

/**
 * User Memory System - File-based learning and personalization
 * 
 * This system implements the "Identity is Persistent" principle by tracking
 * user preferences, domain usage patterns, and historical interactions.
 * Memory enables the system to learn and improve over time.
 */
export class UserMemory {
  private readonly MEMORY_FILE = path.join(__dirname, 'user_profiles.json');
  private memoryCache: Map<string, UserProfile> = new Map();
  private initialized: boolean = false;

  constructor() {
    // Async initialization will happen on first use
  }

  /**
   * Initialize memory system and load existing profiles
   */
  private async initializeMemory(): Promise<void> {
    if (this.initialized) return;

    try {
      const data = await fs.readFile(this.MEMORY_FILE, 'utf-8');
      const profiles: UserProfile[] = JSON.parse(data);
      profiles.forEach(profile => {
        this.memoryCache.set(profile.userId, profile);
      });
      console.log(`[Memory] Loaded ${profiles.length} user profiles`);
    } catch (error) {
      // File doesn't exist yet, start with empty memory
      console.log('[Memory] Initializing new memory system');
      await this.persistMemory();
    }
    
    this.initialized = true;
  }

  /**
   * Get user profile (creates default if doesn't exist)
   * 
   * This implements the learning system by maintaining persistent user state
   * that evolves over time based on interactions.
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    await this.initializeMemory();

    if (this.memoryCache.has(userId)) {
      return this.memoryCache.get(userId)!;
    }

    // Create new profile with Bharat-first defaults
    const newProfile: UserProfile = {
      userId,
      preferred_language: 'hinglish', // Default to Hinglish for Bharat
      preferred_tone: 'friendly',
      domain_usage: {
        education: 0,
        business: 0,
        finance: 0,
        health: 0,
        creator: 0,
        government: 0,
      },
      previous_summaries: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.memoryCache.set(userId, newProfile);
    await this.persistMemory();
    
    console.log(`[Memory] Created new profile for user: ${userId}`);
    return newProfile;
  }

  /**
   * Save generation to user's memory
   * 
   * This implements the learning system by tracking:
   * - Language preferences (evolves based on usage)
   * - Tone preferences (adapts to user patterns)
   * - Domain usage patterns (identifies user's focus areas)
   * - Historical summaries (maintains context for future generations)
   * 
   * This enables "Identity is Persistent" - every output reflects accumulated history.
   */
  async saveGeneration(userId: string, summary: GenerationSummary): Promise<void> {
    try {
      await this.initializeMemory();
      const profile = await this.getUserProfile(userId);

      // Update domain usage (tracks user's focus areas)
      profile.domain_usage[summary.domain]++;

      // Update preferred language (weighted towards recent usage)
      if (summary.audience_profile.language_style) {
        profile.preferred_language = summary.audience_profile.language_style;
      }

      // Update preferred tone (weighted towards recent usage)
      if (summary.audience_profile.communication_tone) {
        profile.preferred_tone = summary.audience_profile.communication_tone;
      }

      // Add to summaries (keep last 50 for context)
      profile.previous_summaries.unshift(summary);
      if (profile.previous_summaries.length > 50) {
        profile.previous_summaries = profile.previous_summaries.slice(0, 50);
      }

      profile.updated_at = new Date().toISOString();

      this.memoryCache.set(userId, profile);
      await this.persistMemory();

      console.log(`[Memory] Updated profile for ${userId}. Domain: ${summary.domain}, Score: ${summary.engagement_score}`);

    } catch (error) {
      throw new AdaptiveError(
        AdaptiveErrorCode.MEMORY_SYSTEM_FAILED,
        `Failed to save generation: ${error instanceof Error ? error.message : String(error)}`,
        { userId, summary, error }
      );
    }
  }

  /**
   * Get user's most used domain
   */
  async getMostUsedDomain(userId: string): Promise<SupportedDomain> {
    await this.initializeMemory();
    const profile = await this.getUserProfile(userId);
    const entries = Object.entries(profile.domain_usage) as [SupportedDomain, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  /**
   * Get user's average engagement score
   */
  async getAverageEngagementScore(userId: string): Promise<number> {
    await this.initializeMemory();
    const profile = await this.getUserProfile(userId);
    if (profile.previous_summaries.length === 0) return 0;

    const sum = profile.previous_summaries.reduce(
      (acc, summary) => acc + summary.engagement_score,
      0
    );
    return Math.round(sum / profile.previous_summaries.length);
  }

  /**
   * Persist memory to disk
   * 
   * File-based storage ensures simplicity and no database dependencies
   * for the hackathon demo.
   */
  private async persistMemory(): Promise<void> {
    try {
      const profiles = Array.from(this.memoryCache.values());
      const data = JSON.stringify(profiles, null, 2);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.MEMORY_FILE), { recursive: true });
      await fs.writeFile(this.MEMORY_FILE, data, 'utf-8');
    } catch (error) {
      console.error('[Memory] Failed to persist memory:', error);
      // Don't throw - memory persistence failure shouldn't break generation
    }
  }

  /**
   * Clear all memory (for testing)
   */
  async clearMemory(): Promise<void> {
    this.memoryCache.clear();
    await this.persistMemory();
    console.log('[Memory] Cleared all user profiles');
  }

  /**
   * Get all user profiles (for admin/debugging)
   */
  async getAllProfiles(): Promise<UserProfile[]> {
    await this.initializeMemory();
    return Array.from(this.memoryCache.values());
  }
}
