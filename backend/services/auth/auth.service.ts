/**
 * Authentication Service
 * Handles user registration, login, and password management
 */

import bcrypt from 'bcryptjs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../../middleware/auth.middleware';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.DYNAMODB_TABLE_USERS || 'personaverse-users';

export interface User {
  userId: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const { email, password, name } = input;

    // Validate input
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();

    const user: User = {
      userId,
      email: email.toLowerCase(),
      name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: user,
        ConditionExpression: 'attribute_not_exists(email)',
      })
    );

    // Generate token
    const token = generateToken(userId, email);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Login user
   */
  static async login(input: LoginInput): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const { email, password } = input;

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Get user
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.userId, user.email);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Get user by email
   */
  private static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await docClient.send(
        new QueryCommand({
          TableName: USERS_TABLE,
          IndexName: 'EmailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: {
            ':email': email.toLowerCase(),
          },
        })
      );

      return result.Items?.[0] as User || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const result = await docClient.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId },
        })
      );

      if (!result.Item) {
        return null;
      }

      const { passwordHash: _, ...userWithoutPassword } = result.Item as User;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
}
