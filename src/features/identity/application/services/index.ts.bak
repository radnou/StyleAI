import { Result } from '@core/types/result';

/**
 * Email service interface for sending emails
 */
export interface IEmailService {
  /**
   * Send welcome email to new user
   * @param email User's email address
   * @param displayName User's display name
   * @returns Result indicating success or failure
   */
  sendWelcomeEmail(email: string, displayName: string): Promise<Result<void, string>>;

  /**
   * Send email verification email
   * @param email User's email address
   * @param token Verification token
   * @returns Result indicating success or failure
   */
  sendEmailVerification(email: string, token: string): Promise<Result<void, string>>;

  /**
   * Send password reset email
   * @param email User's email address
   * @param token Password reset token
   * @returns Result indicating success or failure
   */
  sendPasswordResetEmail(email: string, token: string): Promise<Result<void, string>>;
}

/**
 * Password hashing service interface
 */
export interface IPasswordHasher {
  /**
   * Hash a password using secure algorithm
   * @param password Plain text password
   * @returns Hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Verify a password against its hash
   * @param password Plain text password
   * @param hash Hashed password
   * @returns True if password matches hash
   */
  verify(password: string, hash: string): Promise<boolean>;
}

/**
 * Token service interface for generating authentication tokens
 */
export interface ITokenService {
  /**
   * Generate access token for user
   * @param userId User's unique identifier
   * @param expiresIn Optional expiration time in seconds
   * @returns Access token
   */
  generateAccessToken(userId: string, expiresIn?: number): Promise<string>;

  /**
   * Generate refresh token for user
   * @param userId User's unique identifier
   * @param expiresIn Optional expiration time in seconds
   * @returns Refresh token
   */
  generateRefreshToken(userId: string, expiresIn?: number): Promise<string>;

  /**
   * Verify and decode access token
   * @param token Access token to verify
   * @returns Decoded token payload or null if invalid
   */
  verifyAccessToken(token: string): Promise<any | null>;

  /**
   * Verify and decode refresh token
   * @param token Refresh token to verify
   * @returns Decoded token payload or null if invalid
   */
  verifyRefreshToken(token: string): Promise<any | null>;
}

/**
 * Image service interface for handling image uploads
 */
export interface IImageService {
  /**
   * Upload an image and return the URL
   * @param imageData Image data buffer
   * @param fileName Original file name
   * @param folder Optional folder path
   * @returns URL of uploaded image
   */
  uploadImage(imageData: Buffer, fileName: string, folder?: string): Promise<string>;

  /**
   * Delete an image by URL
   * @param imageUrl URL of image to delete
   */
  deleteImage(imageUrl: string): Promise<void>;

  /**
   * Validate image format and size
   * @param imageData Image data buffer
   * @param fileName Original file name
   * @param maxSizeBytes Maximum allowed size in bytes
   * @returns Result indicating if image is valid
   */
  validateImage(imageData: Buffer, fileName: string, maxSizeBytes: number): Result<void, string>;
}

/**
 * Logger interface for application logging
 */
export interface ILogger {
  /**
   * Log info level message
   * @param message Log message
   * @param metadata Optional metadata object
   */
  info(message: string, metadata?: any): void;

  /**
   * Log warning level message
   * @param message Log message
   * @param metadata Optional metadata object
   */
  warn(message: string, metadata?: any): void;

  /**
   * Log error level message
   * @param message Log message
   * @param error Optional error object
   */
  error(message: string, error?: Error): void;

  /**
   * Log debug level message
   * @param message Log message
   * @param metadata Optional metadata object
   */
  debug(message: string, metadata?: any): void;
}

/**
 * Content moderation service interface
 */
export interface IContentModerationService {
  /**
   * Check if text contains prohibited content
   * @param text Text to check
   * @returns Result with true if content is allowed, false with reason if not
   */
  isContentAllowed(text: string): Promise<Result<boolean, string>>;

  /**
   * Sanitize HTML content to prevent XSS
   * @param html HTML content to sanitize
   * @returns Sanitized HTML content
   */
  sanitizeHtml(html: string): string;
}

/**
 * Rate limiting service interface
 */
export interface IRateLimitService {
  /**
   * Check if action is rate limited for given identifier
   * @param action Action being performed
   * @param identifier Unique identifier (IP, user ID, etc.)
   * @param limit Number of attempts allowed
   * @param windowSeconds Time window in seconds
   * @returns Result with true if allowed, false with reason if rate limited
   */
  isAllowed(action: string, identifier: string, limit: number, windowSeconds: number): Promise<Result<boolean, string>>;

  /**
   * Record an attempt for rate limiting
   * @param action Action being performed
   * @param identifier Unique identifier
   */
  recordAttempt(action: string, identifier: string): Promise<void>;
}

/**
 * Authentication service interface for Firebase Auth integration
 */
export interface IAuthService {
  /**
   * Register a new user with email and password
   * @param email User's email address
   * @param password User's password
   * @param displayName User's display name
   * @returns Result with user ID if successful, error if failed
   */
  register(email: string, password: string, displayName: string): Promise<Result<string, string>>;

  /**
   * Authenticate user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Result with user ID if successful, error if failed
   */
  authenticate(email: string, password: string): Promise<Result<string, string>>;

  /**
   * Sign out the current user
   * @returns Result indicating success or failure
   */
  signOut(): Promise<Result<void, string>>;

  /**
   * Send password reset email
   * @param email User's email address
   * @returns Result indicating success or failure
   */
  sendPasswordResetEmail(email: string): Promise<Result<void, string>>;

  /**
   * Send email verification
   * @param userId User's ID
   * @returns Result indicating success or failure
   */
  sendEmailVerification(userId: string): Promise<Result<void, string>>;

  /**
   * Get the current authenticated user ID
   * @returns Current user ID or null if not authenticated
   */
  getCurrentUserId(): Promise<string | null>;

  /**
   * Check if user is authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Listen for authentication state changes
   * @param callback Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (userId: string | null) => void): () => void;

  /**
   * Update user profile information
   * @param userId User's ID
   * @param updates Profile updates
   * @returns Result indicating success or failure
   */
  updateProfile(userId: string, updates: { displayName?: string; photoURL?: string }): Promise<Result<void, string>>;

  /**
   * Update user email
   * @param userId User's ID
   * @param newEmail New email address
   * @returns Result indicating success or failure
   */
  updateEmail(userId: string, newEmail: string): Promise<Result<void, string>>;

  /**
   * Update user password
   * @param userId User's ID
   * @param newPassword New password
   * @returns Result indicating success or failure
   */
  updatePassword(userId: string, newPassword: string): Promise<Result<void, string>>;

  /**
   * Delete user account
   * @param userId User's ID
   * @returns Result indicating success or failure
   */
  deleteUser(userId: string): Promise<Result<void, string>>;

  /**
   * Get user's ID token
   * @param forceRefresh Force token refresh
   * @returns Result with token if successful, error if failed
   */
  getIdToken(forceRefresh?: boolean): Promise<Result<string, string>>;

  /**
   * Verify password reset code
   * @param code Reset code
   * @returns Result with email if valid, error if invalid
   */
  verifyPasswordResetCode(code: string): Promise<Result<string, string>>;

  /**
   * Confirm password reset
   * @param code Reset code
   * @param newPassword New password
   * @returns Result indicating success or failure
   */
  confirmPasswordReset(code: string, newPassword: string): Promise<Result<void, string>>;

  /**
   * Apply action code (email verification)
   * @param code Action code
   * @returns Result indicating success or failure
   */
  applyActionCode(code: string): Promise<Result<void, string>>;

  /**
   * Check action code validity
   * @param code Action code
   * @returns Result with action info if valid, error if invalid
   */
  checkActionCode(code: string): Promise<Result<any, string>>;
}