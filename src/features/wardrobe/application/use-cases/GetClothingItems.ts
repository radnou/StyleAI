import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { ClothingItem, ClothingCategory, Season, Occasion, ItemCondition } from '../../domain/entities';
import { 
  IClothingItemRepository, 
  ClothingItemFilters, 
  ClothingItemSortOptions, 
  PaginationOptions,
  ClothingItemQueryResult 
} from '../../domain/repositories';

export interface GetClothingItemsRequest {
  userId: string;
  filters?: {
    category?: ClothingCategory;
    subcategory?: string;
    season?: Season;
    occasion?: Occasion;
    color?: string;
    tags?: string[];
    brand?: string;
    condition?: ItemCondition;
    isFavorite?: boolean;
    isArchived?: boolean;
    priceRange?: {
      min: number;
      max: number;
    };
    sizeRange?: string[];
    searchQuery?: string;
  };
  sort?: {
    field: 'name' | 'createdAt' | 'updatedAt' | 'lastWorn' | 'timesWorn' | 'purchaseDate' | 'purchasePrice';
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface GetClothingItemsResponse {
  items: ClothingItem[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
  appliedFilters: ClothingItemFilters;
  availableFilters: AvailableFilters;
}

export interface AvailableFilters {
  categories: ClothingCategory[];
  subcategories: string[];
  seasons: Season[];
  occasions: Occasion[];
  colors: string[];
  brands: string[];
  conditions: ItemCondition[];
  tags: string[];
  priceRange: {
    min: number;
    max: number;
  };
  sizes: string[];
}

export class GetClothingItems {
  constructor(private clothingItemRepository: IClothingItemRepository) {}

  async execute(request: GetClothingItemsRequest): Promise<Result<GetClothingItemsResponse>> {
    try {
      // Validate input
      const validationResult = this.validateRequest(request);
      if (!validationResult.succeeded) {
        return Result.fail<GetClothingItemsResponse>(validationResult.message);
      }

      // Set default pagination if not provided
      const pagination: PaginationOptions = {
        page: request.pagination?.page || 1,
        limit: Math.min(request.pagination?.limit || 20, 100), // Max 100 items per page
      };

      // Set default sort if not provided
      const sort: ClothingItemSortOptions = {
        field: request.sort?.field || 'updatedAt',
        direction: request.sort?.direction || 'desc',
      };

      // Convert filters
      const filters: ClothingItemFilters = {
        category: request.filters?.category,
        subcategory: request.filters?.subcategory,
        season: request.filters?.season,
        occasion: request.filters?.occasion,
        color: request.filters?.color,
        tags: request.filters?.tags,
        brand: request.filters?.brand,
        condition: request.filters?.condition,
        isFavorite: request.filters?.isFavorite,
        isArchived: request.filters?.isArchived,
        priceRange: request.filters?.priceRange,
        sizeRange: request.filters?.sizeRange,
        searchQuery: request.filters?.searchQuery,
      };

      // Get items from repository
      const itemsResult = await this.clothingItemRepository.findWithFilters(
        request.userId,
        filters,
        sort,
        pagination
      );

      if (!itemsResult.succeeded) {
        return Result.fail<GetClothingItemsResponse>(itemsResult.message);
      }

      // Get available filters for UI
      const availableFiltersResult = await this.getAvailableFilters(request.userId);
      if (!availableFiltersResult.succeeded) {
        return Result.fail<GetClothingItemsResponse>(availableFiltersResult.message);
      }

      const response: GetClothingItemsResponse = {
        items: itemsResult.value.items,
        total: itemsResult.value.total,
        page: itemsResult.value.page,
        limit: itemsResult.value.limit,
        hasNext: itemsResult.value.hasNext,
        hasPrevious: itemsResult.value.hasPrevious,
        appliedFilters: filters,
        availableFilters: availableFiltersResult.value,
      };

      return Result.ok<GetClothingItemsResponse>(response);
    } catch (error) {
      return Result.fail<GetClothingItemsResponse>(
        `Failed to get clothing items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateRequest(request: GetClothingItemsRequest): Result<void> {
    if (!request.userId || request.userId.trim().length === 0) {
      return Result.fail<void>('User ID is required');
    }

    if (request.pagination?.page !== undefined && request.pagination.page < 1) {
      return Result.fail<void>('Page number must be >= 1');
    }

    if (request.pagination?.limit !== undefined && (request.pagination.limit < 1 || request.pagination.limit > 100)) {
      return Result.fail<void>('Limit must be between 1 and 100');
    }

    if (request.filters?.priceRange) {
      const { min, max } = request.filters.priceRange;
      if (min < 0 || max < 0) {
        return Result.fail<void>('Price range values cannot be negative');
      }
      if (min > max) {
        return Result.fail<void>('Price range minimum cannot be greater than maximum');
      }
    }

    return Result.ok<void>();
  }

  private async getAvailableFilters(userId: string): Promise<Result<AvailableFilters>> {
    try {
      // Get all unique values for filters
      const [
        tagsResult,
        brandsResult,
        colorsResult,
        categoryDistributionResult,
        statsResult
      ] = await Promise.all([
        this.clothingItemRepository.getTags(userId),
        this.clothingItemRepository.getBrands(userId),
        this.clothingItemRepository.getColors(userId),
        this.clothingItemRepository.getCategoryDistribution(userId),
        this.clothingItemRepository.getStats(userId),
      ]);

      if (!tagsResult.succeeded) {
        return Result.fail<AvailableFilters>(tagsResult.message);
      }
      if (!brandsResult.succeeded) {
        return Result.fail<AvailableFilters>(brandsResult.message);
      }
      if (!colorsResult.succeeded) {
        return Result.fail<AvailableFilters>(colorsResult.message);
      }
      if (!categoryDistributionResult.succeeded) {
        return Result.fail<AvailableFilters>(categoryDistributionResult.message);
      }
      if (!statsResult.succeeded) {
        return Result.fail<AvailableFilters>(statsResult.message);
      }

      // Extract subcategories from category distribution
      const subcategories = await this.getAvailableSubcategories(userId);

      // Extract sizes - would need to be implemented in repository
      const sizes = await this.getAvailableSizes(userId);

      const availableFilters: AvailableFilters = {
        categories: Object.values(ClothingCategory),
        subcategories,
        seasons: Object.values(Season),
        occasions: Object.values(Occasion),
        colors: colorsResult.value,
        brands: brandsResult.value,
        conditions: Object.values(ItemCondition),
        tags: tagsResult.value,
        priceRange: {
          min: 0,
          max: this.getMaxPrice(statsResult.value),
        },
        sizes,
      };

      return Result.ok<AvailableFilters>(availableFilters);
    } catch (error) {
      return Result.fail<AvailableFilters>(
        `Failed to get available filters: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async getAvailableSubcategories(userId: string): Promise<string[]> {
    // This would ideally be implemented in the repository
    // For now, return common subcategories
    return [
      'T-Shirts',
      'Blouses',
      'Sweaters',
      'Hoodies',
      'Jeans',
      'Trousers',
      'Skirts',
      'Shorts',
      'Jackets',
      'Coats',
      'Sneakers',
      'Boots',
      'Sandals',
      'Heels',
      'Accessories',
    ];
  }

  private async getAvailableSizes(userId: string): Promise<string[]> {
    // This would ideally be implemented in the repository
    // For now, return common sizes
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'];
  }

  private getMaxPrice(stats: any): number {
    // Extract max price from stats or set a reasonable default
    return stats.totalValue || 1000;
  }
}

export class GetClothingItemsError extends BaseError {
  constructor(message: string) {
    super(message, 'GET_CLOTHING_ITEMS_ERROR');
  }
}

export class InvalidFiltersError extends GetClothingItemsError {
  constructor(message: string) {
    super(`Invalid filters: ${message}`);
  }
}

export class InvalidPaginationError extends GetClothingItemsError {
  constructor(message: string) {
    super(`Invalid pagination: ${message}`);
  }
}