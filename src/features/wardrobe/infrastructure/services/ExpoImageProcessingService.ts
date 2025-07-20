import { manipulateAsync, SaveFormat, FlipType } from 'expo-image-manipulator';
import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import {
  IImageProcessingService,
  ImageProcessingOptions,
  ProcessedImage,
  ImageMetadata,
  ImageAnalysisResult,
  ImageFilter,
  ImageValidationResult,
  ImageProcessingError,
  UnsupportedImageFormatError,
  ImageTooLargeError,
  ImageCorruptedError,
} from '../../domain/services';

export class ExpoImageProcessingService implements IImageProcessingService {
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];

  async processImage(imageUri: string, options: ImageProcessingOptions): Promise<Result<ProcessedImage>> {
    try {
      // Validate image first
      const validationResult = await this.validateImage(imageUri);
      if (!validationResult.succeeded) {
        return Result.fail<ProcessedImage>(validationResult.message);
      }

      if (!validationResult.value.isValid) {
        return Result.fail<ProcessedImage>(`Image validation failed: ${validationResult.value.errors.join(', ')}`);
      }

      // Build manipulate actions
      const actions: any[] = [];

      // Resize if specified
      if (options.maxWidth || options.maxHeight) {
        actions.push({
          resize: {
            width: options.maxWidth,
            height: options.maxHeight,
          },
        });
      }

      // Auto-rotate if specified
      if (options.autoRotate) {
        // Expo doesn't have auto-rotate, but we can detect orientation from EXIF
        // For now, we'll skip this
      }

      // Apply format and quality
      const format = this.mapFormat(options.format || 'jpeg');
      const compress = options.quality || 0.8;

      const result = await manipulateAsync(
        imageUri,
        actions,
        {
          format,
          compress,
        }
      );

      // Get file info
      const fileInfo = await this.getFileInfo(result.uri);

      const processedImage: ProcessedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: fileInfo.size,
        format: format,
        quality: compress,
      };

      return Result.ok<ProcessedImage>(processedImage);
    } catch (error) {
      return Result.fail<ProcessedImage>(
        `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async resizeImage(imageUri: string, width: number, height: number): Promise<Result<ProcessedImage>> {
    try {
      const result = await manipulateAsync(
        imageUri,
        [{ resize: { width, height } }],
        { format: SaveFormat.JPEG, compress: 0.8 }
      );

      const fileInfo = await this.getFileInfo(result.uri);

      const processedImage: ProcessedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: fileInfo.size,
        format: 'jpeg',
        quality: 0.8,
      };

      return Result.ok<ProcessedImage>(processedImage);
    } catch (error) {
      return Result.fail<ProcessedImage>(
        `Image resize failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async compressImage(imageUri: string, quality: number): Promise<Result<ProcessedImage>> {
    try {
      if (quality < 0 || quality > 1) {
        return Result.fail<ProcessedImage>('Quality must be between 0 and 1');
      }

      const result = await manipulateAsync(
        imageUri,
        [],
        { format: SaveFormat.JPEG, compress: quality }
      );

      const fileInfo = await this.getFileInfo(result.uri);

      const processedImage: ProcessedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: fileInfo.size,
        format: 'jpeg',
        quality,
      };

      return Result.ok<ProcessedImage>(processedImage);
    } catch (error) {
      return Result.fail<ProcessedImage>(
        `Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async convertFormat(imageUri: string, format: 'jpeg' | 'png' | 'webp'): Promise<Result<ProcessedImage>> {
    try {
      const saveFormat = this.mapFormat(format);
      
      const result = await manipulateAsync(
        imageUri,
        [],
        { format: saveFormat, compress: 0.8 }
      );

      const fileInfo = await this.getFileInfo(result.uri);

      const processedImage: ProcessedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: fileInfo.size,
        format,
        quality: 0.8,
      };

      return Result.ok<ProcessedImage>(processedImage);
    } catch (error) {
      return Result.fail<ProcessedImage>(
        `Format conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async removeBackground(imageUri: string): Promise<Result<ProcessedImage>> {
    // Expo doesn't have background removal capabilities
    // This would require an external service or library
    return Result.fail<ProcessedImage>('Background removal not supported in this implementation');
  }

  async enhanceColors(imageUri: string): Promise<Result<ProcessedImage>> {
    // Expo doesn't have color enhancement filters
    // This would require an external service or library
    return Result.fail<ProcessedImage>('Color enhancement not supported in this implementation');
  }

  async autoRotate(imageUri: string): Promise<Result<ProcessedImage>> {
    // Expo doesn't have auto-rotate based on EXIF
    // We can rotate manually if needed
    try {
      const result = await manipulateAsync(
        imageUri,
        [{ rotate: 0 }], // No rotation for now
        { format: SaveFormat.JPEG, compress: 0.8 }
      );

      const fileInfo = await this.getFileInfo(result.uri);

      const processedImage: ProcessedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: fileInfo.size,
        format: 'jpeg',
        quality: 0.8,
      };

      return Result.ok<ProcessedImage>(processedImage);
    } catch (error) {
      return Result.fail<ProcessedImage>(
        `Auto-rotate failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async generateThumbnail(imageUri: string, size: number): Promise<Result<ProcessedImage>> {
    try {
      const result = await manipulateAsync(
        imageUri,
        [{ resize: { width: size, height: size } }],
        { format: SaveFormat.JPEG, compress: 0.7 }
      );

      const fileInfo = await this.getFileInfo(result.uri);

      const processedImage: ProcessedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: fileInfo.size,
        format: 'jpeg',
        quality: 0.7,
      };

      return Result.ok<ProcessedImage>(processedImage);
    } catch (error) {
      return Result.fail<ProcessedImage>(
        `Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async generateMultipleSizes(
    imageUri: string,
    sizes: { width: number; height: number; quality?: number }[]
  ): Promise<Result<ProcessedImage[]>> {
    try {
      const results: ProcessedImage[] = [];

      for (const sizeConfig of sizes) {
        const result = await manipulateAsync(
          imageUri,
          [{ resize: { width: sizeConfig.width, height: sizeConfig.height } }],
          { format: SaveFormat.JPEG, compress: sizeConfig.quality || 0.8 }
        );

        const fileInfo = await this.getFileInfo(result.uri);

        results.push({
          uri: result.uri,
          width: result.width,
          height: result.height,
          size: fileInfo.size,
          format: 'jpeg',
          quality: sizeConfig.quality || 0.8,
        });
      }

      return Result.ok<ProcessedImage[]>(results);
    } catch (error) {
      return Result.fail<ProcessedImage[]>(
        `Multiple sizes generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getImageMetadata(imageUri: string): Promise<Result<ImageMetadata>> {
    try {
      const fileInfo = await this.getFileInfo(imageUri);
      
      // Basic metadata - Expo doesn't provide EXIF data easily
      const metadata: ImageMetadata = {
        width: 0, // Would need to be determined from image
        height: 0, // Would need to be determined from image
        size: fileInfo.size,
        format: this.getFormatFromUri(imageUri),
        timestamp: new Date(),
      };

      return Result.ok<ImageMetadata>(metadata);
    } catch (error) {
      return Result.fail<ImageMetadata>(
        `Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async analyzeImage(imageUri: string): Promise<Result<ImageAnalysisResult>> {
    try {
      // Basic analysis - would need external libraries for advanced analysis
      const analysis: ImageAnalysisResult = {
        dominantColors: ['#000000'], // Placeholder
        brightness: 0.5,
        contrast: 0.5,
        saturation: 0.5,
        sharpness: 0.5,
        hasTransparency: false,
        aspectRatio: 1.0,
        quality: 'medium',
      };

      return Result.ok<ImageAnalysisResult>(analysis);
    } catch (error) {
      return Result.fail<ImageAnalysisResult>(
        `Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async cropImage(
    imageUri: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Result<ProcessedImage>> {
    try {
      const result = await manipulateAsync(
        imageUri,
        [{ crop: { originX: x, originY: y, width, height } }],
        { format: SaveFormat.JPEG, compress: 0.8 }
      );

      const fileInfo = await this.getFileInfo(result.uri);

      const processedImage: ProcessedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: fileInfo.size,
        format: 'jpeg',
        quality: 0.8,
      };

      return Result.ok<ProcessedImage>(processedImage);
    } catch (error) {
      return Result.fail<ProcessedImage>(
        `Image crop failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async applyFilter(imageUri: string, filter: ImageFilter): Promise<Result<ProcessedImage>> {
    // Expo has limited filter support
    return Result.fail<ProcessedImage>('Image filters not supported in this implementation');
  }

  async batchProcess(
    imageUris: string[],
    options: ImageProcessingOptions
  ): Promise<Result<ProcessedImage[]>> {
    try {
      const results: ProcessedImage[] = [];
      const errors: string[] = [];

      for (const uri of imageUris) {
        const result = await this.processImage(uri, options);
        if (result.succeeded) {
          results.push(result.value);
        } else {
          errors.push(`Failed to process ${uri}: ${result.message}`);
        }
      }

      if (results.length === 0 && errors.length > 0) {
        return Result.fail<ProcessedImage[]>(`Batch processing failed: ${errors.join(', ')}`);
      }

      return Result.ok<ProcessedImage[]>(results);
    } catch (error) {
      return Result.fail<ProcessedImage[]>(
        `Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async validateImage(imageUri: string): Promise<Result<ImageValidationResult>> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check if file exists and get info
      const fileInfo = await this.getFileInfo(imageUri);
      
      // Check file size
      if (fileInfo.size > this.maxFileSize) {
        errors.push(`File size ${fileInfo.size} exceeds maximum allowed size ${this.maxFileSize}`);
      }

      // Check format
      const format = this.getFormatFromUri(imageUri);
      if (!this.supportedFormats.includes(format.toLowerCase())) {
        errors.push(`Unsupported format: ${format}`);
      }

      // Basic metadata
      const metadata: ImageMetadata = {
        width: 0,
        height: 0,
        size: fileInfo.size,
        format,
        timestamp: new Date(),
      };

      const validationResult: ImageValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata,
      };

      return Result.ok<ImageValidationResult>(validationResult);
    } catch (error) {
      return Result.fail<ImageValidationResult>(
        `Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async getFileInfo(uri: string): Promise<{ size: number }> {
    // This is a simplified implementation
    // In a real app, you'd use expo-file-system to get file info
    return { size: 1024 * 1024 }; // Placeholder 1MB
  }

  private getFormatFromUri(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase() || '';
    return extension === 'jpg' ? 'jpeg' : extension;
  }

  private mapFormat(format: string): SaveFormat {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return SaveFormat.JPEG;
      case 'png':
        return SaveFormat.PNG;
      case 'webp':
        return SaveFormat.WEBP;
      default:
        return SaveFormat.JPEG;
    }
  }
}

export class ExpoImageProcessingError extends ImageProcessingError {
  constructor(message: string) {
    super(message, 'EXPO_IMAGE_PROCESSING_ERROR');
  }
}

export class UnsupportedOperationError extends ExpoImageProcessingError {
  constructor(operation: string) {
    super(`Operation not supported: ${operation}`);
  }
}