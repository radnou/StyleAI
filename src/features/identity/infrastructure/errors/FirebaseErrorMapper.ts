import { BaseError, AppError } from '@core/errors';

/**
 * Firebase Auth error codes mapping
 */
const FIREBASE_AUTH_ERROR_CODES = {
  // Authentication errors
  'auth/invalid-email': 'Invalid email address format',
  'auth/user-disabled': 'User account has been disabled',
  'auth/user-not-found': 'No user found with this email address',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-credential': 'Invalid credentials provided',
  'auth/invalid-verification-code': 'Invalid verification code',
  'auth/invalid-verification-id': 'Invalid verification ID',
  'auth/code-expired': 'Verification code has expired',
  'auth/invalid-action-code': 'Invalid action code',
  'auth/expired-action-code': 'Action code has expired',
  'auth/invalid-continue-uri': 'Invalid continue URL',
  'auth/unauthorized-continue-uri': 'Unauthorized continue URL',
  'auth/missing-continue-uri': 'Missing continue URL',
  'auth/invalid-dynamic-link-domain': 'Invalid dynamic link domain',
  'auth/argument-error': 'Invalid argument provided',
  'auth/invalid-persistence-type': 'Invalid persistence type',
  'auth/unsupported-persistence-type': 'Unsupported persistence type',
  'auth/invalid-auth-event': 'Invalid authentication event',
  'auth/auth-domain-config-required': 'Authentication domain configuration required',
  'auth/cancelled-popup-request': 'Popup request was cancelled',
  'auth/popup-blocked': 'Popup was blocked by browser',
  'auth/popup-closed-by-user': 'Popup was closed by user',
  'auth/unauthorized-domain': 'Unauthorized domain',
  'auth/invalid-user-token': 'Invalid user token',
  'auth/user-token-expired': 'User token has expired',
  'auth/null-user': 'No user is signed in',
  'auth/app-deleted': 'Firebase app has been deleted',
  'auth/invalid-api-key': 'Invalid API key',
  'auth/network-request-failed': 'Network request failed',
  'auth/requires-recent-login': 'This operation requires recent authentication',
  'auth/too-many-requests': 'Too many requests. Try again later',
  'auth/web-storage-unsupported': 'Web storage is not supported',
  'auth/invalid-claims': 'Invalid custom claims',
  'auth/claims-too-large': 'Custom claims payload is too large',
  'auth/id-token-expired': 'ID token has expired',
  'auth/id-token-revoked': 'ID token has been revoked',
  'auth/invalid-id-token': 'Invalid ID token',
  'auth/token-refresh-unavailable': 'Token refresh is unavailable',

  // Registration errors
  'auth/email-already-in-use': 'Email address is already in use',
  'auth/weak-password': 'Password is too weak',
  'auth/operation-not-allowed': 'Operation not allowed',
  'auth/account-exists-with-different-credential': 'Account exists with different credential',
  'auth/credential-already-in-use': 'Credential is already in use',

  // Email verification errors
  'auth/invalid-sender': 'Invalid sender email',
  'auth/missing-android-pkg-name': 'Missing Android package name',
  'auth/missing-ios-bundle-id': 'Missing iOS bundle ID',

  // Password reset errors
  'auth/missing-email': 'Email address is required',
  'auth/reset-password-exceed-limit': 'Reset password limit exceeded',

  // Provider errors
  'auth/no-auth-event': 'No authentication event found',
  'auth/invalid-provider-id': 'Invalid provider ID',
  'auth/unsupported-first-factor': 'Unsupported first factor',
  'auth/unsupported-tenant-operation': 'Unsupported tenant operation',
  'auth/unverified-email': 'Email address is not verified',
  'auth/user-mismatch': 'User mismatch',
  'auth/provider-already-linked': 'Provider already linked',
  'auth/no-such-provider': 'No such provider',
  'auth/invalid-phone-number': 'Invalid phone number',
  'auth/invalid-recipient-email': 'Invalid recipient email',
  'auth/invalid-sender': 'Invalid sender',
  'auth/invalid-message-payload': 'Invalid message payload',
  'auth/invalid-tenant-id': 'Invalid tenant ID',
  'auth/tenant-id-mismatch': 'Tenant ID mismatch',
  'auth/unsupported-tenant-operation': 'Unsupported tenant operation',
  'auth/invalid-provider-data': 'Invalid provider data',
  'auth/invalid-oauth-responsetype': 'Invalid OAuth response type',
  'auth/invalid-oauth-clientid': 'Invalid OAuth client ID',
  'auth/invalid-oauth-client-secret': 'Invalid OAuth client secret',
  'auth/invalid-cert-hash': 'Invalid certificate hash',
  'auth/invalid-custom-token': 'Invalid custom token',
  'auth/custom-token-mismatch': 'Custom token mismatch',

  // Generic errors
  'auth/internal-error': 'Internal authentication error',
  'auth/invalid-user-import': 'Invalid user import',
  'auth/maximum-user-count-exceeded': 'Maximum user count exceeded',
  'auth/missing-uid': 'Missing user ID',
  'auth/reserved-claims': 'Reserved claims used',
  'auth/session-cookie-expired': 'Session cookie has expired',
  'auth/session-cookie-revoked': 'Session cookie has been revoked',
  'auth/uid-already-exists': 'User ID already exists',
  'auth/user-not-disabled': 'User is not disabled',
  'auth/user-disabled': 'User account has been disabled',
  'auth/weak-password': 'Password is too weak',
  'auth/admin-restricted-operation': 'Admin restricted operation',
  'auth/app-not-authorized': 'App not authorized',
  'auth/keychain-error': 'Keychain error',
  'auth/missing-app-credential': 'Missing app credential',
  'auth/app-not-installed': 'App not installed',
  'auth/captcha-check-failed': 'Captcha check failed',
  'auth/invalid-app-credential': 'Invalid app credential',
  'auth/missing-verification-code': 'Missing verification code',
  'auth/missing-verification-id': 'Missing verification ID',
  'auth/quota-exceeded': 'Quota exceeded',
  'auth/second-factor-already-in-use': 'Second factor already in use',
  'auth/maximum-second-factor-count-exceeded': 'Maximum second factor count exceeded',
  'auth/unsupported-first-factor': 'Unsupported first factor',
  'auth/unsupported-second-factor': 'Unsupported second factor',
  'auth/invalid-multi-factor-session': 'Invalid multi-factor session',
  'auth/multi-factor-info-not-found': 'Multi-factor info not found',
  'auth/multi-factor-auth-required': 'Multi-factor authentication required',
  'auth/admin-restricted-operation': 'Admin restricted operation',
  'auth/unverified-email': 'Email address is not verified',
  'auth/user-signed-out': 'User has been signed out',
  'auth/weak-password': 'Password is too weak',
  'auth/email-change-needs-verification': 'Email change needs verification',
  'auth/requires-recent-login': 'This operation requires recent authentication',
} as const;

/**
 * Firebase Firestore error codes mapping
 */
const FIREBASE_FIRESTORE_ERROR_CODES = {
  'cancelled': 'Operation was cancelled',
  'unknown': 'Unknown error occurred',
  'invalid-argument': 'Invalid argument provided',
  'deadline-exceeded': 'Operation deadline exceeded',
  'not-found': 'Document not found',
  'already-exists': 'Document already exists',
  'permission-denied': 'Permission denied',
  'resource-exhausted': 'Resource exhausted',
  'failed-precondition': 'Failed precondition',
  'aborted': 'Operation aborted',
  'out-of-range': 'Value out of range',
  'unimplemented': 'Operation not implemented',
  'internal': 'Internal error',
  'unavailable': 'Service unavailable',
  'data-loss': 'Data loss',
  'unauthenticated': 'User not authenticated',
} as const;

/**
 * Firebase error interface
 */
export interface FirebaseError extends Error {
  code: string;
  message: string;
  details?: string;
  customData?: any;
  serverResponse?: any;
}

/**
 * Maps Firebase Auth errors to domain errors
 */
export class FirebaseErrorMapper {
  /**
   * Maps Firebase Auth error to appropriate domain error
   * @param error Firebase error
   * @returns Domain error
   */
  static mapAuthError(error: FirebaseError | Error): BaseError {
    if (!this.isFirebaseError(error)) {
      return new AppError.InternalServerError(error.message || 'Unknown error occurred');
    }

    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code;
    const errorMessage = FIREBASE_AUTH_ERROR_CODES[errorCode as keyof typeof FIREBASE_AUTH_ERROR_CODES] || firebaseError.message;

    // Map to specific domain error types
    switch (errorCode) {
      // Authentication errors
      case 'auth/invalid-email':
      case 'auth/missing-email':
      case 'auth/argument-error':
      case 'auth/invalid-phone-number':
      case 'auth/invalid-verification-code':
      case 'auth/invalid-verification-id':
      case 'auth/missing-verification-code':
      case 'auth/missing-verification-id':
      case 'auth/invalid-action-code':
      case 'auth/invalid-continue-uri':
      case 'auth/missing-continue-uri':
      case 'auth/invalid-dynamic-link-domain':
      case 'auth/invalid-persistence-type':
      case 'auth/unsupported-persistence-type':
      case 'auth/invalid-auth-event':
      case 'auth/invalid-custom-token':
      case 'auth/custom-token-mismatch':
      case 'auth/invalid-oauth-responsetype':
      case 'auth/invalid-oauth-clientid':
      case 'auth/invalid-oauth-client-secret':
      case 'auth/invalid-cert-hash':
      case 'auth/invalid-api-key':
      case 'auth/invalid-user-import':
      case 'auth/invalid-claims':
      case 'auth/invalid-id-token':
      case 'auth/invalid-provider-id':
      case 'auth/invalid-tenant-id':
      case 'auth/invalid-provider-data':
      case 'auth/invalid-recipient-email':
      case 'auth/invalid-sender':
      case 'auth/invalid-message-payload':
      case 'auth/missing-android-pkg-name':
      case 'auth/missing-ios-bundle-id':
      case 'auth/missing-app-credential':
      case 'auth/invalid-app-credential':
      case 'auth/missing-uid':
        return new AppError.ValidationError(errorMessage);

      // Not found errors
      case 'auth/user-not-found':
      case 'auth/no-auth-event':
      case 'auth/no-such-provider':
      case 'auth/multi-factor-info-not-found':
        return new AppError.NotFoundError(errorMessage);

      // Unauthorized errors
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/user-token-expired':
      case 'auth/id-token-expired':
      case 'auth/id-token-revoked':
      case 'auth/session-cookie-expired':
      case 'auth/session-cookie-revoked':
      case 'auth/invalid-user-token':
      case 'auth/requires-recent-login':
      case 'auth/user-signed-out':
      case 'auth/null-user':
      case 'auth/unauthorized-domain':
      case 'auth/unauthorized-continue-uri':
      case 'auth/unverified-email':
      case 'auth/admin-restricted-operation':
      case 'auth/app-not-authorized':
      case 'auth/unauthenticated':
        return new AppError.UnauthorizedError(errorMessage);

      // Conflict errors
      case 'auth/email-already-in-use':
      case 'auth/account-exists-with-different-credential':
      case 'auth/credential-already-in-use':
      case 'auth/provider-already-linked':
      case 'auth/uid-already-exists':
      case 'auth/second-factor-already-in-use':
        return new AppError.ConflictError(errorMessage);

      // Rate limiting errors
      case 'auth/too-many-requests':
      case 'auth/reset-password-exceed-limit':
      case 'auth/quota-exceeded':
        return new AppError.RateLimitError(errorMessage);

      // Forbidden errors
      case 'auth/user-disabled':
      case 'auth/operation-not-allowed':
      case 'auth/user-not-disabled':
      case 'auth/weak-password':
      case 'auth/email-change-needs-verification':
      case 'auth/multi-factor-auth-required':
        return new AppError.ForbiddenError(errorMessage);

      // Network errors
      case 'auth/network-request-failed':
        return new AppError.NetworkError(errorMessage);

      // Expired/timeout errors
      case 'auth/code-expired':
      case 'auth/expired-action-code':
      case 'auth/token-refresh-unavailable':
        return new AppError.ExpiredError(errorMessage);

      // Not supported errors
      case 'auth/web-storage-unsupported':
      case 'auth/unsupported-tenant-operation':
      case 'auth/unsupported-first-factor':
      case 'auth/unsupported-second-factor':
      case 'auth/app-not-installed':
        return new AppError.NotSupportedError(errorMessage);

      // Client errors
      case 'auth/cancelled-popup-request':
      case 'auth/popup-blocked':
      case 'auth/popup-closed-by-user':
      case 'auth/user-mismatch':
      case 'auth/captcha-check-failed':
      case 'auth/keychain-error':
        return new AppError.BadRequestError(errorMessage);

      // Configuration errors
      case 'auth/auth-domain-config-required':
      case 'auth/app-deleted':
      case 'auth/tenant-id-mismatch':
      case 'auth/claims-too-large':
      case 'auth/maximum-user-count-exceeded':
      case 'auth/maximum-second-factor-count-exceeded':
      case 'auth/reserved-claims':
      case 'auth/invalid-multi-factor-session':
        return new AppError.ConfigurationError(errorMessage);

      // Internal server errors
      case 'auth/internal-error':
      default:
        return new AppError.InternalServerError(errorMessage);
    }
  }

  /**
   * Maps Firebase Firestore error to appropriate domain error
   * @param error Firebase error
   * @returns Domain error
   */
  static mapFirestoreError(error: FirebaseError | Error): BaseError {
    if (!this.isFirebaseError(error)) {
      return new AppError.InternalServerError(error.message || 'Unknown error occurred');
    }

    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code;
    const errorMessage = FIREBASE_FIRESTORE_ERROR_CODES[errorCode as keyof typeof FIREBASE_FIRESTORE_ERROR_CODES] || firebaseError.message;

    // Map to specific domain error types
    switch (errorCode) {
      case 'invalid-argument':
      case 'out-of-range':
        return new AppError.ValidationError(errorMessage);

      case 'not-found':
        return new AppError.NotFoundError(errorMessage);

      case 'already-exists':
        return new AppError.ConflictError(errorMessage);

      case 'permission-denied':
        return new AppError.ForbiddenError(errorMessage);

      case 'unauthenticated':
        return new AppError.UnauthorizedError(errorMessage);

      case 'resource-exhausted':
        return new AppError.RateLimitError(errorMessage);

      case 'failed-precondition':
        return new AppError.PreconditionError(errorMessage);

      case 'aborted':
        return new AppError.ConflictError(errorMessage);

      case 'unimplemented':
        return new AppError.NotSupportedError(errorMessage);

      case 'unavailable':
        return new AppError.ServiceUnavailableError(errorMessage);

      case 'deadline-exceeded':
        return new AppError.TimeoutError(errorMessage);

      case 'cancelled':
        return new AppError.CancelledError(errorMessage);

      case 'data-loss':
      case 'internal':
      case 'unknown':
      default:
        return new AppError.InternalServerError(errorMessage);
    }
  }

  /**
   * Maps any Firebase error to appropriate domain error
   * @param error Firebase error
   * @returns Domain error
   */
  static mapError(error: FirebaseError | Error): BaseError {
    if (!this.isFirebaseError(error)) {
      return new AppError.InternalServerError(error.message || 'Unknown error occurred');
    }

    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code;

    // Determine error type based on code prefix
    if (errorCode.startsWith('auth/')) {
      return this.mapAuthError(firebaseError);
    } else if (errorCode.startsWith('firestore/') || 
               Object.keys(FIREBASE_FIRESTORE_ERROR_CODES).includes(errorCode)) {
      return this.mapFirestoreError(firebaseError);
    } else {
      return new AppError.InternalServerError(firebaseError.message || 'Unknown Firebase error');
    }
  }

  /**
   * Checks if error is a Firebase error
   * @param error Error to check
   * @returns True if Firebase error
   */
  private static isFirebaseError(error: any): error is FirebaseError {
    return error && 
           typeof error === 'object' && 
           'code' in error && 
           'message' in error &&
           typeof error.code === 'string';
  }

  /**
   * Extracts user-friendly error message from Firebase error
   * @param error Firebase error
   * @returns User-friendly error message
   */
  static getUserFriendlyMessage(error: FirebaseError | Error): string {
    if (!this.isFirebaseError(error)) {
      return 'An unexpected error occurred. Please try again.';
    }

    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code;

    // Return user-friendly messages
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/user-disabled':
        return 'Your account has been disabled. Please contact support.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action.';
      case 'auth/expired-action-code':
      case 'auth/invalid-action-code':
        return 'This link has expired or is invalid. Please request a new one.';
      case 'auth/user-token-expired':
        return 'Your session has expired. Please sign in again.';
      case 'not-found':
        return 'The requested information could not be found.';
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'unavailable':
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}