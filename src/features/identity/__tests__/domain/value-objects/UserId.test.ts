import { Result } from '@core/types/result';
import { UniqueEntityID } from '@core/types/domain';
import { UserId } from '../../../domain/value-objects/UserId';

// This test file defines the expected behavior for the UserId Value Object
// Following TDD principles, these tests should FAIL until implementation is complete

describe('UserId Value Object', () => {

  describe('UserId.create', () => {
    describe('when id is valid', () => {
      it('should create UserId with provided UUID', () => {
        const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const result = UserId.create(uuid);
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBe(uuid);
      });

      it('should create UserId with generated UUID when none provided', () => {
        const result = UserId.create();
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBeDefined();
        expect(result.getValue().value.length).toBeGreaterThan(0);
      });

      it('should create UserId with valid UUID v4 format', () => {
        const result = UserId.create();
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toMatch(uuidV4Regex);
      });

      it('should create UserId with custom valid UUID format', () => {
        const customId = 'custom-user-id-123';
        const result = UserId.create(customId);
        
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBe(customId);
      });
    });

    describe('when id is invalid', () => {
      it('should fail for null id', () => {
        const result = UserId.create(null as any);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserId is null or undefined');
      });

      it('should fail for empty string', () => {
        const result = UserId.create('');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserId is null, undefined, empty, or whitespace');
      });

      it('should fail for whitespace only', () => {
        const result = UserId.create('   ');
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserId is null, undefined, empty, or whitespace');
      });

      it('should fail for id exceeding maximum length', () => {
        const longId = 'a'.repeat(256);
        const result = UserId.create(longId);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserId is greater than 255 characters');
      });

      it('should fail for id with invalid characters', () => {
        const invalidId = 'user@id#with$special%chars';
        const result = UserId.create(invalidId);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserId contains invalid characters');
      });

      it('should fail for id that is too short', () => {
        const shortId = 'ab';
        const result = UserId.create(shortId);
        
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserId is less than 3 characters');
      });
    });
  });

  describe('UserId.fromUniqueEntityID', () => {
    it('should create UserId from UniqueEntityID', () => {
      const entityId = new UniqueEntityID('test-id');
      const userId = UserId.fromUniqueEntityID(entityId);
      
      expect(userId.id.equals(entityId)).toBe(true);
      expect(userId.value).toBe('test-id');
    });

    it('should create UserId from generated UniqueEntityID', () => {
      const entityId = new UniqueEntityID();
      const userId = UserId.fromUniqueEntityID(entityId);
      
      expect(userId.id.equals(entityId)).toBe(true);
      expect(userId.value).toBe(entityId.value);
    });
  });

  describe('UserId.value', () => {
    it('should return the underlying UUID value', () => {
      const id = 'test-user-id';
      const result = UserId.create(id);
      
      expect(result.getValue().value).toBe(id);
    });
  });

  describe('UserId.id', () => {
    it('should return the underlying UniqueEntityID', () => {
      const id = 'test-user-id';
      const result = UserId.create(id);
      
      expect(result.getValue().id).toBeInstanceOf(UniqueEntityID);
      expect(result.getValue().id.value).toBe(id);
    });
  });

  describe('UserId.equals', () => {
    it('should return true for equal UserIds', () => {
      const id = 'test-user-id';
      const userId1 = UserId.create(id).getValue();
      const userId2 = UserId.create(id).getValue();
      
      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for different UserIds', () => {
      const userId1 = UserId.create('user-id-1').getValue();
      const userId2 = UserId.create('user-id-2').getValue();
      
      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should return false for null comparison', () => {
      const userId = UserId.create('test-user-id').getValue();
      
      expect(userId.equals(null as any)).toBe(false);
    });

    it('should return false for undefined comparison', () => {
      const userId = UserId.create('test-user-id').getValue();
      
      expect(userId.equals(undefined as any)).toBe(false);
    });
  });

  describe('UserId.toString', () => {
    it('should return string representation of the UserId', () => {
      const id = 'test-user-id';
      const result = UserId.create(id);
      
      expect(result.getValue().toString()).toBe(id);
    });
  });

  describe('UserId business rules', () => {
    it('should allow alphanumeric characters and hyphens', () => {
      const validIds = [
        'user-123',
        'user_456',
        'UserID789',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'firebase-user-id',
        'auth0-user-id',
      ];

      validIds.forEach(id => {
        const result = UserId.create(id);
        expect(result.isSuccess).toBe(true);
      });
    });

    it('should reject special characters', () => {
      const invalidIds = [
        'user@domain.com',
        'user#123',
        'user$456',
        'user%789',
        'user&abc',
        'user*def',
        'user+ghi',
        'user=jkl',
        'user?mno',
        'user!pqr',
      ];

      invalidIds.forEach(id => {
        const result = UserId.create(id);
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe('UserId contains invalid characters');
      });
    });

    it('should validate length constraints', () => {
      const shortId = 'ab';
      const longId = 'a'.repeat(256);
      const validId = 'valid-user-id';

      expect(UserId.create(shortId).isFailure).toBe(true);
      expect(UserId.create(longId).isFailure).toBe(true);
      expect(UserId.create(validId).isSuccess).toBe(true);
    });

    it('should be case-sensitive', () => {
      const userId1 = UserId.create('UserId').getValue();
      const userId2 = UserId.create('userid').getValue();
      
      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should handle Firebase Auth UIDs', () => {
      const firebaseUid = 'firebase-auth-uid-123456789';
      const result = UserId.create(firebaseUid);
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(firebaseUid);
    });

    it('should handle Auth0 user IDs', () => {
      const auth0Id = 'auth0|507f1f77bcf86cd799439011';
      const result = UserId.create(auth0Id);
      
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(auth0Id);
    });
  });
});