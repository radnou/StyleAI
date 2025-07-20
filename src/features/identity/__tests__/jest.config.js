/**
 * Jest Configuration for Identity Domain Tests
 * Configured for React Native with TypeScript support
 */

module.exports = {
  // Test environment
  preset: 'react-native',
  
  // Root directory for tests
  rootDir: '../',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/**/__tests__/**/*.test.{js,jsx,ts,tsx}',
  ],
  
  // File extensions to transform
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform files with babel
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/../../core/$1',
    '^@features/(.*)$': '<rootDir>/../$1',
    '^@shared/(.*)$': '<rootDir>/../../shared/$1',
    '^@navigation/(.*)$': '<rootDir>/../../navigation/$1',
    '^@app/(.*)$': '<rootDir>/../../app/$1',
    
    // Mock static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Setup files to run before tests
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/jest-setup.ts',
    '<rootDir>/__tests__/setup/test-globals.ts',
  ],
  
  // Test environment options
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'domain/**/*.{ts,tsx}',
    'application/**/*.{ts,tsx}',
    'infrastructure/**/*.{ts,tsx}',
    'presentation/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './domain/': {
      branches: 99,
      functions: 99,
      lines: 99,
      statements: 99,
    },
    './application/': {
      branches: 98,
      functions: 98,
      lines: 98,
      statements: 98,
    },
  },
  
  // Coverage output
  coverageDirectory: '<rootDir>/__tests__/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'clover',
  ],
  
  // Test timeouts
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Mock timers
  fakeTimers: {
    enableGlobally: false,
  },
  
  // Error handling
  errorOnDeprecated: true,
  
  // Verbose output
  verbose: true,
  
  // Watch options
  watchman: true,
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|react-native-reanimated|react-native-gesture-handler|react-native-screens|@react-navigation|react-native-safe-area-context|react-native-paper|react-native-elements|react-native-uuid)/)',
  ],
  
  // Global test variables
  globals: {
    __DEV__: true,
    __TEST__: true,
  },
  
  // Test results processor
  testResultsProcessor: '<rootDir>/__tests__/setup/test-results-processor.js',
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/__tests__/coverage',
        outputName: 'junit.xml',
        suiteName: 'Identity Domain Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: '<rootDir>/__tests__/coverage',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Identity Domain Test Report',
      },
    ],
  ],
  
  // Cache
  cacheDirectory: '<rootDir>/__tests__/.jest-cache',
  
  // Max workers for parallel test execution
  maxWorkers: '50%',
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/e2e/',
    '<rootDir>/__tests__/mocks/',
    '<rootDir>/__tests__/test-utils/',
    '<rootDir>/__tests__/setup/',
    '<rootDir>/__tests__/coverage/',
  ],
  
  // Watch path ignore patterns
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/coverage/',
    '<rootDir>/__tests__/.jest-cache/',
  ],
  
  // Snapshot options
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  
  // Module paths
  modulePaths: [
    '<rootDir>',
    '<rootDir>/node_modules',
  ],
  
  // Test sequencer for deterministic test ordering
  testSequencer: '<rootDir>/__tests__/setup/test-sequencer.js',
  
  // Custom matchers
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/jest-setup.ts',
    '<rootDir>/__tests__/setup/custom-matchers.ts',
    '<rootDir>/__tests__/setup/test-globals.ts',
  ],
};