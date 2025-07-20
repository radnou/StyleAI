# Guide de Déploiement StyleAI

## Vue d'ensemble

Ce guide détaille les étapes complètes pour déployer StyleAI en production, incluant la configuration des services, la préparation des builds, et la validation des déploiements.

## Prérequis

### Outils Requis
- Node.js 18+ avec npm
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- Firebase CLI (`npm install -g firebase-tools`)
- Android Studio (pour Android)
- Xcode (pour iOS, macOS uniquement)

### Comptes et Services
- Compte Expo/EAS
- Projet Firebase configuré
- Clé API Google Gemini AI
- Certificats de développement iOS (si applicable)
- Clés de signature Android

## Configuration des Environnements

### 1. Variables d'Environnement

Créer les fichiers de configuration pour chaque environnement :

#### `.env.production`
```bash
ENVIRONMENT=production
FIREBASE_API_KEY=your_production_firebase_api_key
FIREBASE_AUTH_DOMAIN=styleai-prod.firebaseapp.com
FIREBASE_PROJECT_ID=styleai-prod
FIREBASE_STORAGE_BUCKET=styleai-prod.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
GEMINI_API_KEY=your_production_gemini_api_key
API_BASE_URL=https://api.styleai.com
API_TIMEOUT=10000
ENABLE_AI_FEATURES=true
ENABLE_SOCIAL_FEATURES=true
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
DEBUG_MODE=false
LOG_LEVEL=error
SHOW_DEV_TOOLS=false
VERSION=1.0.0
```

#### `.env.staging`
```bash
ENVIRONMENT=staging
FIREBASE_API_KEY=your_staging_firebase_api_key
FIREBASE_AUTH_DOMAIN=styleai-staging.firebaseapp.com
FIREBASE_PROJECT_ID=styleai-staging
FIREBASE_STORAGE_BUCKET=styleai-staging.appspot.com
FIREBASE_MESSAGING_SENDER_ID=987654321
FIREBASE_APP_ID=1:987654321:web:fedcba987654
FIREBASE_MEASUREMENT_ID=G-FEDCBA9876
GEMINI_API_KEY=your_staging_gemini_api_key
API_BASE_URL=https://api.staging.styleai.com
API_TIMEOUT=15000
ENABLE_AI_FEATURES=true
ENABLE_SOCIAL_FEATURES=false
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
DEBUG_MODE=true
LOG_LEVEL=debug
SHOW_DEV_TOOLS=true
VERSION=1.0.0-staging
```

### 2. Configuration EAS

#### `eas.json`
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "development": true,
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "developmentClient"
      },
      "ios": {
        "buildConfiguration": "Debug"
      },
      "env": {
        "ENVIRONMENT": "development"
      }
    },
    "staging": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "env": {
        "ENVIRONMENT": "staging"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "env": {
        "ENVIRONMENT": "production"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./android-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your.apple.id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEF1234"
      }
    }
  }
}
```

## Configuration Firebase

### 1. Projets Firebase

Créer des projets séparés pour chaque environnement :
- `styleai-dev` (développement)
- `styleai-staging` (test)
- `styleai-prod` (production)

### 2. Services Firebase

Pour chaque projet, activer :
- **Authentication** avec les providers :
  - Email/Password
  - Google
- **Firestore Database**
- **Storage**
- **Analytics** (production uniquement)
- **Crashlytics** (production uniquement)

### 3. Règles de Sécurité

#### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs peuvent accéder uniquement à leurs données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Articles de garde-robe par utilisateur
    match /clothingItems/{itemId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Analyses de style par utilisateur
    match /styleAnalyses/{analysisId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Métriques publiques (lecture seule)
    match /metrics/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

#### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images utilisateur
    match /users/{userId}/images/{imageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024 && // 10MB max
        request.resource.contentType.matches('image/.*');
    }
    
    // Assets publics (lecture seule)
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 4. Déploiement des Règles

```bash
# Installation Firebase CLI
npm install -g firebase-tools

# Connexion à Firebase
firebase login

# Configuration du projet
firebase use --add

# Déploiement des règles
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Build et Tests

### 1. Validation Pré-déploiement

```bash
# Tests complets
npm run test:all

# Vérification du code
npm run lint
npm run type-check

# Build de validation
npm run build

# Tests E2E (si configurés)
npm run e2e:test
```

### 2. Build de Production

#### Build Expo/Web
```bash
# Build statique
npm run build

# Vérification du build
npm run test:build
```

#### Build Native iOS
```bash
# Configuration EAS
eas login
eas configure

# Build iOS
eas build --platform ios --profile production

# Soumission à l'App Store (optionnel)
eas submit --platform ios --profile production
```

#### Build Native Android
```bash
# Build Android
eas build --platform android --profile production

# Soumission au Play Store (optionnel)
eas submit --platform android --profile production
```

## Déploiement par Environnement

### 1. Déploiement Staging

```bash
# Configuration staging
export NODE_ENV=staging

# Build staging
eas build --profile staging --platform all

# Tests de validation staging
npm run test:integration -- --env=staging

# Déploiement automatique via CI/CD
```

### 2. Déploiement Production

```bash
# Vérifications finales
npm run test:all
npm run build:validate

# Tag de version
git tag v1.0.0
git push origin v1.0.0

# Build production
eas build --profile production --platform all

# Soumission aux stores
eas submit --profile production --platform all
```

## Validation Post-déploiement

### 1. Tests de Smoke

Script de validation automatique :

```bash
#!/bin/bash
# smoke-test.sh

echo "🔥 Tests de Smoke Post-déploiement"

# Test de connectivité API
curl -f https://api.styleai.com/health || exit 1
echo "✅ API accessible"

# Test Firebase
firebase use styleai-prod
firebase firestore:get users/test-user || echo "⚠️  Firestore accessible"

# Test Gemini AI
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models || echo "⚠️  Gemini accessible"

echo "✅ Tous les services sont opérationnels"
```

### 2. Métriques de Performance

Vérifier après déploiement :
- **Temps de réponse API** < 2s
- **Taux d'erreur** < 1%
- **Crash rate** < 0.1%
- **Temps de démarrage** < 3s
- **Utilisation mémoire** < 200MB

### 3. Monitoring

Configuration des alertes :
- Erreurs d'authentification
- Timeouts API
- Échecs d'analyse IA
- Crash de l'application
- Utilisation excessive des quotas

## Rollback et Recovery

### 1. Procédure de Rollback

En cas de problème critique :

```bash
# 1. Identifier la version stable précédente
eas build:list --platform=all --limit=10

# 2. Rollback du build
eas build:republish --build-id=<previous-build-id>

# 3. Rollback des règles Firebase (si nécessaire)
firebase deploy --only firestore:rules --project=styleai-prod

# 4. Communication aux utilisateurs
echo "Incident résolu, version stable restaurée"
```

### 2. Plan de Recovery

1. **Incident mineur** (< 5% d'utilisateurs affectés)
   - Fix forward avec hotfix
   - Monitoring renforcé
   
2. **Incident majeur** (> 5% d'utilisateurs affectés)
   - Rollback immédiat
   - Investigation et fix
   - Re-déploiement après validation

3. **Incident critique** (service indisponible)
   - Rollback immédiat
   - Activation du mode dégradé
   - Communication externe

## Sécurité en Production

### 1. Gestion des Clés

```bash
# Chiffrement des secrets
npm install -g eas-cli
eas secret:create --scope project --name FIREBASE_API_KEY --value your_key

# Variables d'environnement sécurisées
eas secret:list
```

### 2. Audit de Sécurité

```bash
# Audit des dépendances
npm audit
npm audit fix

# Scan de sécurité
npx safety-cli scan

# Vérification des certificats
openssl x509 -in certificate.pem -text -noout
```

### 3. Conformité RGPD

- Consentement utilisateur explicite
- Politique de confidentialité à jour
- Droit à l'effacement des données
- Chiffrement des données sensibles

## Monitoring et Observabilité

### 1. Métriques Application

```typescript
// Analytics personnalisées
import analytics from '@react-native-firebase/analytics';

// Métriques métier
await analytics().logEvent('style_analysis_completed', {
  processing_time: 3.2,
  confidence_score: 0.85,
  user_tier: 'premium'
});

// Métriques de performance
await analytics().logEvent('screen_view', {
  screen_name: 'wardrobe',
  load_time: 1.2
});
```

### 2. Dashboards

Configuration des dashboards Firebase :
- **Utilisateurs actifs** (DAU/MAU)
- **Rétention** par cohorte
- **Performance** des écrans
- **Erreurs** et crashes
- **Utilisation** des features IA

### 3. Alertes

Configuration des alertes critiques :
```yaml
# firebase-alerts.yaml
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 5%"
    notification: "slack://dev-team"
  
  - name: "API Response Time"
    condition: "response_time > 3s"
    notification: "email://ops@styleai.com"
  
  - name: "Crash Rate Spike"
    condition: "crash_rate > 1%"
    notification: "pagerduty://critical"
```

## Maintenance et Mises à Jour

### 1. Planning des Mises à Jour

- **Patch releases** : Corrections de bugs (hebdomadaire)
- **Minor releases** : Nouvelles fonctionnalités (mensuel)
- **Major releases** : Changements importants (trimestriel)

### 2. Process de Mise à Jour

```bash
# 1. Création de la release
npm run release:prepare

# 2. Tests complets
npm run test:all

# 3. Build et déploiement
npm run deploy:production

# 4. Validation post-déploiement
npm run validate:production

# 5. Communication
npm run release:announce
```

### 3. Maintenance Préventive

- **Nettoyage** des données obsolètes (mensuel)
- **Mise à jour** des dépendances (bi-mensuel)
- **Audit** de sécurité (trimestriel)
- **Review** des performances (mensuel)

## Troubleshooting Production

### Problèmes Courants

#### 1. Erreurs d'Authentification
```bash
# Vérifier la configuration Firebase
firebase auth:export users.json --project styleai-prod

# Vérifier les quotas
firebase quota:get --project styleai-prod
```

#### 2. Lenteur API
```bash
# Analyser les logs
firebase functions:log --project styleai-prod

# Vérifier les métriques Firestore
firebase firestore:stats --project styleai-prod
```

#### 3. Problèmes IA/Gemini
```bash
# Tester l'API Gemini
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models

# Vérifier les quotas
# Via Google Cloud Console
```

### Logs et Debugging

```typescript
// Configuration des logs en production
import crashlytics from '@react-native-firebase/crashlytics';

// Log d'erreur avec contexte
crashlytics().log('User attempted style analysis');
crashlytics().setUserId(userId);
crashlytics().setAttribute('feature', 'style_analysis');
crashlytics().recordError(error);
```

## Checklist de Déploiement

### Pré-déploiement
- [ ] Tests unitaires passent (100%)
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Code review terminé
- [ ] Documentation mise à jour
- [ ] Variables d'environnement configurées
- [ ] Certificats valides
- [ ] Backup des données critiques

### Déploiement
- [ ] Build production validé
- [ ] Règles Firebase déployées
- [ ] Monitoring activé
- [ ] Alertes configurées
- [ ] Tests de smoke passent
- [ ] Métriques de base vérifiées

### Post-déploiement
- [ ] Fonctionnalités critiques testées
- [ ] Performance conforme aux SLA
- [ ] Aucune alerte critique
- [ ] Feedback utilisateurs vérifié
- [ ] Documentation de release publiée
- [ ] Équipe informée

---

**Contact Support** : Pour toute urgence de production, contactez l'équipe DevOps à ops@styleai.com ou utilisez le canal Slack #incident-response.