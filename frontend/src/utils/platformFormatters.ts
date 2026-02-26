/**
 * Platform Formatting Utilities
 * Format content for different social media platforms
 */

export type Platform = 'linkedin' | 'twitter' | 'instagram';

export interface FormattedContent {
  text: string;
  platform: Platform;
  characterCount: number;
  isThread?: boolean;
  threadParts?: string[];
}

/**
 * Format content for LinkedIn
 */
export function formatForLinkedIn(content: string): FormattedContent {
  // LinkedIn allows up to 3000 characters
  let formatted = content;

  // Add paragraph spacing for readability
  formatted = formatted.replace(/\n/g, '\n\n');

  // Extract or generate relevant hashtags
  const hashtags = extractOrGenerateHashtags(content, 3);
  
  // Add hashtags at bottom
  if (hashtags.length > 0) {
    formatted += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
  }

  return {
    text: formatted,
    platform: 'linkedin',
    characterCount: formatted.length,
  };
}

/**
 * Format content for Twitter
 */
export function formatForTwitter(content: string): FormattedContent {
  const maxLength = 280;
  
  // If content fits in one tweet
  if (content.length <= maxLength) {
    return {
      text: content,
      platform: 'twitter',
      characterCount: content.length,
      isThread: false,
    };
  }

  // Split into thread
  const threadParts = splitIntoTwitterThread(content, maxLength);
  
  return {
    text: threadParts.join('\n\n---\n\n'),
    platform: 'twitter',
    characterCount: content.length,
    isThread: true,
    threadParts,
  };
}

/**
 * Format content for Instagram
 */
export function formatForInstagram(content: string): FormattedContent {
  let formatted = content;

  // Add emoji-enhanced spacing
  formatted = addEmojiSpacing(formatted);

  // Add line breaks for readability
  formatted = formatted.replace(/\. /g, '.\n\n');

  // Extract or generate hashtags
  const hashtags = extractOrGenerateHashtags(content, 10);
  
  // Add hashtags at bottom with line break
  if (hashtags.length > 0) {
    formatted += '\n\n.\n.\n.\n' + hashtags.map(tag => `#${tag}`).join(' ');
  }

  return {
    text: formatted,
    platform: 'instagram',
    characterCount: formatted.length,
  };
}

/**
 * Split content into Twitter thread
 */
function splitIntoTwitterThread(content: string, maxLength: number): string[] {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const threadParts: string[] = [];
  let currentPart = '';
  let partNumber = 1;

  for (const sentence of sentences) {
    const numberPrefix = `${partNumber}/`;
    const testPart = currentPart + (currentPart ? ' ' : '') + sentence;
    
    // Reserve space for numbering (e.g., "1/5 ")
    const maxPartLength = maxLength - 10;

    if (testPart.length <= maxPartLength) {
      currentPart = testPart;
    } else {
      if (currentPart) {
        threadParts.push(currentPart.trim());
        partNumber++;
      }
      currentPart = sentence;
    }
  }

  if (currentPart) {
    threadParts.push(currentPart.trim());
  }

  // Add numbering to each part
  const totalParts = threadParts.length;
  return threadParts.map((part, index) => `${index + 1}/${totalParts} ${part}`);
}

/**
 * Add emoji spacing for Instagram
 */
function addEmojiSpacing(content: string): string {
  // Add relevant emojis based on content keywords
  const emojiMap: Record<string, string> = {
    'success': '✨',
    'growth': '📈',
    'learn': '📚',
    'idea': '💡',
    'goal': '🎯',
    'team': '👥',
    'work': '💼',
    'time': '⏰',
    'money': '💰',
    'love': '❤️',
    'happy': '😊',
    'celebrate': '🎉',
  };

  let formatted = content;

  // Add emojis at the start if relevant keywords found
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (content.toLowerCase().includes(keyword)) {
      formatted = `${emoji} ${formatted}`;
      break;
    }
  }

  return formatted;
}

/**
 * Extract or generate hashtags from content
 */
function extractOrGenerateHashtags(content: string, maxTags: number): string[] {
  const hashtags: string[] = [];

  // Common relevant hashtags based on content
  const keywordHashtagMap: Record<string, string[]> = {
    'business': ['Business', 'Entrepreneurship', 'Startup'],
    'growth': ['Growth', 'Success', 'Progress'],
    'learn': ['Learning', 'Education', 'Knowledge'],
    'team': ['Teamwork', 'Leadership', 'Collaboration'],
    'india': ['India', 'Bharat', 'IndianBusiness'],
    'content': ['ContentCreation', 'ContentMarketing', 'DigitalMarketing'],
    'ai': ['AI', 'ArtificialIntelligence', 'Technology'],
    'founder': ['Founder', 'CEO', 'Leadership'],
  };

  const contentLower = content.toLowerCase();

  // Find relevant hashtags
  for (const [keyword, tags] of Object.entries(keywordHashtagMap)) {
    if (contentLower.includes(keyword)) {
      hashtags.push(...tags);
      if (hashtags.length >= maxTags) break;
    }
  }

  // If no hashtags found, add generic ones
  if (hashtags.length === 0) {
    hashtags.push('Content', 'SocialMedia', 'Digital');
  }

  // Remove duplicates and limit
  return [...new Set(hashtags)].slice(0, maxTags);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
