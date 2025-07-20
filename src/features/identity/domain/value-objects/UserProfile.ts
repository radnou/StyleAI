import { Result } from '@core/types/result';
import { ValueObject } from '@core/types/domain';
import { Guard } from '@core/utils/Guard';

export interface UserProfileProps {
  displayName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  location?: string;
  timezone?: string;
  language?: string;
  isProfileComplete?: boolean;
}

/**
 * UserProfile Value Object
 * Represents user profile information in the domain
 */
export class UserProfile extends ValueObject<UserProfileProps> {
  private static readonly MAX_DISPLAY_NAME_LENGTH = 100;
  private static readonly MAX_BIO_LENGTH = 500;
  private static readonly ALLOWED_GENDERS = ['male', 'female', 'other', 'prefer-not-to-say'];
  private static readonly PHONE_REGEX = /^[\+]?[\d\s\-\(\)\.]{7,20}$/;
  private static readonly URL_REGEX = /^https?:\/\/.+/;
  private static readonly MIN_AGE = 13;

  private constructor(props: UserProfileProps) {
    super(props);
  }

  public static create(props: UserProfileProps): Result<UserProfile, string> {
    // Check for null props
    if (props === null || props === undefined) {
      return Result.fail<UserProfile, string>('UserProfile props are null or undefined');
    }

    // Validate display name (required)
    const displayNameCheck = Guard.againstNullOrEmptyOrWhitespace(props.displayName, 'Display name');
    if (!displayNameCheck.succeeded) {
      return Result.fail<UserProfile, string>(displayNameCheck.message!);
    }

    const trimmedDisplayName = props.displayName.trim();
    const displayNameLengthCheck = Guard.againstAtMost(this.MAX_DISPLAY_NAME_LENGTH, trimmedDisplayName, 'Display name');
    if (!displayNameLengthCheck.succeeded) {
      return Result.fail<UserProfile, string>(displayNameLengthCheck.message!);
    }

    // Trim optional string fields
    const trimmedFirstName = props.firstName?.trim();
    const trimmedLastName = props.lastName?.trim();
    const trimmedBio = props.bio?.trim();
    const trimmedLocation = props.location?.trim();

    // Validate bio length if provided
    if (trimmedBio && trimmedBio.length > this.MAX_BIO_LENGTH) {
      return Result.fail<UserProfile, string>('Bio is greater than 500 characters');
    }

    // Validate avatar URL if provided
    if (props.avatarUrl && !this.URL_REGEX.test(props.avatarUrl)) {
      return Result.fail<UserProfile, string>('Avatar URL is not a valid URL');
    }

    // Validate phone number if provided
    if (props.phoneNumber && !this.PHONE_REGEX.test(props.phoneNumber)) {
      return Result.fail<UserProfile, string>('Phone number is not a valid format');
    }

    // Validate date of birth if provided
    if (props.dateOfBirth) {
      const today = new Date();
      if (props.dateOfBirth > today) {
        return Result.fail<UserProfile, string>('Date of birth cannot be in the future');
      }

      // Check minimum age
      const age = this.calculateAge(props.dateOfBirth);
      if (age < this.MIN_AGE) {
        return Result.fail<UserProfile, string>('User must be at least 13 years old');
      }
    }

    // Validate gender if provided
    if (props.gender) {
      const genderCheck = Guard.isOneOf(props.gender, this.ALLOWED_GENDERS, 'Gender');
      if (!genderCheck.succeeded) {
        return Result.fail<UserProfile, string>(genderCheck.message!);
      }
    }

    // Create cleaned props
    const cleanedProps: UserProfileProps = {
      displayName: trimmedDisplayName,
      firstName: trimmedFirstName || undefined,
      lastName: trimmedLastName || undefined,
      bio: trimmedBio || undefined,
      avatarUrl: props.avatarUrl,
      phoneNumber: props.phoneNumber,
      dateOfBirth: props.dateOfBirth,
      gender: props.gender,
      location: trimmedLocation || undefined,
      timezone: props.timezone,
      language: props.language,
      isProfileComplete: props.isProfileComplete || false,
    };

    return Result.ok<UserProfile>(new UserProfile(cleanedProps));
  }

  public get displayName(): string {
    return this.props.displayName;
  }

  public get firstName(): string | undefined {
    return this.props.firstName;
  }

  public get lastName(): string | undefined {
    return this.props.lastName;
  }

  public get fullName(): string {
    if (this.props.firstName && this.props.lastName) {
      return `${this.props.firstName} ${this.props.lastName}`;
    }
    return this.props.displayName;
  }

  public get bio(): string | undefined {
    return this.props.bio;
  }

  public get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  public get phoneNumber(): string | undefined {
    return this.props.phoneNumber;
  }

  public get dateOfBirth(): Date | undefined {
    return this.props.dateOfBirth;
  }

  public get gender(): string | undefined {
    return this.props.gender;
  }

  public get location(): string | undefined {
    return this.props.location;
  }

  public get timezone(): string | undefined {
    return this.props.timezone;
  }

  public get language(): string | undefined {
    return this.props.language;
  }

  public get isProfileComplete(): boolean {
    return this.props.isProfileComplete || false;
  }

  public get age(): number | undefined {
    if (!this.props.dateOfBirth) return undefined;
    return UserProfile.calculateAge(this.props.dateOfBirth);
  }

  public updateDisplayName(newDisplayName: string): Result<UserProfile, string> {
    const newProps = { ...this.props, displayName: newDisplayName };
    return UserProfile.create(newProps);
  }

  public updateBio(newBio: string): Result<UserProfile, string> {
    const newProps = { ...this.props, bio: newBio };
    return UserProfile.create(newProps);
  }

  public updateAvatarUrl(newAvatarUrl: string): Result<UserProfile, string> {
    const newProps = { ...this.props, avatarUrl: newAvatarUrl };
    return UserProfile.create(newProps);
  }

  private static calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}