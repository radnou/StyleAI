import { Result } from '@core/types/result';
import { UniqueEntityID } from '@core/types/domain';

/**
 * Test Data Factory for Identity Domain
 * Provides factories for creating test data objects
 */

export class TestDataFactory {
  /**
   * Creates test User data
   */
  static createUserData(overrides?: Partial<any>): any {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashedPassword123',
      emailVerified: false,
      isPremium: false,
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      lastLoginAt: undefined,
      loginAttempts: 0,
      lockoutUntil: undefined,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      emailVerificationToken: 'verification-token',
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      ...overrides,
    };
  }

  /**
   * Creates test Email value object data
   */
  static createEmailData(overrides?: Partial<any>): any {
    return {
      value: 'test@example.com',
      ...overrides,
    };
  }

  /**
   * Creates test UserId value object data
   */
  static createUserIdData(overrides?: Partial<any>): any {
    return {
      value: 'test-user-id',
      ...overrides,
    };
  }

  /**
   * Creates test UserProfile value object data
   */
  static createUserProfileData(overrides?: Partial<any>): any {
    return {
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      bio: 'Test user bio',
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneNumber: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'prefer-not-to-say',
      location: 'Test City, Test State',
      timezone: 'America/New_York',
      language: 'en-US',
      isProfileComplete: false,
      ...overrides,
    };
  }

  /**
   * Creates test CreateUser request data
   */
  static createCreateUserRequestData(overrides?: Partial<any>): any {
    return {
      email: 'test@example.com',
      password: 'securePassword123!',
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      acceptedTerms: true,
      acceptedPrivacy: true,
      ...overrides,
    };
  }

  /**
   * Creates test AuthenticateUser request data
   */
  static createAuthenticateUserRequestData(overrides?: Partial<any>): any {
    return {
      email: 'test@example.com',
      password: 'securePassword123!',
      rememberMe: false,
      userAgent: 'Mozilla/5.0 Test Browser',
      ipAddress: '192.168.1.1',
      ...overrides,
    };
  }

  /**
   * Creates test UpdateProfile request data
   */
  static createUpdateProfileRequestData(overrides?: Partial<any>): any {
    return {
      userId: 'test-user-id',
      displayName: 'Updated Test User',
      firstName: 'Updated',
      lastName: 'User',
      bio: 'Updated bio',
      phoneNumber: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      location: 'Updated City, Updated State',
      timezone: 'America/Los_Angeles',
      language: 'es-ES',
      ...overrides,
    };
  }

  /**
   * Creates test Firebase User data
   */
  static createFirebaseUserData(overrides?: Partial<any>): any {
    return {
      uid: 'firebase-uid-123',
      email: 'test@example.com',
      emailVerified: true,
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      phoneNumber: '+1234567890',
      metadata: {
        creationTime: new Date('2023-01-01').toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      providerData: [
        {
          providerId: 'password',
          uid: 'test@example.com',
          email: 'test@example.com',
          displayName: 'Test User',
        },
      ],
      ...overrides,
    };
  }

  /**
   * Creates test domain event data
   */
  static createDomainEventData(type: string, overrides?: Partial<any>): any {
    return {
      type,
      dateTimeOccurred: new Date(),
      userId: 'test-user-id',
      email: 'test@example.com',
      metadata: {},
      ...overrides,
    };
  }

  /**
   * Creates valid email addresses for testing
   */
  static getValidEmails(): string[] {
    return [
      'test@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'user_name@example.com',
      'user123@example.com',
      'user@example-domain.com',
      'user@example.co.uk',
      'test.email.with+symbol@example.com',
      'x@example.com',
      'example@s.example',
    ];
  }

  /**
   * Creates invalid email addresses for testing
   */
  static getInvalidEmails(): string[] {
    return [
      'plainaddress',
      '@missingdomain.com',
      'missing@domain',
      'spaces @example.com',
      'double..dot@example.com',
      'trailing.dot.@example.com',
      '.leading.dot@example.com',
      'special#chars@example.com',
      'user@',
      '@domain.com',
      'user@domain.',
      'user@.com',
      '',
      ' ',
      'user@domain,com',
      'user name@example.com',
    ];
  }

  /**
   * Creates valid passwords for testing
   */
  static getValidPasswords(): string[] {
    return [
      'SecurePassword123!',
      'MyP@ssw0rd',
      'Complex1ty!',
      'Str0ng&Secure',
      'Test123!@#',
      'Valid$Password1',
      'Good2Go!',
      'Super#Secure1',
    ];
  }

  /**
   * Creates invalid passwords for testing
   */
  static getInvalidPasswords(): { password: string; reason: string }[] {
    return [
      { password: '123', reason: 'too short' },
      { password: 'password', reason: 'no uppercase, no number, no special char' },
      { password: 'PASSWORD', reason: 'no lowercase, no number, no special char' },
      { password: 'Password', reason: 'no number, no special char' },
      { password: 'Password123', reason: 'no special char' },
      { password: 'password123!', reason: 'no uppercase' },
      { password: 'PASSWORD123!', reason: 'no lowercase' },
      { password: 'Password!', reason: 'no number' },
      { password: '', reason: 'empty' },
      { password: '       ', reason: 'whitespace only' },
      { password: 'a'.repeat(129), reason: 'too long' },
    ];
  }

  /**
   * Creates prohibited display names for testing
   */
  static getProhibitedDisplayNames(): string[] {
    return [
      'Admin',
      'Administrator',
      'System',
      'Support',
      'Root',
      'Moderator',
      'Staff',
      'fuck',
      'shit',
      'asshole',
      'bitch',
      'damn',
      'hell',
      'bastard',
      'crap',
    ];
  }

  /**
   * Creates valid display names for testing
   */
  static getValidDisplayNames(): string[] {
    return [
      'John Doe',
      'Jane Smith',
      'Alex Johnson',
      'Maria Garcia',
      'David Wilson',
      'Sarah Brown',
      'Michael Davis',
      'Lisa Miller',
      'Chris Taylor',
      'Emma Anderson',
      'User123',
      'TestUser',
      'CoolName',
      'AwesomeUser',
    ];
  }

  /**
   * Creates blacklisted email domains for testing
   */
  static getBlacklistedDomains(): string[] {
    return [
      'tempmail.com',
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
      'temp-mail.org',
      'yopmail.com',
      'maildrop.cc',
      'sharklasers.com',
      'guerrillamailblock.com',
    ];
  }

  /**
   * Creates test user filters
   */
  static createUserFilters(overrides?: Partial<any>): any {
    return {
      isActive: true,
      emailVerified: true,
      isPremium: false,
      createdAfter: new Date('2023-01-01'),
      createdBefore: new Date('2023-12-31'),
      lastLoginAfter: new Date('2023-06-01'),
      lastLoginBefore: new Date('2023-12-31'),
      searchTerm: 'test',
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...overrides,
    };
  }

  /**
   * Creates test image data
   */
  static createImageData(size: number = 1024): Buffer {
    return Buffer.alloc(size, 'fake-image-data');
  }

  /**
   * Creates valid image file names
   */
  static getValidImageFileNames(): string[] {
    return [
      'avatar.jpg',
      'profile.jpeg',
      'image.png',
      'photo.gif',
      'picture.webp',
      'test-image.jpg',
      'user_avatar.png',
      'profile-pic.jpeg',
    ];
  }

  /**
   * Creates invalid image file names
   */
  static getInvalidImageFileNames(): string[] {
    return [
      'document.pdf',
      'file.txt',
      'video.mp4',
      'audio.mp3',
      'script.js',
      'style.css',
      'data.json',
      'archive.zip',
      'executable.exe',
      'no-extension',
    ];
  }

  /**
   * Creates valid timezone values
   */
  static getValidTimezones(): string[] {
    return [
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'UTC',
      'GMT',
    ];
  }

  /**
   * Creates invalid timezone values
   */
  static getInvalidTimezones(): string[] {
    return [
      'Invalid/Timezone',
      'America/FakeCity',
      'Europe/NonExistent',
      'Asia/MadeUp',
      'EST',
      'PST',
      'CST',
      'MST',
      'timezone',
      'america/new_york', // lowercase
    ];
  }

  /**
   * Creates valid language codes
   */
  static getValidLanguageCodes(): string[] {
    return [
      'en-US',
      'en-GB',
      'es-ES',
      'es-MX',
      'fr-FR',
      'fr-CA',
      'de-DE',
      'it-IT',
      'pt-BR',
      'ja-JP',
      'ko-KR',
      'zh-CN',
      'zh-TW',
      'ru-RU',
      'ar-SA',
    ];
  }

  /**
   * Creates invalid language codes
   */
  static getInvalidLanguageCodes(): string[] {
    return [
      'invalid-lang',
      'en',
      'english',
      'EN-US',
      'en_US',
      'eng-us',
      'xx-XX',
      'abc-def',
      'language',
      '123-456',
    ];
  }

  /**
   * Creates test error scenarios
   */
  static createErrorScenarios(): { name: string; error: Error }[] {
    return [
      {
        name: 'Database Connection Error',
        error: new Error('Database connection failed'),
      },
      {
        name: 'Network Timeout Error',
        error: new Error('Network timeout'),
      },
      {
        name: 'Firebase Auth Error',
        error: new Error('Firebase: User not found'),
      },
      {
        name: 'Validation Error',
        error: new Error('Validation failed'),
      },
      {
        name: 'Permission Denied Error',
        error: new Error('Permission denied'),
      },
      {
        name: 'Rate Limit Error',
        error: new Error('Too many requests'),
      },
      {
        name: 'Service Unavailable Error',
        error: new Error('Service temporarily unavailable'),
      },
    ];
  }

  /**
   * Creates test dates for various scenarios
   */
  static createTestDates(): { [key: string]: Date } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return {
      now,
      oneHourAgo,
      oneDayAgo,
      oneWeekAgo,
      oneMonthAgo,
      oneYearAgo,
      future,
      birthDate1990: new Date('1990-01-01'),
      birthDate2000: new Date('2000-06-15'),
      birthDate2010: new Date('2010-12-31'),
      recentBirthDate: new Date(now.getTime() - 12 * 365 * 24 * 60 * 60 * 1000), // 12 years ago
    };
  }

  /**
   * Creates test phone numbers
   */
  static getValidPhoneNumbers(): string[] {
    return [
      '+1234567890',
      '+1-234-567-8900',
      '+1 (234) 567-8900',
      '1234567890',
      '(234) 567-8900',
      '234-567-8900',
      '234.567.8900',
      '+44 20 7946 0958',
      '+33 1 42 68 53 00',
      '+81 3-3264-5111',
    ];
  }

  /**
   * Creates invalid phone numbers
   */
  static getInvalidPhoneNumbers(): string[] {
    return [
      '123',
      'phone-number',
      '123-456',
      '+123456789012345678901234567890', // too long
      'abc-def-ghij',
      '+++1234567890',
      '12 34 56 78 90 12 34', // too many digits
      '',
      '   ',
      '+',
      '-',
    ];
  }

  /**
   * Creates test Result objects
   */
  static createSuccessResult<T>(value: T): Result<T, string> {
    return Result.ok(value);
  }

  static createFailureResult<T>(error: string): Result<T, string> {
    return Result.fail(error);
  }

  /**
   * Creates test UniqueEntityID objects
   */
  static createUniqueEntityId(value?: string): UniqueEntityID {
    return new UniqueEntityID(value);
  }

  /**
   * Creates test pagination data
   */
  static createPaginationData(overrides?: Partial<any>): any {
    return {
      page: 1,
      limit: 10,
      offset: 0,
      total: 100,
      totalPages: 10,
      hasNext: true,
      hasPrevious: false,
      ...overrides,
    };
  }

  /**
   * Creates test bulk operation data
   */
  static createBulkUpdateData(count: number = 3): any[] {
    return Array.from({ length: count }, (_, index) => ({
      userId: `user-${index + 1}`,
      updates: {
        isActive: index % 2 === 0,
        updatedAt: new Date(),
      },
    }));
  }

  /**
   * Creates test search filters
   */
  static createSearchFilters(overrides?: Partial<any>): any {
    return {
      query: 'test search',
      filters: {
        isActive: true,
        emailVerified: true,
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
      },
      sort: {
        field: 'createdAt',
        direction: 'desc',
      },
      pagination: {
        page: 1,
        limit: 20,
      },
      ...overrides,
    };
  }
}