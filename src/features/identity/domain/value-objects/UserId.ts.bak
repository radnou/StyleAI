import { Result } from '@core/types/result';
import { ValueObject } from '@core/types/domain';
import { UniqueEntityID } from '@core/types/domain';
import { Guard } from '@core/utils/Guard';

interface UserIdProps {
  value: string;
}

/**
 * UserId Value Object
 * Represents a unique identifier for a user in the domain
 */
export class UserId extends ValueObject<UserIdProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 255;
  private static readonly VALID_CHARS_REGEX = /^[a-zA-Z0-9_|-]+$/;

  private readonly _id: UniqueEntityID;

  private constructor(props: UserIdProps, id: UniqueEntityID) {
    super(props);
    this._id = id;
  }

  public static create(id?: string): Result<UserId, string> {
    let actualId: string;

    if (id === null) {
      return Result.fail<UserId, string>('UserId is null or undefined');
    }

    if (id === undefined) {
      // Generate new UUID if no id provided
      const entityId = new UniqueEntityID();
      actualId = entityId.value;
    } else {
      // Validate provided id
      const emptyCheck = Guard.againstNullOrEmptyOrWhitespace(id, 'UserId');
      if (!emptyCheck.succeeded) {
        return Result.fail<UserId, string>(emptyCheck.message!);
      }

      actualId = id.trim();

      // Check minimum length
      const minLengthCheck = Guard.againstAtLeast(this.MIN_LENGTH, actualId, 'UserId');
      if (!minLengthCheck.succeeded) {
        return Result.fail<UserId, string>(minLengthCheck.message!);
      }

      // Check maximum length
      const maxLengthCheck = Guard.againstAtMost(this.MAX_LENGTH, actualId, 'UserId');
      if (!maxLengthCheck.succeeded) {
        return Result.fail<UserId, string>(maxLengthCheck.message!);
      }

      // Check for valid characters
      if (!this.VALID_CHARS_REGEX.test(actualId)) {
        return Result.fail<UserId, string>('UserId contains invalid characters');
      }
    }

    const entityId = new UniqueEntityID(actualId);
    return Result.ok<UserId>(new UserId({ value: actualId }, entityId));
  }

  public static fromUniqueEntityID(id: UniqueEntityID): UserId {
    return new UserId({ value: id.value }, id);
  }

  public get id(): UniqueEntityID {
    return this._id;
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(other: UserId): boolean {
    if (!other) {
      return false;
    }
    return this._id.equals(other._id);
  }

  public toString(): string {
    return this.props.value;
  }
}