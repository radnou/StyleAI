import { useState, useCallback } from 'react';
import { Result } from '@core/types/result';
import { BaseError, AppError } from '@core/errors';
import { getAuthServices } from '../../infrastructure/AuthInitializer';

/**
 * Password reset hook state
 */
interface PasswordResetState {
  isLoading: boolean;
  isEmailSent: boolean;
  isVerifyingCode: boolean;
  isResettingPassword: boolean;
  error: string | null;
  email: string | null;
  code: string | null;
}

/**
 * Password reset hook return type
 */
export interface UsePasswordResetReturn {
  // State
  isLoading: boolean;
  isEmailSent: boolean;
  isVerifyingCode: boolean;
  isResettingPassword: boolean;
  error: string | null;
  email: string | null;
  code: string | null;

  // Actions
  sendResetEmail: (email: string) => Promise<Result<void, BaseError>>;
  verifyResetCode: (code: string) => Promise<Result<string, BaseError>>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<Result<void, BaseError>>;
  reset: () => void;
  clearError: () => void;

  // Utilities
  canSendEmail: () => boolean;
  canVerifyCode: () => boolean;
  canResetPassword: () => boolean;
  getNextStep: () => 'send_email' | 'verify_code' | 'reset_password' | 'complete';
}

/**
 * Initial state for password reset
 */
const initialState: PasswordResetState = {
  isLoading: false,
  isEmailSent: false,
  isVerifyingCode: false,
  isResettingPassword: false,
  error: null,
  email: null,
  code: null,
};

/**
 * Password reset hook with complete flow management
 * 
 * @example
 * ```tsx
 * function PasswordResetScreen() {
 *   const {
 *     sendResetEmail,
 *     verifyResetCode,
 *     confirmPasswordReset,
 *     isLoading,
 *     isEmailSent,
 *     error,
 *     getNextStep,
 *     clearError,
 *   } = usePasswordReset();
 *   
 *   const handleSendEmail = async (email: string) => {
 *     const result = await sendResetEmail(email);
 *     if (result.isFailure) {
 *       // Handle error
 *     }
 *   };
 *   
 *   const step = getNextStep();
 *   
 *   return (
 *     <div>
 *       {step === 'send_email' && (
 *         <EmailForm onSubmit={handleSendEmail} />
 *       )}
 *       {step === 'verify_code' && (
 *         <CodeVerificationForm onSubmit={verifyResetCode} />
 *       )}
 *       {step === 'reset_password' && (
 *         <NewPasswordForm onSubmit={confirmPasswordReset} />
 *       )}
 *       {step === 'complete' && (
 *         <SuccessMessage />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const usePasswordReset = (): UsePasswordResetReturn => {
  const [state, setState] = useState<PasswordResetState>(initialState);

  /**
   * Send password reset email
   */
  const sendResetEmail = useCallback(async (email: string): Promise<Result<void, BaseError>> => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        email: email.toLowerCase().trim(),
      }));

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const error = new AppError.ValidationError('Please enter a valid email address');
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      // Get auth service
      const { authService } = getAuthServices();
      
      // Send reset email
      const result = await authService.sendPasswordResetEmail(email);
      
      if (result.isFailure) {
        const error = new AppError.InternalServerError(result.getError());
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isEmailSent: true,
        error: null,
      }));

      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.InternalServerError('Failed to send reset email');
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: authError.message,
      }));

      return Result.fail(authError);
    }
  }, []);

  /**
   * Verify password reset code
   */
  const verifyResetCode = useCallback(async (code: string): Promise<Result<string, BaseError>> => {
    try {
      setState(prev => ({ 
        ...prev, 
        isVerifyingCode: true, 
        error: null,
        code: code.trim(),
      }));

      // Validate code
      if (!code || code.trim().length === 0) {
        const error = new AppError.ValidationError('Please enter the verification code');
        setState(prev => ({ 
          ...prev, 
          isVerifyingCode: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      // Get auth service
      const { authService } = getAuthServices();
      
      // Verify code
      const result = await authService.verifyPasswordResetCode(code);
      
      if (result.isFailure) {
        const error = new AppError.ValidationError(result.getError());
        setState(prev => ({ 
          ...prev, 
          isVerifyingCode: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      const verifiedEmail = result.getValue();

      setState(prev => ({ 
        ...prev, 
        isVerifyingCode: false,
        email: verifiedEmail,
        error: null,
      }));

      return Result.ok(verifiedEmail);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.InternalServerError('Failed to verify reset code');
      
      setState(prev => ({ 
        ...prev, 
        isVerifyingCode: false, 
        error: authError.message,
      }));

      return Result.fail(authError);
    }
  }, []);

  /**
   * Confirm password reset with new password
   */
  const confirmPasswordReset = useCallback(async (code: string, newPassword: string): Promise<Result<void, BaseError>> => {
    try {
      setState(prev => ({ 
        ...prev, 
        isResettingPassword: true, 
        error: null,
      }));

      // Validate inputs
      if (!code || code.trim().length === 0) {
        const error = new AppError.ValidationError('Verification code is required');
        setState(prev => ({ 
          ...prev, 
          isResettingPassword: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      if (!newPassword || newPassword.length < 6) {
        const error = new AppError.ValidationError('Password must be at least 6 characters long');
        setState(prev => ({ 
          ...prev, 
          isResettingPassword: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      // Additional password validation
      const passwordValidation = validatePassword(newPassword);
      if (passwordValidation.isFailure) {
        setState(prev => ({ 
          ...prev, 
          isResettingPassword: false, 
          error: passwordValidation.getError(),
        }));
        return passwordValidation;
      }

      // Get auth service
      const { authService } = getAuthServices();
      
      // Confirm password reset
      const result = await authService.confirmPasswordReset(code, newPassword);
      
      if (result.isFailure) {
        const error = new AppError.InternalServerError(result.getError());
        setState(prev => ({ 
          ...prev, 
          isResettingPassword: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      setState(prev => ({ 
        ...prev, 
        isResettingPassword: false,
        error: null,
      }));

      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.InternalServerError('Failed to reset password');
      
      setState(prev => ({ 
        ...prev, 
        isResettingPassword: false, 
        error: authError.message,
      }));

      return Result.fail(authError);
    }
  }, []);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Check if email can be sent
   */
  const canSendEmail = useCallback((): boolean => {
    return !state.isLoading && !state.isEmailSent;
  }, [state.isLoading, state.isEmailSent]);

  /**
   * Check if code can be verified
   */
  const canVerifyCode = useCallback((): boolean => {
    return state.isEmailSent && !state.isVerifyingCode && !state.code;
  }, [state.isEmailSent, state.isVerifyingCode, state.code]);

  /**
   * Check if password can be reset
   */
  const canResetPassword = useCallback((): boolean => {
    return Boolean(state.code) && !state.isResettingPassword;
  }, [state.code, state.isResettingPassword]);

  /**
   * Get the next step in the password reset flow
   */
  const getNextStep = useCallback((): 'send_email' | 'verify_code' | 'reset_password' | 'complete' => {
    if (!state.isEmailSent) {
      return 'send_email';
    }
    
    if (!state.code) {
      return 'verify_code';
    }
    
    if (state.isResettingPassword) {
      return 'reset_password';
    }
    
    return 'complete';
  }, [state.isEmailSent, state.code, state.isResettingPassword]);

  return {
    // State
    isLoading: state.isLoading,
    isEmailSent: state.isEmailSent,
    isVerifyingCode: state.isVerifyingCode,
    isResettingPassword: state.isResettingPassword,
    error: state.error,
    email: state.email,
    code: state.code,

    // Actions
    sendResetEmail,
    verifyResetCode,
    confirmPasswordReset,
    reset,
    clearError,

    // Utilities
    canSendEmail,
    canVerifyCode,
    canResetPassword,
    getNextStep,
  };
};

/**
 * Validate password strength
 */
const validatePassword = (password: string): Result<void, string> => {
  if (!password) {
    return Result.fail('Password is required');
  }

  if (password.length < 8) {
    return Result.fail('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    return Result.fail('Password must be less than 128 characters');
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return Result.fail('Password must contain at least one uppercase letter');
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return Result.fail('Password must contain at least one lowercase letter');
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return Result.fail('Password must contain at least one number');
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return Result.fail('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty',
    'abc123', 'password1', '12345678', '111111', '1234567890',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return Result.fail('Password is too common. Please choose a stronger password');
  }

  return Result.ok(undefined);
};

/**
 * Hook for simplified password reset (just send email)
 * Useful for login screens with "Forgot Password?" links
 * 
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { sendResetEmail, isLoading, success, error } = useSimplePasswordReset();
 *   
 *   const handleForgotPassword = async (email: string) => {
 *     await sendResetEmail(email);
 *   };
 *   
 *   return (
 *     <div>
 *       <LoginForm />
 *       <ForgotPasswordLink onPress={() => handleForgotPassword(userEmail)} />
 *       {success && <Text>Reset email sent!</Text>}
 *       {error && <Text>{error}</Text>}
 *     </div>
 *   );
 * }
 * ```
 */
export const useSimplePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendResetEmail = useCallback(async (email: string): Promise<Result<void, BaseError>> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { authService } = getAuthServices();
      const result = await authService.sendPasswordResetEmail(email);
      
      if (result.isFailure) {
        setError(result.getError());
        setIsLoading(false);
        return Result.fail(new AppError.InternalServerError(result.getError()));
      }

      setSuccess(true);
      setIsLoading(false);
      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.InternalServerError('Failed to send reset email');
      
      setError(authError.message);
      setIsLoading(false);
      return Result.fail(authError);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setSuccess(false);
    setError(null);
  }, []);

  return {
    sendResetEmail,
    isLoading,
    success,
    error,
    reset,
  };
};

export default usePasswordReset;