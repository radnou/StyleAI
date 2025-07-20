import { z } from 'zod';

/**
 * Utility functions for form validation
 */

// Extract error messages from Zod validation errors
export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }
  
  return errors;
};

// Get the first error message for a field
export const getFieldError = (error: z.ZodError, fieldName: string): string | undefined => {
  const fieldError = error.issues.find(issue => 
    issue.path.join('.') === fieldName
  );
  
  return fieldError?.message;
};

// Check if a specific field has errors
export const hasFieldError = (error: z.ZodError, fieldName: string): boolean => {
  return error.issues.some(issue => issue.path.join('.') === fieldName);
};

// Safe validation that returns errors instead of throwing
export const safeValidate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: getValidationErrors(error) };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Async safe validation
export const safeValidateAsync = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> => {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: getValidationErrors(error) };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Custom validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Calculate password strength
  let strengthScore = 0;
  
  if (password.length >= 8) strengthScore += 1;
  if (password.length >= 12) strengthScore += 1;
  if (/[a-z]/.test(password)) strengthScore += 1;
  if (/[A-Z]/.test(password)) strengthScore += 1;
  if (/[0-9]/.test(password)) strengthScore += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strengthScore += 1;
  if (!/(.)\1{2,}/.test(password)) strengthScore += 1; // No repeated characters
  if (!/012|123|234|345|456|567|678|789|890/.test(password)) strengthScore += 1; // No sequential numbers
  
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  
  if (strengthScore >= 7) strength = 'strong';
  else if (strengthScore >= 5) strength = 'good';
  else if (strengthScore >= 3) strength = 'fair';
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

// Debounced validation for real-time form validation
export const createDebouncedValidator = <T>(
  schema: z.ZodSchema<T>,
  delay: number = 500
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (
    data: unknown,
    callback: (result: { success: true; data: T } | { success: false; errors: Record<string, string> }) => void
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      const result = safeValidate(schema, data);
      callback(result);
    }, delay);
  };
};

// Form field validation helpers
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): { isValid: boolean; error?: string } => {
  try {
    schema.parse({ [fieldName]: value });
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = getFieldError(error, fieldName);
      return { isValid: false, error: fieldError };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

// Password confirmation validation
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true };
};

// Email domain validation
export const validateEmailDomain = (email: string, allowedDomains?: string[]): boolean => {
  if (!validateEmail(email)) {
    return false;
  }
  
  if (!allowedDomains) {
    return true;
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.includes(domain);
};

// File validation helpers
export const validateFileSize = (file: File | { size: number }, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

export const validateFileType = (file: File | { type: string }, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateImageDimensions = (
  image: { width: number; height: number },
  maxWidth: number,
  maxHeight: number
): boolean => {
  return image.width <= maxWidth && image.height <= maxHeight;
};

// Age validation
export const validateAge = (dateOfBirth: string | Date, minAge: number = 13): boolean => {
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
};

// Credit card validation (basic Luhn algorithm)
export const validateCreditCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  
  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }
  
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

export default {
  getValidationErrors,
  getFieldError,
  hasFieldError,
  safeValidate,
  safeValidateAsync,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateUrl,
  validateHexColor,
  createDebouncedValidator,
  validateField,
  validatePasswordConfirmation,
  validateEmailDomain,
  validateFileSize,
  validateFileType,
  validateImageDimensions,
  validateAge,
  validateCreditCard,
};