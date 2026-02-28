/**
 * Email Notification Service
 * 
 * Handles email notifications for:
 * - Calendar event confirmations
 * - Scheduled content reminders
 * - User engagement notifications
 */

import nodemailer from 'nodemailer';
import { CalendarEntry } from '../calendar/calendar.service';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
    
    this.config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      },
      from: {
        name: process.env.EMAIL_FROM_NAME || 'PersonaVerse AI',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || ''
      }
    };

    if (this.enabled && this.config.auth.user && this.config.auth.pass) {
      this.initializeTransporter();
    } else {
      console.log('📧 Email service disabled or not configured');
    }
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('📧 Email service initialized successfully');
    } catch (error) {
      console.error('📧 Failed to initialize email service:', error);
      this.enabled = false;
    }
  }

  /**
   * Send calendar confirmation email
   */
  async sendCalendarConfirmation(
    userEmail: string,
    userName: string,
    calendarEntry: CalendarEntry
  ): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      console.log('📧 Email service not available for confirmation (check credentials)');
      return false;
    }

    const template = this.generateConfirmationTemplate(userName, calendarEntry);

    try {
      await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.address}>`,
        to: userEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      });

      console.log(`📧 Confirmation email sent to ${userEmail} for entry ${calendarEntry.id}`);
      return true;
    } catch (error: any) {
      console.log(`📧 Failed to send confirmation email (check credentials): ${error.message}`);
      return false;
    }
  }

  /**
   * Send scheduled content reminder email
   */
  async sendScheduledReminder(
    userEmail: string,
    userName: string,
    calendarEntry: CalendarEntry
  ): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      console.log('📧 Email service not available for reminder (check credentials)');
      return false;
    }

    const template = this.generateReminderTemplate(userName, calendarEntry);

    try {
      await this.transporter.sendMail({
        from: `"${this.config.from.name}" <${this.config.from.address}>`,
        to: userEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      });

      console.log(`📧 Reminder email sent to ${userEmail} for entry ${calendarEntry.id}`);
      return true;
    } catch (error: any) {
      console.log(`📧 Failed to send reminder email (check credentials): ${error.message}`);
      return false;
    }
  }

  /**
   * Generate confirmation email template
   */
  private generateConfirmationTemplate(userName: string, entry: CalendarEntry): EmailTemplate {
    const scheduledDate = new Date(entry.scheduledDate).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const subject = `✅ Content Scheduled: ${entry.title}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF6B35, #1A936F); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .entry-card { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #FF6B35; }
          .platform-badge { display: inline-block; background: #1A936F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 PersonaVerse AI</h1>
            <p>Content Scheduled Successfully!</p>
          </div>
          <div class="content">
            <p>Namaste ${userName}! 🙏</p>
            <p>Your content has been scheduled successfully. Here are the details:</p>
            
            <div class="entry-card">
              <h3>${entry.title}</h3>
              <p><strong>Platform:</strong> <span class="platform-badge">${entry.platform}</span></p>
              <p><strong>Scheduled for:</strong> ${scheduledDate}</p>
              <p><strong>Status:</strong> ${entry.status}</p>
              ${entry.content ? `<p><strong>Content Preview:</strong></p><p style="font-style: italic; background: #f0f0f0; padding: 10px; border-radius: 4px;">${entry.content.substring(0, 200)}${entry.content.length > 200 ? '...' : ''}</p>` : ''}
            </div>

            <p>We'll send you a reminder when it's time to publish this content.</p>
            <p>Keep creating authentic content that reflects your Digital Soul! ✨</p>
          </div>
          <div class="footer">
            <p>PersonaVerse AI - Your Digital Identity, Authentically Scaled</p>
            <p>Made with ❤️ for Bharat</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
PersonaVerse AI - Content Scheduled Successfully!

Namaste ${userName}!

Your content has been scheduled successfully:

Title: ${entry.title}
Platform: ${entry.platform}
Scheduled for: ${scheduledDate}
Status: ${entry.status}

${entry.content ? `Content Preview: ${entry.content.substring(0, 200)}${entry.content.length > 200 ? '...' : ''}` : ''}

We'll send you a reminder when it's time to publish this content.

Keep creating authentic content that reflects your Digital Soul!

PersonaVerse AI - Your Digital Identity, Authentically Scaled
Made with ❤️ for Bharat
    `;

    return { subject, html, text };
  }

  /**
   * Generate reminder email template
   */
  private generateReminderTemplate(userName: string, entry: CalendarEntry): EmailTemplate {
    const scheduledDate = new Date(entry.scheduledDate).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const subject = `⏰ Time to Publish: ${entry.title}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF6B35, #1A936F); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .entry-card { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1A936F; }
          .platform-badge { display: inline-block; background: #FF6B35; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase; }
          .cta-button { display: inline-block; background: #1A936F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ PersonaVerse AI</h1>
            <p>Time to Publish Your Content!</p>
          </div>
          <div class="content">
            <p>Namaste ${userName}! 🙏</p>
            <p>It's time to publish your scheduled content:</p>
            
            <div class="entry-card">
              <h3>${entry.title}</h3>
              <p><strong>Platform:</strong> <span class="platform-badge">${entry.platform}</span></p>
              <p><strong>Scheduled for:</strong> ${scheduledDate}</p>
              ${entry.content ? `<p><strong>Content to Publish:</strong></p><p style="background: #f0f0f0; padding: 15px; border-radius: 4px; font-family: monospace;">${entry.content}</p>` : ''}
            </div>

            <p>Ready to share your authentic voice with the world? 🚀</p>
            <p>Remember: This content reflects your unique Digital Soul and cultural context.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:3000" class="cta-button">Open PersonaVerse Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>PersonaVerse AI - Your Digital Identity, Authentically Scaled</p>
            <p>Made with ❤️ for Bharat</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
PersonaVerse AI - Time to Publish Your Content!

Namaste ${userName}!

It's time to publish your scheduled content:

Title: ${entry.title}
Platform: ${entry.platform}
Scheduled for: ${scheduledDate}

${entry.content ? `Content to Publish:\n${entry.content}` : ''}

Ready to share your authentic voice with the world?

Remember: This content reflects your unique Digital Soul and cultural context.

Open PersonaVerse Dashboard: http://localhost:3000

PersonaVerse AI - Your Digital Identity, Authentically Scaled
Made with ❤️ for Bharat
    `;

    return { subject, html, text };
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('📧 Email service connection verified');
      return true;
    } catch (error: any) {
      console.log('📧 Email service connection failed (check credentials):', error.message);
      // Don't disable the service, just log the error
      return false;
    }
  }
}

export const emailService = new EmailService();
export { EmailService };