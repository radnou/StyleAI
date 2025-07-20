export interface Environment {
  development: boolean;
  staging: boolean;
  production: boolean;
  name: string;
}

const getEnvironment = (): Environment => {
  const env = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  
  return {
    development: env === 'development',
    staging: env === 'staging', 
    production: env === 'production',
    name: env,
  };
};

export const environment = getEnvironment();

export const config = {
  app: {
    name: 'StyleAI',
    version: '1.0.0',
    bundleId: 'com.styleai.app',
  },
  api: {
    baseUrl: environment.production 
      ? 'https://us-central1-styleai-prod.cloudfunctions.net'
      : environment.staging
      ? 'https://us-central1-styleai-staging.cloudfunctions.net'
      : 'http://localhost:5001/styleai-dev/us-central1',
    timeout: 30000,
  },
  features: {
    analytics: environment.production,
    crashReporting: !environment.development,
    debugging: environment.development,
    emulators: environment.development,
  },
  gemini: {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    model: 'gemini-1.5-pro-latest',
    fallbackModel: 'gemini-1.5-flash',
  },
  storage: {
    maxImageSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  auth: {
    passwordMinLength: 8,
    enableMFA: environment.production,
  },
} as const;

export type Config = typeof config;