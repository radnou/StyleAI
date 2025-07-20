import { Result } from '@core/types/result';
import { Guard } from '@core/utils/Guard';
import { Email } from '../../../domain/value-objects/Email';

// This test file defines the expected behavior for the Email Value Object
// Following TDD principles, these tests should FAIL until implementation is complete

describe('Email Value Object', () => {

  describe('Email.create', () => {
    describe('when email is valid', () => {
      it('should create Email with valid email address', () => {
        const result = Email.create('test@example.com');
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBe('test@example.com');
      });

      it('should create Email with complex valid email', () => {
        const result = Email.create('user+tag@sub.domain.com');
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBe('user+tag@sub.domain.com');
      });

      it('should create Email with numeric domain', () => {
        const result = Email.create('user@123.456.789.012');
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBe('user@123.456.789.012');
      });

      it('should normalize email to lowercase', () => {
        const result = Email.create('TEST@EXAMPLE.COM');
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBe('test@example.com');
      });

      it('should trim whitespace from email', () => {
        const result = Email.create('  test@example.com  ');
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBe('test@example.com');
      });
    });

    describe('when email is invalid', () => {
      it('should fail for null email', () => {
        const result = Email.create(null as any);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is null or undefined');
      });

      it('should fail for undefined email', () => {
        const result = Email.create(undefined as any);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is null or undefined');
      });

      it('should fail for empty string', () => {
        const result = Email.create('');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is null, undefined, empty, or whitespace');
      });

      it('should fail for whitespace only', () => {
        const result = Email.create('   ');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is null, undefined, empty, or whitespace');
      });

      it('should fail for email without @ symbol', () => {
        const result = Email.create('testexample.com');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is not a valid email address');
      });

      it('should fail for email without domain', () => {
        const result = Email.create('test@');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is not a valid email address');
      });

      it('should fail for email without local part', () => {
        const result = Email.create('@example.com');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is not a valid email address');
      });

      it('should fail for email with multiple @ symbols', () => {
        const result = Email.create('test@@example.com');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is not a valid email address');
      });

      it('should fail for email with spaces', () => {
        const result = Email.create('test @example.com');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is not a valid email address');
      });

      it('should fail for email with invalid characters', () => {
        const result = Email.create('test<>@example.com');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is not a valid email address');
      });

      it('should fail for email exceeding maximum length', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        const result = Email.create(longEmail);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('Email is greater than 254 characters');
      });
    });
  });

  describe('Email.value', () => {
    it('should return the email value', () => {
      const email = 'test@example.com';
      const result = Email.create(email);
      
      expect(result.getValue().value).toBe(email);
    });
  });

  describe('Email.equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('test@example.com').getValue();
      const email2 = Email.create('test@example.com').getValue();
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com').getValue();
      const email2 = Email.create('test2@example.com').getValue();
      
      expect(email1.equals(email2)).toBe(false);
    });

    it('should return true for emails with different casing', () => {
      const email1 = Email.create('TEST@EXAMPLE.COM').getValue();
      const email2 = Email.create('test@example.com').getValue();
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for null comparison', () => {
      const email1 = Email.create('test@example.com').getValue();
      
      expect(email1.equals(null as any)).toBe(false);
    });
  });

  describe('Email business rules', () => {
    it('should not allow emails from blacklisted domains', () => {
      const result = Email.create('test@tempmail.com');
      
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Email domain is not allowed');
    });

    it('should validate email format according to RFC 5322', () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user_name@example.com',
        'user123@example.com',
        'user@example-domain.com',
        'user@example.co.uk',
      ];

      validEmails.forEach(email => {
        const result = Email.create(email);
        expect(result.isSuccess).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'plaintext',
        'missing@domain',
        '@missinglocal.com',
        'spaces @example.com',
        'double..dot@example.com',
        'trailing.dot.@example.com',
        '.leading.dot@example.com',
        'special#chars@example.com',
        'user@domain',
        'user@.com',
        'user@domain.',
      ];

      invalidEmails.forEach(email => {
        const result = Email.create(email);
        expect(result.isFailure).toBe(true);
      });
    });
  });
});