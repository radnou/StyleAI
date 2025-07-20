import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { IClothingItemRepository } from '../../domain/repositories';
import { IStorageService } from '../../../../core/services/IStorageService';

export interface DeleteClothingItemRequest {
  itemId: string;
  userId: string;
  deleteImages?: boolean;
}

export interface DeleteClothingItemResponse {
  success: boolean;
  deletedImageUrls?: string[];
  warnings?: string[];
}

export class DeleteClothingItem {
  constructor(
    private clothingItemRepository: IClothingItemRepository,
    private storageService: IStorageService
  ) {}

  async execute(request: DeleteClothingItemRequest): Promise<Result<DeleteClothingItemResponse>> {
    try {
      // Validate input
      const validationResult = this.validateRequest(request);
      if (!validationResult.succeeded) {
        return Result.fail<DeleteClothingItemResponse>(validationResult.message);
      }

      // Get existing item to verify ownership and get image URLs
      const existingItemResult = await this.clothingItemRepository.findById(request.itemId);
      if (!existingItemResult.succeeded) {
        return Result.fail<DeleteClothingItemResponse>(existingItemResult.message);
      }

      if (!existingItemResult.value) {
        return Result.fail<DeleteClothingItemResponse>('Clothing item not found');
      }

      const existingItem = existingItemResult.value;

      // Check ownership
      if (existingItem.userId !== request.userId) {
        return Result.fail<DeleteClothingItemResponse>('Unauthorized to delete this item');
      }

      const warnings: string[] = [];
      const deletedImageUrls: string[] = [];

      // Delete images if requested
      if (request.deleteImages !== false) { // Default to true
        const imageDeletionResult = await this.deleteItemImages(existingItem);
        if (!imageDeletionResult.succeeded) {
          warnings.push(`Failed to delete images: ${imageDeletionResult.message}`);
        } else {
          deletedImageUrls.push(...imageDeletionResult.value);
        }
      }

      // Delete item from repository
      const deleteResult = await this.clothingItemRepository.delete(request.itemId);
      if (!deleteResult.succeeded) {
        return Result.fail<DeleteClothingItemResponse>(deleteResult.message);
      }

      const response: DeleteClothingItemResponse = {
        success: true,
        deletedImageUrls: deletedImageUrls.length > 0 ? deletedImageUrls : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      return Result.ok<DeleteClothingItemResponse>(response);
    } catch (error) {
      return Result.fail<DeleteClothingItemResponse>(
        `Failed to delete clothing item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateRequest(request: DeleteClothingItemRequest): Result<void> {
    if (!request.itemId || request.itemId.trim().length === 0) {
      return Result.fail<void>('Item ID is required');
    }

    if (!request.userId || request.userId.trim().length === 0) {
      return Result.fail<void>('User ID is required');
    }

    return Result.ok<void>();
  }

  private async deleteItemImages(item: any): Promise<Result<string[]>> {
    const deletedUrls: string[] = [];
    const errors: string[] = [];

    try {
      // Delete main image
      if (item.imageUrl) {
        const deleteResult = await this.deleteImageFromUrl(item.imageUrl);
        if (deleteResult.succeeded) {
          deletedUrls.push(item.imageUrl);
        } else {
          errors.push(`Failed to delete main image: ${deleteResult.message}`);
        }
      }

      // Delete additional images if exists
      if (item.imageUrls && Array.isArray(item.imageUrls)) {
        for (const imageUrl of item.imageUrls) {
          const deleteResult = await this.deleteImageFromUrl(imageUrl);
          if (deleteResult.succeeded) {
            deletedUrls.push(imageUrl);
          } else {
            errors.push(`Failed to delete image ${imageUrl}: ${deleteResult.message}`);
          }
        }
      }

      if (errors.length > 0) {
        return Result.fail<string[]>(`Some images could not be deleted: ${errors.join(', ')}`);
      }

      return Result.ok<string[]>(deletedUrls);
    } catch (error) {
      return Result.fail<string[]>(
        `Image deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async deleteImageFromUrl(imageUrl: string): Promise<Result<void>> {
    try {
      // Extract path from URL
      const urlParts = imageUrl.split('/');
      const path = urlParts.slice(-2).join('/'); // Get last two parts of URL as path

      const deleteResult = await this.storageService.deleteFile(path);
      return deleteResult;
    } catch (error) {
      return Result.fail<void>(
        `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export class DeleteClothingItemError extends BaseError {
  constructor(message: string) {
    super(message, 'DELETE_CLOTHING_ITEM_ERROR');
  }
}

export class ItemNotFoundError extends DeleteClothingItemError {
  constructor(itemId: string) {
    super(`Clothing item with ID ${itemId} not found`);
  }
}

export class UnauthorizedDeleteError extends DeleteClothingItemError {
  constructor() {
    super('Unauthorized to delete this item');
  }
}

export class ImageDeletionError extends DeleteClothingItemError {
  constructor(message: string) {
    super(`Image deletion failed: ${message}`);
  }
}