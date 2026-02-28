/**
 * Authentication Middleware
 * JWT-based authentication for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'personaverse-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};
