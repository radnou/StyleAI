import '@testing-library/react-native/extend-expect';
import { TextEncoder, TextDecoder } from 'util';

// Fix for React Native TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock React Native modules that don't work in Jest
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    Swipeable: ({ children }: any) => children,
    DrawerLayout: ({ children }: any) => children,
    State: {},
    ScrollView: ({ children }: any) => React.createElement('ScrollView', null, children),
    Slider: ({ children }: any) => React.createElement('Slider', null, children),
    Switch: ({ children }: any) => React.createElement('Switch', null, children),
    TextInput: ({ children }: any) => React.createElement('TextInput', null, children),
    ToolbarAndroid: ({ children }: any) => React.createElement('ToolbarAndroid', null, children),
    ViewPagerAndroid: ({ children }: any) => React.createElement('ViewPagerAndroid', null, children),
    DrawerLayoutAndroid: ({ children }: any) => React.createElement('DrawerLayoutAndroid', null, children),
    WebView: ({ children }: any) => React.createElement('WebView', null, children),
    NativeViewGestureHandler: ({ children }: any) => children,
    TapGestureHandler: ({ children }: any) => children,
    FlingGestureHandler: ({ children }: any) => children,
    ForceTouchGestureHandler: ({ children }: any) => children,
    LongPressGestureHandler: ({ children }: any) => children,
    PanGestureHandler: ({ children }: any) => children,
    PinchGestureHandler: ({ children }: any) => children,
    RotationGestureHandler: ({ children }: any) => children,
    RawButton: ({ children }: any) => children,
    BaseButton: ({ children }: any) => children,
    RectButton: ({ children }: any) => children,
    BorderlessButton: ({ children }: any) => children,
    FlatList: ({ children }: any) => React.createElement('FlatList', null, children),
    gestureHandlerRootHOC: (Component: any) => Component,
    Directions: {},
  };
});

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  initializeApp: jest.fn(),
  firebase: {
    app: jest.fn(() => ({
      delete: jest.fn(),
    })),
    apps: [],
  },
}));

jest.mock('@react-native-firebase/auth', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: false,
    isAnonymous: false,
    metadata: {
      creationTime: '2023-01-01T00:00:00.000Z',
      lastSignInTime: '2023-01-01T00:00:00.000Z',
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
    getIdTokenResult: jest.fn().mockResolvedValue({
      token: 'mock-id-token',
      expirationTime: '2023-01-01T01:00:00.000Z',
      authTime: '2023-01-01T00:00:00.000Z',
      issuedAtTime: '2023-01-01T00:00:00.000Z',
      signInProvider: 'password',
      signInSecondFactor: null,
      claims: {},
    }),
    reload: jest.fn(),
    sendEmailVerification: jest.fn(),
    updateEmail: jest.fn(),
    updatePassword: jest.fn(),
    updatePhoneNumber: jest.fn(),
    updateProfile: jest.fn(),
    verifyBeforeUpdateEmail: jest.fn(),
    linkWithCredential: jest.fn(),
    reauthenticateWithCredential: jest.fn(),
    toJSON: jest.fn(),
  };

  return {
    default: () => ({
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        callback(null);
        return jest.fn(); // unsubscribe function
      }),
      onIdTokenChanged: jest.fn(),
      onUserChanged: jest.fn(),
      signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
      createUserWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
      signInWithCredential: jest.fn().mockResolvedValue({ user: mockUser }),
      signInWithCustomToken: jest.fn().mockResolvedValue({ user: mockUser }),
      signInAnonymously: jest.fn().mockResolvedValue({ user: mockUser }),
      signOut: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      confirmPasswordReset: jest.fn().mockResolvedValue(undefined),
      verifyPasswordResetCode: jest.fn().mockResolvedValue('test@example.com'),
      applyActionCode: jest.fn().mockResolvedValue(undefined),
      checkActionCode: jest.fn().mockResolvedValue({
        operation: 'EMAIL_VERIFICATION',
        data: { email: 'test@example.com' },
      }),
      fetchSignInMethodsForEmail: jest.fn().mockResolvedValue(['password']),
      isSignInWithEmailLink: jest.fn().mockReturnValue(false),
      sendSignInLinkToEmail: jest.fn().mockResolvedValue(undefined),
      signInWithEmailLink: jest.fn().mockResolvedValue({ user: mockUser }),
      languageCode: 'en',
      settings: {
        appVerificationDisabledForTesting: false,
        forceRecaptchaFlow: false,
      },
      tenantId: null,
      updateCurrentUser: jest.fn(),
      useDeviceLanguage: jest.fn(),
      verifyPhoneNumber: jest.fn(),
      confirmationResult: jest.fn(),
    }),
    FirebaseAuthTypes: {
      ActionCodeOperation: {
        EMAIL_SIGNIN: 'EMAIL_SIGNIN',
        PASSWORD_RESET: 'PASSWORD_RESET',
        RECOVER_EMAIL: 'RECOVER_EMAIL',
        REVERT_SECOND_FACTOR_ADDITION: 'REVERT_SECOND_FACTOR_ADDITION',
        VERIFY_AND_CHANGE_EMAIL: 'VERIFY_AND_CHANGE_EMAIL',
        VERIFY_EMAIL: 'VERIFY_EMAIL',
      },
    },
  };
});

jest.mock('@react-native-firebase/firestore', () => {
  const mockTimestamp = {
    seconds: 1234567890,
    nanoseconds: 123456789,
    toDate: jest.fn(() => new Date('2023-01-01T00:00:00.000Z')),
    toMillis: jest.fn(() => 1234567890123),
    isEqual: jest.fn(),
    valueOf: jest.fn(() => '1234567890.123456789'),
  };

  const mockDocSnapshot = {
    exists: true,
    id: 'mock-doc-id',
    ref: null,
    metadata: {
      hasPendingWrites: false,
      fromCache: false,
      isEqual: jest.fn(),
    },
    data: jest.fn(() => ({ id: 'mock-doc-id', name: 'Mock Document' })),
    get: jest.fn(),
    isEqual: jest.fn(),
  };

  const mockQuery = {
    endAt: jest.fn().mockReturnThis(),
    endBefore: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      empty: false,
      size: 1,
      docs: [mockDocSnapshot],
      forEach: jest.fn((callback) => callback(mockDocSnapshot)),
      docChanges: jest.fn(),
      isEqual: jest.fn(),
      metadata: {
        hasPendingWrites: false,
        fromCache: false,
        isEqual: jest.fn(),
      },
      query: null,
    }),
    limit: jest.fn().mockReturnThis(),
    limitToLast: jest.fn().mockReturnThis(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    startAt: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    isEqual: jest.fn(),
  };

  const mockDoc = {
    collection: jest.fn().mockReturnValue(mockQuery),
    delete: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(mockDocSnapshot),
    onSnapshot: jest.fn((callback) => {
      callback(mockDocSnapshot);
      return jest.fn(); // unsubscribe function
    }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
    parent: null,
    path: 'collection/mock-doc-id',
    firestore: null,
    isEqual: jest.fn(),
  };

  const mockCollection = {
    ...mockQuery,
    add: jest.fn().mockResolvedValue(mockDoc),
    doc: jest.fn(() => mockDoc),
    id: 'mock-collection-id',
    parent: null,
    path: 'collection',
    firestore: null,
  };

  return {
    default: () => ({
      batch: jest.fn(() => ({
        commit: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
      collection: jest.fn(() => mockCollection),
      collectionGroup: jest.fn(() => mockQuery),
      doc: jest.fn(() => mockDoc),
      runTransaction: jest.fn(async (updateFunction) => {
        const transaction = {
          delete: jest.fn(),
          get: jest.fn().mockResolvedValue(mockDocSnapshot),
          set: jest.fn(),
          update: jest.fn(),
        };
        return await updateFunction(transaction);
      }),
      clearPersistence: jest.fn().mockResolvedValue(undefined),
      disableNetwork: jest.fn().mockResolvedValue(undefined),
      enableNetwork: jest.fn().mockResolvedValue(undefined),
      enablePersistence: jest.fn().mockResolvedValue(undefined),
      settings: jest.fn(),
      terminate: jest.fn().mockResolvedValue(undefined),
      useEmulator: jest.fn(),
      waitForPendingWrites: jest.fn().mockResolvedValue(undefined),
    }),
    FirebaseFirestoreTypes: {
      Timestamp: {
        now: jest.fn(() => mockTimestamp),
        fromDate: jest.fn(() => mockTimestamp),
        fromMillis: jest.fn(() => mockTimestamp),
      },
      FieldValue: {
        serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
        increment: jest.fn((n) => ({ _methodName: 'increment', _operand: n })),
        arrayUnion: jest.fn((...elements) => ({ _methodName: 'arrayUnion', _elements: elements })),
        arrayRemove: jest.fn((...elements) => ({ _methodName: 'arrayRemove', _elements: elements })),
        delete: jest.fn(() => ({ _methodName: 'delete' })),
      },
      GeoPoint: jest.fn((latitude, longitude) => ({ latitude, longitude })),
      Query: {},
      DocumentSnapshot: {},
      QuerySnapshot: {},
      WriteBatch: {},
      Transaction: {},
    },
  };
});

jest.mock('@react-native-firebase/storage', () => {
  const mockRef = {
    bucket: 'mock-bucket',
    fullPath: 'mock/path/file.jpg',
    name: 'file.jpg',
    parent: null,
    root: null,
    storage: null,
    child: jest.fn((path) => ({ ...mockRef, fullPath: `mock/path/${path}`, name: path })),
    delete: jest.fn().mockResolvedValue(undefined),
    getDownloadURL: jest.fn().mockResolvedValue('https://mock-download-url.com/file.jpg'),
    getMetadata: jest.fn().mockResolvedValue({
      bucket: 'mock-bucket',
      fullPath: 'mock/path/file.jpg',
      generation: '1234567890',
      metageneration: '1',
      name: 'file.jpg',
      size: 12345,
      timeCreated: '2023-01-01T00:00:00.000Z',
      updated: '2023-01-01T00:00:00.000Z',
      contentType: 'image/jpeg',
      contentDisposition: 'inline',
      contentEncoding: 'identity',
      contentLanguage: 'en',
      cacheControl: 'public, max-age=3600',
      customMetadata: {},
      md5Hash: 'mock-md5-hash',
    }),
    list: jest.fn().mockResolvedValue({
      items: [],
      prefixes: [],
      nextPageToken: null,
    }),
    listAll: jest.fn().mockResolvedValue({
      items: [],
      prefixes: [],
    }),
    put: jest.fn().mockReturnValue({
      on: jest.fn((event, ...args) => {
        if (event === 'state_changed') {
          const [progress, error, complete] = args;
          // Simulate upload progress
          if (progress) {
            progress({
              bytesTransferred: 50,
              totalBytes: 100,
              state: 'running',
              metadata: {},
              task: null,
              ref: mockRef,
            });
          }
          // Simulate completion
          if (complete) {
            setTimeout(() => complete(), 100);
          }
        }
        return jest.fn(); // unsubscribe function
      }),
      cancel: jest.fn(),
      catch: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      then: jest.fn().mockResolvedValue({
        bytesTransferred: 100,
        totalBytes: 100,
        state: 'success',
        metadata: {},
        task: null,
        ref: mockRef,
      }),
    }),
    putFile: jest.fn().mockReturnValue({
      on: jest.fn((event, ...args) => {
        if (event === 'state_changed') {
          const [progress, error, complete] = args;
          if (complete) {
            setTimeout(() => complete(), 100);
          }
        }
        return jest.fn();
      }),
      then: jest.fn().mockResolvedValue({
        state: 'success',
        ref: mockRef,
      }),
    }),
    putString: jest.fn().mockResolvedValue({
      ref: mockRef,
    }),
    updateMetadata: jest.fn().mockResolvedValue({}),
    toString: jest.fn(() => 'gs://mock-bucket/mock/path/file.jpg'),
  };

  return {
    default: () => ({
      ref: jest.fn((path) => ({ ...mockRef, fullPath: path || '', name: path?.split('/').pop() || '' })),
      refFromURL: jest.fn((url) => mockRef),
      setMaxDownloadRetryTime: jest.fn(),
      setMaxOperationRetryTime: jest.fn(),
      setMaxUploadRetryTime: jest.fn(),
      useEmulator: jest.fn(),
    }),
    FirebaseStorageTypes: {
      TaskEvent: {
        STATE_CHANGED: 'state_changed',
      },
      TaskState: {
        CANCELLED: 'cancelled',
        ERROR: 'error',
        PAUSED: 'paused',
        RUNNING: 'running',
        SUCCESS: 'success',
      },
    },
  };
});

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
  StatusBarStyle: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
  },
}));

jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front',
      },
      FlashMode: {
        on: 'on',
        off: 'off',
        auto: 'auto',
        torch: 'torch',
      },
      WhiteBalance: {
        auto: 'auto',
        sunny: 'sunny',
        cloudy: 'cloudy',
        flash: 'flash',
        shadow: 'shadow',
        incandescent: 'incandescent',
        fluorescent: 'fluorescent',
      },
    },
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({
      status: 'granted',
      expires: 'never',
      granted: true,
      canAskAgain: true,
    }),
    requestMicrophonePermissionsAsync: jest.fn().mockResolvedValue({
      status: 'granted',
      expires: 'never',
      granted: true,
      canAskAgain: true,
    }),
    getCameraPermissionsAsync: jest.fn().mockResolvedValue({
      status: 'granted',
      expires: 'never',
      granted: true,
      canAskAgain: true,
    }),
    getMicrophonePermissionsAsync: jest.fn().mockResolvedValue({
      status: 'granted',
      expires: 'never',
      granted: true,
      canAskAgain: true,
    }),
  },
  CameraType: {
    back: 'back',
    front: 'front',
  },
  CameraView: 'CameraView',
}));

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn().mockResolvedValue({
    cancelled: false,
    assets: [{
      uri: 'file:///mock/image.jpg',
      width: 1920,
      height: 1080,
      type: 'image',
      fileName: 'image.jpg',
      fileSize: 123456,
      base64: null,
      exif: null,
    }],
  }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    cancelled: false,
    assets: [{
      uri: 'file:///mock/image.jpg',
      width: 1920,
      height: 1080,
      type: 'image',
      fileName: 'image.jpg',
      fileSize: 123456,
      base64: null,
      exif: null,
    }],
  }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  }),
  getCameraPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  }),
  getMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  }),
  MediaTypeOptions: {
    All: 'All',
    Videos: 'Videos',
    Images: 'Images',
  },
  ImagePickerOptions: {},
  ImagePickerResult: {},
  ImagePickerAsset: {},
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  }),
  getPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  }),
  createAssetAsync: jest.fn().mockResolvedValue({
    id: 'mock-asset-id',
    filename: 'image.jpg',
    uri: 'file:///mock/image.jpg',
    mediaType: 'photo',
    width: 1920,
    height: 1080,
    creationTime: 1234567890,
    modificationTime: 1234567890,
    duration: 0,
  }),
  saveToLibraryAsync: jest.fn().mockResolvedValue(undefined),
  addAssetsToAlbumAsync: jest.fn().mockResolvedValue(true),
  removeAssetsFromAlbumAsync: jest.fn().mockResolvedValue(true),
  deleteAssetsAsync: jest.fn().mockResolvedValue(true),
  getAlbumsAsync: jest.fn().mockResolvedValue({
    endCursor: '0',
    hasNextPage: false,
    totalCount: 1,
    albums: [{
      id: 'mock-album-id',
      title: 'Camera Roll',
      assetCount: 10,
      type: 'smartAlbum',
    }],
  }),
  getAlbumAsync: jest.fn().mockResolvedValue({
    id: 'mock-album-id',
    title: 'Camera Roll',
    assetCount: 10,
    type: 'smartAlbum',
  }),
  getAssetsAsync: jest.fn().mockResolvedValue({
    endCursor: '0',
    hasNextPage: false,
    totalCount: 1,
    assets: [{
      id: 'mock-asset-id',
      filename: 'image.jpg',
      uri: 'file:///mock/image.jpg',
      mediaType: 'photo',
      width: 1920,
      height: 1080,
      creationTime: 1234567890,
      modificationTime: 1234567890,
      duration: 0,
    }],
  }),
  getAssetInfoAsync: jest.fn().mockResolvedValue({
    localUri: 'file:///mock/image.jpg',
    location: null,
    exif: null,
    isFavorite: false,
  }),
  MediaType: {
    audio: 'audio',
    photo: 'photo',
    video: 'video',
    unknown: 'unknown',
  },
  SortBy: {
    default: 'default',
    creationTime: 'creationTime',
    modificationTime: 'modificationTime',
    mediaType: 'mediaType',
    width: 'width',
    height: 'height',
    duration: 'duration',
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
  mergeItem: jest.fn().mockResolvedValue(undefined),
  multiMerge: jest.fn().mockResolvedValue(undefined),
}));

// Mock Google Sign In
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      user: {
        id: 'google-user-id',
        name: 'Google User',
        email: 'google@example.com',
        photo: 'https://example.com/photo.jpg',
        familyName: 'User',
        givenName: 'Google',
      },
      idToken: 'mock-id-token',
      serverAuthCode: 'mock-server-auth-code',
    }),
    signInSilently: jest.fn().mockResolvedValue({
      user: {
        id: 'google-user-id',
        name: 'Google User',
        email: 'google@example.com',
        photo: 'https://example.com/photo.jpg',
        familyName: 'User',
        givenName: 'Google',
      },
      idToken: 'mock-id-token',
      serverAuthCode: 'mock-server-auth-code',
    }),
    isSignedIn: jest.fn().mockResolvedValue(false),
    revokeAccess: jest.fn().mockResolvedValue(undefined),
    signOut: jest.fn().mockResolvedValue(undefined),
    getCurrentUser: jest.fn().mockReturnValue(null),
  },
  GoogleSigninButton: 'GoogleSigninButton',
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      isFocused: jest.fn(),
      canGoBack: jest.fn(),
      getParent: jest.fn(),
      getState: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      setOptions: jest.fn(),
      setParams: jest.fn(),
    }),
    useRoute: () => ({
      key: 'test-route-key',
      name: 'TestScreen',
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

// Mock Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
}));

// Mock Expo Web Browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn().mockResolvedValue({ type: 'dismiss' }),
  maybeCompleteAuthSession: jest.fn().mockReturnValue({ type: 'success' }),
  dismissBrowser: jest.fn().mockResolvedValue(undefined),
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'success', url: 'https://example.com' }),
  warmUpAsync: jest.fn().mockResolvedValue(undefined),
  coolDownAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock Expo Auth Session
jest.mock('expo-auth-session', () => ({
  AuthRequest: jest.fn(),
  AuthSession: {
    useAuthRequest: jest.fn(() => [
      { params: {}, url: null },
      { type: 'success', params: {} },
      jest.fn(),
    ]),
    makeRedirectUri: jest.fn(() => 'https://example.com/redirect'),
    dismiss: jest.fn(),
    getDefaultReturnUrl: jest.fn(() => 'https://example.com/return'),
  },
  ResponseType: {
    Code: 'code',
    Token: 'token',
    IdToken: 'id_token',
  },
  Prompt: {
    None: 'none',
    Login: 'login',
    Consent: 'consent',
    SelectAccount: 'select_account',
  },
}));

// Mock Expo Crypto
jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn((byteCount) => new Uint8Array(byteCount)),
  getRandomBytesAsync: jest.fn(async (byteCount) => new Uint8Array(byteCount)),
  randomUUID: jest.fn(() => 'mock-uuid-1234'),
  digestStringAsync: jest.fn(async (algorithm, data) => 'mock-hash'),
  CryptoDigestAlgorithm: {
    SHA1: 'SHA-1',
    SHA256: 'SHA-256',
    SHA384: 'SHA-384',
    SHA512: 'SHA-512',
    MD2: 'MD2',
    MD4: 'MD4',
    MD5: 'MD5',
  },
  CryptoEncoding: {
    HEX: 'hex',
    BASE64: 'base64',
  },
}));

// Mock React Native Screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(),
  Screen: ({ children }: any) => children,
  ScreenContainer: ({ children }: any) => children,
  NativeScreen: ({ children }: any) => children,
  NativeScreenContainer: ({ children }: any) => children,
  ScreenStack: ({ children }: any) => children,
  ScreenStackHeaderConfig: ({ children }: any) => children,
  ScreenStackHeaderSubview: ({ children }: any) => children,
  ScreenStackHeaderLeftView: ({ children }: any) => children,
  ScreenStackHeaderRightView: ({ children }: any) => children,
  ScreenStackHeaderCenterView: ({ children }: any) => children,
  ScreenStackHeaderBackButtonImage: ({ children }: any) => children,
}));

// Mock Tamagui
jest.mock('@tamagui/core', () => ({
  Stack: 'Stack',
  Text: 'Text',
  Button: 'Button',
  Input: 'Input',
  XStack: 'XStack',
  YStack: 'YStack',
  ZStack: 'ZStack',
  Separator: 'Separator',
  Spacer: 'Spacer',
  Theme: ({ children }: any) => children,
  useTheme: () => ({}),
  useMedia: () => ({}),
  createTamagui: jest.fn(),
  createTokens: jest.fn(),
  createThemes: jest.fn(),
  TamaguiProvider: ({ children }: any) => children,
}));

jest.mock('tamagui', () => ({
  ...jest.requireMock('@tamagui/core'),
  Card: 'Card',
  CardHeader: 'CardHeader',
  CardFooter: 'CardFooter',
  CardFrame: 'CardFrame',
  CardBackground: 'CardBackground',
  Label: 'Label',
  Switch: 'Switch',
  RadioGroup: 'RadioGroup',
  Checkbox: 'Checkbox',
  Select: 'Select',
  Sheet: 'Sheet',
  Dialog: 'Dialog',
  Popover: 'Popover',
  Tooltip: 'Tooltip',
  Progress: 'Progress',
  Slider: 'Slider',
  Form: 'Form',
  Fieldset: 'Fieldset',
  Avatar: 'Avatar',
  Image: 'Image',
  ListItem: 'ListItem',
  Tabs: 'Tabs',
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  H5: 'H5',
  H6: 'H6',
  Paragraph: 'Paragraph',
  SizableText: 'SizableText',
  Anchor: 'Anchor',
}));

// Global test setup
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: async () => ({}),
    text: async () => '',
    blob: async () => new Blob(),
    clone: jest.fn(),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic',
    url: '',
  } as Response)
);

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();

// Mock window
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Restore console after all tests
afterAll(() => {
  global.console = originalConsole;
});