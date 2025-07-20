# Guide de Setup - Environnement de Développement StyleAI

## 🎯 Objectifs

À la fin de ce guide, vous aurez :
- Un environnement de développement React Native fonctionnel
- Le projet StyleAI configuré et prêt
- Tous les outils nécessaires installés
- Une compréhension du workflow de développement

**Durée estimée** : 1-2 heures

## 📋 Prérequis système

### Système d'exploitation
- **macOS** 10.15+ (recommandé pour développement iOS)
- **Windows** 10+ avec WSL2
- **Linux** Ubuntu 18.04+

### Outils de base
- **Node.js** 18.0+ (LTS recommandé)
- **npm** ou **yarn** (yarn recommandé)
- **Git** 2.30+
- **VS Code** (éditeur recommandé)

## 🛠️ Installation pas à pas

### Étape 1 : Node.js et gestionnaire de paquets

#### Option A : Via Node Version Manager (recommandé)
```bash
# Installation de nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Redémarrer le terminal puis
nvm install 18
nvm use 18
nvm alias default 18

# Vérification
node --version  # Devrait afficher v18.x.x
npm --version   # Devrait afficher 9.x.x
```

#### Option B : Installation directe
- Télécharger depuis [nodejs.org](https://nodejs.org/)
- Installer la version LTS

#### Installation de Yarn (recommandé)
```bash
npm install -g yarn
yarn --version  # Vérification
```

### Étape 2 : Git et configuration

```bash
# Installation Git (si nécessaire)
# macOS: xcode-select --install
# Windows: https://git-scm.com/download/win
# Linux: sudo apt-get install git

# Configuration Git
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Vérification
git --version
```

### Étape 3 : React Native et Expo CLI

```bash
# Installation d'Expo CLI globalement
npm install -g @expo/cli

# Installation d'EAS CLI (pour build et déploiement)
npm install -g eas-cli

# Vérification
expo --version
eas --version
```

### Étape 4 : Outils de développement

#### VS Code et extensions
1. Télécharger [VS Code](https://code.visualstudio.com/)
2. Installer les extensions essentielles :

```bash
# Extensions recommandées pour StyleAI
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension expo.vscode-expo-tools
code --install-extension ms-vscode.vscode-react-native-preview
```

#### Configuration VS Code pour StyleAI
Créer `.vscode/settings.json` :
```json
{
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.tsx": "typescriptreact"
  },
  "emmet.includeLanguages": {
    "typescriptreact": "html"
  }
}
```

### Étape 5 : Simulateurs et émulateurs

#### iOS (macOS uniquement)
```bash
# Installation Xcode depuis App Store
# Puis installer les simulateurs
xcode-select --install

# Ouvrir Xcode et installer les simulateurs iOS
# Xcode → Preferences → Components → Simulators
```

#### Android (toutes plateformes)
1. Télécharger [Android Studio](https://developer.android.com/studio)
2. Installer les SDK et outils nécessaires :

```bash
# Ajouter au ~/.zshrc ou ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
# Windows : C:\Users\%USERNAME%\AppData\Local\Android\Sdk

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

3. Créer un émulateur Android :
   - Ouvrir Android Studio
   - Tools → AVD Manager
   - Create Virtual Device
   - Choisir un device récent (ex: Pixel 6)

## 📱 Installation et configuration du projet StyleAI

### Clonage du repository
```bash
# Cloner le projet StyleAI
git clone https://github.com/votre-username/StyleAI.git
cd StyleAI

# Ou si vous partez de zéro
npx create-expo-app StyleAI --template
cd StyleAI
```

### Installation des dépendances
```bash
# Installation avec yarn (recommandé)
yarn install

# Ou avec npm
npm install

# Nettoyage du cache si nécessaire
yarn start --clear
```

### Configuration des variables d'environnement

#### 1. Copier le fichier d'exemple
```bash
cp .env.example .env.development
```

#### 2. Configurer les variables
```bash
# .env.development
EXPO_PUBLIC_API_URL=https://api.styleai.dev
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=styleai-dev.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=styleai-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=styleai-dev.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Configuration Firebase

#### 1. Créer un projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet "StyleAI"
3. Activer Authentication, Firestore, Storage

#### 2. Configuration iOS (macOS)
```bash
# Télécharger GoogleService-Info.plist depuis Firebase Console
# Le placer dans le dossier ios/
```

#### 3. Configuration Android
```bash
# Télécharger google-services.json depuis Firebase Console
# Le placer dans android/app/
```

### Configuration Gemini AI

#### 1. Obtenir une clé API
1. Aller sur [Google AI Studio](https://makersuite.google.com/)
2. Créer une clé API
3. L'ajouter dans `.env.development`

#### 2. Tester la configuration
```bash
# Tester l'API Gemini
yarn test:gemini
```

## 🏃‍♂️ Premier lancement

### Démarrage du serveur de développement
```bash
# Démarrer Expo
yarn start

# Ou avec options spécifiques
yarn start --clear  # Nettoyer le cache
yarn start --tunnel # Tunnel pour tests sur device physique
```

### Test sur simulateurs
```bash
# iOS Simulator
yarn ios

# Émulateur Android
yarn android

# Web browser
yarn web
```

### Test sur device physique
1. Installer [Expo Go](https://expo.dev/client) sur votre téléphone
2. Scanner le QR code affiché dans le terminal
3. L'app devrait se lancer automatiquement

## 🔧 Configuration des outils de développement

### ESLint et Prettier
```bash
# Vérifier la configuration
yarn lint

# Corriger automatiquement
yarn lint:fix

# Formater le code
yarn format
```

### TypeScript
```bash
# Vérification des types
yarn type-check

# Mode watch pour développement
yarn type-check --watch
```

### Tests
```bash
# Tests unitaires
yarn test

# Tests en mode watch
yarn test:watch

# Coverage
yarn test:coverage
```

### Husky (Git hooks)
```bash
# Installation des hooks
yarn prepare

# Test du pre-commit hook
git add .
git commit -m "test: vérification pre-commit"
```

## 🐛 Résolution des problèmes courants

### Metro bundler issues
```bash
# Nettoyer tous les caches
yarn start --clear
npx react-native start --reset-cache

# Ou plus radical
rm -rf node_modules
yarn install
```

### Problèmes iOS
```bash
# Nettoyer build iOS
cd ios && xcodebuild clean && cd ..

# Réinstaller pods
cd ios && pod deintegrate && pod install && cd ..
```

### Problèmes Android
```bash
# Nettoyer build Android
cd android && ./gradlew clean && cd ..

# Réinitialiser ADB
adb kill-server && adb start-server
```

### Problèmes de dépendances
```bash
# Vérifier les versions
yarn outdated

# Nettoyer yarn cache
yarn cache clean

# Réinstaller proprement
rm -rf node_modules yarn.lock
yarn install
```

## 📊 Vérification de l'installation

### Checklist complète
- [ ] Node.js 18+ installé et fonctionnel
- [ ] Yarn ou npm configuré
- [ ] Expo CLI installé globalement
- [ ] VS Code avec extensions installées
- [ ] Git configuré avec votre identité
- [ ] Simulateur iOS configuré (macOS)
- [ ] Émulateur Android configuré
- [ ] Projet StyleAI cloné
- [ ] Dépendances installées sans erreur
- [ ] Variables d'environnement configurées
- [ ] Firebase configuré
- [ ] Gemini AI configuré
- [ ] Premier lancement réussi
- [ ] Tests passent
- [ ] Linting et formatage fonctionnels

### Test final
```bash
# Lancer tous les tests
yarn test:all

# Vérifier le build
expo export

# Tester sur simulateur
yarn ios # ou yarn android
```

## 🎯 Prochaines étapes

Une fois l'installation terminée :

1. **Explorer le code** : Parcourez la structure du projet
2. **Lancer les tests** : Assurez-vous que tout fonctionne
3. **Modifier du code** : Testez le hot reload
4. **Lire la documentation** : Continuez avec les modules suivants

### Tutoriels suggérés
1. [Introduction à React Native](../01-technologies/react-native/README.md)
2. [Expo et développement mobile](../01-technologies/expo/README.md)
3. [TypeScript pour React Native](../01-technologies/typescript/README.md)

## 📚 Ressources utiles

### Documentation officielle
- [React Native Getting Started](https://reactnative.dev/docs/environment-setup)
- [Expo Installation](https://docs.expo.dev/get-started/installation/)
- [Firebase Setup](https://firebase.google.com/docs/web/setup)

### Outils de debugging
- **React DevTools** : `npm install -g react-devtools`
- **Flipper** : [Installation](https://fbflipper.com/docs/getting-started/)
- **Reactotron** : `npm install -g reactotron-cli`

### Communauté et support
- [React Native Community](https://github.com/react-native-community)
- [Expo Discord](https://chat.expo.dev/)
- [Stack Overflow - React Native](https://stackoverflow.com/questions/tagged/react-native)

---

**Bravo !** 🎉 Votre environnement de développement StyleAI est maintenant prêt. Vous pouvez commencer à explorer le code et développer des fonctionnalités incroyables !