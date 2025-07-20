/**
 * Mock Firebase Auth for testing
 * Provides complete Firebase Auth API simulation for tests
 */

interface FirebaseUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  providerData: Array<{
    providerId: string;
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
  }>;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  sendEmailVerification(): Promise<void>;
  updateProfile(profile: { displayName?: string; photoURL?: string }): Promise<void>;
  updateEmail(newEmail: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  delete(): Promise<void>;
  reload(): Promise<void>;
}

interface UserCredential {
  user: FirebaseUser;
  credential?: any;
  operationType?: string;
}

interface ActionCodeInfo {
  data: {
    email?: string;
    previousEmail?: string;
  };
  operation: string;
}

export class MockFirebaseAuth {
  private users: Map<string, FirebaseUser> = new Map();
  private emailToUid: Map<string, string> = new Map();
  private authStateListeners: Array<(user: FirebaseUser | null) => void> = [];
  private actionCodes: Map<string, ActionCodeInfo> = new Map();
  private resetCodes: Map<string, string> = new Map(); // code -> email
  private shouldThrowError: boolean = false;
  private errorToThrow: Error | null = null;
  private currentUserId: string | null = null;

  constructor() {
    this.reset();
  }

  /**
   * Gets the current user
   */
  get currentUser(): FirebaseUser | null {
    return this.currentUserId ? this.users.get(this.currentUserId) || null : null;
  }

  /**
   * Resets the mock to initial state
   */
  reset(): void {
    this.users.clear();
    this.emailToUid.clear();
    this.authStateListeners = [];
    this.actionCodes.clear();
    this.resetCodes.clear();
    this.shouldThrowError = false;
    this.errorToThrow = null;
    this.currentUserId = null;
  }

  /**
   * Sets up the mock to throw errors
   */
  setShouldThrowError(shouldThrow: boolean, error?: Error): void {
    this.shouldThrowError = shouldThrow;
    this.errorToThrow = error || new Error('Mock Firebase Auth error');
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
   * Creates a new user with email and password
   */
  async createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    this.throwIfConfigured();

    if (!email || !password) {
      throw new Error('Firebase: Email and password are required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Firebase: Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Firebase: Password must be at least 6 characters');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    if (this.emailToUid.has(normalizedEmail)) {
      throw new Error('Firebase: Email already in use');
    }

    const uid = `firebase-uid-${Date.now()}-${Math.random()}`;
    const user = this.createFirebaseUser(uid, normalizedEmail, false);
    
    this.users.set(uid, user);
    this.emailToUid.set(normalizedEmail, uid);
    this.currentUserId = uid;

    this.notifyAuthStateListeners(user);

    return {
      user,
      operationType: 'signIn',
    };
  }

  /**
   * Signs in user with email and password
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    this.throwIfConfigured();

    if (!email || !password) {
      throw new Error('Firebase: Email and password are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const uid = this.emailToUid.get(normalizedEmail);
    
    if (!uid) {
      throw new Error('Firebase: User not found');
    }

    const user = this.users.get(uid);
    if (!user) {
      throw new Error('Firebase: User not found');
    }

    // Simulate password validation (in real Firebase, this would be handled internally)
    if (password === 'wrong-password') {
      throw new Error('Firebase: Invalid credentials');
    }

    // Update last sign in time
    user.metadata.lastSignInTime = new Date().toISOString();
    this.currentUserId = uid;

    this.notifyAuthStateListeners(user);

    return {
      user,
      operationType: 'signIn',
    };
  }

  /**
   * Signs out the current user
   */
  async signOut(): Promise<void> {
    this.throwIfConfigured();

    this.currentUserId = null;
    this.notifyAuthStateListeners(null);
  }

  /**
   * Sends password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    this.throwIfConfigured();

    if (!email) {
      throw new Error('Firebase: Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    if (!this.emailToUid.has(normalizedEmail)) {
      throw new Error('Firebase: User not found');
    }

    // Generate a reset code
    const code = `reset-code-${Date.now()}-${Math.random()}`;
    this.resetCodes.set(code, normalizedEmail);

    // In real Firebase, this would send an email
    console.log(`Mock: Password reset email sent to ${email} with code: ${code}`);
  }

  /**
   * Verifies password reset code
   */
  async verifyPasswordResetCode(code: string): Promise<string> {
    this.throwIfConfigured();

    if (!code) {
      throw new Error('Firebase: Code is required');
    }

    const email = this.resetCodes.get(code);
    if (!email) {
      throw new Error('Firebase: Invalid or expired code');
    }

    return email;
  }

  /**
   * Confirms password reset
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    this.throwIfConfigured();

    if (!code || !newPassword) {
      throw new Error('Firebase: Code and new password are required');
    }

    if (newPassword.length < 6) {
      throw new Error('Firebase: Password must be at least 6 characters');
    }

    const email = this.resetCodes.get(code);
    if (!email) {
      throw new Error('Firebase: Invalid or expired code');
    }

    // Remove the used code
    this.resetCodes.delete(code);

    // In real Firebase, this would update the password
    console.log(`Mock: Password reset confirmed for ${email}`);
  }

  /**
   * Applies action code (for email verification)
   */
  async applyActionCode(code: string): Promise<void> {
    this.throwIfConfigured();

    if (!code) {
      throw new Error('Firebase: Code is required');
    }

    const actionInfo = this.actionCodes.get(code);
    if (!actionInfo) {
      throw new Error('Firebase: Invalid or expired code');
    }

    if (actionInfo.operation === 'VERIFY_EMAIL' && actionInfo.data.email) {
      const uid = this.emailToUid.get(actionInfo.data.email);
      if (uid) {
        const user = this.users.get(uid);
        if (user) {
          user.emailVerified = true;
        }
      }
    }

    // Remove the used code
    this.actionCodes.delete(code);
  }

  /**
   * Checks action code
   */
  async checkActionCode(code: string): Promise<ActionCodeInfo> {
    this.throwIfConfigured();

    if (!code) {
      throw new Error('Firebase: Code is required');
    }

    const actionInfo = this.actionCodes.get(code);
    if (!actionInfo) {
      throw new Error('Firebase: Invalid or expired code');
    }

    return actionInfo;
  }

  /**
   * Sets up auth state change listener
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Immediately call with current user
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Private helper methods
   */

  private createFirebaseUser(uid: string, email: string, emailVerified: boolean = false): FirebaseUser {
    const displayName = email.split('@')[0];
    const now = new Date().toISOString();

    return {
      uid,
      email,
      emailVerified,
      displayName,
      photoURL: null,
      phoneNumber: null,
      metadata: {
        creationTime: now,
        lastSignInTime: now,
      },
      providerData: [
        {
          providerId: 'password',
          uid: email,
          email,
          displayName,
        },
      ],
      getIdToken: jest.fn(async (forceRefresh?: boolean) => {
        if (this.shouldThrowError) {
          throw new Error('Mock: Token generation failed');
        }
        return `mock-id-token-${uid}-${Date.now()}`;
      }),
      sendEmailVerification: jest.fn(async () => {
        if (this.shouldThrowError) {
          throw new Error('Mock: Email verification failed');
        }
        // Generate verification code
        const code = `verify-code-${Date.now()}-${Math.random()}`;
        this.actionCodes.set(code, {
          operation: 'VERIFY_EMAIL',
          data: { email },
        });
        console.log(`Mock: Email verification sent to ${email} with code: ${code}`);
      }),
      updateProfile: jest.fn(async (profile: { displayName?: string; photoURL?: string }) => {
        if (this.shouldThrowError) {
          throw new Error('Mock: Profile update failed');
        }
        if (profile.displayName !== undefined) {
          this.displayName = profile.displayName;
        }
        if (profile.photoURL !== undefined) {
          this.photoURL = profile.photoURL;
        }
      }),
      updateEmail: jest.fn(async (newEmail: string) => {
        if (this.shouldThrowError) {
          throw new Error('Mock: Email update failed');
        }
        if (!this.isValidEmail(newEmail)) {
          throw new Error('Firebase: Invalid email format');
        }
        const normalizedNewEmail = newEmail.toLowerCase().trim();
        if (this.emailToUid.has(normalizedNewEmail)) {
          throw new Error('Firebase: Email already in use');
        }
        
        // Update email mapping
        if (this.email) {
          this.emailToUid.delete(this.email.toLowerCase());
        }
        this.emailToUid.set(normalizedNewEmail, this.uid);
        this.email = normalizedNewEmail;
        this.emailVerified = false; // Email needs to be verified again
      }),
      updatePassword: jest.fn(async (newPassword: string) => {
        if (this.shouldThrowError) {
          throw new Error('Mock: Password update failed');
        }
        if (newPassword.length < 6) {
          throw new Error('Firebase: Password must be at least 6 characters');
        }
        // In real Firebase, this would update the password
        console.log(`Mock: Password updated for ${this.email}`);
      }),
      delete: jest.fn(async () => {
        if (this.shouldThrowError) {
          throw new Error('Mock: User deletion failed');
        }
        // Remove user from mock storage
        this.users.delete(this.uid);
        if (this.email) {
          this.emailToUid.delete(this.email.toLowerCase());
        }
        this.currentUserId = null;
        this.notifyAuthStateListeners(null);
      }),
      reload: jest.fn(async () => {
        if (this.shouldThrowError) {
          throw new Error('Mock: User reload failed');
        }
        // In real Firebase, this would refresh user data
        console.log(`Mock: User data reloaded for ${this.email}`);
      }),
    };
  }

  private notifyAuthStateListeners(user: FirebaseUser | null): void {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Test helper methods
   */

  seedWithTestUsers(): void {
    const testUsers = [
      { email: 'test1@example.com', emailVerified: true },
      { email: 'test2@example.com', emailVerified: false },
      { email: 'verified@example.com', emailVerified: true },
      { email: 'unverified@example.com', emailVerified: false },
    ];

    testUsers.forEach(({ email, emailVerified }) => {
      const uid = `test-uid-${email}`;
      const user = this.createFirebaseUser(uid, email, emailVerified);
      this.users.set(uid, user);
      this.emailToUid.set(email.toLowerCase(), uid);
    });
  }

  getUserByEmail(email: string): FirebaseUser | null {
    const normalizedEmail = email.toLowerCase().trim();
    const uid = this.emailToUid.get(normalizedEmail);
    return uid ? this.users.get(uid) || null : null;
  }

  addUser(email: string, emailVerified: boolean = false): FirebaseUser {
    const uid = `test-uid-${Date.now()}-${Math.random()}`;
    const user = this.createFirebaseUser(uid, email, emailVerified);
    this.users.set(uid, user);
    this.emailToUid.set(email.toLowerCase(), uid);
    return user;
  }

  removeUser(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();
    const uid = this.emailToUid.get(normalizedEmail);
    if (uid) {
      this.users.delete(uid);
      this.emailToUid.delete(normalizedEmail);
      if (this.currentUserId === uid) {
        this.currentUserId = null;
        this.notifyAuthStateListeners(null);
      }
    }
  }

  setCurrentUser(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();
    const uid = this.emailToUid.get(normalizedEmail);
    if (uid) {
      this.currentUserId = uid;
      this.notifyAuthStateListeners(this.users.get(uid) || null);
    }
  }

  clearCurrentUser(): void {
    this.currentUserId = null;
    this.notifyAuthStateListeners(null);
  }

  getAllUsers(): FirebaseUser[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }

  hasUser(email: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    return this.emailToUid.has(normalizedEmail);
  }

  addActionCode(code: string, operation: string, email: string): void {
    this.actionCodes.set(code, {
      operation,
      data: { email },
    });
  }

  addResetCode(code: string, email: string): void {
    this.resetCodes.set(code, email.toLowerCase().trim());
  }

  getActionCodes(): Map<string, ActionCodeInfo> {
    return new Map(this.actionCodes);
  }

  getResetCodes(): Map<string, string> {
    return new Map(this.resetCodes);
  }

  getAuthStateListenerCount(): number {
    return this.authStateListeners.length;
  }

  simulateNetworkError(): void {
    this.setShouldThrowError(true, new Error('Firebase: Network error'));
  }

  simulateUserNotFound(): void {
    this.setShouldThrowError(true, new Error('Firebase: User not found'));
  }

  simulateEmailAlreadyInUse(): void {
    this.setShouldThrowError(true, new Error('Firebase: Email already in use'));
  }

  simulateInvalidCredentials(): void {
    this.setShouldThrowError(true, new Error('Firebase: Invalid credentials'));
  }

  simulateWeakPassword(): void {
    this.setShouldThrowError(true, new Error('Firebase: Password should be at least 6 characters'));
  }

  simulateInvalidEmail(): void {
    this.setShouldThrowError(true, new Error('Firebase: Invalid email'));
  }

  getStatistics(): any {
    const users = Array.from(this.users.values());
    
    return {
      totalUsers: users.length,
      verifiedUsers: users.filter(u => u.emailVerified).length,
      unverifiedUsers: users.filter(u => !u.emailVerified).length,
      currentUser: this.currentUser?.email || null,
      authStateListeners: this.authStateListeners.length,
      actionCodes: this.actionCodes.size,
      resetCodes: this.resetCodes.size,
    };
  }
}