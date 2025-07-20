import { Result } from '@core/types/result';
import { Guard } from '@core/utils/Guard';
import { User, UserCreationProps } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService, IPasswordHasher, ILogger, IContentModerationService } from '../services';

export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

export interface CreateUserResponse {
  user: User;
  verificationToken: string;
  success: boolean;
  message: string;
}

/**
 * Use case for creating a new user account
 */
export class CreateUserUseCase {
  private static readonly PROHIBITED_DISPLAY_NAMES = [
    'admin', 'administrator', 'system', 'support', 'moderator', 
    'staff', 'owner', 'root', 'null', 'undefined',
    'fuck', 'shit', 'asshole', 'damn', 'bitch', 'bastard'
  ];

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly passwordHasher: IPasswordHasher,
    private readonly logger: ILogger,
    private readonly contentModerationService?: IContentModerationService
  ) {}

  public async execute(request: CreateUserRequest): Promise<Result<CreateUserResponse, string>> {
    try {
      // Validate request
      const validationResult = await this.validateRequest(request);
      if (validationResult.isFailure) {
        return Result.fail<CreateUserResponse, string>(validationResult.getError());
      }

      // Check if user already exists
      const emailResult = Email.create(request.email);
      if (emailResult.isFailure) {
        return Result.fail<CreateUserResponse, string>(emailResult.getError());
      }

      const existingUser = await this.userRepository.exists(emailResult.getValue());
      if (existingUser) {
        return Result.fail<CreateUserResponse, string>('User with this email already exists');
      }

      // Create user
      const userCreationProps: UserCreationProps = {
        email: request.email.trim().toLowerCase(),
        password: request.password,
        displayName: request.displayName.trim(),
        firstName: request.firstName?.trim(),
        lastName: request.lastName?.trim(),
      };

      const userResult = User.create(userCreationProps);
      if (userResult.isFailure) {
        return Result.fail<CreateUserResponse, string>(userResult.getError());
      }

      const user = userResult.getValue();

      // Generate email verification token
      const tokenResult = user.generateEmailVerificationToken();
      if (tokenResult.isFailure) {
        return Result.fail<CreateUserResponse, string>(tokenResult.getError());
      }

      const verificationToken = tokenResult.getValue();

      // Save user to repository
      await this.userRepository.save(user);

      // Send emails (don't fail the use case if emails fail)
      await this.sendWelcomeEmail(user.email.value, user.profile.displayName);
      await this.sendVerificationEmail(user.email.value, verificationToken);

      // Log successful creation
      this.logger.info('User created successfully', {
        userId: user.userId.value,
        email: user.email.value,
        displayName: user.profile.displayName,
      });

      const response: CreateUserResponse = {
        user,
        verificationToken,
        success: true,
        message: 'User account created successfully. Please check your email to verify your account.',
      };

      return Result.ok<CreateUserResponse>(response);

    } catch (error) {
      this.logger.error('Failed to create user', error as Error);
      
      if (error instanceof Error) {
        if (error.message.includes('hash')) {
          return Result.fail<CreateUserResponse, string>('Failed to hash password');
        }
        if (error.message.includes('save') || error.message.includes('database')) {
          return Result.fail<CreateUserResponse, string>('Failed to save user');
        }
        if (error.message.includes('exists') || error.message.includes('check')) {
          return Result.fail<CreateUserResponse, string>('Failed to check user existence');
        }
      }

      return Result.fail<CreateUserResponse, string>('An unexpected error occurred during user creation');
    }
  }

  private async validateRequest(request: CreateUserRequest): Promise<Result<void, string>> {
    // Check for null request
    const nullCheck = Guard.againstNullOrUndefined(request, 'CreateUserRequest');
    if (!nullCheck.succeeded) {
      return Result.fail<void, string>(nullCheck.message!);
    }

    // Validate email
    const emailResult = Email.create(request.email);
    if (emailResult.isFailure) {
      return Result.fail<void, string>(emailResult.getError());
    }

    // Validate display name
    const displayNameCheck = Guard.againstNullOrEmptyOrWhitespace(request.displayName, 'Display name');
    if (!displayNameCheck.succeeded) {
      return Result.fail<void, string>(displayNameCheck.message!);
    }

    // Check for prohibited display names
    const normalizedDisplayName = request.displayName.trim().toLowerCase();
    if (CreateUserUseCase.PROHIBITED_DISPLAY_NAMES.includes(normalizedDisplayName)) {
      return Result.fail<void, string>('Display name contains prohibited content');
    }

    // Content moderation for display name
    if (this.contentModerationService) {
      const moderationResult = await this.contentModerationService.isContentAllowed(request.displayName);
      if (moderationResult.isFailure || !moderationResult.getValue()) {
        return Result.fail<void, string>('Display name contains prohibited content');
      }
    }

    // Validate terms acceptance
    if (!request.acceptedTerms) {
      return Result.fail<void, string>('Terms of service must be accepted');
    }

    if (!request.acceptedPrivacy) {
      return Result.fail<void, string>('Privacy policy must be accepted');
    }

    return Result.ok<void>();
  }

  private async sendWelcomeEmail(email: string, displayName: string): Promise<void> {
    try {
      const result = await this.emailService.sendWelcomeEmail(email, displayName);
      if (result.isFailure) {
        this.logger.error('Failed to send welcome email', new Error(result.getError()));
      }
    } catch (error) {
      this.logger.error('Failed to send welcome email', error as Error);
    }
  }

  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const result = await this.emailService.sendEmailVerification(email, token);
      if (result.isFailure) {
        this.logger.error('Failed to send email verification', new Error(result.getError()));
      }
    } catch (error) {
      this.logger.error('Failed to send email verification', error as Error);
    }
  }
}