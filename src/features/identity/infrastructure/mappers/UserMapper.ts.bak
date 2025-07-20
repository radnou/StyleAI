import { DocumentSnapshot, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { User, UserProps } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { UserProfile } from '../../domain/value-objects/UserProfile';
import { UniqueEntityID } from '@core/types/domain';
import { Result } from '@core/types/result';
import { TimestampConverter } from '../utils/TimestampConverter';

/**
 * Firebase document structure for User
 */
export interface FirebaseUserDocument {
  userId: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  bio?: string;
  emailVerified: boolean;
  isPremium: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  loginAttempts: number;
  lockoutUntil?: Timestamp;
  passwordResetToken?: string;
  passwordResetExpires?: Timestamp;
  emailVerificationToken?: string;
  emailVerificationExpires?: Timestamp;
  // Additional fields for search and analytics
  searchTerms?: string[];
  tags?: string[];
  metadata?: { [key: string]: any };
}

/**
 * Firebase Auth user data structure
 */
export interface FirebaseAuthUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime?: string;
  };
  providerData: Array<{
    providerId: string;
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
  }>;
}

/**
 * Mapper class for converting between Firebase and Domain User entities
 */
export class UserMapper {
  /**
   * Maps Firebase Auth User to Domain User entity
   * @param firebaseUser Firebase Auth user
   * @param password User's password (hashed)
   * @returns Result with Domain User entity
   */
  static fromFirebaseAuth(firebaseUser: FirebaseUser, password: string): Result<User, string> {
    try {
      // Validate required fields
      if (!firebaseUser.uid) {
        return Result.fail<User, string>('Firebase user uid is required');
      }
      
      if (!firebaseUser.email) {
        return Result.fail<User, string>('Firebase user email is required');
      }

      // Create value objects
      const userIdResult = UserId.createFromString(firebaseUser.uid);
      if (userIdResult.isFailure) {
        return Result.fail<User, string>(userIdResult.getError());
      }

      const emailResult = Email.create(firebaseUser.email);
      if (emailResult.isFailure) {
        return Result.fail<User, string>(emailResult.getError());
      }

      const profileResult = UserProfile.create({
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        firstName: undefined,
        lastName: undefined,
        photoURL: firebaseUser.photoURL || undefined,
        bio: undefined,
      });
      if (profileResult.isFailure) {
        return Result.fail<User, string>(profileResult.getError());
      }

      // Create user properties
      const userProps: UserProps = {
        userId: userIdResult.getValue(),
        email: emailResult.getValue(),
        profile: profileResult.getValue(),
        password,
        emailVerified: firebaseUser.emailVerified,
        isPremium: false,
        isActive: true,
        createdAt: firebaseUser.metadata.creationTime 
          ? new Date(firebaseUser.metadata.creationTime)
          : new Date(),
        updatedAt: new Date(),
        lastLoginAt: firebaseUser.metadata.lastSignInTime 
          ? new Date(firebaseUser.metadata.lastSignInTime)
          : undefined,
        loginAttempts: 0,
      };

      // Create domain user entity
      const userResult = User.createExisting(userProps, new UniqueEntityID(firebaseUser.uid));
      if (userResult.isFailure) {
        return Result.fail<User, string>(userResult.getError());
      }

      return Result.ok<User>(userResult.getValue());
    } catch (error) {
      return Result.fail<User, string>(`Error mapping Firebase Auth user: ${error}`);
    }
  }

  /**
   * Maps Firebase Firestore document to Domain User entity
   * @param doc Firebase document snapshot
   * @returns Result with Domain User entity
   */
  static fromFirestoreDocument(doc: DocumentSnapshot | QueryDocumentSnapshot): Result<User, string> {
    try {
      if (!doc.exists()) {
        return Result.fail<User, string>('Document does not exist');
      }

      const data = doc.data() as FirebaseUserDocument;
      
      // Validate required fields
      if (!data.userId) {
        return Result.fail<User, string>('User ID is required');
      }
      
      if (!data.email) {
        return Result.fail<User, string>('Email is required');
      }

      if (!data.displayName) {
        return Result.fail<User, string>('Display name is required');
      }

      // Create value objects
      const userIdResult = UserId.createFromString(data.userId);
      if (userIdResult.isFailure) {
        return Result.fail<User, string>(userIdResult.getError());
      }

      const emailResult = Email.create(data.email);
      if (emailResult.isFailure) {
        return Result.fail<User, string>(emailResult.getError());
      }

      const profileResult = UserProfile.create({
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        photoURL: data.photoURL,
        bio: data.bio,
      });
      if (profileResult.isFailure) {
        return Result.fail<User, string>(profileResult.getError());
      }

      // Create user properties
      const userProps: UserProps = {
        userId: userIdResult.getValue(),
        email: emailResult.getValue(),
        profile: profileResult.getValue(),
        password: '', // Password not stored in Firestore
        emailVerified: data.emailVerified || false,
        isPremium: data.isPremium || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: data.createdAt ? TimestampConverter.toDate(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? TimestampConverter.toDate(data.updatedAt) : new Date(),
        lastLoginAt: data.lastLoginAt ? TimestampConverter.toDate(data.lastLoginAt) : undefined,
        loginAttempts: data.loginAttempts || 0,
        lockoutUntil: data.lockoutUntil ? TimestampConverter.toDate(data.lockoutUntil) : undefined,
        passwordResetToken: data.passwordResetToken,
        passwordResetExpires: data.passwordResetExpires 
          ? TimestampConverter.toDate(data.passwordResetExpires) 
          : undefined,
        emailVerificationToken: data.emailVerificationToken,
        emailVerificationExpires: data.emailVerificationExpires 
          ? TimestampConverter.toDate(data.emailVerificationExpires) 
          : undefined,
      };

      // Create domain user entity
      const userResult = User.createExisting(userProps, new UniqueEntityID(doc.id));
      if (userResult.isFailure) {
        return Result.fail<User, string>(userResult.getError());
      }

      return Result.ok<User>(userResult.getValue());
    } catch (error) {
      return Result.fail<User, string>(`Error mapping Firestore document: ${error}`);
    }
  }

  /**
   * Maps Domain User entity to Firebase Firestore document
   * @param user Domain User entity
   * @returns Firebase document data
   */
  static toFirestoreDocument(user: User): FirebaseUserDocument {
    return {
      userId: user.userId.value,
      email: user.email.value,
      displayName: user.profile.displayName,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      photoURL: user.profile.photoURL,
      bio: user.profile.bio,
      emailVerified: user.emailVerified,
      isPremium: user.isPremium,
      isActive: user.isActive,
      createdAt: TimestampConverter.fromDate(user.createdAt),
      updatedAt: TimestampConverter.fromDate(user.updatedAt),
      lastLoginAt: user.lastLoginAt ? TimestampConverter.fromDate(user.lastLoginAt) : undefined,
      loginAttempts: user.loginAttempts,
      lockoutUntil: user.isLocked && user.props.lockoutUntil 
        ? TimestampConverter.fromDate(user.props.lockoutUntil) 
        : undefined,
      passwordResetToken: user.props.passwordResetToken,
      passwordResetExpires: user.props.passwordResetExpires 
        ? TimestampConverter.fromDate(user.props.passwordResetExpires) 
        : undefined,
      emailVerificationToken: user.props.emailVerificationToken,
      emailVerificationExpires: user.props.emailVerificationExpires 
        ? TimestampConverter.fromDate(user.props.emailVerificationExpires) 
        : undefined,
      // Add search terms for better querying
      searchTerms: [
        user.email.value.toLowerCase(),
        user.profile.displayName.toLowerCase(),
        user.profile.firstName?.toLowerCase(),
        user.profile.lastName?.toLowerCase(),
      ].filter(Boolean),
      // Add tags for categorization
      tags: [
        user.isPremium ? 'premium' : 'free',
        user.isActive ? 'active' : 'inactive',
        user.emailVerified ? 'verified' : 'unverified',
      ],
      // Add metadata for analytics
      metadata: {
        domain: user.email.value.split('@')[1],
        hasProfile: Boolean(user.profile.photoURL),
        hasName: Boolean(user.profile.firstName || user.profile.lastName),
        accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        lastActivity: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      },
    };
  }

  /**
   * Maps Domain User entity to Firebase Auth user update data
   * @param user Domain User entity
   * @returns Firebase Auth user update data
   */
  static toFirebaseAuthUpdate(user: User): { displayName?: string; photoURL?: string } {
    return {
      displayName: user.profile.displayName,
      photoURL: user.profile.photoURL || null,
    };
  }

  /**
   * Maps partial user data to Firestore update object
   * @param updates Partial user data
   * @returns Firestore update object
   */
  static toFirestoreUpdate(updates: Partial<UserProps>): Partial<FirebaseUserDocument> {
    const firestoreUpdate: Partial<FirebaseUserDocument> = {};

    if (updates.email) {
      firestoreUpdate.email = updates.email.value;
    }

    if (updates.profile) {
      firestoreUpdate.displayName = updates.profile.displayName;
      firestoreUpdate.firstName = updates.profile.firstName;
      firestoreUpdate.lastName = updates.profile.lastName;
      firestoreUpdate.photoURL = updates.profile.photoURL;
      firestoreUpdate.bio = updates.profile.bio;
    }

    if (updates.emailVerified !== undefined) {
      firestoreUpdate.emailVerified = updates.emailVerified;
    }

    if (updates.isPremium !== undefined) {
      firestoreUpdate.isPremium = updates.isPremium;
    }

    if (updates.isActive !== undefined) {
      firestoreUpdate.isActive = updates.isActive;
    }

    if (updates.updatedAt) {
      firestoreUpdate.updatedAt = TimestampConverter.fromDate(updates.updatedAt);
    }

    if (updates.lastLoginAt) {
      firestoreUpdate.lastLoginAt = TimestampConverter.fromDate(updates.lastLoginAt);
    }

    if (updates.loginAttempts !== undefined) {
      firestoreUpdate.loginAttempts = updates.loginAttempts;
    }

    if (updates.lockoutUntil) {
      firestoreUpdate.lockoutUntil = TimestampConverter.fromDate(updates.lockoutUntil);
    }

    if (updates.passwordResetToken !== undefined) {
      firestoreUpdate.passwordResetToken = updates.passwordResetToken;
    }

    if (updates.passwordResetExpires) {
      firestoreUpdate.passwordResetExpires = TimestampConverter.fromDate(updates.passwordResetExpires);
    }

    if (updates.emailVerificationToken !== undefined) {
      firestoreUpdate.emailVerificationToken = updates.emailVerificationToken;
    }

    if (updates.emailVerificationExpires) {
      firestoreUpdate.emailVerificationExpires = TimestampConverter.fromDate(updates.emailVerificationExpires);
    }

    return firestoreUpdate;
  }

  /**
   * Creates a new user document with default values
   * @param userId User ID
   * @param email Email address
   * @param displayName Display name
   * @param additionalData Additional user data
   * @returns Firebase user document
   */
  static createUserDocument(
    userId: string,
    email: string,
    displayName: string,
    additionalData?: Partial<FirebaseUserDocument>
  ): FirebaseUserDocument {
    const now = TimestampConverter.now();
    
    return {
      userId,
      email,
      displayName,
      firstName: additionalData?.firstName,
      lastName: additionalData?.lastName,
      photoURL: additionalData?.photoURL,
      bio: additionalData?.bio,
      emailVerified: additionalData?.emailVerified || false,
      isPremium: additionalData?.isPremium || false,
      isActive: additionalData?.isActive !== undefined ? additionalData.isActive : true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: additionalData?.lastLoginAt,
      loginAttempts: additionalData?.loginAttempts || 0,
      lockoutUntil: additionalData?.lockoutUntil,
      passwordResetToken: additionalData?.passwordResetToken,
      passwordResetExpires: additionalData?.passwordResetExpires,
      emailVerificationToken: additionalData?.emailVerificationToken,
      emailVerificationExpires: additionalData?.emailVerificationExpires,
      searchTerms: [
        email.toLowerCase(),
        displayName.toLowerCase(),
        additionalData?.firstName?.toLowerCase(),
        additionalData?.lastName?.toLowerCase(),
      ].filter(Boolean),
      tags: [
        additionalData?.isPremium ? 'premium' : 'free',
        additionalData?.isActive !== false ? 'active' : 'inactive',
        additionalData?.emailVerified ? 'verified' : 'unverified',
      ],
      metadata: {
        domain: email.split('@')[1],
        hasProfile: Boolean(additionalData?.photoURL),
        hasName: Boolean(additionalData?.firstName || additionalData?.lastName),
        accountAge: 0,
        lastActivity: null,
      },
    };
  }

  /**
   * Validates Firebase user document data
   * @param data Firebase user document data
   * @returns Result indicating if data is valid
   */
  static validateFirebaseUserDocument(data: any): Result<void, string> {
    if (!data) {
      return Result.fail<void, string>('User data is required');
    }

    if (!data.userId || typeof data.userId !== 'string') {
      return Result.fail<void, string>('Valid user ID is required');
    }

    if (!data.email || typeof data.email !== 'string') {
      return Result.fail<void, string>('Valid email is required');
    }

    if (!data.displayName || typeof data.displayName !== 'string') {
      return Result.fail<void, string>('Valid display name is required');
    }

    if (data.emailVerified !== undefined && typeof data.emailVerified !== 'boolean') {
      return Result.fail<void, string>('Email verified must be a boolean');
    }

    if (data.isPremium !== undefined && typeof data.isPremium !== 'boolean') {
      return Result.fail<void, string>('Is premium must be a boolean');
    }

    if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
      return Result.fail<void, string>('Is active must be a boolean');
    }

    if (data.loginAttempts !== undefined && typeof data.loginAttempts !== 'number') {
      return Result.fail<void, string>('Login attempts must be a number');
    }

    if (data.createdAt && !(data.createdAt instanceof Timestamp)) {
      return Result.fail<void, string>('Created at must be a Timestamp');
    }

    if (data.updatedAt && !(data.updatedAt instanceof Timestamp)) {
      return Result.fail<void, string>('Updated at must be a Timestamp');
    }

    return Result.ok<void>();
  }

  /**
   * Sanitizes user data for public display
   * @param user Domain User entity
   * @returns Sanitized user data
   */
  static toPublicUserData(user: User): {
    id: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string;
    bio?: string;
    emailVerified: boolean;
    isPremium: boolean;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
  } {
    return {
      id: user.userId.value,
      email: user.email.value,
      displayName: user.profile.displayName,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      photoURL: user.profile.photoURL,
      bio: user.profile.bio,
      emailVerified: user.emailVerified,
      isPremium: user.isPremium,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
    };
  }

  /**
   * Sanitizes user data for admin display
   * @param user Domain User entity
   * @returns Sanitized admin user data
   */
  static toAdminUserData(user: User): {
    id: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string;
    bio?: string;
    emailVerified: boolean;
    isPremium: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    loginAttempts: number;
    isLocked: boolean;
    lockoutUntil?: string;
    hasPasswordResetToken: boolean;
    hasEmailVerificationToken: boolean;
  } {
    return {
      id: user.userId.value,
      email: user.email.value,
      displayName: user.profile.displayName,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      photoURL: user.profile.photoURL,
      bio: user.profile.bio,
      emailVerified: user.emailVerified,
      isPremium: user.isPremium,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      loginAttempts: user.loginAttempts,
      isLocked: user.isLocked,
      lockoutUntil: user.props.lockoutUntil?.toISOString(),
      hasPasswordResetToken: Boolean(user.props.passwordResetToken),
      hasEmailVerificationToken: Boolean(user.props.emailVerificationToken),
    };
  }
}