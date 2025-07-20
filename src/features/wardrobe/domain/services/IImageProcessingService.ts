import { Result } from '../../../../core/types';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
  removeBackground?: boolean;
  enhanceColors?: boolean;
  autoRotate?: boolean;
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  format: string;
  quality: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
  orientation?: number;
  colorSpace?: string;
  hasAlpha?: boolean;
  timestamp?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ImageAnalysisResult {
  dominantColors: string[];
  brightness: number; // 0-1
  contrast: number; // 0-1
  saturation: number; // 0-1
  sharpness: number; // 0-1
  hasTransparency: boolean;
  aspectRatio: number;
  quality: 'low' | 'medium' | 'high';
}

export interface IImageProcessingService {
  /**
   * Process an image with specified options
   */
  processImage(imageUri: string, options: ImageProcessingOptions): Promise<Result<ProcessedImage>>;

  /**
   * Resize an image to specified dimensions
   */
  resizeImage(imageUri: string, width: number, height: number): Promise<Result<ProcessedImage>>;

  /**
   * Compress an image to reduce file size
   */
  compressImage(imageUri: string, quality: number): Promise<Result<ProcessedImage>>;

  /**
   * Convert image format
   */
  convertFormat(imageUri: string, format: 'jpeg' | 'png' | 'webp'): Promise<Result<ProcessedImage>>;

  /**
   * Remove background from image
   */
  removeBackground(imageUri: string): Promise<Result<ProcessedImage>>;

  /**
   * Enhance image colors
   */
  enhanceColors(imageUri: string): Promise<Result<ProcessedImage>>;

  /**
   * Auto-rotate image based on EXIF data
   */
  autoRotate(imageUri: string): Promise<Result<ProcessedImage>>;

  /**
   * Generate thumbnail from image
   */
  generateThumbnail(imageUri: string, size: number): Promise<Result<ProcessedImage>>;

  /**
   * Generate multiple sizes of an image
   */
  generateMultipleSizes(
    imageUri: string,
    sizes: { width: number; height: number; quality?: number }[]
  ): Promise<Result<ProcessedImage[]>>;

  /**
   * Get image metadata
   */
  getImageMetadata(imageUri: string): Promise<Result<ImageMetadata>>;

  /**
   * Analyze image properties
   */
  analyzeImage(imageUri: string): Promise<Result<ImageAnalysisResult>>;

  /**
   * Crop image to specified area
   */
  cropImage(
    imageUri: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Result<ProcessedImage>>;

  /**
   * Apply filters to image
   */
  applyFilter(imageUri: string, filter: ImageFilter): Promise<Result<ProcessedImage>>;

  /**
   * Batch process multiple images
   */
  batchProcess(
    imageUris: string[],
    options: ImageProcessingOptions
  ): Promise<Result<ProcessedImage[]>>;

  /**
   * Validate image format and size
   */
  validateImage(imageUri: string): Promise<Result<ImageValidationResult>>;
}

export interface ImageFilter {
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sharpen' | 'sepia' | 'grayscale';
  value: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: ImageMetadata;
}

export class ImageProcessingError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class UnsupportedImageFormatError extends ImageProcessingError {
  constructor(format: string) {
    super(`Unsupported image format: ${format}`, 'UNSUPPORTED_FORMAT');
  }
}

export class ImageTooLargeError extends ImageProcessingError {
  constructor(size: number, maxSize: number) {
    super(`Image size ${size} exceeds maximum allowed size ${maxSize}`, 'IMAGE_TOO_LARGE');
  }
}

export class ImageCorruptedError extends ImageProcessingError {
  constructor() {
    super('Image file is corrupted or unreadable', 'IMAGE_CORRUPTED');
  }
}