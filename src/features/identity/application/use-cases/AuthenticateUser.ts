import { Result } from '@core/types/result';
import { Guard } from '@core/utils/Guard';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher, ITokenService, ILogger, IRateLimitService } from '../services';

export interface AuthenticateUserRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthenticateUserResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Use case for authenticating a user
 */
export class AuthenticateUserUseCase {
  private static readonly STANDARD_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours
  private static readonly REMEMBER_ME_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days
  private static readonly MAX_RATE_LIMIT_ATTEMPTS = 5;
  private static readonly RATE_LIMIT_WINDOW = 15 * 60; // 15 minutes
  private static readonly SUSPICIOUS_USER_AGENTS = ['bot', 'crawler', 'spider', 'scraper'];

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly logger: ILogger,
    private readonly rateLimitService?: IRateLimitService
  ) {}

  public async execute(request: AuthenticateUserRequest): Promise<Result<AuthenticateUserResponse, string>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure) {
        return Result.fail<AuthenticateUserResponse, string>(validationResult.getError());
      }

      // Check rate limiting
      if (request.ipAddress && this.rateLimitService) {
        const rateLimitResult = await this.checkRateLimit(request.ipAddress);
        if (rateLimitResult.isFailure) {
          return Result.fail<AuthenticateUserResponse, string>(rateLimitResult.getError());
        }
      }

      // Normalize email
      const normalizedEmail = request.email.trim().toLowerCase();
      const emailResult = Email.create(normalizedEmail);
      if (emailResult.isFailure) {
        return Result.fail<AuthenticateUserResponse, string>(emailResult.getError());
      }

      // Find user
      const user = await this.userRepository.findByEmail(emailResult.getValue());
      if (!user) {
        await this.logFailedAttempt(request, 'User not found');
        await this.recordRateLimitAttempt(request.ipAddress);
        return Result.fail<AuthenticateUserResponse, string>('Invalid credentials');
      }

      // Check if user account is active
      if (!user.isActive) {
        await this.logFailedAttempt(request, 'User account inactive', user.userId.value);
        return Result.fail<AuthenticateUserResponse, string>('User account is inactive');
      }

      // Check if user account is locked
      if (user.isLocked) {
        await this.logFailedAttempt(request, 'User account locked', user.userId.value);
        return Result.fail<AuthenticateUserResponse, string>('User account is locked');
      }

      // Check if email is verified (except for admin users)
      if (!user.emailVerified && !(user as any).isAdmin) {
        await this.logFailedAttempt(request, 'Email not verified', user.userId.value);
        return Result.fail<AuthenticateUserResponse, string>('Email must be verified to sign in');
      }

      // Verify password
      const isPasswordValid = user.isPasswordValid(request.password);
      if (!isPasswordValid) {
        // Record failed login attempt
        const failedLoginResult = user.recordFailedLogin();
        if (failedLoginResult.isSuccess) {
          await this.userRepository.save(user);
        }

        await this.logFailedAttempt(request, 'Invalid password', user.userId.value);
        await this.recordRateLimitAttempt(request.ipAddress);
        return Result.fail<AuthenticateUserResponse, string>('Invalid credentials');
      }

      // Successful authentication - record login
      const loginResult = user.recordLogin();
      if (loginResult.isFailure) {
        return Result.fail<AuthenticateUserResponse, string>(loginResult.getError());
      }

      // Unlock user if needed
      if (user.loginAttempts > 0) {
        user.unlock();
      }

      // Save user with updated login info
      await this.userRepository.save(user);

      // Generate tokens
      const expiresIn = request.rememberMe ? 
        AuthenticateUserUseCase.REMEMBER_ME_TOKEN_EXPIRY : 
        AuthenticateUserUseCase.STANDARD_TOKEN_EXPIRY;

      const accessToken = await this.tokenService.generateAccessToken(user.userId.value, expiresIn);
      const refreshToken = await this.tokenService.generateRefreshToken(user.userId.value, expiresIn * 2);

      // Log successful authentication
      this.logger.info('User authenticated successfully', {
        userId: user.userId.value,
        email: user.email.value,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        rememberMe: request.rememberMe,
        timestamp: new Date(),
      });

      // Check for suspicious activity
      if (request.userAgent && this.isSuspiciousUserAgent(request.userAgent)) {
        this.logger.warn('Suspicious authentication attempt', {
          userId: user.userId.value,
          email: user.email.value,
          userAgent: request.userAgent,
          ipAddress: request.ipAddress,
          reason: 'Suspicious user agent',
        });
      }

      const response: AuthenticateUserResponse = {
        user,
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer',
      };

      return Result.ok<AuthenticateUserResponse>(response);

    } catch (error) {
      this.logger.error('Authentication failed due to service error', error as Error);
      
      if (error instanceof Error) {
        if (error.message.includes('token') || error.message.includes('generate')) {
          return Result.fail<AuthenticateUserResponse, string>('Failed to generate authentication tokens');
        }
      }
      
      return Result.fail<AuthenticateUserResponse, string>('Authentication service unavailable');
    }
  }

  private validateRequest(request: AuthenticateUserRequest): Result<void, string> {
    // Check for null request
    const nullCheck = Guard.againstNullOrUndefined(request, 'AuthenticateUserRequest');
    if (!nullCheck.succeeded) {
      return Result.fail<void, string>(nullCheck.message!);
    }

    // Validate email format
    const emailResult = Email.create(request.email);
    if (emailResult.isFailure) {
      return Result.fail<void, string>(emailResult.getError());
    }

    // Validate password
    const passwordCheck = Guard.againstNullOrEmptyOrWhitespace(request.password, 'Password');
    if (!passwordCheck.succeeded) {
      return Result.fail<void, string>(passwordCheck.message!);
    }

    return Result.ok<void>();
  }

  private async checkRateLimit(ipAddress: string): Promise<Result<void, string>> {
    if (!this.rateLimitService) {
      return Result.ok<void>();
    }

    const rateLimitResult = await this.rateLimitService.isAllowed(
      'authentication',
      ipAddress,
      AuthenticateUserUseCase.MAX_RATE_LIMIT_ATTEMPTS,
      AuthenticateUserUseCase.RATE_LIMIT_WINDOW
    );

    if (rateLimitResult.isFailure || !rateLimitResult.getValue()) {
      return Result.fail<void, string>('Too many authentication attempts from this IP');
    }

    return Result.ok<void>();
  }

  private async recordRateLimitAttempt(ipAddress?: string): Promise<void> {
    if (ipAddress && this.rateLimitService) {
      try {
        await this.rateLimitService.recordAttempt('authentication', ipAddress);
      } catch (error) {
        this.logger.error('Failed to record rate limit attempt', error as Error);
      }
    }
  }

  private async logFailedAttempt(
    request: AuthenticateUserRequest,
    reason: string,
    userId?: string
  ): Promise<void> {
    const metadata: any = {
      email: request.email,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      reason,
      timestamp: new Date(),
    };

    if (userId) {
      metadata.userId = userId;
    }

    this.logger.warn('Authentication failed', metadata);
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const normalizedUserAgent = userAgent.toLowerCase();
    return AuthenticateUserUseCase.SUSPICIOUS_USER_AGENTS.some(suspicious =>
      normalizedUserAgent.includes(suspicious)
    );
  }
}