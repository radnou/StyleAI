# Authentification - Sécurité et Expérience Utilisateur

## 🎯 Objectifs du tutoriel

À la fin de ce tutoriel, vous aurez :
- Implémenté un système d'authentification complet
- Intégré Firebase Auth avec votre architecture DDD
- Créé une expérience utilisateur fluide
- Sécurisé votre application mobile

**Durée estimée** : 2-3 heures  
**Niveau** : 🟡 Intermédiaire

## 🏗️ Architecture d'authentification

### Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │Login Screen │  │Register     │  │Reset        │      │
│  │             │  │Screen       │  │Password     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                 Application Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │Login User   │  │Register     │  │Reset        │      │
│  │Use Case     │  │User Use     │  │Password     │      │
│  │             │  │Case         │  │Use Case     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Domain Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │User Entity  │  │Email VO     │  │Password VO  │      │
│  │             │  │             │  │             │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│               Infrastructure Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │Firebase     │  │Secure       │  │Biometric    │      │
│  │Auth Service │  │Storage      │  │Auth         │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Domaine d'authentification

### Value Objects de sécurité

```typescript
// src/features/identity/domain/value-objects/Email.ts
export class Email {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): Email {
    return new Email(value.toLowerCase().trim());
  }

  private validate(value: string): void {
    if (!value) {
      throw new InvalidEmailError('Email ne peut pas être vide');
    }

    // Validation RFC 5322 simplifiée
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(value)) {
      throw new InvalidEmailError(`Format d'email invalide: ${value}`);
    }

    if (value.length > 320) { // RFC 5321 limite
      throw new InvalidEmailError('Email trop long (max 320 caractères)');
    }

    // Vérification domaines temporaires (optionnel)
    if (this.isTemporaryEmailDomain(value)) {
      throw new TemporaryEmailNotAllowedError('Emails temporaires non autorisés');
    }
  }

  private isTemporaryEmailDomain(email: string): boolean {
    const tempDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      // ... autres domaines temporaires
    ];
    
    const domain = email.split('@')[1];
    return tempDomains.includes(domain.toLowerCase());
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// src/features/identity/domain/value-objects/Password.ts
export class Password {
  private constructor(private readonly hashedValue: string) {}

  static createFromPlainText(plainPassword: string): Password {
    this.validatePlainPassword(plainPassword);
    const hashedValue = this.hashPassword(plainPassword);
    return new Password(hashedValue);
  }

  static createFromHash(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  private static validatePlainPassword(password: string): void {
    if (!password) {
      throw new InvalidPasswordError('Mot de passe ne peut pas être vide');
    }

    if (password.length < 8) {
      throw new InvalidPasswordError('Mot de passe trop court (min 8 caractères)');
    }

    if (password.length > 128) {
      throw new InvalidPasswordError('Mot de passe trop long (max 128 caractères)');
    }

    // Exigences de complexité
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    if (criteriaMet < 3) {
      throw new InvalidPasswordError(
        'Le mot de passe doit contenir au moins 3 des critères: majuscule, minuscule, chiffre, caractère spécial'
      );
    }

    // Vérification contre les mots de passe communs
    if (this.isCommonPassword(password)) {
      throw new CommonPasswordError('Ce mot de passe est trop commun');
    }
  }

  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
      // ... liste des mots de passe communs
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  private static hashPassword(password: string): string {
    // En production, utiliser bcrypt ou Argon2
    // Ici simplifié pour l'exemple
    return `hashed_${password}`;
  }

  verifyPassword(plainPassword: string): boolean {
    const hashedInput = Password.hashPassword(plainPassword);
    return hashedInput === this.hashedValue;
  }

  getHashedValue(): string {
    return this.hashedValue;
  }

  equals(other: Password): boolean {
    return this.hashedValue === other.hashedValue;
  }
}
```

### Entité User avec authentification

```typescript
// src/features/identity/domain/entities/User.ts
export enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export class User {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _password: Password | null, // null pour OAuth users
    private _profile: UserProfile,
    private _status: UserStatus,
    private _emailVerified: boolean,
    private _lastLoginAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _domainEvents: DomainEvent[] = []
  ) {}

  // Factory pour création avec email/password
  static createWithEmailPassword(
    email: Email,
    password: Password,
    profile: UserProfile
  ): User {
    const user = new User(
      UserId.generate(),
      email,
      password,
      profile,
      UserStatus.PENDING_VERIFICATION,
      false, // Email non vérifié
      null,
      new Date(),
      new Date()
    );

    user.addDomainEvent(new UserRegisteredEvent(user.id, user.email));
    return user;
  }

  // Factory pour création OAuth
  static createWithOAuth(
    email: Email,
    profile: UserProfile,
    provider: AuthProvider
  ): User {
    const user = new User(
      UserId.generate(),
      email,
      null, // Pas de mot de passe pour OAuth
      profile,
      UserStatus.ACTIVE, // OAuth users sont immédiatement actifs
      true, // Email vérifié par le provider
      new Date(),
      new Date(),
      new Date()
    );

    user.addDomainEvent(new UserRegisteredWithOAuthEvent(
      user.id,
      user.email,
      provider
    ));
    return user;
  }

  // Méthodes d'authentification
  authenticate(password: string): void {
    if (!this.canAuthenticate()) {
      throw new UserCannotAuthenticateError(this.id, this._status);
    }

    if (!this._password) {
      throw new PasswordAuthNotAvailableError(this.id);
    }

    if (!this._password.verifyPassword(password)) {
      this.recordFailedLoginAttempt();
      throw new InvalidPasswordError('Mot de passe incorrect');
    }

    this.recordSuccessfulLogin();
  }

  verifyEmail(verificationToken: string): void {
    if (this._emailVerified) {
      return; // Déjà vérifié
    }

    // Logique de vérification du token
    if (!this.isValidVerificationToken(verificationToken)) {
      throw new InvalidVerificationTokenError('Token de vérification invalide');
    }

    this._emailVerified = true;
    this._status = UserStatus.ACTIVE;
    this._updatedAt = new Date();

    this.addDomainEvent(new UserEmailVerifiedEvent(this.id, this.email));
  }

  changePassword(currentPassword: string, newPassword: Password): void {
    if (!this._password) {
      throw new PasswordChangeNotAllowedError('Utilisateur OAuth');
    }

    if (!this._password.verifyPassword(currentPassword)) {
      throw new InvalidPasswordError('Mot de passe actuel incorrect');
    }

    this._password = newPassword;
    this._updatedAt = new Date();

    this.addDomainEvent(new UserPasswordChangedEvent(this.id));
  }

  requestPasswordReset(): void {
    if (!this.canResetPassword()) {
      throw new PasswordResetNotAllowedError(this.id, this._status);
    }

    this.addDomainEvent(new PasswordResetRequestedEvent(this.id, this.email));
  }

  resetPassword(resetToken: string, newPassword: Password): void {
    if (!this.isValidResetToken(resetToken)) {
      throw new InvalidResetTokenError('Token de reset invalide ou expiré');
    }

    this._password = newPassword;
    this._updatedAt = new Date();

    this.addDomainEvent(new PasswordResetCompletedEvent(this.id));
  }

  // Règles métier
  canAuthenticate(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  canResetPassword(): boolean {
    return this._status !== UserStatus.DELETED && 
           this._status !== UserStatus.SUSPENDED;
  }

  requiresEmailVerification(): boolean {
    return !this._emailVerified && this._status === UserStatus.PENDING_VERIFICATION;
  }

  // Méthodes privées
  private recordSuccessfulLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
    
    this.addDomainEvent(new UserLoggedInEvent(this.id, this._lastLoginAt));
  }

  private recordFailedLoginAttempt(): void {
    this.addDomainEvent(new UserLoginFailedEvent(this.id, new Date()));
  }

  private isValidVerificationToken(token: string): boolean {
    // Logique de validation du token
    return true; // Simplifié
  }

  private isValidResetToken(token: string): boolean {
    // Logique de validation du token de reset
    return true; // Simplifié
  }

  // Getters
  get id(): UserId { return this._id; }
  get email(): Email { return this._email; }
  get profile(): UserProfile { return this._profile; }
  get status(): UserStatus { return this._status; }
  get emailVerified(): boolean { return this._emailVerified; }
  get lastLoginAt(): Date | null { return this._lastLoginAt; }
}
```

## 🔧 Services d'application

### Use Cases d'authentification

```typescript
// src/features/identity/application/use-cases/RegisterUserUseCase.ts
export interface RegisterUserCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly eventBus: DomainEventBus
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserId> {
    // 1. Validation des données d'entrée
    const email = Email.create(command.email);
    const password = Password.createFromPlainText(command.password);
    const profile = UserProfile.create(
      command.firstName,
      command.lastName,
      null, // avatar
      StylePreferences.createDefault()
    );

    // 2. Vérification unicité email
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyInUseError(email);
    }

    // 3. Création de l'utilisateur
    const user = User.createWithEmailPassword(email, password, profile);

    // 4. Persistance
    await this.userRepository.save(user);

    // 5. Publication des événements
    for (const event of user.getDomainEvents()) {
      await this.eventBus.publish(event);
    }

    user.clearDomainEvents();

    return user.id;
  }
}

// src/features/identity/application/use-cases/LoginUserUseCase.ts
export interface LoginUserCommand {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface LoginUserResult {
  userId: UserId;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly deviceRepository: IDeviceRepository,
    private readonly eventBus: DomainEventBus
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResult> {
    // 1. Validation et récupération utilisateur
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new InvalidCredentialsError('Email ou mot de passe incorrect');
    }

    // 2. Authentification
    try {
      user.authenticate(command.password);
    } catch (error) {
      // Log et publication événement d'échec
      await this.eventBus.publish(new LoginAttemptFailedEvent(
        user.id,
        command.deviceInfo
      ));
      throw error;
    }

    // 3. Vérification statut utilisateur
    if (user.requiresEmailVerification()) {
      throw new EmailVerificationRequiredError(user.id);
    }

    // 4. Génération des tokens
    const tokens = await this.tokenService.generateTokens(user.id);

    // 5. Enregistrement du device (si fourni)
    if (command.deviceInfo) {
      await this.deviceRepository.registerDevice(user.id, command.deviceInfo);
    }

    // 6. Mise à jour de l'utilisateur (lastLoginAt)
    await this.userRepository.save(user);

    // 7. Publication des événements
    for (const event of user.getDomainEvents()) {
      await this.eventBus.publish(event);
    }

    return {
      userId: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }
}

// src/features/identity/application/use-cases/RequestPasswordResetUseCase.ts
export interface RequestPasswordResetCommand {
  email: string;
}

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: DomainEventBus
  ) {}

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);
    
    // Même comportement que l'utilisateur existe ou non (sécurité)
    if (!user) {
      // Log l'tentative mais ne révèle pas que l'email n'existe pas
      await this.eventBus.publish(new PasswordResetRequestedForUnknownEmailEvent(email));
      return;
    }

    // Demande de reset
    user.requestPasswordReset();
    await this.userRepository.save(user);

    // Publication des événements
    for (const event of user.getDomainEvents()) {
      await this.eventBus.publish(event);
    }

    user.clearDomainEvents();
  }
}
```

### Handlers d'événements

```typescript
// src/features/identity/application/handlers/SendWelcomeEmailHandler.ts
export class SendWelcomeEmailHandler {
  constructor(
    private readonly emailService: IEmailService,
    private readonly userRepository: IUserRepository
  ) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    const user = await this.userRepository.findById(event.userId);
    if (!user) return;

    // Génération du token de vérification
    const verificationToken = await this.generateVerificationToken(user.id);
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;

    await this.emailService.sendWelcomeEmail({
      to: user.email.getValue(),
      userName: user.profile.getFirstName(),
      verificationLink,
    });
  }

  private async generateVerificationToken(userId: UserId): Promise<string> {
    // Génération sécurisée du token
    return 'verification_token';
  }
}

// src/features/identity/application/handlers/SendPasswordResetEmailHandler.ts
export class SendPasswordResetEmailHandler {
  constructor(
    private readonly emailService: IEmailService,
    private readonly userRepository: IUserRepository
  ) {}

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    const user = await this.userRepository.findById(event.userId);
    if (!user) return;

    const resetToken = await this.generateResetToken(user.id);
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    await this.emailService.sendPasswordResetEmail({
      to: user.email.getValue(),
      userName: user.profile.getFirstName(),
      resetLink,
      expiresIn: '1 heure',
    });
  }

  private async generateResetToken(userId: UserId): Promise<string> {
    // Token avec expiration
    return 'reset_token';
  }
}
```

## 🔐 Infrastructure Firebase

### Service d'authentification Firebase

```typescript
// src/features/identity/infrastructure/services/FirebaseAuthService.ts
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export class FirebaseAuthService implements IAuthService {
  constructor() {
    this.configureGoogleSignIn();
  }

  async signUpWithEmailPassword(
    email: string,
    password: string
  ): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );

      // Envoi de l'email de vérification
      await userCredential.user.sendEmailVerification();

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        emailVerified: userCredential.user.emailVerified,
        idToken: await userCredential.user.getIdToken(),
      };
    } catch (error) {
      throw this.mapFirebaseError(error);
    }
  }

  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        emailVerified: userCredential.user.emailVerified,
        idToken: await userCredential.user.getIdToken(),
      };
    } catch (error) {
      throw this.mapFirebaseError(error);
    }
  }

  async signInWithGoogle(): Promise<FirebaseAuthResult> {
    try {
      // Vérifier Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Obtenir idToken Google
      const { idToken } = await GoogleSignin.signIn();

      // Créer credential Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Se connecter avec Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        emailVerified: userCredential.user.emailVerified,
        idToken: await userCredential.user.getIdToken(),
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };
    } catch (error) {
      throw this.mapGoogleSignInError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw this.mapFirebaseError(error);
    }
  }

  async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      return await auth().verifyPasswordResetCode(code);
    } catch (error) {
      throw this.mapFirebaseError(error);
    }
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await auth().confirmPasswordReset(code, newPassword);
    } catch (error) {
      throw this.mapFirebaseError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut(); // Google sign out
      await auth().signOut(); // Firebase sign out
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  onAuthStateChanged(callback: (user: FirebaseAuthResult | null) => void): () => void {
    return auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const user: FirebaseAuthResult = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          emailVerified: firebaseUser.emailVerified,
          idToken: await firebaseUser.getIdToken(),
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  private configureGoogleSignIn(): void {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }

  private mapFirebaseError(error: any): AuthError {
    switch (error.code) {
      case 'auth/user-not-found':
        return new UserNotFoundError('Utilisateur non trouvé');
      
      case 'auth/wrong-password':
        return new InvalidPasswordError('Mot de passe incorrect');
      
      case 'auth/email-already-in-use':
        return new EmailAlreadyInUseError('Email déjà utilisé');
      
      case 'auth/weak-password':
        return new WeakPasswordError('Mot de passe trop faible');
      
      case 'auth/invalid-email':
        return new InvalidEmailError('Format d\'email invalide');
      
      case 'auth/user-disabled':
        return new UserDisabledError('Compte utilisateur désactivé');
      
      case 'auth/too-many-requests':
        return new TooManyRequestsError('Trop de tentatives, réessayez plus tard');
      
      default:
        return new AuthError(`Erreur d'authentification: ${error.message}`);
    }
  }

  private mapGoogleSignInError(error: any): AuthError {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return new SignInCancelledError('Connexion Google annulée');
      
      case statusCodes.IN_PROGRESS:
        return new SignInInProgressError('Connexion Google en cours');
      
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return new PlayServicesNotAvailableError('Google Play Services non disponible');
      
      default:
        return new GoogleSignInError(`Erreur Google Sign-In: ${error.message}`);
    }
  }
}
```

### Repository utilisateur Firebase

```typescript
// src/features/identity/infrastructure/repositories/FirebaseUserRepository.ts
import firestore from '@react-native-firebase/firestore';
import { UserMapper } from '../mappers/UserMapper';

export class FirebaseUserRepository implements IUserRepository {
  private readonly collection = firestore().collection('users');

  async findById(id: UserId): Promise<User | null> {
    try {
      const doc = await this.collection.doc(id.getValue()).get();
      
      if (!doc.exists) {
        return null;
      }

      return UserMapper.toDomain(doc.data()!, doc.id);
    } catch (error) {
      throw new RepositoryError(`Error finding user by id: ${error.message}`);
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const querySnapshot = await this.collection
        .where('email', '==', email.getValue())
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return UserMapper.toDomain(doc.data(), doc.id);
    } catch (error) {
      throw new RepositoryError(`Error finding user by email: ${error.message}`);
    }
  }

  async save(user: User): Promise<void> {
    try {
      const userData = UserMapper.toPersistence(user);
      
      await this.collection.doc(user.id.getValue()).set(userData, { merge: true });
    } catch (error) {
      throw new RepositoryError(`Error saving user: ${error.message}`);
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await this.collection.doc(id.getValue()).delete();
    } catch (error) {
      throw new RepositoryError(`Error deleting user: ${error.message}`);
    }
  }
}

// src/features/identity/infrastructure/mappers/UserMapper.ts
export class UserMapper {
  static toDomain(raw: any, id: string): User {
    return User.reconstitute(
      UserId.create(id),
      Email.create(raw.email),
      UserProfile.create(
        raw.profile.firstName,
        raw.profile.lastName,
        raw.profile.avatar,
        StylePreferences.fromPersistence(raw.profile.preferences)
      ),
      raw.status,
      raw.emailVerified,
      raw.lastLoginAt ? raw.lastLoginAt.toDate() : null,
      raw.createdAt.toDate(),
      raw.updatedAt.toDate()
    );
  }

  static toPersistence(user: User): any {
    return {
      email: user.email.getValue(),
      profile: {
        firstName: user.profile.getFirstName(),
        lastName: user.profile.getLastName(),
        avatar: user.profile.getAvatar(),
        preferences: user.profile.getPreferences().toPersistence(),
      },
      status: user.status,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt ? firestore.Timestamp.fromDate(user.lastLoginAt) : null,
      createdAt: firestore.Timestamp.fromDate(user.createdAt),
      updatedAt: firestore.Timestamp.fromDate(new Date()),
    };
  }
}
```

## 📱 Interface utilisateur

### Hook d'authentification

```typescript
// src/features/identity/presentation/hooks/useAuth.ts
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Use cases
  const loginUseCase = useMemo(() => new LoginUserUseCase(
    userRepository,
    tokenService,
    deviceRepository,
    eventBus
  ), []);

  const registerUseCase = useMemo(() => new RegisterUserUseCase(
    userRepository,
    emailService,
    eventBus
  ), []);

  // Actions
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await loginUseCase.execute({ email, password });
      
      // Récupérer l'utilisateur complet
      const user = await userRepository.findById(result.userId);
      if (!user) throw new Error('Utilisateur non trouvé');

      // Stocker les tokens de façon sécurisée
      await secureStorage.setItem('access_token', result.accessToken);
      await secureStorage.setItem('refresh_token', result.refreshToken);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
      }));
      throw error;
    }
  }, [loginUseCase]);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await registerUseCase.execute(data);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur d\'inscription',
      }));
      throw error;
    }
  }, [registerUseCase]);

  const loginWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Implémenter OAuth use case
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion Google',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await secureStorage.removeItem('access_token');
      await secureStorage.removeItem('refresh_token');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialisation de l'état d'auth au montage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const accessToken = await secureStorage.getItem('access_token');
      
      if (accessToken && isTokenValid(accessToken)) {
        // Token valide, récupérer l'utilisateur
        const userId = extractUserIdFromToken(accessToken);
        const user = await userRepository.findById(UserId.create(userId));
        
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      }

      // Pas de token valide
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    requestPasswordReset: async () => {},
    resetPassword: async () => {},
    clearError,
  };
}
```

### Écrans d'authentification

```typescript
// src/features/identity/presentation/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, YStack, XStack, Text, Spinner } from 'tamagui';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen: React.FC = () => {
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // Navigation gérée par l'état d'auth dans RootNavigator
    } catch (error) {
      Alert.alert(
        'Erreur de connexion',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      Alert.alert(
        'Erreur de connexion',
        'Impossible de se connecter avec Google'
      );
    }
  };

  return (
    <YStack flex={1} padding="$4" justifyContent="center" space="$4">
      <YStack space="$2" marginBottom="$6">
        <Text fontSize="$8" fontWeight="bold" textAlign="center">
          Connexion
        </Text>
        <Text fontSize="$4" color="$gray10" textAlign="center">
          Connectez-vous à votre compte StyleAI
        </Text>
      </YStack>

      <YStack space="$4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              borderColor={errors.email ? '$red8' : '$borderColor'}
            />
          )}
        />
        {errors.email && (
          <Text color="$red10" fontSize="$3">
            {errors.email.message}
          </Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Mot de passe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!showPassword}
              borderColor={errors.password ? '$red8' : '$borderColor'}
            />
          )}
        />
        {errors.password && (
          <Text color="$red10" fontSize="$3">
            {errors.password.message}
          </Text>
        )}

        {error && (
          <Text color="$red10" fontSize="$3" textAlign="center">
            {error}
          </Text>
        )}

        <Button
          theme="active"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
          icon={isLoading ? <Spinner /> : undefined}
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </Button>

        <XStack alignItems="center" space="$2">
          <View style={{ flex: 1, height: 1, backgroundColor: '#e0e0e0' }} />
          <Text color="$gray10" fontSize="$3">
            ou
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#e0e0e0' }} />
        </XStack>

        <Button
          variant="outlined"
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          icon="$google"
        >
          Continuer avec Google
        </Button>

        <XStack justifyContent="center" space="$2">
          <Text color="$gray10">Pas encore de compte ?</Text>
          <Text
            color="$blue10"
            fontWeight="600"
            onPress={() => navigation.navigate('Register')}
          >
            S'inscrire
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
};
```

## 🔒 Sécurité et bonnes pratiques

### Protection contre les attaques

```typescript
// src/features/identity/infrastructure/security/RateLimiter.ts
export class RateLimiter {
  private attempts = new Map<string, AttemptRecord>();

  async checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): Promise<void> {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
      return;
    }

    // Reset si fenêtre expirée
    if (now - record.firstAttempt > windowMs) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
      return;
    }

    // Increment counter
    record.count++;
    record.lastAttempt = now;

    if (record.count > maxAttempts) {
      const remainingTime = windowMs - (now - record.firstAttempt);
      throw new RateLimitExceededError(
        `Trop de tentatives. Réessayez dans ${Math.ceil(remainingTime / 1000 / 60)} minutes.`
      );
    }

    this.attempts.set(identifier, record);
  }

  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// src/features/identity/infrastructure/security/SecurityValidator.ts
export class SecurityValidator {
  static validateDeviceFingerprint(
    request: any,
    storedFingerprint?: string
  ): boolean {
    if (!storedFingerprint) return true; // Premier login

    const currentFingerprint = this.generateDeviceFingerprint(request);
    return currentFingerprint === storedFingerprint;
  }

  static generateDeviceFingerprint(request: any): string {
    // Génération d'empreinte basée sur device info
    const { 
      userAgent, 
      platform, 
      deviceId, 
      appVersion 
    } = request.deviceInfo || {};

    return crypto
      .createHash('sha256')
      .update(`${userAgent}-${platform}-${deviceId}-${appVersion}`)
      .digest('hex');
  }

  static isValidSession(token: string, deviceInfo: any): boolean {
    // Validation de session avec device binding
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sessionFingerprint = decoded.deviceFingerprint;
    const currentFingerprint = this.generateDeviceFingerprint({ deviceInfo });
    
    return sessionFingerprint === currentFingerprint;
  }
}
```

## 🚀 Exercices pratiques

### Exercice 1 : Authentification biométrique (60 min)
Ajoutez l'authentification biométrique :
- Intégration TouchID/FaceID
- Fallback vers PIN
- Stockage sécurisé des clés
- Tests sur device physique

### Exercice 2 : Authentification multifacteur (90 min)
Implémentez un système 2FA :
- TOTP avec Google Authenticator
- SMS backup
- Codes de récupération
- Interface utilisateur complète

### Exercice 3 : Session management avancé (120 min)
Créez un système de session robuste :
- Refresh token rotation
- Device binding
- Session invalidation
- Monitoring de sécurité

## 📚 Ressources pour approfondir

### Sécurité mobile
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Firebase Auth Best Practices](https://firebase.google.com/docs/auth/best-practices)

### Standards et protocoles
- **OAuth 2.0** : Standard d'autorisation
- **OpenID Connect** : Couche d'identité sur OAuth 2.0
- **JWT** : JSON Web Tokens
- **PKCE** : Proof Key for Code Exchange

### Outils de sécurité
- **expo-local-authentication** : Biométrie
- **expo-secure-store** : Stockage sécurisé
- **crypto-js** : Cryptographie
- **react-native-keychain** : Keychain/Keystore

---

**Prochaine étape** : Découvrez [Firebase et Firestore](../../01-technologies/firebase/README.md) pour approfondir l'intégration backend de votre système d'authentification.