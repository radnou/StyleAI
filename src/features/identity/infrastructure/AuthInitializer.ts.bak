import { auth, firestore } from '@core/config/firebase';
import { FirebaseAuthService } from './services/FirebaseAuthService';
import { FirebaseUserRepository } from './repositories/FirebaseUserRepository';
import { setAuthDependencies } from '@app/stores/authStore';
import { ILogger } from '../application/services';

/**
 * Console logger implementation for development
 */
class ConsoleLogger implements ILogger {
  info(message: string, metadata?: any): void {
    console.log(`[AUTH-INFO] ${message}`, metadata || '');
  }

  warn(message: string, metadata?: any): void {
    console.warn(`[AUTH-WARN] ${message}`, metadata || '');
  }

  error(message: string, error?: Error): void {
    console.error(`[AUTH-ERROR] ${message}`, error || '');
  }

  debug(message: string, metadata?: any): void {
    if (__DEV__) {
      console.debug(`[AUTH-DEBUG] ${message}`, metadata || '');
    }
  }
}

/**
 * Authentication initialization service
 * Sets up Firebase services and dependencies for the auth system
 */
export class AuthInitializer {
  private static instance: AuthInitializer | null = null;
  private logger: ILogger;
  private authService: FirebaseAuthService | null = null;
  private userRepository: FirebaseUserRepository | null = null;
  private isInitialized = false;

  private constructor() {
    this.logger = new ConsoleLogger();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AuthInitializer {
    if (!AuthInitializer.instance) {
      AuthInitializer.instance = new AuthInitializer();
    }
    return AuthInitializer.instance;
  }

  /**
   * Initialize authentication services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Auth initializer already initialized');
      return;
    }

    try {
      this.logger.info('Initializing authentication services...');

      // Create Firebase service instances
      this.authService = new FirebaseAuthService(auth, this.logger);
      this.userRepository = new FirebaseUserRepository(firestore, this.logger);

      // Set dependencies in the store
      setAuthDependencies(this.authService, this.userRepository);

      this.isInitialized = true;
      this.logger.info('Authentication services initialized successfully');
    } catch (error: any) {
      this.logger.error('Failed to initialize authentication services', error);
      throw error;
    }
  }

  /**
   * Get auth service instance
   */
  getAuthService(): FirebaseAuthService {
    if (!this.authService) {
      throw new Error('Auth service not initialized. Call initialize() first.');
    }
    return this.authService;
  }

  /**
   * Get user repository instance
   */
  getUserRepository(): FirebaseUserRepository {
    if (!this.userRepository) {
      throw new Error('User repository not initialized. Call initialize() first.');
    }
    return this.userRepository;
  }

  /**
   * Check if services are initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset initialization state (for testing)
   */
  reset(): void {
    this.authService = null;
    this.userRepository = null;
    this.isInitialized = false;
    this.logger.info('Auth initializer reset');
  }

  /**
   * Set custom logger
   */
  setLogger(logger: ILogger): void {
    this.logger = logger;
  }

  /**
   * Get current logger
   */
  getLogger(): ILogger {
    return this.logger;
  }
}

/**
 * Initialize authentication services
 * Call this function early in your app startup
 */
export const initializeAuth = async (): Promise<void> => {
  const initializer = AuthInitializer.getInstance();
  await initializer.initialize();
};

/**
 * Get initialized auth services
 */
export const getAuthServices = () => {
  const initializer = AuthInitializer.getInstance();
  return {
    authService: initializer.getAuthService(),
    userRepository: initializer.getUserRepository(),
    logger: initializer.getLogger(),
  };
};

/**
 * Check if auth is initialized
 */
export const isAuthInitialized = (): boolean => {
  const initializer = AuthInitializer.getInstance();
  return initializer.getIsInitialized();
};

/**
 * Reset auth initialization (for testing)
 */
export const resetAuth = (): void => {
  const initializer = AuthInitializer.getInstance();
  initializer.reset();
};

export default AuthInitializer;