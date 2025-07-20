// Domain exports
export * from './domain/entities';
export * from './domain/repositories';
export * from './domain/services';

// Application exports
export * from './application/use-cases';

// Infrastructure exports
export * from './infrastructure/repositories/FirebaseClothingItemRepository';
export * from './infrastructure/services/FirebaseStorageService';
export * from './infrastructure/services/ExpoImageProcessingService';
export * from './infrastructure/services/GeminiClothingCategorizationService';
export * from './infrastructure/services/CameraGalleryService';

// Presentation exports
export * from './presentation/hooks/useClothingItems';
export * from './presentation/components/ImageCapture';