/**
 * Image Export Utilities
 * Client-side HTML to canvas conversion for content export
 */

export type ExportFormat = 'instagram-square' | 'quote-card' | 'carousel';

export interface ExportOptions {
  format: ExportFormat;
  content: string;
  personaName?: string;
  theme?: 'light' | 'dark';
}

/**
 * Convert HTML content to canvas and download as PNG
 */
export async function exportAsImage(options: ExportOptions): Promise<void> {
  const { format, content, personaName = 'PersonaVerse', theme = 'light' } = options;

  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  try {
    // Generate HTML based on format
    const html = generateExportHTML(format, content, personaName, theme);
    container.innerHTML = html;

    // Wait for fonts and styles to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use html2canvas if available, otherwise use basic canvas
    const canvas = await htmlToCanvas(container.firstChild as HTMLElement);
    
    // Download the image
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, `${format}-${Date.now()}.png`);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generate HTML for different export formats
 */
function generateExportHTML(
  format: ExportFormat,
  content: string,
  personaName: string,
  theme: 'light' | 'dark'
): string {
  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = theme === 'dark' ? '#f3f4f6' : '#111827';
  const accentColor = '#6366f1';

  switch (format) {
    case 'instagram-square':
      return `
        <div style="
          width: 1080px;
          height: 1080px;
          background: ${bgColor};
          padding: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        ">
          <div style="
            font-size: 48px;
            font-weight: 700;
            color: ${textColor};
            text-align: center;
            line-height: 1.4;
            margin-bottom: 60px;
          ">
            ${escapeHtml(content.substring(0, 200))}
          </div>
          <div style="
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #f97316, #10b981);
            margin: 40px 0;
          "></div>
          <div style="
            font-size: 32px;
            font-weight: 600;
            color: ${accentColor};
          ">
            ${escapeHtml(personaName)}
          </div>
        </div>
      `;

    case 'quote-card':
      return `
        <div style="
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, ${bgColor} 0%, ${theme === 'dark' ? '#374151' : '#f3f4f6'} 100%);
          padding: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          position: relative;
        ">
          <div style="
            font-size: 64px;
            color: ${accentColor};
            opacity: 0.2;
            position: absolute;
            top: 40px;
            left: 60px;
          ">"</div>
          <div style="
            font-size: 42px;
            font-weight: 600;
            color: ${textColor};
            line-height: 1.5;
            margin-bottom: 40px;
            text-align: center;
          ">
            ${escapeHtml(content.substring(0, 150))}
          </div>
          <div style="
            font-size: 28px;
            font-weight: 500;
            color: ${accentColor};
            text-align: center;
          ">
            — ${escapeHtml(personaName)}
          </div>
        </div>
      `;

    case 'carousel':
      // Split content into chunks for carousel
      const chunks = splitIntoChunks(content, 150);
      const chunk = chunks[0]; // For now, export first slide
      return `
        <div style="
          width: 1080px;
          height: 1080px;
          background: ${bgColor};
          padding: 100px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        ">
          <div style="
            font-size: 52px;
            font-weight: 700;
            color: ${textColor};
            line-height: 1.4;
          ">
            ${escapeHtml(chunk)}
          </div>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div style="
              font-size: 28px;
              font-weight: 600;
              color: ${accentColor};
            ">
              ${escapeHtml(personaName)}
            </div>
            <div style="
              font-size: 24px;
              color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
            ">
              1/${chunks.length}
            </div>
          </div>
        </div>
      `;

    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

/**
 * Basic HTML to canvas conversion (fallback)
 */
async function htmlToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  // Try to use html2canvas if available
  if (typeof (window as any).html2canvas === 'function') {
    return (window as any).html2canvas(element, {
      backgroundColor: null,
      scale: 2,
    });
  }

  // Fallback: basic canvas rendering
  const canvas = document.createElement('canvas');
  const rect = element.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // Draw background
  ctx.fillStyle = window.getComputedStyle(element).backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, rect.width, rect.height);

  // Note: This is a simplified fallback. For production, use html2canvas library
  return canvas;
}

/**
 * Convert canvas to blob
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Split text into chunks
 */
function splitIntoChunks(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + ' ' + word).length <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + word;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}
