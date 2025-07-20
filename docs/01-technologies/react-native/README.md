# React Native - Le Futur du Développement Mobile

## 🎯 Objectifs d'apprentissage

À la fin de ce module, vous saurez :
- Comprendre l'architecture React Native
- Développer des interfaces mobiles natives
- Optimiser les performances
- Gérer la navigation et l'état

**Niveau** : 🟢 Débutant → 🟡 Intermédiaire

## 🚀 Qu'est-ce que React Native ?

React Native est un framework de développement mobile qui permet de créer des applications natives pour iOS et Android en utilisant JavaScript et React.

### Avantages clés
- **Code partagé** : 80-90% du code réutilisable
- **Performance native** : Rendu natif, pas WebView
- **Écosystème React** : Composants, patterns familiers
- **Hot Reload** : Développement rapide et itératif

### Comment ça fonctionne ?

```
JavaScript Code → Bridge → Native Modules → Native UI
```

## 🏗️ Architecture React Native

### Thread Model
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JavaScript    │    │      Bridge     │    │     Native      │
│     Thread      │◄──►│                 │◄──►│     Thread      │
│                 │    │   (Async Comm)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **JS Thread** : Logique métier, state management
2. **Bridge** : Communication asynchrone
3. **Native Thread** : Rendu UI, interactions utilisateur

### New Architecture (Fabric + TurboModules)
- **Fabric** : Nouveau moteur de rendu
- **TurboModules** : Modules natifs optimisés
- **JSI** : JavaScript Interface directe

## 🧩 Composants fondamentaux

### Core Components

```typescript
import React from 'react';
import {
  View,        // Conteneur (div équivalent)
  Text,        // Texte (span/p équivalent)
  ScrollView,  // Vue défilante
  FlatList,    // Liste optimisée
  TextInput,   // Champ de saisie
  TouchableOpacity, // Bouton touchable
  Image,       // Images
  SafeAreaView, // Zone sûre (notch, status bar)
} from 'react-native';

const BasicComponents = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          StyleAI
        </Text>
        <TextInput
          placeholder="Rechercher..."
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            marginVertical: 10,
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Analyser mon style
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
```

## 🎨 Styling avec StyleSheet

### StyleSheet API
```typescript
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    
    // Ombres iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Ombres Android
    elevation: 3,
  },
  
  responsive: {
    width: width * 0.9,
    height: height * 0.3,
  },
  
  // Flexbox
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
```

### Exemple StyleAI : Card d'outfit
```typescript
// src/shared/components/outfit/OutfitCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface OutfitCardProps {
  outfit: {
    id: string;
    imageUrl: string;
    title: string;
    confidence: number;
    items: string[];
  };
  onPress: () => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: outfit.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{outfit.title}</Text>
        
        <View style={styles.confidence}>
          <Text style={styles.confidenceText}>
            Confiance: {outfit.confidence}%
          </Text>
        </View>
        
        <Text style={styles.items}>
          {outfit.items.join(' • ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    
    // Ombre sophistiquée
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  
  content: {
    padding: 16,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  
  confidence: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  
  confidenceText: {
    fontSize: 12,
    color: '#2d8f2d',
    fontWeight: '500',
  },
  
  items: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
```

## 📱 Platform-Specific Code

### Platform API
```typescript
import { Platform } from 'react-native';

const platformStyles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 44 : 24, // Status bar height
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

// Version spécifique par plateforme
const MyComponent = Platform.select({
  ios: () => require('./MyComponent.ios').default,
  android: () => require('./MyComponent.android').default,
})();
```

### Exemple StyleAI : Camera différentielle
```typescript
// src/features/styling/presentation/components/CameraCapture.tsx
import React from 'react';
import { Platform } from 'react-native';

// Import conditionnel
const CameraComponent = Platform.select({
  ios: () => require('./CameraCapture.ios').CameraCaptureIOS,
  android: () => require('./CameraCapture.android').CameraCaptureAndroid,
})();

export const CameraCapture = CameraComponent;
```

## 🔄 Gestion de l'état local

### useState Hook
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
}

const WardrobeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);

  // Effet pour filtrer
  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>{item.category}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Rechercher dans ma garde-robe..."
        style={{
          margin: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
        }}
      />
      
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', padding: 20, color: '#666' }}>
            Aucun vêtement trouvé
          </Text>
        }
      />
    </View>
  );
};
```

## 📜 Listes et performances

### FlatList optimisée
```typescript
import React, { memo, useCallback } from 'react';
import { FlatList, View, Text, Image } from 'react-native';

interface OutfitListProps {
  outfits: Outfit[];
  onOutfitPress: (outfitId: string) => void;
}

// Composant mémoïsé pour éviter les re-renders
const OutfitListItem = memo<{ item: Outfit; onPress: (id: string) => void }>(
  ({ item, onPress }) => {
    const handlePress = useCallback(() => {
      onPress(item.id);
    }, [item.id, onPress]);

    return (
      <TouchableOpacity onPress={handlePress} style={styles.listItem}>
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>Confiance: {item.confidence}%</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

export const OutfitList: React.FC<OutfitListProps> = ({ outfits, onOutfitPress }) => {
  // Fonction de rendu mémoïsée
  const renderItem = useCallback(
    ({ item }: { item: Outfit }) => (
      <OutfitListItem item={item} onPress={onOutfitPress} />
    ),
    [onOutfitPress]
  );

  // Key extractor optimisé
  const keyExtractor = useCallback((item: Outfit) => item.id, []);

  return (
    <FlatList
      data={outfits}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      
      // Optimisations de performance
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      
      // Gestion du loading
      onEndReachedThreshold={0.5}
      onEndReached={loadMoreOutfits}
      
      // Empty state
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text>Aucun outfit trouvé</Text>
        </View>
      }
    />
  );
};
```

## 🎭 Animations et interactions

### Animated API
```typescript
import React, { useRef, useEffect } from 'react';
import { Animated, TouchableWithoutFeedback, Easing } from 'react-native';

const PulsingButton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const pulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  useEffect(() => {
    pulseAnimation();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      {children}
    </Animated.View>
  );
};
```

## 🔧 Debugging et DevTools

### Console et logging
```typescript
// Development logging
if (__DEV__) {
  console.log('Debug info:', userData);
}

// Production-safe logging
import { logger } from '../core/utils/logger';

logger.info('User logged in', { userId: user.id });
logger.error('API error', { error: error.message, endpoint: '/api/user' });
```

### React DevTools
- Installation : `npm install -g react-devtools`
- Utilisation : `react-devtools` dans le terminal
- Inspection des composants et props

### Flipper Integration
```typescript
// Flipper logging
import { logger } from 'flipper';

logger.info('Network request', {
  url: 'https://api.styleai.com/analyze',
  method: 'POST',
  payload: imageData,
});
```

## 📱 Exemples pratiques StyleAI

### 1. Écran d'analyse de style
```typescript
// src/navigation/screens/styling/StyleAnalysisScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useStyleAnalysis } from '../../features/styling/presentation/hooks/useStyleAnalysis';

export const StyleAnalysisScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { analyzeStyle, isLoading, result, error } = useStyleAnalysis();

  const handleAnalyze = async () => {
    if (selectedImage) {
      await analyzeStyle(selectedImage);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analyse de Style</Text>
        <Text style={styles.subtitle}>
          Uploadez une photo pour recevoir des conseils personnalisés
        </Text>
      </View>

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
      )}

      <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Analyser mon style</Text>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Résultats de l'analyse</Text>
          {result.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendation}>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recDescription}>{rec.description}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};
```

## 🚀 Exercices pratiques

### Exercice 1 : Liste de garde-robe (30 min)
Créez un composant `WardrobeList` qui :
- Affiche une liste d'vêtements
- Permet de filtrer par catégorie
- Inclut un système de recherche
- Gère les états de chargement

### Exercice 2 : Card d'outfit animée (45 min)
Implémentez une `OutfitCard` avec :
- Animation d'apparition
- Effet de hover/press
- Gestion des images
- Actions swipe

### Exercice 3 : Écran complet (60 min)
Développez un écran de profil utilisateur avec :
- Navigation entre sections
- Formulaire d'édition
- Upload de photo de profil
- Sauvegarde automatique

## 📚 Ressources pour approfondir

### Documentation officielle
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Native Directory](https://reactnative.directory/)
- [React Native Community](https://github.com/react-native-community)

### Outils recommandés
- **VS Code** avec React Native Tools
- **React DevTools** pour debugging
- **Flipper** pour inspection native
- **Reactotron** pour debugging state

### Bibliothèques utiles
```json
{
  "react-native-vector-icons": "^10.0.3",
  "react-native-image-picker": "^7.1.0",
  "react-native-modal": "^13.0.1",
  "react-native-animatable": "^1.4.0"
}
```

---

**Prochaine étape** : Découvrez [Expo et l'écosystème de développement](../expo/README.md) pour accélérer votre développement mobile.