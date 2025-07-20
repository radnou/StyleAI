import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a unique identifier for domain entities
 */
export class UniqueEntityID {
  private readonly _value: string;

  constructor(value?: string) {
    this._value = value || uuidv4();
  }

  /**
   * Gets the string value of the ID
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Compares this ID with another ID for equality
   */
  public equals(id?: UniqueEntityID): boolean {
    if (!id) {
      return false;
    }
    return this._value === id.value;
  }

  /**
   * Returns the string representation of the ID
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Creates a new UniqueEntityID from a string
   */
  public static create(value?: string): UniqueEntityID {
    return new UniqueEntityID(value);
  }
}

/**
 * Base class for all domain entities
 */
export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID;
  protected props: T;

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id || new UniqueEntityID();
    this.props = props;
  }

  /**
   * Gets the entity's unique identifier
   */
  public get id(): UniqueEntityID {
    return this._id;
  }

  /**
   * Compares this entity with another entity for equality
   */
  public equals(entity?: Entity<T>): boolean {
    if (!entity) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id.equals(entity._id);
  }
}

/**
 * Base class for value objects
 */
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * Compares this value object with another for equality
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (!vo) {
      return false;
    }

    if (this.props === undefined && vo.props === undefined) {
      return true;
    }

    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}

/**
 * Interface for domain events
 */
export interface DomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): UniqueEntityID;
}

/**
 * Base class for aggregate roots
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  /**
   * Gets the domain events for this aggregate
   */
  public get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  /**
   * Adds a domain event to this aggregate
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  /**
   * Clears all domain events from this aggregate
   */
  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }
}