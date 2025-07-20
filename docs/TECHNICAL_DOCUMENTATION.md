# StyleAI - Documentation Technique Complète

## Vue d'ensemble

StyleAI est une application mobile React Native développée avec Expo, utilisant l'intelligence artificielle pour fournir des recommandations de style personnalisées. L'application suit les principes de Clean Architecture et Domain-Driven Design.

## Architecture

### Structure du Projet

```
StyleAI/
├── src/
│   ├── core/                 # Code fondamental partagé
│   │   ├── config/          # Configuration de l'application
│   │   ├── errors/          # Gestion d'erreurs centralisée
│   │   ├── types/           # Types TypeScript partagés
│   │   └── utils/           # Utilitaires communs
│   ├── features/            # Modules métier organisés par domaine
│   │   ├── identity/        # Authentification et gestion utilisateur
│   │   ├── wardrobe/        # Gestion de la garde-robe
│   │   ├── styling/         # Recommandations et analyse de style
│   │   ├── analytics/       # Suivi et métriques
│   │   └── billing/         # Gestion des abonnements
│   ├── navigation/          # Configuration de navigation
│   ├── shared/             # Composants et utilitaires partagés
│   ├── store/              # Gestion d'état globale (Zustand)
│   └── screens/            # Écrans de l'application
├── e2e/                    # Tests end-to-end (Detox)
├── __tests__/              # Tests unitaires et d'intégration
├── firebase/               # Configuration Firebase
└── docs/                   # Documentation
```

### Clean Architecture par Feature

Chaque feature suit la structure Clean Architecture :

```
feature/
├── application/            # Cas d'usage et services applicatifs
│   ├── services/          # Services de l'application
│   └── use-cases/         # Cas d'usage métier
├── domain/                # Logique métier pure
│   ├── entities/          # Entités métier
│   ├── repositories/      # Interfaces de repositories
│   ├── services/          # Services de domaine
│   └── value-objects/     # Objets valeur
├── infrastructure/        # Implémentations techniques
│   ├── repositories/      # Implémentations des repositories
│   ├── services/          # Services externes (API, Firebase)
│   └── mappers/           # Mappers de données
└── presentation/          # Interface utilisateur
    ├── components/        # Composants React
    ├── hooks/             # Hooks React personnalisés
    └── screens/           # Écrans spécifiques à la feature
```

## Technologies Principales

### Frontend
- **React Native 0.79.5** : Framework mobile multiplateforme
- **Expo ~53.0.17** : Plateforme de développement React Native
- **TypeScript** : Typage statique
- **Tamagui** : Système de design et composants UI
- **React Navigation** : Navigation entre écrans
- **React Hook Form + Zod** : Gestion et validation des formulaires
- **React Native Reanimated** : Animations performantes

### State Management
- **Zustand** : Gestion d'état légère et performante
- **Immer** : Mutations immutables
- **AsyncStorage** : Persistance locale

### Backend & Services
- **Firebase** : Backend-as-a-Service
  - **Authentication** : Gestion des utilisateurs
  - **Firestore** : Base de données NoSQL
  - **Storage** : Stockage de fichiers
- **Google Gemini AI** : Analyse d'images et recommandations de style

### Tests
- **Jest** : Framework de tests
- **React Native Testing Library** : Tests de composants
- **Detox** : Tests E2E
- **Firebase Emulator** : Tests d'intégration

### DevOps & Outils
- **ESLint + Prettier** : Qualité du code
- **Husky** : Git hooks
- **Semantic Release** : Versioning automatique
- **GitHub Actions** : CI/CD

## Configuration de l'Environnement

### Variables d'Environnement

Créez les fichiers `.env` suivants :

#### `.env.development`
```bash
ENVIRONMENT=development
FIREBASE_API_KEY=your_dev_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_dev_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_dev_project_id
FIREBASE_STORAGE_BUCKET=your_dev_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
FIREBASE_APP_ID=your_dev_app_id
GEMINI_API_KEY=your_gemini_api_key
API_BASE_URL=https://api.dev.styleai.com
ENABLE_AI_FEATURES=true
DEBUG_MODE=true
```

#### `.env.production`
```bash
ENVIRONMENT=production
FIREBASE_API_KEY=your_prod_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_prod_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_prod_project_id
FIREBASE_STORAGE_BUCKET=your_prod_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
FIREBASE_APP_ID=your_prod_app_id
GEMINI_API_KEY=your_prod_gemini_api_key
API_BASE_URL=https://api.styleai.com
ENABLE_AI_FEATURES=true
DEBUG_MODE=false
```

## Installation et Configuration

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI
- Android Studio (pour Android)
- Xcode (pour iOS)

### Installation
```bash
# Cloner le repository
git clone https://github.com/your-org/styleai.git
cd styleai

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.development
# Éditer .env.development avec vos clés

# Démarrer le serveur de développement
npm run dev
```

### Configuration Firebase

1. Créer un projet Firebase
2. Activer Authentication, Firestore, et Storage
3. Configurer les règles de sécurité
4. Télécharger les fichiers de configuration
5. Mettre à jour les variables d'environnement

### Configuration Gemini AI

1. Obtenir une clé API Google AI Studio
2. Activer l'API Gemini
3. Configurer les quotas et limites
4. Ajouter la clé dans les variables d'environnement

## Gestion d'État

### Architecture Zustand

L'application utilise Zustand avec une architecture modulaire par slices :

```typescript
// Store principal
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createAuthSlice(...args),
        ...createUserSlice(...args),
        ...createWardrobeSlice(...args),
        ...createStyleSlice(...args),
        ...createAppSlice(...args),
      })),
      {
        name: 'styleai-store',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  )
);
```

### Slices Disponibles

- **AuthSlice** : État d'authentification
- **UserSlice** : Profil utilisateur et préférences
- **WardrobeSlice** : Articles de garde-robe
- **StyleSlice** : Analyses et recommandations
- **AppSlice** : État global de l'application
- **OnboardingSlice** : Processus d'onboarding

## API et Services

### Services Firebase

#### Authentication Service
```typescript
class FirebaseAuthService {
  async signInWithEmail(email: string, password: string): Promise<Result<User>>
  async signUp(email: string, password: string): Promise<Result<User>>
  async signOut(): Promise<Result<void>>
  async resetPassword(email: string): Promise<Result<void>>
  async signInWithGoogle(): Promise<Result<User>>
}
```

#### Firestore Service
```typescript
class FirebaseUserRepository implements IUserRepository {
  async save(user: User): Promise<Result<void>>
  async findById(id: UserId): Promise<Result<User>>
  async findByEmail(email: Email): Promise<Result<User>>
  async delete(id: UserId): Promise<Result<void>>
}
```

### Services IA

#### Analyse de Style
```typescript
class GeminiStyleAnalysisService {
  async analyzeStyle(imageUrl: string): Promise<Result<StyleAnalysis>>
  async analyzeStyleWithContext(
    imageUrl: string, 
    context: StyleContext
  ): Promise<Result<StyleAnalysis>>
}
```

#### Catégorisation de Vêtements
```typescript
class GeminiClothingCategorizationService {
  async categorizeClothing(imageUrl: string): Promise<Result<ClothingCategorization>>
  async extractAttributes(imageUrl: string): Promise<Result<ClothingAttributes>>
}
```

## Tests

### Structure des Tests

```
__tests__/
├── unit/                   # Tests unitaires
│   ├── core/              # Tests du core
│   └── features/          # Tests par feature
├── integration/           # Tests d'intégration
│   ├── firebase-integration.test.ts
│   ├── gemini-integration.test.ts
│   └── performance.test.ts
└── e2e/                   # Tests end-to-end
    ├── onboarding.test.js
    ├── authentication.test.js
    ├── wardrobe.test.js
    ├── styling.test.js
    └── navigation.test.js
```

### Commandes de Test

```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests d'intégration
npm run test:integration

# Tests E2E iOS
npm run e2e:ios

# Tests E2E Android
npm run e2e:android

# Tous les tests
npm run test:all
```

### Configuration Jest

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|react-navigation|@react-navigation|tamagui)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Déploiement

### Build de Production

```bash
# Build Expo
npm run build

# Build natif iOS
npm run build:ios

# Build natif Android
npm run build:android
```

### CI/CD Pipeline

Le pipeline GitHub Actions inclut :

1. **Tests automatiques** : Unitaires, intégration, E2E
2. **Quality checks** : ESLint, Prettier, TypeScript
3. **Security scan** : Audit des dépendances
4. **Build validation** : Vérification des builds
5. **Deployment** : Publication automatique

### Configuration EAS

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "development": true,
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

## Sécurité

### Authentification et Autorisation

- JWT tokens avec refresh automatique
- OAuth2 avec Google
- Validation côté client et serveur
- Chiffrement des données sensibles

### Règles Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clothing items are user-specific
    match /clothingItems/{itemId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Règles Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Performance

### Optimisations Implémentées

- **Lazy loading** des composants
- **Virtualisation** des listes
- **Cache intelligent** des images
- **Compression** des assets
- **Bundle splitting** par plateforme
- **Offline-first** avec synchronisation

### Métriques de Performance

- **Bundle size** : < 10MB par plateforme
- **Cold start** : < 3 secondes
- **Navigation** : < 100ms entre écrans
- **API calls** : < 2 secondes
- **Image analysis** : < 15 secondes

## Monitoring et Analytics

### Crash Reporting

Intégration avec Firebase Crashlytics pour le suivi des erreurs :

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// Log d'erreur personnalisé
crashlytics().log('User action performed');

// Enregistrement d'erreur
crashlytics().recordError(new Error('Something went wrong'));
```

### Analytics

Suivi des événements utilisateur :

```typescript
import analytics from '@react-native-firebase/analytics';

// Événement personnalisé
await analytics().logEvent('style_analysis_completed', {
  analysis_type: 'photo',
  processing_time: 3.2,
  confidence_score: 0.85
});
```

## Troubleshooting

### Problèmes Courants

#### 1. Erreurs de Build

```bash
# Clean et rebuild
npm run clean
npm install
npm run build
```

#### 2. Problèmes Firebase

```bash
# Vérifier la configuration
npx firebase-tools use --add
npx firebase-tools projects:list
```

#### 3. Erreurs Metro

```bash
# Reset Metro cache
npx expo start --clear
```

#### 4. Problèmes iOS

```bash
# Clean iOS build
cd ios && rm -rf build && cd ..
npx expo run:ios
```

## API Reference

### Core Types

```typescript
// Résultat d'opération
type Result<T> = {
  succeeded: boolean;
  value?: T;
  error?: Error;
  message: string;
};

// Entité utilisateur
interface User {
  id: UserId;
  email: Email;
  profile: UserProfile;
  preferences: UserPreferences;
}

// Article de garde-robe
interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  size: string;
  brand?: string;
  tags: string[];
  imageUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analyse de style
interface StyleAnalysis {
  id: string;
  imageUrl: string;
  dominantColors: string[];
  styleCategories: string[];
  confidence: number;
  recommendations: string[];
  processingTime: number;
  createdAt: Date;
}
```

### Hooks Utilitaires

```typescript
// Hook d'authentification
const { user, login, logout, isLoading } = useAuth();

// Hook de garde-robe
const { items, addItem, removeItem, updateItem } = useWardrobe();

// Hook de style
const { analyzeStyle, getRecommendations } = useStyleAnalysis();
```

## Contribution

### Workflow de Développement

1. Fork du repository
2. Création d'une branche feature
3. Développement avec tests
4. Pull request avec review
5. Merge après validation

### Standards de Code

- **TypeScript strict** activé
- **ESLint** + **Prettier** configurés
- **Conventional Commits** pour les messages
- **Tests** obligatoires pour les nouvelles features
- **Documentation** à jour

### Checklist Pull Request

- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Code coverage > 80%
- [ ] ESLint sans erreurs
- [ ] TypeScript sans erreurs
- [ ] Documentation mise à jour
- [ ] Changelog mis à jour

## Roadmap

### Version 1.1 (Q2 2024)
- [ ] Mode hors ligne complet
- [ ] Partage de tenues sur réseaux sociaux
- [ ] Intégration avec e-commerce
- [ ] Recommandations météo avancées

### Version 1.2 (Q3 2024)
- [ ] IA de reconnaissance de marques
- [ ] Planificateur de tenues
- [ ] Statistiques d'utilisation détaillées
- [ ] Mode collaboratif (famille/amis)

### Version 2.0 (Q4 2024)
- [ ] Web app complémentaire
- [ ] API publique pour partenaires
- [ ] Marketplace de stylistes
- [ ] AR/VR pour essayage virtuel

---

**Contact** : Pour toute question technique, contactez l'équipe de développement à dev@styleai.com