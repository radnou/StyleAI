import { z } from 'zod';

// Common email validation
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .trim()
  .toLowerCase();

// Common password validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Common name validation
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
  rememberMe: z.boolean().optional(),
});

// Registration form schema
export const registerSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must agree to the terms and conditions',
      }),
    subscribeToNewsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Forgot password form schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password form schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Change password form schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .max(128, 'Password must be less than 128 characters'),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Email verification form schema
export const emailVerificationSchema = z.object({
  email: emailSchema,
  verificationCode: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// Phone verification form schema
export const phoneVerificationSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .max(15, 'Phone number must be less than 15 characters'),
  verificationCode: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// Social auth linking schema
export const socialAuthSchema = z.object({
  provider: z.enum(['google', 'apple', 'facebook', 'twitter'], {
    required_error: 'Provider is required',
    invalid_type_error: 'Invalid provider',
  }),
  providerUserId: z.string().min(1, 'Provider user ID is required'),
  email: emailSchema.optional(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
});

// Two-factor authentication setup schema
export const twoFactorSetupSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
  backupCodes: z.array(z.string()).optional(),
});

// Two-factor authentication verification schema
export const twoFactorVerificationSchema = z.object({
  code: z
    .string()
    .min(1, 'Authentication code is required')
    .length(6, 'Authentication code must be 6 digits')
    .regex(/^\d{6}$/, 'Authentication code must contain only numbers'),
  trustDevice: z.boolean().optional(),
});

// Export types for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
export type PhoneVerificationFormData = z.infer<typeof phoneVerificationSchema>;
export type SocialAuthFormData = z.infer<typeof socialAuthSchema>;
export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>;
export type TwoFactorVerificationFormData = z.infer<typeof twoFactorVerificationSchema>;

// Export individual field schemas for reuse
export { emailSchema, passwordSchema, nameSchema };