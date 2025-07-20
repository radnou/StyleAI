import { Result } from '../../../../core/types';
import { Outfit, Season, Occasion } from '../entities';

export interface OutfitFilters {
  season?: Season;
  occasion?: Occasion;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  rating?: number;
  containsItems?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  lastWornAfter?: Date;
  lastWornBefore?: Date;
  searchQuery?: string;
}

export interface OutfitSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'lastWorn' | 'timesWorn' | 'rating' | 'createdDate';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface OutfitQueryResult {
  outfits: Outfit[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IOutfitRepository {
  /**
   * Save an outfit to the repository
   */
  save(outfit: Outfit): Promise<Result<Outfit>>;

  /**
   * Find an outfit by ID
   */
  findById(id: string): Promise<Result<Outfit | null>>;

  /**
   * Find all outfits for a user
   */
  findByUserId(userId: string, pagination?: PaginationOptions): Promise<Result<OutfitQueryResult>>;

  /**
   * Find outfits with filters
   */
  findWithFilters(
    userId: string,
    filters: OutfitFilters,
    sort?: OutfitSortOptions,
    pagination?: PaginationOptions
  ): Promise<Result<OutfitQueryResult>>;

  /**
   * Find outfits suitable for season
   */
  findBySeason(
    userId: string,
    season: Season,
    pagination?: PaginationOptions
  ): Promise<Result<OutfitQueryResult>>;

  /**
   * Find outfits suitable for occasion
   */
  findByOccasion(
    userId: string,
    occasion: Occasion,
    pagination?: PaginationOptions
  ): Promise<Result<OutfitQueryResult>>;

  /**
   * Find favorite outfits
   */
  findFavorites(userId: string, pagination?: PaginationOptions): Promise<Result<OutfitQueryResult>>;

  /**
   * Find archived outfits
   */
  findArchived(userId: string, pagination?: PaginationOptions): Promise<Result<OutfitQueryResult>>;

  /**
   * Find outfits by tags
   */
  findByTags(
    userId: string,
    tags: string[],
    pagination?: PaginationOptions
  ): Promise<Result<OutfitQueryResult>>;

  /**
   * Find outfits containing specific items
   */
  findContainingItems(
    userId: string,
    itemIds: string[],
    pagination?: PaginationOptions
  ): Promise<Result<OutfitQueryResult>>;

  /**
   * Find outfits by rating
   */
  findByRating(
    userId: string,
    minRating: number,
    pagination?: PaginationOptions
  ): Promise<Result<OutfitQueryResult>>;

  /**
   * Search outfits by text
   */
  search(
    userId: string,
    query: string,
    pagination?: PaginationOptions
  ): Promise<Result<OutfitQueryResult>>;

  /**
   * Get outfit statistics
   */
  getStats(userId: string): Promise<Result<OutfitStats>>;

  /**
   * Get most worn outfits
   */
  getMostWorn(userId: string, limit?: number): Promise<Result<Outfit[]>>;

  /**
   * Get least worn outfits
   */
  getLeastWorn(userId: string, limit?: number): Promise<Result<Outfit[]>>;

  /**
   * Get recently created outfits
   */
  getRecentlyCreated(userId: string, limit?: number): Promise<Result<Outfit[]>>;

  /**
   * Get outfits not worn in a while
   */
  getUnwornOutfits(userId: string, days: number): Promise<Result<Outfit[]>>;

  /**
   * Get top rated outfits
   */
  getTopRated(userId: string, limit?: number): Promise<Result<Outfit[]>>;

  /**
   * Update an outfit
   */
  update(outfit: Outfit): Promise<Result<Outfit>>;

  /**
   * Delete an outfit
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Delete multiple outfits
   */
  deleteMany(ids: string[]): Promise<Result<void>>;

  /**
   * Check if outfit exists
   */
  exists(id: string): Promise<Result<boolean>>;

  /**
   * Get all unique tags for a user
   */
  getTags(userId: string): Promise<Result<string[]>>;

  /**
   * Get occasion distribution for a user
   */
  getOccasionDistribution(userId: string): Promise<Result<OccasionDistribution[]>>;

  /**
   * Get season distribution for a user
   */
  getSeasonDistribution(userId: string): Promise<Result<SeasonDistribution[]>>;

  /**
   * Bulk update outfits
   */
  bulkUpdate(outfits: Outfit[]): Promise<Result<Outfit[]>>;

  /**
   * Get outfit recommendations based on items
   */
  getRecommendationsForItems(
    userId: string,
    itemIds: string[],
    limit?: number
  ): Promise<Result<Outfit[]>>;
}

export interface OutfitStats {
  total: number;
  byOccasion: Record<Occasion, number>;
  bySeason: Record<Season, number>;
  favorites: number;
  archived: number;
  averageRating: number;
  averageWearCount: number;
  mostWornOutfit?: Outfit;
  leastWornOutfit?: Outfit;
  topRatedOutfit?: Outfit;
  newestOutfit?: Outfit;
  oldestOutfit?: Outfit;
}

export interface OccasionDistribution {
  occasion: Occasion;
  count: number;
  percentage: number;
}

export interface SeasonDistribution {
  season: Season;
  count: number;
  percentage: number;
}