import { Result } from '../../../../core/types';
import { ClothingItem, ClothingCategory, Season, Occasion, ItemCondition } from '../entities';

export interface ClothingItemFilters {
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
}

export interface ClothingItemSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'lastWorn' | 'timesWorn' | 'purchaseDate' | 'purchasePrice';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface ClothingItemQueryResult {
  items: ClothingItem[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IClothingItemRepository {
  /**
   * Save a clothing item to the repository
   */
  save(item: ClothingItem): Promise<Result<ClothingItem>>;

  /**
   * Find a clothing item by ID
   */
  findById(id: string): Promise<Result<ClothingItem | null>>;

  /**
   * Find all clothing items for a user
   */
  findByUserId(userId: string, pagination?: PaginationOptions): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Find clothing items with filters
   */
  findWithFilters(
    userId: string,
    filters: ClothingItemFilters,
    sort?: ClothingItemSortOptions,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Find clothing items by category
   */
  findByCategory(
    userId: string,
    category: ClothingCategory,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Find clothing items suitable for season
   */
  findBySeason(
    userId: string,
    season: Season,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Find clothing items suitable for occasion
   */
  findByOccasion(
    userId: string,
    occasion: Occasion,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Find favorite clothing items
   */
  findFavorites(userId: string, pagination?: PaginationOptions): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Find archived clothing items
   */
  findArchived(userId: string, pagination?: PaginationOptions): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Find clothing items by tags
   */
  findByTags(
    userId: string,
    tags: string[],
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Search clothing items by text
   */
  search(
    userId: string,
    query: string,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>>;

  /**
   * Get clothing item statistics
   */
  getStats(userId: string): Promise<Result<ClothingItemStats>>;

  /**
   * Get most worn items
   */
  getMostWorn(userId: string, limit?: number): Promise<Result<ClothingItem[]>>;

  /**
   * Get least worn items
   */
  getLeastWorn(userId: string, limit?: number): Promise<Result<ClothingItem[]>>;

  /**
   * Get recently added items
   */
  getRecentlyAdded(userId: string, limit?: number): Promise<Result<ClothingItem[]>>;

  /**
   * Get items not worn in a while
   */
  getUnwornItems(userId: string, days: number): Promise<Result<ClothingItem[]>>;

  /**
   * Update a clothing item
   */
  update(item: ClothingItem): Promise<Result<ClothingItem>>;

  /**
   * Delete a clothing item
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Delete multiple clothing items
   */
  deleteMany(ids: string[]): Promise<Result<void>>;

  /**
   * Check if clothing item exists
   */
  exists(id: string): Promise<Result<boolean>>;

  /**
   * Get all unique tags for a user
   */
  getTags(userId: string): Promise<Result<string[]>>;

  /**
   * Get all unique brands for a user
   */
  getBrands(userId: string): Promise<Result<string[]>>;

  /**
   * Get all unique colors for a user
   */
  getColors(userId: string): Promise<Result<string[]>>;

  /**
   * Get category distribution for a user
   */
  getCategoryDistribution(userId: string): Promise<Result<CategoryDistribution[]>>;

  /**
   * Bulk update clothing items
   */
  bulkUpdate(items: ClothingItem[]): Promise<Result<ClothingItem[]>>;
}

export interface ClothingItemStats {
  total: number;
  byCategory: Record<ClothingCategory, number>;
  byCondition: Record<ItemCondition, number>;
  favorites: number;
  archived: number;
  averageWearCount: number;
  totalValue: number;
  mostWornItem?: ClothingItem;
  leastWornItem?: ClothingItem;
  newestItem?: ClothingItem;
  oldestItem?: ClothingItem;
}

export interface CategoryDistribution {
  category: ClothingCategory;
  count: number;
  percentage: number;
}