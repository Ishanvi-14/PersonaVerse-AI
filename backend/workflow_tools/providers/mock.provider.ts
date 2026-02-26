/**
 * Mock Provider for Workflow Intelligence Tools
 * 
 * Provides REAL local processing of user input without external API calls.
 * All algorithms run locally with Bharat-first cultural awareness.
 */

import { SimplifierOutput, CalendarOutput, GapAnalysisOutput } from '../types';

/**
 * Mock Provider with Real Local Processing
 * 
 * Processes actual user input using local algorithms:
 * - Text simplification with readability analysis
 * - Calendar generation based on niche keywords
 * - Gap analysis using frequency and pattern detection
 */
export class MockProvider {
  private hinglishWords = ['yaar', 'dekho', 'samjhe', 'bas', 'achha', 'theek hai', 'arre', 'kya', 'hai', 'na', 'bhai', 'sahi'];
  private emojis = ['😊', '👍', '🎯', '💡', '✨', '🔥', '💪', '🙌', '👏', '🎉'];
  
  /**
   * Indian festivals database
   */
  private festivals = [
    { name: 'Holi', month: 3, day: 14, angle: 'colorful transformation stories, before/after content themed around colors and celebration' },
    { name: 'Diwali', month: 10, day: 24, angle: 'new beginnings, light over darkness metaphors, festive success stories' },
    { name: 'Eid', month: 4, day: 10, angle: 'community, sharing, gratitude, and celebration content' },
    { name: 'Ganesh Chaturthi', month: 9, day: 7, angle: 'new beginnings, removing obstacles, starting fresh projects' },
    { name: 'Durga Puja', month: 10, day: 3, angle: 'strength, empowerment, overcoming challenges' },
    { name: 'Raksha Bandhan', month: 8, day: 19, angle: 'relationships, protection, sibling bonds, community support' }
  ];

  /**
   * Simulate API latency
   */
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * REAL Content Simplifier - Processes actual input text
   * 
   * @param input - Original input text to simplify
   * @returns SimplifierOutput with 5 formatted versions based on actual input
   */
  async getSimplifierResponse(input: string): Promise<SimplifierOutput> {
    await this.simulateDelay(800);

    // Extract key sentences (simple algorithm)
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keySentences = sentences.slice(0, Math.min(5, sentences.length));

    // Generate grade 5 explanation
    const grade5 = this.simplifyToGrade5(input, sentences);

    // Generate bullet summary
    const bullets = this.extractBullets(keySentences);

    // Generate WhatsApp version
    const whatsapp = this.convertToWhatsApp(input, sentences);

    // Generate voice script
    const voice = this.convertToVoiceScript(sentences);

    // Generate Hinglish version
    const regional = this.convertToHinglish(input, sentences);

    return {
      grade5_explanation: grade5,
      bullet_summary: bullets,
      whatsapp_version: whatsapp,
      voice_script: voice,
      regional_version: regional
    };
  }

  /**
   * Simplify text to grade 5 reading level
   */
  private simplifyToGrade5(input: string, sentences: string[]): string {
    const firstSentences = sentences.slice(0, 3);
    const simplified = firstSentences.map(s => {
      // Replace complex words with simpler ones
      let simple = s.trim()
        .replace(/utilize|utilise/gi, 'use')
        .replace(/implement/gi, 'do')
        .replace(/facilitate/gi, 'help')
        .replace(/demonstrate/gi, 'show')
        .replace(/approximately/gi, 'about')
        .replace(/consequently/gi, 'so')
        .replace(/therefore/gi, 'so');
      return simple;
    }).join('. ');

    return `${simplified}. This is like explaining cricket to a friend - simple and clear!`;
  }

  /**
   * Extract bullet points from key sentences
   */
  private extractBullets(sentences: string[]): string[] {
    const bullets = sentences.slice(0, Math.min(5, sentences.length)).map(s => {
      const cleaned = s.trim().replace(/^(and|but|so|also)\s+/i, '');
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    });

    // Ensure at least 3 bullets
    while (bullets.length < 3) {
      bullets.push('Key point from the content');
    }

    return bullets.slice(0, 7);
  }

  /**
   * Convert to WhatsApp-style message with emojis
   */
  private convertToWhatsApp(input: string, sentences: string[]): string {
    const emoji1 = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    const emoji2 = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    
    const firstPart = sentences[0]?.trim() || input.substring(0, 100);
    const hinglish = this.hinglishWords[Math.floor(Math.random() * this.hinglishWords.length)];
    
    return `Arre ${hinglish}! ${emoji1} ${firstPart}. Makes sense na? ${emoji2} It's simple when you think about it!`;
  }

  /**
   * Convert to voice script with pauses
   */
  private convertToVoiceScript(sentences: string[]): string {
    const intro = "Hello friends. Let me share something important with you.";
    const mainPoints = sentences.slice(0, 3).map(s => s.trim()).join('. [Pause] ');
    const outro = "[Pause] So that's the key idea. Hope this helps!";
    
    return `${intro} [Pause] ${mainPoints}. ${outro}`;
  }

  /**
   * Convert to Hinglish with natural code-switching
   */
  private convertToHinglish(input: string, sentences: string[]): string {
    const word1 = this.hinglishWords[0]; // yaar
    const word2 = this.hinglishWords[1]; // dekho
    const word3 = this.hinglishWords[2]; // samjhe
    
    const firstSentence = sentences[0]?.trim() || input.substring(0, 100);
    
    return `${word2.charAt(0).toUpperCase() + word2.slice(1)} ${word1}, main concept yeh hai ki ${firstSentence}. ${word3.charAt(0).toUpperCase() + word3.slice(1)}? It's actually quite simple once you get it. Bas itna hi!`;
  }

  /**
   * REAL Calendar Generator - Creates plan based on actual niche
   * 
   * @param niche - Content niche to generate calendar for
   * @returns CalendarOutput with niche-specific weekly plan
   */
  async getCalendarResponse(niche: string): Promise<CalendarOutput> {
    await this.simulateDelay(800);

    const nicheKeywords = niche.toLowerCase();
    const contentTypes = this.inferContentTypes(nicheKeywords);
    const hooks = this.generateNicheHooks(nicheKeywords);
    const weeklyPlan = this.generateWeeklyPlan(nicheKeywords, contentTypes);
    const upcomingFestivals = this.getUpcomingFestivals();

    return {
      weekly_plan: weeklyPlan,
      post_types: contentTypes,
      hooks: hooks,
      platform_strategy: this.generatePlatformStrategy(nicheKeywords),
      best_times: [
        {
          time: "9:00 AM IST",
          reason: "Morning commute time, high engagement as people check phones"
        },
        {
          time: "1:00 PM IST",
          reason: "Lunch break scrolling, people taking a break from work"
        },
        {
          time: "8:30 PM IST",
          reason: "Evening leisure time, peak activity after dinner"
        }
      ],
      upcoming_festivals: upcomingFestivals
    };
  }

  /**
   * Infer content types from niche keywords
   */
  private inferContentTypes(niche: string): string[] {
    const types: string[] = [];
    
    if (niche.includes('tech') || niche.includes('coding') || niche.includes('developer')) {
      types.push('Technical Tutorials', 'Code Walkthroughs', 'Tech News Analysis');
    } else if (niche.includes('fitness') || niche.includes('health') || niche.includes('workout')) {
      types.push('Workout Routines', 'Nutrition Tips', 'Transformation Stories');
    } else if (niche.includes('business') || niche.includes('entrepreneur') || niche.includes('startup')) {
      types.push('Business Insights', 'Case Studies', 'Growth Strategies');
    } else if (niche.includes('food') || niche.includes('recipe') || niche.includes('cooking')) {
      types.push('Recipe Videos', 'Cooking Tips', 'Food Reviews');
    } else {
      types.push('Educational Content', 'Personal Stories', 'How-To Guides');
    }
    
    types.push('Behind-the-Scenes', 'Community Q&A');
    return types.slice(0, 5);
  }

  /**
   * Generate niche-specific hooks
   */
  private generateNicheHooks(niche: string): string[] {
    const hooks: string[] = [
      `Yaar, this changed everything for me in ${niche}...`,
      `Nobody talks about this ${niche} secret, but...`,
      `Here's the truth about ${niche} that most people miss...`,
      `3 years ago, I knew nothing about ${niche}. Today...`,
      `Stop making this ${niche} mistake immediately...`,
      `The one ${niche} thing that made all the difference...`,
      `Let me be honest about ${niche} with you...`,
      `This is what they don't tell you about ${niche}...`
    ];
    
    return hooks.slice(0, 8);
  }

  /**
   * Generate weekly plan based on niche
   */
  private generateWeeklyPlan(niche: string, contentTypes: string[]): any[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => ({
      day_name: day,
      post_idea: `Share ${contentTypes[index % contentTypes.length].toLowerCase()} related to ${niche}`,
      content_type: contentTypes[index % contentTypes.length],
      hook: `Here's something about ${niche} that will surprise you...`
    }));
  }

  /**
   * Generate platform strategy based on niche
   */
  private generatePlatformStrategy(niche: string): any {
    return {
      instagram: `For ${niche}, focus on visual storytelling with carousel posts. Use Reels for quick tips. Post during morning chai time (9-10 AM IST) and evening leisure (8-9 PM IST).`,
      linkedin: `Share professional ${niche} insights and case studies. Engage in comments. Post during work hours (10 AM - 2 PM IST) for maximum reach.`,
      youtube: `Create in-depth ${niche} tutorials and weekly vlogs. Build community through consistency. Upload on weekends when people have time to watch longer content.`
    };
  }

  /**
   * Get upcoming Indian festivals in next 30 days
   */
  private getUpcomingFestivals(): any[] {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcoming = this.festivals.filter(festival => {
      const festivalDate = new Date(2026, festival.month - 1, festival.day);
      return festivalDate >= today && festivalDate <= next30Days;
    });

    return upcoming.map(f => ({
      festival_name: f.name,
      date: `2026-${String(f.month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`,
      content_angle: f.angle
    }));
  }

  /**
   * REAL Gap Analyzer - Analyzes actual post content
   * 
   * @param posts - Array of posts to analyze
   * @returns GapAnalysisOutput with real pattern analysis
   */
  async getGapAnalysisResponse(posts: string[]): Promise<GapAnalysisOutput> {
    await this.simulateDelay(800);

    // Analyze word frequency
    const wordFreq = this.analyzeWordFrequency(posts);
    
    // Identify overused themes
    const overusedThemes = this.identifyOverusedThemes(posts, wordFreq);
    
    // Calculate diversity score
    const diversityScore = this.calculateDiversityScore(posts, wordFreq);
    
    // Determine fatigue risk
    const fatigueRisk = this.assessFatigueRisk(overusedThemes, diversityScore);
    
    // Suggest missing topics
    const missingTopics = this.suggestMissingTopics(posts, wordFreq);
    
    // Generate new angles
    const suggestedAngles = this.generateNewAngles(posts, missingTopics);

    return {
      overused_themes: overusedThemes,
      missing_topics: missingTopics,
      fatigue_risk: fatigueRisk,
      suggested_angles: suggestedAngles,
      diversity_score: diversityScore
    };
  }

  /**
   * Analyze word frequency across all posts
   */
  private analyzeWordFrequency(posts: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being']);
    
    posts.forEach(post => {
      const words = post.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w));
      words.forEach(word => {
        freq.set(word, (freq.get(word) || 0) + 1);
      });
    });
    
    return freq;
  }

  /**
   * Identify themes appearing in >30% of posts
   */
  private identifyOverusedThemes(posts: string[], wordFreq: Map<string, number>): any[] {
    const themes: any[] = [];
    const threshold = posts.length * 0.3;
    
    // Get top frequent words
    const sortedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedWords.forEach(([word, count]) => {
      if (count >= threshold) {
        const examplePosts: number[] = [];
        posts.forEach((post, index) => {
          if (post.toLowerCase().includes(word) && examplePosts.length < 4) {
            examplePosts.push(index);
          }
        });
        
        themes.push({
          theme: word.charAt(0).toUpperCase() + word.slice(1) + '-related content',
          frequency_percentage: Math.round((count / posts.length) * 100),
          example_posts: examplePosts
        });
      }
    });
    
    // Ensure at least 2 themes
    if (themes.length === 0) {
      themes.push({
        theme: 'General motivational content',
        frequency_percentage: 35,
        example_posts: [0, 1, 2]
      });
    }
    
    return themes.slice(0, 3);
  }

  /**
   * Calculate diversity score (0-100)
   */
  private calculateDiversityScore(posts: string[], wordFreq: Map<string, number>): number {
    const uniqueWords = wordFreq.size;
    const totalWords = Array.from(wordFreq.values()).reduce((a, b) => a + b, 0);
    const avgWordsPerPost = totalWords / posts.length;
    
    // Higher unique word ratio = higher diversity
    const uniqueRatio = uniqueWords / totalWords;
    const score = Math.min(100, Math.round(uniqueRatio * 200 + (avgWordsPerPost / 10)));
    
    return Math.max(20, Math.min(95, score));
  }

  /**
   * Assess fatigue risk based on patterns
   */
  private assessFatigueRisk(overusedThemes: any[], diversityScore: number): any {
    let level: 'low' | 'medium' | 'high' = 'low';
    let explanation = '';
    let recommendation = '';
    
    if (diversityScore < 40 || overusedThemes.length >= 3) {
      level = 'high';
      explanation = `You're posting very similar content repeatedly (diversity score: ${diversityScore}/100). Audience may start scrolling past without engaging.`;
      recommendation = 'Immediately diversify with different content types: educational tutorials, behind-the-scenes, community questions, and personal stories.';
    } else if (diversityScore < 60 || overusedThemes.length >= 2) {
      level = 'medium';
      explanation = `Some repetitive patterns detected (diversity score: ${diversityScore}/100). The content is becoming somewhat predictable.`;
      recommendation = 'Mix in more variety: add educational content, behind-the-scenes, and community engagement posts.';
    } else {
      level = 'low';
      explanation = `Good content variety (diversity score: ${diversityScore}/100). Audience is likely staying engaged with your diverse content.`;
      recommendation = 'Keep up the variety! Consider adding occasional experimental content to test new angles.';
    }
    
    return { level, explanation, recommendation };
  }

  /**
   * Suggest missing topics based on analysis
   */
  private suggestMissingTopics(posts: string[], wordFreq: Map<string, number>): string[] {
    const topics: string[] = [];
    const allText = posts.join(' ').toLowerCase();
    
    // Check for missing content types
    if (!allText.includes('behind') && !allText.includes('process')) {
      topics.push('Behind-the-scenes process content');
    }
    if (!allText.includes('fail') && !allText.includes('mistake') && !allText.includes('lesson')) {
      topics.push('Failure stories and lessons learned');
    }
    if (!allText.includes('question') && !allText.includes('ask') && !allText.includes('community')) {
      topics.push('Community engagement and Q&A posts');
    }
    if (!allText.includes('how') && !allText.includes('tutorial') && !allText.includes('guide')) {
      topics.push('Educational how-to guides and tutorials');
    }
    if (!allText.includes('trend') && !allText.includes('news') && !allText.includes('industry')) {
      topics.push('Industry trends and news analysis');
    }
    if (!allText.includes('collab') && !allText.includes('together') && !allText.includes('partner')) {
      topics.push('Collaborative content with others');
    }
    if (!allText.includes('day') && !allText.includes('routine') && !allText.includes('life')) {
      topics.push('Day-in-the-life and routine content');
    }
    
    // Ensure 5-10 topics
    while (topics.length < 5) {
      topics.push('Experimental content to test new angles');
    }
    
    return topics.slice(0, 10);
  }

  /**
   * Generate new content angles
   */
  private generateNewAngles(posts: string[], missingTopics: string[]): string[] {
    const angles: string[] = [
      'Share a recent failure and what you learned from it',
      'Do a Q&A post asking your audience questions',
      'Create a step-by-step tutorial on your process',
      'Share industry news with your unique perspective',
      'Post a day-in-the-life story showing your routine',
      'Collaborate with someone in your niche',
      'Share a controversial opinion (respectfully)',
      'Do a myth-busting post about common misconceptions'
    ];
    
    // Add angles based on missing topics
    missingTopics.slice(0, 2).forEach(topic => {
      angles.push(`Create content about: ${topic}`);
    });
    
    return angles.slice(0, 10);
  }
}
