/**
 * Jest Setup Configuration for Identity Domain Tests
 * Sets up testing environment, mocks, and utilities
 */

import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Silence warnings
console.warn = jest.fn();
console.error = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setParams: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      canGoBack: jest.fn(() => true),
      isFocused: jest.fn(() => true),
      push: jest.fn(),
      replace: jest.fn(),
      pop: jest.fn(),
      popToTop: jest.fn(),
    }),
    useRoute: () => ({
      key: 'test-route',
      name: 'TestScreen',
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: jest.fn(() => true),
  };
});

// Mock React Navigation Stack
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
  TransitionPresets: {},
  HeaderStyleInterpolators: {},
  CardStyleInterpolators: {},
}));

// Mock React Navigation Bottom Tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(),
}));

// Mock React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesome');
jest.mock('react-native-vector-icons/Feather', () => 'Feather');

// Mock React Native Elements
jest.mock('react-native-elements', () => ({
  Button: 'Button',
  Input: 'Input',
  Text: 'Text',
  Card: 'Card',
  Avatar: 'Avatar',
  Badge: 'Badge',
  CheckBox: 'CheckBox',
  Divider: 'Divider',
  Header: 'Header',
  Icon: 'Icon',
  Image: 'Image',
  ListItem: 'ListItem',
  Overlay: 'Overlay',
  SearchBar: 'SearchBar',
  Slider: 'Slider',
  Switch: 'Switch',
  Tile: 'Tile',
  Tooltip: 'Tooltip',
  ThemeProvider: ({ children }: any) => children,
}));

// Mock React Native Paper
jest.mock('react-native-paper', () => ({
  Provider: ({ children }: any) => children,
  DefaultTheme: {},
  DarkTheme: {},
  Button: 'Button',
  Text: 'Text',
  TextInput: 'TextInput',
  Card: 'Card',
  Surface: 'Surface',
  Appbar: 'Appbar',
  Avatar: 'Avatar',
  Badge: 'Badge',
  Banner: 'Banner',
  BottomNavigation: 'BottomNavigation',
  Checkbox: 'Checkbox',
  Chip: 'Chip',
  DataTable: 'DataTable',
  Dialog: 'Dialog',
  Divider: 'Divider',
  Drawer: 'Drawer',
  FAB: 'FAB',
  HelperText: 'HelperText',
  IconButton: 'IconButton',
  List: 'List',
  Menu: 'Menu',
  Modal: 'Modal',
  Portal: 'Portal',
  ProgressBar: 'ProgressBar',
  RadioButton: 'RadioButton',
  Searchbar: 'Searchbar',
  SegmentedButtons: 'SegmentedButtons',
  Snackbar: 'Snackbar',
  Switch: 'Switch',
  ToggleButton: 'ToggleButton',
  Tooltip: 'Tooltip',
  TouchableRipple: 'TouchableRipple',
}));

// Mock Firebase
jest.mock('@react-native-firebase/auth', () => ({
  default: () => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    confirmPasswordReset: jest.fn(),
    verifyPasswordResetCode: jest.fn(),
    applyActionCode: jest.fn(),
    checkActionCode: jest.fn(),
    onAuthStateChanged: jest.fn(),
    sendEmailVerification: jest.fn(),
  }),
  FirebaseAuthTypes: {
    User: {},
    UserCredential: {},
  },
}));

jest.mock('@react-native-firebase/firestore', () => ({
  default: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        onSnapshot: jest.fn(),
      })),
      add: jest.fn(),
      get: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn(),
        onSnapshot: jest.fn(),
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(),
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
    })),
    batch: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(),
    })),
    runTransaction: jest.fn(),
    FieldValue: {
      delete: jest.fn(),
      increment: jest.fn(),
      arrayUnion: jest.fn(),
      arrayRemove: jest.fn(),
      serverTimestamp: jest.fn(),
    },
    Timestamp: {
      now: jest.fn(),
      fromDate: jest.fn(),
    },
  }),
}));

// Mock React Native Keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve(true)),
  getInternetCredentials: jest.fn(() => Promise.resolve({
    username: 'test@example.com',
    password: 'test-token',
  })),
  resetInternetCredentials: jest.fn(() => Promise.resolve(true)),
  canImplyAuthentication: jest.fn(() => Promise.resolve(true)),
  getSupportedBiometryType: jest.fn(() => Promise.resolve('FaceID')),
  ACCESS_CONTROL: {},
  AUTHENTICATION_TYPE: {},
  BIOMETRY_TYPE: {},
  SECURITY_LEVEL: {},
  STORAGE_TYPE: {},
}));

// Mock React Native Biometrics
jest.mock('react-native-biometrics', () => ({
  default: {
    isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'FaceID' })),
    simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
    createKeys: jest.fn(() => Promise.resolve({ publicKey: 'test-public-key' })),
    deleteKeys: jest.fn(() => Promise.resolve({ keysDeleted: true })),
    createSignature: jest.fn(() => Promise.resolve({ success: true, signature: 'test-signature' })),
  },
  BiometryTypes: {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
  },
}));

// Mock React Native Device Info
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => Promise.resolve('test-device-id')),
  getDeviceId: jest.fn(() => 'test-device'),
  getSystemName: jest.fn(() => 'iOS'),
  getSystemVersion: jest.fn(() => '15.0'),
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
  getBundleId: jest.fn(() => 'com.styleai.app'),
  getModel: jest.fn(() => 'iPhone 13'),
  getBrand: jest.fn(() => 'Apple'),
  getManufacturer: jest.fn(() => Promise.resolve('Apple')),
  isEmulator: jest.fn(() => Promise.resolve(false)),
  hasNotch: jest.fn(() => true),
  hasDynamicIsland: jest.fn(() => true),
  getFreeDiskStorage: jest.fn(() => Promise.resolve(1000000000)),
  getTotalMemory: jest.fn(() => Promise.resolve(4000000000)),
  getUsedMemory: jest.fn(() => Promise.resolve(2000000000)),
}));

// Mock React Native Permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
      MICROPHONE: 'ios.permission.MICROPHONE',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
      CONTACTS: 'ios.permission.CONTACTS',
      FACE_ID: 'ios.permission.FACE_ID',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      READ_CONTACTS: 'android.permission.READ_CONTACTS',
      USE_FINGERPRINT: 'android.permission.USE_FINGERPRINT',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
    LIMITED: 'limited',
  },
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  checkMultiple: jest.fn(() => Promise.resolve({})),
  requestMultiple: jest.fn(() => Promise.resolve({})),
  openSettings: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock('@react-native-netinfo/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
  })),
  addEventListener: jest.fn(() => jest.fn()),
  useNetInfo: jest.fn(() => ({
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
  })),
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    WebView: View,
    TapGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    LongPressGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    NativeViewGestureHandler: View,
    createNativeWrapper: jest.fn(() => View),
    Directions: {},
    gestureHandlerRootHOC: jest.fn(c => c),
    GestureHandlerRootView: View,
  };
});

// Mock Zustand
jest.mock('zustand', () => ({
  create: jest.fn((fn) => {
    const store = fn(
      jest.fn((partial) => Object.assign(store, typeof partial === 'function' ? partial(store) : partial)),
      jest.fn(() => store),
      {
        setState: jest.fn(),
        getState: jest.fn(() => store),
        subscribe: jest.fn(),
        destroy: jest.fn(),
      }
    );
    return store;
  }),
}));

// Mock Immer for Zustand
jest.mock('zustand/middleware/immer', () => ({
  immer: jest.fn((fn) => fn),
}));

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234-5678-9012'),
  v1: jest.fn(() => 'test-uuid-v1-1234-5678-9012'),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => date.toISOString()),
  isAfter: jest.fn(),
  isBefore: jest.fn(),
  addDays: jest.fn(),
  subDays: jest.fn(),
  differenceInDays: jest.fn(),
  differenceInHours: jest.fn(),
  differenceInMinutes: jest.fn(),
  parseISO: jest.fn(),
  isValid: jest.fn(() => true),
}));

// Mock React Native Encrypted Storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock React Native Share
jest.mock('react-native-share', () => ({
  default: {
    open: jest.fn(() => Promise.resolve()),
    shareSingle: jest.fn(() => Promise.resolve()),
  },
  Social: {
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
    INSTAGRAM: 'instagram',
    WHATSAPP: 'whatsapp',
  },
}));

// Mock Flipper
jest.mock('react-native-flipper', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Global test utilities
global.flushPromises = () => new Promise(setImmediate);

global.wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

global.createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
): jest.MockedFunction<T> => {
  return jest.fn(implementation) as jest.MockedFunction<T>;
};

global.createMockPromise = <T>(value?: T, shouldReject = false) => {
  return shouldReject 
    ? Promise.reject(value || new Error('Mock promise rejected'))
    : Promise.resolve(value);
};

// Test environment setup
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for slower tests
jest.setTimeout(30000);