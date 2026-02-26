/**
 * Content Remixer Utilities
 * Rule-based text transformation for different content formats
 */

export type RemixFormat = 'twitter-thread' | 'carousel' | 'short-hook' | 'linkedin-longform';

export interface RemixedContent {
  format: RemixFormat;
  content: string;
  parts?: string[];
  metadata: {
    originalLength: number;
    remixedLength: number;
    partsCount?: number;
  };
}

/**
 * Remix content into Twitter thread format
 */
export function remixToTwitterThread(content: string): RemixedContent {
  // Split into logical sections
  const sections = splitIntoSections(content);
  const threadParts: string[] = [];

  // Add hook as first tweet
  const hook = extractOrCreateHook(content);
  threadParts.push(hook);

  // Add main content sections
  for (const section of sections) {
    const tweets = splitIntoTweets(section, 260); // Leave room for numbering
    threadParts.push(...tweets);
  }

  // Add call-to-action as last tweet
  const cta = 'What are your thoughts on this? Drop a comment below! 👇';
  threadParts.push(cta);

  // Number the tweets
  const numberedParts = threadParts.map((part, index) => 
    `${index + 1}/${threadParts.length}\n\n${part}`
  );

  return {
    format: 'twitter-thread',
    content: numberedParts.join('\n\n---\n\n'),
    parts: numberedParts,
    metadata: {
      originalLength: content.length,
      remixedLength: numberedParts.join('').length,
      partsCount: numberedParts.length,
    },
  };
}

/**
 * Remix content into carousel slides
 */
export function remixToCarousel(content: string): RemixedContent {
  const slides: string[] = [];

  // Slide 1: Title/Hook
  const hook = extractOrCreateHook(content);
  slides.push(`📱 ${hook}`);

  // Split content into key points
  const points = extractKeyPoints(content);
  
  // Slides 2-N: Key points (one per slide)
  points.forEach((point, index) => {
    slides.push(`${index + 1}. ${point}`);
  });

  // Last slide: Summary/CTA
  slides.push('💡 Key Takeaway:\n\n' + createSummary(content));

  return {
    format: 'carousel',
    content: slides.join('\n\n--- SLIDE ---\n\n'),
    parts: slides,
    metadata: {
      originalLength: content.length,
      remixedLength: slides.join('').length,
      partsCount: slides.length,
    },
  };
}

/**
 * Remix content into short hook
 */
export function remixToShortHook(content: string): RemixedContent {
  const hook = extractOrCreateHook(content);
  
  // Make it punchy and attention-grabbing
  const punchyHook = makePunchy(hook);

  return {
    format: 'short-hook',
    content: punchyHook,
    metadata: {
      originalLength: content.length,
      remixedLength: punchyHook.length,
    },
  };
}

/**
 * Remix content into LinkedIn longform
 */
export function remixToLinkedInLongform(content: string): RemixedContent {
  const parts: string[] = [];

  // Opening hook
  const hook = extractOrCreateHook(content);
  parts.push(`${hook}\n\nHere's what I learned:`);

  // Main content with proper formatting
  const sections = splitIntoSections(content);
  sections.forEach((section, index) => {
    parts.push(`\n${index + 1}. ${section}`);
  });

  // Add personal touch
  parts.push('\n\nThis has been my experience. What has yours been like?');

  // Add hashtags
  const hashtags = generateHashtags(content, 5);
  parts.push(`\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`);

  const formatted = parts.join('\n');

  return {
    format: 'linkedin-longform',
    content: formatted,
    metadata: {
      originalLength: content.length,
      remixedLength: formatted.length,
    },
  };
}

/**
 * Split content into logical sections
 */
function splitIntoSections(content: string): string[] {
  // Split by paragraphs or sentences
  const paragraphs = content.split(/\n\n+/);
  
  if (paragraphs.length > 1) {
    return paragraphs.filter(p => p.trim().length > 0);
  }

  // If no paragraphs, split by sentences
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Extract or create a hook from content
 */
function extractOrCreateHook(content: string): string {
  // Try to use first sentence as hook
  const firstSentence = content.match(/^[^.!?]+[.!?]+/)?.[0]?.trim();
  
  if (firstSentence && firstSentence.length <= 100) {
    return firstSentence;
  }

  // Create a hook from first 80 characters
  const hook = content.substring(0, 80).trim();
  return hook + (content.length > 80 ? '...' : '');
}

/**
 * Make hook punchy and attention-grabbing
 */
function makePunchy(hook: string): string {
  // Remove filler words
  let punchy = hook
    .replace(/\b(very|really|just|actually|basically)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Add emoji if appropriate
  if (!punchy.match(/[🎯💡✨📈🚀⚡]/)) {
    punchy = `💡 ${punchy}`;
  }

  return punchy;
}

/**
 * Extract key points from content
 */
function extractKeyPoints(content: string): string[] {
  const sections = splitIntoSections(content);
  const points: string[] = [];

  for (const section of sections) {
    // Take first sentence of each section as key point
    const firstSentence = section.match(/^[^.!?]+[.!?]+/)?.[0]?.trim();
    if (firstSentence) {
      points.push(firstSentence);
    } else if (section.length <= 150) {
      points.push(section);
    }
  }

  // Limit to 5 key points
  return points.slice(0, 5);
}

/**
 * Create summary from content
 */
function createSummary(content: string): string {
  // Use last sentence or create summary from first 100 chars
  const lastSentence = content.match(/[^.!?]+[.!?]+$/)?.[0]?.trim();
  
  if (lastSentence && lastSentence.length <= 150) {
    return lastSentence;
  }

  const summary = content.substring(0, 100).trim();
  return summary + (content.length > 100 ? '...' : '');
}

/**
 * Split text into tweets
 */
function splitIntoTweets(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const tweets: string[] = [];
  let currentTweet = '';

  for (const word of words) {
    if ((currentTweet + ' ' + word).length <= maxLength) {
      currentTweet += (currentTweet ? ' ' : '') + word;
    } else {
      if (currentTweet) tweets.push(currentTweet);
      currentTweet = word;
    }
  }

  if (currentTweet) tweets.push(currentTweet);
  return tweets;
}

/**
 * Generate hashtags from content
 */
function generateHashtags(content: string, count: number): string[] {
  const keywords = [
    'Content', 'Learning', 'Growth', 'Business', 'Leadership',
    'Innovation', 'Strategy', 'Success', 'Productivity', 'Mindset'
  ];

  const contentLower = content.toLowerCase();
  const relevant = keywords.filter(keyword => 
    contentLower.includes(keyword.toLowerCase())
  );

  // Fill with generic hashtags if needed
  while (relevant.length < count && keywords.length > relevant.length) {
    const remaining = keywords.filter(k => !relevant.includes(k));
    if (remaining.length > 0) {
      relevant.push(remaining[0]);
    } else {
      break;
    }
  }

  return relevant.slice(0, count);
}
