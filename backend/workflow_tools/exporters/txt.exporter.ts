/**
 * TXT Exporter
 * 
 * Exports tool results as formatted text files.
 */

import { SimplifierOutput, CalendarOutput, GapAnalysisOutput } from '../types';

/**
 * TXT Exporter
 * 
 * Generates human-readable text files with proper formatting.
 */
export class TXTExporter {
  /**
   * Export data as formatted text
   * 
   * @param data - Tool output data
   * @param toolName - Name of the tool
   * @returns Buffer containing formatted text
   */
  export(data: any, toolName: string): Buffer {
    let text = `${toolName.toUpperCase().replace(/-/g, ' ')} RESULTS\n`;
    text += `Generated: ${new Date().toISOString()}\n`;
    text += '='.repeat(60) + '\n\n';

    text += this.formatDataAsText(data, toolName);

    return Buffer.from(text, 'utf-8');
  }

  /**
   * Format data based on tool type
   * 
   * @param data - Tool output data
   * @param toolName - Name of the tool
   * @returns Formatted text string
   */
  private formatDataAsText(data: any, toolName: string): string {
    if (toolName === 'simplifier' || toolName === 'content-simplifier') {
      return this.formatSimplifierText(data as SimplifierOutput);
    } else if (toolName === 'calendar' || toolName === 'calendar-generator') {
      return this.formatCalendarText(data as CalendarOutput);
    } else if (toolName === 'gap-analyzer') {
      return this.formatGapAnalysisText(data as GapAnalysisOutput);
    }
    return JSON.stringify(data, null, 2);
  }

  /**
   * Format Simplifier output as text
   */
  private formatSimplifierText(data: SimplifierOutput): string {
    let text = 'GRADE 5 EXPLANATION:\n';
    text += data.grade5_explanation + '\n\n';

    text += 'BULLET SUMMARY:\n';
    data.bullet_summary.forEach((bullet, i) => {
      text += `${i + 1}. ${bullet}\n`;
    });
    text += '\n';

    text += 'WHATSAPP VERSION:\n';
    text += data.whatsapp_version + '\n\n';

    text += 'VOICE SCRIPT:\n';
    text += data.voice_script + '\n\n';

    text += 'REGIONAL VERSION (HINGLISH):\n';
    text += data.regional_version + '\n';

    return text;
  }

  /**
   * Format Calendar output as text
   */
  private formatCalendarText(data: CalendarOutput): string {
    let text = 'WEEKLY CONTENT PLAN:\n\n';

    data.weekly_plan.forEach(day => {
      text += `${day.day_name}:\n`;
      text += `  Idea: ${day.post_idea}\n`;
      text += `  Type: ${day.content_type}\n`;
      text += `  Hook: ${day.hook}\n\n`;
    });

    text += 'RECOMMENDED POST TYPES:\n';
    data.post_types.forEach((type, i) => {
      text += `${i + 1}. ${type}\n`;
    });
    text += '\n';

    text += 'CONTENT HOOKS:\n';
    data.hooks.forEach((hook, i) => {
      text += `${i + 1}. ${hook}\n`;
    });
    text += '\n';

    text += 'PLATFORM STRATEGY:\n';
    text += `Instagram: ${data.platform_strategy.instagram}\n`;
    text += `LinkedIn: ${data.platform_strategy.linkedin}\n`;
    text += `YouTube: ${data.platform_strategy.youtube}\n\n`;

    text += 'BEST POSTING TIMES:\n';
    data.best_times.forEach(time => {
      text += `${time.time}: ${time.reason}\n`;
    });

    if (data.upcoming_festivals && data.upcoming_festivals.length > 0) {
      text += '\nUPCOMING FESTIVALS:\n';
      data.upcoming_festivals.forEach(festival => {
        text += `${festival.festival_name} (${festival.date}): ${festival.content_angle}\n`;
      });
    }

    return text;
  }

  /**
   * Format Gap Analysis output as text
   */
  private formatGapAnalysisText(data: GapAnalysisOutput): string {
    let text = `DIVERSITY SCORE: ${data.diversity_score}/100\n\n`;

    text += `FATIGUE RISK: ${data.fatigue_risk.level.toUpperCase()}\n`;
    text += `${data.fatigue_risk.explanation}\n`;
    text += `Recommendation: ${data.fatigue_risk.recommendation}\n\n`;

    text += 'OVERUSED THEMES:\n';
    data.overused_themes.forEach(theme => {
      text += `- ${theme.theme} (${theme.frequency_percentage}% of posts)\n`;
    });
    text += '\n';

    text += 'MISSING TOPICS:\n';
    data.missing_topics.forEach((topic, i) => {
      text += `${i + 1}. ${topic}\n`;
    });
    text += '\n';

    text += 'SUGGESTED ANGLES:\n';
    data.suggested_angles.forEach((angle, i) => {
      text += `${i + 1}. ${angle}\n`;
    });

    return text;
  }

  /**
   * Generate filename for TXT export
   * 
   * @param toolName - Name of the tool
   * @returns Filename with timestamp
   */
  generateFilename(toolName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    return `${toolName}-${timestamp}.txt`;
  }
}
