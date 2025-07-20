import { Result } from '@core/types/result';

/**
 * Mock User Repository for testing
 * Provides in-memory implementation of IUserRepository for tests
 */

interface User {
  id: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  isPremium: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockoutUntil?: Date;
  profile?: any;
}

interface UserFilters {
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

export class MockUserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId
  private callCount: { [method: string]: number } = {};
  private shouldThrowError: boolean = false;
  private errorToThrow: Error | null = null;

  constructor() {
    this.reset();
  }

  /**
   * Resets the repository to initial state
   */
  reset(): void {
    this.users.clear();
    this.emailIndex.clear();
    this.callCount = {};
    this.shouldThrowError = false;
    this.errorToThrow = null;
  }

  /**
   * Sets up the repository to throw errors for testing
   */
  setShouldThrowError(shouldThrow: boolean, error?: Error): void {
    this.shouldThrowError = shouldThrow;
    this.errorToThrow = error || new Error('Mock repository error');
  }

  /**
   * Gets call count for a specific method
   */
  getCallCount(method: string): number {
    return this.callCount[method] || 0;
  }

  /**
   * Increments call count for a method
   */
  private incrementCallCount(method: string): void {
    this.callCount[method] = (this.callCount[method] || 0) + 1;
  }

  /**
   * Throws error if configured to do so
   */
  private throwIfConfigured(): void {
    if (this.shouldThrowError && this.errorToThrow) {
      throw this.errorToThrow;
    }
  }

  /**
   * Seeds the repository with test data
   */
  seedWithTestData(): void {
    const testUsers: User[] = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        isActive: true,
        emailVerified: true,
        isPremium: false,
        createdAt: new Date('2023-01-01'),
        lastLoginAt: new Date('2023-06-01'),
        loginAttempts: 0,
        profile: {
          displayName: 'User One',
          firstName: 'User',
          lastName: 'One',
        },
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        isActive: true,
        emailVerified: false,
        isPremium: true,
        createdAt: new Date('2023-02-01'),
        lastLoginAt: new Date('2023-06-15'),
        loginAttempts: 2,
        profile: {
          displayName: 'User Two',
          firstName: 'User',
          lastName: 'Two',
        },
      },
      {
        id: 'user-3',
        email: 'user3@example.com',
        isActive: false,
        emailVerified: true,
        isPremium: false,
        createdAt: new Date('2023-03-01'),
        loginAttempts: 5,
        lockoutUntil: new Date(Date.now() + 60000), // Locked for 1 minute
        profile: {
          displayName: 'User Three',
          firstName: 'User',
          lastName: 'Three',
        },
      },
    ];

    testUsers.forEach(user => {
      this.users.set(user.id, user);
      this.emailIndex.set(user.email.toLowerCase(), user.id);
    });
  }

  /**
   * Finds user by ID
   */
  async findById(userId: string): Promise<User | null> {
    this.incrementCallCount('findById');
    this.throwIfConfigured();

    if (!userId || userId.trim() === '') {
      throw new Error('UserId cannot be empty');
    }

    return this.users.get(userId) || null;
  }

  /**
   * Finds user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    this.incrementCallCount('findByEmail');
    this.throwIfConfigured();

    if (!email || email.trim() === '') {
      throw new Error('Email cannot be empty');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userId = this.emailIndex.get(normalizedEmail);
    
    return userId ? this.users.get(userId) || null : null;
  }

  /**
   * Checks if user exists by email
   */
  async exists(email: string): Promise<boolean> {
    this.incrementCallCount('exists');
    this.throwIfConfigured();

    if (!email || email.trim() === '') {
      throw new Error('Email cannot be empty');
    }

    const normalizedEmail = email.toLowerCase().trim();
    return this.emailIndex.has(normalizedEmail);
  }

  /**
   * Saves a user
   */
  async save(user: User): Promise<void> {
    this.incrementCallCount('save');
    this.throwIfConfigured();

    if (!user) {
      throw new Error('User cannot be null');
    }

    if (!user.id || user.id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }

    if (!user.email || user.email.trim() === '') {
      throw new Error('User email cannot be empty');
    }

    if (!this.isValidEmail(user.email)) {
      throw new Error('Invalid email format');
    }

    const normalizedEmail = user.email.toLowerCase().trim();
    
    // Check for email conflicts (excluding the current user)
    const existingUserId = this.emailIndex.get(normalizedEmail);
    if (existingUserId && existingUserId !== user.id) {
      throw new Error('Email already exists');
    }

    // Update indexes
    const existingUser = this.users.get(user.id);
    if (existingUser && existingUser.email.toLowerCase() !== normalizedEmail) {
      // Email changed, update index
      this.emailIndex.delete(existingUser.email.toLowerCase());
    }

    this.users.set(user.id, { ...user });
    this.emailIndex.set(normalizedEmail, user.id);
  }

  /**
   * Deletes a user (soft delete)
   */
  async delete(userId: string): Promise<void> {
    this.incrementCallCount('delete');
    this.throwIfConfigured();

    if (!userId || userId.trim() === '') {
      throw new Error('UserId cannot be empty');
    }

    const user = this.users.get(userId);
    if (user) {
      // Soft delete by marking as inactive
      user.isActive = false;
      (user as any).deletedAt = new Date();
    }
    // Note: We don't actually remove from memory for testing purposes
  }

  /**
   * Finds all users with optional filters
   */
  async findAll(filters?: UserFilters): Promise<User[]> {
    this.incrementCallCount('findAll');
    this.throwIfConfigured();

    let users = Array.from(this.users.values());

    if (filters) {
      users = this.applyFilters(users, filters);
      users = this.applySorting(users, filters);
      users = this.applyPagination(users, filters);
    }

    return users;
  }

  /**
   * Counts users with optional filters
   */
  async count(filters?: UserFilters): Promise<number> {
    this.incrementCallCount('count');
    this.throwIfConfigured();

    let users = Array.from(this.users.values());

    if (filters) {
      users = this.applyFilters(users, filters);
    }

    return users.length;
  }

  /**
   * Finds user by ID with profile
   */
  async findByIdWithProfile(userId: string): Promise<(User & { profile: any }) | null> {
    this.incrementCallCount('findByIdWithProfile');
    this.throwIfConfigured();

    const user = await this.findById(userId);
    return user as (User & { profile: any }) | null;
  }

  /**
   * Finds active users
   */
  async findActive(filters?: UserFilters): Promise<User[]> {
    this.incrementCallCount('findActive');
    this.throwIfConfigured();

    const activeFilters = { ...filters, isActive: true };
    return this.findAll(activeFilters);
  }

  /**
   * Finds inactive users
   */
  async findInactive(filters?: UserFilters): Promise<User[]> {
    this.incrementCallCount('findInactive');
    this.throwIfConfigured();

    const inactiveFilters = { ...filters, isActive: false };
    return this.findAll(inactiveFilters);
  }

  /**
   * Bulk update users
   */
  async bulkUpdate(updates: Array<{ userId: string; updates: Partial<User> }>): Promise<void> {
    this.incrementCallCount('bulkUpdate');
    this.throwIfConfigured();

    if (!updates || !Array.isArray(updates)) {
      throw new Error('Updates must be an array');
    }

    // Validate all updates first (atomic operation)
    for (const update of updates) {
      if (!update.userId || !this.users.has(update.userId)) {
        throw new Error(`User not found: ${update.userId}`);
      }
    }

    // Apply all updates
    for (const update of updates) {
      const user = this.users.get(update.userId)!;
      Object.assign(user, update.updates);
    }
  }

  /**
   * Finds users by email domain
   */
  async findByEmailDomain(domain: string): Promise<User[]> {
    this.incrementCallCount('findByEmailDomain');
    this.throwIfConfigured();

    if (!domain || domain.trim() === '') {
      throw new Error('Domain cannot be empty');
    }

    if (!this.isValidDomain(domain)) {
      throw new Error('Invalid domain format');
    }

    const normalizedDomain = domain.toLowerCase();
    
    return Array.from(this.users.values()).filter(user => 
      user.email.toLowerCase().endsWith(`@${normalizedDomain}`)
    );
  }

  /**
   * Finds recently created users
   */
  async findRecentlyCreated(days: number): Promise<User[]> {
    this.incrementCallCount('findRecentlyCreated');
    this.throwIfConfigured();

    if (days < 0) {
      throw new Error('Days must be non-negative');
    }

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return Array.from(this.users.values()).filter(user => 
      user.createdAt >= cutoffDate
    );
  }

  /**
   * Finds users with failed login attempts above threshold
   */
  async findWithFailedLogins(threshold: number): Promise<User[]> {
    this.incrementCallCount('findWithFailedLogins');
    this.throwIfConfigured();

    if (threshold < 0) {
      throw new Error('Threshold must be non-negative');
    }

    return Array.from(this.users.values()).filter(user => 
      user.loginAttempts >= threshold
    );
  }

  /**
   * Finds users pending email verification
   */
  async findPendingEmailVerification(): Promise<User[]> {
    this.incrementCallCount('findPendingEmailVerification');
    this.throwIfConfigured();

    return Array.from(this.users.values()).filter(user => 
      !user.emailVerified && user.isActive
    );
  }

  /**
   * Finds users with expired tokens
   */
  async findExpiredTokens(): Promise<User[]> {
    this.incrementCallCount('findExpiredTokens');
    this.throwIfConfigured();

    const now = new Date();
    
    return Array.from(this.users.values()).filter(user => {
      const hasExpiredPasswordReset = (user as any).passwordResetExpires && 
        (user as any).passwordResetExpires < now;
      const hasExpiredEmailVerification = (user as any).emailVerificationExpires && 
        (user as any).emailVerificationExpires < now;
      
      return hasExpiredPasswordReset || hasExpiredEmailVerification;
    });
  }

  /**
   * Private helper methods
   */

  private applyFilters(users: User[], filters: UserFilters): User[] {
    return users.filter(user => {
      if (filters.isActive !== undefined && user.isActive !== filters.isActive) {
        return false;
      }
      
      if (filters.emailVerified !== undefined && user.emailVerified !== filters.emailVerified) {
        return false;
      }
      
      if (filters.isPremium !== undefined && user.isPremium !== filters.isPremium) {
        return false;
      }
      
      if (filters.createdAfter && user.createdAt < filters.createdAfter) {
        return false;
      }
      
      if (filters.createdBefore && user.createdAt > filters.createdBefore) {
        return false;
      }
      
      if (filters.lastLoginAfter && (!user.lastLoginAt || user.lastLoginAt < filters.lastLoginAfter)) {
        return false;
      }
      
      if (filters.lastLoginBefore && (!user.lastLoginAt || user.lastLoginAt > filters.lastLoginBefore)) {
        return false;
      }
      
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const matches = user.email.toLowerCase().includes(searchTerm) ||
          (user.profile?.displayName?.toLowerCase().includes(searchTerm)) ||
          (user.profile?.firstName?.toLowerCase().includes(searchTerm)) ||
          (user.profile?.lastName?.toLowerCase().includes(searchTerm));
        
        if (!matches) {
          return false;
        }
      }
      
      return true;
    });
  }

  private applySorting(users: User[], filters: UserFilters): User[] {
    if (!filters.sortBy) {
      return users;
    }

    return users.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'lastLoginAt':
          aValue = a.lastLoginAt?.getTime() || 0;
          bValue = b.lastLoginAt?.getTime() || 0;
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'displayName':
          aValue = (a.profile?.displayName || '').toLowerCase();
          bValue = (b.profile?.displayName || '').toLowerCase();
          break;
        default:
          return 0;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private applyPagination(users: User[], filters: UserFilters): User[] {
    const offset = filters.offset || 0;
    const limit = filters.limit;

    if (limit === undefined) {
      return users.slice(offset);
    }

    return users.slice(offset, offset + limit);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }

  /**
   * Test helpers
   */

  getUserCount(): number {
    return this.users.size;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserByEmail(email: string): User | null {
    const normalizedEmail = email.toLowerCase().trim();
    const userId = this.emailIndex.get(normalizedEmail);
    return userId ? this.users.get(userId) || null : null;
  }

  addUser(user: User): void {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.emailIndex.delete(user.email.toLowerCase());
    }
  }

  clearUsers(): void {
    this.users.clear();
    this.emailIndex.clear();
  }

  getEmailIndex(): Map<string, string> {
    return new Map(this.emailIndex);
  }

  simulateSlowQuery(delay: number = 1000): void {
    return new Promise(resolve => setTimeout(resolve, delay)) as any;
  }

  simulateError(method: string, error: Error): void {
    const originalMethod = (this as any)[method];
    (this as any)[method] = async (...args: any[]) => {
      throw error;
    };

    // Restore after first call
    setTimeout(() => {
      (this as any)[method] = originalMethod;
    }, 0);
  }

  getStatistics(): any {
    const users = Array.from(this.users.values());
    
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      verified: users.filter(u => u.emailVerified).length,
      unverified: users.filter(u => !u.emailVerified).length,
      premium: users.filter(u => u.isPremium).length,
      locked: users.filter(u => u.lockoutUntil && u.lockoutUntil > new Date()).length,
      callCounts: { ...this.callCount },
    };
  }
}