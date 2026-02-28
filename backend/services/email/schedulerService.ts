/**
 * Email Scheduler Service
 * 
 * Handles scheduling and sending reminder emails for calendar entries
 * Uses node-cron for scheduling tasks
 */

import cron from 'node-cron';
import { emailService } from './emailService';
import { getCalendarEntry } from '../calendar/calendar.service';

interface ScheduledTask {
  id: string;
  entryId: string;
  userId: string;
  userEmail: string;
  userName: string;
  scheduledDate: Date;
  task: any; // Using any to avoid TypeScript issues with node-cron types
}

class SchedulerService {
  private scheduledTasks: Map<string, ScheduledTask> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';
    console.log(`📅 Scheduler service ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Schedule a reminder email for a calendar entry
   */
  scheduleReminder(
    entryId: string,
    userId: string,
    userEmail: string,
    userName: string,
    scheduledDate: Date
  ): boolean {
    if (!this.enabled) {
      console.log('📅 Scheduler service disabled, skipping reminder');
      return false;
    }

    try {
      // Remove existing task if it exists
      this.cancelReminder(entryId);

      // Check if the scheduled date is in the future
      const now = new Date();
      if (scheduledDate <= now) {
        console.log(`📅 Scheduled date ${scheduledDate} is in the past, skipping reminder`);
        return false;
      }

      // Create cron expression for the exact scheduled time
      const cronExpression = this.createCronExpression(scheduledDate);
      
      console.log(`📅 Scheduling reminder for ${entryId} at ${scheduledDate} (${cronExpression})`);

      // Create the scheduled task
      const task = cron.schedule(cronExpression, async () => {
        await this.sendReminderEmail(entryId, userId, userEmail, userName);
        // Remove the task after execution
        this.scheduledTasks.delete(entryId);
      });

      // Store the task
      const scheduledTask: ScheduledTask = {
        id: `reminder_${entryId}`,
        entryId,
        userId,
        userEmail,
        userName,
        scheduledDate,
        task
      };

      this.scheduledTasks.set(entryId, scheduledTask);
      console.log(`📅 Reminder scheduled successfully for entry ${entryId}`);
      return true;

    } catch (error) {
      console.error(`📅 Failed to schedule reminder for ${entryId}:`, error);
      return false;
    }
  }

  /**
   * Cancel a scheduled reminder
   */
  cancelReminder(entryId: string): boolean {
    const scheduledTask = this.scheduledTasks.get(entryId);
    if (scheduledTask) {
      scheduledTask.task.stop();
      scheduledTask.task.destroy();
      this.scheduledTasks.delete(entryId);
      console.log(`📅 Cancelled reminder for entry ${entryId}`);
      return true;
    }
    return false;
  }

  /**
   * Update a scheduled reminder
   */
  updateReminder(
    entryId: string,
    userId: string,
    userEmail: string,
    userName: string,
    newScheduledDate: Date
  ): boolean {
    // Cancel existing reminder
    this.cancelReminder(entryId);
    
    // Schedule new reminder
    return this.scheduleReminder(entryId, userId, userEmail, userName, newScheduledDate);
  }

  /**
   * Get all scheduled tasks
   */
  getScheduledTasks(): Array<{
    entryId: string;
    userId: string;
    userEmail: string;
    scheduledDate: Date;
  }> {
    return Array.from(this.scheduledTasks.values()).map(task => ({
      entryId: task.entryId,
      userId: task.userId,
      userEmail: task.userEmail,
      scheduledDate: task.scheduledDate
    }));
  }

  /**
   * Send reminder email for a calendar entry
   */
  private async sendReminderEmail(
    entryId: string,
    userId: string,
    userEmail: string,
    userName: string
  ): Promise<void> {
    try {
      console.log(`📅 Sending reminder email for entry ${entryId} to ${userEmail}`);

      // Get the calendar entry
      const calendarEntry = await getCalendarEntry(entryId, userId);
      if (!calendarEntry) {
        console.error(`📅 Calendar entry ${entryId} not found`);
        return;
      }

      // Send the reminder email
      const success = await emailService.sendScheduledReminder(
        userEmail,
        userName,
        calendarEntry
      );

      if (success) {
        console.log(`📅 Reminder email sent successfully for entry ${entryId}`);
      } else {
        console.error(`📅 Failed to send reminder email for entry ${entryId}`);
      }

    } catch (error) {
      console.error(`📅 Error sending reminder email for entry ${entryId}:`, error);
    }
  }

  /**
   * Create cron expression for a specific date/time
   */
  private createCronExpression(date: Date): string {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const year = date.getFullYear();

    // Cron format: minute hour day month dayOfWeek
    // We use * for dayOfWeek since we're specifying exact date
    return `${minute} ${hour} ${day} ${month} *`;
  }

  /**
   * Schedule a test reminder (for testing purposes)
   */
  scheduleTestReminder(userEmail: string, userName: string, delayMinutes: number = 1): boolean {
    if (!this.enabled) {
      return false;
    }

    const testDate = new Date();
    testDate.setMinutes(testDate.getMinutes() + delayMinutes);

    const testEntryId = `test_${Date.now()}`;
    
    return this.scheduleReminder(
      testEntryId,
      'test-user',
      userEmail,
      userName,
      testDate
    );
  }

  /**
   * Cleanup all scheduled tasks (for graceful shutdown)
   */
  cleanup(): void {
    console.log(`📅 Cleaning up ${this.scheduledTasks.size} scheduled tasks`);
    
    for (const [entryId, scheduledTask] of this.scheduledTasks) {
      scheduledTask.task.stop();
      scheduledTask.task.destroy();
    }
    
    this.scheduledTasks.clear();
    console.log('📅 All scheduled tasks cleaned up');
  }
}

export const schedulerService = new SchedulerService();

// Graceful shutdown handling
process.on('SIGINT', () => {
  schedulerService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  schedulerService.cleanup();
  process.exit(0);
});

export { SchedulerService };