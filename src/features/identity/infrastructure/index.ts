// Services
export { FirebaseAuthService } from './services/FirebaseAuthService';

// Repositories
export { FirebaseUserRepository } from './repositories/FirebaseUserRepository';

// Mappers
export { UserMapper } from './mappers/UserMapper';
export type { FirebaseUserDocument, FirebaseAuthUserData } from './mappers/UserMapper';

// Error handling
export { FirebaseErrorMapper } from './errors/FirebaseErrorMapper';
export type { FirebaseError } from './errors/FirebaseErrorMapper';

// Utilities
export { TimestampConverter } from './utils/TimestampConverter';

// Initialization
export { 
  AuthInitializer,
  initializeAuth,
  getAuthServices,
  isAuthInitialized,
  resetAuth,
} from './AuthInitializer';

// Security validation
export { SecurityValidator } from './security/SecurityValidator';
export type { SecurityValidationResult, SecurityRule } from './security/SecurityValidator';

// Rate limiting
export { RateLimiter, getRateLimiter, resetRateLimiter } from './security/RateLimiter';
export type { RateLimitConfig, RateLimitResult } from './security/RateLimiter';