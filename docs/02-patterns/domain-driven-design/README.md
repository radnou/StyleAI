# Domain-Driven Design - Modéliser le Métier

## 🎯 Objectifs d'apprentissage

À la fin de ce module, vous saurez :
- Comprendre les concepts fondamentaux de DDD
- Modéliser un domaine métier complexe
- Implémenter des Entities et Value Objects
- Structurer le code selon les bounded contexts

**Niveau** : 🟡 Intermédiaire → 🔴 Avancé

## 🏗️ Qu'est-ce que Domain-Driven Design ?

Domain-Driven Design (DDD) est une approche de développement logiciel qui place le domaine métier au centre de la conception. Dans StyleAI, cela signifie que notre code reflète directement les concepts du monde de la mode et du conseil en style.

### Problèmes résolus par DDD

```typescript
// ❌ Approche traditionnelle - Logique dispersée
const updateUserProfile = (userId: string, data: any) => {
  // Validation dans le controller
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Email invalide');
  }
  
  // Logique métier dans le service
  if (data.preferredColors && data.preferredColors.length > 10) {
    throw new Error('Trop de couleurs préférées');
  }
  
  // Persistance dans le repository
  return database.users.update(userId, data);
};

// ✅ Approche DDD - Domaine centralisé
const updateUserProfile = async (command: UpdateUserProfileCommand) => {
  const user = await userRepository.findById(command.userId);
  if (!user) throw new UserNotFoundError();
  
  // La logique métier est dans le domaine
  user.updateProfile(command.profile);
  
  await userRepository.save(user);
  return user;
};
```

## 🧩 Concepts fondamentaux

### 1. Entities (Entités)
Objets avec une identité unique qui persiste dans le temps.

```typescript
// src/features/identity/domain/entities/User.ts
import { UserId, Email, UserProfile } from '../value-objects';
import { DomainEvent } from '@core/domain';

export class User {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _profile: UserProfile,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _domainEvents: DomainEvent[] = []
  ) {}

  // Factory method pour la création
  static create(email: Email, profile: UserProfile): User {
    const user = new User(
      UserId.generate(),
      email,
      profile,
      new Date(),
      new Date()
    );

    // Événement de domaine
    user.addDomainEvent(new UserCreatedEvent(user.id, user.email));
    return user;
  }

  // Factory method pour la reconstitution (depuis DB)
  static reconstitute(
    id: UserId,
    email: Email,
    profile: UserProfile,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(id, email, profile, createdAt, updatedAt);
  }

  // Getters
  get id(): UserId { return this._id; }
  get email(): Email { return this._email; }
  get profile(): UserProfile { return this._profile; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Méthodes métier
  updateProfile(newProfile: UserProfile): void {
    this.ensureUserIsActive();
    
    const oldProfile = this._profile;
    this._profile = newProfile;
    this._updatedAt = new Date();

    this.addDomainEvent(new UserProfileUpdatedEvent(
      this.id,
      oldProfile,
      newProfile
    ));
  }

  changeEmail(newEmail: Email): void {
    this.ensureUserIsActive();
    
    if (this._email.equals(newEmail)) {
      return; // Pas de changement
    }

    const oldEmail = this._email;
    this._email = newEmail;
    this._updatedAt = new Date();

    this.addDomainEvent(new UserEmailChangedEvent(
      this.id,
      oldEmail,
      newEmail
    ));
  }

  // Règles métier
  canReceiveStyleAdvice(): boolean {
    return this._profile.isComplete() && this.isEmailVerified();
  }

  private ensureUserIsActive(): void {
    if (!this.isActive()) {
      throw new InactiveUserError(this.id);
    }
  }

  private isActive(): boolean {
    return true; // Logique d'activation
  }

  private isEmailVerified(): boolean {
    return true; // Logique de vérification email
  }

  // Gestion des événements de domaine
  getDomainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}
```

### 2. Value Objects (Objets-Valeur)
Objets immutables définis par leurs attributs plutôt que par leur identité.

```typescript
// src/features/identity/domain/value-objects/Email.ts
export class Email {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): Email {
    return new Email(value);
  }

  private validate(value: string): void {
    if (!value) {
      throw new InvalidEmailError('Email ne peut pas être vide');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new InvalidEmailError(`Email invalide: ${value}`);
    }

    if (value.length > 320) { // RFC 5321
      throw new InvalidEmailError('Email trop long');
    }
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  isFromDomain(domain: string): boolean {
    return this.getDomain().toLowerCase() === domain.toLowerCase();
  }

  // Value Objects sont comparés par valeur
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// src/features/identity/domain/value-objects/UserProfile.ts
export class UserProfile {
  private constructor(
    private readonly firstName: string,
    private readonly lastName: string,
    private readonly avatar: string | null,
    private readonly preferences: StylePreferences
  ) {
    this.validate();
  }

  static create(
    firstName: string,
    lastName: string,
    avatar: string | null = null,
    preferences: StylePreferences
  ): UserProfile {
    return new UserProfile(firstName, lastName, avatar, preferences);
  }

  private validate(): void {
    if (!this.firstName || this.firstName.trim().length < 2) {
      throw new InvalidUserProfileError('Prénom trop court');
    }
    
    if (!this.lastName || this.lastName.trim().length < 2) {
      throw new InvalidUserProfileError('Nom trop court');
    }
  }

  // Getters
  getFirstName(): string { return this.firstName; }
  getLastName(): string { return this.lastName; }
  getFullName(): string { return `${this.firstName} ${this.lastName}`; }
  getAvatar(): string | null { return this.avatar; }
  getPreferences(): StylePreferences { return this.preferences; }

  // Méthodes métier
  isComplete(): boolean {
    return this.firstName.length > 0 &&
           this.lastName.length > 0 &&
           this.preferences.isComplete();
  }

  withAvatar(avatar: string): UserProfile {
    return new UserProfile(
      this.firstName,
      this.lastName,
      avatar,
      this.preferences
    );
  }

  withPreferences(preferences: StylePreferences): UserProfile {
    return new UserProfile(
      this.firstName,
      this.lastName,
      this.avatar,
      preferences
    );
  }

  equals(other: UserProfile): boolean {
    return this.firstName === other.firstName &&
           this.lastName === other.lastName &&
           this.avatar === other.avatar &&
           this.preferences.equals(other.preferences);
  }
}
```

### 3. Aggregates (Agrégats)
Groupes d'entities et value objects traités comme une unité.

```typescript
// src/features/wardrobe/domain/aggregates/Wardrobe.ts
export class Wardrobe {
  private constructor(
    private readonly _id: WardrobeId,
    private readonly _userId: UserId,
    private _items: Map<ItemId, WardrobeItem>,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _domainEvents: DomainEvent[] = []
  ) {}

  static create(userId: UserId): Wardrobe {
    const wardrobe = new Wardrobe(
      WardrobeId.generate(),
      userId,
      new Map(),
      new Date(),
      new Date()
    );

    wardrobe.addDomainEvent(new WardrobeCreatedEvent(wardrobe.id, userId));
    return wardrobe;
  }

  // Règles métier d'agrégat
  addItem(item: WardrobeItem): void {
    this.ensureWardrobeNotFull();
    this.ensureItemNotDuplicated(item);
    
    this._items.set(item.id, item);
    this._updatedAt = new Date();

    this.addDomainEvent(new ItemAddedToWardrobeEvent(
      this.id,
      item.id,
      item.category
    ));
  }

  removeItem(itemId: ItemId): void {
    const item = this._items.get(itemId);
    if (!item) {
      throw new ItemNotFoundError(itemId);
    }

    this._items.delete(itemId);
    this._updatedAt = new Date();

    this.addDomainEvent(new ItemRemovedFromWardrobeEvent(
      this.id,
      itemId,
      item.category
    ));
  }

  // Queries du domaine
  findItemsByCategory(category: ClothingCategory): WardrobeItem[] {
    return Array.from(this._items.values())
      .filter(item => item.category.equals(category));
  }

  getOutfitSuggestions(occasion: Occasion): OutfitSuggestion[] {
    const outfitMatcher = new OutfitMatcher(this._items);
    return outfitMatcher.suggestOutfits(occasion);
  }

  getItemCount(): number {
    return this._items.size;
  }

  // Invariants d'agrégat
  private ensureWardrobeNotFull(): void {
    const maxItems = 500; // Règle métier
    if (this._items.size >= maxItems) {
      throw new WardrobeFullError(this.id, maxItems);
    }
  }

  private ensureItemNotDuplicated(newItem: WardrobeItem): void {
    const existingItem = Array.from(this._items.values())
      .find(item => item.isSimilarTo(newItem));
    
    if (existingItem) {
      throw new DuplicateItemError(newItem.name, existingItem.id);
    }
  }

  // ... reste de l'implémentation
}
```

### 4. Domain Services
Services contenant la logique métier qui ne belong pas aux entities.

```typescript
// src/features/styling/domain/services/OutfitMatcher.ts
export class OutfitMatcher {
  constructor(
    private readonly wardrobeItems: Map<ItemId, WardrobeItem>
  ) {}

  suggestOutfits(
    occasion: Occasion,
    preferences: StylePreferences,
    weather?: WeatherCondition
  ): OutfitSuggestion[] {
    const suitableItems = this.filterItemsByOccasion(occasion);
    const colorHarmonies = this.calculateColorHarmonies(suitableItems);
    const outfitCombinations = this.generateCombinations(suitableItems);

    return outfitCombinations
      .map(combo => this.evaluateOutfit(combo, preferences, weather))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 suggestions
  }

  private filterItemsByOccasion(occasion: Occasion): WardrobeItem[] {
    return Array.from(this.wardrobeItems.values())
      .filter(item => item.isSuitableFor(occasion));
  }

  private calculateColorHarmonies(items: WardrobeItem[]): ColorHarmony[] {
    const colorTheory = new ColorTheory();
    const colors = items.map(item => item.primaryColor);
    return colorTheory.findHarmonies(colors);
  }

  private generateCombinations(items: WardrobeItem[]): OutfitCombination[] {
    // Algorithme complexe de génération de combinaisons
    const tops = items.filter(item => item.category.isTop());
    const bottoms = items.filter(item => item.category.isBottom());
    const shoes = items.filter(item => item.category.isShoe());
    
    const combinations: OutfitCombination[] = [];
    
    for (const top of tops) {
      for (const bottom of bottoms) {
        for (const shoe of shoes) {
          if (this.isValidCombination(top, bottom, shoe)) {
            combinations.push(new OutfitCombination([top, bottom, shoe]));
          }
        }
      }
    }
    
    return combinations;
  }

  private evaluateOutfit(
    combination: OutfitCombination,
    preferences: StylePreferences,
    weather?: WeatherCondition
  ): OutfitSuggestion {
    let score = 0;
    const reasons: string[] = [];

    // Score basé sur les préférences couleur
    const colorScore = this.evaluateColorCompatibility(combination, preferences);
    score += colorScore * 0.4;
    if (colorScore > 0.8) reasons.push("Excellente harmonie de couleurs");

    // Score basé sur le style
    const styleScore = this.evaluateStyleConsistency(combination, preferences);
    score += styleScore * 0.3;
    if (styleScore > 0.8) reasons.push("Style cohérent avec vos préférences");

    // Score basé sur la météo
    if (weather) {
      const weatherScore = this.evaluateWeatherAppropriatenness(combination, weather);
      score += weatherScore * 0.2;
      if (weatherScore > 0.8) reasons.push("Parfait pour la météo");
    }

    // Score basé sur les tendances
    const trendScore = this.evaluateTrendiness(combination);
    score += trendScore * 0.1;

    return new OutfitSuggestion(
      combination,
      Math.min(score, 1), // Score max 1.0
      reasons,
      this.generateStylingTips(combination)
    );
  }

  // ... méthodes d'évaluation privées
}
```

## 🏢 Bounded Contexts

### Organisation par contextes métier

```
src/features/
├── identity/           # Contexte Identité & Auth
│   ├── domain/
│   │   ├── entities/   # User
│   │   ├── value-objects/ # Email, UserId, UserProfile
│   │   ├── repositories/  # IUserRepository
│   │   └── events/     # UserCreated, ProfileUpdated
│   ├── application/    # Use cases
│   ├── infrastructure/ # Implémentations
│   └── presentation/   # UI Components
│
├── styling/            # Contexte Conseil en Style
│   ├── domain/
│   │   ├── entities/   # StyleAnalysis, Recommendation
│   │   ├── value-objects/ # Color, Style, Confidence
│   │   ├── services/   # OutfitMatcher, ColorTheory
│   │   └── events/     # AnalysisRequested, RecommendationGenerated
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── wardrobe/           # Contexte Garde-robe
│   ├── domain/
│   │   ├── aggregates/ # Wardrobe
│   │   ├── entities/   # WardrobeItem
│   │   ├── value-objects/ # Category, Size, Brand
│   │   └── events/     # ItemAdded, ItemRemoved
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
└── billing/            # Contexte Facturation
    ├── domain/
    │   ├── entities/   # Subscription, Payment
    │   ├── value-objects/ # Money, Plan
    │   └── events/     # PaymentProcessed, SubscriptionCreated
    ├── application/
    ├── infrastructure/
    └── presentation/
```

### Context Map (Relations entre contextes)

```typescript
// src/features/shared/domain/events/DomainEventBus.ts
export interface DomainEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: (event: T) => Promise<void>
  ): void;
}

// Exemple d'intégration entre contextes
export class UserProfileUpdatedHandler {
  constructor(
    private readonly stylePreferencesService: IStylePreferencesService
  ) {}

  async handle(event: UserProfileUpdatedEvent): Promise<void> {
    // Quand le profil utilisateur change dans Identity,
    // mettre à jour les préférences dans Styling
    await this.stylePreferencesService.updateFromUserProfile(
      event.userId,
      event.newProfile
    );
  }
}
```

## 🔄 Domain Events

### Implémentation des événements

```typescript
// src/core/domain/DomainEvent.ts
export abstract class DomainEvent {
  readonly occurredOn: Date;
  readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = generateId();
  }

  abstract getEventName(): string;
}

// Événements spécifiques
export class UserCreatedEvent extends DomainEvent {
  constructor(
    readonly userId: UserId,
    readonly email: Email
  ) {
    super();
  }

  getEventName(): string {
    return 'UserCreated';
  }
}

export class StyleAnalysisCompletedEvent extends DomainEvent {
  constructor(
    readonly analysisId: AnalysisId,
    readonly userId: UserId,
    readonly recommendations: readonly StyleRecommendation[]
  ) {
    super();
  }

  getEventName(): string {
    return 'StyleAnalysisCompleted';
  }
}
```

### Event Sourcing partiel

```typescript
// src/features/styling/domain/entities/StyleAnalysis.ts
export class StyleAnalysis {
  private _events: DomainEvent[] = [];

  static create(
    userId: UserId,
    imageUrl: string,
    preferences: StylePreferences
  ): StyleAnalysis {
    const analysis = new StyleAnalysis(
      AnalysisId.generate(),
      userId,
      imageUrl,
      AnalysisStatus.PENDING,
      new Date()
    );

    analysis.addEvent(new StyleAnalysisRequestedEvent(
      analysis.id,
      userId,
      imageUrl
    ));

    return analysis;
  }

  complete(recommendations: StyleRecommendation[]): void {
    if (!this._status.canTransitionTo(AnalysisStatus.COMPLETED)) {
      throw new InvalidStatusTransitionError(this._status, AnalysisStatus.COMPLETED);
    }

    this._status = AnalysisStatus.COMPLETED;
    this._recommendations = recommendations;
    this._completedAt = new Date();

    this.addEvent(new StyleAnalysisCompletedEvent(
      this.id,
      this.userId,
      recommendations
    ));
  }

  fail(error: AnalysisError): void {
    this._status = AnalysisStatus.FAILED;
    this._error = error;

    this.addEvent(new StyleAnalysisFailedEvent(
      this.id,
      this.userId,
      error
    ));
  }

  // Reconstitution depuis les événements
  static fromEvents(events: DomainEvent[]): StyleAnalysis {
    if (events.length === 0) {
      throw new Error('Cannot reconstitute without events');
    }

    const firstEvent = events[0] as StyleAnalysisRequestedEvent;
    const analysis = new StyleAnalysis(
      firstEvent.analysisId,
      firstEvent.userId,
      firstEvent.imageUrl,
      AnalysisStatus.PENDING,
      firstEvent.occurredOn
    );

    // Appliquer tous les événements
    for (const event of events.slice(1)) {
      analysis.applyEvent(event);
    }

    return analysis;
  }

  private applyEvent(event: DomainEvent): void {
    switch (event.getEventName()) {
      case 'StyleAnalysisCompleted':
        const completedEvent = event as StyleAnalysisCompletedEvent;
        this._status = AnalysisStatus.COMPLETED;
        this._recommendations = completedEvent.recommendations;
        this._completedAt = event.occurredOn;
        break;
      
      case 'StyleAnalysisFailed':
        const failedEvent = event as StyleAnalysisFailedEvent;
        this._status = AnalysisStatus.FAILED;
        this._error = failedEvent.error;
        break;
    }
  }
}
```

## 📱 Exemples pratiques StyleAI

### Use Case avec DDD

```typescript
// src/features/styling/application/use-cases/AnalyzeUserStyleUseCase.ts
export class AnalyzeUserStyleUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly analysisRepository: IStyleAnalysisRepository,
    private readonly geminiService: IGeminiService,
    private readonly eventBus: DomainEventBus
  ) {}

  async execute(command: AnalyzeUserStyleCommand): Promise<AnalysisId> {
    // 1. Validation et récupération des données
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    if (!user.canReceiveStyleAdvice()) {
      throw new UserNotEligibleForStyleAdviceError(command.userId);
    }

    // 2. Création de l'analyse (domaine)
    const analysis = StyleAnalysis.create(
      command.userId,
      command.imageUrl,
      user.profile.getPreferences()
    );

    // 3. Persistance
    await this.analysisRepository.save(analysis);

    // 4. Publication des événements
    for (const event of analysis.getDomainEvents()) {
      await this.eventBus.publish(event);
    }

    analysis.clearDomainEvents();

    return analysis.id;
  }
}

// Handler asynchrone pour traiter l'analyse
export class ProcessStyleAnalysisHandler {
  constructor(
    private readonly analysisRepository: IStyleAnalysisRepository,
    private readonly geminiService: IGeminiService,
    private readonly eventBus: DomainEventBus
  ) {}

  async handle(event: StyleAnalysisRequestedEvent): Promise<void> {
    try {
      const analysis = await this.analysisRepository.findById(event.analysisId);
      if (!analysis) return;

      // Appel à l'IA
      const geminiResult = await this.geminiService.analyzeStyle({
        imageUrl: event.imageUrl,
        preferences: analysis.preferences
      });

      // Transformation en objets du domaine
      const recommendations = geminiResult.recommendations.map(
        rec => StyleRecommendation.fromGeminiResult(rec)
      );

      // Complétion de l'analyse
      analysis.complete(recommendations);

      // Persistance et événements
      await this.analysisRepository.save(analysis);
      
      for (const domainEvent of analysis.getDomainEvents()) {
        await this.eventBus.publish(domainEvent);
      }

    } catch (error) {
      const analysis = await this.analysisRepository.findById(event.analysisId);
      if (analysis) {
        analysis.fail(new AnalysisError(error.message));
        await this.analysisRepository.save(analysis);
      }
    }
  }
}
```

## 🚀 Exercices pratiques

### Exercice 1 : Modéliser le domaine Wardrobe (60 min)
Créez un modèle de domaine complet pour la garde-robe :
- Entities : `WardrobeItem`, `Category`
- Value Objects : `Color`, `Size`, `Brand`, `Price`
- Agrégat : `Wardrobe` avec invariants
- Events : `ItemAdded`, `ItemRemoved`

### Exercice 2 : Service de domaine OutfitMatcher (90 min)
Implémentez la logique complexe de matching d'outfits :
- Algorithme de compatibilité des couleurs
- Règles de style par occasion
- Scoring et ranking des suggestions
- Tests unitaires du domaine

### Exercice 3 : Event Sourcing pour les analyses (120 min)
Créez un système d'Event Sourcing partiel :
- Stockage des événements
- Reconstitution d'agrégats
- Projections pour les queries
- Gestion des snapshots

## 📚 Ressources pour approfondir

### Livres de référence
- **"Domain-Driven Design"** - Eric Evans
- **"Implementing Domain-Driven Design"** - Vaughn Vernon
- **"Patterns, Principles, and Practices of Domain-Driven Design"** - Scott Millett

### Articles et blogs
- [DDD Reference](https://domainlanguage.com/ddd/reference/) - Eric Evans
- [Aggregate Design](https://vaughnvernon.co/?page_id=168) - Vaughn Vernon
- [DDD Sample](https://github.com/citerus/dddsample-core) - Exemple Java

### Patterns avancés
- **CQRS** : Command Query Responsibility Segregation
- **Event Sourcing** : Stockage par événements
- **Saga Pattern** : Transactions distribuées
- **Hexagonal Architecture** : Ports et adaptateurs

---

**Prochaine étape** : Explorez [Clean Architecture](../clean-architecture/README.md) pour structurer votre code selon les principes DDD dans une architecture en couches.