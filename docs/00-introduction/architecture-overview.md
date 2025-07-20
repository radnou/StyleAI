# Architecture Overview - StyleAI

## 🏗️ Vue d'ensemble architecturale

StyleAI suit une architecture **Domain-Driven Design (DDD)** combinée aux principes de **Clean Architecture**. Cette approche garantit un code maintenable, testable et évolutif.

## 📐 Principes architecturaux

### 1. Séparation des responsabilités
Chaque couche a une responsabilité claire et ne dépend que des couches inférieures.

### 2. Inversion de dépendance
Les couches hautes ne dépendent pas des détails d'implémentation des couches basses.

### 3. Testabilité
Chaque composant peut être testé indépendamment grâce à l'injection de dépendances.

### 4. Domain-First
La logique métier est au centre, indépendante des frameworks et technologies.

## 🎯 Structure en couches

```
┌─────────────────────────────────────────┐
│             Presentation                │  ← React Native, Navigation, UI
├─────────────────────────────────────────┤
│             Application                 │  ← Use Cases, Services, Hooks
├─────────────────────────────────────────┤
│               Domain                    │  ← Entities, Value Objects, Rules
├─────────────────────────────────────────┤
│            Infrastructure               │  ← Firebase, External APIs, Storage
└─────────────────────────────────────────┘
```

## 🏢 Organisation par features

Chaque feature (module métier) suit la même structure :

```
features/identity/
├── domain/           # Logique métier pure
│   ├── entities/     # Objets métier principaux
│   ├── value-objects/# Objets valeur immutables
│   ├── repositories/ # Interfaces de persistance
│   └── events/       # Événements métier
├── application/      # Orchestration des use cases
│   ├── use-cases/    # Cas d'utilisation
│   └── services/     # Services applicatifs
├── infrastructure/   # Implémentation technique
│   ├── repositories/ # Implémentation Firebase
│   ├── services/     # Services externes
│   └── mappers/      # Transformation des données
└── presentation/     # Interface utilisateur
    ├── screens/      # Écrans React Native
    ├── components/   # Composants UI
    └── hooks/        # Hooks React
```

## 🔄 Flux de données

### 1. User Interaction
```
User Action → Screen → Hook → Use Case
```

### 2. Data Flow
```
Use Case → Repository Interface → Infrastructure Repository → Firebase
```

### 3. State Management
```
Use Case → Store (Zustand) → Components → UI Update
```

## 🏭 Modules métier (Bounded Contexts)

### Identity Context
**Responsabilité** : Gestion des utilisateurs et authentification
```typescript
// Domain
class User {
  constructor(
    private id: UserId,
    private email: Email,
    private profile: UserProfile
  ) {}
}

// Application
class AuthenticateUser {
  async execute(credentials: LoginCredentials): Promise<Result<User>> {
    // Logique d'authentification
  }
}

// Infrastructure
class FirebaseUserRepository implements IUserRepository {
  async findByEmail(email: Email): Promise<User | null> {
    // Implémentation Firebase
  }
}
```

### Styling Context
**Responsabilité** : Conseils de style et IA
```typescript
// Domain
class StyleRecommendation {
  constructor(
    private outfits: Outfit[],
    private confidence: ConfidenceScore,
    private reasoning: string
  ) {}
}

// Application
class GenerateStyleAdvice {
  async execute(request: StyleRequest): Promise<StyleRecommendation> {
    // Orchestration IA et règles métier
  }
}
```

### Wardrobe Context
**Responsabilité** : Gestion de la garde-robe
```typescript
// Domain
class WardrobeItem {
  constructor(
    private id: ItemId,
    private category: Category,
    private colors: Color[],
    private metadata: ItemMetadata
  ) {}
}

// Application
class AddItemToWardrobe {
  async execute(item: WardrobeItemData): Promise<Result<WardrobeItem>> {
    // Validation et persistance
  }
}
```

## 🔧 Technologies par couche

### Presentation Layer
- **React Native** : Framework mobile
- **React Navigation** : Navigation native
- **Tamagui** : Système de design
- **React Hook Form** : Gestion de formulaires

### Application Layer
- **TypeScript** : Typage statique
- **Zustand** : Gestion d'état
- **React Hooks** : Logique réactive

### Domain Layer
- **Pure TypeScript** : Logique métier
- **Zod** : Validation de schémas
- **Value Objects** : Encapsulation des données

### Infrastructure Layer
- **Firebase Auth** : Authentification
- **Firestore** : Base de données
- **Google Gemini** : Intelligence artificielle
- **Expo** : Services natifs

## 📊 Patterns de communication

### 1. Repository Pattern
```typescript
interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}

class FirebaseUserRepository implements IUserRepository {
  // Implémentation concrète
}
```

### 2. Use Case Pattern
```typescript
class CreateUser {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(userData: CreateUserRequest): Promise<Result<User>> {
    // 1. Validation
    // 2. Logique métier
    // 3. Persistance
    // 4. Événements
  }
}
```

### 3. Command Query Separation
```typescript
// Commands (modification)
class UpdateUserProfile {
  async execute(command: UpdateProfileCommand): Promise<void> {}
}

// Queries (lecture)
class GetUserProfile {
  async execute(query: GetProfileQuery): Promise<UserProfile> {}
}
```

## 🧪 Stratégie de tests

### Tests par couche
```
Domain Tests     → Logic pure, Value Objects
Application Tests → Use Cases, Services
Infrastructure Tests → Repository implementations
Presentation Tests → Components, Screens, Hooks
```

### Types de tests
- **Unit Tests** : Logique isolée
- **Integration Tests** : Interaction entre couches
- **E2E Tests** : Parcours utilisateur complets

## 🚀 Avantages de cette architecture

### ✅ Maintenabilité
- Code organisé par responsabilité
- Faible couplage entre modules
- Évolution facilitée

### ✅ Testabilité
- Dépendances injectables
- Mocking simple
- Tests isolés

### ✅ Évolutivité
- Ajout de features sans régression
- Changement de technologie facilité
- Équipes multiples possibles

### ✅ Compréhension
- Structure prévisible
- Séparation claire des concepts
- Documentation vivante

## 🔄 Migration et évolution

### Ajout d'une nouvelle feature
1. Définir le domain model
2. Créer les use cases
3. Implémenter l'infrastructure
4. Développer la présentation
5. Écrire les tests

### Changement de technologie
- **Base de données** : Nouvelle implémentation du repository
- **UI Framework** : Nouvelle couche présentation
- **État** : Nouvelle implémentation du store

## 📚 Ressources pour approfondir

- [Clean Architecture - Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Prochaine étape** : Explorez le [parcours d'apprentissage](learning-path.md) pour une approche structurée de l'apprentissage de cette architecture.