/**
 * Calendar Routes
 * Handles content scheduling and calendar management
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { CalendarService } from '../services/calendar/calendar.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/calendar/schedule
 * Create a new scheduled content
 */
router.post(
  '/schedule',
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('content').trim().notEmpty(),
    body('platform').isIn(['linkedin', 'instagram', 'twitter', 'facebook', 'youtube']),
    body('scheduledDate').isDate(),
    body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('notificationEmail').optional().isEmail(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('📅 Calendar POST validation errors:', errors.array());
        res.status(400).json({ 
          success: false,
          errors: errors.array(),
          message: 'Validation failed'
        });
        return;
      }

      const { title, description, content, platform, scheduledDate, scheduledTime, notificationEmail } = req.body;

      // Use provided notification email or fall back to user's email
      const emailToUse = notificationEmail || req.userEmail!;
      
      // Extract user name from email (simple approach for demo)
      const userName = emailToUse.split('@')[0] || 'User';

      const schedule = await CalendarService.createSchedule({
        userId: req.userId!,
        userEmail: emailToUse,
        userName,
        title,
        description,
        content,
        platform,
        scheduledDate,
        scheduledTime,
      });

      res.status(201).json({
        success: true,
        schedule,
      });
    } catch (error: any) {
      console.error('Create schedule error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create schedule',
      });
    }
  }
);

/**
 * GET /api/calendar/schedules
 * Get all schedules for the current user
 */
router.get('/schedules', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedules = await CalendarService.getUserSchedules(req.userId!);

    res.json({
      success: true,
      schedules,
    });
  } catch (error: any) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get schedules',
    });
  }
});

/**
 * GET /api/calendar/schedules/:scheduleId
 * Get a specific schedule
 */
router.get('/schedules/:scheduleId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { scheduleId } = req.params;

    const schedule = await CalendarService.getSchedule(scheduleId, req.userId!);

    if (!schedule) {
      res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
      return;
    }

    res.json({
      success: true,
      schedule,
    });
  } catch (error: any) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get schedule',
    });
  }
});

/**
 * GET /api/calendar/schedules/range/:startDate/:endDate
 * Get schedules within a date range
 */
router.get(
  '/schedules/range/:startDate/:endDate',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.params;

      const schedules = await CalendarService.getSchedulesByDateRange(
        req.userId!,
        startDate,
        endDate
      );

      res.json({
        success: true,
        schedules,
      });
    } catch (error: any) {
      console.error('Get schedules by range error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get schedules',
      });
    }
  }
);

/**
 * GET /api/calendar/upcoming
 * Get upcoming schedules (next 7 days)
 */
router.get('/upcoming', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedules = await CalendarService.getUpcomingSchedules(req.userId!);

    res.json({
      success: true,
      schedules,
    });
  } catch (error: any) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get upcoming schedules',
    });
  }
});

/**
 * PUT /api/calendar/schedules/:scheduleId
 * Update a schedule
 */
router.put(
  '/schedules/:scheduleId',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
    body('platform').optional().isIn(['linkedin', 'instagram', 'twitter', 'facebook', 'youtube']),
    body('scheduledDate').optional().isDate(),
    body('scheduledTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('status').optional().isIn(['scheduled', 'posted', 'draft']),
    body('notificationEmail').optional().isEmail(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { scheduleId } = req.params;
      const updates = req.body;

      // Use provided notification email or fall back to user's email
      const emailToUse = updates.notificationEmail || req.userEmail!;
      
      // Extract user name from email (simple approach for demo)
      const userName = emailToUse.split('@')[0] || 'User';

      const schedule = await CalendarService.updateSchedule({
        scheduleId,
        userId: req.userId!,
        userEmail: emailToUse,
        userName,
        ...updates,
      });

      if (!schedule) {
        res.status(404).json({
          success: false,
          error: 'Schedule not found',
        });
        return;
      }

      res.json({
        success: true,
        schedule,
      });
    } catch (error: any) {
      console.error('Update schedule error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update schedule',
      });
    }
  }
);

/**
 * DELETE /api/calendar/schedules/:scheduleId
 * Delete a schedule
 */
router.delete('/schedules/:scheduleId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { scheduleId } = req.params;

    const success = await CalendarService.deleteSchedule(scheduleId, req.userId!);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete schedule',
    });
  }
});

export default router;
