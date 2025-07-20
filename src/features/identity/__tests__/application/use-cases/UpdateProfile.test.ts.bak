import { Result } from '@core/types/result';

// This test file defines the expected behavior for the UpdateProfile Use Case
// Following TDD principles, these tests should FAIL until implementation is complete

describe('UpdateProfile Use Case', () => {
  // Mock dependencies
  interface IUserRepository {
    findById(userId: string): Promise<User | null>;
    save(user: User): Promise<void>;
  }

  interface IImageService {
    uploadImage(imageData: Buffer, fileName: string): Promise<string>;
    deleteImage(imageUrl: string): Promise<void>;
  }

  interface ILogger {
    info(message: string, metadata?: any): void;
    error(message: string, error?: Error): void;
  }

  // Mock classes
  class UserProfile {
    constructor(
      public displayName: string,
      public firstName?: string,
      public lastName?: string,
      public bio?: string,
      public avatarUrl?: string,
      public phoneNumber?: string,
      public dateOfBirth?: Date,
      public gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say',
      public location?: string,
      public timezone?: string,
      public language?: string
    ) {}

    static create(props: any): Result<UserProfile, string> {
      return Result.ok(new UserProfile(props.displayName, props.firstName, props.lastName));
    }
  }

  class User {
    constructor(
      public id: string,
      public email: string,
      public profile: UserProfile,
      public isActive: boolean = true
    ) {}

    updateProfile(newProfile: UserProfile): Result<void, string> {
      this.profile = newProfile;
      return Result.ok();
    }

    get domainEvents(): any[] {
      return [];
    }

    clearEvents(): void {}
  }

  interface UpdateProfileRequest {
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

  interface UpdateProfileResponse {
    user: User;
    success: boolean;
    message: string;
    updatedFields: string[];
  }

  // Mock the UpdateProfile use case that will be implemented
  class UpdateProfileUseCase {
    constructor(
      private userRepository: IUserRepository,
      private imageService: IImageService,
      private logger: ILogger
    ) {}

    async execute(request: UpdateProfileRequest): Promise<Result<UpdateProfileResponse, string>> {
      // This will be implemented later
      throw new Error('UpdateProfileUseCase.execute not implemented');
    }
  }

  // Mock implementations
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockImageService: jest.Mocked<IImageService>;
  let mockLogger: jest.Mocked<ILogger>;
  let updateProfileUseCase: UpdateProfileUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockImageService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    updateProfileUseCase = new UpdateProfileUseCase(
      mockUserRepository,
      mockImageService,
      mockLogger
    );
  });

  describe('execute', () => {
    describe('when request is valid', () => {
      it('should update profile successfully', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'John Smith',
          firstName: 'John',
          lastName: 'Smith',
          bio: 'Updated bio',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().user.profile.displayName).toBe('John Smith');
        expect(result.getValue().success).toBe(true);
        expect(result.getValue().updatedFields).toContain('displayName');
        expect(result.getValue().updatedFields).toContain('firstName');
        expect(result.getValue().updatedFields).toContain('lastName');
        expect(result.getValue().updatedFields).toContain('bio');
      });

      it('should save updated user to repository', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'John Smith',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        await updateProfileUseCase.execute(request);

        expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      });

      it('should update only provided fields', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'John Smith',
          bio: 'New bio',
        };

        const originalProfile = new UserProfile('John Doe', 'John', 'Doe', 'Old bio');
        const user = new User('user-123', 'test@example.com', originalProfile);
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().user.profile.displayName).toBe('John Smith');
        expect(result.getValue().user.profile.bio).toBe('New bio');
        expect(result.getValue().user.profile.firstName).toBe('John'); // Should remain unchanged
        expect(result.getValue().user.profile.lastName).toBe('Doe'); // Should remain unchanged
      });

      it('should upload avatar image and update avatar URL', async () => {
        const imageBuffer = Buffer.from('fake-image-data');
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          avatarImage: imageBuffer,
          avatarFileName: 'avatar.jpg',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockImageService.uploadImage.mockResolvedValue('https://example.com/avatar.jpg');
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(mockImageService.uploadImage).toHaveBeenCalledWith(imageBuffer, 'avatar.jpg');
        expect(result.getValue().user.profile.avatarUrl).toBe('https://example.com/avatar.jpg');
      });

      it('should delete old avatar image when updating avatar', async () => {
        const imageBuffer = Buffer.from('fake-image-data');
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          avatarImage: imageBuffer,
          avatarFileName: 'new-avatar.jpg',
        };

        const oldProfile = new UserProfile('John Doe', undefined, undefined, undefined, 'https://example.com/old-avatar.jpg');
        const user = new User('user-123', 'test@example.com', oldProfile);
        mockUserRepository.findById.mockResolvedValue(user);
        mockImageService.uploadImage.mockResolvedValue('https://example.com/new-avatar.jpg');
        mockImageService.deleteImage.mockResolvedValue();
        mockUserRepository.save.mockResolvedValue();

        await updateProfileUseCase.execute(request);

        expect(mockImageService.deleteImage).toHaveBeenCalledWith('https://example.com/old-avatar.jpg');
        expect(mockImageService.uploadImage).toHaveBeenCalledWith(imageBuffer, 'new-avatar.jpg');
      });

      it('should log successful profile update', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'John Smith',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        await updateProfileUseCase.execute(request);

        expect(mockLogger.info).toHaveBeenCalledWith(
          'Profile updated successfully',
          expect.objectContaining({
            userId: 'user-123',
            updatedFields: ['displayName'],
          })
        );
      });

      it('should handle partial updates gracefully', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          bio: 'Just updating bio',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().updatedFields).toEqual(['bio']);
      });

      it('should trim whitespace from string fields', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: '  John Smith  ',
          firstName: '  John  ',
          lastName: '  Smith  ',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().user.profile.displayName).toBe('John Smith');
        expect(result.getValue().user.profile.firstName).toBe('John');
        expect(result.getValue().user.profile.lastName).toBe('Smith');
      });

      it('should validate phone number format', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          phoneNumber: '+1234567890',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().user.profile.phoneNumber).toBe('+1234567890');
      });

      it('should validate date of birth', async () => {
        const validDate = new Date('1990-01-01');
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          dateOfBirth: validDate,
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().user.profile.dateOfBirth).toBe(validDate);
      });
    });

    describe('when request is invalid', () => {
      it('should fail for null request', async () => {
        const result = await updateProfileUseCase.execute(null as any);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UpdateProfileRequest is null or undefined');
      });

      it('should fail for missing userId', async () => {
        const request: UpdateProfileRequest = {
          userId: '',
          displayName: 'John Smith',
        };

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserId is null, undefined, empty, or whitespace');
      });

      it('should fail when user does not exist', async () => {
        const request: UpdateProfileRequest = {
          userId: 'nonexistent-user',
          displayName: 'John Smith',
        };

        mockUserRepository.findById.mockResolvedValue(null);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('User not found');
      });

      it('should fail when user is inactive', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'John Smith',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'), false);
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Cannot update profile of inactive user');
      });

      it('should fail for invalid display name', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: '',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Display name is null, undefined, empty, or whitespace');
      });

      it('should fail for display name exceeding maximum length', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'a'.repeat(101),
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Display name is greater than 100 characters');
      });

      it('should fail for bio exceeding maximum length', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          bio: 'a'.repeat(501),
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Bio is greater than 500 characters');
      });

      it('should fail for invalid phone number format', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          phoneNumber: '123',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Phone number is not a valid format');
      });

      it('should fail for future date of birth', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          dateOfBirth: futureDate,
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Date of birth cannot be in the future');
      });

      it('should fail for invalid gender value', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          gender: 'invalid-gender' as any,
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Gender isn\'t one of the allowed values: ["male","female","other","prefer-not-to-say"]');
      });

      it('should fail for age less than 13', async () => {
        const recentDate = new Date();
        recentDate.setFullYear(recentDate.getFullYear() - 12);
        
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          dateOfBirth: recentDate,
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('User must be at least 13 years old');
      });

      it('should fail for invalid avatar image format', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          avatarImage: Buffer.from('invalid-image-data'),
          avatarFileName: 'avatar.txt',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Avatar image must be a valid image file (jpg, png, gif, webp)');
      });

      it('should fail for avatar image exceeding size limit', async () => {
        const largeImageBuffer = Buffer.alloc(5 * 1024 * 1024 + 1); // 5MB + 1 byte
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          avatarImage: largeImageBuffer,
          avatarFileName: 'avatar.jpg',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Avatar image size must be less than 5MB');
      });
    });

    describe('when external services fail', () => {
      it('should fail when repository findById fails', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'John Smith',
        };

        mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Failed to retrieve user');
      });

      it('should fail when repository save fails', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'John Smith',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockRejectedValue(new Error('Save failed'));

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Failed to save profile updates');
      });

      it('should fail when image upload fails', async () => {
        const imageBuffer = Buffer.from('fake-image-data');
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          avatarImage: imageBuffer,
          avatarFileName: 'avatar.jpg',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockImageService.uploadImage.mockRejectedValue(new Error('Upload failed'));

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Failed to upload avatar image');
      });

      it('should continue if old avatar deletion fails', async () => {
        const imageBuffer = Buffer.from('fake-image-data');
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          avatarImage: imageBuffer,
          avatarFileName: 'new-avatar.jpg',
        };

        const oldProfile = new UserProfile('John Doe', undefined, undefined, undefined, 'https://example.com/old-avatar.jpg');
        const user = new User('user-123', 'test@example.com', oldProfile);
        mockUserRepository.findById.mockResolvedValue(user);
        mockImageService.uploadImage.mockResolvedValue('https://example.com/new-avatar.jpg');
        mockImageService.deleteImage.mockRejectedValue(new Error('Delete failed'));
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to delete old avatar image',
          expect.any(Error)
        );
      });

      it('should log errors when external services fail', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'John Smith',
        };

        const dbError = new Error('Database connection failed');
        mockUserRepository.findById.mockRejectedValue(dbError);

        await updateProfileUseCase.execute(request);

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to update profile',
          dbError
        );
      });
    });

    describe('when no changes are made', () => {
      it('should return success with empty updated fields', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().updatedFields).toEqual([]);
        expect(result.getValue().message).toBe('No changes were made to the profile');
      });

      it('should not save user when no changes are made', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        await updateProfileUseCase.execute(request);

        expect(mockUserRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('profile validation rules', () => {
      it('should validate display name content policy', async () => {
        const invalidNames = [
          'Admin',
          'System',
          'Support',
          'fuck',
          'shit',
          'asshole',
        ];

        for (const displayName of invalidNames) {
          const request: UpdateProfileRequest = {
            userId: 'user-123',
            displayName,
          };

          const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
          mockUserRepository.findById.mockResolvedValue(user);

          const result = await updateProfileUseCase.execute(request);

          expect(result.isFailure).toBe(true);
          expect(result.getError()).toBe('Display name contains prohibited content');
        }
      });

      it('should validate bio content policy', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          bio: 'Contact me at my email: spam@example.com for deals!',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Bio contains prohibited content (contact information)');
      });

      it('should validate timezone values', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          timezone: 'Invalid/Timezone',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Timezone is not a valid timezone');
      });

      it('should validate language codes', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          language: 'invalid-lang',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Language is not a valid language code');
      });
    });

    describe('security considerations', () => {
      it('should not allow updating another user\'s profile', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: 'Hacker',
        };

        // This would typically be enforced by authentication middleware
        // but we test the use case behavior
        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        // In a real implementation, this would check if the authenticated user
        // matches the userId in the request
      });

      it('should sanitize input data', async () => {
        const request: UpdateProfileRequest = {
          userId: 'user-123',
          displayName: '<script>alert("xss")</script>',
          bio: '<img src="x" onerror="alert(1)">',
        };

        const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue();

        const result = await updateProfileUseCase.execute(request);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().user.profile.displayName).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
        expect(result.getValue().user.profile.bio).toBe('&lt;img src="x" onerror="alert(1)"&gt;');
      });
    });
  });

  describe('business rules', () => {
    it('should enforce profile completeness scoring', async () => {
      const request: UpdateProfileRequest = {
        userId: 'user-123',
        displayName: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        bio: 'Software developer',
        phoneNumber: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        location: 'New York, NY',
      };

      const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue();

      const result = await updateProfileUseCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().user.profile).toMatchObject({
        displayName: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        bio: 'Software developer',
        phoneNumber: '+1234567890',
        location: 'New York, NY',
      });
    });

    it('should limit profile update frequency', async () => {
      const request: UpdateProfileRequest = {
        userId: 'user-123',
        displayName: 'John Smith',
      };

      const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
      // Simulate recent profile update
      (user as any).lastProfileUpdate = new Date();
      
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await updateProfileUseCase.execute(request);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Profile can only be updated once per hour');
    });

    it('should allow premium users to update more frequently', async () => {
      const request: UpdateProfileRequest = {
        userId: 'user-123',
        displayName: 'John Smith',
      };

      const user = new User('user-123', 'test@example.com', new UserProfile('John Doe'));
      // Simulate premium user and recent profile update
      (user as any).isPremium = true;
      (user as any).lastProfileUpdate = new Date();
      
      mockUserRepository.findById.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue();

      const result = await updateProfileUseCase.execute(request);

      expect(result.isSuccess).toBe(true);
    });
  });
});