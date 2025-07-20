import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import React, { ReactElement, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { config } from '../../shared/theme/tamagui-provider';

// Test IDs for common components
export const testIds = {
  // Auth screens
  auth: {
    loginScreen: 'login-screen',
    registerScreen: 'register-screen',
    welcomeScreen: 'welcome-screen',
    emailInput: 'email-input',
    passwordInput: 'password-input',
    loginButton: 'login-button',
    registerButton: 'register-button',
    googleSignInButton: 'google-signin-button',
    forgotPasswordLink: 'forgot-password-link',
    errorMessage: 'error-message',
    loadingIndicator: 'loading-indicator',
  },
  // Wardrobe screens
  wardrobe: {
    wardrobeScreen: 'wardrobe-screen',
    addItemButton: 'add-item-button',
    itemsList: 'items-list',
    itemCard: 'item-card',
    categoryFilter: 'category-filter',
    searchBar: 'search-bar',
    emptyState: 'empty-state',
    deleteButton: 'delete-button',
    editButton: 'edit-button',
    favoriteButton: 'favorite-button',
  },
  // Camera/Image capture
  camera: {
    cameraView: 'camera-view',
    captureButton: 'capture-button',
    switchCameraButton: 'switch-camera-button',
    flashButton: 'flash-button',
    galleryButton: 'gallery-button',
    retakeButton: 'retake-button',
    confirmButton: 'confirm-button',
  },
  // Style analysis
  style: {
    analysisScreen: 'analysis-screen',
    analysisResult: 'analysis-result',
    recommendationList: 'recommendation-list',
    refreshButton: 'refresh-button',
    shareButton: 'share-button',
  },
  // Common components
  common: {
    backButton: 'back-button',
    saveButton: 'save-button',
    cancelButton: 'cancel-button',
    modal: 'modal',
    toast: 'toast',
    bottomSheet: 'bottom-sheet',
  },
};

// Mock navigation prop
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(() => ({
    routes: [],
    index: 0,
    key: 'test-key',
    routeNames: [],
    type: 'stack',
    stale: false,
  })),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
});

// Mock route prop
export const createMockRoute = (name: string, params: any = {}) => ({
  key: `${name}-key`,
  name,
  params,
  path: undefined,
});

// All providers wrapper
interface AllTheProvidersProps {
  children: ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 47, right: 0, bottom: 34, left: 0 },
      }}
    >
      <TamaguiProvider config={config as any}>
        <NavigationContainer>{children}</NavigationContainer>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };

// Wait for async updates
export const waitForAsyncUpdates = () => 
  new Promise(resolve => setImmediate(resolve));

// Mock async storage data
export const mockAsyncStorage = {
  data: {} as Record<string, string>,
  
  setItem: jest.fn((key: string, value: string) => {
    mockAsyncStorage.data[key] = value;
    return Promise.resolve();
  }),
  
  getItem: jest.fn((key: string) => 
    Promise.resolve(mockAsyncStorage.data[key] || null)
  ),
  
  removeItem: jest.fn((key: string) => {
    delete mockAsyncStorage.data[key];
    return Promise.resolve();
  }),
  
  clear: jest.fn(() => {
    mockAsyncStorage.data = {};
    return Promise.resolve();
  }),
  
  getAllKeys: jest.fn(() => 
    Promise.resolve(Object.keys(mockAsyncStorage.data))
  ),
  
  multiGet: jest.fn((keys: string[]) =>
    Promise.resolve(
      keys.map(key => [key, mockAsyncStorage.data[key] || null])
    )
  ),
};

// Test data factories
export const factories = {
  user: {
    create: (overrides = {}) => ({
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      emailVerified: false,
      isPremium: false,
      createdAt: new Date('2023-01-01'),
      lastLoginAt: new Date('2023-01-01'),
      ...overrides,
    }),
  },
  
  clothingItem: {
    create: (overrides = {}) => ({
      id: 'test-item-id',
      name: 'Test T-Shirt',
      category: 'tops',
      subcategory: 'T-Shirt',
      color: 'Blue',
      size: 'M',
      brand: 'Test Brand',
      season: ['spring', 'summer'],
      occasion: ['casual'],
      imageUrl: 'https://example.com/image.jpg',
      tags: ['comfortable', 'cotton'],
      isFavorite: false,
      isArchived: false,
      condition: 'good',
      timesWorn: 0,
      userId: 'test-user-id',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      ...overrides,
    }),
  },
  
  outfit: {
    create: (overrides = {}) => ({
      id: 'test-outfit-id',
      name: 'Casual Friday',
      items: ['item-1', 'item-2', 'item-3'],
      occasion: 'casual',
      season: 'spring',
      tags: ['comfortable', 'work-appropriate'],
      userId: 'test-user-id',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      ...overrides,
    }),
  },
  
  styleAnalysis: {
    create: (overrides = {}) => ({
      id: 'test-analysis-id',
      userId: 'test-user-id',
      overallStyle: 'casual-chic',
      colorPalette: ['navy', 'white', 'gray'],
      recommendations: [
        'Add more formal pieces',
        'Invest in quality accessories',
      ],
      score: {
        versatility: 0.85,
        cohesiveness: 0.88,
        trendiness: 0.65,
        uniqueness: 0.72,
      },
      createdAt: new Date('2023-01-01'),
      ...overrides,
    }),
  },
};

// Firebase test utils
export const firebaseTestUtils = {
  mockAuthStateChange: (user: any | null) => {
    const auth = require('@react-native-firebase/auth').default();
    auth.onAuthStateChanged.mockImplementation((callback: Function) => {
      callback(user);
      return jest.fn(); // unsubscribe
    });
  },
  
  mockFirestoreData: (collection: string, docs: any[]) => {
    const firestore = require('@react-native-firebase/firestore').default();
    const mockDocs = docs.map(data => ({
      exists: true,
      id: data.id,
      data: jest.fn(() => data),
      ref: { id: data.id },
    }));
    
    firestore.collection.mockImplementation((col: string) => {
      if (col === collection) {
        return {
          get: jest.fn().mockResolvedValue({
            empty: mockDocs.length === 0,
            size: mockDocs.length,
            docs: mockDocs,
          }),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
        };
      }
      return firestore.collection(col);
    });
  },
};

// Performance test utils
export const performanceTestUtils = {
  measureRenderTime: async (component: ReactElement) => {
    const start = performance.now();
    const { unmount } = render(component);
    await waitForAsyncUpdates();
    const end = performance.now();
    unmount();
    return end - start;
  },
  
  measureAsyncOperation: async (operation: () => Promise<any>) => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    return { result, duration: end - start };
  },
  
  expectRenderTimeBelow: async (component: ReactElement, maxMs: number) => {
    const renderTime = await performanceTestUtils.measureRenderTime(component);
    expect(renderTime).toBeLessThan(maxMs);
  },
};

// Accessibility test utils
export const a11yTestUtils = {
  expectAccessible: (element: any) => {
    expect(element).toHaveAccessibilityRole();
    expect(element).toHaveAccessibilityLabel();
  },
  
  expectKeyboardNavigable: (element: any) => {
    expect(element).toHaveProp('accessible', true);
    expect(element).toHaveProp('focusable', true);
  },
  
  expectScreenReaderFriendly: (screen: any) => {
    const headers = screen.getAllByRole('header');
    expect(headers.length).toBeGreaterThan(0);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibilityLabel();
    });
  },
};

// Snapshot test utils
export const snapshotTestUtils = {
  testScreenSnapshot: (screenName: string, props = {}) => {
    it(`${screenName} matches snapshot`, () => {
      const Screen = require(`../../screens/${screenName}`).default;
      const { toJSON } = render(<Screen {...props} />);
      expect(toJSON()).toMatchSnapshot();
    });
  },
  
  testComponentSnapshot: (Component: React.ComponentType<any>, props = {}) => {
    it(`${Component.name} matches snapshot`, () => {
      const { toJSON } = render(<Component {...props} />);
      expect(toJSON()).toMatchSnapshot();
    });
  },
};

// Error boundary for tests
export class TestErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div testID="error-boundary-message">
          Error: {this.state.error?.message}
        </div>
      );
    }

    return this.props.children;
  }
}

// Mock timers utils
export const timerUtils = {
  runAllTimers: () => {
    jest.runAllTimers();
  },
  
  runOnlyPendingTimers: () => {
    jest.runOnlyPendingTimers();
  },
  
  advanceTimersByTime: (ms: number) => {
    jest.advanceTimersByTime(ms);
  },
  
  waitFor: (ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms)),
};

// Export commonly used test patterns
export const testPatterns = {
  itShouldRenderWithoutCrashing: (Component: React.ComponentType<any>, props = {}) => {
    it('renders without crashing', () => {
      expect(() => render(<Component {...props} />)).not.toThrow();
    });
  },
  
  itShouldHandleLoadingState: (Component: React.ComponentType<any>, loadingProp = 'isLoading') => {
    it('displays loading indicator when loading', () => {
      const { getByTestId } = render(<Component {...{ [loadingProp]: true }} />);
      expect(getByTestId(testIds.auth.loadingIndicator)).toBeTruthy();
    });
  },
  
  itShouldHandleErrorState: (Component: React.ComponentType<any>, errorProp = 'error') => {
    it('displays error message when error occurs', () => {
      const errorMessage = 'Test error';
      const { getByTestId } = render(<Component {...{ [errorProp]: errorMessage }} />);
      expect(getByTestId(testIds.auth.errorMessage)).toHaveTextContent(errorMessage);
    });
  },
  
  itShouldBeAccessible: (Component: React.ComponentType<any>, props = {}) => {
    it('meets accessibility standards', () => {
      const { getByRole, getAllByRole } = render(<Component {...props} />);
      
      // Check for proper heading structure
      const headings = getAllByRole('header');
      expect(headings.length).toBeGreaterThan(0);
      
      // Check interactive elements have labels
      const buttons = getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibilityLabel();
      });
    });
  },
};