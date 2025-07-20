import { z } from 'zod';
import { emailSchema, nameSchema } from './auth-schemas';

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  displayName: z
    .string()
    .max(50, 'Display name must be less than 50 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  dateOfBirth: z
    .string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    }, 'You must be at least 13 years old')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional(),
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
  profilePicture: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
});

// Style preferences schema
export const stylePreferencesSchema = z.object({
  favoriteColors: z
    .array(z.string())
    .max(10, 'You can select up to 10 favorite colors')
    .optional(),
  stylePersonality: z
    .array(z.enum([
      'classic',
      'trendy',
      'minimalist',
      'bohemian',
      'edgy',
      'romantic',
      'sporty',
      'vintage',
      'glamorous',
      'casual',
    ]))
    .max(5, 'You can select up to 5 style personalities')
    .optional(),
  bodyType: z
    .enum([
      'pear',
      'apple',
      'hourglass',
      'rectangle',
      'inverted-triangle',
      'prefer-not-to-say',
    ])
    .optional(),
  sizePreferences: z
    .object({
      topSize: z.string().optional(),
      bottomSize: z.string().optional(),
      shoeSize: z.string().optional(),
      dressSize: z.string().optional(),
    })
    .optional(),
  budgetRange: z
    .enum([
      'under-50',
      '50-100',
      '100-200',
      '200-500',
      'over-500',
    ])
    .optional(),
  occasionPreferences: z
    .array(z.enum([
      'work',
      'casual',
      'formal',
      'party',
      'date',
      'workout',
      'travel',
      'special-event',
    ]))
    .optional(),
  brandPreferences: z
    .array(z.string())
    .max(20, 'You can select up to 20 preferred brands')
    .optional(),
  avoidColors: z
    .array(z.string())
    .max(10, 'You can select up to 10 colors to avoid')
    .optional(),
  sustainabilityPreference: z
    .enum(['very-important', 'somewhat-important', 'not-important'])
    .optional(),
});

// Privacy settings schema
export const privacySettingsSchema = z.object({
  profileVisibility: z
    .enum(['public', 'friends-only', 'private'])
    .default('public'),
  showEmail: z.boolean().default(false),
  showPhoneNumber: z.boolean().default(false),
  showLocation: z.boolean().default(false),
  allowMessaging: z.boolean().default(true),
  allowTagging: z.boolean().default(true),
  searchable: z.boolean().default(true),
  showOnlineStatus: z.boolean().default(true),
  dataProcessingConsent: z.boolean().default(true),
  marketingConsent: z.boolean().default(false),
  analyticsConsent: z.boolean().default(true),
});

// Notification settings schema
export const notificationSettingsSchema = z.object({
  email: z.object({
    styleRecommendations: z.boolean().default(true),
    wardrobeReminders: z.boolean().default(true),
    newFeatures: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
    securityAlerts: z.boolean().default(true),
    accountUpdates: z.boolean().default(true),
  }),
  push: z.object({
    styleRecommendations: z.boolean().default(true),
    wardrobeReminders: z.boolean().default(true),
    socialInteractions: z.boolean().default(true),
    appUpdates: z.boolean().default(true),
    securityAlerts: z.boolean().default(true),
  }),
  inApp: z.object({
    styleRecommendations: z.boolean().default(true),
    wardrobeReminders: z.boolean().default(true),
    socialInteractions: z.boolean().default(true),
    tips: z.boolean().default(true),
  }),
});

// Account settings schema
export const accountSettingsSchema = z.object({
  email: emailSchema,
  language: z
    .enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'])
    .default('en'),
  timezone: z.string().default('UTC'),
  currency: z
    .enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'KRW', 'CNY'])
    .default('USD'),
  measurementSystem: z
    .enum(['metric', 'imperial'])
    .default('metric'),
  theme: z
    .enum(['light', 'dark', 'system'])
    .default('system'),
  twoFactorEnabled: z.boolean().default(false),
  loginAlerts: z.boolean().default(true),
  sessionTimeout: z
    .enum(['15min', '30min', '1hour', '2hours', '24hours'])
    .default('2hours'),
});

// Subscription preferences schema
export const subscriptionPreferencesSchema = z.object({
  plan: z.enum(['free', 'premium', 'pro']).default('free'),
  autoRenewal: z.boolean().default(true),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  paymentMethod: z.string().optional(),
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

// Export types for TypeScript
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type StylePreferencesFormData = z.infer<typeof stylePreferencesSchema>;
export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;
export type SubscriptionPreferencesFormData = z.infer<typeof subscriptionPreferencesSchema>;