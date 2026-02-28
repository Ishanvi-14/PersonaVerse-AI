/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, name } = req.body;

      // Register user
      const result = await AuthService.register({ email, password, name });

      // Set cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Login user
      const result = await AuthService.login({ email, password });

      // Set cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Login failed',
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await AuthService.getUserById(req.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

export default router;
