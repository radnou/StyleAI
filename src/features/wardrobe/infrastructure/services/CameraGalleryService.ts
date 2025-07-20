import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';

export interface CameraOptions {
  quality?: number; // 0-1
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: 'Images' | 'Videos' | 'All';
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
}

export interface GalleryOptions {
  quality?: number; // 0-1
  allowsEditing?: boolean;
  allowsMultipleSelection?: boolean;
  mediaTypes?: 'Images' | 'Videos' | 'All';
  aspect?: [number, number];
  selectionLimit?: number;
}

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  type?: 'image' | 'video';
  cancelled?: boolean;
  fileSize?: number;
  exif?: Record<string, any>;
  base64?: string;
}

export interface PermissionStatus {
  camera: boolean;
  mediaLibrary: boolean;
  cameraRoll: boolean;
}

export interface ICameraGalleryService {
  /**
   * Check and request permissions
   */
  requestPermissions(): Promise<Result<PermissionStatus>>;

  /**
   * Check permission status
   */
  getPermissionStatus(): Promise<Result<PermissionStatus>>;

  /**
   * Capture image from camera
   */
  captureImage(options?: CameraOptions): Promise<Result<ImageResult>>;

  /**
   * Select image from gallery
   */
  selectFromGallery(options?: GalleryOptions): Promise<Result<ImageResult | ImageResult[]>>;

  /**
   * Select multiple images from gallery
   */
  selectMultipleFromGallery(options?: GalleryOptions): Promise<Result<ImageResult[]>>;

  /**
   * Save image to device gallery
   */
  saveToGallery(uri: string): Promise<Result<string>>;

  /**
   * Get camera availability
   */
  isCameraAvailable(): Promise<Result<boolean>>;

  /**
   * Get gallery access
   */
  isGalleryAvailable(): Promise<Result<boolean>>;
}

export class CameraGalleryService implements ICameraGalleryService {
  async requestPermissions(): Promise<Result<PermissionStatus>> {
    try {
      // Request camera permissions
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      
      // Request media library permissions
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      
      // Request camera roll permissions (for selecting from gallery)
      const cameraRollPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      const status: PermissionStatus = {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
        cameraRoll: cameraRollPermission.status === 'granted',
      };

      return Result.ok<PermissionStatus>(status);
    } catch (error) {
      return Result.fail<PermissionStatus>(
        `Failed to request permissions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getPermissionStatus(): Promise<Result<PermissionStatus>> {
    try {
      // Get camera permissions
      const cameraPermission = await Camera.getCameraPermissionsAsync();
      
      // Get media library permissions
      const mediaLibraryPermission = await MediaLibrary.getPermissionsAsync();
      
      // Get camera roll permissions
      const cameraRollPermission = await ImagePicker.getMediaLibraryPermissionsAsync();

      const status: PermissionStatus = {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
        cameraRoll: cameraRollPermission.status === 'granted',
      };

      return Result.ok<PermissionStatus>(status);
    } catch (error) {
      return Result.fail<PermissionStatus>(
        `Failed to get permission status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async captureImage(options: CameraOptions = {}): Promise<Result<ImageResult>> {
    try {
      // Check camera permission
      const permissionResult = await this.getPermissionStatus();
      if (!permissionResult.succeeded) {
        return Result.fail<ImageResult>(permissionResult.message);
      }

      if (!permissionResult.value.camera) {
        return Result.fail<ImageResult>('Camera permission not granted');
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: this.mapMediaTypes(options.mediaTypes),
        quality: options.quality ?? 0.8,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect,
        presentationStyle: this.mapPresentationStyle(options.presentationStyle),
        exif: true,
      });

      if (result.canceled) {
        return Result.fail<ImageResult>('Camera capture cancelled');
      }

      const asset = result.assets[0];
      const imageResult: ImageResult = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type as 'image' | 'video',
        fileSize: asset.fileSize,
        exif: asset.exif,
        base64: asset.base64,
      };

      return Result.ok<ImageResult>(imageResult);
    } catch (error) {
      return Result.fail<ImageResult>(
        `Camera capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async selectFromGallery(options: GalleryOptions = {}): Promise<Result<ImageResult | ImageResult[]>> {
    try {
      // Check gallery permission
      const permissionResult = await this.getPermissionStatus();
      if (!permissionResult.succeeded) {
        return Result.fail<ImageResult | ImageResult[]>(permissionResult.message);
      }

      if (!permissionResult.value.cameraRoll) {
        return Result.fail<ImageResult | ImageResult[]>('Gallery permission not granted');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: this.mapMediaTypes(options.mediaTypes),
        quality: options.quality ?? 0.8,
        allowsEditing: options.allowsEditing ?? true,
        allowsMultipleSelection: options.allowsMultipleSelection ?? false,
        aspect: options.aspect,
        selectionLimit: options.selectionLimit ?? 1,
        exif: true,
      });

      if (result.canceled) {
        return Result.fail<ImageResult | ImageResult[]>('Gallery selection cancelled');
      }

      if (options.allowsMultipleSelection) {
        const imageResults: ImageResult[] = result.assets.map(asset => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type as 'image' | 'video',
          fileSize: asset.fileSize,
          exif: asset.exif,
          base64: asset.base64,
        }));

        return Result.ok<ImageResult | ImageResult[]>(imageResults);
      } else {
        const asset = result.assets[0];
        const imageResult: ImageResult = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type as 'image' | 'video',
          fileSize: asset.fileSize,
          exif: asset.exif,
          base64: asset.base64,
        };

        return Result.ok<ImageResult | ImageResult[]>(imageResult);
      }
    } catch (error) {
      return Result.fail<ImageResult | ImageResult[]>(
        `Gallery selection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async selectMultipleFromGallery(options: GalleryOptions = {}): Promise<Result<ImageResult[]>> {
    try {
      const modifiedOptions: GalleryOptions = {
        ...options,
        allowsMultipleSelection: true,
        selectionLimit: options.selectionLimit ?? 10,
      };

      const result = await this.selectFromGallery(modifiedOptions);
      
      if (!result.succeeded) {
        return Result.fail<ImageResult[]>(result.message);
      }

      // Ensure we return an array
      const images = Array.isArray(result.value) ? result.value : [result.value];
      return Result.ok<ImageResult[]>(images);
    } catch (error) {
      return Result.fail<ImageResult[]>(
        `Multiple gallery selection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async saveToGallery(uri: string): Promise<Result<string>> {
    try {
      // Check media library permission
      const permissionResult = await this.getPermissionStatus();
      if (!permissionResult.succeeded) {
        return Result.fail<string>(permissionResult.message);
      }

      if (!permissionResult.value.mediaLibrary) {
        return Result.fail<string>('Media library permission not granted');
      }

      // Save to media library
      const asset = await MediaLibrary.saveToLibraryAsync(uri);
      return Result.ok<string>(asset.id);
    } catch (error) {
      return Result.fail<string>(
        `Failed to save to gallery: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async isCameraAvailable(): Promise<Result<boolean>> {
    try {
      const available = await Camera.isAvailableAsync();
      return Result.ok<boolean>(available);
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to check camera availability: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async isGalleryAvailable(): Promise<Result<boolean>> {
    try {
      // Gallery is generally available on all devices, but check permissions
      const permissionResult = await this.getPermissionStatus();
      if (!permissionResult.succeeded) {
        return Result.ok<boolean>(false);
      }

      return Result.ok<boolean>(permissionResult.value.cameraRoll);
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to check gallery availability: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private mapMediaTypes(mediaTypes?: string): ImagePicker.MediaTypeOptions {
    switch (mediaTypes) {
      case 'Images':
        return ImagePicker.MediaTypeOptions.Images;
      case 'Videos':
        return ImagePicker.MediaTypeOptions.Videos;
      case 'All':
        return ImagePicker.MediaTypeOptions.All;
      default:
        return ImagePicker.MediaTypeOptions.Images;
    }
  }

  private mapPresentationStyle(style?: string): ImagePicker.UIImagePickerPresentationStyle {
    switch (style) {
      case 'fullScreen':
        return ImagePicker.UIImagePickerPresentationStyle.FullScreen;
      case 'pageSheet':
        return ImagePicker.UIImagePickerPresentationStyle.PageSheet;
      case 'formSheet':
        return ImagePicker.UIImagePickerPresentationStyle.FormSheet;
      case 'overFullScreen':
        return ImagePicker.UIImagePickerPresentationStyle.OverFullScreen;
      default:
        return ImagePicker.UIImagePickerPresentationStyle.FullScreen;
    }
  }
}

export class CameraGalleryError extends BaseError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

export class PermissionDeniedError extends CameraGalleryError {
  constructor(permission: string) {
    super(`Permission denied: ${permission}`, 'PERMISSION_DENIED');
  }
}

export class CameraNotAvailableError extends CameraGalleryError {
  constructor() {
    super('Camera is not available on this device', 'CAMERA_NOT_AVAILABLE');
  }
}

export class OperationCancelledError extends CameraGalleryError {
  constructor(operation: string) {
    super(`Operation cancelled: ${operation}`, 'OPERATION_CANCELLED');
  }
}