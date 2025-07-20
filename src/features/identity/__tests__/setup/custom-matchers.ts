/**
 * Custom Jest Matchers for Identity Domain Tests
 * Provides domain-specific assertions and utilities
 */

import { Result } from '@core/types/result';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSuccessResult(): R;
      toBeFailureResult(): R;
      toBeFailureResultWithError(expectedError: string): R;
      toBeValidEmail(): R;
      toBeValidPassword(): R;
      toBeValidUserId(): R;
      toBeValidDisplayName(): R;
      toHaveValidTimestamp(): R;
      toMatchUserSchema(): R;
      toMatchEmailSchema(): R;
      toMatchUserProfileSchema(): R;
      toBeWithinDateRange(startDate: Date, endDate: Date): R;
      toBeRecentDate(withinMinutes?: number): R;
      toContainUserWithEmail(email: string): R;
      toHaveBeenCalledWithValidUser(): R;
      toHaveBeenCalledWithValidEmail(): R;
      toThrowDomainError(expectedError?: string): R;
    }
  }
}

// Result matchers
expect.extend({
  toBeSuccessResult(received: Result<any, any>) {
    const pass = received && received.isSuccess === true;
    
    if (pass) {
      return {
        message: () => `Expected result not to be successful`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected result to be successful, but got failure: ${received?.error || 'unknown error'}`,
        pass: false,
      };
    }
  },

  toBeFailureResult(received: Result<any, any>) {
    const pass = received && received.isFailure === true;
    
    if (pass) {
      return {
        message: () => `Expected result not to be a failure`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected result to be a failure, but got success: ${received?.value}`,
        pass: false,
      };
    }
  },

  toBeFailureResultWithError(received: Result<any, any>, expectedError: string) {
    const isFailure = received && received.isFailure === true;
    const hasCorrectError = isFailure && received.getError() === expectedError;
    
    if (hasCorrectError) {
      return {
        message: () => `Expected result not to be a failure with error "${expectedError}"`,
        pass: true,
      };
    } else {
      const actualError = isFailure ? received.getError() : 'result was not a failure';
      return {
        message: () => `Expected result to be a failure with error "${expectedError}", but got: ${actualError}`,
        pass: false,
      };
    }
  },
});

// Email validation matcher
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `Expected "${received}" not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected "${received}" to be a valid email`,
        pass: false,
      };
    }
  },
});

// Password validation matcher
expect.extend({
  toBeValidPassword(received: string) {
    const hasMinLength = received && received.length >= 8;
    const hasUppercase = /[A-Z]/.test(received);
    const hasLowercase = /[a-z]/.test(received);
    const hasNumber = /\d/.test(received);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(received);
    
    const pass = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    
    if (pass) {
      return {
        message: () => `Expected "${received}" not to be a valid password`,
        pass: true,
      };
    } else {
      const issues = [];
      if (!hasMinLength) issues.push('at least 8 characters');
      if (!hasUppercase) issues.push('uppercase letter');
      if (!hasLowercase) issues.push('lowercase letter');
      if (!hasNumber) issues.push('number');
      if (!hasSpecialChar) issues.push('special character');
      
      return {
        message: () => `Expected "${received}" to be a valid password. Missing: ${issues.join(', ')}`,
        pass: false,
      };
    }
  },
});

// User ID validation matcher
expect.extend({
  toBeValidUserId(received: string) {
    const isValidLength = received && received.length >= 3 && received.length <= 255;
    const hasValidChars = /^[a-zA-Z0-9\-_|]+$/.test(received);
    
    const pass = isValidLength && hasValidChars;
    
    if (pass) {
      return {
        message: () => `Expected "${received}" not to be a valid user ID`,
        pass: true,
      };
    } else {
      const issues = [];
      if (!isValidLength) issues.push('proper length (3-255 characters)');
      if (!hasValidChars) issues.push('valid characters (alphanumeric, hyphens, underscores, pipes only)');
      
      return {
        message: () => `Expected "${received}" to be a valid user ID. Missing: ${issues.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Display name validation matcher
expect.extend({
  toBeValidDisplayName(received: string) {
    const isValidLength = received && received.trim().length >= 1 && received.length <= 100;
    const hasValidContent = received && received.trim() !== '';
    const noProhibitedWords = !/(admin|system|support|root|moderator)/i.test(received);
    
    const pass = isValidLength && hasValidContent && noProhibitedWords;
    
    if (pass) {
      return {
        message: () => `Expected "${received}" not to be a valid display name`,
        pass: true,
      };
    } else {
      const issues = [];
      if (!isValidLength) issues.push('proper length (1-100 characters)');
      if (!hasValidContent) issues.push('non-empty content');
      if (!noProhibitedWords) issues.push('no prohibited words');
      
      return {
        message: () => `Expected "${received}" to be a valid display name. Issues: ${issues.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Timestamp validation matcher
expect.extend({
  toHaveValidTimestamp(received: any) {
    const hasCreatedAt = received && received.createdAt instanceof Date;
    const hasUpdatedAt = received && received.updatedAt instanceof Date;
    const validOrder = hasCreatedAt && hasUpdatedAt && received.createdAt <= received.updatedAt;
    
    const pass = hasCreatedAt && hasUpdatedAt && validOrder;
    
    if (pass) {
      return {
        message: () => `Expected object not to have valid timestamps`,
        pass: true,
      };
    } else {
      const issues = [];
      if (!hasCreatedAt) issues.push('valid createdAt date');
      if (!hasUpdatedAt) issues.push('valid updatedAt date');
      if (hasCreatedAt && hasUpdatedAt && !validOrder) issues.push('createdAt <= updatedAt');
      
      return {
        message: () => `Expected object to have valid timestamps. Missing: ${issues.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Schema validation matchers
expect.extend({
  toMatchUserSchema(received: any) {
    const hasId = received && received.id;
    const hasEmail = received && received.email;
    const hasProfile = received && received.profile;
    const hasValidBooleans = typeof received.emailVerified === 'boolean' && 
                           typeof received.isPremium === 'boolean' && 
                           typeof received.isActive === 'boolean';
    const hasValidNumbers = typeof received.loginAttempts === 'number';
    const hasValidDates = received.createdAt instanceof Date && received.updatedAt instanceof Date;
    
    const pass = hasId && hasEmail && hasProfile && hasValidBooleans && hasValidNumbers && hasValidDates;
    
    if (pass) {
      return {
        message: () => `Expected object not to match User schema`,
        pass: true,
      };
    } else {
      const issues = [];
      if (!hasId) issues.push('id');
      if (!hasEmail) issues.push('email');
      if (!hasProfile) issues.push('profile');
      if (!hasValidBooleans) issues.push('valid boolean fields');
      if (!hasValidNumbers) issues.push('valid number fields');
      if (!hasValidDates) issues.push('valid date fields');
      
      return {
        message: () => `Expected object to match User schema. Missing: ${issues.join(', ')}`,
        pass: false,
      };
    }
  },

  toMatchEmailSchema(received: any) {
    const hasValue = received && received.value;
    const isValidEmail = hasValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received.value);
    
    const pass = hasValue && isValidEmail;
    
    if (pass) {
      return {
        message: () => `Expected object not to match Email schema`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected object to match Email schema with valid email value`,
        pass: false,
      };
    }
  },

  toMatchUserProfileSchema(received: any) {
    const hasDisplayName = received && received.displayName;
    const validOptionalFields = true; // All other fields are optional
    
    const pass = hasDisplayName && validOptionalFields;
    
    if (pass) {
      return {
        message: () => `Expected object not to match UserProfile schema`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected object to match UserProfile schema with required displayName`,
        pass: false,
      };
    }
  },
});

// Date range matchers
expect.extend({
  toBeWithinDateRange(received: Date, startDate: Date, endDate: Date) {
    const pass = received instanceof Date && 
                 received >= startDate && 
                 received <= endDate;
    
    if (pass) {
      return {
        message: () => `Expected date ${received.toISOString()} not to be within range ${startDate.toISOString()} - ${endDate.toISOString()}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected date ${received instanceof Date ? received.toISOString() : received} to be within range ${startDate.toISOString()} - ${endDate.toISOString()}`,
        pass: false,
      };
    }
  },

  toBeRecentDate(received: Date, withinMinutes = 1) {
    const now = new Date();
    const threshold = new Date(now.getTime() - withinMinutes * 60 * 1000);
    const pass = received instanceof Date && received >= threshold && received <= now;
    
    if (pass) {
      return {
        message: () => `Expected date ${received.toISOString()} not to be recent (within ${withinMinutes} minutes)`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected date ${received instanceof Date ? received.toISOString() : received} to be recent (within ${withinMinutes} minutes of ${now.toISOString()})`,
        pass: false,
      };
    }
  },
});

// Array/collection matchers
expect.extend({
  toContainUserWithEmail(received: any[], email: string) {
    const containsUser = Array.isArray(received) && 
                        received.some(user => user && user.email && user.email.toLowerCase() === email.toLowerCase());
    
    if (containsUser) {
      return {
        message: () => `Expected array not to contain user with email "${email}"`,
        pass: true,
      };
    } else {
      const emails = Array.isArray(received) ? received.map(user => user?.email).filter(Boolean) : [];
      return {
        message: () => `Expected array to contain user with email "${email}". Found emails: [${emails.join(', ')}]`,
        pass: false,
      };
    }
  },
});

// Mock function matchers
expect.extend({
  toHaveBeenCalledWithValidUser(received: jest.MockedFunction<any>) {
    const calls = received.mock.calls;
    const hasValidUserCall = calls.some(call => {
      const user = call[0];
      return user && user.id && user.email && user.profile;
    });
    
    if (hasValidUserCall) {
      return {
        message: () => `Expected function not to have been called with a valid user`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected function to have been called with a valid user object`,
        pass: false,
      };
    }
  },

  toHaveBeenCalledWithValidEmail(received: jest.MockedFunction<any>) {
    const calls = received.mock.calls;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasValidEmailCall = calls.some(call => {
      const email = call[0];
      return typeof email === 'string' && emailRegex.test(email);
    });
    
    if (hasValidEmailCall) {
      return {
        message: () => `Expected function not to have been called with a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected function to have been called with a valid email address`,
        pass: false,
      };
    }
  },
});

// Error matchers
expect.extend({
  toThrowDomainError(received: () => any, expectedError?: string) {
    let thrown = false;
    let actualError: string | undefined;
    
    try {
      received();
    } catch (error) {
      thrown = true;
      actualError = error instanceof Error ? error.message : String(error);
    }
    
    if (!thrown) {
      return {
        message: () => `Expected function to throw a domain error`,
        pass: false,
      };
    }
    
    if (expectedError && actualError !== expectedError) {
      return {
        message: () => `Expected function to throw domain error "${expectedError}", but got "${actualError}"`,
        pass: false,
      };
    }
    
    return {
      message: () => expectedError 
        ? `Expected function not to throw domain error "${expectedError}"`
        : `Expected function not to throw a domain error`,
      pass: true,
    };
  },
});

export {};