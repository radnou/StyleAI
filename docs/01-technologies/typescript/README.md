# TypeScript - Code Robuste et Maintenable

## 🎯 Objectifs d'apprentissage

À la fin de ce module, vous saurez :
- Maîtriser TypeScript dans un contexte React Native
- Créer des types sûrs et expressifs
- Utiliser les patterns avancés de typage
- Valider et transformer les données

**Niveau** : 🟢 Débutant → 🔴 Avancé

## 🚀 Pourquoi TypeScript dans StyleAI ?

TypeScript apporte la sécurité de types à JavaScript, permettant de détecter les erreurs à la compilation plutôt qu'à l'exécution.

### Avantages pour StyleAI
```typescript
// Sans TypeScript - Erreurs potentielles à runtime
const analyzeStyle = (userImage, preferences) => {
  // userImage pourrait être null, undefined, ou pas une string
  // preferences pourrait avoir des propriétés manquantes
  return geminiAPI.analyze(userImage, preferences);
};

// Avec TypeScript - Erreurs détectées à la compilation
interface StyleAnalysisRequest {
  userImage: string;
  preferences: UserStylePreferences;
  analysisOptions?: AnalysisOptions;
}

const analyzeStyle = (request: StyleAnalysisRequest): Promise<StyleAnalysisResult> => {
  // Type safety garanti
  return geminiAPI.analyze(request.userImage, request.preferences);
};
```

## 🏗️ Configuration TypeScript

### tsconfig.json pour StyleAI
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "node",
    "allowJs": true,
    "jsx": "react-native",
    
    // Type checking stricte
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    // Module resolution
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    
    // Paths aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@navigation/*": ["./src/navigation/*"]
    },
    
    // Décorateurs (pour DI)
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*",
    "types/**/*",
    "__tests__/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

## 🧱 Types de base et avancés

### 1. Domain Types (Types métier)
```typescript
// src/core/types/domain.ts

// Value Objects
export type UserId = string & { readonly brand: unique symbol };
export type Email = string & { readonly brand: unique symbol };
export type ImageUrl = string & { readonly brand: unique symbol };

// Créateurs de types sûrs
export const UserId = (value: string): UserId => {
  if (!value || value.length < 3) {
    throw new Error('UserId invalide');
  }
  return value as UserId;
};

export const Email = (value: string): Email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error('Email invalide');
  }
  return value as Email;
};

// Entités principales
export interface User {
  readonly id: UserId;
  readonly email: Email;
  readonly profile: UserProfile;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserProfile {
  readonly firstName: string;
  readonly lastName: string;
  readonly avatar?: ImageUrl;
  readonly preferences: StylePreferences;
}

export interface StylePreferences {
  readonly colors: readonly Color[];
  readonly styles: readonly StyleType[];
  readonly occasions: readonly Occasion[];
  readonly budget: BudgetRange;
}

// Enums typés
export const Color = {
  BLACK: 'black',
  WHITE: 'white',
  NAVY: 'navy',
  GRAY: 'gray',
  BROWN: 'brown',
  BEIGE: 'beige',
} as const;
export type Color = typeof Color[keyof typeof Color];

export const StyleType = {
  CASUAL: 'casual',
  FORMAL: 'formal',
  BUSINESS: 'business',
  SPORTY: 'sporty',
  ELEGANT: 'elegant',
} as const;
export type StyleType = typeof StyleType[keyof typeof StyleType];
```

### 2. API Types (Types d'interface)
```typescript
// src/core/types/api.ts

// Result Pattern pour la gestion d'erreurs
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

export const Success = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

export const Failure = <E>(error: E): Failure<E> => ({
  success: false,
  error,
});

// API Request/Response types
export interface StyleAnalysisRequest {
  readonly imageUrl: ImageUrl;
  readonly userPreferences: StylePreferences;
  readonly analysisType: AnalysisType;
}

export interface StyleAnalysisResponse {
  readonly analysisId: string;
  readonly recommendations: readonly StyleRecommendation[];
  readonly confidence: number;
  readonly processingTime: number;
}

export interface StyleRecommendation {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly outfitItems: readonly OutfitItem[];
  readonly confidence: number;
  readonly reasoning: string;
}
```

### 3. Component Props Types
```typescript
// src/shared/components/types.ts

// Props génériques réutilisables
export interface BaseComponentProps {
  readonly testID?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export interface PressableComponentProps extends BaseComponentProps {
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly loading?: boolean;
}

// Props spécifiques aux composants StyleAI
export interface OutfitCardProps extends PressableComponentProps {
  readonly outfit: StyleRecommendation;
  readonly showConfidence?: boolean;
  readonly variant?: 'default' | 'compact' | 'detailed';
}

export interface UserAvatarProps extends BaseComponentProps {
  readonly user: User;
  readonly size?: 'small' | 'medium' | 'large';
  readonly showOnlineStatus?: boolean;
  readonly onPress?: () => void;
}

// Union types pour les variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type AlertType = 'info' | 'success' | 'warning' | 'error';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

## 🔍 Patterns TypeScript avancés

### 1. Conditional Types
```typescript
// Types conditionnels pour l'API
type APIResponse<T> = T extends string
  ? { message: T }
  : T extends object
  ? { data: T }
  : never;

// Extraction de types
type UserKeys = keyof User; // 'id' | 'email' | 'profile' | 'createdAt' | 'updatedAt'
type UserProfileKeys = keyof User['profile']; // 'firstName' | 'lastName' | 'avatar' | 'preferences'

// Pick et Omit pour créer des sous-types
type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserRequest = Partial<Pick<User, 'profile'>>;

// Mapped types
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K];
};
```

### 2. Generic Types et Constraints
```typescript
// Repository générique avec contraintes
interface Entity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<readonly T[]>;
  save(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Use Case générique
abstract class UseCase<TRequest, TResponse> {
  abstract execute(request: TRequest): Promise<Result<TResponse>>;
}

// Implémentation spécifique
class AnalyzeStyleUseCase extends UseCase<StyleAnalysisRequest, StyleAnalysisResponse> {
  constructor(
    private readonly geminiService: IGeminiService,
    private readonly userRepository: Repository<User>
  ) {
    super();
  }

  async execute(request: StyleAnalysisRequest): Promise<Result<StyleAnalysisResponse>> {
    try {
      const analysis = await this.geminiService.analyzeStyle(request);
      return Success(analysis);
    } catch (error) {
      return Failure(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
```

### 3. Template Literal Types
```typescript
// Types pour les routes de navigation
type Screen = 'Home' | 'Profile' | 'Styling' | 'Wardrobe';
type AuthScreen = 'Login' | 'Register' | 'ForgotPassword';

type AppRoute = `App/${Screen}`;
type AuthRoute = `Auth/${AuthScreen}`;
type Route = AppRoute | AuthRoute;

// Types pour les événements
type UserEvent = 'user:login' | 'user:logout' | 'user:update';
type StyleEvent = 'style:analyze' | 'style:save' | 'style:share';
type EventName = UserEvent | StyleEvent;

// Types pour les clés de stockage
type StorageKey = `styleai:${string}`;
const createStorageKey = (key: string): StorageKey => `styleai:${key}`;
```

## 🛡️ Validation avec Zod

### Schémas de validation
```typescript
// src/shared/validation/schemas.ts
import { z } from 'zod';

// Schémas de base
export const EmailSchema = z.string().email('Email invalide');
export const PasswordSchema = z.string()
  .min(8, 'Mot de passe trop court')
  .regex(/[A-Z]/, 'Doit contenir une majuscule')
  .regex(/[a-z]/, 'Doit contenir une minuscule')
  .regex(/[0-9]/, 'Doit contenir un chiffre');

// Schémas complexes
export const UserProfileSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  avatar: z.string().url().optional(),
  preferences: z.object({
    colors: z.array(z.enum(['black', 'white', 'navy', 'gray', 'brown', 'beige'])),
    styles: z.array(z.enum(['casual', 'formal', 'business', 'sporty', 'elegant'])),
    occasions: z.array(z.string()),
    budget: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).refine(data => data.max >= data.min, {
      message: 'Budget max doit être supérieur au min',
    }),
  }),
});

export const StyleAnalysisRequestSchema = z.object({
  imageUrl: z.string().url('URL d\'image invalide'),
  userPreferences: UserProfileSchema.shape.preferences,
  analysisType: z.enum(['outfit', 'color', 'style', 'complete']),
});

// Types inférés des schémas
export type UserProfileData = z.infer<typeof UserProfileSchema>;
export type StyleAnalysisRequestData = z.infer<typeof StyleAnalysisRequestSchema>;
```

### Validation Hook
```typescript
// src/shared/hooks/useValidation.ts
import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationState<T> {
  data: T | null;
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
}

export function useValidation<T>(schema: z.ZodSchema<T>) {
  const [state, setState] = useState<ValidationState<T>>({
    data: null,
    errors: {},
    isValid: false,
    isValidating: false,
  });

  const validate = useCallback(async (input: unknown): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const data = await schema.parseAsync(input);
      setState({
        data,
        errors: {},
        isValid: true,
        isValidating: false,
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);

        setState({
          data: null,
          errors,
          isValid: false,
          isValidating: false,
        });
      }
      return false;
    }
  }, [schema]);

  const reset = useCallback(() => {
    setState({
      data: null,
      errors: {},
      isValid: false,
      isValidating: false,
    });
  }, []);

  return {
    ...state,
    validate,
    reset,
  };
}
```

## 🔧 Utilitaires TypeScript

### 1. Type Guards
```typescript
// src/core/utils/typeGuards.ts

// Type guards pour les types primitifs
export const isString = (value: unknown): value is string => 
  typeof value === 'string';

export const isNumber = (value: unknown): value is number => 
  typeof value === 'number' && !isNaN(value);

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Type guards pour les types métier
export const isUser = (value: unknown): value is User => {
  return isObject(value) &&
    isString(value.id) &&
    isString(value.email) &&
    isObject(value.profile) &&
    value.createdAt instanceof Date;
};

export const isStyleRecommendation = (value: unknown): value is StyleRecommendation => {
  return isObject(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.description) &&
    Array.isArray(value.outfitItems) &&
    isNumber(value.confidence);
};

// Type guard générique
export function hasProperty<T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return isObject(obj) && prop in obj;
}
```

### 2. Assertion Functions
```typescript
// src/core/utils/assertions.ts

// Assertions pour valider les types
export function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error('Expected User object');
  }
}

export function assertIsNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error('Expected non-null value');
  }
}

// Assertion avec message personnalisé
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

// Usage dans le code
function processUser(userData: unknown) {
  assertIsUser(userData);
  // userData est maintenant typé comme User
  console.log(userData.email);
}
```

### 3. Utility Functions avec types
```typescript
// src/core/utils/helpers.ts

// Fonction pour créer des objets immutables
export function freeze<T extends object>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}

// Fonction pour merger des objets de façon type-safe
export function merge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  return { ...target, ...source };
}

// Fonction pour extraire des propriétés
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

// Fonction pour exclure des propriétés
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
```

## 📱 Exemples StyleAI complets

### 1. Service d'analyse de style typé
```typescript
// src/features/styling/application/services/StyleAnalysisService.ts
import { z } from 'zod';
import { Result, Success, Failure } from '@core/types';

interface IGeminiService {
  analyzeImage(imageUrl: string, options: AnalysisOptions): Promise<GeminiAnalysisResult>;
}

interface IStyleAnalysisService {
  analyzeUserStyle(request: StyleAnalysisRequest): Promise<Result<StyleAnalysisResponse>>;
}

export class StyleAnalysisService implements IStyleAnalysisService {
  constructor(
    private readonly geminiService: IGeminiService,
    private readonly userRepository: Repository<User>
  ) {}

  async analyzeUserStyle(
    request: StyleAnalysisRequest
  ): Promise<Result<StyleAnalysisResponse>> {
    try {
      // Validation d'entrée
      const validationResult = StyleAnalysisRequestSchema.safeParse(request);
      if (!validationResult.success) {
        return Failure(new Error('Données de requête invalides'));
      }

      // Récupération de l'utilisateur
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return Failure(new Error('Utilisateur non trouvé'));
      }

      // Analyse via Gemini
      const geminiResult = await this.geminiService.analyzeImage(
        request.imageUrl,
        {
          userPreferences: user.profile.preferences,
          analysisType: request.analysisType,
        }
      );

      // Transformation du résultat
      const response: StyleAnalysisResponse = {
        analysisId: generateId(),
        recommendations: geminiResult.recommendations.map(this.mapRecommendation),
        confidence: geminiResult.confidence,
        processingTime: geminiResult.processingTime,
      };

      return Success(response);
    } catch (error) {
      return Failure(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }

  private mapRecommendation(geminiRec: GeminiRecommendation): StyleRecommendation {
    return {
      id: generateId(),
      title: geminiRec.title,
      description: geminiRec.description,
      outfitItems: geminiRec.items.map(this.mapOutfitItem),
      confidence: geminiRec.confidence,
      reasoning: geminiRec.reasoning,
    };
  }

  private mapOutfitItem(geminiItem: GeminiItem): OutfitItem {
    return {
      id: generateId(),
      name: geminiItem.name,
      category: geminiItem.category,
      color: geminiItem.color,
      brand: geminiItem.brand,
      price: geminiItem.price,
      imageUrl: geminiItem.imageUrl,
    };
  }
}
```

### 2. Hook typé pour l'analyse
```typescript
// src/features/styling/presentation/hooks/useStyleAnalysis.ts
import { useState, useCallback } from 'react';
import { StyleAnalysisService } from '../application/services/StyleAnalysisService';

interface UseStyleAnalysisState {
  result: StyleAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useStyleAnalysis() {
  const [state, setState] = useState<UseStyleAnalysisState>({
    result: null,
    isLoading: false,
    error: null,
  });

  const analyzeStyle = useCallback(async (
    imageUrl: string,
    analysisType: AnalysisType = 'complete'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const service = new StyleAnalysisService(geminiService, userRepository);
      const result = await service.analyzeUserStyle({
        imageUrl,
        analysisType,
        userId: getCurrentUserId(), // Type-safe user ID
      });

      if (result.success) {
        setState({
          result: result.data,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error.message,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      result: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    analyzeStyle,
    reset,
  };
}
```

## 🚀 Exercices pratiques

### Exercice 1 : Types de garde-robe (45 min)
Créez un système de types complet pour la garde-robe :
- Entities : `WardrobeItem`, `Category`, `Outfit`
- Value Objects : `Color`, `Size`, `Brand`
- API Types : Requests/Responses
- Validation avec Zod

### Exercice 2 : Repository générique (60 min)
Implémentez un repository générique type-safe :
- Interface générique avec contraintes
- Implémentation Firebase
- Gestion d'erreurs typée
- Tests unitaires

### Exercice 3 : Form Handler typé (75 min)
Développez un gestionnaire de formulaires :
- Validation en temps réel
- Types inférés des schémas
- Gestion des erreurs
- Hook réutilisable

## 📚 Ressources pour approfondir

### Documentation officielle
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Zod Documentation](https://zod.dev/)

### Patterns TypeScript avancés
- **Conditional Types** : Types conditionnels
- **Mapped Types** : Transformation de types
- **Template Literal Types** : Types littéraux
- **Utility Types** : Types utilitaires

### Outils recommandés
- **ts-node** : Exécution TypeScript
- **tsc-watch** : Compilation en mode watch
- **type-coverage** : Couverture de types
- **typescript-eslint** : Linting TypeScript

---

**Prochaine étape** : Découvrez [Firebase et Backend-as-a-Service](../firebase/README.md) pour intégrer un backend robuste à votre application TypeScript.