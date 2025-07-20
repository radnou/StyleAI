import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { Outfit, OutfitProps } from '../../domain/entities';
import { IOutfitRepository, IClothingItemRepository } from '../../domain/repositories';

export interface CreateOutfitRequest {
  name: string;
  itemIds: string[];
  season?: string[];
  occasion?: string[];
  description?: string;
  rating?: number;
  notes?: string;
  tags?: string[];
  createdDate?: Date;
  userId: string;
  validateItems?: boolean;
}

export interface CreateOutfitResponse {
  outfit: Outfit;
  validationWarnings?: string[];
}

export class CreateOutfit {
  constructor(
    private outfitRepository: IOutfitRepository,
    private clothingItemRepository: IClothingItemRepository
  ) {}

  async execute(request: CreateOutfitRequest): Promise<Result<CreateOutfitResponse>> {
    try {
      // Validate input
      const validationResult = await this.validateRequest(request);
      if (!validationResult.succeeded) {
        return Result.fail<CreateOutfitResponse>(validationResult.message);
      }

      const warnings: string[] = [];

      // Validate items if requested
      if (request.validateItems !== false) { // Default to true
        const itemValidationResult = await this.validateItems(request.itemIds, request.userId);
        if (!itemValidationResult.succeeded) {
          return Result.fail<CreateOutfitResponse>(itemValidationResult.message);
        }
        if (itemValidationResult.value.warnings.length > 0) {
          warnings.push(...itemValidationResult.value.warnings);
        }
      }

      // Create outfit
      const outfitProps: Omit<OutfitProps, 'id' | 'createdAt' | 'updatedAt'> = {
        name: request.name,
        items: request.itemIds,
        season: (request.season || []) as any[],
        occasion: (request.occasion || []) as any[],
        description: request.description,
        imageUrl: undefined, // Will be set later if needed
        isFavorite: false,
        isArchived: false,
        rating: request.rating,
        notes: request.notes,
        tags: request.tags || [],
        createdDate: request.createdDate || new Date(),
        lastWorn: undefined,
        timesWorn: 0,
        userId: request.userId,
      };

      const outfitResult = Outfit.create(outfitProps);
      if (!outfitResult.succeeded) {
        return Result.fail<CreateOutfitResponse>(outfitResult.message);
      }

      // Save to repository
      const saveResult = await this.outfitRepository.save(outfitResult.value);
      if (!saveResult.succeeded) {
        return Result.fail<CreateOutfitResponse>(saveResult.message);
      }

      const response: CreateOutfitResponse = {
        outfit: saveResult.value,
        validationWarnings: warnings.length > 0 ? warnings : undefined,
      };

      return Result.ok<CreateOutfitResponse>(response);
    } catch (error) {
      return Result.fail<CreateOutfitResponse>(
        `Failed to create outfit: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async validateRequest(request: CreateOutfitRequest): Promise<Result<void>> {
    if (!request.name || request.name.trim().length === 0) {
      return Result.fail<void>('Outfit name is required');
    }

    if (!request.userId || request.userId.trim().length === 0) {
      return Result.fail<void>('User ID is required');
    }

    if (!request.itemIds || request.itemIds.length === 0) {
      return Result.fail<void>('At least one clothing item is required');
    }

    if (request.rating !== undefined && (request.rating < 1 || request.rating > 5)) {
      return Result.fail<void>('Rating must be between 1 and 5');
    }

    // Remove duplicates from itemIds
    const uniqueItemIds = [...new Set(request.itemIds)];
    if (uniqueItemIds.length !== request.itemIds.length) {
      request.itemIds = uniqueItemIds;
    }

    return Result.ok<void>();
  }

  private async validateItems(
    itemIds: string[],
    userId: string
  ): Promise<Result<{ warnings: string[] }>> {
    const warnings: string[] = [];

    try {
      // Check if all items exist and belong to the user
      for (const itemId of itemIds) {
        const itemResult = await this.clothingItemRepository.findById(itemId);
        
        if (!itemResult.succeeded) {
          return Result.fail<{ warnings: string[] }>(
            `Failed to validate item ${itemId}: ${itemResult.message}`
          );
        }

        if (!itemResult.value) {
          return Result.fail<{ warnings: string[] }>(
            `Clothing item with ID ${itemId} not found`
          );
        }

        const item = itemResult.value;

        // Check ownership
        if (item.userId !== userId) {
          return Result.fail<{ warnings: string[] }>(
            `Clothing item ${itemId} does not belong to user ${userId}`
          );
        }

        // Check if item is archived
        if (item.isArchived) {
          warnings.push(`Item "${item.name}" is archived`);
        }

        // Check item condition
        if (item.condition === 'poor') {
          warnings.push(`Item "${item.name}" is in poor condition`);
        }
      }

      return Result.ok<{ warnings: string[] }>({ warnings });
    } catch (error) {
      return Result.fail<{ warnings: string[] }>(
        `Item validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export class CreateOutfitError extends BaseError {
  constructor(message: string) {
    super(message, 'CREATE_OUTFIT_ERROR');
  }
}

export class InvalidItemsError extends CreateOutfitError {
  constructor(message: string) {
    super(`Invalid items: ${message}`);
  }
}

export class ItemValidationError extends CreateOutfitError {
  constructor(message: string) {
    super(`Item validation failed: ${message}`);
  }
}