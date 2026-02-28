/**
 * Email Test Routes
 * For testing email functionality during development
 */

import { Router, Request, Response } from 'express';
import { emailService } from '../services/email/emailService';
import { schedulerService } from '../services/email/schedulerService';

const router = Router();

/**
 * POST /test/email/confirmation
 * Test confirmation email
 */
router.post('/confirmation', async (req: Request, res: Response) => {
  try {
    const { userEmail, userName } = req.body;

    if (!userEmail || !userName) {
      return res.status(400).json({
        error: 'userEmail and userName are required'
      });
    }

    const testEntry = {
      id: 'test-123',
      title: 'Test LinkedIn Post',
      content: 'This is a test post to demonstrate PersonaVerse AI email notifications. Namaste! 🙏',
      platform: 'linkedin',
      scheduledDate: new Date(Date.now() + 60000), // 1 minute from now
      status: 'scheduled'
    };

    const success = await emailService.sendCalendarConfirmation(
      userEmail,
      userName,
      testEntry
    );

    res.json({
      success,
      message: success ? 'Confirmation email sent successfully' : 'Failed to send confirmation email',
      testEntry
    });

  } catch (error: any) {
    console.error('Test confirmation email error:', error);
    res.status(500).json({
      error: 'Failed to send test confirmation email',
      message: error.message
    });
  }
});

/**
 * POST /test/email/reminder
 * Test reminder email
 */
router.post('/reminder', async (req: Request, res: Response) => {
  try {
    const { userEmail, userName } = req.body;

    if (!userEmail || !userName) {
      return res.status(400).json({
        error: 'userEmail and userName are required'
      });
    }

    const testEntry = {
      id: 'test-reminder-123',
      title: 'Test Reminder Post',
      content: 'Time to publish your authentic content! This is a test reminder from PersonaVerse AI. 🚀',
      platform: 'twitter',
      scheduledDate: new Date(),
      status: 'scheduled'
    };

    const success = await emailService.sendScheduledReminder(
      userEmail,
      userName,
      testEntry
    );

    res.json({
      success,
      message: success ? 'Reminder email sent successfully' : 'Failed to send reminder email',
      testEntry
    });

  } catch (error: any) {
    console.error('Test reminder email error:', error);
    res.status(500).json({
      error: 'Failed to send test reminder email',
      message: error.message
    });
  }
});

/**
 * POST /test/email/schedule-reminder
 * Test scheduling a reminder (will be sent after specified delay)
 */
router.post('/schedule-reminder', async (req: Request, res: Response) => {
  try {
    const { userEmail, userName, delayMinutes = 1 } = req.body;

    if (!userEmail || !userName) {
      return res.status(400).json({
        error: 'userEmail and userName are required'
      });
    }

    const success = schedulerService.scheduleTestReminder(
      userEmail,
      userName,
      delayMinutes
    );

    res.json({
      success,
      message: success 
        ? `Test reminder scheduled for ${delayMinutes} minute(s) from now`
        : 'Failed to schedule test reminder',
      scheduledFor: new Date(Date.now() + delayMinutes * 60000)
    });

  } catch (error: any) {
    console.error('Schedule test reminder error:', error);
    res.status(500).json({
      error: 'Failed to schedule test reminder',
      message: error.message
    });
  }
});

/**
 * GET /test/email/scheduled-tasks
 * Get all scheduled tasks
 */
router.get('/scheduled-tasks', (req: Request, res: Response) => {
  try {
    const tasks = schedulerService.getScheduledTasks();
    
    res.json({
      success: true,
      tasks,
      count: tasks.length
    });

  } catch (error: any) {
    console.error('Get scheduled tasks error:', error);
    res.status(500).json({
      error: 'Failed to get scheduled tasks',
      message: error.message
    });
  }
});

export default router;