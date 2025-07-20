import { User } from '../entities/User';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { UserProfile } from '../value-objects/UserProfile';

export interface UserFilters {
  isActive?: boolean;
  emailVerified?: boolean;
  isPremium?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'displayName';
  sortOrder?: 'asc' | 'desc';
}

export interface UserWithProfile extends User {
  profile: UserProfile;
}

export interface UserUpdate {
  userId: UserId;
  updates: Partial<User>;
}

/**
 * Repository interface for User aggregate root
 * Defines the contract for persisting and retrieving users
 */
export interface IUserRepository {
  /**
   * Find a user by their unique identifier
   * @param userId The user's unique identifier
   * @returns The user if found, null otherwise
   * @throws Error if userId is null/undefined or database error occurs
   */
  findById(userId: UserId): Promise<User | null>;

  /**
   * Find a user by their email address
   * @param email The user's email address
   * @returns The user if found, null otherwise
   * @throws Error if email is null/undefined/invalid or database error occurs
   * @note Email comparison should be case-insensitive
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Check if a user exists with the given email
   * @param email The email address to check
   * @returns True if user exists, false otherwise
   * @throws Error if email is null/undefined/invalid or database error occurs
   * @note Email comparison should be case-insensitive
   */
  exists(email: Email): Promise<boolean>;

  /**
   * Save a user (create new or update existing)
   * @param user The user to save
   * @throws Error if user is null/undefined, validation fails, or database error occurs
   * @throws Error with message "Email already exists" if duplicate email constraint is violated
   * @note Should be atomic - either all changes are saved or none
   */
  save(user: User): Promise<void>;

  /**
   * Delete a user (soft delete by default)
   * @param userId The user's unique identifier
   * @throws Error if userId is null/undefined or database error occurs
   * @note Should be idempotent - no error if user doesn't exist
   * @note Should handle cascading deletes or prevent deletion if foreign key constraints exist
   */
  delete(userId: UserId): Promise<void>;

  /**
   * Find all users with optional filtering
   * @param filters Optional filters to apply
   * @returns Array of users matching the criteria
   * @throws Error if database error occurs
   */
  findAll(filters?: UserFilters): Promise<User[]>;

  /**
   * Count users with optional filtering
   * @param filters Optional filters to apply
   * @returns Number of users matching the criteria
   * @throws Error if database error occurs
   * @note Should be consistent with findAll results when using same filters
   */
  count(filters?: UserFilters): Promise<number>;

  /**
   * Find a user by ID including their complete profile
   * @param userId The user's unique identifier
   * @returns The user with profile if found, null otherwise
   * @throws Error if userId is null/undefined or database error occurs
   */
  findByIdWithProfile(userId: UserId): Promise<UserWithProfile | null>;

  /**
   * Find only active users with optional filtering
   * @param filters Optional additional filters to apply
   * @returns Array of active users matching the criteria
   * @throws Error if database error occurs
   */
  findActive(filters?: UserFilters): Promise<User[]>;

  /**
   * Find only inactive users with optional filtering
   * @param filters Optional additional filters to apply
   * @returns Array of inactive users matching the criteria
   * @throws Error if database error occurs
   */
  findInactive(filters?: UserFilters): Promise<User[]>;

  /**
   * Update multiple users in a single atomic transaction
   * @param updates Array of user updates to apply
   * @throws Error if updates is null/undefined, any update is invalid, or database error occurs
   * @note Should be atomic - either all updates succeed or all fail
   */
  bulkUpdate(updates: UserUpdate[]): Promise<void>;

  /**
   * Find users from a specific email domain
   * @param domain The email domain to search for (e.g., "example.com")
   * @returns Array of users with emails from the specified domain
   * @throws Error if domain is invalid format or database error occurs
   * @note Domain comparison should be case-insensitive
   */
  findByEmailDomain(domain: string): Promise<User[]>;

  /**
   * Find users created within the specified number of days
   * @param days Number of days to look back (must be >= 0)
   * @returns Array of users created within the time period
   * @throws Error if days is negative or database error occurs
   */
  findRecentlyCreated(days: number): Promise<User[]>;

  /**
   * Find users with failed login attempts above the threshold
   * @param threshold Minimum number of failed login attempts (must be >= 0)
   * @returns Array of users with login attempts >= threshold
   * @throws Error if threshold is negative or database error occurs
   */
  findWithFailedLogins(threshold: number): Promise<User[]>;

  /**
   * Find users with unverified emails that have valid verification tokens
   * @returns Array of users pending email verification
   * @throws Error if database error occurs
   * @note Should exclude users with expired verification tokens
   */
  findPendingEmailVerification(): Promise<User[]>;

  /**
   * Find users with expired password reset or email verification tokens
   * @returns Array of users with expired tokens
   * @throws Error if database error occurs
   * @note Should include both password reset and email verification tokens
   */
  findExpiredTokens(): Promise<User[]>;
}