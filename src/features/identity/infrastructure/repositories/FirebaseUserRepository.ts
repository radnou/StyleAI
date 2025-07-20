import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  writeBatch,
  runTransaction,
  onSnapshot,
  Unsubscribe,
  FieldValue,
  serverTimestamp,
  Timestamp,
  AggregateQuerySnapshot,
  AggregateField,
  count,
  getAggregateFromServer,
} from 'firebase/firestore';
import { IUserRepository, UserFilters, UserWithProfile, UserUpdate } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { UserProfile } from '../../domain/value-objects/UserProfile';
import { UserMapper, FirebaseUserDocument } from '../mappers/UserMapper';
import { FirebaseErrorMapper } from '../errors/FirebaseErrorMapper';
import { TimestampConverter } from '../utils/TimestampConverter';
import { ILogger } from '../../application/services';
import { Result } from '@core/types/result';

/**
 * Firebase implementation of the IUserRepository interface
 * Handles all user data persistence operations with Firestore
 */
export class FirebaseUserRepository implements IUserRepository {
  private readonly firestore: Firestore;
  private readonly logger?: ILogger;
  private readonly collectionName = 'users';
  private readonly retryOptions: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
  };

  constructor(firestore: Firestore, logger?: ILogger) {
    this.firestore = firestore;
    this.logger = logger;
    this.retryOptions = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffFactor: 2,
    };

    this.logger?.info('FirebaseUserRepository initialized', {
      collectionName: this.collectionName,
    });
  }

  /**
   * Find a user by their unique identifier
   */
  async findById(userId: UserId): Promise<User | null> {
    try {
      this.logger?.debug('Finding user by ID', { userId: userId.value });

      if (!userId || !userId.value) {
        throw new Error('User ID is required');
      }

      const docRef = doc(this.firestore, this.collectionName, userId.value);
      const docSnap = await this.retryOperation(() => getDoc(docRef));

      if (!docSnap.exists()) {
        this.logger?.debug('User not found', { userId: userId.value });
        return null;
      }

      const userResult = UserMapper.fromFirestoreDocument(docSnap);
      if (userResult.isFailure) {
        throw new Error(userResult.getError());
      }

      this.logger?.debug('User found successfully', {
        userId: userId.value,
        email: userResult.getValue().email.value,
      });

      return userResult.getValue();
    } catch (error: any) {
      this.logger?.error('Failed to find user by ID', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find a user by their email address
   */
  async findByEmail(email: Email): Promise<User | null> {
    try {
      this.logger?.debug('Finding user by email', { email: email.value });

      if (!email || !email.value) {
        throw new Error('Email is required');
      }

      const usersRef = collection(this.firestore, this.collectionName);
      const q = query(
        usersRef,
        where('email', '==', email.value.toLowerCase()),
        limit(1)
      );

      const querySnapshot = await this.retryOperation(() => getDocs(q));

      if (querySnapshot.empty) {
        this.logger?.debug('User not found by email', { email: email.value });
        return null;
      }

      const doc = querySnapshot.docs[0];
      const userResult = UserMapper.fromFirestoreDocument(doc);
      if (userResult.isFailure) {
        throw new Error(userResult.getError());
      }

      this.logger?.debug('User found by email successfully', {
        userId: userResult.getValue().userId.value,
        email: email.value,
      });

      return userResult.getValue();
    } catch (error: any) {
      this.logger?.error('Failed to find user by email', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Check if a user exists with the given email
   */
  async exists(email: Email): Promise<boolean> {
    try {
      this.logger?.debug('Checking if user exists', { email: email.value });

      if (!email || !email.value) {
        throw new Error('Email is required');
      }

      const usersRef = collection(this.firestore, this.collectionName);
      const q = query(
        usersRef,
        where('email', '==', email.value.toLowerCase()),
        limit(1)
      );

      const querySnapshot = await this.retryOperation(() => getDocs(q));
      const exists = !querySnapshot.empty;

      this.logger?.debug('User existence check completed', {
        email: email.value,
        exists,
      });

      return exists;
    } catch (error: any) {
      this.logger?.error('Failed to check user existence', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Save a user (create new or update existing)
   */
  async save(user: User): Promise<void> {
    try {
      this.logger?.debug('Saving user', {
        userId: user.userId.value,
        email: user.email.value,
      });

      if (!user) {
        throw new Error('User is required');
      }

      // Check for email uniqueness if this is a new user or email changed
      const existingUser = await this.findByEmail(user.email);
      if (existingUser && existingUser.userId.value !== user.userId.value) {
        throw new Error('Email already exists');
      }

      const docRef = doc(this.firestore, this.collectionName, user.userId.value);
      const userData = UserMapper.toFirestoreDocument(user);

      // Update timestamp
      userData.updatedAt = TimestampConverter.now();

      await this.retryOperation(() => setDoc(docRef, userData, { merge: true }));

      this.logger?.info('User saved successfully', {
        userId: user.userId.value,
        email: user.email.value,
        isNew: !existingUser,
      });
    } catch (error: any) {
      this.logger?.error('Failed to save user', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Delete a user (soft delete by default)
   */
  async delete(userId: UserId): Promise<void> {
    try {
      this.logger?.debug('Deleting user', { userId: userId.value });

      if (!userId || !userId.value) {
        throw new Error('User ID is required');
      }

      const docRef = doc(this.firestore, this.collectionName, userId.value);

      // Soft delete by setting isActive to false
      await this.retryOperation(() =>
        updateDoc(docRef, {
          isActive: false,
          updatedAt: TimestampConverter.now(),
        })
      );

      this.logger?.info('User deleted successfully (soft delete)', {
        userId: userId.value,
      });
    } catch (error: any) {
      this.logger?.error('Failed to delete user', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find all users with optional filtering
   */
  async findAll(filters?: UserFilters): Promise<User[]> {
    try {
      this.logger?.debug('Finding all users with filters', { filters });

      const usersRef = collection(this.firestore, this.collectionName);
      const constraints = this.buildQueryConstraints(filters);
      const q = query(usersRef, ...constraints);

      const querySnapshot = await this.retryOperation(() => getDocs(q));
      const users: User[] = [];

      for (const doc of querySnapshot.docs) {
        const userResult = UserMapper.fromFirestoreDocument(doc);
        if (userResult.isSuccess) {
          users.push(userResult.getValue());
        } else {
          this.logger?.warn('Failed to map user document', {
            docId: doc.id,
            error: userResult.getError(),
          });
        }
      }

      this.logger?.debug('Users found successfully', {
        count: users.length,
        filters,
      });

      return users;
    } catch (error: any) {
      this.logger?.error('Failed to find all users', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Count users with optional filtering
   */
  async count(filters?: UserFilters): Promise<number> {
    try {
      this.logger?.debug('Counting users with filters', { filters });

      const usersRef = collection(this.firestore, this.collectionName);
      const constraints = this.buildQueryConstraints(filters, true); // Skip pagination for count
      const q = query(usersRef, ...constraints);

      const snapshot: AggregateQuerySnapshot<{ count: AggregateField<number> }> = 
        await this.retryOperation(() => getAggregateFromServer(q, { count: count() }));

      const userCount = snapshot.data().count;

      this.logger?.debug('User count completed', {
        count: userCount,
        filters,
      });

      return userCount;
    } catch (error: any) {
      this.logger?.error('Failed to count users', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find a user by ID including their complete profile
   */
  async findByIdWithProfile(userId: UserId): Promise<UserWithProfile | null> {
    try {
      this.logger?.debug('Finding user with profile by ID', { userId: userId.value });

      const user = await this.findById(userId);
      if (!user) {
        return null;
      }

      // In our case, the profile is already included in the user entity
      const userWithProfile: UserWithProfile = {
        ...user,
        profile: user.profile,
      };

      this.logger?.debug('User with profile found successfully', {
        userId: userId.value,
        hasProfile: true,
      });

      return userWithProfile;
    } catch (error: any) {
      this.logger?.error('Failed to find user with profile by ID', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find only active users with optional filtering
   */
  async findActive(filters?: UserFilters): Promise<User[]> {
    try {
      this.logger?.debug('Finding active users with filters', { filters });

      const activeFilters: UserFilters = {
        ...filters,
        isActive: true,
      };

      return await this.findAll(activeFilters);
    } catch (error: any) {
      this.logger?.error('Failed to find active users', error);
      throw error;
    }
  }

  /**
   * Find only inactive users with optional filtering
   */
  async findInactive(filters?: UserFilters): Promise<User[]> {
    try {
      this.logger?.debug('Finding inactive users with filters', { filters });

      const inactiveFilters: UserFilters = {
        ...filters,
        isActive: false,
      };

      return await this.findAll(inactiveFilters);
    } catch (error: any) {
      this.logger?.error('Failed to find inactive users', error);
      throw error;
    }
  }

  /**
   * Update multiple users in a single atomic transaction
   */
  async bulkUpdate(updates: UserUpdate[]): Promise<void> {
    try {
      this.logger?.debug('Performing bulk user updates', { count: updates.length });

      if (!updates || updates.length === 0) {
        throw new Error('Updates array is required and cannot be empty');
      }

      if (updates.length > 500) {
        throw new Error('Cannot update more than 500 users in a single transaction');
      }

      await this.retryOperation(async () => {
        return await runTransaction(this.firestore, async (transaction) => {
          // Read all documents first
          const docRefs = updates.map(update => 
            doc(this.firestore, this.collectionName, update.userId.value)
          );

          const docSnaps = await Promise.all(
            docRefs.map(docRef => transaction.get(docRef))
          );

          // Validate all documents exist
          for (let i = 0; i < docSnaps.length; i++) {
            if (!docSnaps[i].exists()) {
              throw new Error(`User not found: ${updates[i].userId.value}`);
            }
          }

          // Apply all updates
          for (let i = 0; i < updates.length; i++) {
            const updateData = UserMapper.toFirestoreUpdate(updates[i].updates);
            updateData.updatedAt = TimestampConverter.now();
            
            transaction.update(docRefs[i], updateData);
          }
        });
      });

      this.logger?.info('Bulk user updates completed successfully', {
        count: updates.length,
      });
    } catch (error: any) {
      this.logger?.error('Failed to perform bulk user updates', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find users from a specific email domain
   */
  async findByEmailDomain(domain: string): Promise<User[]> {
    try {
      this.logger?.debug('Finding users by email domain', { domain });

      if (!domain) {
        throw new Error('Domain is required');
      }

      const normalizedDomain = domain.toLowerCase();

      const usersRef = collection(this.firestore, this.collectionName);
      const q = query(
        usersRef,
        where('metadata.domain', '==', normalizedDomain),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await this.retryOperation(() => getDocs(q));
      const users: User[] = [];

      for (const doc of querySnapshot.docs) {
        const userResult = UserMapper.fromFirestoreDocument(doc);
        if (userResult.isSuccess) {
          users.push(userResult.getValue());
        }
      }

      this.logger?.debug('Users found by email domain', {
        domain,
        count: users.length,
      });

      return users;
    } catch (error: any) {
      this.logger?.error('Failed to find users by email domain', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find users created within the specified number of days
   */
  async findRecentlyCreated(days: number): Promise<User[]> {
    try {
      this.logger?.debug('Finding recently created users', { days });

      if (days < 0) {
        throw new Error('Days must be non-negative');
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffTimestamp = TimestampConverter.fromDate(cutoffDate);

      const usersRef = collection(this.firestore, this.collectionName);
      const q = query(
        usersRef,
        where('createdAt', '>=', cutoffTimestamp),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await this.retryOperation(() => getDocs(q));
      const users: User[] = [];

      for (const doc of querySnapshot.docs) {
        const userResult = UserMapper.fromFirestoreDocument(doc);
        if (userResult.isSuccess) {
          users.push(userResult.getValue());
        }
      }

      this.logger?.debug('Recently created users found', {
        days,
        cutoffDate: cutoffDate.toISOString(),
        count: users.length,
      });

      return users;
    } catch (error: any) {
      this.logger?.error('Failed to find recently created users', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find users with failed login attempts above the threshold
   */
  async findWithFailedLogins(threshold: number): Promise<User[]> {
    try {
      this.logger?.debug('Finding users with failed logins', { threshold });

      if (threshold < 0) {
        throw new Error('Threshold must be non-negative');
      }

      const usersRef = collection(this.firestore, this.collectionName);
      const q = query(
        usersRef,
        where('loginAttempts', '>=', threshold),
        orderBy('loginAttempts', 'desc')
      );

      const querySnapshot = await this.retryOperation(() => getDocs(q));
      const users: User[] = [];

      for (const doc of querySnapshot.docs) {
        const userResult = UserMapper.fromFirestoreDocument(doc);
        if (userResult.isSuccess) {
          users.push(userResult.getValue());
        }
      }

      this.logger?.debug('Users with failed logins found', {
        threshold,
        count: users.length,
      });

      return users;
    } catch (error: any) {
      this.logger?.error('Failed to find users with failed logins', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find users with unverified emails that have valid verification tokens
   */
  async findPendingEmailVerification(): Promise<User[]> {
    try {
      this.logger?.debug('Finding users pending email verification');

      const now = TimestampConverter.now();
      const usersRef = collection(this.firestore, this.collectionName);
      const q = query(
        usersRef,
        where('emailVerified', '==', false),
        where('emailVerificationToken', '!=', null),
        where('emailVerificationExpires', '>', now),
        orderBy('emailVerificationExpires', 'asc')
      );

      const querySnapshot = await this.retryOperation(() => getDocs(q));
      const users: User[] = [];

      for (const doc of querySnapshot.docs) {
        const userResult = UserMapper.fromFirestoreDocument(doc);
        if (userResult.isSuccess) {
          users.push(userResult.getValue());
        }
      }

      this.logger?.debug('Users pending email verification found', {
        count: users.length,
      });

      return users;
    } catch (error: any) {
      this.logger?.error('Failed to find users pending email verification', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Find users with expired password reset or email verification tokens
   */
  async findExpiredTokens(): Promise<User[]> {
    try {
      this.logger?.debug('Finding users with expired tokens');

      const now = TimestampConverter.now();
      const usersRef = collection(this.firestore, this.collectionName);

      // Find users with expired password reset tokens
      const passwordResetQuery = query(
        usersRef,
        where('passwordResetToken', '!=', null),
        where('passwordResetExpires', '<=', now)
      );

      // Find users with expired email verification tokens
      const emailVerificationQuery = query(
        usersRef,
        where('emailVerificationToken', '!=', null),
        where('emailVerificationExpires', '<=', now)
      );

      const [passwordResetSnapshot, emailVerificationSnapshot] = await Promise.all([
        this.retryOperation(() => getDocs(passwordResetQuery)),
        this.retryOperation(() => getDocs(emailVerificationQuery)),
      ]);

      const users: User[] = [];
      const userIds = new Set<string>();

      // Process password reset expired tokens
      for (const doc of passwordResetSnapshot.docs) {
        if (!userIds.has(doc.id)) {
          const userResult = UserMapper.fromFirestoreDocument(doc);
          if (userResult.isSuccess) {
            users.push(userResult.getValue());
            userIds.add(doc.id);
          }
        }
      }

      // Process email verification expired tokens
      for (const doc of emailVerificationSnapshot.docs) {
        if (!userIds.has(doc.id)) {
          const userResult = UserMapper.fromFirestoreDocument(doc);
          if (userResult.isSuccess) {
            users.push(userResult.getValue());
            userIds.add(doc.id);
          }
        }
      }

      this.logger?.debug('Users with expired tokens found', {
        count: users.length,
        passwordResetCount: passwordResetSnapshot.size,
        emailVerificationCount: emailVerificationSnapshot.size,
      });

      return users;
    } catch (error: any) {
      this.logger?.error('Failed to find users with expired tokens', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Hard delete a user (permanently remove from database)
   */
  async hardDelete(userId: UserId): Promise<void> {
    try {
      this.logger?.debug('Hard deleting user', { userId: userId.value });

      if (!userId || !userId.value) {
        throw new Error('User ID is required');
      }

      const docRef = doc(this.firestore, this.collectionName, userId.value);
      await this.retryOperation(() => deleteDoc(docRef));

      this.logger?.info('User hard deleted successfully', {
        userId: userId.value,
      });
    } catch (error: any) {
      this.logger?.error('Failed to hard delete user', error);
      const domainError = FirebaseErrorMapper.mapFirestoreError(error);
      throw domainError;
    }
  }

  /**
   * Listen for real-time user changes
   */
  onUserChanged(userId: UserId, callback: (user: User | null) => void): () => void {
    this.logger?.debug('Setting up user change listener', { userId: userId.value });

    const docRef = doc(this.firestore, this.collectionName, userId.value);
    
    const unsubscribe: Unsubscribe = onSnapshot(
      docRef,
      (doc: DocumentSnapshot) => {
        try {
          if (!doc.exists()) {
            callback(null);
            return;
          }

          const userResult = UserMapper.fromFirestoreDocument(doc);
          if (userResult.isSuccess) {
            callback(userResult.getValue());
          } else {
            this.logger?.error('Failed to map user document in listener', {
              docId: doc.id,
              error: userResult.getError(),
            });
            callback(null);
          }
        } catch (error: any) {
          this.logger?.error('Error in user change listener', error);
          callback(null);
        }
      },
      (error: any) => {
        this.logger?.error('User change listener error', error);
        callback(null);
      }
    );

    return () => {
      this.logger?.debug('Unsubscribing from user change listener', { userId: userId.value });
      unsubscribe();
    };
  }

  /**
   * Build query constraints from filters
   */
  private buildQueryConstraints(filters?: UserFilters, skipPagination: boolean = false): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    if (!filters) {
      return constraints;
    }

    // Filter constraints
    if (filters.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }

    if (filters.emailVerified !== undefined) {
      constraints.push(where('emailVerified', '==', filters.emailVerified));
    }

    if (filters.isPremium !== undefined) {
      constraints.push(where('isPremium', '==', filters.isPremium));
    }

    if (filters.createdAfter) {
      constraints.push(where('createdAt', '>=', TimestampConverter.fromDate(filters.createdAfter)));
    }

    if (filters.createdBefore) {
      constraints.push(where('createdAt', '<=', TimestampConverter.fromDate(filters.createdBefore)));
    }

    if (filters.lastLoginAfter) {
      constraints.push(where('lastLoginAt', '>=', TimestampConverter.fromDate(filters.lastLoginAfter)));
    }

    if (filters.lastLoginBefore) {
      constraints.push(where('lastLoginAt', '<=', TimestampConverter.fromDate(filters.lastLoginBefore)));
    }

    if (filters.searchTerm) {
      // Use array-contains for search terms
      constraints.push(where('searchTerms', 'array-contains', filters.searchTerm.toLowerCase()));
    }

    // Sorting constraints
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder || 'desc';
      constraints.push(orderBy(filters.sortBy, sortOrder));
    } else {
      // Default sort by creation date
      constraints.push(orderBy('createdAt', 'desc'));
    }

    // Pagination constraints
    if (!skipPagination) {
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }

      if (filters.offset && filters.offset > 0) {
        // Note: Firestore doesn't support offset directly
        // This is a simplified implementation
        // In production, you'd use cursor-based pagination with startAfter
        this.logger?.warn('Offset-based pagination is not efficiently supported by Firestore', {
          offset: filters.offset,
        });
      }
    }

    return constraints;
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === this.retryOptions.maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryOptions.baseDelay * Math.pow(this.retryOptions.backoffFactor, attempt),
          this.retryOptions.maxDelay
        );
        
        this.logger?.warn(`Operation failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries: this.retryOptions.maxRetries,
          error: error.message,
        });
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Determines if an error should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    if (!error.code) {
      return false;
    }

    // Don't retry on certain Firestore errors
    const nonRetryableErrors = [
      'permission-denied',
      'invalid-argument',
      'not-found',
      'already-exists',
      'failed-precondition',
      'out-of-range',
      'unimplemented',
      'unauthenticated',
    ];

    return nonRetryableErrors.includes(error.code);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): Firestore {
    return this.firestore;
  }

  /**
   * Get collection reference
   */
  getCollectionRef() {
    return collection(this.firestore, this.collectionName);
  }

  /**
   * Get document reference for user
   */
  getDocRef(userId: string) {
    return doc(this.firestore, this.collectionName, userId);
  }
}