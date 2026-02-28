/**
 * Content Calendar Service
 * Manages scheduled content with DynamoDB storage and email notifications
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../email/emailService';
import { schedulerService } from '../email/schedulerService';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const CALENDAR_TABLE = process.env.DYNAMODB_TABLE_CALENDAR || 'personaverse-calendar';

export type ContentStatus = 'scheduled' | 'posted' | 'draft';
export type Platform = 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'youtube';

// Interface for email service compatibility
export interface CalendarEntry {
  id: string;
  title: string;
  content: string;
  platform: string;
  scheduledDate: Date;
  status: string;
}

export interface ScheduledContent {
  scheduleId: string;
  userId: string;
  title: string;
  description: string;
  content: string;
  platform: Platform;
  scheduledDate: string; // ISO string
  scheduledTime: string; // HH:MM format
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
}

export interface CreateScheduleInput {
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  description: string;
  content: string;
  platform: Platform;
  scheduledDate: string;
  scheduledTime: string;
}

export interface UpdateScheduleInput {
  scheduleId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  title?: string;
  description?: string;
  content?: string;
  platform?: Platform;
  scheduledDate?: string;
  scheduledTime?: string;
  status?: ContentStatus;
}

export class CalendarService {
  /**
   * Create a new scheduled content with email notifications
   */
  static async createSchedule(input: CreateScheduleInput): Promise<ScheduledContent> {
    const scheduleId = uuidv4();
    const now = new Date().toISOString();

    const schedule: ScheduledContent = {
      scheduleId,
      userId: input.userId,
      title: input.title,
      description: input.description,
      content: input.content,
      platform: input.platform,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: CALENDAR_TABLE,
        Item: schedule,
      })
    );

    // Send confirmation email
    try {
      await emailService.sendCalendarConfirmation(
        input.userEmail,
        input.userName,
        {
          id: scheduleId,
          title: input.title,
          content: input.content,
          platform: input.platform,
          scheduledDate: new Date(`${input.scheduledDate}T${input.scheduledTime}`),
          status: 'scheduled'
        }
      );
      console.log(`📧 Confirmation email sent for schedule ${scheduleId}`);
    } catch (error) {
      console.error(`📧 Failed to send confirmation email for schedule ${scheduleId}:`, error);
    }

    // Schedule reminder email
    try {
      const scheduledDateTime = new Date(`${input.scheduledDate}T${input.scheduledTime}`);
      schedulerService.scheduleReminder(
        scheduleId,
        input.userId,
        input.userEmail,
        input.userName,
        scheduledDateTime
      );
      console.log(`📅 Reminder scheduled for ${scheduleId} at ${scheduledDateTime}`);
    } catch (error) {
      console.error(`📅 Failed to schedule reminder for ${scheduleId}:`, error);
    }

    return schedule;
  }

  /**
   * Get schedule by ID
   */
  static async getSchedule(scheduleId: string, userId: string): Promise<ScheduledContent | null> {
    try {
      const result = await docClient.send(
        new GetCommand({
          TableName: CALENDAR_TABLE,
          Key: { scheduleId },
        })
      );

      const schedule = result.Item as ScheduledContent;

      // Verify ownership
      if (schedule && schedule.userId !== userId) {
        return null;
      }

      return schedule || null;
    } catch (error) {
      console.error('Error getting schedule:', error);
      return null;
    }
  }

  /**
   * Get all schedules for a user
   */
  static async getUserSchedules(userId: string): Promise<ScheduledContent[]> {
    try {
      const result = await docClient.send(
        new QueryCommand({
          TableName: CALENDAR_TABLE,
          IndexName: 'UserIdIndex',
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
        })
      );

      return (result.Items as ScheduledContent[]) || [];
    } catch (error) {
      console.error('Error getting user schedules:', error);
      return [];
    }
  }

  /**
   * Get schedules for a specific date range
   */
  static async getSchedulesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ScheduledContent[]> {
    try {
      const allSchedules = await this.getUserSchedules(userId);

      return allSchedules.filter(schedule => {
        const scheduleDate = schedule.scheduledDate;
        return scheduleDate >= startDate && scheduleDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting schedules by date range:', error);
      return [];
    }
  }

  /**
   * Update a schedule
   */
  static async updateSchedule(input: UpdateScheduleInput): Promise<ScheduledContent | null> {
    try {
      // First verify ownership
      const existing = await this.getSchedule(input.scheduleId, input.userId);
      if (!existing) {
        return null;
      }

      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      // Build update expression dynamically
      if (input.title !== undefined) {
        updateExpressions.push('#title = :title');
        expressionAttributeNames['#title'] = 'title';
        expressionAttributeValues[':title'] = input.title;
      }

      if (input.description !== undefined) {
        updateExpressions.push('#description = :description');
        expressionAttributeNames['#description'] = 'description';
        expressionAttributeValues[':description'] = input.description;
      }

      if (input.content !== undefined) {
        updateExpressions.push('#content = :content');
        expressionAttributeNames['#content'] = 'content';
        expressionAttributeValues[':content'] = input.content;
      }

      if (input.platform !== undefined) {
        updateExpressions.push('#platform = :platform');
        expressionAttributeNames['#platform'] = 'platform';
        expressionAttributeValues[':platform'] = input.platform;
      }

      if (input.scheduledDate !== undefined) {
        updateExpressions.push('#scheduledDate = :scheduledDate');
        expressionAttributeNames['#scheduledDate'] = 'scheduledDate';
        expressionAttributeValues[':scheduledDate'] = input.scheduledDate;
      }

      if (input.scheduledTime !== undefined) {
        updateExpressions.push('#scheduledTime = :scheduledTime');
        expressionAttributeNames['#scheduledTime'] = 'scheduledTime';
        expressionAttributeValues[':scheduledTime'] = input.scheduledTime;
      }

      if (input.status !== undefined) {
        updateExpressions.push('#status = :status');
        expressionAttributeNames['#status'] = 'status';
        expressionAttributeValues[':status'] = input.status;

        // If status is 'posted', set postedAt
        if (input.status === 'posted') {
          updateExpressions.push('#postedAt = :postedAt');
          expressionAttributeNames['#postedAt'] = 'postedAt';
          expressionAttributeValues[':postedAt'] = new Date().toISOString();
        }
      }

      // Always update updatedAt
      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const result = await docClient.send(
        new UpdateCommand({
          TableName: CALENDAR_TABLE,
          Key: { scheduleId: input.scheduleId },
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        })
      );

      const updatedSchedule = result.Attributes as ScheduledContent;

      // Handle email notifications for schedule changes
      if (input.userEmail && input.userName) {
        // If scheduled date/time changed, update the reminder
        if (input.scheduledDate !== undefined || input.scheduledTime !== undefined) {
          try {
            const newScheduledDateTime = new Date(
              `${updatedSchedule.scheduledDate}T${updatedSchedule.scheduledTime}`
            );
            
            // Update the scheduled reminder
            schedulerService.updateReminder(
              input.scheduleId,
              input.userId,
              input.userEmail,
              input.userName,
              newScheduledDateTime
            );
            
            console.log(`📅 Reminder updated for schedule ${input.scheduleId}`);
          } catch (error) {
            console.error(`📅 Failed to update reminder for schedule ${input.scheduleId}:`, error);
          }
        }
      }

      return updatedSchedule;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return null;
    }
  }

  /**
   * Delete a schedule and cancel associated reminders
   */
  static async deleteSchedule(scheduleId: string, userId: string): Promise<boolean> {
    try {
      // First verify ownership
      const existing = await this.getSchedule(scheduleId, userId);
      if (!existing) {
        return false;
      }

      // Cancel any scheduled reminder
      try {
        schedulerService.cancelReminder(scheduleId);
        console.log(`📅 Cancelled reminder for deleted schedule ${scheduleId}`);
      } catch (error) {
        console.error(`📅 Failed to cancel reminder for schedule ${scheduleId}:`, error);
      }

      await docClient.send(
        new DeleteCommand({
          TableName: CALENDAR_TABLE,
          Key: { scheduleId },
        })
      );

      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return false;
    }
  }

  /**
   * Get upcoming schedules (next 7 days)
   */
  static async getUpcomingSchedules(userId: string): Promise<ScheduledContent[]> {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.getSchedulesByDateRange(userId, today, nextWeek);
  }
}

/**
 * Get calendar entry for email service (helper function)
 */
export async function getCalendarEntry(entryId: string, userId: string): Promise<CalendarEntry | null> {
  try {
    const schedule = await CalendarService.getSchedule(entryId, userId);
    if (!schedule) {
      return null;
    }

    return {
      id: schedule.scheduleId,
      title: schedule.title,
      content: schedule.content,
      platform: schedule.platform,
      scheduledDate: new Date(`${schedule.scheduledDate}T${schedule.scheduledTime}`),
      status: schedule.status
    };
  } catch (error) {
    console.error('Error getting calendar entry:', error);
    return null;
  }
}
