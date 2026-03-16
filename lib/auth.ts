import { compare, hash } from 'bcryptjs';
import { queries } from './db';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_user' | 'admin';
  status: 'active' | 'inactive';
  avatar_url?: string;
  last_login?: Date;
}

export interface Session {
  user: User;
  expires: Date;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Authenticate user
export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  try {
    // Find user by email
    const user = await queries.users.findByEmail(email);

    if (!user) {
      return null;
    }

    // Check if user is active
    if (user.status !== 'active') {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return null;
    }

    // Update last login
    await queries.users.updateLastLogin(user.id);

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const user = await queries.users.findById(id);

    if (!user) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Check if user is super user
export function isSuperUser(user: User): boolean {
  return user.role === 'super_user';
}

// Check if user is admin or super user
export function isAdmin(user: User): boolean {
  return user.role === 'admin' || user.role === 'super_user';
}

// Check if user has permission
export function hasPermission(
  user: User,
  permission: 'manage_users' | 'manage_places' | 'manage_reviews' | 'view_analytics' | 'manage_settings'
): boolean {
  // Super user has all permissions
  if (isSuperUser(user)) {
    return true;
  }

  // Admin permissions
  if (user.role === 'admin') {
    const adminPermissions = [
      'manage_places',
      'manage_reviews',
      'view_analytics'
    ];
    return adminPermissions.includes(permission);
  }

  return false;
}

// Validate password strength
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Generate random password
export function generateRandomPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one of each required character type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

// Create user
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'super_user' | 'admin';
}): Promise<User | null> {
  try {
    // Validate password
    const validation = validatePassword(data.password);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Hash password
    const password_hash = await hashPassword(data.password);

    // Create user
    const user = await queries.users.create({
      name: data.name,
      email: data.email,
      password_hash,
      role: data.role
    });

    if (!user) {
      return null;
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}

// Session duration (7 days)
export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

// Get session expiry date
export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DURATION);
}
