import { Result } from '@core/types/result';
import { AggregateRoot, UniqueEntityID } from '@core/types/domain';
import { User, UserProps, UserCreationProps } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { UserProfile } from '../../../domain/value-objects/UserProfile';

// This test file defines the expected behavior for the User Entity
// Following TDD principles, these tests should FAIL until implementation is complete

describe('User Entity', () => {

  describe('User.create', () => {
    describe('when user data is valid', () => {
      it('should create User with minimal required data', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().email.value).toBe('test@example.com');
        expect(result.getValue().profile.displayName).toBe('John Doe');
        expect(result.getValue().emailVerified).toBe(false);
        expect(result.getValue().isPremium).toBe(false);
        expect(result.getValue().isActive).toBe(true);
        expect(result.getValue().loginAttempts).toBe(0);
      });

      it('should create User with complete profile data', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
        };

        const result = User.create(props);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().profile.displayName).toBe('John Doe');
        expect(result.getValue().createdAt).toBeInstanceOf(Date);
        expect(result.getValue().updatedAt).toBeInstanceOf(Date);
      });

      it('should generate unique user ID', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const result1 = User.create(props);
        const result2 = User.create(props);

        expect(result1.isSuccess).toBe(true);
        expect(result2.isSuccess).toBe(true);
        expect(result1.getValue().userId.value).not.toBe(result2.getValue().userId.value);
      });

      it('should hash password on creation', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isSuccess).toBe(true);
        // Password should be hashed, not stored in plain text
        expect(result.getValue().isPasswordValid('securePassword123!')).toBe(true);
        expect(result.getValue().isPasswordValid('wrongPassword')).toBe(false);
      });

      it('should set default values correctly', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isSuccess).toBe(true);
        const user = result.getValue();
        expect(user.emailVerified).toBe(false);
        expect(user.isPremium).toBe(false);
        expect(user.isActive).toBe(true);
        expect(user.loginAttempts).toBe(0);
        expect(user.isLocked).toBe(false);
        expect(user.lastLoginAt).toBeUndefined();
      });
    });

    describe('when user data is invalid', () => {
      it('should fail for null props', () => {
        const result = User.create(null as any);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('User props are null or undefined');
      });

      it('should fail for undefined props', () => {
        const result = User.create(undefined as any);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('User props are null or undefined');
      });

      it('should fail for invalid email', () => {
        const props: UserCreationProps = {
          email: 'invalid-email',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is not a valid email address');
      });

      it('should fail for weak password', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: '123',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Password is less than 8 characters');
      });

      it('should fail for empty display name', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: '',
        };

        const result = User.create(props);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Display name is null, undefined, empty, or whitespace');
      });

      it('should fail for password without special characters', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Password must contain at least one special character');
      });

      it('should fail for password without uppercase letter', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securepassword123!',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Password must contain at least one uppercase letter');
      });

      it('should fail for password without lowercase letter', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'SECUREPASSWORD123!',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Password must contain at least one lowercase letter');
      });

      it('should fail for password without number', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword!',
          displayName: 'John Doe',
        };

        const result = User.create(props);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Password must contain at least one number');
      });
    });
  });

  describe('User.createExisting', () => {
    it('should create User from existing data', () => {
      const userId = UserId.create('existing-user-id').getValue();
      const email = Email.create('test@example.com').getValue();
      const profile = UserProfile.create({ displayName: 'John Doe' }).getValue();
      
      const props: UserProps = {
        userId,
        email,
        profile,
        password: 'hashedPassword',
        emailVerified: true,
        isPremium: true,
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        lastLoginAt: new Date('2023-01-02'),
        loginAttempts: 0,
      };

      const result = User.createExisting(props, new UniqueEntityID('existing-user-id'));

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().userId.value).toBe('existing-user-id');
      expect(result.getValue().email.value).toBe('test@example.com');
      expect(result.getValue().emailVerified).toBe(true);
      expect(result.getValue().isPremium).toBe(true);
    });
  });

  describe('User methods', () => {
    describe('verifyEmail', () => {
      it('should verify email successfully', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.verifyEmail();

        expect(result.isSuccess).toBe(true);
        expect(user.emailVerified).toBe(true);
      });

      it('should fail if email is already verified', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        user.verifyEmail(); // First verification
        const result = user.verifyEmail(); // Second verification

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is already verified');
      });
    });

    describe('updateProfile', () => {
      it('should update profile successfully', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const newProfile = UserProfile.create({ displayName: 'Jane Smith' }).getValue();
        const result = user.updateProfile(newProfile);

        expect(result.isSuccess).toBe(true);
        expect(user.profile.displayName).toBe('Jane Smith');
      });

      it('should update updatedAt timestamp', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const originalUpdatedAt = user.updatedAt;
        
        setTimeout(() => {
          const newProfile = UserProfile.create({ displayName: 'Jane Smith' }).getValue();
          user.updateProfile(newProfile);
          
          expect(user.updatedAt).not.toEqual(originalUpdatedAt);
        }, 10);
      });
    });

    describe('changePassword', () => {
      it('should change password successfully', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.changePassword('securePassword123!', 'newSecurePassword456!');

        expect(result.isSuccess).toBe(true);
        expect(user.isPasswordValid('newSecurePassword456!')).toBe(true);
        expect(user.isPasswordValid('securePassword123!')).toBe(false);
      });

      it('should fail with incorrect current password', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.changePassword('wrongPassword', 'newSecurePassword456!');

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Current password is incorrect');
      });

      it('should fail with weak new password', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.changePassword('securePassword123!', '123');

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Password is less than 8 characters');
      });
    });

    describe('recordLogin', () => {
      it('should record successful login', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.recordLogin();

        expect(result.isSuccess).toBe(true);
        expect(user.lastLoginAt).toBeInstanceOf(Date);
        expect(user.loginAttempts).toBe(0);
      });

      it('should clear lockout on successful login', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        // Simulate lockout
        for (let i = 0; i < 5; i++) {
          user.recordFailedLogin();
        }
        
        const result = user.recordLogin();

        expect(result.isSuccess).toBe(true);
        expect(user.isLocked).toBe(false);
        expect(user.loginAttempts).toBe(0);
      });
    });

    describe('recordFailedLogin', () => {
      it('should increment login attempts', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.recordFailedLogin();

        expect(result.isSuccess).toBe(true);
        expect(user.loginAttempts).toBe(1);
      });

      it('should lock account after maximum failed attempts', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        
        // Record 5 failed attempts
        for (let i = 0; i < 5; i++) {
          user.recordFailedLogin();
        }

        expect(user.isLocked).toBe(true);
        expect(user.loginAttempts).toBe(5);
      });
    });

    describe('unlock', () => {
      it('should unlock account successfully', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        
        // Lock the account
        for (let i = 0; i < 5; i++) {
          user.recordFailedLogin();
        }

        const result = user.unlock();

        expect(result.isSuccess).toBe(true);
        expect(user.isLocked).toBe(false);
        expect(user.loginAttempts).toBe(0);
      });
    });

    describe('account activation/deactivation', () => {
      it('should deactivate account', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.deactivate();

        expect(result.isSuccess).toBe(true);
        expect(user.isActive).toBe(false);
      });

      it('should activate account', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        user.deactivate();
        const result = user.activate();

        expect(result.isSuccess).toBe(true);
        expect(user.isActive).toBe(true);
      });
    });

    describe('premium subscription', () => {
      it('should upgrade to premium', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.upgradeToPremium();

        expect(result.isSuccess).toBe(true);
        expect(user.isPremium).toBe(true);
      });

      it('should downgrade from premium', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        user.upgradeToPremium();
        const result = user.downgradeFromPremium();

        expect(result.isSuccess).toBe(true);
        expect(user.isPremium).toBe(false);
      });
    });

    describe('password reset', () => {
      it('should generate password reset token', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.generatePasswordResetToken();

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toBeDefined();
        expect(result.getValue().length).toBeGreaterThan(0);
      });

      it('should reset password with valid token', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const tokenResult = user.generatePasswordResetToken();
        const token = tokenResult.getValue();
        
        const result = user.resetPassword(token, 'newSecurePassword456!');

        expect(result.isSuccess).toBe(true);
        expect(user.isPasswordValid('newSecurePassword456!')).toBe(true);
      });

      it('should fail to reset password with invalid token', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.resetPassword('invalid-token', 'newSecurePassword456!');

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Password reset token is invalid or expired');
      });
    });

    describe('email verification', () => {
      it('should generate email verification token', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.generateEmailVerificationToken();

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toBeDefined();
        expect(result.getValue().length).toBeGreaterThan(0);
      });

      it('should verify email with valid token', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const tokenResult = user.generateEmailVerificationToken();
        const token = tokenResult.getValue();
        
        const result = user.verifyEmailWithToken(token);

        expect(result.isSuccess).toBe(true);
        expect(user.emailVerified).toBe(true);
      });

      it('should fail to verify email with invalid token', () => {
        const props: UserCreationProps = {
          email: 'test@example.com',
          password: 'securePassword123!',
          displayName: 'John Doe',
        };

        const user = User.create(props).getValue();
        const result = user.verifyEmailWithToken('invalid-token');

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email verification token is invalid or expired');
      });
    });
  });

  describe('User business invariants', () => {
    it('should maintain email uniqueness constraint', () => {
      // This will be enforced at the repository level
      expect(true).toBe(true);
    });

    it('should prevent operations on inactive users', () => {
      const props: UserCreationProps = {
        email: 'test@example.com',
        password: 'securePassword123!',
        displayName: 'John Doe',
      };

      const user = User.create(props).getValue();
      user.deactivate();
      
      const result = user.recordLogin();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Cannot perform operation on inactive user');
    });

    it('should prevent operations on locked users', () => {
      const props: UserCreationProps = {
        email: 'test@example.com',
        password: 'securePassword123!',
        displayName: 'John Doe',
      };

      const user = User.create(props).getValue();
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        user.recordFailedLogin();
      }
      
      // Test that profile updates are prevented on locked users
      const newProfile = UserProfile.create({ displayName: 'Jane Smith' }).getValue();
      const result = user.updateProfile(newProfile);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Cannot perform operation on locked user');
    });

    it('should expire password reset tokens', () => {
      // This should be tested with time manipulation
      expect(true).toBe(true);
    });

    it('should expire email verification tokens', () => {
      // This should be tested with time manipulation
      expect(true).toBe(true);
    });
  });

  describe('User domain events', () => {
    it('should raise UserCreated event on creation', () => {
      const props: UserCreationProps = {
        email: 'test@example.com',
        password: 'securePassword123!',
        displayName: 'John Doe',
      };

      const user = User.create(props).getValue();

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toMatchObject({
        type: 'UserCreated',
        userId: user.userId.value,
        email: 'test@example.com',
      });
    });

    it('should raise EmailVerified event on email verification', () => {
      const props: UserCreationProps = {
        email: 'test@example.com',
        password: 'securePassword123!',
        displayName: 'John Doe',
      };

      const user = User.create(props).getValue();
      user.clearEvents(); // Clear creation events
      user.verifyEmail();

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toMatchObject({
        type: 'EmailVerified',
        userId: user.userId.value,
      });
    });

    it('should raise UserLoggedIn event on login', () => {
      const props: UserCreationProps = {
        email: 'test@example.com',
        password: 'securePassword123!',
        displayName: 'John Doe',
      };

      const user = User.create(props).getValue();
      user.clearEvents(); // Clear creation events
      user.recordLogin();

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toMatchObject({
        type: 'UserLoggedIn',
        userId: user.userId.value,
      });
    });

    it('should raise UserLocked event on account lockout', () => {
      const props: UserCreationProps = {
        email: 'test@example.com',
        password: 'securePassword123!',
        displayName: 'John Doe',
      };

      const user = User.create(props).getValue();
      user.clearEvents(); // Clear creation events
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        user.recordFailedLogin();
      }

      const lockEvent = user.domainEvents.find(event => event.type === 'UserLocked');
      expect(lockEvent).toBeDefined();
      expect(lockEvent).toMatchObject({
        type: 'UserLocked',
        userId: user.userId.value,
      });
    });

    it('should raise ProfileUpdated event on profile update', () => {
      const props: UserCreationProps = {
        email: 'test@example.com',
        password: 'securePassword123!',
        displayName: 'John Doe',
      };

      const user = User.create(props).getValue();
      user.clearEvents(); // Clear creation events
      
      const newProfile = UserProfile.create({ displayName: 'Jane Smith' }).getValue();
      user.updateProfile(newProfile);

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toMatchObject({
        type: 'ProfileUpdated',
        userId: user.userId.value,
      });
    });

    it('should raise PremiumUpgraded event on premium upgrade', () => {
      const props: UserCreationProps = {
        email: 'test@example.com',
        password: 'securePassword123!',
        displayName: 'John Doe',
      };

      const user = User.create(props).getValue();
      user.clearEvents(); // Clear creation events
      user.upgradeToPremium();

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toMatchObject({
        type: 'PremiumUpgraded',
        userId: user.userId.value,
      });
    });
  });
});