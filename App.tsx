import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { NavigationProvider } from './src/navigation';

/**
 * Main App Component
 * Entry point for the StyleAI application
 */
export default function App() {
  return (
    <>
      <NavigationProvider />
      <StatusBar style="auto" />
    </>
  );
}
