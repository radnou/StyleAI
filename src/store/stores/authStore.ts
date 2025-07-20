import { StateCreator } from 'zustand';
import { Result } from '@core/types/result';
import { BaseError, AppError } from '@core/errors';
import { IAuthService } from '@features/identity/application/services';
import { IUserRepository } from '@features/identity/domain/repositories/IUserRepository';
import { User } from '@features/identity/domain/entities/User';
import { Email } from '@features/identity/domain/value-objects/Email';
import { UserId } from '@features/identity/domain/value-objects/UserId';
import { UserProfile } from '@features/identity/domain/value-objects/UserProfile';
import { googleAuthService } from '@/services/googleAuth';

/**
 * User authentication state - simplified version for the store
 */
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  isPremium: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: AuthUser | null;
  domainUser: User | null;
  error: string | null;
  authStateListener: (() => void) | null;
}

/**
 * Authentication actions
 */
export interface AuthActions {
  login: (email: string, password: string) => Promise<Result<AuthUser, BaseError>>;
  register: (email: string, password: string, displayName: string) => Promise<Result<AuthUser, BaseError>>;
  loginWithGoogle: () => Promise<Result<AuthUser, BaseError>>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<Result<void, BaseError>>;
  sendEmailVerification: () => Promise<Result<void, BaseError>>;
  updateAuthProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<Result<void, BaseError>>;
  refreshUser: () => Promise<Result<void, BaseError>>;
  initializeAuth: () => Promise<void>;
  cleanupAuth: () => void;
  updateAuthState: (updates: Partial<AuthState>) => void;
  clearAuthError: () => void;
}

/**
 * Complete auth slice interface
 */
export interface AuthSlice {
  auth: AuthState;
  login: AuthActions['login'];
  register: AuthActions['register'];
  loginWithGoogle: AuthActions['loginWithGoogle'];
  logout: AuthActions['logout'];
  sendPasswordResetEmail: AuthActions['sendPasswordResetEmail'];
  sendEmailVerification: AuthActions['sendEmailVerification'];
  updateAuthProfile: AuthActions['updateAuthProfile'];
  refreshUser: AuthActions['refreshUser'];
  initializeAuth: AuthActions['initializeAuth'];
  cleanupAuth: AuthActions['cleanupAuth'];
  updateAuthState: AuthActions['updateAuthState'];
  clearAuthError: AuthActions['clearAuthError'];
}

/**
 * Initial auth state
 */
const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  user: null,
  domainUser: null,
  error: null,
  authStateListener: null,
};

/**
 * Auth service and repository instances
 * These will be injected when creating the store
 */
let authService: IAuthService | null = null;
let userRepository: IUserRepository | null = null;

/**
 * Set the auth service and user repository instances
 */
export const setAuthDependencies = (
  authServiceInstance: IAuthService,
  userRepositoryInstance: IUserRepository
) => {
  authService = authServiceInstance;
  userRepository = userRepositoryInstance;
};

/**
 * Helper function to convert domain User to AuthUser
 */
const domainUserToAuthUser = (domainUser: User): AuthUser => ({
  uid: domainUser.userId.value,
  email: domainUser.email.value,
  displayName: domainUser.profile.displayName,
  photoURL: domainUser.profile.avatarUrl,
  emailVerified: domainUser.emailVerified,
  isPremium: domainUser.isPremium,
  createdAt: domainUser.createdAt,
  lastLoginAt: domainUser.lastLoginAt,
});

/**
 * Creates the auth store slice
 */
export const createAuthSlice: StateCreator<
  any,
  [['zustand/immer', never]],
  [],
  AuthSlice
> = (set, get) => ({
  auth: initialAuthState,

  login: async (email: string, password: string) => {
    if (!authService || !userRepository) {
      const error = new AppError.UnexpectedError('Auth service not initialized');
      set((state: any) => {
        state.auth.error = error.message;
      });
      return Result.fail(error);
    }

    set((state: any) => {
      state.auth.isLoading = true;
      state.auth.error = null;
    });

    try {
      // Authenticate with Firebase
      const authResult = await authService.authenticate(email, password);
      if (authResult.isFailure) {
        set((state: any) => {
          state.auth.isLoading = false;
          state.auth.error = authResult.getError();
        });
        return Result.fail(new AppError.UnauthorizedError(authResult.getError()));
      }

      const userId = authResult.getValue();

      // Get user from repository
      const userIdVO = UserId.create(userId);
      if (userIdVO.isFailure) {
        set((state: any) => {
          state.auth.isLoading = false;
          state.auth.error = userIdVO.getError();
        });
        return Result.fail(new AppError.ValidationError(userIdVO.getError()));
      }

      const domainUser = await userRepository.findById(userIdVO.getValue());
      if (!domainUser) {
        set((state: any) => {
          state.auth.isLoading = false;
          state.auth.error = 'User not found';
        });
        return Result.fail(new AppError.NotFoundError('User not found'));
      }

      // Record successful login
      const loginResult = domainUser.recordLogin();
      if (loginResult.isSuccess) {
        await userRepository.save(domainUser);
      }

      const authUser = domainUserToAuthUser(domainUser);

      set((state: any) => {
        state.auth.isAuthenticated = true;
        state.auth.user = authUser;
        state.auth.domainUser = domainUser;
        state.auth.isLoading = false;
        state.auth.error = null;
      });

      return Result.ok(authUser);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.UnauthorizedError('Login failed');
      
      set((state: any) => {
        state.auth.isLoading = false;
        state.auth.error = authError.message;
      });

      return Result.fail(authError);
    }
  },

  register: async (email: string, password: string, displayName: string) => {
    if (!authService || !userRepository) {
      const error = new AppError.UnexpectedError('Auth service not initialized');
      set((state: any) => {
        state.auth.error = error.message;
      });
      return Result.fail(error);
    }

    set((state: any) => {
      state.auth.isLoading = true;
      state.auth.error = null;
    });

    try {
      // Check if user already exists
      const emailVO = Email.create(email);
      if (emailVO.isFailure) {
        set((state: any) => {
          state.auth.isLoading = false;
          state.auth.error = emailVO.getError();
        });
        return Result.fail(new AppError.ValidationError(emailVO.getError()));
      }

      const existingUser = await userRepository.findByEmail(emailVO.getValue());
      if (existingUser) {
        set((state: any) => {
          state.auth.isLoading = false;
          state.auth.error = 'User already exists';
        });
        return Result.fail(new AppError.ConflictError('User already exists'));
      }

      // Register with Firebase
      const authResult = await authService.register(email, password, displayName);
      if (authResult.isFailure) {
        set((state: any) => {
          state.auth.isLoading = false;
          state.auth.error = authResult.getError();
        });
        return Result.fail(new AppError.ConflictError(authResult.getError()));
      }

      const userId = authResult.getValue();

      // Create domain user
      const userResult = User.create({
        email,
        password, // This will be hashed by the application layer
        displayName,
      });

      if (userResult.isFailure) {
        set((state: any) => {
          state.auth.isLoading = false;
          state.auth.error = userResult.getError();
        });
        return Result.fail(new AppError.ValidationError(userResult.getError()));
      }

      const domainUser = userResult.getValue();

      // Save user to repository
      await userRepository.save(domainUser);

      const authUser = domainUserToAuthUser(domainUser);

      set((state: any) => {
        state.auth.isAuthenticated = true;
        state.auth.user = authUser;
        state.auth.domainUser = domainUser;
        state.auth.isLoading = false;
        state.auth.error = null;
      });

      return Result.ok(authUser);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.ConflictError('Registration failed');
      
      set((state: any) => {
        state.auth.isLoading = false;
        state.auth.error = authError.message;
      });

      return Result.fail(authError);
    }
  },

  loginWithGoogle: async () => {
    set((state: any) => {
      state.auth.isLoading = true;
      state.auth.error = null;
    });

    try {
      // Configure Google Sign-In if needed
      if (!await googleAuthService.isSignedIn()) {
        await googleAuthService.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
          iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
          androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        });
      }

      // Sign in with Google
      const googleUserInfo = await googleAuthService.signIn();

      // Create or get user from repository
      let domainUser: User;
      
      const emailVO = Email.create(googleUserInfo.email);
      if (emailVO.isFailure) {
        set((state: any) => {
          state.auth.isLoading = false;
          state.auth.error = emailVO.getError();
        });
        return Result.fail(new AppError.ValidationError(emailVO.getError()));
      }

      // Check if user exists
      const existingUser = await userRepository?.findByEmail(emailVO.getValue());
      
      if (existingUser) {
        // User exists, update their profile with Google info
        domainUser = existingUser;
        
        // Update profile if needed
        if (!domainUser.profile.avatarUrl && googleUserInfo.photoURL) {
          const updatedProfileResult = UserProfile.create({
            ...domainUser.profile,
            displayName: domainUser.profile.displayName,
            firstName: domainUser.profile.firstName,
            lastName: domainUser.profile.lastName,
            bio: domainUser.profile.bio,
            avatarUrl: googleUserInfo.photoURL,
            phoneNumber: domainUser.profile.phoneNumber,
            dateOfBirth: domainUser.profile.dateOfBirth,
            gender: domainUser.profile.gender,
            location: domainUser.profile.location,
            timezone: domainUser.profile.timezone,
            language: domainUser.profile.language,
            isProfileComplete: domainUser.profile.isProfileComplete,
          });
          if (updatedProfileResult.isSuccess()) {
            domainUser.updateProfile(updatedProfileResult.getValue());
          }
          await userRepository?.save(domainUser);
        }
      } else {
        // New user, create account
        const createUserResult = User.create({
          email: googleUserInfo.email,
          password: 'GOOGLE_AUTH_' + Date.now(), // Placeholder password for Google users
          displayName: googleUserInfo.displayName,
          firstName: googleUserInfo.displayName.split(' ')[0],
          lastName: googleUserInfo.displayName.split(' ').slice(1).join(' '),
          avatarUrl: googleUserInfo.photoURL,
        });

        if (createUserResult.isFailure) {
          set((state: any) => {
            state.auth.isLoading = false;
            state.auth.error = createUserResult.getError();
          });
          return Result.fail(new AppError.ValidationError(createUserResult.getError()));
        }

        domainUser = createUserResult.getValue();
        
        // Mark email as verified for Google users
        const verifyResult = domainUser.verifyEmail();
        if (verifyResult.isFailure) {
          console.warn('Failed to verify Google user email:', verifyResult.getError());
        }

        // Save new user
        await userRepository?.save(domainUser);
      }

      const authUser = domainUserToAuthUser(domainUser);

      set((state: any) => {
        state.auth.isAuthenticated = true;
        state.auth.user = authUser;
        state.auth.domainUser = domainUser;
        state.auth.isLoading = false;
        state.auth.error = null;
      });

      return Result.ok(authUser);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.UnauthorizedError(`Google Sign-In failed: ${error.message}`);
      
      set((state: any) => {
        state.auth.isLoading = false;
        state.auth.error = authError.message;
      });

      return Result.fail(authError);
    }
  },

  logout: async () => {
    if (!authService) {
      return;
    }

    set((state: any) => {
      state.auth.isLoading = true;
    });

    try {
      await authService.signOut();
      
      // Sign out from Google as well
      try {
        if (await googleAuthService.isSignedIn()) {
          await googleAuthService.signOut();
        }
      } catch (googleError) {
        console.warn('Failed to sign out from Google:', googleError);
      }
      
      // Cleanup auth state listener
      const { auth } = get();
      if (auth.authStateListener) {
        auth.authStateListener();
      }

      set((state: any) => {
        state.auth.isAuthenticated = false;
        state.auth.user = null;
        state.auth.domainUser = null;
        state.auth.isLoading = false;
        state.auth.error = null;
        state.auth.authStateListener = null;
      });
    } catch (error: any) {
      set((state: any) => {
        state.auth.isLoading = false;
        state.auth.error = 'Logout failed';
      });
    }
  },

  sendPasswordResetEmail: async (email: string) => {
    if (!authService) {
      const error = new AppError.UnexpectedError('Auth service not initialized');
      return Result.fail(error);
    }

    try {
      const result = await authService.sendPasswordResetEmail(email);
      if (result.isFailure) {
        return Result.fail(new AppError.UnexpectedError(result.getError()));
      }
      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.UnexpectedError('Failed to send password reset email');
      return Result.fail(authError);
    }
  },

  sendEmailVerification: async () => {
    if (!authService) {
      const error = new AppError.UnexpectedError('Auth service not initialized');
      return Result.fail(error);
    }

    const { auth } = get();
    if (!auth.user) {
      const error = new AppError.UnauthorizedError('User not authenticated');
      return Result.fail(error);
    }

    try {
      const result = await authService.sendEmailVerification(auth.user.uid);
      if (result.isFailure) {
        return Result.fail(new AppError.UnexpectedError(result.getError()));
      }
      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.UnexpectedError('Failed to send email verification');
      return Result.fail(authError);
    }
  },

  updateAuthProfile: async (updates: { displayName?: string; photoURL?: string }) => {
    if (!authService || !userRepository) {
      const error = new AppError.UnexpectedError('Auth service not initialized');
      return Result.fail(error);
    }

    const { auth } = get();
    if (!auth.user || !auth.domainUser) {
      const error = new AppError.UnauthorizedError('User not authenticated');
      return Result.fail(error);
    }

    try {
      // Update Firebase profile
      const authResult = await authService.updateProfile(auth.user.uid, updates);
      if (authResult.isFailure) {
        return Result.fail(new AppError.UnexpectedError(authResult.getError()));
      }

      // Update domain user profile
      const profileResult = auth.domainUser.profile.update({
        displayName: updates.displayName || auth.domainUser.profile.displayName,
        photoURL: updates.photoURL || auth.domainUser.profile.photoURL,
      });

      if (profileResult.isFailure) {
        return Result.fail(new AppError.ValidationError(profileResult.getError()));
      }

      const updateResult = auth.domainUser.updateProfile(profileResult.getValue());
      if (updateResult.isFailure) {
        return Result.fail(new AppError.ValidationError(updateResult.getError()));
      }

      // Save updated user
      await userRepository.save(auth.domainUser);

      // Update store state
      const updatedAuthUser = domainUserToAuthUser(auth.domainUser);
      set((state: any) => {
        state.auth.user = updatedAuthUser;
        state.auth.domainUser = auth.domainUser;
      });

      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.UnexpectedError('Failed to update profile');
      return Result.fail(authError);
    }
  },

  refreshUser: async () => {
    if (!authService || !userRepository) {
      const error = new AppError.UnexpectedError('Auth service not initialized');
      return Result.fail(error);
    }

    const { auth } = get();
    if (!auth.user) {
      const error = new AppError.UnauthorizedError('User not authenticated');
      return Result.fail(error);
    }

    try {
      // Get current user ID from Firebase
      const currentUserId = await authService.getCurrentUserId();
      if (!currentUserId) {
        set((state: any) => {
          state.auth.isAuthenticated = false;
          state.auth.user = null;
          state.auth.domainUser = null;
        });
        return Result.ok(undefined);
      }

      // Get updated user from repository
      const userIdVO = UserId.create(currentUserId);
      if (userIdVO.isFailure) {
        return Result.fail(new AppError.ValidationError(userIdVO.getError()));
      }

      const domainUser = await userRepository.findById(userIdVO.getValue());
      if (!domainUser) {
        set((state: any) => {
          state.auth.isAuthenticated = false;
          state.auth.user = null;
          state.auth.domainUser = null;
        });
        return Result.ok(undefined);
      }

      const authUser = domainUserToAuthUser(domainUser);

      set((state: any) => {
        state.auth.user = authUser;
        state.auth.domainUser = domainUser;
      });

      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.UnexpectedError('Failed to refresh user');
      return Result.fail(authError);
    }
  },

  initializeAuth: async () => {
    if (!authService || !userRepository) {
      set((state: any) => {
        state.auth.isInitialized = true;
      });
      return;
    }

    set((state: any) => {
      state.auth.isLoading = true;
    });

    try {
      // Wait for auth to initialize
      // Initialize auth service
      // Note: Removed waitForAuthInit as it's not in IAuthService interface

      // Set up auth state listener
      const unsubscribe = authService.onAuthStateChanged(async (userId) => {
        try {
          if (!userId) {
            set((state: any) => {
              state.auth.isAuthenticated = false;
              state.auth.user = null;
              state.auth.domainUser = null;
              state.auth.isLoading = false;
            });
            return;
          }

          // Get user from repository
          const userIdVO = UserId.create(userId);
          if (userIdVO.isFailure) {
            set((state: any) => {
              state.auth.isAuthenticated = false;
              state.auth.user = null;
              state.auth.domainUser = null;
              state.auth.isLoading = false;
              state.auth.error = userIdVO.getError();
            });
            return;
          }

          const domainUser = await userRepository!.findById(userIdVO.getValue());
          if (!domainUser) {
            set((state: any) => {
              state.auth.isAuthenticated = false;
              state.auth.user = null;
              state.auth.domainUser = null;
              state.auth.isLoading = false;
            });
            return;
          }

          const authUser = domainUserToAuthUser(domainUser);

          set((state: any) => {
            state.auth.isAuthenticated = true;
            state.auth.user = authUser;
            state.auth.domainUser = domainUser;
            state.auth.isLoading = false;
            state.auth.error = null;
          });
        } catch (error: any) {
          set((state: any) => {
            state.auth.isAuthenticated = false;
            state.auth.user = null;
            state.auth.domainUser = null;
            state.auth.isLoading = false;
            state.auth.error = error.message;
          });
        }
      });

      set((state: any) => {
        state.auth.authStateListener = unsubscribe;
        state.auth.isInitialized = true;
        state.auth.isLoading = false;
      });
    } catch (error: any) {
      set((state: any) => {
        state.auth.isInitialized = true;
        state.auth.isLoading = false;
        state.auth.error = error.message;
      });
    }
  },

  cleanupAuth: () => {
    const { auth } = get();
    if (auth.authStateListener) {
      auth.authStateListener();
    }
    
    set((state: any) => {
      state.auth = { ...initialAuthState, isInitialized: true };
    });
  },

  updateAuthState: (updates: Partial<AuthState>) => {
    set((state: any) => {
      Object.assign(state.auth, updates);
    });
  },

  clearAuthError: () => {
    set((state: any) => {
      state.auth.error = null;
    });
  },
});