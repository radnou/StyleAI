import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { ClothingItem } from '../../domain/entities';
import { IClothingItemRepository } from '../../domain/repositories';
import { IImageProcessingService, IClothingCategorizationService } from '../../domain/services';
import { IStorageService } from '../../../../core/services/IStorageService';

export interface UpdateClothingItemRequest {
  itemId: string;
  name?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  color?: string;
  size?: string;
  season?: string[];
  occasion?: string[];
  imageUri?: string;
  tags?: string[];
  description?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition?: string;
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

export interface UpdateClothingItemResponse {
  item: ClothingItem;
  processingResults?: {
    originalImageUrl?: string;
    processedImageUrl?: string;
    thumbnailUrl?: string;
    categorizationResults?: any;
  };
  warnings?: string[];
}

export class UpdateClothingItem {
  constructor(
    private clothingItemRepository: IClothingItemRepository,
    private imageProcessingService: IImageProcessingService,
    private categorizationService: IClothingCategorizationService,
    private storageService: IStorageService
  ) {}

  async execute(request: UpdateClothingItemRequest): Promise<Result<UpdateClothingItemResponse>> {
    try {
      // Validate input
      const validationResult = this.validateRequest(request);
      if (!validationResult.succeeded) {
        return Result.fail<UpdateClothingItemResponse>(validationResult.message);
      }

      // Get existing item
      const existingItemResult = await this.clothingItemRepository.findById(request.itemId);
      if (!existingItemResult.succeeded) {
        return Result.fail<UpdateClothingItemResponse>(existingItemResult.message);
      }

      if (!existingItemResult.value) {
        return Result.fail<UpdateClothingItemResponse>('Clothing item not found');
      }

      const existingItem = existingItemResult.value;

      // Check ownership
      if (existingItem.userId !== request.userId) {
        return Result.fail<UpdateClothingItemResponse>('Unauthorized to update this item');
      }

      const warnings: string[] = [];
      let processedImageUrl: string | undefined;
      let thumbnailUrl: string | undefined;
      let categorizationResults: any;

      // Process new image if provided
      if (request.imageUri) {
        const imageProcessingResult = await this.processImage(request.imageUri, request.processingOptions);
        if (!imageProcessingResult.succeeded) {
          warnings.push(`Image processing failed: ${imageProcessingResult.message}`);
        } else {
          processedImageUrl = imageProcessingResult.value.processedImageUrl;
          thumbnailUrl = imageProcessingResult.value.thumbnailUrl;

          // Delete old image if exists
          if (existingItem.imageUrl) {
            await this.deleteOldImage(existingItem.imageUrl);
          }
        }
      }

      // Auto-categorize if enabled and relevant fields changed
      let finalCategory = request.category;
      let finalSubcategory = request.subcategory;
      let finalSeasons = request.season;
      let finalOccasions = request.occasion;
      let finalTags = request.tags;

      if (request.autoCategorizationEnabled && (request.imageUri || request.name || request.description)) {
        const categorizationResult = await this.performCategorization({
          imageUrl: processedImageUrl || existingItem.imageUrl,
          name: request.name || existingItem.name,
          description: request.description || existingItem.description,
          brand: request.brand || existingItem.brand,
          existingTags: finalTags || existingItem.tags,
        });

        if (categorizationResult.succeeded) {
          categorizationResults = categorizationResult.value;
          if (!finalCategory) {
            finalCategory = categorizationResult.value.category;
          }
          if (!finalSubcategory) {
            finalSubcategory = categorizationResult.value.subcategory;
          }
          if (!finalSeasons || finalSeasons.length === 0) {
            finalSeasons = categorizationResult.value.suggestedSeasons;
          }
          if (!finalOccasions || finalOccasions.length === 0) {
            finalOccasions = categorizationResult.value.suggestedOccasions;
          }
          if (!finalTags) {
            finalTags = [...new Set([...existingItem.tags, ...categorizationResult.value.tags])];
          }
        } else {
          warnings.push(`Auto-categorization failed: ${categorizationResult.message}`);
        }
      }

      // Build updates object
      const updates: any = {};

      if (request.name !== undefined) updates.name = request.name;
      if (finalCategory !== undefined) updates.category = finalCategory;
      if (finalSubcategory !== undefined) updates.subcategory = finalSubcategory;
      if (request.brand !== undefined) updates.brand = request.brand;
      if (request.color !== undefined) updates.color = request.color;
      if (request.size !== undefined) updates.size = request.size;
      if (finalSeasons !== undefined) updates.season = finalSeasons;
      if (finalOccasions !== undefined) updates.occasion = finalOccasions;
      if (processedImageUrl !== undefined) updates.imageUrl = processedImageUrl;
      if (finalTags !== undefined) updates.tags = finalTags;
      if (request.description !== undefined) updates.description = request.description;
      if (request.purchaseDate !== undefined) updates.purchaseDate = request.purchaseDate;
      if (request.purchasePrice !== undefined) updates.purchasePrice = request.purchasePrice;
      if (request.condition !== undefined) updates.condition = request.condition;
      if (request.material !== undefined) updates.material = request.material;
      if (request.careInstructions !== undefined) updates.careInstructions = request.careInstructions;

      // Update item
      const updateResult = existingItem.update(updates);
      if (!updateResult.succeeded) {
        return Result.fail<UpdateClothingItemResponse>(updateResult.message);
      }

      // Save to repository
      const saveResult = await this.clothingItemRepository.update(existingItem);
      if (!saveResult.succeeded) {
        return Result.fail<UpdateClothingItemResponse>(saveResult.message);
      }

      const response: UpdateClothingItemResponse = {
        item: saveResult.value,
        processingResults: {
          originalImageUrl: request.imageUri,
          processedImageUrl,
          thumbnailUrl,
          categorizationResults,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      return Result.ok<UpdateClothingItemResponse>(response);
    } catch (error) {
      return Result.fail<UpdateClothingItemResponse>(
        `Failed to update clothing item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateRequest(request: UpdateClothingItemRequest): Result<void> {
    if (!request.itemId || request.itemId.trim().length === 0) {
      return Result.fail<void>('Item ID is required');
    }

    if (!request.userId || request.userId.trim().length === 0) {
      return Result.fail<void>('User ID is required');
    }

    if (request.name !== undefined && request.name.trim().length === 0) {
      return Result.fail<void>('Name cannot be empty');
    }

    if (request.color !== undefined && request.color.trim().length === 0) {
      return Result.fail<void>('Color cannot be empty');
    }

    if (request.size !== undefined && request.size.trim().length === 0) {
      return Result.fail<void>('Size cannot be empty');
    }

    if (request.purchasePrice !== undefined && request.purchasePrice < 0) {
      return Result.fail<void>('Purchase price cannot be negative');
    }

    return Result.ok<void>();
  }

  private async processImage(
    imageUri: string,
    options?: UpdateClothingItemRequest['processingOptions']
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

  private async deleteOldImage(imageUrl: string): Promise<void> {
    try {
      // Extract path from URL and delete from storage
      const urlParts = imageUrl.split('/');
      const path = urlParts.slice(-2).join('/'); // Get last two parts of URL as path
      await this.storageService.deleteFile(path);
    } catch (error) {
      // Log error but don't fail the operation
      console.warn(`Failed to delete old image: ${error}`);
    }
  }
}

export class UpdateClothingItemError extends BaseError {
  constructor(message: string) {
    super(message, 'UPDATE_CLOTHING_ITEM_ERROR');
  }
}

export class ItemNotFoundError extends UpdateClothingItemError {
  constructor(itemId: string) {
    super(`Clothing item with ID ${itemId} not found`);
  }
}

export class UnauthorizedUpdateError extends UpdateClothingItemError {
  constructor() {
    super('Unauthorized to update this item');
  }
}