import { useCallback } from 'react';
import { useAppStore } from '@app/store';
import { Result } from '@core/types/result';
import { BaseError } from '@core/errors';
import { AuthUser, AuthState } from '@app/stores/authStore';
import { User } from '../../domain/entities/User';

/**
 * Hook return type for authentication operations
 */
export interface UseAuthReturn {
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: AuthUser | null;
  domainUser: User | null;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<Result<AuthUser, BaseError>>;
  register: (email: string, password: string, displayName: string) => Promise<Result<AuthUser, BaseError>>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<Result<void, BaseError>>;
  sendEmailVerification: () => Promise<Result<void, BaseError>>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<Result<void, BaseError>>;
  refreshUser: () => Promise<Result<void, BaseError>>;
  clearError: () => void;

  // Utility methods
  requireAuth: () => boolean;
  requireVerifiedEmail: () => boolean;
  hasPermission: (permission: string) => boolean;
  isPremium: () => boolean;
  isEmailVerified: () => boolean;
}

/**
 * Authentication hook that provides access to auth state and actions
 * 
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error, isAuthenticated } = useAuth();
 *   
 *   const handleLogin = async (email: string, password: string) => {
 *     const result = await login(email, password);
 *     if (result.isSuccess) {
 *       // Handle success
 *     } else {
 *       // Handle error
 *     }
 *   };
 *   
 *   if (isAuthenticated) {
 *     return <Navigate to="/dashboard" />;
 *   }
 *   
 *   return (
 *     <LoginForm 
 *       onSubmit={handleLogin}
 *       isLoading={isLoading}
 *       error={error}
 *     />
 *   );
 * }
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const store = useAppStore();
  
  // Extract auth state
  const {
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    domainUser,
    error,
  } = store.auth;

  // Extract auth actions
  const {
    login,
    register,
    logout,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    refreshUser,
    clearAuthError,
  } = store;

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    clearAuthError();
  }, [clearAuthError]);

  /**
   * Require authentication - throws error if not authenticated
   * @returns true if authenticated
   * @throws Error if not authenticated
   */
  const requireAuth = useCallback((): boolean => {
    if (!isAuthenticated || !user) {
      throw new Error('Authentication required');
    }
    return true;
  }, [isAuthenticated, user]);

  /**
   * Require verified email - throws error if email not verified
   * @returns true if email is verified
   * @throws Error if email not verified
   */
  const requireVerifiedEmail = useCallback((): boolean => {
    requireAuth();
    if (!user?.emailVerified) {
      throw new Error('Email verification required');
    }
    return true;
  }, [requireAuth, user?.emailVerified]);

  /**
   * Check if user has specific permission
   * @param permission Permission to check
   * @returns true if user has permission
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!isAuthenticated || !user || !domainUser) {
      return false;
    }

    // Basic permission checks based on user state
    switch (permission) {
      case 'access_app':
        return user.emailVerified && domainUser.isActive;
      
      case 'premium_features':
        return user.isPremium && user.emailVerified && domainUser.isActive;
      
      case 'profile_update':
        return user.emailVerified && domainUser.isActive;
      
      case 'password_change':
        return user.emailVerified && domainUser.isActive;
      
      case 'account_delete':
        return user.emailVerified && domainUser.isActive;
      
      case 'admin_access':
        // This would be determined by user roles in a real app
        return false;
      
      default:
        return false;
    }
  }, [isAuthenticated, user, domainUser]);

  /**
   * Check if user has premium subscription
   * @returns true if user is premium
   */
  const isPremium = useCallback((): boolean => {
    return user?.isPremium || false;
  }, [user?.isPremium]);

  /**
   * Check if user's email is verified
   * @returns true if email is verified
   */
  const isEmailVerified = useCallback((): boolean => {
    return user?.emailVerified || false;
  }, [user?.emailVerified]);

  return {
    // Auth state
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    domainUser,
    error,

    // Actions
    login,
    register,
    logout,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    refreshUser,
    clearError,

    // Utility methods
    requireAuth,
    requireVerifiedEmail,
    hasPermission,
    isPremium,
    isEmailVerified,
  };
};

/**
 * Hook for authentication state only (no actions)
 * Useful for components that only need to read auth state
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, isAuthenticated } = useAuthState();
 *   
 *   if (!isAuthenticated || !user) {
 *     return <LoginRequired />;
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>Welcome, {user.displayName}!</h1>
 *       <p>Email: {user.email}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuthState = (): Pick<UseAuthReturn, 
  'isAuthenticated' | 'isLoading' | 'isInitialized' | 'user' | 'domainUser' | 'error' | 
  'requireAuth' | 'requireVerifiedEmail' | 'hasPermission' | 'isPremium' | 'isEmailVerified'
> => {
  const {
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    domainUser,
    error,
    requireAuth,
    requireVerifiedEmail,
    hasPermission,
    isPremium,
    isEmailVerified,
  } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    user,
    domainUser,
    error,
    requireAuth,
    requireVerifiedEmail,
    hasPermission,
    isPremium,
    isEmailVerified,
  };
};

/**
 * Hook for authentication actions only (no state)
 * Useful for components that only need to perform auth operations
 * 
 * @example
 * ```tsx
 * function LogoutButton() {
 *   const { logout } = useAuthActions();
 *   
 *   const handleLogout = async () => {
 *     await logout();
 *   };
 *   
 *   return <Button onPress={handleLogout}>Logout</Button>;
 * }
 * ```
 */
export const useAuthActions = (): Pick<UseAuthReturn,
  'login' | 'register' | 'logout' | 'sendPasswordResetEmail' | 'sendEmailVerification' | 
  'updateProfile' | 'refreshUser' | 'clearError'
> => {
  const {
    login,
    register,
    logout,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    refreshUser,
    clearError,
  } = useAuth();

  return {
    login,
    register,
    logout,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    refreshUser,
    clearError,
  };
};

/**
 * Hook that provides user-specific utilities
 * 
 * @example
 * ```tsx
 * function UserDashboard() {
 *   const { getDisplayName, getInitials, canAccessFeature } = useUserUtils();
 *   
 *   return (
 *     <div>
 *       <Avatar>{getInitials()}</Avatar>
 *       <h1>Hello, {getDisplayName()}!</h1>
 *       {canAccessFeature('premium_features') && (
 *         <PremiumSection />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useUserUtils = () => {
  const { user, domainUser, hasPermission } = useAuthState();

  /**
   * Get user's display name with fallback
   */
  const getDisplayName = useCallback((): string => {
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  }, [user]);

  /**
   * Get user's initials for avatar
   */
  const getInitials = useCallback((): string => {
    if (!user) return 'U';
    
    const displayName = user.displayName || user.email;
    if (!displayName) return 'U';
    
    const nameParts = displayName.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }, [user]);

  /**
   * Get user's full name if available
   */
  const getFullName = useCallback((): string | null => {
    if (!domainUser?.profile.firstName && !domainUser?.profile.lastName) {
      return null;
    }
    
    return [domainUser?.profile.firstName, domainUser?.profile.lastName]
      .filter(Boolean)
      .join(' ') || null;
  }, [domainUser]);

  /**
   * Check if user can access a specific feature
   */
  const canAccessFeature = useCallback((feature: string): boolean => {
    return hasPermission(feature);
  }, [hasPermission]);

  /**
   * Get user's account age in days
   */
  const getAccountAge = useCallback((): number => {
    if (!user?.createdAt) return 0;
    
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [user?.createdAt]);

  /**
   * Get days since last login
   */
  const getDaysSinceLastLogin = useCallback((): number | null => {
    if (!user?.lastLoginAt) return null;
    
    const now = new Date();
    const lastLogin = new Date(user.lastLoginAt);
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [user?.lastLoginAt]);

  /**
   * Check if user is new (created within last 7 days)
   */
  const isNewUser = useCallback((): boolean => {
    return getAccountAge() <= 7;
  }, [getAccountAge]);

  /**
   * Get user's avatar URL or initials
   */
  const getAvatarSource = useCallback((): { type: 'url' | 'initials'; value: string } => {
    if (user?.photoURL) {
      return { type: 'url', value: user.photoURL };
    }
    
    return { type: 'initials', value: getInitials() };
  }, [user?.photoURL, getInitials]);

  return {
    getDisplayName,
    getInitials,
    getFullName,
    canAccessFeature,
    getAccountAge,
    getDaysSinceLastLogin,
    isNewUser,
    getAvatarSource,
  };
};

/**
 * Hook for protected routes that require authentication
 * Automatically handles redirects for unauthenticated users
 * 
 * @example
 * ```tsx
 * function ProtectedScreen() {
 *   const { isReady, shouldRedirect } = useProtectedRoute();
 *   
 *   if (!isReady) {
 *     return <LoadingScreen />;
 *   }
 *   
 *   if (shouldRedirect) {
 *     return <Navigate to="/login" />;
 *   }
 *   
 *   return <ProtectedContent />;
 * }
 * ```
 */
export const useProtectedRoute = (options?: {
  requireEmailVerification?: boolean;
  requirePremium?: boolean;
  requiredPermission?: string;
}) => {
  const {
    isAuthenticated,
    isInitialized,
    isLoading,
    user,
    hasPermission,
  } = useAuthState();

  const {
    requireEmailVerification = false,
    requirePremium = false,
    requiredPermission,
  } = options || {};

  /**
   * Check if the route protection is ready (auth initialized and not loading)
   */
  const isReady = isInitialized && !isLoading;

  /**
   * Check if user should be redirected
   */
  const shouldRedirect = isReady && (
    !isAuthenticated ||
    !user ||
    (requireEmailVerification && !user.emailVerified) ||
    (requirePremium && !user.isPremium) ||
    (requiredPermission && !hasPermission(requiredPermission))
  );

  /**
   * Get the reason for redirect
   */
  const getRedirectReason = useCallback((): string | null => {
    if (!isReady) return null;
    
    if (!isAuthenticated || !user) {
      return 'authentication_required';
    }
    
    if (requireEmailVerification && !user.emailVerified) {
      return 'email_verification_required';
    }
    
    if (requirePremium && !user.isPremium) {
      return 'premium_required';
    }
    
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return 'permission_denied';
    }
    
    return null;
  }, [isReady, isAuthenticated, user, requireEmailVerification, requirePremium, requiredPermission, hasPermission]);

  return {
    isReady,
    shouldRedirect,
    redirectReason: getRedirectReason(),
    isAuthenticated,
    user,
  };
};

export default useAuth;