import { Result } from '@core/types/result';
import { ValueObject } from '@core/types/domain';
import { UserProfile, UserProfileProps } from '../../../domain/value-objects/UserProfile';

// This test file defines the expected behavior for the UserProfile Value Object
// Following TDD principles, these tests should FAIL until implementation is complete

describe('UserProfile Value Object', () => {

  describe('UserProfile.create', () => {
    describe('when profile data is valid', () => {
      it('should create UserProfile with minimal required data', () => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().displayName).toBe('John Doe');
      });

      it('should create UserProfile with complete profile data', () => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Software developer passionate about fashion',
          avatarUrl: 'https://example.com/avatar.jpg',
          phoneNumber: '+1234567890',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          location: 'New York, NY',
          timezone: 'America/New_York',
          language: 'en-US',
          isProfileComplete: true,
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().displayName).toBe('John Doe');
        expect(result.getValue().firstName).toBe('John');
        expect(result.getValue().lastName).toBe('Doe');
        expect(result.getValue().bio).toBe('Software developer passionate about fashion');
        expect(result.getValue().isProfileComplete).toBe(true);
      });

      it('should create UserProfile with optional fields as undefined', () => {
        const props: UserProfileProps = {
          displayName: 'Jane Smith',
          firstName: 'Jane',
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().displayName).toBe('Jane Smith');
        expect(result.getValue().firstName).toBe('Jane');
        expect(result.getValue().lastName).toBeUndefined();
        expect(result.getValue().bio).toBeUndefined();
        expect(result.getValue().isProfileComplete).toBe(false);
      });

      it('should trim whitespace from string fields', () => {
        const props: UserProfileProps = {
          displayName: '  John Doe  ',
          firstName: '  John  ',
          lastName: '  Doe  ',
          bio: '  Software developer  ',
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().displayName).toBe('John Doe');
        expect(result.getValue().firstName).toBe('John');
        expect(result.getValue().lastName).toBe('Doe');
        expect(result.getValue().bio).toBe('Software developer');
      });
    });

    describe('when profile data is invalid', () => {
      it('should fail for null props', () => {
        const result = UserProfile.create(null as any);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserProfile props are null or undefined');
      });

      it('should fail for undefined props', () => {
        const result = UserProfile.create(undefined as any);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserProfile props are null or undefined');
      });

      it('should fail for empty display name', () => {
        const props: UserProfileProps = {
          displayName: '',
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Display name is null, undefined, empty, or whitespace');
      });

      it('should fail for whitespace-only display name', () => {
        const props: UserProfileProps = {
          displayName: '   ',
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Display name is null, undefined, empty, or whitespace');
      });

      it('should fail for display name exceeding maximum length', () => {
        const props: UserProfileProps = {
          displayName: 'a'.repeat(101),
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Display name is greater than 100 characters');
      });

      it('should fail for bio exceeding maximum length', () => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          bio: 'a'.repeat(501),
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Bio is greater than 500 characters');
      });

      it('should fail for invalid avatar URL', () => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          avatarUrl: 'invalid-url',
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Avatar URL is not a valid URL');
      });

      it('should fail for invalid phone number format', () => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          phoneNumber: '123',
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Phone number is not a valid format');
      });

      it('should fail for future date of birth', () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const props: UserProfileProps = {
          displayName: 'John Doe',
          dateOfBirth: futureDate,
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Date of birth cannot be in the future');
      });

      it('should fail for invalid gender value', () => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          gender: 'invalid-gender' as any,
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Gender isn\'t one of the allowed values: ["male","female","other","prefer-not-to-say"]');
      });

      it('should fail for age less than 13', () => {
        const recentDate = new Date();
        recentDate.setFullYear(recentDate.getFullYear() - 12);
        
        const props: UserProfileProps = {
          displayName: 'Young User',
          dateOfBirth: recentDate,
        };
        
        const result = UserProfile.create(props);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('User must be at least 13 years old');
      });
    });
  });

  describe('UserProfile getters', () => {
    it('should return correct display name', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
      };
      
      const profile = UserProfile.create(props).getValue();
      
      expect(profile.displayName).toBe('John Doe');
    });

    it('should return correct full name when first and last name are provided', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      const profile = UserProfile.create(props).getValue();
      
      expect(profile.fullName).toBe('John Doe');
    });

    it('should return display name as full name when first/last name are not provided', () => {
      const props: UserProfileProps = {
        displayName: 'JohnDoe123',
      };
      
      const profile = UserProfile.create(props).getValue();
      
      expect(profile.fullName).toBe('JohnDoe123');
    });

    it('should calculate age correctly', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      
      const props: UserProfileProps = {
        displayName: 'John Doe',
        dateOfBirth: birthDate,
      };
      
      const profile = UserProfile.create(props).getValue();
      
      expect(profile.age).toBe(25);
    });

    it('should return undefined age when date of birth is not provided', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
      };
      
      const profile = UserProfile.create(props).getValue();
      
      expect(profile.age).toBeUndefined();
    });

    it('should return false for isProfileComplete when not explicitly set', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
      };
      
      const profile = UserProfile.create(props).getValue();
      
      expect(profile.isProfileComplete).toBe(false);
    });
  });

  describe('UserProfile update methods', () => {
    it('should update display name successfully', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
      };
      
      const profile = UserProfile.create(props).getValue();
      const result = profile.updateDisplayName('Jane Smith');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().displayName).toBe('Jane Smith');
    });

    it('should fail to update display name with invalid value', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
      };
      
      const profile = UserProfile.create(props).getValue();
      const result = profile.updateDisplayName('');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Display name is null, undefined, empty, or whitespace');
    });

    it('should update bio successfully', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
      };
      
      const profile = UserProfile.create(props).getValue();
      const result = profile.updateBio('New bio description');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().bio).toBe('New bio description');
    });

    it('should update avatar URL successfully', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
      };
      
      const profile = UserProfile.create(props).getValue();
      const result = profile.updateAvatarUrl('https://example.com/new-avatar.jpg');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().avatarUrl).toBe('https://example.com/new-avatar.jpg');
    });
  });

  describe('UserProfile equality', () => {
    it('should be equal when all properties match', () => {
      const props: UserProfileProps = {
        displayName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      const profile1 = UserProfile.create(props).getValue();
      const profile2 = UserProfile.create(props).getValue();
      
      expect(profile1.equals(profile2)).toBe(true);
    });

    it('should not be equal when properties differ', () => {
      const props1: UserProfileProps = {
        displayName: 'John Doe',
      };
      
      const props2: UserProfileProps = {
        displayName: 'Jane Smith',
      };
      
      const profile1 = UserProfile.create(props1).getValue();
      const profile2 = UserProfile.create(props2).getValue();
      
      expect(profile1.equals(profile2)).toBe(false);
    });
  });

  describe('UserProfile validation rules', () => {
    it('should accept valid phone number formats', () => {
      const validPhoneNumbers = [
        '+1234567890',
        '+1-234-567-8900',
        '+1 (234) 567-8900',
        '1234567890',
        '(234) 567-8900',
      ];

      validPhoneNumbers.forEach(phoneNumber => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          phoneNumber,
        };
        
        const result = UserProfile.create(props);
        expect(result.isSuccess).toBe(true);
      });
    });

    it('should accept valid avatar URLs', () => {
      const validUrls = [
        'https://example.com/avatar.jpg',
        'https://example.com/avatar.png',
        'https://example.com/avatar.gif',
        'https://cdn.example.com/users/avatar.webp',
      ];

      validUrls.forEach(avatarUrl => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          avatarUrl,
        };
        
        const result = UserProfile.create(props);
        expect(result.isSuccess).toBe(true);
      });
    });

    it('should accept valid timezone values', () => {
      const validTimezones = [
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Asia/Tokyo',
        'UTC',
      ];

      validTimezones.forEach(timezone => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          timezone,
        };
        
        const result = UserProfile.create(props);
        expect(result.isSuccess).toBe(true);
      });
    });

    it('should accept valid language codes', () => {
      const validLanguages = [
        'en-US',
        'es-ES',
        'fr-FR',
        'de-DE',
        'ja-JP',
      ];

      validLanguages.forEach(language => {
        const props: UserProfileProps = {
          displayName: 'John Doe',
          language,
        };
        
        const result = UserProfile.create(props);
        expect(result.isSuccess).toBe(true);
      });
    });
  });
});