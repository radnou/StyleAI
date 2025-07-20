/**
 * Interface for guard arguments
 */
export interface IGuardArgument {
  argument: any;
  argumentName: string;
}

/**
 * Interface for guard result
 */
export interface IGuardResult {
  succeeded: boolean;
  message?: string;
}

/**
 * Utility class for validating arguments and business rules
 */
export class Guard {
  /**
   * Checks if a value is null or undefined
   */
  public static againstNullOrUndefined(
    argument: any,
    argumentName: string
  ): IGuardResult {
    if (argument === null || argument === undefined) {
      return {
        succeeded: false,
        message: `${argumentName} is null or undefined`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Checks multiple values for null or undefined
   */
  public static againstNullOrUndefinedBulk(
    args: IGuardArgument[]
  ): IGuardResult {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (!result.succeeded) {
        return result;
      }
    }
    return { succeeded: true };
  }

  /**
   * Checks if a string is null, undefined, or empty
   */
  public static againstNullOrEmpty(
    argument: string,
    argumentName: string
  ): IGuardResult {
    if (argument === null || argument === undefined || argument === '') {
      return {
        succeeded: false,
        message: `${argumentName} is null, undefined, or empty`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Checks if a string is null, undefined, empty, or whitespace
   */
  public static againstNullOrEmptyOrWhitespace(
    argument: string,
    argumentName: string
  ): IGuardResult {
    if (
      argument === null ||
      argument === undefined ||
      argument === '' ||
      argument.trim() === ''
    ) {
      return {
        succeeded: false,
        message: `${argumentName} is null, undefined, empty, or whitespace`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Checks if a number is less than or equal to a minimum value
   */
  public static againstAtLeast(
    numChars: number,
    argument: string,
    argumentName: string
  ): IGuardResult {
    return this.againstAtLeastBulk([
      {
        numChars,
        argument,
        argumentName,
      },
    ]);
  }

  /**
   * Checks multiple strings for minimum length
   */
  public static againstAtLeastBulk(
    args: Array<{
      numChars: number;
      argument: string;
      argumentName: string;
    }>
  ): IGuardResult {
    for (const arg of args) {
      const { numChars, argument, argumentName } = arg;
      
      if (argument.length < numChars) {
        return {
          succeeded: false,
          message: `${argumentName} is less than ${numChars} characters`,
        };
      }
    }
    return { succeeded: true };
  }

  /**
   * Checks if a number is greater than or equal to a maximum value
   */
  public static againstAtMost(
    numChars: number,
    argument: string,
    argumentName: string
  ): IGuardResult {
    return this.againstAtMostBulk([
      {
        numChars,
        argument,
        argumentName,
      },
    ]);
  }

  /**
   * Checks multiple strings for maximum length
   */
  public static againstAtMostBulk(
    args: Array<{
      numChars: number;
      argument: string;
      argumentName: string;
    }>
  ): IGuardResult {
    for (const arg of args) {
      const { numChars, argument, argumentName } = arg;
      
      if (argument.length > numChars) {
        return {
          succeeded: false,
          message: `${argumentName} is greater than ${numChars} characters`,
        };
      }
    }
    return { succeeded: true };
  }

  /**
   * Checks if an array is empty
   */
  public static againstEmptyArray(
    argument: any[],
    argumentName: string
  ): IGuardResult {
    if (!Array.isArray(argument) || argument.length === 0) {
      return {
        succeeded: false,
        message: `${argumentName} is empty or not an array`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Checks if a value is one of the allowed values
   */
  public static isOneOf(
    value: any,
    validValues: any[],
    argumentName: string
  ): IGuardResult {
    let isValid = false;
    
    for (const validValue of validValues) {
      if (value === validValue) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      return {
        succeeded: false,
        message: `${argumentName} isn't one of the allowed values: ${JSON.stringify(validValues)}`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Checks if a value is a valid email address
   */
  public static againstInvalidEmail(
    email: string,
    argumentName: string
  ): IGuardResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return {
        succeeded: false,
        message: `${argumentName} is not a valid email address`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Checks if a value matches a regular expression
   */
  public static againstInvalidPattern(
    argument: string,
    pattern: RegExp,
    argumentName: string
  ): IGuardResult {
    if (!pattern.test(argument)) {
      return {
        succeeded: false,
        message: `${argumentName} doesn't match the required pattern`,
      };
    }
    return { succeeded: true };
  }

  /**
   * Combines multiple guard results
   */
  public static combine(guardResults: IGuardResult[]): IGuardResult {
    for (const result of guardResults) {
      if (!result.succeeded) {
        return result;
      }
    }
    return { succeeded: true };
  }
}