import { Result } from '@core/types/result';
import { AggregateRoot, UniqueEntityID } from '@core/types/domain';
import { Guard } from '@core/utils/Guard';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { UserProfile } from '../value-objects/UserProfile';
import { UserDomainEvents } from '../events';
import { v4 as uuidv4 } from 'uuid';

export interface UserProps {
  userId: UserId;
  email: Email;
  profile: UserProfile;
  password: string;
  emailVerified: boolean;
  isPremium: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockoutUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
}

export interface UserCreationProps {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * User Aggregate Root
 * Represents a user in the identity domain
 */
export class User extends AggregateRoot<UserProps> {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MINUTES = 30;
  private static readonly PASSWORD_RESET_EXPIRY_HOURS = 1;
  private static readonly EMAIL_VERIFICATION_EXPIRY_HOURS = 24;

  // Password validation patterns
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly UPPERCASE_REGEX = /[A-Z]/;
  private static readonly LOWERCASE_REGEX = /[a-z]/;
  private static readonly NUMBER_REGEX = /[0-9]/;
  private static readonly SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: UserCreationProps): Result<User, string> {
    // Validate props
    if (props === null || props === undefined) {
      return Result.fail<User, string>('User props are null or undefined');
    }

    // Validate email
    const emailResult = Email.create(props.email);
    if (emailResult.isFailure) {
      return Result.fail<User, string>(emailResult.getError());
    }

    // Validate password
    const passwordValidation = this.validatePassword(props.password);
    if (passwordValidation.isFailure) {
      return Result.fail<User, string>(passwordValidation.getError());
    }

    // Create user profile
    const profileProps = {
      displayName: props.displayName,
      firstName: props.firstName,
      lastName: props.lastName,
      avatarUrl: props.avatarUrl,
    };

    const profileResult = UserProfile.create(profileProps);
    if (profileResult.isFailure) {
      return Result.fail<User, string>(profileResult.getError());
    }

    // Generate user ID
    const userIdResult = UserId.create();
    if (userIdResult.isFailure) {
      return Result.fail<User, string>(userIdResult.getError());
    }

    // Store password as-is (will be hashed by application layer)
    const hashedPassword = props.password;

    const now = new Date();
    const userProps: UserProps = {
      userId: userIdResult.getValue(),
      email: emailResult.getValue(),
      profile: profileResult.getValue(),
      password: hashedPassword,
      emailVerified: false,
      isPremium: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      loginAttempts: 0,
    };

    const user = new User(userProps);

    // Add domain event
    user.addDomainEvent(
      UserDomainEvents.createUserCreatedEvent(
        user.id,
        user.userId.value,
        user.email.value,
        user.profile.displayName
      )
    );

    return Result.ok<User>(user);
  }

  public static createExisting(props: UserProps, id: UniqueEntityID): Result<User, string> {
    if (props === null || props === undefined) {
      return Result.fail<User, string>('User props are null or undefined');
    }

    return Result.ok<User>(new User(props, id));
  }

  // Getters
  public get userId(): UserId {
    return this.props.userId;
  }

  public get email(): Email {
    return this.props.email;
  }

  public get profile(): UserProfile {
    return this.props.profile;
  }

  public get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  public get isPremium(): boolean {
    return this.props.isPremium;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  public get loginAttempts(): number {
    return this.props.loginAttempts;
  }

  public get isLocked(): boolean {
    return this.props.lockoutUntil ? this.props.lockoutUntil > new Date() : false;
  }

  // Business methods
  public verifyEmail(): Result<void, string> {
    if (this.props.emailVerified) {
      return Result.fail<void, string>('Email is already verified');
    }

    this.props.emailVerified = true;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createEmailVerifiedEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  public updateProfile(newProfile: UserProfile): Result<void, string> {
    if (!this.isActive) {
      return Result.fail<void, string>('Cannot perform operation on inactive user');
    }

    if (this.isLocked) {
      return Result.fail<void, string>('Cannot perform operation on locked user');
    }

    this.props.profile = newProfile;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createProfileUpdatedEvent(this.id, this.userId.value, ['profile'])
    );

    return Result.ok<void>();
  }

  public changePassword(currentPassword: string, newPassword: string): Result<void, string> {
    if (!this.isActive) {
      return Result.fail<void, string>('Cannot perform operation on inactive user');
    }

    // Verify current password
    if (!this.isPasswordValid(currentPassword)) {
      return Result.fail<void, string>('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = User.validatePassword(newPassword);
    if (passwordValidation.isFailure) {
      return Result.fail<void, string>(passwordValidation.getError());
    }

    // Set new password (will be hashed by application layer)
    this.props.password = newPassword;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createPasswordChangedEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  public recordLogin(): Result<void, string> {
    if (!this.isActive) {
      return Result.fail<void, string>('Cannot perform operation on inactive user');
    }

    // recordLogin represents successful authentication, so it clears any lockout
    this.props.lastLoginAt = new Date();
    this.props.loginAttempts = 0;
    this.props.lockoutUntil = undefined;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createUserLoggedInEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  public recordFailedLogin(): Result<void, string> {
    this.props.loginAttempts += 1;
    this.props.updatedAt = new Date();

    if (this.props.loginAttempts >= User.MAX_LOGIN_ATTEMPTS) {
      const lockoutTime = new Date();
      lockoutTime.setMinutes(lockoutTime.getMinutes() + User.LOCKOUT_DURATION_MINUTES);
      this.props.lockoutUntil = lockoutTime;

      this.addDomainEvent(
        UserDomainEvents.createUserLockedEvent(
          this.id,
          this.userId.value,
          'Too many failed login attempts'
        )
      );
    }

    return Result.ok<void>();
  }

  public unlock(): Result<void, string> {
    this.props.loginAttempts = 0;
    this.props.lockoutUntil = undefined;
    this.props.updatedAt = new Date();

    return Result.ok<void>();
  }

  public deactivate(): Result<void, string> {
    this.props.isActive = false;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createUserDeactivatedEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  public activate(): Result<void, string> {
    this.props.isActive = true;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createUserActivatedEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  public upgradeToPremium(): Result<void, string> {
    if (!this.isActive) {
      return Result.fail<void, string>('Cannot perform operation on inactive user');
    }

    this.props.isPremium = true;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createPremiumUpgradedEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  public downgradeFromPremium(): Result<void, string> {
    this.props.isPremium = false;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createPremiumDowngradedEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  public isPasswordValid(password: string): boolean {
    // This method should be implemented by the application layer using IPasswordHasher
    // For now, return a simple comparison for testing
    return password === this.props.password;
  }

  public generatePasswordResetToken(): Result<string, string> {
    const token = uuidv4();
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + User.PASSWORD_RESET_EXPIRY_HOURS);

    this.props.passwordResetToken = token;
    this.props.passwordResetExpires = expiryTime;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createPasswordResetRequestedEvent(
        this.id,
        this.userId.value,
        this.email.value
      )
    );

    return Result.ok<string>(token);
  }

  public resetPassword(token: string, newPassword: string): Result<void, string> {
    if (!this.props.passwordResetToken || 
        !this.props.passwordResetExpires ||
        this.props.passwordResetToken !== token ||
        this.props.passwordResetExpires < new Date()) {
      return Result.fail<void, string>('Password reset token is invalid or expired');
    }

    // Validate new password
    const passwordValidation = User.validatePassword(newPassword);
    if (passwordValidation.isFailure) {
      return Result.fail<void, string>(passwordValidation.getError());
    }

    // Set new password (will be hashed by application layer)
    this.props.password = newPassword;
    this.props.passwordResetToken = undefined;
    this.props.passwordResetExpires = undefined;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createPasswordResetEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  public generateEmailVerificationToken(): Result<string, string> {
    const token = uuidv4();
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + User.EMAIL_VERIFICATION_EXPIRY_HOURS);

    this.props.emailVerificationToken = token;
    this.props.emailVerificationExpires = expiryTime;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createEmailVerificationRequestedEvent(
        this.id,
        this.userId.value,
        this.email.value
      )
    );

    return Result.ok<string>(token);
  }

  public verifyEmailWithToken(token: string): Result<void, string> {
    if (!this.props.emailVerificationToken || 
        !this.props.emailVerificationExpires ||
        this.props.emailVerificationToken !== token ||
        this.props.emailVerificationExpires < new Date()) {
      return Result.fail<void, string>('Email verification token is invalid or expired');
    }

    this.props.emailVerified = true;
    this.props.emailVerificationToken = undefined;
    this.props.emailVerificationExpires = undefined;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      UserDomainEvents.createEmailVerifiedEvent(this.id, this.userId.value)
    );

    return Result.ok<void>();
  }

  private static validatePassword(password: string): Result<void, string> {
    const nullCheck = Guard.againstNullOrUndefined(password, 'Password');
    if (!nullCheck.succeeded) {
      return Result.fail<void, string>(nullCheck.message!);
    }

    const emptyCheck = Guard.againstNullOrEmptyOrWhitespace(password, 'Password');
    if (!emptyCheck.succeeded) {
      return Result.fail<void, string>(emptyCheck.message!);
    }

    const lengthCheck = Guard.againstAtLeast(this.MIN_PASSWORD_LENGTH, password, 'Password');
    if (!lengthCheck.succeeded) {
      return Result.fail<void, string>(lengthCheck.message!);
    }

    if (!this.UPPERCASE_REGEX.test(password)) {
      return Result.fail<void, string>('Password must contain at least one uppercase letter');
    }

    if (!this.LOWERCASE_REGEX.test(password)) {
      return Result.fail<void, string>('Password must contain at least one lowercase letter');
    }

    if (!this.NUMBER_REGEX.test(password)) {
      return Result.fail<void, string>('Password must contain at least one number');
    }

    if (!this.SPECIAL_CHAR_REGEX.test(password)) {
      return Result.fail<void, string>('Password must contain at least one special character');
    }

    return Result.ok<void>();
  }
}