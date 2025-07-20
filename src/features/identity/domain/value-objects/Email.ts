import { Result } from '@core/types/result';
import { ValueObject } from '@core/types/domain';
import { Guard } from '@core/utils/Guard';

interface EmailProps {
  value: string;
}

/**
 * Email Value Object
 * Represents a validated email address in the domain
 */
export class Email extends ValueObject<EmailProps> {
  private static readonly BLACKLISTED_DOMAINS = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
    'yopmail.com',
    'sharklasers.com',
    'guerrillamailblock.com',
    'pokemail.net',
    'spam4.me',
    'bccto.me',
    'email.net',
    'trbvm.com',
    'dispostable.com',
    'fakeinbox.com',
    'maildrop.cc',
    'emailondeck.com',
    'spambox.us',
    'mailcatch.com'
  ];

  private static readonly MAX_LENGTH = 254;
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z0-9]{2,}$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Result<Email, string> {
    // Check for null or undefined
    const nullCheck = Guard.againstNullOrUndefined(email, 'Email');
    if (!nullCheck.succeeded) {
      return Result.fail<Email, string>(nullCheck.message!);
    }

    // Trim and normalize to lowercase
    const trimmedEmail = email.trim().toLowerCase();

    // Check for empty or whitespace
    const emptyCheck = Guard.againstNullOrEmptyOrWhitespace(trimmedEmail, 'Email');
    if (!emptyCheck.succeeded) {
      return Result.fail<Email, string>(emptyCheck.message!);
    }

    // Check maximum length
    const lengthCheck = Guard.againstAtMost(this.MAX_LENGTH, trimmedEmail, 'Email');
    if (!lengthCheck.succeeded) {
      return Result.fail<Email, string>(lengthCheck.message!);
    }

    // Validate email format
    const formatCheck = Guard.againstInvalidEmail(trimmedEmail, 'Email');
    if (!formatCheck.succeeded) {
      return Result.fail<Email, string>(formatCheck.message!);
    }

    // Additional email validation - be more permissive for edge cases
    if (!this.isValidEmailFormat(trimmedEmail)) {
      return Result.fail<Email, string>('Email is not a valid email address');
    }

    // Check for blacklisted domains
    const domain = this.extractDomain(trimmedEmail);
    if (this.BLACKLISTED_DOMAINS.includes(domain.toLowerCase())) {
      return Result.fail<Email, string>('Email domain is not allowed');
    }

    // Validate domain has proper structure
    if (!this.isValidDomain(domain)) {
      return Result.fail<Email, string>('Email is not a valid email address');
    }

    return Result.ok<Email>(new Email({ value: trimmedEmail }));
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(other: Email): boolean {
    if (!other) {
      return false;
    }
    return super.equals(other);
  }

  private static extractDomain(email: string): string {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1] : '';
  }

  private static isValidEmailFormat(email: string): boolean {
    // More permissive email validation that handles edge cases
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domain] = parts;
    
    // Validate local part
    if (!localPart || localPart.length === 0) {
      return false;
    }

    // Local part can contain alphanumeric, dots, hyphens, underscores, plus signs
    if (!/^[a-zA-Z0-9._+-]+$/.test(localPart)) {
      return false;
    }

    // Cannot start or end with dot
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }

    // Cannot have consecutive dots
    if (localPart.includes('..')) {
      return false;
    }

    // Validate domain
    return this.isValidDomain(domain);
  }

  private static isValidDomain(domain: string): boolean {
    if (!domain || domain.length === 0) {
      return false;
    }

    // Check for valid domain structure
    if (domain.startsWith('.') || domain.endsWith('.')) {
      return false;
    }

    if (domain.includes('..')) {
      return false;
    }

    // Domain must have at least one dot (except for IP addresses)
    if (!domain.includes('.')) {
      return false;
    }

    // Each part of domain should be valid
    const parts = domain.split('.');
    for (const part of parts) {
      if (part.length === 0) {
        return false;
      }
      
      // Check for valid characters (alphanumeric and hyphens for domain names, or numeric for IPs)
      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        return false;
      }
      
      // Cannot start or end with hyphen (unless it's a number for IP)
      if (!(/^\d+$/.test(part)) && (part.startsWith('-') || part.endsWith('-'))) {
        return false;
      }
    }

    return true;
  }
}