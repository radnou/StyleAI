import { Result } from '@core/types/result';

// This test file defines the expected behavior for Auth Service Integration
// Following TDD principles, these tests should FAIL until implementation is complete

describe('AuthService Integration Tests', () => {
  // Mock Firebase Auth
  interface FirebaseUser {
    uid: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    photoURL?: string;
    getIdToken(): Promise<string>;
    sendEmailVerification(): Promise<void>;
  }

  interface FirebaseAuth {
    currentUser: FirebaseUser | null;
    createUserWithEmailAndPassword(email: string, password: string): Promise<{ user: FirebaseUser }>;
    signInWithEmailAndPassword(email: string, password: string): Promise<{ user: FirebaseUser }>;
    signOut(): Promise<void>;
    sendPasswordResetEmail(email: string): Promise<void>;
    confirmPasswordReset(code: string, newPassword: string): Promise<void>;
    verifyPasswordResetCode(code: string): Promise<string>;
    applyActionCode(code: string): Promise<void>;
    onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void;
  }

  // Mock Dependencies
  interface IUserRepository {
    findByEmail(email: string): Promise<any>;
    save(user: any): Promise<void>;
    findById(id: string): Promise<any>;
  }

  interface IEmailService {
    sendWelcomeEmail(email: string, displayName: string): Promise<Result<void, string>>;
    sendPasswordResetEmail(email: string, resetLink: string): Promise<Result<void, string>>;
  }

  interface ILogger {
    info(message: string, metadata?: any): void;
    error(message: string, error?: Error): void;
    warn(message: string, metadata?: any): void;
  }

  // Auth Service Interface
  interface IAuthService {
    register(email: string, password: string, displayName: string): Promise<Result<AuthResult, string>>;
    login(email: string, password: string): Promise<Result<AuthResult, string>>;
    logout(): Promise<Result<void, string>>;
    resetPassword(email: string): Promise<Result<void, string>>;
    confirmPasswordReset(code: string, newPassword: string): Promise<Result<void, string>>;
    verifyEmail(code: string): Promise<Result<void, string>>;
    refreshToken(): Promise<Result<string, string>>;
    getCurrentUser(): Promise<Result<AuthResult | null, string>>;
    deleteAccount(): Promise<Result<void, string>>;
  }

  interface AuthResult {
    user: {
      uid: string;
      email: string;
      displayName?: string;
      emailVerified: boolean;
    };
    token: string;
    refreshToken: string;
  }

  // Mock AuthService implementation
  class AuthService implements IAuthService {
    constructor(
      private firebaseAuth: FirebaseAuth,
      private userRepository: IUserRepository,
      private emailService: IEmailService,
      private logger: ILogger
    ) {}

    async register(email: string, password: string, displayName: string): Promise<Result<AuthResult, string>> {
      throw new Error('AuthService.register not implemented');
    }

    async login(email: string, password: string): Promise<Result<AuthResult, string>> {
      throw new Error('AuthService.login not implemented');
    }

    async logout(): Promise<Result<void, string>> {
      throw new Error('AuthService.logout not implemented');
    }

    async resetPassword(email: string): Promise<Result<void, string>> {
      throw new Error('AuthService.resetPassword not implemented');
    }

    async confirmPasswordReset(code: string, newPassword: string): Promise<Result<void, string>> {
      throw new Error('AuthService.confirmPasswordReset not implemented');
    }

    async verifyEmail(code: string): Promise<Result<void, string>> {
      throw new Error('AuthService.verifyEmail not implemented');
    }

    async refreshToken(): Promise<Result<string, string>> {
      throw new Error('AuthService.refreshToken not implemented');
    }

    async getCurrentUser(): Promise<Result<AuthResult | null, string>> {
      throw new Error('AuthService.getCurrentUser not implemented');
    }

    async deleteAccount(): Promise<Result<void, string>> {
      throw new Error('AuthService.deleteAccount not implemented');
    }
  }

  // Mock implementations
  let mockFirebaseAuth: jest.Mocked<FirebaseAuth>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockEmailService: jest.Mocked<IEmailService>;
  let mockLogger: jest.Mocked<ILogger>;
  let authService: IAuthService;

  beforeEach(() => {
    mockFirebaseAuth = {
      currentUser: null,
      createUserWithEmailAndPassword: jest.fn(),
      signInWithEmailAndPassword: jest.fn(),
      signOut: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      confirmPasswordReset: jest.fn(),
      verifyPasswordResetCode: jest.fn(),
      applyActionCode: jest.fn(),
      onAuthStateChanged: jest.fn(),
    };

    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };

    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    authService = new AuthService(
      mockFirebaseAuth,
      mockUserRepository,
      mockEmailService,
      mockLogger
    );
  });

  describe('register', () => {
    it('should register user successfully with Firebase and local database', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';
      const displayName = 'John Doe';

      const mockFirebaseUser: FirebaseUser = {
        uid: 'firebase-uid-123',
        email,
        emailVerified: false,
        displayName,
        getIdToken: jest.fn().mockResolvedValue('firebase-token'),
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      };

      mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();
      mockEmailService.sendWelcomeEmail.mockResolvedValue(Result.ok());

      const result = await authService.register(email, password, displayName);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().user.uid).toBe('firebase-uid-123');
      expect(result.getValue().user.email).toBe(email);
      expect(result.getValue().user.emailVerified).toBe(false);
      expect(result.getValue().token).toBe('firebase-token');

      expect(mockFirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(email, displayName);
    });

    it('should fail when user already exists in local database', async () => {
      const email = 'existing@example.com';
      const password = 'securePassword123!';
      const displayName = 'John Doe';

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing-user',
        email,
      });

      const result = await authService.register(email, password, displayName);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('User already exists');
      expect(mockFirebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should handle Firebase registration failure', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';
      const displayName = 'John Doe';

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockFirebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(
        new Error('Firebase: Email already in use')
      );

      const result = await authService.register(email, password, displayName);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Email already in use');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should rollback Firebase user if local database save fails', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';
      const displayName = 'John Doe';

      const mockFirebaseUser: FirebaseUser = {
        uid: 'firebase-uid-123',
        email,
        emailVerified: false,
        displayName,
        getIdToken: jest.fn().mockResolvedValue('firebase-token'),
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await authService.register(email, password, displayName);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Registration failed');
      
      // Should attempt to clean up Firebase user
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Registration failed, attempting to cleanup Firebase user',
        expect.any(Error)
      );
    });

    it('should send email verification after successful registration', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';
      const displayName = 'John Doe';

      const mockFirebaseUser: FirebaseUser = {
        uid: 'firebase-uid-123',
        email,
        emailVerified: false,
        displayName,
        getIdToken: jest.fn().mockResolvedValue('firebase-token'),
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      };

      mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();
      mockEmailService.sendWelcomeEmail.mockResolvedValue(Result.ok());

      await authService.register(email, password, displayName);

      expect(mockFirebaseUser.sendEmailVerification).toHaveBeenCalled();
    });

    it('should continue registration even if welcome email fails', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';
      const displayName = 'John Doe';

      const mockFirebaseUser: FirebaseUser = {
        uid: 'firebase-uid-123',
        email,
        emailVerified: false,
        displayName,
        getIdToken: jest.fn().mockResolvedValue('firebase-token'),
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      };

      mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue();
      mockEmailService.sendWelcomeEmail.mockResolvedValue(Result.fail('Email service down'));

      const result = await authService.register(email, password, displayName);

      expect(result.isSuccess).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to send welcome email',
        expect.any(Object)
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with Firebase', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';

      const mockFirebaseUser: FirebaseUser = {
        uid: 'firebase-uid-123',
        email,
        emailVerified: true,
        displayName: 'John Doe',
        getIdToken: jest.fn().mockResolvedValue('firebase-token'),
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      };

      mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        isActive: true,
      });
      mockUserRepository.save.mockResolvedValue();

      const result = await authService.login(email, password);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().user.uid).toBe('firebase-uid-123');
      expect(result.getValue().user.email).toBe(email);
      expect(result.getValue().token).toBe('firebase-token');

      expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
      expect(mockUserRepository.save).toHaveBeenCalled(); // Should update last login
    });

    it('should fail for incorrect credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Firebase: Invalid credentials')
      );

      const result = await authService.login(email, password);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Invalid credentials');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should fail for inactive users in local database', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';

      const mockFirebaseUser: FirebaseUser = {
        uid: 'firebase-uid-123',
        email,
        emailVerified: true,
        displayName: 'John Doe',
        getIdToken: jest.fn().mockResolvedValue('firebase-token'),
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      };

      mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        isActive: false,
      });

      const result = await authService.login(email, password);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Account is deactivated');
      expect(mockFirebaseAuth.signOut).toHaveBeenCalled(); // Should sign out from Firebase
    });

    it('should fail for unverified emails', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';

      const mockFirebaseUser: FirebaseUser = {
        uid: 'firebase-uid-123',
        email,
        emailVerified: false,
        displayName: 'John Doe',
        getIdToken: jest.fn().mockResolvedValue('firebase-token'),
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      };

      mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockFirebaseUser,
      });
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        isActive: true,
      });

      const result = await authService.login(email, password);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Email not verified');
      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should record failed login attempts', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Firebase: Invalid credentials')
      );
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        loginAttempts: 2,
      });
      mockUserRepository.save.mockResolvedValue();

      await authService.login(email, password);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          loginAttempts: 3,
        })
      );
    });

    it('should lock account after too many failed attempts', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Firebase: Invalid credentials')
      );
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        loginAttempts: 4, // 5th attempt will lock
      });
      mockUserRepository.save.mockResolvedValue();

      const result = await authService.login(email, password);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Account locked due to too many failed attempts');
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isLocked: true,
          lockoutUntil: expect.any(Date),
        })
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully from Firebase', async () => {
      mockFirebaseAuth.signOut.mockResolvedValue();

      const result = await authService.logout();

      expect(result.isSuccess).toBe(true);
      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle Firebase logout errors', async () => {
      mockFirebaseAuth.signOut.mockRejectedValue(new Error('Firebase logout error'));

      const result = await authService.logout();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Logout failed');
    });

    it('should log successful logout', async () => {
      mockFirebaseAuth.currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn(),
        sendEmailVerification: jest.fn(),
      };
      mockFirebaseAuth.signOut.mockResolvedValue();

      await authService.logout();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User logged out successfully',
        expect.objectContaining({
          userId: 'user-123',
        })
      );
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      const email = 'test@example.com';

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        isActive: true,
      });
      mockFirebaseAuth.sendPasswordResetEmail.mockResolvedValue();

      const result = await authService.resetPassword(email);

      expect(result.isSuccess).toBe(true);
      expect(mockFirebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(email);
    });

    it('should fail for nonexistent users', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.resetPassword(email);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('User not found');
      expect(mockFirebaseAuth.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should fail for inactive users', async () => {
      const email = 'test@example.com';

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        isActive: false,
      });

      const result = await authService.resetPassword(email);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Account is deactivated');
      expect(mockFirebaseAuth.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should handle Firebase errors', async () => {
      const email = 'test@example.com';

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        isActive: true,
      });
      mockFirebaseAuth.sendPasswordResetEmail.mockRejectedValue(
        new Error('Firebase: User not found')
      );

      const result = await authService.resetPassword(email);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Failed to send password reset email');
    });

    it('should rate limit password reset requests', async () => {
      const email = 'test@example.com';

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email,
        isActive: true,
        lastPasswordResetRequest: new Date(), // Recent request
      });

      const result = await authService.resetPassword(email);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Please wait before requesting another password reset');
    });
  });

  describe('confirmPasswordReset', () => {
    it('should confirm password reset successfully', async () => {
      const code = 'reset-code';
      const newPassword = 'newSecurePassword123!';

      mockFirebaseAuth.verifyPasswordResetCode.mockResolvedValue('test@example.com');
      mockFirebaseAuth.confirmPasswordReset.mockResolvedValue();
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });
      mockUserRepository.save.mockResolvedValue();

      const result = await authService.confirmPasswordReset(code, newPassword);

      expect(result.isSuccess).toBe(true);
      expect(mockFirebaseAuth.verifyPasswordResetCode).toHaveBeenCalledWith(code);
      expect(mockFirebaseAuth.confirmPasswordReset).toHaveBeenCalledWith(code, newPassword);
    });

    it('should fail for invalid reset code', async () => {
      const code = 'invalid-code';
      const newPassword = 'newSecurePassword123!';

      mockFirebaseAuth.verifyPasswordResetCode.mockRejectedValue(
        new Error('Firebase: Invalid code')
      );

      const result = await authService.confirmPasswordReset(code, newPassword);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Invalid or expired reset code');
    });

    it('should fail for weak new password', async () => {
      const code = 'reset-code';
      const newPassword = '123';

      const result = await authService.confirmPasswordReset(code, newPassword);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password is less than 8 characters');
      expect(mockFirebaseAuth.verifyPasswordResetCode).not.toHaveBeenCalled();
    });

    it('should unlock account after successful password reset', async () => {
      const code = 'reset-code';
      const newPassword = 'newSecurePassword123!';

      mockFirebaseAuth.verifyPasswordResetCode.mockResolvedValue('test@example.com');
      mockFirebaseAuth.confirmPasswordReset.mockResolvedValue();
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        isLocked: true,
        loginAttempts: 5,
      });
      mockUserRepository.save.mockResolvedValue();

      await authService.confirmPasswordReset(code, newPassword);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isLocked: false,
          loginAttempts: 0,
        })
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const code = 'verification-code';

      mockFirebaseAuth.applyActionCode.mockResolvedValue();
      mockFirebaseAuth.currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn(),
        sendEmailVerification: jest.fn(),
      };
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
      });
      mockUserRepository.save.mockResolvedValue();

      const result = await authService.verifyEmail(code);

      expect(result.isSuccess).toBe(true);
      expect(mockFirebaseAuth.applyActionCode).toHaveBeenCalledWith(code);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerified: true,
        })
      );
    });

    it('should fail for invalid verification code', async () => {
      const code = 'invalid-code';

      mockFirebaseAuth.applyActionCode.mockRejectedValue(
        new Error('Firebase: Invalid code')
      );

      const result = await authService.verifyEmail(code);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Invalid or expired verification code');
    });

    it('should fail if user is not authenticated', async () => {
      const code = 'verification-code';

      mockFirebaseAuth.currentUser = null;

      const result = await authService.verifyEmail(code);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('User not authenticated');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      mockFirebaseAuth.currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn().mockResolvedValue('new-token'),
        sendEmailVerification: jest.fn(),
      };

      const result = await authService.refreshToken();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe('new-token');
    });

    it('should fail if user is not authenticated', async () => {
      mockFirebaseAuth.currentUser = null;

      const result = await authService.refreshToken();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('User not authenticated');
    });

    it('should handle token refresh errors', async () => {
      mockFirebaseAuth.currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn().mockRejectedValue(new Error('Token refresh failed')),
        sendEmailVerification: jest.fn(),
      };

      const result = await authService.refreshToken();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Failed to refresh token');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      mockFirebaseAuth.currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        displayName: 'John Doe',
        getIdToken: jest.fn().mockResolvedValue('token'),
        sendEmailVerification: jest.fn(),
      };

      const result = await authService.getCurrentUser();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()?.user.uid).toBe('user-123');
      expect(result.getValue()?.user.email).toBe('test@example.com');
      expect(result.getValue()?.token).toBe('token');
    });

    it('should return null when not authenticated', async () => {
      mockFirebaseAuth.currentUser = null;

      const result = await authService.getCurrentUser();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBeNull();
    });

    it('should handle token generation errors', async () => {
      mockFirebaseAuth.currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn().mockRejectedValue(new Error('Token error')),
        sendEmailVerification: jest.fn(),
      };

      const result = await authService.getCurrentUser();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Failed to get current user');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      mockFirebaseAuth.currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn(),
        sendEmailVerification: jest.fn(),
      };
      
      const mockDeleteUser = jest.fn().mockResolvedValue(undefined);
      (mockFirebaseAuth.currentUser as any).delete = mockDeleteUser;

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });
      mockUserRepository.save.mockResolvedValue();

      const result = await authService.deleteAccount();

      expect(result.isSuccess).toBe(true);
      expect(mockDeleteUser).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Date),
        })
      );
    });

    it('should fail if user is not authenticated', async () => {
      mockFirebaseAuth.currentUser = null;

      const result = await authService.deleteAccount();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('User not authenticated');
    });

    it('should handle Firebase deletion errors', async () => {
      mockFirebaseAuth.currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn(),
        sendEmailVerification: jest.fn(),
      };
      
      const mockDeleteUser = jest.fn().mockRejectedValue(new Error('Deletion failed'));
      (mockFirebaseAuth.currentUser as any).delete = mockDeleteUser;

      const result = await authService.deleteAccount();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Failed to delete account');
    });
  });

  describe('auth state synchronization', () => {
    it('should sync local user state with Firebase auth state', async () => {
      const mockCallback = jest.fn();
      
      mockFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback({
          uid: 'user-123',
          email: 'test@example.com',
          emailVerified: true,
          getIdToken: jest.fn(),
          sendEmailVerification: jest.fn(),
        });
        return jest.fn(); // Unsubscribe function
      });

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });
      mockUserRepository.save.mockResolvedValue();

      // In real implementation, this would set up auth state listener
      const unsubscribe = mockFirebaseAuth.onAuthStateChanged(mockCallback);

      expect(mockCallback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle auth state changes', async () => {
      let authStateCallback: (user: FirebaseUser | null) => void;
      
      mockFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        return jest.fn();
      });

      // Simulate user login
      authStateCallback!({
        uid: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn(),
        sendEmailVerification: jest.fn(),
      });

      // Simulate user logout
      authStateCallback!(null);

      expect(mockFirebaseAuth.onAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe('error handling and recovery', () => {
    it('should handle network connectivity issues', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';

      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Network error')
      );

      const result = await authService.login(email, password);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Network error occurred');
    });

    it('should retry failed operations', async () => {
      const email = 'test@example.com';

      mockUserRepository.findByEmail
        .mockRejectedValueOnce(new Error('Temporary DB error'))
        .mockResolvedValueOnce({
          id: 'user-123',
          email,
          isActive: true,
        });
      mockFirebaseAuth.sendPasswordResetEmail.mockResolvedValue();

      const result = await authService.resetPassword(email);

      expect(result.isSuccess).toBe(true);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(2);
    });

    it('should log all errors for monitoring', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Firebase: Invalid credentials')
      );

      await authService.login(email, password);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Login failed',
        expect.objectContaining({
          email,
          error: expect.any(Error),
        })
      );
    });
  });

  describe('security and compliance', () => {
    it('should not log sensitive information', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123!';

      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('Firebase: Invalid credentials')
      );

      await authService.login(email, password);

      // Verify password is not logged
      expect(mockLogger.error).not.toHaveBeenCalledWith(
        expect.stringContaining(password)
      );
    });

    it('should validate input data', async () => {
      const email = '<script>alert("xss")</script>';
      const password = 'securePassword123!';

      const result = await authService.login(email, password);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Invalid email format');
    });

    it('should enforce rate limiting', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(
          new Error('Firebase: Invalid credentials')
        );
        await authService.login(email, password);
      }

      // 6th attempt should be rate limited
      const result = await authService.login(email, password);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Too many failed attempts');
    });
  });
});