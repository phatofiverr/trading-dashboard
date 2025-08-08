/**
 * Input Validation and Sanitization Utilities
 * Provides functions to validate and sanitize user inputs
 */

import { Trade } from '@/types/Trade';

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string, maxLength: number = 100): string => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  let sanitized = input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate trade data
 */
export const validateTrade = (trade: Partial<Trade>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate instrument
  if (!trade.instrument || typeof trade.instrument !== 'string') {
    errors.push('Instrument is required and must be a string');
  } else if (trade.instrument.length > 50) {
    errors.push('Instrument name must be less than 50 characters');
  }
  
  // Validate prices
  if (typeof trade.entryPrice !== 'number' || trade.entryPrice <= 0) {
    errors.push('Entry price must be a positive number');
  }
  
  if (trade.exitPrice && (typeof trade.exitPrice !== 'number' || trade.exitPrice < 0)) {
    errors.push('Exit price must be a non-negative number');
  }
  
  // Validate direction
  if (!trade.direction || !['long', 'short'].includes(trade.direction)) {
    errors.push('Direction must be either "long" or "short"');
  }
  
  // Validate dates
  if (trade.entryDate && isNaN(new Date(trade.entryDate).getTime())) {
    errors.push('Entry date must be a valid date');
  }
  
  if (trade.exitDate && isNaN(new Date(trade.exitDate).getTime())) {
    errors.push('Exit date must be a valid date');
  }
  
  // Validate position size
  if (typeof trade.positionSize !== 'number' || trade.positionSize <= 0) {
    errors.push('Position size must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize trade data
 */
export const sanitizeTrade = (trade: Partial<Trade>): Partial<Trade> => {
  return {
    ...trade,
    instrument: trade.instrument ? sanitizeString(trade.instrument, 50) : undefined,
    notes: trade.notes ? sanitizeString(trade.notes, 1000) : undefined,
    strategy: trade.strategy ? sanitizeString(trade.strategy, 100) : undefined,
    accountId: trade.accountId ? sanitizeString(trade.accountId, 50) : undefined,
    behavioralTags: trade.behavioralTags ? trade.behavioralTags.map(tag => sanitizeString(tag, 30)) : undefined
  };
};

/**
 * Validate numeric input
 */
export const validateNumber = (value: any, min?: number, max?: number): boolean => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

/**
 * Sanitize HTML content (basic)
 */
export const sanitizeHTML = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private maxAttempts: number = 5, private windowMs: number = 15 * 60 * 1000) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }
}
