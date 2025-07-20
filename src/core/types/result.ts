/**
 * Represents a result that can either be successful with data of type T
 * or failed with an error of type E
 */
export class Result<T, E = string> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    if (isSuccess && error) {
      throw new Error('Success result cannot have an error');
    }
    if (!isSuccess && !error) {
      throw new Error('Failure result must have an error');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._value = value;
    this._error = error;

    Object.freeze(this);
  }

  /**
   * Creates a successful result
   */
  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, value);
  }

  /**
   * Creates a failed result
   */
  public static fail<U, F = string>(error: F): Result<U, F> {
    return new Result<U, F>(false, undefined, error);
  }

  /**
   * Gets the value of a successful result
   * Throws if the result is a failure
   */
  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value of a failed result');
    }
    return this._value as T;
  }

  /**
   * Gets the error of a failed result
   * Throws if the result is successful
   */
  public getError(): E {
    if (this.isSuccess) {
      throw new Error('Cannot get error of a successful result');
    }
    return this._error as E;
  }

  /**
   * Gets the error if failed, undefined if successful
   */
  public get error(): E | undefined {
    return this._error;
  }

  /**
   * Gets the value if successful, undefined if failed
   */
  public get value(): T | undefined {
    return this._value;
  }

  /**
   * Maps the value of a successful result to a new value
   */
  public map<U, F = E>(fn: (value: T) => U): Result<U, F> {
    if (this.isFailure) {
      return Result.fail<U, F>(this._error as F);
    }
    try {
      return Result.ok<U>(fn(this._value as T));
    } catch (error) {
      return Result.fail<U, F>(error as F);
    }
  }

  /**
   * Maps the error of a failed result to a new error
   */
  public mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok<T>(this._value as T);
    }
    return Result.fail<T, F>(fn(this._error as E));
  }

  /**
   * Combines multiple results into a single result
   * Returns success only if all results are successful
   */
  public static combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail<T[], E>(result.getError());
      }
      values.push(result.getValue());
    }
    
    return Result.ok<T[]>(values);
  }

  /**
   * Returns the value if successful, otherwise returns the default value
   */
  public getValueOrDefault(defaultValue: T): T {
    return this.isSuccess ? this._value as T : defaultValue;
  }

  /**
   * Executes a function if the result is successful
   */
  public onSuccess(fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess) {
      fn(this._value as T);
    }
    return this;
  }

  /**
   * Executes a function if the result is a failure
   */
  public onFailure(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure) {
      fn(this._error as E);
    }
    return this;
  }
}