import { Result } from '@core/types/result';
import { Guard } from '@core/utils/Guard';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { UserProfile, UserProfileProps } from '../../domain/value-objects/UserProfile';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IImageService, ILogger, IContentModerationService } from '../services';

export interface UpdateProfileRequest {
  userId: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarImage?: Buffer;
  avatarFileName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  location?: string;
  timezone?: string;
  language?: string;
}

export interface UpdateProfileResponse {
  user: User;
  success: boolean;
  message: string;
  updatedFields: string[];
}

/**
 * Use case for updating a user's profile
 */
export class UpdateProfileUseCase {
  private static readonly PROHIBITED_DISPLAY_NAMES = [
    'admin', 'administrator', 'system', 'support', 'moderator', 
    'staff', 'owner', 'root', 'null', 'undefined',
    'fuck', 'shit', 'asshole', 'damn', 'bitch', 'bastard'
  ];

  private static readonly ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private static readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly VALID_TIMEZONES = [
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai',
    'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland',
    'UTC', 'GMT'
  ];
  private static readonly VALID_LANGUAGES = [
    'en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN', 'ko-KR',
    'it-IT', 'pt-BR', 'ru-RU', 'ar-SA', 'hi-IN', 'nl-NL', 'sv-SE'
  ];

  private static readonly UPDATE_FREQUENCY_LIMIT_HOURS = 1;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageService: IImageService,
    private readonly logger: ILogger,
    private readonly contentModerationService?: IContentModerationService
  ) {}

  public async execute(request: UpdateProfileRequest): Promise<Result<UpdateProfileResponse, string>> {
    try {
      // Validate request
      const validationResult = await this.validateRequest(request);
      if (validationResult.isFailure) {
        return Result.fail<UpdateProfileResponse, string>(validationResult.getError());
      }

      // Find user
      const userIdResult = UserId.create(request.userId);
      if (userIdResult.isFailure) {
        return Result.fail<UpdateProfileResponse, string>(userIdResult.getError());
      }

      const user = await this.userRepository.findById(userIdResult.getValue());
      if (!user) {
        return Result.fail<UpdateProfileResponse, string>('User not found');
      }

      // Check if user is active
      if (!user.isActive) {
        return Result.fail<UpdateProfileResponse, string>('Cannot update profile of inactive user');
      }

      // Check update frequency for non-premium users
      if (!(user as any).isPremium && this.hasRecentProfileUpdate(user)) {
        return Result.fail<UpdateProfileResponse, string>('Profile can only be updated once per hour');
      }

      // Track updated fields
      const updatedFields: string[] = [];

      // Get current profile data
      const currentProfile = user.profile;
      const newProfileProps: UserProfileProps = {
        displayName: currentProfile.displayName,
        firstName: currentProfile.firstName,
        lastName: currentProfile.lastName,
        bio: currentProfile.bio,
        avatarUrl: currentProfile.avatarUrl,
        phoneNumber: currentProfile.phoneNumber,
        dateOfBirth: currentProfile.dateOfBirth,
        gender: currentProfile.gender,
        location: currentProfile.location,
        timezone: currentProfile.timezone,
        language: currentProfile.language,
        isProfileComplete: currentProfile.isProfileComplete,
      };

      // Update fields that were provided
      if (request.displayName !== undefined) {
        const sanitizedDisplayName = this.sanitizeInput(request.displayName);
        if (sanitizedDisplayName !== currentProfile.displayName) {
          newProfileProps.displayName = sanitizedDisplayName;
          updatedFields.push('displayName');
        }
      }

      if (request.firstName !== undefined) {
        const sanitizedFirstName = this.sanitizeInput(request.firstName);
        if (sanitizedFirstName !== currentProfile.firstName) {
          newProfileProps.firstName = sanitizedFirstName || undefined;
          updatedFields.push('firstName');
        }
      }

      if (request.lastName !== undefined) {
        const sanitizedLastName = this.sanitizeInput(request.lastName);
        if (sanitizedLastName !== currentProfile.lastName) {
          newProfileProps.lastName = sanitizedLastName || undefined;
          updatedFields.push('lastName');
        }
      }

      if (request.bio !== undefined) {
        const sanitizedBio = this.sanitizeInput(request.bio);
        if (sanitizedBio !== currentProfile.bio) {
          newProfileProps.bio = sanitizedBio || undefined;
          updatedFields.push('bio');
        }
      }

      if (request.phoneNumber !== undefined && request.phoneNumber !== currentProfile.phoneNumber) {
        newProfileProps.phoneNumber = request.phoneNumber || undefined;
        updatedFields.push('phoneNumber');
      }

      if (request.dateOfBirth !== undefined && request.dateOfBirth !== currentProfile.dateOfBirth) {
        newProfileProps.dateOfBirth = request.dateOfBirth;
        updatedFields.push('dateOfBirth');
      }

      if (request.gender !== undefined && request.gender !== currentProfile.gender) {
        newProfileProps.gender = request.gender;
        updatedFields.push('gender');
      }

      if (request.location !== undefined) {
        const sanitizedLocation = this.sanitizeInput(request.location);
        if (sanitizedLocation !== currentProfile.location) {
          newProfileProps.location = sanitizedLocation || undefined;
          updatedFields.push('location');
        }
      }

      if (request.timezone !== undefined && request.timezone !== currentProfile.timezone) {
        newProfileProps.timezone = request.timezone || undefined;
        updatedFields.push('timezone');
      }

      if (request.language !== undefined && request.language !== currentProfile.language) {
        newProfileProps.language = request.language || undefined;
        updatedFields.push('language');
      }

      // Handle avatar image upload
      if (request.avatarImage && request.avatarFileName) {
        const avatarResult = await this.handleAvatarUpload(
          request.avatarImage,
          request.avatarFileName,
          currentProfile.avatarUrl
        );
        if (avatarResult.isFailure) {
          return Result.fail<UpdateProfileResponse, string>(avatarResult.getError());
        }

        newProfileProps.avatarUrl = avatarResult.getValue();
        updatedFields.push('avatarUrl');
      }

      // If no changes were made
      if (updatedFields.length === 0) {
        const response: UpdateProfileResponse = {
          user,
          success: true,
          message: 'No changes were made to the profile',
          updatedFields: [],
        };
        return Result.ok<UpdateProfileResponse>(response);
      }

      // Create new profile
      const profileResult = UserProfile.create(newProfileProps);
      if (profileResult.isFailure) {
        return Result.fail<UpdateProfileResponse, string>(profileResult.getError());
      }

      // Update user profile
      const updateResult = user.updateProfile(profileResult.getValue());
      if (updateResult.isFailure) {
        return Result.fail<UpdateProfileResponse, string>(updateResult.getError());
      }

      // Save user
      await this.userRepository.save(user);

      // Log successful update
      this.logger.info('Profile updated successfully', {
        userId: user.userId.value,
        updatedFields,
      });

      const response: UpdateProfileResponse = {
        user,
        success: true,
        message: 'Profile updated successfully',
        updatedFields,
      };

      return Result.ok<UpdateProfileResponse>(response);

    } catch (error) {
      this.logger.error('Failed to update profile', error as Error);
      
      if (error instanceof Error) {
        if (error.message.includes('find') || error.message.includes('retrieve')) {
          return Result.fail<UpdateProfileResponse, string>('Failed to retrieve user');
        }
        if (error.message.includes('save')) {
          return Result.fail<UpdateProfileResponse, string>('Failed to save profile updates');
        }
        if (error.message.includes('upload')) {
          return Result.fail<UpdateProfileResponse, string>('Failed to upload avatar image');
        }
      }

      return Result.fail<UpdateProfileResponse, string>('An unexpected error occurred while updating profile');
    }
  }

  private async validateRequest(request: UpdateProfileRequest): Promise<Result<void, string>> {
    // Check for null request
    const nullCheck = Guard.againstNullOrUndefined(request, 'UpdateProfileRequest');
    if (!nullCheck.succeeded) {
      return Result.fail<void, string>(nullCheck.message!);
    }

    // Validate userId
    const userIdCheck = Guard.againstNullOrEmptyOrWhitespace(request.userId, 'UserId');
    if (!userIdCheck.succeeded) {
      return Result.fail<void, string>(userIdCheck.message!);
    }

    // Validate display name if provided
    if (request.displayName !== undefined) {
      const displayNameValidation = await this.validateDisplayName(request.displayName);
      if (displayNameValidation.isFailure) {
        return displayNameValidation;
      }
    }

    // Validate bio if provided
    if (request.bio !== undefined && request.bio.length > 500) {
      return Result.fail<void, string>('Bio is greater than 500 characters');
    }

    // Validate bio content
    if (request.bio && this.containsContactInfo(request.bio)) {
      return Result.fail<void, string>('Bio contains prohibited content (contact information)');
    }

    // Validate avatar image if provided
    if (request.avatarImage && request.avatarFileName) {
      const imageValidation = this.validateAvatarImage(request.avatarImage, request.avatarFileName);
      if (imageValidation.isFailure) {
        return imageValidation;
      }
    }

    // Validate timezone if provided
    if (request.timezone && !UpdateProfileUseCase.VALID_TIMEZONES.includes(request.timezone)) {
      return Result.fail<void, string>('Timezone is not a valid timezone');
    }

    // Validate language if provided
    if (request.language && !UpdateProfileUseCase.VALID_LANGUAGES.includes(request.language)) {
      return Result.fail<void, string>('Language is not a valid language code');
    }

    return Result.ok<void>();
  }

  private async validateDisplayName(displayName: string): Promise<Result<void, string>> {
    const displayNameCheck = Guard.againstNullOrEmptyOrWhitespace(displayName, 'Display name');
    if (!displayNameCheck.succeeded) {
      return Result.fail<void, string>(displayNameCheck.message!);
    }

    const lengthCheck = Guard.againstAtMost(100, displayName.trim(), 'Display name');
    if (!lengthCheck.succeeded) {
      return Result.fail<void, string>(lengthCheck.message!);
    }

    // Check for prohibited names
    const normalizedName = displayName.trim().toLowerCase();
    if (UpdateProfileUseCase.PROHIBITED_DISPLAY_NAMES.includes(normalizedName)) {
      return Result.fail<void, string>('Display name contains prohibited content');
    }

    // Content moderation
    if (this.contentModerationService) {
      const moderationResult = await this.contentModerationService.isContentAllowed(displayName);
      if (moderationResult.isFailure || !moderationResult.getValue()) {
        return Result.fail<void, string>('Display name contains prohibited content');
      }
    }

    return Result.ok<void>();
  }

  private validateAvatarImage(imageData: Buffer, fileName: string): Result<void, string> {
    // Check file extension
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!UpdateProfileUseCase.ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
      return Result.fail<void, string>('Avatar image must be a valid image file (jpg, png, gif, webp)');
    }

    // Check file size
    if (imageData.length > UpdateProfileUseCase.MAX_IMAGE_SIZE) {
      return Result.fail<void, string>('Avatar image size must be less than 5MB');
    }

    return Result.ok<void>();
  }

  private async handleAvatarUpload(
    imageData: Buffer,
    fileName: string,
    currentAvatarUrl?: string
  ): Promise<Result<string, string>> {
    try {
      // Upload new image
      const newAvatarUrl = await this.imageService.uploadImage(imageData, fileName, 'avatars');

      // Delete old image if it exists
      if (currentAvatarUrl) {
        try {
          await this.imageService.deleteImage(currentAvatarUrl);
        } catch (error) {
          this.logger.error('Failed to delete old avatar image', error as Error);
          // Continue - don't fail the operation if old image deletion fails
        }
      }

      return Result.ok<string>(newAvatarUrl);
    } catch (error) {
      throw error; // Re-throw to be caught by main try-catch
    }
  }

  private containsContactInfo(text: string): boolean {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/;
    const urlRegex = /(https?:\/\/[^\s]+)/;
    
    return emailRegex.test(text) || phoneRegex.test(text) || urlRegex.test(text);
  }

  private sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Use content moderation service if available
    if (this.contentModerationService) {
      return this.contentModerationService.sanitizeHtml(input.trim());
    }
    
    // Basic HTML encoding as fallback
    return input.trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  private hasRecentProfileUpdate(user: User): boolean {
    const lastUpdate = (user as any).lastProfileUpdate as Date;
    if (!lastUpdate) return false;
    
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceUpdate < UpdateProfileUseCase.UPDATE_FREQUENCY_LIMIT_HOURS;
  }
}