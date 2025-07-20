import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthConfig {
  webClientId: string;
  iosClientId?: string;
  androidClientId?: string;
}

export interface GoogleUserInfo {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isNewUser: boolean;
}

/**
 * Google Authentication Service using Expo AuthSession
 * Handles Google Sign-In integration with Firebase
 */
export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private request: AuthSession.AuthRequest | null = null;
  private discovery: AuthSession.DiscoveryDocument | null = null;

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Configure Google Sign-In
   */
  async configure(config: GoogleAuthConfig): Promise<void> {
    try {
      // Load the discovery document
      this.discovery = await AuthSession.fetchDiscoveryAsync(
        'https://accounts.google.com'
      );

      // Create the auth request
      this.request = new AuthSession.AuthRequest({
        clientId: config.webClientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri: AuthSession.makeRedirectUri({
          native: 'com.anonymous.StyleAI://redirect',
        }),
      });

      console.log('Google Sign-In configured successfully');
    } catch (error) {
      console.error('Failed to configure Google Sign-In:', error);
      throw error;
    }
  }

  /**
   * Check if Google Play Services are available (not needed for Expo)
   */
  async hasPlayServices(): Promise<boolean> {
    return true; // Always true in Expo managed workflow
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<GoogleUserInfo> {
    try {
      if (!this.request || !this.discovery) {
        throw new Error('Google Sign-In not configured. Call configure() first.');
      }

      // Prompt for authentication
      const result = await this.request.promptAsync(this.discovery);

      if (result.type !== 'success') {
        throw new Error('Google Sign-In was cancelled or failed');
      }

      const { id_token } = result.params;
      
      if (!id_token) {
        throw new Error('No ID token received from Google');
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(id_token);

      // Sign-in the user with the credential
      const auth = getAuth();
      const userCredential = await signInWithCredential(auth, googleCredential);

      // Check if this is a new user
      const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;

      const googleUserInfo: GoogleUserInfo = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || '',
        photoURL: userCredential.user.photoURL,
        isNewUser,
      };

      console.log('Google Sign-In successful:', googleUserInfo);
      return googleUserInfo;

    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      
      if (error.message?.includes('cancelled')) {
        throw new Error('Google Sign-In was cancelled');
      } else {
        throw new Error(`Google Sign-In failed: ${error.message}`);
      }
    }
  }

  /**
   * Sign out from Google (handled by Firebase)
   */
  async signOut(): Promise<void> {
    try {
      // No specific Google sign-out needed with AuthSession
      // Firebase auth handles the sign-out
      console.log('Google Sign-Out successful');
    } catch (error) {
      console.error('Google Sign-Out failed:', error);
      throw error;
    }
  }

  /**
   * Get current user info (handled by Firebase)
   */
  async getCurrentUser(): Promise<any> {
    try {
      const auth = getAuth();
      return auth.currentUser;
    } catch (error) {
      console.log('No user currently signed in');
      return null;
    }
  }

  /**
   * Check if user is signed in
   */
  async isSignedIn(): Promise<boolean> {
    const auth = getAuth();
    return auth.currentUser !== null;
  }
}

export const googleAuthService = GoogleAuthService.getInstance();