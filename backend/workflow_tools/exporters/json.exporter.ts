/**
 * JSON Exporter
 * 
 * Exports tool results as formatted JSON files.
 */

/**
 * JSON Exporter
 * 
 * Generates formatted JSON files with metadata for download.
 */
export class JSONExporter {
  /**
   * Export data as JSON
   * 
   * @param data - Tool output data
   * @param toolName - Name of the tool (simplifier, calendar, gap-analyzer)
   * @returns Buffer containing formatted JSON
   */
  export(data: any, toolName: string): Buffer {
    const exportData = {
      tool: toolName,
      generated_at: new Date().toISOString(),
      data: data
    };

    const formatted = JSON.stringify(exportData, null, 2);
    return Buffer.from(formatted, 'utf-8');
  }

  /**
   * Generate filename for JSON export
   * 
   * @param toolName - Name of the tool
   * @returns Filename with timestamp
   */
  generateFilename(toolName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    return `${toolName}-${timestamp}.json`;
  }
}
