import {
  Auth,
  User as FirebaseUser,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  checkActionCode,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  onAuthStateChanged,
  Unsubscribe,
  ActionCodeInfo,
  reload,
} from 'firebase/auth';
import { IAuthService } from '../../application/services';
import { Result } from '@core/types/result';
import { FirebaseErrorMapper } from '../errors/FirebaseErrorMapper';
import { ILogger } from '../../application/services';

/**
 * Firebase implementation of the IAuthService interface
 * Handles all Firebase Authentication operations
 */
export class FirebaseAuthService implements IAuthService {
  private readonly auth: Auth;
  private readonly logger?: ILogger;
  private readonly retryOptions: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
  };

  constructor(auth: Auth, logger?: ILogger) {
    this.auth = auth;
    this.logger = logger;
    this.retryOptions = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffFactor: 2,
    };

    this.logger?.info('FirebaseAuthService initialized', {
      appName: auth.app.name,
      config: auth.config,
    });
  }

  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string, displayName: string): Promise<Result<string, string>> {
    try {
      this.logger?.info('Attempting user registration', { email, displayName });

      // Validate inputs
      if (!email || !password || !displayName) {
        return Result.fail<string, string>('Email, password, and display name are required');
      }

      // Create user with Firebase Auth
      const userCredential = await this.retryOperation(() =>
        createUserWithEmailAndPassword(this.auth, email, password)
      );

      const user = userCredential.user;

      // Update user profile with display name
      await this.retryOperation(() =>
        updateProfile(user, { displayName })
      );

      // Send email verification
      await user.sendEmailVerification();

      this.logger?.info('User registration successful', {
        userId: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      });

      return Result.ok<string>(user.uid);
    } catch (error: any) {
      this.logger?.error('User registration failed', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<string, string>(domainError.message);
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticate(email: string, password: string): Promise<Result<string, string>> {
    try {
      this.logger?.info('Attempting user authentication', { email });

      // Validate inputs
      if (!email || !password) {
        return Result.fail<string, string>('Email and password are required');
      }

      // Sign in with Firebase Auth
      const userCredential = await this.retryOperation(() =>
        signInWithEmailAndPassword(this.auth, email, password)
      );

      const user = userCredential.user;

      this.logger?.info('User authentication successful', {
        userId: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        lastSignInTime: user.metadata.lastSignInTime,
      });

      return Result.ok<string>(user.uid);
    } catch (error: any) {
      this.logger?.error('User authentication failed', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<string, string>(domainError.message);
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<Result<void, string>> {
    try {
      const currentUserId = this.auth.currentUser?.uid;
      this.logger?.info('Attempting user sign out', { userId: currentUserId });

      await this.retryOperation(() => signOut(this.auth));

      this.logger?.info('User sign out successful', { userId: currentUserId });
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('User sign out failed', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<Result<void, string>> {
    try {
      this.logger?.info('Sending password reset email', { email });

      // Validate input
      if (!email) {
        return Result.fail<void, string>('Email is required');
      }

      await this.retryOperation(() =>
        sendPasswordResetEmail(this.auth, email)
      );

      this.logger?.info('Password reset email sent successfully', { email });
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to send password reset email', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(userId: string): Promise<Result<void, string>> {
    try {
      this.logger?.info('Sending email verification', { userId });

      const user = this.auth.currentUser;
      if (!user || user.uid !== userId) {
        return Result.fail<void, string>('User not authenticated or user ID mismatch');
      }

      await this.retryOperation(() => user.sendEmailVerification());

      this.logger?.info('Email verification sent successfully', { userId });
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to send email verification', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Get the current authenticated user ID
   */
  async getCurrentUserId(): Promise<string | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return null;
      }

      // Refresh user data to ensure it's current
      await reload(user);
      return user.uid;
    } catch (error: any) {
      this.logger?.error('Failed to get current user ID', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return false;
      }

      // Refresh user data to ensure it's current
      await reload(user);
      return true;
    } catch (error: any) {
      this.logger?.error('Failed to check authentication status', error);
      return false;
    }
  }

  /**
   * Listen for authentication state changes
   */
  onAuthStateChanged(callback: (userId: string | null) => void): () => void {
    this.logger?.info('Setting up auth state listener');

    const unsubscribe: Unsubscribe = onAuthStateChanged(
      this.auth,
      (user: FirebaseUser | null) => {
        try {
          const userId = user?.uid || null;
          this.logger?.debug('Auth state changed', {
            userId,
            email: user?.email,
            emailVerified: user?.emailVerified,
          });
          callback(userId);
        } catch (error: any) {
          this.logger?.error('Error in auth state change handler', error);
        }
      },
      (error: any) => {
        this.logger?.error('Auth state change error', error);
        callback(null);
      }
    );

    return () => {
      this.logger?.info('Unsubscribing from auth state listener');
      unsubscribe();
    };
  }

  /**
   * Update user profile information
   */
  async updateProfile(userId: string, updates: { displayName?: string; photoURL?: string }): Promise<Result<void, string>> {
    try {
      this.logger?.info('Updating user profile', { userId, updates });

      const user = this.auth.currentUser;
      if (!user || user.uid !== userId) {
        return Result.fail<void, string>('User not authenticated or user ID mismatch');
      }

      await this.retryOperation(() => updateProfile(user, updates));

      // Refresh user data
      await reload(user);

      this.logger?.info('User profile updated successfully', { userId, updates });
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to update user profile', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Update user email
   */
  async updateEmail(userId: string, newEmail: string): Promise<Result<void, string>> {
    try {
      this.logger?.info('Updating user email', { userId, newEmail });

      const user = this.auth.currentUser;
      if (!user || user.uid !== userId) {
        return Result.fail<void, string>('User not authenticated or user ID mismatch');
      }

      // Validate input
      if (!newEmail) {
        return Result.fail<void, string>('New email is required');
      }

      await this.retryOperation(() => updateEmail(user, newEmail));

      // Refresh user data
      await reload(user);

      this.logger?.info('User email updated successfully', { userId, newEmail });
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to update user email', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<Result<void, string>> {
    try {
      this.logger?.info('Updating user password', { userId });

      const user = this.auth.currentUser;
      if (!user || user.uid !== userId) {
        return Result.fail<void, string>('User not authenticated or user ID mismatch');
      }

      // Validate input
      if (!newPassword) {
        return Result.fail<void, string>('New password is required');
      }

      await this.retryOperation(() => updatePassword(user, newPassword));

      this.logger?.info('User password updated successfully', { userId });
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to update user password', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<Result<void, string>> {
    try {
      this.logger?.info('Deleting user account', { userId });

      const user = this.auth.currentUser;
      if (!user || user.uid !== userId) {
        return Result.fail<void, string>('User not authenticated or user ID mismatch');
      }

      await this.retryOperation(() => deleteUser(user));

      this.logger?.info('User account deleted successfully', { userId });
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to delete user account', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Get user's ID token
   */
  async getIdToken(forceRefresh: boolean = false): Promise<Result<string, string>> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return Result.fail<string, string>('User not authenticated');
      }

      const token = await this.retryOperation(() => user.getIdToken(forceRefresh));

      this.logger?.debug('ID token retrieved successfully', {
        userId: user.uid,
        forceRefresh,
      });

      return Result.ok<string>(token);
    } catch (error: any) {
      this.logger?.error('Failed to get ID token', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<string, string>(domainError.message);
    }
  }

  /**
   * Verify password reset code
   */
  async verifyPasswordResetCode(code: string): Promise<Result<string, string>> {
    try {
      this.logger?.info('Verifying password reset code');

      // Validate input
      if (!code) {
        return Result.fail<string, string>('Reset code is required');
      }

      const email = await this.retryOperation(() =>
        verifyPasswordResetCode(this.auth, code)
      );

      this.logger?.info('Password reset code verified successfully', { email });
      return Result.ok<string>(email);
    } catch (error: any) {
      this.logger?.error('Failed to verify password reset code', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<string, string>(domainError.message);
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<Result<void, string>> {
    try {
      this.logger?.info('Confirming password reset');

      // Validate inputs
      if (!code || !newPassword) {
        return Result.fail<void, string>('Reset code and new password are required');
      }

      await this.retryOperation(() =>
        confirmPasswordReset(this.auth, code, newPassword)
      );

      this.logger?.info('Password reset confirmed successfully');
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to confirm password reset', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Apply action code (email verification)
   */
  async applyActionCode(code: string): Promise<Result<void, string>> {
    try {
      this.logger?.info('Applying action code');

      // Validate input
      if (!code) {
        return Result.fail<void, string>('Action code is required');
      }

      await this.retryOperation(() => applyActionCode(this.auth, code));

      this.logger?.info('Action code applied successfully');
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to apply action code', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Check action code validity
   */
  async checkActionCode(code: string): Promise<Result<ActionCodeInfo, string>> {
    try {
      this.logger?.info('Checking action code');

      // Validate input
      if (!code) {
        return Result.fail<ActionCodeInfo, string>('Action code is required');
      }

      const actionInfo = await this.retryOperation(() =>
        checkActionCode(this.auth, code)
      );

      this.logger?.info('Action code checked successfully', {
        operation: actionInfo.operation,
        email: actionInfo.data.email,
      });

      return Result.ok<ActionCodeInfo>(actionInfo);
    } catch (error: any) {
      this.logger?.error('Failed to check action code', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<ActionCodeInfo, string>(domainError.message);
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === this.retryOptions.maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryOptions.baseDelay * Math.pow(this.retryOptions.backoffFactor, attempt),
          this.retryOptions.maxDelay
        );
        
        this.logger?.warn(`Operation failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries: this.retryOptions.maxRetries,
          error: error.message,
        });
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Determines if an error should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    if (!error.code) {
      return false;
    }

    // Don't retry authentication errors
    const nonRetryableErrors = [
      'auth/invalid-email',
      'auth/user-disabled',
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/invalid-credential',
      'auth/email-already-in-use',
      'auth/weak-password',
      'auth/operation-not-allowed',
      'auth/invalid-verification-code',
      'auth/invalid-verification-id',
      'auth/code-expired',
      'auth/invalid-action-code',
      'auth/expired-action-code',
      'auth/invalid-continue-uri',
      'auth/unauthorized-continue-uri',
      'auth/missing-continue-uri',
      'auth/invalid-dynamic-link-domain',
      'auth/argument-error',
      'auth/invalid-persistence-type',
      'auth/unsupported-persistence-type',
      'auth/invalid-auth-event',
      'auth/auth-domain-config-required',
      'auth/cancelled-popup-request',
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/unauthorized-domain',
      'auth/invalid-user-token',
      'auth/user-token-expired',
      'auth/null-user',
      'auth/app-deleted',
      'auth/invalid-api-key',
      'auth/requires-recent-login',
      'auth/web-storage-unsupported',
      'auth/invalid-claims',
      'auth/claims-too-large',
      'auth/id-token-expired',
      'auth/id-token-revoked',
      'auth/invalid-id-token',
      'auth/token-refresh-unavailable',
    ];

    return nonRetryableErrors.includes(error.code);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get Firebase Auth instance
   */
  getAuth(): Auth {
    return this.auth;
  }

  /**
   * Get current Firebase user
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Refresh current user data
   */
  async refreshCurrentUser(): Promise<Result<void, string>> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return Result.fail<void, string>('User not authenticated');
      }

      await reload(user);
      return Result.ok<void>();
    } catch (error: any) {
      this.logger?.error('Failed to refresh user data', error);
      const domainError = FirebaseErrorMapper.mapAuthError(error);
      return Result.fail<void, string>(domainError.message);
    }
  }

  /**
   * Wait for authentication state to initialize
   */
  async waitForAuthInit(timeoutMs: number = 5000): Promise<Result<void, string>> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(Result.fail<void, string>('Authentication initialization timeout'));
      }, timeoutMs);

      const unsubscribe = onAuthStateChanged(this.auth, () => {
        clearTimeout(timeout);
        unsubscribe();
        resolve(Result.ok<void>());
      });
    });
  }
}