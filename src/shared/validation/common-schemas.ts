import { z } from 'zod';

// Common utility schemas
export const idSchema = z.string().uuid('Invalid ID format');

export const timestampSchema = z
  .union([z.string(), z.date()])
  .transform((val) => (typeof val === 'string' ? new Date(val) : val));

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(2048, 'URL must be less than 2048 characters');

export const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color');

export const phoneNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .max(15, 'Phone number must be less than 15 characters');

export const postalCodeSchema = z
  .string()
  .regex(/^[A-Za-z0-9\s-]{3,10}$/, 'Please enter a valid postal code')
  .max(10, 'Postal code must be less than 10 characters');

// Image/file schemas
export const imageSchema = z.object({
  uri: z.string().url('Invalid image URL'),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(10 * 1024 * 1024, 'Image must be less than 10MB'),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const fileSchema = z.object({
  uri: z.string().url('Invalid file URL'),
  type: z.string().min(1, 'File type is required'),
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(50 * 1024 * 1024, 'File must be less than 50MB'),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(255, 'Search query must be less than 255 characters'),
  filters: z.record(z.string(), z.any()).optional(),
  facets: z.array(z.string()).optional(),
  ...paginationSchema.shape,
});

// Location schemas
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(255, 'Street address must be less than 255 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(1, 'State is required').max(100, 'State must be less than 100 characters'),
  postalCode: postalCodeSchema,
  country: z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters'),
  coordinates: coordinatesSchema.optional(),
});

// Money/currency schemas
export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'KRW', 'CNY']);

export const moneySchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  currency: currencySchema,
});

export const priceRangeSchema = z.object({
  min: z.number().min(0, 'Minimum price must be positive'),
  max: z.number().min(0, 'Maximum price must be positive'),
  currency: currencySchema,
}).refine((data) => data.min <= data.max, {
  message: 'Minimum price must be less than or equal to maximum price',
  path: ['min'],
});

// Rating/review schemas
export const ratingSchema = z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5');

export const reviewSchema = z.object({
  rating: ratingSchema,
  title: z.string().min(1, 'Review title is required').max(100, 'Review title must be less than 100 characters'),
  content: z.string().min(10, 'Review content must be at least 10 characters').max(1000, 'Review content must be less than 1000 characters'),
  helpful: z.boolean().default(false),
  verified: z.boolean().default(false),
});

// Tag schemas
export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(30, 'Tag name must be less than 30 characters'),
  slug: slugSchema,
  color: colorSchema.optional(),
  category: z.string().optional(),
});

// Metadata schemas
export const metadataSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]));

// Common response schemas
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Export types for TypeScript
export type ID = z.infer<typeof idSchema>;
export type Timestamp = z.infer<typeof timestampSchema>;
export type Slug = z.infer<typeof slugSchema>;
export type URL = z.infer<typeof urlSchema>;
export type Color = z.infer<typeof colorSchema>;
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;
export type PostalCode = z.infer<typeof postalCodeSchema>;
export type Image = z.infer<typeof imageSchema>;
export type File = z.infer<typeof fileSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type CursorPagination = z.infer<typeof cursorPaginationSchema>;
export type Search = z.infer<typeof searchSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type Money = z.infer<typeof moneySchema>;
export type PriceRange = z.infer<typeof priceRangeSchema>;
export type Rating = z.infer<typeof ratingSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;