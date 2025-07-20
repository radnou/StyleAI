# Expo - Développement Mobile Simplifié

## 🎯 Objectifs d'apprentissage

À la fin de ce module, vous saurez :
- Utiliser l'écosystème Expo efficacement
- Configurer et gérer un projet Expo
- Accéder aux APIs natives
- Déployer et mettre à jour votre app

**Niveau** : 🟢 Débutant → 🟡 Intermédiaire

## 🚀 Qu'est-ce qu'Expo ?

Expo est une plateforme et un ensemble d'outils construits autour de React Native qui simplifie le développement, le build et le déploiement d'applications mobiles.

### Pourquoi Expo dans StyleAI ?

```typescript
// Configuration minimale pour des fonctionnalités complexes
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

// Accès caméra en 3 lignes
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3],
  quality: 1,
});
```

### Avantages clés
- **Développement rapide** : APIs prêtes à l'emploi
- **Build cloud** : Pas de Xcode/Android Studio requis
- **OTA Updates** : Mises à jour instantanées
- **Debugging** : Outils intégrés
- **Déploiement** : Pipeline automatisé

## 🏗️ Architecture Expo

### Workflow Options

```
Expo Managed Workflow
┌─────────────────────────────────────────┐
│  Expo CLI + Expo SDK + EAS Services    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │   Dev   │  │  Build  │  │ Update  │  │
│  │  Tools  │  │ Service │ │ Service │  │
│  └─────────┘  └─────────┘  └─────────┘  │
└─────────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │   React Native      │
    │     App Code        │
    └─────────────────────┘
```

### StyleAI Configuration
```json
// app.json - Configuration Expo pour StyleAI
{
  "expo": {
    "name": "StyleAI",
    "slug": "styleai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.styleai.app",
      "infoPlist": {
        "NSCameraUsageDescription": "StyleAI utilise la caméra pour analyser vos vêtements",
        "NSPhotoLibraryUsageDescription": "StyleAI accède à vos photos pour l'analyse de style"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.styleai.app",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
      [
        "expo-image-picker",
        {
          "photosPermission": "L'app accède à vos photos pour l'analyse de style."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## 📱 APIs Expo Essentielles

### 1. Image Picker (Sélection d'images)
```typescript
// src/features/styling/infrastructure/services/ImageService.ts
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export class ExpoImageService {
  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  async pickImageFromLibrary(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permission refusée pour accéder aux photos');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Carré pour l'analyse IA
      quality: 0.8, // Optimisation pour l'upload
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  }

  async takePhoto(): Promise<string | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission refusée pour accéder à la caméra');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  }

  async optimizeImageForAI(uri: string): Promise<string> {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        { resize: { width: 512, height: 512 } }, // Taille optimale pour l'IA
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipResult.uri;
  }
}
```

### 2. File System (Gestion de fichiers)
```typescript
// src/core/infrastructure/services/FileService.ts
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

export class ExpoFileService {
  private readonly cacheDir = `${FileSystem.cacheDirectory}styleai/`;

  async ensureCacheDir(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.cacheDir, { 
        intermediates: true 
      });
    }
  }

  async cacheImage(uri: string): Promise<string> {
    await this.ensureCacheDir();
    
    // Génération d'un nom unique
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.MD5,
      uri
    );
    const filename = `${hash}.jpg`;
    const localUri = `${this.cacheDir}${filename}`;

    // Vérifier si le fichier existe déjà
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      return localUri;
    }

    // Télécharger et cacher
    await FileSystem.downloadAsync(uri, localUri);
    return localUri;
  }

  async clearCache(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
    }
  }

  async getCacheSize(): Promise<number> {
    const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
    if (!dirInfo.exists) return 0;
    
    // Calculer la taille récursivement
    const files = await FileSystem.readDirectoryAsync(this.cacheDir);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = `${this.cacheDir}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        totalSize += fileInfo.size || 0;
      }
    }
    
    return totalSize;
  }
}
```

### 3. Secure Store (Stockage sécurisé)
```typescript
// src/core/infrastructure/services/SecureStorageService.ts
import * as SecureStore from 'expo-secure-store';

export class ExpoSecureStorageService {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  // Méthodes spécifiques pour StyleAI
  async storeAuthToken(token: string): Promise<void> {
    await this.setItem('auth_token', token);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.getItem('auth_token');
  }

  async clearAuthData(): Promise<void> {
    await this.removeItem('auth_token');
    await this.removeItem('refresh_token');
    await this.removeItem('user_preferences');
  }
}
```

### 4. Network (État du réseau)
```typescript
// src/core/infrastructure/services/NetworkService.ts
import * as Network from 'expo-network';

export class ExpoNetworkService {
  async getNetworkState(): Promise<Network.NetworkState> {
    return await Network.getNetworkStateAsync();
  }

  async isConnected(): Promise<boolean> {
    const networkState = await this.getNetworkState();
    return networkState.isConnected;
  }

  async getConnectionType(): Promise<Network.NetworkStateType> {
    const networkState = await this.getNetworkState();
    return networkState.type;
  }

  // Hook React pour surveiller la connectivité
  static useNetworkState() {
    const [networkState, setNetworkState] = useState<Network.NetworkState | null>(null);

    useEffect(() => {
      let isSubscribed = true;

      const updateNetworkState = async () => {
        const state = await Network.getNetworkStateAsync();
        if (isSubscribed) {
          setNetworkState(state);
        }
      };

      updateNetworkState();

      return () => {
        isSubscribed = false;
      };
    }, []);

    return networkState;
  }
}
```

## 🔧 Configuration et Build

### EAS Build Configuration
```json
// eas.json - Configuration EAS pour StyleAI
{
  "cli": {
    "version": ">= 7.8.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug",
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "../path/to/api-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "AB12CD34EF"
      }
    }
  }
}
```

### Scripts de build personnalisés
```json
// package.json - Scripts Expo pour StyleAI
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    
    "build:development": "eas build --profile development",
    "build:preview": "eas build --profile preview",
    "build:production": "eas build --profile production",
    
    "submit:android": "eas submit --platform android",
    "submit:ios": "eas submit --platform ios",
    
    "update:preview": "eas update --branch preview",
    "update:production": "eas update --branch production"
  }
}
```

## 🔄 Over-The-Air Updates

### Configuration EAS Update
```typescript
// src/core/infrastructure/services/UpdateService.ts
import * as Updates from 'expo-updates';

export class ExpoUpdateService {
  async checkForUpdates(): Promise<Updates.UpdateCheckResult> {
    try {
      const update = await Updates.checkForUpdateAsync();
      return update;
    } catch (error) {
      console.error('Erreur lors de la vérification des mises à jour:', error);
      throw error;
    }
  }

  async downloadAndApplyUpdate(): Promise<void> {
    try {
      const { isNew } = await Updates.fetchUpdateAsync();
      if (isNew) {
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de la mise à jour:', error);
      throw error;
    }
  }

  // Hook React pour gérer les mises à jour
  static useAppUpdates() {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
      checkForUpdate();
    }, []);

    const checkForUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        setIsUpdateAvailable(update.isAvailable);
      } catch (error) {
        console.error('Erreur check update:', error);
      }
    };

    const downloadUpdate = async () => {
      setIsDownloading(true);
      try {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch (error) {
        console.error('Erreur download update:', error);
      } finally {
        setIsDownloading(false);
      }
    };

    return {
      isUpdateAvailable,
      isDownloading,
      checkForUpdate,
      downloadUpdate,
    };
  }
}
```

### Composant de mise à jour
```typescript
// src/shared/components/updates/UpdatePrompt.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ExpoUpdateService } from '../../../core/infrastructure/services/UpdateService';

export const UpdatePrompt: React.FC = () => {
  const { isUpdateAvailable, isDownloading, downloadUpdate } = 
    ExpoUpdateService.useAppUpdates();

  if (!isUpdateAvailable) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Mise à jour disponible</Text>
        <Text style={styles.description}>
          Une nouvelle version de StyleAI est disponible avec des améliorations
          et de nouvelles fonctionnalités.
        </Text>
        
        <TouchableOpacity 
          style={styles.updateButton} 
          onPress={downloadUpdate}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Mettre à jour</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

## 🧪 Development Tools

### Expo DevTools
```typescript
// src/core/utils/DevTools.ts
export class ExpoDevTools {
  static enableRemoteDebugging() {
    if (__DEV__) {
      // Activer le remote debugging
      console.log('Remote debugging enabled');
    }
  }

  static showPerformanceMonitor() {
    if (__DEV__) {
      // Afficher le monitor de performance
      require('react-native').unstable_enableLogBox();
    }
  }

  static logNetworkRequests() {
    if (__DEV__) {
      // Logger toutes les requêtes réseau
      const originalFetch = fetch;
      global.fetch = (...args) => {
        console.log('Network request:', args[0]);
        return originalFetch(...args);
      };
    }
  }
}
```

### Debugging Configuration
```typescript
// App.tsx - Configuration debug pour StyleAI
import { ExpoDevTools } from './src/core/utils/DevTools';

if (__DEV__) {
  ExpoDevTools.enableRemoteDebugging();
  ExpoDevTools.logNetworkRequests();
  
  // Flipper integration
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
```

## 📱 Exemples pratiques StyleAI

### 1. Service d'upload d'images
```typescript
// src/features/styling/infrastructure/services/ImageUploadService.ts
import * as FileSystem from 'expo-file-system';
import { ExpoImageService } from './ExpoImageService';

export class ImageUploadService {
  private imageService = new ExpoImageService();

  async uploadOutfitImage(): Promise<string> {
    // 1. Sélectionner l'image
    const imageUri = await this.imageService.pickImageFromLibrary();
    if (!imageUri) throw new Error('Aucune image sélectionnée');

    // 2. Optimiser pour l'IA
    const optimizedUri = await this.imageService.optimizeImageForAI(imageUri);

    // 3. Convertir en base64
    const base64 = await FileSystem.readAsStringAsync(optimizedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 4. Upload vers le service
    const response = await fetch('https://api.styleai.com/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: JSON.stringify({
        image: base64,
        format: 'jpeg',
      }),
    });

    const result = await response.json();
    return result.analysisId;
  }

  private async getAuthToken(): Promise<string> {
    // Récupération du token depuis SecureStore
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) throw new Error('Token non trouvé');
    return token;
  }
}
```

### 2. Composant de sélection d'image
```typescript
// src/features/styling/presentation/components/ImageSelector.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageSelectorProps {
  onImageSelected: (uri: string) => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const showImagePicker = () => {
    Alert.alert(
      'Sélectionner une image',
      'Choisissez une source',
      [
        { text: 'Caméra', onPress: openCamera },
        { text: 'Galerie', onPress: openGallery },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès caméra nécessaire');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      onImageSelected(uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès galerie nécessaire');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      onImageSelected(uri);
    }
  };

  return (
    <View style={styles.container}>
      {selectedImage ? (
        <TouchableOpacity onPress={showImagePicker}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <Text style={styles.changeText}>Toucher pour changer</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.placeholder} onPress={showImagePicker}>
          <Text style={styles.placeholderText}>📷</Text>
          <Text style={styles.placeholderLabel}>Ajouter une photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

## 🚀 Exercices pratiques

### Exercice 1 : Service de cache d'images (45 min)
Implémentez un service qui :
- Cache automatiquement les images téléchargées
- Gère la taille du cache
- Nettoie les anciens fichiers
- Fournit un hook React

### Exercice 2 : Système de mise à jour (60 min)
Créez un système qui :
- Vérifie les mises à jour au démarrage
- Affiche une notification utilisateur
- Télécharge en arrière-plan
- Applique les mises à jour

### Exercice 3 : Upload progressif (75 min)
Développez un composant d'upload avec :
- Sélection d'images multiples
- Barre de progression
- Gestion d'erreurs
- Retry automatique

## 📚 Ressources pour approfondir

### Documentation officielle
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)

### APIs Expo utiles pour StyleAI
- **expo-image-picker** : Sélection d'images
- **expo-file-system** : Gestion de fichiers
- **expo-secure-store** : Stockage sécurisé
- **expo-av** : Audio/Vidéo
- **expo-location** : Géolocalisation
- **expo-notifications** : Notifications push

### Outils de développement
- **Expo CLI** : Interface en ligne de commande
- **Expo Go** : App de développement
- **EAS CLI** : Build et déploiement
- **Expo Snack** : Playground en ligne

---

**Prochaine étape** : Approfondissez [TypeScript pour React Native](../typescript/README.md) pour un code plus robuste et maintenable.