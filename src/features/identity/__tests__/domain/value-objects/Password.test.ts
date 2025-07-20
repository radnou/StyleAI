import { Result } from '@core/types/result';

// Password Value Object
export class Password {
  private static readonly MIN_LENGTH = 8;
  private static readonly UPPERCASE_REGEX = /[A-Z]/;
  private static readonly LOWERCASE_REGEX = /[a-z]/;
  private static readonly NUMBER_REGEX = /[0-9]/;
  private static readonly SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  private constructor(private readonly value: string) {}

  public static create(password: string): Result<Password, string> {
    // Null/undefined check
    if (password === null || password === undefined) {
      return Result.fail<Password, string>('Password is null or undefined');
    }

    // Empty check
    if (password.trim() === '') {
      return Result.fail<Password, string>('Password is null, undefined, empty, or whitespace');
    }

    // Length check
    if (password.length < this.MIN_LENGTH) {
      return Result.fail<Password, string>(`Password is less than ${this.MIN_LENGTH} characters`);
    }

    // Uppercase check
    if (!this.UPPERCASE_REGEX.test(password)) {
      return Result.fail<Password, string>('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (!this.LOWERCASE_REGEX.test(password)) {
      return Result.fail<Password, string>('Password must contain at least one lowercase letter');
    }

    // Number check
    if (!this.NUMBER_REGEX.test(password)) {
      return Result.fail<Password, string>('Password must contain at least one number');
    }

    // Special character check
    if (!this.SPECIAL_CHAR_REGEX.test(password)) {
      return Result.fail<Password, string>('Password must contain at least one special character');
    }

    return Result.ok<Password>(new Password(password));
  }

  public getValue(): string {
    return this.value;
  }

  public isStrong(): boolean {
    // Check if password is considered strong (has additional criteria)
    const hasLongLength = this.value.length >= 12;
    const hasMultipleUppercase = (this.value.match(/[A-Z]/g) || []).length >= 2;
    const hasMultipleLowercase = (this.value.match(/[a-z]/g) || []).length >= 2;
    const hasMultipleNumbers = (this.value.match(/[0-9]/g) || []).length >= 2;
    const hasMultipleSpecial = (this.value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2;

    return hasLongLength && hasMultipleUppercase && hasMultipleLowercase && 
           hasMultipleNumbers && hasMultipleSpecial;
  }

  public getStrength(): 'weak' | 'medium' | 'strong' {
    if (this.isStrong()) return 'strong';
    
    const meetsMinimum = this.value.length >= this.MIN_LENGTH;
    const hasVariety = [
      this.UPPERCASE_REGEX.test(this.value),
      this.LOWERCASE_REGEX.test(this.value),
      this.NUMBER_REGEX.test(this.value),
      this.SPECIAL_CHAR_REGEX.test(this.value),
    ].filter(Boolean).length >= 3;

    if (meetsMinimum && hasVariety) return 'medium';
    return 'weak';
  }

  public equals(other: Password): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    // Never expose the actual password
    return '********';
  }
}

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create a valid password', () => {
      const result = Password.create('ValidPass123!');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('ValidPass123!');
    });

    it('should fail for null password', () => {
      const result = Password.create(null as any);
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password is null or undefined');
    });

    it('should fail for undefined password', () => {
      const result = Password.create(undefined as any);
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password is null or undefined');
    });

    it('should fail for empty password', () => {
      const result = Password.create('');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password is null, undefined, empty, or whitespace');
    });

    it('should fail for whitespace-only password', () => {
      const result = Password.create('   ');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password is null, undefined, empty, or whitespace');
    });

    it('should fail for password shorter than minimum length', () => {
      const result = Password.create('Pass1!');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password is less than 8 characters');
    });

    it('should fail for password without uppercase letter', () => {
      const result = Password.create('validpass123!');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password must contain at least one uppercase letter');
    });

    it('should fail for password without lowercase letter', () => {
      const result = Password.create('VALIDPASS123!');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password must contain at least one lowercase letter');
    });

    it('should fail for password without number', () => {
      const result = Password.create('ValidPass!');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password must contain at least one number');
    });

    it('should fail for password without special character', () => {
      const result = Password.create('ValidPass123');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Password must contain at least one special character');
    });

    it('should accept various special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';
      
      for (const char of specialChars) {
        const result = Password.create(`ValidPass123${char}`);
        expect(result.isSuccess).toBe(true);
      }
    });

    it('should create password exactly at minimum length', () => {
      const result = Password.create('Pass12!A');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('Pass12!A');
    });

    it('should create very long password', () => {
      const longPassword = 'ValidPassword123!'.repeat(10);
      const result = Password.create(longPassword);
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe(longPassword);
    });
  });

  describe('isStrong', () => {
    it('should identify strong password', () => {
      const result = Password.create('StrongPASSword123!!@@');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.isStrong()).toBe(true);
    });

    it('should not consider minimum valid password as strong', () => {
      const result = Password.create('ValidPass1!');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.isStrong()).toBe(false);
    });

    it('should require multiple of each character type for strong', () => {
      const result = Password.create('AbCdEf12!@#$%');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.isStrong()).toBe(true);
    });

    it('should not consider password with single special chars as strong', () => {
      const result = Password.create('ValidPassword1!');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.isStrong()).toBe(false);
    });
  });

  describe('getStrength', () => {
    it('should return weak for minimum valid password', () => {
      const result = Password.create('Pass123!');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.getStrength()).toBe('weak');
    });

    it('should return medium for moderately complex password', () => {
      const result = Password.create('ValidPass123!');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.getStrength()).toBe('medium');
    });

    it('should return strong for highly complex password', () => {
      const result = Password.create('SuperSTRONG@@Pass123!!');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.getStrength()).toBe('strong');
    });

    it('should return medium for long password with basic variety', () => {
      const result = Password.create('ValidPassword123!');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.getStrength()).toBe('medium');
    });
  });

  describe('equals', () => {
    it('should return true for equal passwords', () => {
      const result1 = Password.create('SamePass123!');
      const result2 = Password.create('SamePass123!');
      
      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      
      const password1 = result1.getValue();
      const password2 = result2.getValue();
      
      expect(password1.equals(password2)).toBe(true);
    });

    it('should return false for different passwords', () => {
      const result1 = Password.create('Password123!');
      const result2 = Password.create('Different123!');
      
      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      
      const password1 = result1.getValue();
      const password2 = result2.getValue();
      
      expect(password1.equals(password2)).toBe(false);
    });

    it('should be case sensitive', () => {
      const result1 = Password.create('Password123!');
      const result2 = Password.create('password123!');
      
      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      
      const password1 = result1.getValue();
      const password2 = result2.getValue();
      
      expect(password1.equals(password2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should never expose the actual password', () => {
      const result = Password.create('ActualPassword123!');
      expect(result.isSuccess).toBe(true);
      
      const password = result.getValue();
      expect(password.toString()).toBe('********');
      expect(password.toString()).not.toContain('ActualPassword');
    });

    it('should return same masked value regardless of password', () => {
      const result1 = Password.create('ShortPass1!');
      const result2 = Password.create('VeryLongPasswordWith123!@#');
      
      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      
      const password1 = result1.getValue();
      const password2 = result2.getValue();
      
      expect(password1.toString()).toBe('********');
      expect(password2.toString()).toBe('********');
    });
  });

  describe('edge cases', () => {
    it('should handle passwords with unicode characters', () => {
      const result = Password.create('Pass123!émojï');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('Pass123!émojï');
    });

    it('should handle passwords with spaces', () => {
      const result = Password.create('Pass 123!Word');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('Pass 123!Word');
    });

    it('should handle passwords with consecutive special characters', () => {
      const result = Password.create('Pass123!!!@@@');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('Pass123!!!@@@');
    });

    it('should handle passwords with mixed case patterns', () => {
      const result = Password.create('pAsSwOrD123!');
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().getValue()).toBe('pAsSwOrD123!');
    });
  });
});