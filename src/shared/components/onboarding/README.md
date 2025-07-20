# Système d'Onboarding StyleAI

Un système d'onboarding complet et moderne avec animations fluides, gestion d'état avancée et composants réutilisables.

## 🚀 Fonctionnalités

- **Écrans d'onboarding animés** avec transitions fluides
- **Gestion d'état centralisée** avec Zustand
- **Composants réutilisables** pour différents types d'onboarding
- **Système de permissions** avec explications contextuelles
- **Tooltips et guided tours** pour les fonctionnalités complexes
- **Animations optimisées** avec React Native Reanimated
- **Navigation conditionnelle** basée sur l'état utilisateur

## 📁 Structure

```
src/shared/components/onboarding/
├── OnboardingContainer.tsx      # Container principal avec navigation
├── ProgressBar.tsx             # Barres de progression (linéaire, circulaire, par étapes)
├── StepIndicator.tsx           # Indicateurs d'étapes avancés
├── AnimatedTransition.tsx      # Transitions animées réutilisables
├── Tooltip.tsx                 # Tooltips contextuels
├── GuidedTour.tsx             # Visites guidées interactives
├── AnimationManager.tsx        # Gestionnaire d'animations optimisé
└── index.ts                   # Exports centralisés
```

## 🎯 Utilisation

### 1. Écrans d'Onboarding de Base

```tsx
import { OnboardingContainer } from '@/shared/components/onboarding';

function MyOnboardingScreen({ navigation }) {
  const handleNext = () => {
    navigation.navigate('NextScreen');
  };

  return (
    <OnboardingContainer
      currentStep={0}
      totalSteps={5}
      onNext={handleNext}
      onPrevious={() => navigation.goBack()}
      showSkip={true}
    >
      {/* Votre contenu ici */}
    </OnboardingContainer>
  );
}
```

### 2. Gestion d'État

```tsx
import { useOnboardingActions, useOnboarding } from '@/store/store';

function MyComponent() {
  const { 
    startOnboarding, 
    completeStep, 
    updatePersonalInfo 
  } = useOnboardingActions();
  
  const onboarding = useOnboarding();

  const handleComplete = () => {
    completeStep('my-step', { data: 'example' });
  };
}
```

### 3. Animations

```tsx
import { useOptimizedAnimation, AnimationManager } from '@/shared/components/onboarding';

function AnimatedComponent() {
  const animation = useOptimizedAnimation('slideIn', 'right', 300);

  return (
    <Animated.View style={[animation]}>
      {/* Contenu animé */}
    </Animated.View>
  );
}

// Dans votre App.tsx
function App() {
  return (
    <AnimationManager>
      <YourAppContent />
    </AnimationManager>
  );
}
```

### 4. Tooltips

```tsx
import { Tooltip, TooltipTrigger } from '@/shared/components/onboarding';

function ComponentWithTooltip() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <Button onPress={() => setShowTooltip(true)}>
        Aide
      </Button>
      
      <Tooltip
        visible={showTooltip}
        onClose={() => setShowTooltip(false)}
        title="Fonctionnalité avancée"
        content="Cette fonctionnalité vous permet de..."
        position="top"
      />
    </>
  );
}
```

### 5. Guided Tours

```tsx
import { GuidedTour, useGuidedTour } from '@/shared/components/onboarding';

function MyScreen() {
  const { startTour, isTourActive } = useGuidedTour();
  const buttonRef = useRef(null);

  const tourSteps = [
    {
      id: 'step1',
      target: buttonRef,
      title: 'Première étape',
      content: 'Cliquez ici pour commencer',
      position: 'bottom',
    },
    // ... autres étapes
  ];

  return (
    <>
      <Button ref={buttonRef} onPress={() => startTour('my-tour')}>
        Démarrer le tour
      </Button>
      
      <GuidedTour
        steps={tourSteps}
        visible={isTourActive('my-tour')}
        onComplete={() => console.log('Tour terminé')}
      />
    </>
  );
}
```

## 🎨 Composants Disponibles

### OnboardingContainer

Container principal pour les écrans d'onboarding avec navigation intégrée.

**Props principales :**
- `currentStep`: Étape actuelle (number)
- `totalSteps`: Nombre total d'étapes (number)
- `onNext/onPrevious`: Callbacks de navigation
- `showProgress`: Afficher la barre de progression
- `nextDisabled`: Désactiver le bouton suivant

### ProgressBar

Barres de progression avec différents styles.

**Variantes :**
- `linear`: Barre linéaire classique
- `stepped`: Progression par étapes individuelles
- `circular`: Progression circulaire

### StepIndicator

Indicateurs d'étapes avancés avec support vertical/horizontal.

**Variantes :**
- `dots`: Points simples
- `numbers`: Numéros dans des cercles
- `icons`: Icônes personnalisées

### AnimatedTransition

Transitions animées pour les changements d'écran.

**Types disponibles :**
- `fade`: Fondu
- `slide`: Glissement (left/right/up/down)
- `bounce`: Rebond
- `zoom`: Zoom
- `flip`: Retournement

## 🔧 Configuration

### Store d'Onboarding

Le store d'onboarding gère automatiquement :
- Progression des étapes
- Données utilisateur collectées
- État des permissions
- Historique de navigation

### Animations

Les animations sont optimisées pour les performances avec :
- Support du mode réduit (accessibility)
- Qualité d'animation configurable
- Gestionnaire de séquences d'animations

### Permissions

Le système de permissions inclut :
- Demandes contextuelles avec explications
- Gestion des refus et redirections
- Statuts persistants

## 📱 Écrans Inclus

1. **WelcomeScreen** - Écran d'accueil avec animation
2. **ProfileSetupScreen** - Configuration du profil utilisateur
3. **StylePreferencesScreen** - Sélection des préférences de style
4. **PermissionsScreen** - Gestion des autorisations
5. **CompletionScreen** - Finalisation de l'onboarding

## 🎯 Bonnes Pratiques

### Performance
- Utilisez `useOptimizedAnimation` pour les animations complexes
- Configurez la qualité d'animation selon l'appareil
- Activez le mode réduit pour l'accessibilité

### UX
- Gardez les étapes courtes et focalisées
- Fournissez toujours une option "Passer"
- Expliquez clairement pourquoi les permissions sont nécessaires
- Utilisez des animations cohérentes

### Accessibilité
- Supportez le mode de mouvement réduit
- Fournissez des alternatives textuelles
- Assurez-vous que les contrastes sont suffisants
- Testez avec les lecteurs d'écran

## 🔮 Extensions Futures

- Support des vidéos d'introduction
- Onboarding adaptatif basé sur l'usage
- A/B testing intégré
- Analytics d'abandon par étape
- Personnalisation avancée des thèmes

## 📚 Ressources

- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Tamagui Documentation](https://tamagui.dev/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Expo Permissions](https://docs.expo.dev/versions/latest/sdk/permissions/)