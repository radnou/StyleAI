import firestore from '@react-native-firebase/firestore';
import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { 
  ClothingItem, 
  ClothingItemProps,
  ClothingCategory,
  Season,
  Occasion,
  ItemCondition,
  ClothingItemNotFoundError 
} from '../../domain/entities';
import {
  IClothingItemRepository,
  ClothingItemFilters,
  ClothingItemSortOptions,
  PaginationOptions,
  ClothingItemQueryResult,
  ClothingItemStats,
  CategoryDistribution,
} from '../../domain/repositories';

export class FirebaseClothingItemRepository implements IClothingItemRepository {
  private readonly collection = firestore().collection('clothingItems');

  async save(item: ClothingItem): Promise<Result<ClothingItem>> {
    try {
      const data = this.toFirestoreData(item.toJSON());
      
      // Check if item exists
      const existsResult = await this.exists(item.id);
      if (!existsResult.succeeded) {
        return Result.fail<ClothingItem>(existsResult.message);
      }

      if (existsResult.value) {
        // Update existing item
        await this.collection.doc(item.id).update(data);
      } else {
        // Create new item
        await this.collection.doc(item.id).set(data);
      }

      return Result.ok<ClothingItem>(item);
    } catch (error) {
      return Result.fail<ClothingItem>(
        `Failed to save clothing item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: string): Promise<Result<ClothingItem | null>> {
    try {
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        return Result.ok<ClothingItem | null>(null);
      }

      const data = doc.data();
      if (!data) {
        return Result.ok<ClothingItem | null>(null);
      }

      const itemProps = this.fromFirestoreData(data, doc.id);
      const itemResult = ClothingItem.fromPersistence(itemProps);
      
      if (!itemResult.succeeded) {
        return Result.fail<ClothingItem | null>(itemResult.message);
      }

      return Result.ok<ClothingItem | null>(itemResult.value);
    } catch (error) {
      return Result.fail<ClothingItem | null>(
        `Failed to find clothing item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByUserId(userId: string, pagination?: PaginationOptions): Promise<Result<ClothingItemQueryResult>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const offset = (page - 1) * limit;

      let query = this.collection
        .where('userId', '==', userId)
        .orderBy('updatedAt', 'desc');

      // Get total count
      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;

      // Apply pagination
      query = query.limit(limit).offset(offset);
      
      const snapshot = await query.get();
      const items: ClothingItem[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const itemProps = this.fromFirestoreData(data, doc.id);
        const itemResult = ClothingItem.fromPersistence(itemProps);
        
        if (itemResult.succeeded) {
          items.push(itemResult.value);
        }
      }

      const result: ClothingItemQueryResult = {
        items,
        total,
        page,
        limit,
        hasNext: offset + limit < total,
        hasPrevious: page > 1,
      };

      return Result.ok<ClothingItemQueryResult>(result);
    } catch (error) {
      return Result.fail<ClothingItemQueryResult>(
        `Failed to find items by user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findWithFilters(
    userId: string,
    filters: ClothingItemFilters,
    sort?: ClothingItemSortOptions,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>> {
    try {
      let query = this.collection.where('userId', '==', userId);

      // Apply filters
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters.subcategory) {
        query = query.where('subcategory', '==', filters.subcategory);
      }
      if (filters.color) {
        query = query.where('color', '==', filters.color);
      }
      if (filters.brand) {
        query = query.where('brand', '==', filters.brand);
      }
      if (filters.condition) {
        query = query.where('condition', '==', filters.condition);
      }
      if (filters.isFavorite !== undefined) {
        query = query.where('isFavorite', '==', filters.isFavorite);
      }
      if (filters.isArchived !== undefined) {
        query = query.where('isArchived', '==', filters.isArchived);
      }
      if (filters.season) {
        query = query.where('season', 'array-contains', filters.season);
      }
      if (filters.occasion) {
        query = query.where('occasion', 'array-contains', filters.occasion);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', filters.tags);
      }

      // Apply sorting
      const sortField = sort?.field || 'updatedAt';
      const sortDirection = sort?.direction || 'desc';
      query = query.orderBy(sortField, sortDirection);

      // Get total count
      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const offset = (page - 1) * limit;

      query = query.limit(limit).offset(offset);
      
      const snapshot = await query.get();
      const items: ClothingItem[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Apply client-side filters that can't be done in Firestore
        if (!this.passesClientFilters(data, filters)) {
          continue;
        }

        const itemProps = this.fromFirestoreData(data, doc.id);
        const itemResult = ClothingItem.fromPersistence(itemProps);
        
        if (itemResult.succeeded) {
          items.push(itemResult.value);
        }
      }

      const result: ClothingItemQueryResult = {
        items,
        total,
        page,
        limit,
        hasNext: offset + limit < total,
        hasPrevious: page > 1,
      };

      return Result.ok<ClothingItemQueryResult>(result);
    } catch (error) {
      return Result.fail<ClothingItemQueryResult>(
        `Failed to find items with filters: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByCategory(
    userId: string,
    category: ClothingCategory,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>> {
    const filters: ClothingItemFilters = { category };
    return this.findWithFilters(userId, filters, undefined, pagination);
  }

  async findBySeason(
    userId: string,
    season: Season,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>> {
    const filters: ClothingItemFilters = { season };
    return this.findWithFilters(userId, filters, undefined, pagination);
  }

  async findByOccasion(
    userId: string,
    occasion: Occasion,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>> {
    const filters: ClothingItemFilters = { occasion };
    return this.findWithFilters(userId, filters, undefined, pagination);
  }

  async findFavorites(userId: string, pagination?: PaginationOptions): Promise<Result<ClothingItemQueryResult>> {
    const filters: ClothingItemFilters = { isFavorite: true };
    return this.findWithFilters(userId, filters, undefined, pagination);
  }

  async findArchived(userId: string, pagination?: PaginationOptions): Promise<Result<ClothingItemQueryResult>> {
    const filters: ClothingItemFilters = { isArchived: true };
    return this.findWithFilters(userId, filters, undefined, pagination);
  }

  async findByTags(
    userId: string,
    tags: string[],
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>> {
    const filters: ClothingItemFilters = { tags };
    return this.findWithFilters(userId, filters, undefined, pagination);
  }

  async search(
    userId: string,
    query: string,
    pagination?: PaginationOptions
  ): Promise<Result<ClothingItemQueryResult>> {
    const filters: ClothingItemFilters = { searchQuery: query };
    return this.findWithFilters(userId, filters, undefined, pagination);
  }

  async getStats(userId: string): Promise<Result<ClothingItemStats>> {
    try {
      const snapshot = await this.collection.where('userId', '==', userId).get();
      
      let total = 0;
      const byCategory: Record<ClothingCategory, number> = {} as any;
      const byCondition: Record<ItemCondition, number> = {} as any;
      let favorites = 0;
      let archived = 0;
      let totalWearCount = 0;
      let totalValue = 0;
      let mostWornItem: ClothingItem | undefined;
      let leastWornItem: ClothingItem | undefined;
      let newestItem: ClothingItem | undefined;
      let oldestItem: ClothingItem | undefined;

      // Initialize counters
      Object.values(ClothingCategory).forEach(cat => {
        byCategory[cat] = 0;
      });
      Object.values(ItemCondition).forEach(cond => {
        byCondition[cond] = 0;
      });

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const itemProps = this.fromFirestoreData(data, doc.id);
        const itemResult = ClothingItem.fromPersistence(itemProps);
        
        if (!itemResult.succeeded) continue;
        
        const item = itemResult.value;
        total++;

        // Category stats
        byCategory[item.category]++;

        // Condition stats
        byCondition[item.condition]++;

        // Favorites and archived
        if (item.isFavorite) favorites++;
        if (item.isArchived) archived++;

        // Wear count
        totalWearCount += item.timesWorn;

        // Value
        if (item.purchasePrice) {
          totalValue += item.purchasePrice;
        }

        // Most/least worn
        if (!mostWornItem || item.timesWorn > mostWornItem.timesWorn) {
          mostWornItem = item;
        }
        if (!leastWornItem || item.timesWorn < leastWornItem.timesWorn) {
          leastWornItem = item;
        }

        // Newest/oldest
        if (!newestItem || item.createdAt > newestItem.createdAt) {
          newestItem = item;
        }
        if (!oldestItem || item.createdAt < oldestItem.createdAt) {
          oldestItem = item;
        }
      }

      const stats: ClothingItemStats = {
        total,
        byCategory,
        byCondition,
        favorites,
        archived,
        averageWearCount: total > 0 ? totalWearCount / total : 0,
        totalValue,
        mostWornItem,
        leastWornItem,
        newestItem,
        oldestItem,
      };

      return Result.ok<ClothingItemStats>(stats);
    } catch (error) {
      return Result.fail<ClothingItemStats>(
        `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getMostWorn(userId: string, limit: number = 10): Promise<Result<ClothingItem[]>> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('timesWorn', 'desc')
        .limit(limit)
        .get();

      const items: ClothingItem[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const itemProps = this.fromFirestoreData(data, doc.id);
        const itemResult = ClothingItem.fromPersistence(itemProps);
        
        if (itemResult.succeeded) {
          items.push(itemResult.value);
        }
      }

      return Result.ok<ClothingItem[]>(items);
    } catch (error) {
      return Result.fail<ClothingItem[]>(
        `Failed to get most worn items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getLeastWorn(userId: string, limit: number = 10): Promise<Result<ClothingItem[]>> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('timesWorn', 'asc')
        .limit(limit)
        .get();

      const items: ClothingItem[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const itemProps = this.fromFirestoreData(data, doc.id);
        const itemResult = ClothingItem.fromPersistence(itemProps);
        
        if (itemResult.succeeded) {
          items.push(itemResult.value);
        }
      }

      return Result.ok<ClothingItem[]>(items);
    } catch (error) {
      return Result.fail<ClothingItem[]>(
        `Failed to get least worn items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getRecentlyAdded(userId: string, limit: number = 10): Promise<Result<ClothingItem[]>> {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const items: ClothingItem[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const itemProps = this.fromFirestoreData(data, doc.id);
        const itemResult = ClothingItem.fromPersistence(itemProps);
        
        if (itemResult.succeeded) {
          items.push(itemResult.value);
        }
      }

      return Result.ok<ClothingItem[]>(items);
    } catch (error) {
      return Result.fail<ClothingItem[]>(
        `Failed to get recently added items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getUnwornItems(userId: string, days: number): Promise<Result<ClothingItem[]>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const snapshot = await this.collection
        .where('userId', '==', userId)
        .where('lastWorn', '<', cutoffDate)
        .get();

      const items: ClothingItem[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const itemProps = this.fromFirestoreData(data, doc.id);
        const itemResult = ClothingItem.fromPersistence(itemProps);
        
        if (itemResult.succeeded) {
          items.push(itemResult.value);
        }
      }

      return Result.ok<ClothingItem[]>(items);
    } catch (error) {
      return Result.fail<ClothingItem[]>(
        `Failed to get unworn items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async update(item: ClothingItem): Promise<Result<ClothingItem>> {
    try {
      const data = this.toFirestoreData(item.toJSON());
      await this.collection.doc(item.id).update(data);
      return Result.ok<ClothingItem>(item);
    } catch (error) {
      return Result.fail<ClothingItem>(
        `Failed to update clothing item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.collection.doc(id).delete();
      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(
        `Failed to delete clothing item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteMany(ids: string[]): Promise<Result<void>> {
    try {
      const batch = firestore().batch();
      
      for (const id of ids) {
        batch.delete(this.collection.doc(id));
      }

      await batch.commit();
      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(
        `Failed to delete clothing items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const doc = await this.collection.doc(id).get();
      return Result.ok<boolean>(doc.exists);
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to check if item exists: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getTags(userId: string): Promise<Result<string[]>> {
    try {
      const snapshot = await this.collection.where('userId', '==', userId).get();
      const tags = new Set<string>();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.tags && Array.isArray(data.tags)) {
          data.tags.forEach((tag: string) => tags.add(tag));
        }
      }

      return Result.ok<string[]>(Array.from(tags).sort());
    } catch (error) {
      return Result.fail<string[]>(
        `Failed to get tags: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getBrands(userId: string): Promise<Result<string[]>> {
    try {
      const snapshot = await this.collection.where('userId', '==', userId).get();
      const brands = new Set<string>();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.brand) {
          brands.add(data.brand);
        }
      }

      return Result.ok<string[]>(Array.from(brands).sort());
    } catch (error) {
      return Result.fail<string[]>(
        `Failed to get brands: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getColors(userId: string): Promise<Result<string[]>> {
    try {
      const snapshot = await this.collection.where('userId', '==', userId).get();
      const colors = new Set<string>();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.color) {
          colors.add(data.color);
        }
      }

      return Result.ok<string[]>(Array.from(colors).sort());
    } catch (error) {
      return Result.fail<string[]>(
        `Failed to get colors: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getCategoryDistribution(userId: string): Promise<Result<CategoryDistribution[]>> {
    try {
      const statsResult = await this.getStats(userId);
      if (!statsResult.succeeded) {
        return Result.fail<CategoryDistribution[]>(statsResult.message);
      }

      const stats = statsResult.value;
      const distribution: CategoryDistribution[] = Object.entries(stats.byCategory).map(([category, count]) => ({
        category: category as ClothingCategory,
        count,
        percentage: stats.total > 0 ? (count / stats.total) * 100 : 0,
      }));

      return Result.ok<CategoryDistribution[]>(distribution);
    } catch (error) {
      return Result.fail<CategoryDistribution[]>(
        `Failed to get category distribution: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async bulkUpdate(items: ClothingItem[]): Promise<Result<ClothingItem[]>> {
    try {
      const batch = firestore().batch();
      
      for (const item of items) {
        const data = this.toFirestoreData(item.toJSON());
        batch.update(this.collection.doc(item.id), data);
      }

      await batch.commit();
      return Result.ok<ClothingItem[]>(items);
    } catch (error) {
      return Result.fail<ClothingItem[]>(
        `Failed to bulk update items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private toFirestoreData(props: ClothingItemProps): any {
    return {
      ...props,
      createdAt: firestore.Timestamp.fromDate(props.createdAt),
      updatedAt: firestore.Timestamp.fromDate(props.updatedAt),
      purchaseDate: props.purchaseDate ? firestore.Timestamp.fromDate(props.purchaseDate) : null,
      lastWorn: props.lastWorn ? firestore.Timestamp.fromDate(props.lastWorn) : null,
    };
  }

  private fromFirestoreData(data: any, id: string): ClothingItemProps {
    return {
      ...data,
      id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      purchaseDate: data.purchaseDate?.toDate() || undefined,
      lastWorn: data.lastWorn?.toDate() || undefined,
    };
  }

  private passesClientFilters(data: any, filters: ClothingItemFilters): boolean {
    // Price range filter
    if (filters.priceRange && data.purchasePrice) {
      if (data.purchasePrice < filters.priceRange.min || data.purchasePrice > filters.priceRange.max) {
        return false;
      }
    }

    // Size range filter
    if (filters.sizeRange && filters.sizeRange.length > 0) {
      if (!filters.sizeRange.includes(data.size)) {
        return false;
      }
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        data.name,
        data.description,
        data.brand,
        data.color,
        ...(data.tags || []),
      ].filter(Boolean).join(' ').toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  }
}

export class FirebaseClothingItemRepositoryError extends BaseError {
  constructor(message: string) {
    super(message, 'FIREBASE_CLOTHING_ITEM_REPOSITORY_ERROR');
  }
}