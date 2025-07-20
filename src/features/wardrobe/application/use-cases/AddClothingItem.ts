import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { ClothingItem, ClothingItemProps } from '../../domain/entities';
import { IClothingItemRepository } from '../../domain/repositories';
import { IImageProcessingService, IClothingCategorizationService } from '../../domain/services';
import { IStorageService } from '../../../../core/services/IStorageService';

export interface AddClothingItemRequest {
  name: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  color: string;
  size: string;
  season: string[];
  occasion: string[];
  imageUri?: string;
  tags?: string[];
  description?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition: string;
  material?: string;
  careInstructions?: string;
  userId: string;
  autoCategorizationEnabled?: boolean;
  processingOptions?: {
    enhanceImage?: boolean;
    removeBackground?: boolean;
    generateThumbnail?: boolean;
  };
}

export interface AddClothingItemResponse {
  item: ClothingItem;
  processingResults?: {
    originalImageUrl?: string;
    processedImageUrl?: string;
    thumbnailUrl?: string;
    categorizationResults?: any;
  };
  warnings?: string[];
}

export class AddClothingItem {
  constructor(
    private clothingItemRepository: IClothingItemRepository,
    private imageProcessingService: IImageProcessingService,
    private categorizationService: IClothingCategorizationService,
    private storageService: IStorageService
  ) {}

  async execute(request: AddClothingItemRequest): Promise<Result<AddClothingItemResponse>> {
    try {
      // Validate input
      const validationResult = this.validateRequest(request);
      if (!validationResult.succeeded) {
        return Result.fail<AddClothingItemResponse>(validationResult.message);
      }

      const warnings: string[] = [];
      let processedImageUrl: string | undefined;
      let thumbnailUrl: string | undefined;
      let categorizationResults: any;

      // Process image if provided
      if (request.imageUri) {
        const imageProcessingResult = await this.processImage(request.imageUri, request.processingOptions);
        if (!imageProcessingResult.succeeded) {
          warnings.push(`Image processing failed: ${imageProcessingResult.message}`);
        } else {
          processedImageUrl = imageProcessingResult.value.processedImageUrl;
          thumbnailUrl = imageProcessingResult.value.thumbnailUrl;
        }
      }

      // Auto-categorize if enabled
      let finalCategory = request.category;
      let finalSubcategory = request.subcategory;
      let finalSeasons = request.season;
      let finalOccasions = request.occasion;
      let finalTags = request.tags || [];

      if (request.autoCategorizationEnabled) {
        const categorizationResult = await this.performCategorization({
          imageUrl: processedImageUrl,
          name: request.name,
          description: request.description,
          brand: request.brand,
          existingTags: finalTags,
        });

        if (categorizationResult.succeeded) {
          categorizationResults = categorizationResult.value;
          if (!finalCategory) {
            finalCategory = categorizationResult.value.category;
          }
          if (!finalSubcategory) {
            finalSubcategory = categorizationResult.value.subcategory;
          }
          if (finalSeasons.length === 0) {
            finalSeasons = categorizationResult.value.suggestedSeasons;
          }
          if (finalOccasions.length === 0) {
            finalOccasions = categorizationResult.value.suggestedOccasions;
          }
          finalTags = [...new Set([...finalTags, ...categorizationResult.value.tags])];
        } else {
          warnings.push(`Auto-categorization failed: ${categorizationResult.message}`);
        }
      }

      // Create clothing item
      const itemProps: Omit<ClothingItemProps, 'id' | 'createdAt' | 'updatedAt'> = {
        name: request.name,
        category: finalCategory as any,
        subcategory: finalSubcategory,
        brand: request.brand,
        color: request.color,
        size: request.size,
        season: finalSeasons as any[],
        occasion: finalOccasions as any[],
        imageUrl: processedImageUrl,
        tags: finalTags,
        description: request.description,
        purchaseDate: request.purchaseDate,
        purchasePrice: request.purchasePrice,
        isFavorite: false,
        isArchived: false,
        condition: request.condition as any,
        material: request.material,
        careInstructions: request.careInstructions,
        timesWorn: 0,
        userId: request.userId,
      };

      const itemResult = ClothingItem.create(itemProps);
      if (!itemResult.succeeded) {
        return Result.fail<AddClothingItemResponse>(itemResult.message);
      }

      // Save to repository
      const saveResult = await this.clothingItemRepository.save(itemResult.value);
      if (!saveResult.succeeded) {
        return Result.fail<AddClothingItemResponse>(saveResult.message);
      }

      const response: AddClothingItemResponse = {
        item: saveResult.value,
        processingResults: {
          originalImageUrl: request.imageUri,
          processedImageUrl,
          thumbnailUrl,
          categorizationResults,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      return Result.ok<AddClothingItemResponse>(response);
    } catch (error) {
      return Result.fail<AddClothingItemResponse>(
        `Failed to add clothing item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateRequest(request: AddClothingItemRequest): Result<void> {
    if (!request.name || request.name.trim().length === 0) {
      return Result.fail<void>('Name is required');
    }

    if (!request.color || request.color.trim().length === 0) {
      return Result.fail<void>('Color is required');
    }

    if (!request.size || request.size.trim().length === 0) {
      return Result.fail<void>('Size is required');
    }

    if (!request.userId || request.userId.trim().length === 0) {
      return Result.fail<void>('User ID is required');
    }

    if (!request.condition || request.condition.trim().length === 0) {
      return Result.fail<void>('Condition is required');
    }

    if (request.purchasePrice !== undefined && request.purchasePrice < 0) {
      return Result.fail<void>('Purchase price cannot be negative');
    }

    return Result.ok<void>();
  }

  private async processImage(
    imageUri: string,
    options?: AddClothingItemRequest['processingOptions']
  ): Promise<Result<{ processedImageUrl: string; thumbnailUrl?: string }>> {
    try {
      const processingOptions = {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        format: 'jpeg' as const,
        enhanceColors: options?.enhanceImage || false,
        removeBackground: options?.removeBackground || false,
      };

      // Process main image
      const processedImageResult = await this.imageProcessingService.processImage(imageUri, processingOptions);
      if (!processedImageResult.succeeded) {
        return Result.fail<{ processedImageUrl: string; thumbnailUrl?: string }>(
          `Image processing failed: ${processedImageResult.message}`
        );
      }

      // Upload processed image to storage
      const uploadResult = await this.storageService.uploadFile(
        processedImageResult.value.uri,
        `clothing-items/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
      );

      if (!uploadResult.succeeded) {
        return Result.fail<{ processedImageUrl: string; thumbnailUrl?: string }>(
          `Image upload failed: ${uploadResult.message}`
        );
      }

      const result: { processedImageUrl: string; thumbnailUrl?: string } = {
        processedImageUrl: uploadResult.value.url,
      };

      // Generate thumbnail if requested
      if (options?.generateThumbnail) {
        const thumbnailResult = await this.imageProcessingService.generateThumbnail(
          processedImageResult.value.uri,
          200
        );
        if (thumbnailResult.succeeded) {
          const thumbnailUploadResult = await this.storageService.uploadFile(
            thumbnailResult.value.uri,
            `clothing-items/thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
          );
          if (thumbnailUploadResult.succeeded) {
            result.thumbnailUrl = thumbnailUploadResult.value.url;
          }
        }
      }

      return Result.ok<{ processedImageUrl: string; thumbnailUrl?: string }>(result);
    } catch (error) {
      return Result.fail<{ processedImageUrl: string; thumbnailUrl?: string }>(
        `Image processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async performCategorization(input: {
    imageUrl?: string;
    name: string;
    description?: string;
    brand?: string;
    existingTags: string[];
  }): Promise<Result<any>> {
    try {
      const categorizationResult = await this.categorizationService.categorizeItem(input);
      return categorizationResult;
    } catch (error) {
      return Result.fail<any>(
        `Categorization error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export class AddClothingItemError extends BaseError {
  constructor(message: string) {
    super(message, 'ADD_CLOTHING_ITEM_ERROR');
  }
}

export class ImageProcessingFailedError extends AddClothingItemError {
  constructor(message: string) {
    super(`Image processing failed: ${message}`);
  }
}

export class CategorizationFailedError extends AddClothingItemError {
  constructor(message: string) {
    super(`Categorization failed: ${message}`);
  }
}