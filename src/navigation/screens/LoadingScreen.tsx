import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
}

/**
 * Loading Screen Component
 * Shows loading state for navigation and authentication
 */
export function LoadingScreen({ 
  message = 'Loading...', 
  showSpinner = true 
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showSpinner && (
          <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
        )}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

/**
 * Authentication Loading Screen
 * Specific loading screen for authentication flow
 */
export function AuthLoadingScreen() {
  return (
    <LoadingScreen
      message="Checking authentication..."
      showSpinner={true}
    />
  );
}

/**
 * Navigation Loading Screen
 * Specific loading screen for navigation setup
 */
export function NavigationLoadingScreen() {
  return (
    <LoadingScreen
      message="Setting up navigation..."
      showSpinner={true}
    />
  );
}

/**
 * App Loading Screen
 * Main app loading screen with branding
 */
export function AppLoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <Text style={styles.brandTitle}>StyleAI</Text>
        <Text style={styles.brandSubtitle}>Your AI Styling Assistant</Text>
        <ActivityIndicator size="large" color="#007AFF" style={styles.brandSpinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
  },
  brandSpinner: {
    marginTop: 20,
  },
});