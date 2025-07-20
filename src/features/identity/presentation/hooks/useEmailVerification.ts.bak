import { useState, useCallback, useEffect } from 'react';
import { Result } from '@core/types/result';
import { BaseError, AppError } from '@core/errors';
import { getAuthServices } from '../../infrastructure/AuthInitializer';
import { useAuthState } from './useAuth';

/**
 * Email verification hook state
 */
interface EmailVerificationState {
  isLoading: boolean;
  isSending: boolean;
  isVerifying: boolean;
  error: string | null;
  lastSentAt: Date | null;
  canResend: boolean;
  cooldownSeconds: number;
}

/**
 * Email verification hook return type
 */
export interface UseEmailVerificationReturn {
  // State
  isLoading: boolean;
  isSending: boolean;
  isVerifying: boolean;
  error: string | null;
  isVerified: boolean;
  canResend: boolean;
  cooldownSeconds: number;
  lastSentAt: Date | null;

  // Actions
  sendVerificationEmail: () => Promise<Result<void, BaseError>>;
  verifyEmailWithCode: (code: string) => Promise<Result<void, BaseError>>;
  refreshVerificationStatus: () => Promise<Result<void, BaseError>>;
  clearError: () => void;
  reset: () => void;

  // Utilities
  getTimeUntilResend: () => number;
  canSendVerification: () => boolean;
  needsVerification: () => boolean;
  formatCooldownTime: () => string;
}

/**
 * Initial state for email verification
 */
const initialState: EmailVerificationState = {
  isLoading: false,
  isSending: false,
  isVerifying: false,
  error: null,
  lastSentAt: null,
  canResend: true,
  cooldownSeconds: 0,
};

/**
 * Resend cooldown duration in seconds
 */
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Email verification hook with complete flow management
 * 
 * @example
 * ```tsx
 * function EmailVerificationScreen() {
 *   const {
 *     sendVerificationEmail,
 *     verifyEmailWithCode,
 *     isLoading,
 *     isSending,
 *     isVerified,
 *     error,
 *     canResend,
 *     cooldownSeconds,
 *     clearError,
 *   } = useEmailVerification();
 *   
 *   if (isVerified) {
 *     return <Navigate to="/dashboard" />;
 *   }
 *   
 *   return (
 *     <div>
 *       <Text>Please check your email and click the verification link.</Text>
 *       <Button 
 *         onPress={sendVerificationEmail}
 *         disabled={!canResend}
 *         loading={isSending}
 *       >
 *         {canResend ? 'Resend Email' : `Resend in ${cooldownSeconds}s`}
 *       </Button>
 *       <CodeInput onSubmit={verifyEmailWithCode} />
 *       {error && <ErrorMessage message={error} onDismiss={clearError} />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useEmailVerification = (): UseEmailVerificationReturn => {
  const [state, setState] = useState<EmailVerificationState>(initialState);
  const { user, isAuthenticated } = useAuthState();

  /**
   * Update cooldown timer
   */
  useEffect(() => {
    if (!state.lastSentAt || state.canResend) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const timeSinceSent = Math.floor((now.getTime() - state.lastSentAt!.getTime()) / 1000);
      const remainingSeconds = Math.max(0, RESEND_COOLDOWN_SECONDS - timeSinceSent);

      setState(prev => ({
        ...prev,
        cooldownSeconds: remainingSeconds,
        canResend: remainingSeconds === 0,
      }));

      if (remainingSeconds === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.lastSentAt, state.canResend]);

  /**
   * Send verification email
   */
  const sendVerificationEmail = useCallback(async (): Promise<Result<void, BaseError>> => {
    if (!isAuthenticated || !user) {
      const error = new AppError.UnauthorizedError('User not authenticated');
      setState(prev => ({ ...prev, error: error.message }));
      return Result.fail(error);
    }

    if (!state.canResend) {
      const error = new AppError.RateLimitError('Please wait before sending another verification email');
      setState(prev => ({ ...prev, error: error.message }));
      return Result.fail(error);
    }

    if (user.emailVerified) {
      const error = new AppError.ValidationError('Email is already verified');
      setState(prev => ({ ...prev, error: error.message }));
      return Result.fail(error);
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isSending: true, 
        error: null,
      }));

      // Get auth service
      const { authService } = getAuthServices();
      
      // Send verification email
      const result = await authService.sendEmailVerification(user.uid);
      
      if (result.isFailure) {
        const error = new AppError.InternalServerError(result.getError());
        setState(prev => ({ 
          ...prev, 
          isSending: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      const now = new Date();
      setState(prev => ({ 
        ...prev, 
        isSending: false,
        lastSentAt: now,
        canResend: false,
        cooldownSeconds: RESEND_COOLDOWN_SECONDS,
        error: null,
      }));

      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.InternalServerError('Failed to send verification email');
      
      setState(prev => ({ 
        ...prev, 
        isSending: false, 
        error: authError.message,
      }));

      return Result.fail(authError);
    }
  }, [isAuthenticated, user, state.canResend]);

  /**
   * Verify email with action code
   */
  const verifyEmailWithCode = useCallback(async (code: string): Promise<Result<void, BaseError>> => {
    try {
      setState(prev => ({ 
        ...prev, 
        isVerifying: true, 
        error: null,
      }));

      // Validate code
      if (!code || code.trim().length === 0) {
        const error = new AppError.ValidationError('Please enter the verification code');
        setState(prev => ({ 
          ...prev, 
          isVerifying: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      // Get auth service
      const { authService } = getAuthServices();
      
      // Apply action code (this verifies the email)
      const result = await authService.applyActionCode(code);
      
      if (result.isFailure) {
        const error = new AppError.ValidationError(result.getError());
        setState(prev => ({ 
          ...prev, 
          isVerifying: false, 
          error: error.message,
        }));
        return Result.fail(error);
      }

      setState(prev => ({ 
        ...prev, 
        isVerifying: false,
        error: null,
      }));

      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.InternalServerError('Failed to verify email');
      
      setState(prev => ({ 
        ...prev, 
        isVerifying: false, 
        error: authError.message,
      }));

      return Result.fail(authError);
    }
  }, []);

  /**
   * Refresh email verification status
   */
  const refreshVerificationStatus = useCallback(async (): Promise<Result<void, BaseError>> => {
    if (!isAuthenticated || !user) {
      const error = new AppError.UnauthorizedError('User not authenticated');
      return Result.fail(error);
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get auth service and refresh user data
      const { authService } = getAuthServices();
      const result = await authService.refreshCurrentUser();
      
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
        error: null,
      }));

      return Result.ok(undefined);
    } catch (error: any) {
      const authError = error instanceof BaseError 
        ? error 
        : new AppError.InternalServerError('Failed to refresh verification status');
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: authError.message,
      }));

      return Result.fail(authError);
    }
  }, [isAuthenticated, user]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Get time until resend is available (in seconds)
   */
  const getTimeUntilResend = useCallback((): number => {
    if (!state.lastSentAt || state.canResend) {
      return 0;
    }

    const now = new Date();
    const timeSinceSent = Math.floor((now.getTime() - state.lastSentAt.getTime()) / 1000);
    return Math.max(0, RESEND_COOLDOWN_SECONDS - timeSinceSent);
  }, [state.lastSentAt, state.canResend]);

  /**
   * Check if verification email can be sent
   */
  const canSendVerification = useCallback((): boolean => {
    return isAuthenticated && 
           Boolean(user) && 
           !user?.emailVerified && 
           state.canResend && 
           !state.isSending;
  }, [isAuthenticated, user, state.canResend, state.isSending]);

  /**
   * Check if email verification is needed
   */
  const needsVerification = useCallback((): boolean => {
    return isAuthenticated && Boolean(user) && !user?.emailVerified;
  }, [isAuthenticated, user]);

  /**
   * Format cooldown time as MM:SS
   */
  const formatCooldownTime = useCallback((): string => {
    const minutes = Math.floor(state.cooldownSeconds / 60);
    const seconds = state.cooldownSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [state.cooldownSeconds]);

  return {
    // State
    isLoading: state.isLoading,
    isSending: state.isSending,
    isVerifying: state.isVerifying,
    error: state.error,
    isVerified: user?.emailVerified || false,
    canResend: state.canResend,
    cooldownSeconds: state.cooldownSeconds,
    lastSentAt: state.lastSentAt,

    // Actions
    sendVerificationEmail,
    verifyEmailWithCode,
    refreshVerificationStatus,
    clearError,
    reset,

    // Utilities
    getTimeUntilResend,
    canSendVerification,
    needsVerification,
    formatCooldownTime,
  };
};

/**
 * Hook for automatic email verification checking
 * Periodically checks if email has been verified
 * 
 * @example
 * ```tsx
 * function EmailVerificationPendingScreen() {
 *   const { isChecking, checkCount } = useAutoEmailVerificationCheck({
 *     interval: 5000, // Check every 5 seconds
 *     maxChecks: 20,  // Stop after 20 checks
 *   });
 *   
 *   return (
 *     <div>
 *       <Text>Checking email verification...</Text>
 *       <Text>Check {checkCount}/20</Text>
 *       {isChecking && <Spinner />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useAutoEmailVerificationCheck = (options?: {
  interval?: number;
  maxChecks?: number;
  onVerified?: () => void;
  onMaxChecksReached?: () => void;
}) => {
  const {
    interval = 10000, // 10 seconds
    maxChecks = 30,   // 5 minutes total
    onVerified,
    onMaxChecksReached,
  } = options || {};

  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const { refreshVerificationStatus } = useEmailVerification();
  const { user, isAuthenticated } = useAuthState();

  /**
   * Auto-check email verification status
   */
  useEffect(() => {
    if (!isAuthenticated || !user || user.emailVerified || checkCount >= maxChecks) {
      if (user?.emailVerified && onVerified) {
        onVerified();
      }
      if (checkCount >= maxChecks && onMaxChecksReached) {
        onMaxChecksReached();
      }
      return;
    }

    const intervalId = setInterval(async () => {
      setIsChecking(true);
      setCheckCount(prev => prev + 1);

      try {
        await refreshVerificationStatus();
      } catch (error) {
        console.warn('Failed to check email verification status:', error);
      } finally {
        setIsChecking(false);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [
    isAuthenticated,
    user,
    checkCount,
    maxChecks,
    interval,
    refreshVerificationStatus,
    onVerified,
    onMaxChecksReached,
  ]);

  /**
   * Reset check count
   */
  const resetChecks = useCallback(() => {
    setCheckCount(0);
    setIsChecking(false);
  }, []);

  /**
   * Start checking manually
   */
  const startChecking = useCallback(() => {
    setCheckCount(0);
    setIsChecking(true);
  }, []);

  /**
   * Stop checking
   */
  const stopChecking = useCallback(() => {
    setIsChecking(false);
  }, []);

  return {
    isChecking,
    checkCount,
    maxChecks,
    hasReachedMax: checkCount >= maxChecks,
    resetChecks,
    startChecking,
    stopChecking,
  };
};

/**
 * Hook for handling email verification from URL parameters
 * Useful for handling email verification links
 * 
 * @example
 * ```tsx
 * function EmailVerificationHandler() {
 *   const { isProcessing, error, success } = useEmailVerificationFromURL();
 *   
 *   if (isProcessing) {
 *     return <LoadingScreen message="Verifying your email..." />;
 *   }
 *   
 *   if (error) {
 *     return <ErrorScreen message={error} />;
 *   }
 *   
 *   if (success) {
 *     return <SuccessScreen message="Email verified successfully!" />;
 *   }
 *   
 *   return null;
 * }
 * ```
 */
export const useEmailVerificationFromURL = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { verifyEmailWithCode } = useEmailVerification();

  /**
   * Process verification code from URL
   */
  const processVerificationCode = useCallback(async (code: string): Promise<void> => {
    if (!code) {
      setError('No verification code provided');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await verifyEmailWithCode(code);
      
      if (result.isFailure) {
        setError(result.getError().message);
      } else {
        setSuccess(true);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify email');
    } finally {
      setIsProcessing(false);
    }
  }, [verifyEmailWithCode]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isProcessing,
    error,
    success,
    processVerificationCode,
    reset,
  };
};

export default useEmailVerification;