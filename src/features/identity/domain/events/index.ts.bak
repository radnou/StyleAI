import { DomainEvent, UniqueEntityID } from '@core/types/domain';

export interface UserCreatedEvent extends DomainEvent {
  type: 'UserCreated';
  userId: string;
  email: string;
  displayName: string;
}

export interface EmailVerifiedEvent extends DomainEvent {
  type: 'EmailVerified';
  userId: string;
}

export interface UserLoggedInEvent extends DomainEvent {
  type: 'UserLoggedIn';
  userId: string;
}

export interface UserLockedEvent extends DomainEvent {
  type: 'UserLocked';
  userId: string;
  reason: string;
}

export interface ProfileUpdatedEvent extends DomainEvent {
  type: 'ProfileUpdated';
  userId: string;
  updatedFields: string[];
}

export interface PremiumUpgradedEvent extends DomainEvent {
  type: 'PremiumUpgraded';
  userId: string;
}

export interface PremiumDowngradedEvent extends DomainEvent {
  type: 'PremiumDowngraded';
  userId: string;
}

export interface UserDeactivatedEvent extends DomainEvent {
  type: 'UserDeactivated';
  userId: string;
}

export interface UserActivatedEvent extends DomainEvent {
  type: 'UserActivated';
  userId: string;
}

export interface PasswordChangedEvent extends DomainEvent {
  type: 'PasswordChanged';
  userId: string;
}

export interface PasswordResetRequestedEvent extends DomainEvent {
  type: 'PasswordResetRequested';
  userId: string;
  email: string;
}

export interface PasswordResetEvent extends DomainEvent {
  type: 'PasswordReset';
  userId: string;
}

export interface EmailVerificationRequestedEvent extends DomainEvent {
  type: 'EmailVerificationRequested';
  userId: string;
  email: string;
}

// Event factory functions
export class UserDomainEvents {
  static createUserCreatedEvent(aggregateId: UniqueEntityID, userId: string, email: string, displayName: string): UserCreatedEvent {
    return {
      type: 'UserCreated',
      dateTimeOccurred: new Date(),
      userId,
      email,
      displayName,
      getAggregateId: () => aggregateId,
    };
  }

  static createEmailVerifiedEvent(aggregateId: UniqueEntityID, userId: string): EmailVerifiedEvent {
    return {
      type: 'EmailVerified',
      dateTimeOccurred: new Date(),
      userId,
      getAggregateId: () => aggregateId,
    };
  }

  static createUserLoggedInEvent(aggregateId: UniqueEntityID, userId: string): UserLoggedInEvent {
    return {
      type: 'UserLoggedIn',
      dateTimeOccurred: new Date(),
      userId,
      getAggregateId: () => aggregateId,
    };
  }

  static createUserLockedEvent(aggregateId: UniqueEntityID, userId: string, reason: string): UserLockedEvent {
    return {
      type: 'UserLocked',
      dateTimeOccurred: new Date(),
      userId,
      reason,
      getAggregateId: () => aggregateId,
    };
  }

  static createProfileUpdatedEvent(aggregateId: UniqueEntityID, userId: string, updatedFields: string[]): ProfileUpdatedEvent {
    return {
      type: 'ProfileUpdated',
      dateTimeOccurred: new Date(),
      userId,
      updatedFields,
      getAggregateId: () => aggregateId,
    };
  }

  static createPremiumUpgradedEvent(aggregateId: UniqueEntityID, userId: string): PremiumUpgradedEvent {
    return {
      type: 'PremiumUpgraded',
      dateTimeOccurred: new Date(),
      userId,
      getAggregateId: () => aggregateId,
    };
  }

  static createPremiumDowngradedEvent(aggregateId: UniqueEntityID, userId: string): PremiumDowngradedEvent {
    return {
      type: 'PremiumDowngraded',
      dateTimeOccurred: new Date(),
      userId,
      getAggregateId: () => aggregateId,
    };
  }

  static createUserDeactivatedEvent(aggregateId: UniqueEntityID, userId: string): UserDeactivatedEvent {
    return {
      type: 'UserDeactivated',
      dateTimeOccurred: new Date(),
      userId,
      getAggregateId: () => aggregateId,
    };
  }

  static createUserActivatedEvent(aggregateId: UniqueEntityID, userId: string): UserActivatedEvent {
    return {
      type: 'UserActivated',
      dateTimeOccurred: new Date(),
      userId,
      getAggregateId: () => aggregateId,
    };
  }

  static createPasswordChangedEvent(aggregateId: UniqueEntityID, userId: string): PasswordChangedEvent {
    return {
      type: 'PasswordChanged',
      dateTimeOccurred: new Date(),
      userId,
      getAggregateId: () => aggregateId,
    };
  }

  static createPasswordResetRequestedEvent(aggregateId: UniqueEntityID, userId: string, email: string): PasswordResetRequestedEvent {
    return {
      type: 'PasswordResetRequested',
      dateTimeOccurred: new Date(),
      userId,
      email,
      getAggregateId: () => aggregateId,
    };
  }

  static createPasswordResetEvent(aggregateId: UniqueEntityID, userId: string): PasswordResetEvent {
    return {
      type: 'PasswordReset',
      dateTimeOccurred: new Date(),
      userId,
      getAggregateId: () => aggregateId,
    };
  }

  static createEmailVerificationRequestedEvent(aggregateId: UniqueEntityID, userId: string, email: string): EmailVerificationRequestedEvent {
    return {
      type: 'EmailVerificationRequested',
      dateTimeOccurred: new Date(),
      userId,
      email,
      getAggregateId: () => aggregateId,
    };
  }
}