/**
 * User History Storage Service (DynamoDB + S3)
 * 
 * Tracks the user's "Digital Soul" evolution:
 * - Conversation history
 * - Generated content archive
 * - Persona usage patterns
 * - Language preferences
 * - Engagement metrics over time
 */

import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { dynamoDocClient, s3Client, AWS_CONFIG } from './awsConfig';
import { v4 as uuidv4 } from 'uuid';

export interface HistoryEntry {
  userId: string;
  entryId: string;
  timestamp: string;
  type: 'generation' | 'transcription' | 'translation' | 'interaction';
  personaId?: string;
  platform?: string;
  domain?: string;
  input: {
    text: string;
    language: string;
    audioUrl?: string;
  };
  output: {
    text: string;
    language: string;
    confidence?: number;
  };
  metadata: {
    engagementScore?: number;
    audienceProfile?: string;
    transcreationApplied?: boolean;
    metaphorsReplaced?: Array<{ original: string; replacement: string }>;
  };
}

export interface UserProfile {
  userId: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    defaultLanguage: string;
    preferredPersonas: string[];
    culturalContext: 'urban' | 'tier2' | 'rural';
  };
  statistics: {
    totalGenerations: number;
    totalTranscriptions: number;
    totalTranslations: number;
    languageUsage: Record<string, number>;
    personaUsage: Record<string, number>;
    platformUsage: Record<string, number>;
    avgEngagementScore: number;
  };
  personaEvolution: {
    linguisticDNA: {
      sentenceComplexity: number;
      hinglishRatio: number;
      preferredIdioms: string[];
    };
    valueConstraints: {
      topicsAvoided: string[];
      topicsPreferred: string[];
      riskTolerance: 'safe' | 'moderate' | 'bold';
    };
    emotionalBaseline: {
      optimismScore: number;
      authorityScore: number;
      relatabilityScore: number;
    };
  };
}

/**
 * Save history entry to DynamoDB
 */
export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  try {
    await dynamoDocClient.send(
      new PutCommand({
        TableName: AWS_CONFIG.dynamodb.historyTable,
        Item: {
          ...entry,
          ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year retention
        }
      })
    );

    console.log(`[History] Saved entry ${entry.entryId} for user ${entry.userId}`);
  } catch (error) {
    console.error('[History] Failed to save entry:', error);
    throw error;
  }
}

/**
 * Get user history (paginated)
 */
export async function getUserHistory(
  userId: string,
  limit: number = 50,
  lastEvaluatedKey?: any
): Promise<{ entries: HistoryEntry[]; lastKey?: any }> {
  try {
    const response = await dynamoDocClient.send(
      new QueryCommand({
        TableName: AWS_CONFIG.dynamodb.historyTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false, // Most recent first
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey
      })
    );

    return {
      entries: (response.Items || []) as HistoryEntry[],
      lastKey: response.LastEvaluatedKey
    };
  } catch (error) {
    console.error('[History] Failed to get user history:', error);
    return { entries: [] };
  }
}

/**
 * Get or create user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const response = await dynamoDocClient.send(
      new GetCommand({
        TableName: AWS_CONFIG.dynamodb.personasTable,
        Key: { userId }
      })
    );

    if (response.Item) {
      return response.Item as UserProfile;
    }

    // Create new profile
    const newProfile: UserProfile = {
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        defaultLanguage: 'en',
        preferredPersonas: [],
        culturalContext: 'urban'
      },
      statistics: {
        totalGenerations: 0,
        totalTranscriptions: 0,
        totalTranslations: 0,
        languageUsage: {},
        personaUsage: {},
        platformUsage: {},
        avgEngagementScore: 0
      },
      personaEvolution: {
        linguisticDNA: {
          sentenceComplexity: 0.5,
          hinglishRatio: 0.3,
          preferredIdioms: []
        },
        valueConstraints: {
          topicsAvoided: [],
          topicsPreferred: [],
          riskTolerance: 'moderate'
        },
        emotionalBaseline: {
          optimismScore: 0.7,
          authorityScore: 0.5,
          relatabilityScore: 0.8
        }
      }
    };

    await dynamoDocClient.send(
      new PutCommand({
        TableName: AWS_CONFIG.dynamodb.personasTable,
        Item: newProfile
      })
    );

    console.log(`[History] Created new profile for user ${userId}`);
    return newProfile;

  } catch (error) {
    console.error('[History] Failed to get/create profile:', error);
    throw error;
  }
}

/**
 * Update user profile statistics
 */
export async function updateUserStatistics(
  userId: string,
  updates: {
    type: 'generation' | 'transcription' | 'translation';
    language?: string;
    personaId?: string;
    platform?: string;
    engagementScore?: number;
  }
): Promise<void> {
  try {
    const profile = await getUserProfile(userId);

    // Update counters
    if (updates.type === 'generation') profile.statistics.totalGenerations++;
    if (updates.type === 'transcription') profile.statistics.totalTranscriptions++;
    if (updates.type === 'translation') profile.statistics.totalTranslations++;

    // Update usage maps
    if (updates.language) {
      profile.statistics.languageUsage[updates.language] = 
        (profile.statistics.languageUsage[updates.language] || 0) + 1;
    }
    if (updates.personaId) {
      profile.statistics.personaUsage[updates.personaId] = 
        (profile.statistics.personaUsage[updates.personaId] || 0) + 1;
    }
    if (updates.platform) {
      profile.statistics.platformUsage[updates.platform] = 
        (profile.statistics.platformUsage[updates.platform] || 0) + 1;
    }

    // Update average engagement score
    if (updates.engagementScore !== undefined) {
      const total = profile.statistics.totalGenerations;
      profile.statistics.avgEngagementScore = 
        (profile.statistics.avgEngagementScore * (total - 1) + updates.engagementScore) / total;
    }

    profile.updatedAt = new Date().toISOString();

    await dynamoDocClient.send(
      new PutCommand({
        TableName: AWS_CONFIG.dynamodb.personasTable,
        Item: profile
      })
    );

    console.log(`[History] Updated statistics for user ${userId}`);
  } catch (error) {
    console.error('[History] Failed to update statistics:', error);
  }
}

/**
 * Store large content in S3 (for content > 400KB)
 */
export async function storeContentInS3(
  userId: string,
  content: string,
  metadata: Record<string, string>
): Promise<string> {
  const key = `${AWS_CONFIG.s3.historyPrefix}${userId}/${uuidv4()}.json`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: AWS_CONFIG.s3.bucketName,
      Key: key,
      Body: JSON.stringify({ content, metadata }),
      ContentType: 'application/json',
      Metadata: {
        userId,
        ...metadata,
        storedAt: new Date().toISOString()
      }
    })
  );

  return `s3://${AWS_CONFIG.s3.bucketName}/${key}`;
}

/**
 * Track persona evolution over time
 */
export async function trackPersonaEvolution(
  userId: string,
  generatedText: string,
  metadata: {
    hinglishDetected: boolean;
    complexityScore: number;
    emotionalTone: string;
  }
): Promise<void> {
  try {
    const profile = await getUserProfile(userId);

    // Update linguistic DNA
    const alpha = 0.1; // Learning rate
    profile.personaEvolution.linguisticDNA.sentenceComplexity = 
      (1 - alpha) * profile.personaEvolution.linguisticDNA.sentenceComplexity + 
      alpha * metadata.complexityScore;

    if (metadata.hinglishDetected) {
      profile.personaEvolution.linguisticDNA.hinglishRatio = 
        Math.min(0.7, profile.personaEvolution.linguisticDNA.hinglishRatio + 0.05);
    }

    // Update emotional baseline based on tone
    if (metadata.emotionalTone === 'optimistic') {
      profile.personaEvolution.emotionalBaseline.optimismScore += 0.02;
    } else if (metadata.emotionalTone === 'authoritative') {
      profile.personaEvolution.emotionalBaseline.authorityScore += 0.02;
    }

    profile.updatedAt = new Date().toISOString();

    await dynamoDocClient.send(
      new PutCommand({
        TableName: AWS_CONFIG.dynamodb.personasTable,
        Item: profile
      })
    );

    console.log(`[History] Tracked persona evolution for user ${userId}`);
  } catch (error) {
    console.error('[History] Failed to track evolution:', error);
  }
}

/**
 * Save content generation to history (simplified interface for frontend)
 */
export async function saveToHistory(data: {
  userId: string;
  personaId: string;
  platform: string;
  inputContent: string;
  generatedContent: string;
  personaAlignmentScore: number;
  metadata: any;
}): Promise<string> {
  const entryId = uuidv4();
  
  const historyEntry: HistoryEntry = {
    userId: data.userId,
    entryId,
    timestamp: new Date().toISOString(),
    type: 'generation',
    personaId: data.personaId,
    platform: data.platform,
    input: {
      text: data.inputContent,
      language: 'en'
    },
    output: {
      text: data.generatedContent,
      language: 'en',
      confidence: data.personaAlignmentScore
    },
    metadata: {
      engagementScore: data.personaAlignmentScore,
      ...data.metadata
    }
  };

  await saveHistoryEntry(historyEntry);
  
  // Update user statistics
  await updateUserStatistics(data.userId, {
    type: 'generation',
    language: 'en',
    personaId: data.personaId,
    platform: data.platform,
    engagementScore: data.personaAlignmentScore
  });

  console.log(`[History] Saved generation ${entryId} for user ${data.userId}`);
  return entryId;
}

/**
 * Get user's Digital Soul summary
 */
export async function getDigitalSoulSummary(userId: string): Promise<{
  profile: UserProfile;
  recentHistory: HistoryEntry[];
  insights: {
    dominantLanguage: string;
    favoritePersona: string;
    mostUsedPlatform: string;
    evolutionTrend: string;
  };
}> {
  const profile = await getUserProfile(userId);
  const { entries } = await getUserHistory(userId, 10);

  // Calculate insights
  const dominantLanguage = Object.entries(profile.statistics.languageUsage)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'en';

  const favoritePersona = Object.entries(profile.statistics.personaUsage)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

  const mostUsedPlatform = Object.entries(profile.statistics.platformUsage)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

  const evolutionTrend = profile.personaEvolution.linguisticDNA.hinglishRatio > 0.5
    ? 'Increasingly Hinglish-native'
    : 'Formal English preference';

  return {
    profile,
    recentHistory: entries,
    insights: {
      dominantLanguage,
      favoritePersona,
      mostUsedPlatform,
      evolutionTrend
    }
  };
}
