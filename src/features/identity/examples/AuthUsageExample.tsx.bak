// This is an example file showing how to use the Firebase Auth integration
// Note: This file is for documentation purposes and should not be included in the build

import React, { useEffect } from 'react';
import { 
  useAuth, 
  usePasswordReset, 
  useEmailVerification,
  initializeAuth,
} from '../index';

/**
 * Example: App initialization
 * Call this early in your app startup (e.g., App.tsx or _app.tsx)
 */
export const AppInitialization = () => {
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize Firebase Auth services
        await initializeAuth();
        console.log('Auth services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize auth services:', error);
      }
    };

    initialize();
  }, []);

  return null; // This component doesn't render anything
};

/**
 * Example: Login Component
 */
export const LoginExample = () => {
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    clearError();
    
    const result = await login(email, password);
    
    if (result.isSuccess) {
      const user = result.getValue();
      console.log('Login successful:', user);
      // Navigate to dashboard or home screen
    } else {
      console.error('Login failed:', result.getError().message);
      // Error is automatically set in the store
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleLogin(
          formData.get('email') as string,
          formData.get('password') as string
        );
      }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

/**
 * Example: Registration Component
 */
export const RegisterExample = () => {
  const { register, isLoading, error, clearError } = useAuth();

  const handleRegister = async (email: string, password: string, displayName: string) => {
    clearError();
    
    const result = await register(email, password, displayName);
    
    if (result.isSuccess) {
      const user = result.getValue();
      console.log('Registration successful:', user);
      // Navigate to email verification screen
    } else {
      console.error('Registration failed:', result.getError().message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleRegister(
          formData.get('email') as string,
          formData.get('password') as string,
          formData.get('displayName') as string
        );
      }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <input name="displayName" type="text" placeholder="Display Name" required />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

/**
 * Example: Password Reset Component
 */
export const PasswordResetExample = () => {
  const {
    sendResetEmail,
    verifyResetCode,
    confirmPasswordReset,
    isLoading,
    isEmailSent,
    error,
    getNextStep,
    clearError,
  } = usePasswordReset();

  const step = getNextStep();

  const handleSendEmail = async (email: string) => {
    clearError();
    
    const result = await sendResetEmail(email);
    
    if (result.isSuccess) {
      console.log('Reset email sent successfully');
    } else {
      console.error('Failed to send reset email:', result.getError().message);
    }
  };

  const handleVerifyCode = async (code: string) => {
    clearError();
    
    const result = await verifyResetCode(code);
    
    if (result.isSuccess) {
      console.log('Code verified, email:', result.getValue());
    } else {
      console.error('Invalid code:', result.getError().message);
    }
  };

  const handleConfirmReset = async (code: string, newPassword: string) => {
    clearError();
    
    const result = await confirmPasswordReset(code, newPassword);
    
    if (result.isSuccess) {
      console.log('Password reset successful');
      // Navigate to login screen
    } else {
      console.error('Password reset failed:', result.getError().message);
    }
  };

  return (
    <div>
      <h2>Password Reset</h2>
      {error && <div className="error">{error}</div>}
      
      {step === 'send_email' && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSendEmail(formData.get('email') as string);
        }}>
          <input name="email" type="email" placeholder="Email" required />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
      )}
      
      {step === 'verify_code' && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleVerifyCode(formData.get('code') as string);
        }}>
          <p>Check your email for the reset code</p>
          <input name="code" type="text" placeholder="Reset Code" required />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      )}
      
      {step === 'reset_password' && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleConfirmReset(
            formData.get('code') as string,
            formData.get('password') as string
          );
        }}>
          <input name="code" type="text" placeholder="Reset Code" required />
          <input name="password" type="password" placeholder="New Password" required />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
      
      {step === 'complete' && (
        <div>
          <p>Password reset complete! You can now login with your new password.</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Email Verification Component
 */
export const EmailVerificationExample = () => {
  const {
    sendVerificationEmail,
    isSending,
    isVerified,
    error,
    canResend,
    cooldownSeconds,
    clearError,
  } = useEmailVerification();

  const handleSendVerification = async () => {
    clearError();
    
    const result = await sendVerificationEmail();
    
    if (result.isSuccess) {
      console.log('Verification email sent');
    } else {
      console.error('Failed to send verification email:', result.getError().message);
    }
  };

  if (isVerified) {
    return (
      <div>
        <h2>Email Verified</h2>
        <p>Your email has been verified successfully!</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Email Verification</h2>
      <p>Please verify your email address to continue using the app.</p>
      
      {error && <div className="error">{error}</div>}
      
      <button 
        onClick={handleSendVerification}
        disabled={!canResend || isSending}
      >
        {isSending ? 'Sending...' : 
         canResend ? 'Send Verification Email' : 
         `Resend in ${cooldownSeconds}s`}
      </button>
      
      <p>Check your email and click the verification link.</p>
    </div>
  );
};

/**
 * Example: Protected Route Component
 */
export const ProtectedRouteExample = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <div>Please login to access this page</div>;
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * Example: User Profile Component
 */
export const UserProfileExample = () => {
  const { 
    user, 
    domainUser, 
    updateProfile, 
    logout,
    isAuthenticated 
  } = useAuth();

  if (!isAuthenticated || !user) {
    return <div>Please login to view your profile</div>;
  }

  const handleUpdateProfile = async (displayName: string, photoURL?: string) => {
    const result = await updateProfile({ displayName, photoURL });
    
    if (result.isSuccess) {
      console.log('Profile updated successfully');
    } else {
      console.error('Failed to update profile:', result.getError().message);
    }
  };

  const handleLogout = async () => {
    await logout();
    console.log('Logged out successfully');
  };

  return (
    <div>
      <h2>User Profile</h2>
      <p>UID: {user.uid}</p>
      <p>Email: {user.email}</p>
      <p>Display Name: {user.displayName}</p>
      <p>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
      <p>Premium: {user.isPremium ? 'Yes' : 'No'}</p>
      
      {domainUser && (
        <div>
          <h3>Domain User Info</h3>
          <p>Is Active: {domainUser.isActive ? 'Yes' : 'No'}</p>
          <p>Login Attempts: {domainUser.loginAttempts}</p>
          <p>Is Locked: {domainUser.isLocked ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      <button onClick={() => handleUpdateProfile('New Display Name')}>
        Update Profile
      </button>
      
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

/**
 * Example: Complete App Setup
 */
export const CompleteAppExample = () => {
  const { isInitialized, isAuthenticated, isLoading } = useAuth();

  // Initialize auth services on app start
  useEffect(() => {
    const initialize = async () => {
      await initializeAuth();
    };
    initialize();
  }, []);

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return <div>Initializing app...</div>;
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return (
      <div>
        <LoginExample />
        <RegisterExample />
        <PasswordResetExample />
      </div>
    );
  }

  // Show app content if authenticated
  return (
    <ProtectedRouteExample>
      <div>
        <h1>Welcome to StyleAI</h1>
        <UserProfileExample />
        <EmailVerificationExample />
      </div>
    </ProtectedRouteExample>
  );
};

export default CompleteAppExample;