# Guide de Dépannage StyleAI

## Vue d'ensemble

Ce guide contient les solutions aux problèmes les plus courants rencontrés lors du développement, des tests et du déploiement de StyleAI.

## Problèmes de Développement

### 1. Erreurs d'Installation

#### Problème : `npm install` échoue avec des erreurs de peer dependencies
```bash
npm ERR! peer dep missing: react@^18.0.0
```

**Solutions :**
```bash
# Option 1: Utiliser --legacy-peer-deps
npm install --legacy-peer-deps

# Option 2: Utiliser --force (moins recommandé)
npm install --force

# Option 3: Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

#### Problème : Erreurs de certificat SSL lors de l'installation
```bash
npm ERR! certificate verify failed
```

**Solutions :**
```bash
# Temporairement désactiver SSL (développement uniquement)
npm config set strict-ssl false

# Ou configurer le certificat d'entreprise
npm config set cafile /path/to/corporate-cert.pem
```

### 2. Erreurs Metro Bundler

#### Problème : Metro ne trouve pas les modules
```bash
error: bundling failed: Error: Unable to resolve module
```

**Solutions :**
```bash
# Nettoyer le cache Metro
npx expo start --clear

# Réinitialiser complètement
npx expo start --clear --reset-cache

# Vérifier la configuration Metro
npx expo customize metro.config.js
```

#### Problème : Erreurs de transformation TypeScript
```bash
error: bundling failed: Error: Cannot read property 'typescript' of undefined
```

**Solutions :**
```bash
# Vérifier la configuration TypeScript
npx tsc --noEmit

# Nettoyer et rebuilder
rm -rf .expo
npx expo start --clear

# Vérifier metro.config.js
module.exports = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-typescript-transformer'),
  },
};
```

### 3. Problèmes de Build

#### Problème : Build Expo échoue avec des erreurs de dépendances
```bash
Error: Package "@tamagui/lucide-icons" not found
```

**Solution :**
```bash
# Installer la dépendance manquante
npm install @expo/vector-icons

# Remplacer les imports problématiques
# Dans vos fichiers, remplacer :
# import { Icon } from '@tamagui/lucide-icons';
# Par :
# import { Ionicons } from '@expo/vector-icons';
```

#### Problème : Erreurs de build Android
```bash
error Failed to install the app. Make sure you have the Android development environment set up
```

**Solutions :**
```bash
# Vérifier Android SDK
echo $ANDROID_HOME
ls $ANDROID_HOME/platforms

# Vérifier Java version
java -version
# Doit être Java 11 ou 17

# Nettoyer le projet Android
cd android
./gradlew clean
cd ..
npx expo run:android
```

## Problèmes Firebase

### 1. Configuration Firebase

#### Problème : Firebase not initialized
```bash
Error: Firebase: No Firebase App '[DEFAULT]' has been created
```

**Solutions :**
```typescript
// Vérifier l'initialisation dans App.tsx
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './src/core/config/firebase';

const app = initializeApp(firebaseConfig);

// Ou utiliser le hook d'initialisation
import { AuthInitializer } from './src/features/identity/infrastructure/AuthInitializer';

// Dans votre App component
<AuthInitializer>
  <YourAppContent />
</AuthInitializer>
```

#### Problème : Clés API Firebase invalides
```bash
Error: Firebase: Error (auth/invalid-api-key)
```

**Solutions :**
```bash
# Vérifier les variables d'environnement
echo $FIREBASE_API_KEY

# Créer le fichier .env si manquant
cp .env.example .env.development

# Mettre à jour avec les bonnes clés depuis Firebase Console
```

### 2. Authentification Firebase

#### Problème : Google Sign-In ne fonctionne pas
```bash
Error: GoogleSignin configuration error
```

**Solutions :**
```typescript
// Vérifier la configuration Google Sign-In
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'your-web-client-id.googleusercontent.com',
  offlineAccess: true,
});

// Vérifier que le webClientId correspond à celui de Firebase Console
```

#### Problème : Erreurs de permissions Firestore
```bash
Error: Missing or insufficient permissions
```

**Solutions :**
```javascript
// Vérifier les règles Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

// Redéployer les règles
firebase deploy --only firestore:rules
```

### 3. Firebase Storage

#### Problème : Upload d'images échoue
```bash
Error: Firebase Storage: User does not have permission to access object
```

**Solutions :**
```javascript
// Vérifier les règles Storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

// Code TypeScript pour l'upload
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadImage = async (file: Blob, userId: string) => {
  const storageRef = ref(storage, `users/${userId}/images/${Date.now()}.jpg`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};
```

## Problèmes AI/Gemini

### 1. Configuration Gemini

#### Problème : API Gemini inaccessible
```bash
Error: 403 Forbidden - API key not valid
```

**Solutions :**
```bash
# Vérifier la clé API
echo $GEMINI_API_KEY

# Tester l'API directement
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models

# Vérifier les quotas dans Google Cloud Console
```

#### Problème : Analyse d'image échoue
```bash
Error: Image format not supported
```

**Solutions :**
```typescript
// Vérifier le format d'image
const validateImageFormat = (imageUri: string): boolean => {
  const validFormats = ['jpg', 'jpeg', 'png', 'webp'];
  const extension = imageUri.split('.').pop()?.toLowerCase();
  return validFormats.includes(extension || '');
};

// Convertir en base64 si nécessaire
const convertToBase64 = async (imageUri: string): Promise<string> => {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};
```

### 2. Performance IA

#### Problème : Analyse trop lente
```bash
// Analyse prend > 30 secondes
```

**Solutions :**
```typescript
// Optimiser la taille d'image
const optimizeImage = async (imageUri: string): Promise<string> => {
  const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
  
  const result = await manipulateAsync(
    imageUri,
    [{ resize: { width: 800 } }], // Redimensionner à 800px de largeur
    { compress: 0.8, format: SaveFormat.JPEG }
  );
  
  return result.uri;
};

// Ajouter un timeout
const analyzeWithTimeout = async (imageUri: string): Promise<StyleAnalysis> => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 20000)
  );
  
  return Promise.race([
    styleAnalysisService.analyzeStyle(imageUri),
    timeout
  ]);
};
```

## Problèmes de Tests

### 1. Tests Unitaires

#### Problème : Jest ne trouve pas les modules
```bash
Cannot find module '@/components/Button'
```

**Solutions :**
```javascript
// Vérifier jest.config.js
module.exports = {
  preset: 'react-native',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo)/)'
  ],
};

// Ou dans package.json
"jest": {
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

#### Problème : Tests Firebase échouent
```bash
Error: Firebase Auth is not initialized
```

**Solutions :**
```typescript
// Créer un mock Firebase pour les tests
// __mocks__/firebase.ts
export const auth = {
  currentUser: { uid: 'test-user-id' },
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

export const firestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(),
      get: jest.fn(),
    })),
  })),
};
```

### 2. Tests E2E (Detox)

#### Problème : Detox ne trouve pas l'app
```bash
Error: Cannot connect to the app
```

**Solutions :**
```bash
# Vérifier la configuration Detox
cat .detoxrc.js

# Rebuilder l'app pour Detox
npx detox build --configuration ios.sim.debug

# Démarrer l'émulateur/simulateur manuellement
npx react-native run-ios --simulator="iPhone 14 Pro"

# Puis lancer les tests
npx detox test --configuration ios.sim.debug
```

#### Problème : Tests E2E instables
```bash
Error: Element not found after timeout
```

**Solutions :**
```javascript
// Augmenter les timeouts
await waitFor(element(by.text('Welcome')))
  .toBeVisible()
  .withTimeout(10000);

// Ajouter des waitFor systématiquement
await element(by.text('Login')).tap();
await waitFor(element(by.text('Dashboard'))).toBeVisible();

// Utiliser des testID uniques
<Button testID="login-button">Login</Button>
await element(by.id('login-button')).tap();
```

## Problèmes de Performance

### 1. Lenteur de l'Application

#### Problème : Démarrage lent
```bash
// App prend > 5 secondes à démarrer
```

**Solutions :**
```typescript
// Lazy loading des composants
const HomeScreen = React.lazy(() => import('./screens/HomeScreen'));
const WardrobeScreen = React.lazy(() => import('./screens/WardrobeScreen'));

// Suspense wrapper
<Suspense fallback={<LoadingScreen />}>
  <HomeScreen />
</Suspense>

// Optimiser les imports
// Au lieu de :
import * as Icons from '@expo/vector-icons';
// Utiliser :
import { Ionicons } from '@expo/vector-icons';
```

#### Problème : Navigation lente
```bash
// Navigation entre écrans > 1 seconde
```

**Solutions :**
```typescript
// Utiliser React.memo pour les écrans
const HomeScreen = React.memo(() => {
  // Contenu du composant
});

// Optimiser les listes avec FlatList
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### 2. Problèmes Mémoire

#### Problème : Memory leaks
```bash
// Utilisation mémoire augmente constamment
```

**Solutions :**
```typescript
// Nettoyer les listeners dans useEffect
useEffect(() => {
  const unsubscribe = firestore()
    .collection('items')
    .onSnapshot(handleSnapshot);
  
  return () => unsubscribe(); // Important !
}, []);

// Utiliser useCallback pour les fonctions stables
const handlePress = useCallback((id: string) => {
  // Action
}, []);

// Optimiser les images
<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
  // Ajouter une taille fixe pour éviter les re-calculs
/>
```

## Problèmes de Build Production

### 1. Build Expo échoue

#### Problème : Erreurs de minification
```bash
Error: Unexpected token in JSON
```

**Solutions :**
```javascript
// Vérifier metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter la minification
config.transformer.minifierConfig = {
  ecma: 8,
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
```

#### Problème : Assets manquants dans le build
```bash
Error: Asset not found: ./assets/image.png
```

**Solutions :**
```javascript
// Vérifier app.json
{
  "expo": {
    "assetBundlePatterns": [
      "**/*"
    ]
  }
}

// Ou importer explicitement les assets
const icon = require('./assets/icon.png');
<Image source={icon} />
```

### 2. Déploiement Store

#### Problème : Rejet App Store
```bash
Error: Missing required icon sizes
```

**Solutions :**
```javascript
// Générer toutes les tailles d'icônes requises
npx expo install expo-app-icon-utils
npx expo-app-icon-utils generate

// Vérifier app.json
{
  "expo": {
    "icon": "./assets/icon.png", // 1024x1024
    "ios": {
      "icon": "./assets/ios-icon.png"
    },
    "android": {
      "icon": "./assets/android-icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

## Problèmes de Développement Spécifiques

### 1. Tamagui Issues

#### Problème : Styles Tamagui ne s'appliquent pas
```bash
// Composants sans styles
```

**Solutions :**
```typescript
// Vérifier le TamaguiProvider
import { TamaguiProvider } from '@tamagui/core';
import config from './tamagui.config';

function App() {
  return (
    <TamaguiProvider config={config}>
      <YourApp />
    </TamaguiProvider>
  );
}

// Vérifier tamagui.config.ts
import { createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config/v3';

const tamaguiConfig = createTamagui(config);

export default tamaguiConfig;
```

### 2. Zustand Store Issues

#### Problème : État ne se met pas à jour
```bash
// Actions Zustand ne déclenchent pas de re-render
```

**Solutions :**
```typescript
// Vérifier l'immutabilité avec Immer
import { produce } from 'immer';

const useStore = create<State>()(
  immer((set) => ({
    items: [],
    addItem: (item) => set((state) => {
      state.items.push(item); // Immer gère l'immutabilité
    }),
  }))
);

// Utiliser les selectors pour optimiser
const items = useStore(state => state.items);
const addItem = useStore(state => state.addItem);
```

## Outils de Diagnostic

### 1. Commandes Utiles

```bash
# Diagnostiquer les problèmes Expo
npx expo doctor

# Analyser le bundle
npx expo export --dump-assetmap

# Vérifier la configuration Metro
npx expo customize metro.config.js

# Analyser les performances
npx react-native perf-monitor

# Nettoyer complètement
rm -rf node_modules .expo android/build ios/build
npm install
```

### 2. Scripts de Debug

```bash
#!/bin/bash
# debug-script.sh

echo "🔍 Diagnostic StyleAI"

# Vérifier l'environnement
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Expo CLI version: $(npx expo --version)"

# Vérifier les variables d'environnement
echo "Environment: $NODE_ENV"
echo "Firebase Project: $FIREBASE_PROJECT_ID"

# Tester la connectivité
curl -s https://api.gemini.com/health || echo "❌ Gemini API inaccessible"
curl -s https://firebase.googleapis.com || echo "❌ Firebase inaccessible"

# Vérifier les dépendances critiques
npm ls react-native expo firebase
```

### 3. Logs de Debug

```typescript
// Logger personnalisé pour le debug
class Logger {
  static debug(message: string, data?: any) {
    if (__DEV__) {
      console.log(`🐛 [DEBUG] ${message}`, data);
    }
  }
  
  static error(message: string, error?: Error) {
    console.error(`❌ [ERROR] ${message}`, error);
    
    // En production, envoyer à Crashlytics
    if (!__DEV__) {
      crashlytics().recordError(error || new Error(message));
    }
  }
}

// Utilisation
Logger.debug('User login attempt', { email: user.email });
Logger.error('Firebase connection failed', error);
```

## Contact Support

### Escalation des Problèmes

1. **Problèmes de développement** : Consulter ce guide
2. **Bugs confirmés** : Créer une issue GitHub
3. **Problèmes de production** : Contact d'urgence ops@styleai.com
4. **Questions techniques** : Slack #dev-help

### Informations à Fournir

Lors de la demande d'aide, inclure :
- Version de l'application
- Plateforme (iOS/Android/Web)
- Étapes pour reproduire
- Messages d'erreur complets
- Logs détaillés
- Configuration environnement

---

**Dernière mise à jour** : Ce guide est mis à jour régulièrement. Vérifiez la version la plus récente sur le repository GitHub.