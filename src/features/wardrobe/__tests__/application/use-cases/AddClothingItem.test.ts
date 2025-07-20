import { AddClothingItem, AddClothingItemRequest } from '../../../application/use-cases';
import { ClothingItem, ClothingCategory, Season, Occasion, ItemCondition } from '../../../domain/entities';
import { IClothingItemRepository } from '../../../domain/repositories';
import { IImageProcessingService, IClothingCategorizationService } from '../../../domain/services';
import { IStorageService } from '../../../../../core/services/IStorageService';
import { Result } from '../../../../../core/types';

// Mock implementations
class MockClothingItemRepository implements IClothingItemRepository {
  private items = new Map<string, ClothingItem>();

  async save(item: ClothingItem): Promise<Result<ClothingItem>> {
    this.items.set(item.id, item);
    return Result.ok(item);
  }

  async findById(id: string): Promise<Result<ClothingItem | null>> {
    const item = this.items.get(id) || null;
    return Result.ok(item);
  }

  // Implement other required methods with mock implementations
  async findByUserId(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async findWithFilters(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async findByCategory(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async findBySeason(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async findByOccasion(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async findFavorites(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async findArchived(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async findByTags(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async search(): Promise<Result<any>> { return Result.ok({ items: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrevious: false }); }
  async getStats(): Promise<Result<any>> { return Result.ok({}); }
  async getMostWorn(): Promise<Result<ClothingItem[]>> { return Result.ok([]); }
  async getLeastWorn(): Promise<Result<ClothingItem[]>> { return Result.ok([]); }
  async getRecentlyAdded(): Promise<Result<ClothingItem[]>> { return Result.ok([]); }
  async getUnwornItems(): Promise<Result<ClothingItem[]>> { return Result.ok([]); }
  async update(): Promise<Result<ClothingItem>> { return Result.ok({} as ClothingItem); }
  async delete(): Promise<Result<void>> { return Result.ok(); }
  async deleteMany(): Promise<Result<void>> { return Result.ok(); }
  async exists(): Promise<Result<boolean>> { return Result.ok(false); }
  async getTags(): Promise<Result<string[]>> { return Result.ok([]); }
  async getBrands(): Promise<Result<string[]>> { return Result.ok([]); }
  async getColors(): Promise<Result<string[]>> { return Result.ok([]); }
  async getCategoryDistribution(): Promise<Result<any[]>> { return Result.ok([]); }
  async bulkUpdate(): Promise<Result<ClothingItem[]>> { return Result.ok([]); }
}

class MockImageProcessingService implements IImageProcessingService {
  async processImage(): Promise<Result<any>> {
    return Result.ok({
      uri: 'processed://image.jpg',
      width: 1024,
      height: 1024,
      size: 1024 * 1024,
      format: 'jpeg',
      quality: 0.8,
    });
  }

  // Implement other required methods
  async resizeImage(): Promise<Result<any>> { return Result.ok({}); }
  async compressImage(): Promise<Result<any>> { return Result.ok({}); }
  async convertFormat(): Promise<Result<any>> { return Result.ok({}); }
  async removeBackground(): Promise<Result<any>> { return Result.ok({}); }
  async enhanceColors(): Promise<Result<any>> { return Result.ok({}); }
  async autoRotate(): Promise<Result<any>> { return Result.ok({}); }
  async generateThumbnail(): Promise<Result<any>> { return Result.ok({}); }
  async generateMultipleSizes(): Promise<Result<any[]>> { return Result.ok([]); }
  async getImageMetadata(): Promise<Result<any>> { return Result.ok({}); }
  async analyzeImage(): Promise<Result<any>> { return Result.ok({}); }
  async cropImage(): Promise<Result<any>> { return Result.ok({}); }
  async applyFilter(): Promise<Result<any>> { return Result.ok({}); }
  async batchProcess(): Promise<Result<any[]>> { return Result.ok([]); }
  async validateImage(): Promise<Result<any>> { return Result.ok({ isValid: true, errors: [], warnings: [], metadata: {} }); }
}

class MockCategorizationService implements IClothingCategorizationService {
  async categorizeItem(): Promise<Result<any>> {
    return Result.ok({
      category: ClothingCategory.TOPS,
      subcategory: 'T-Shirt',
      confidence: 0.9,
      alternatives: [],
      suggestedSeasons: [Season.SPRING, Season.SUMMER],
      suggestedOccasions: [Occasion.CASUAL],
      tags: ['comfortable', 'cotton'],
      attributes: [],
    });
  }

  // Implement other required methods
  async categorizeItems(): Promise<Result<any[]>> { return Result.ok([]); }
  async getCategorySuggestionsFromImage(): Promise<Result<any>> { return Result.ok({}); }
  async getCategorySuggestionsFromText(): Promise<Result<any>> { return Result.ok({}); }
  async validateCategorization(): Promise<Result<any>> { return Result.ok({}); }
  async getSimilarItems(): Promise<Result<any[]>> { return Result.ok([]); }
  async getCategoryRules(): Promise<Result<any>> { return Result.ok({}); }
  async updateCategoryRules(): Promise<Result<void>> { return Result.ok(); }
  async getSubcategories(): Promise<Result<string[]>> { return Result.ok([]); }
  async trainModel(): Promise<Result<void>> { return Result.ok(); }
  async getAccuracyMetrics(): Promise<Result<any>> { return Result.ok({}); }
}

class MockStorageService implements IStorageService {
  async uploadFile(): Promise<Result<any>> {
    return Result.ok({
      url: 'https://storage.example.com/image.jpg',
      path: 'clothing-items/image.jpg',
      size: 1024 * 1024,
      contentType: 'image/jpeg',
    });
  }

  // Implement other required methods
  async downloadFile(): Promise<Result<any>> { return Result.ok({}); }
  async deleteFile(): Promise<Result<void>> { return Result.ok(); }
  async listFiles(): Promise<Result<any>> { return Result.ok({ files: [], nextPageToken: undefined }); }
  async getFileMetadata(): Promise<Result<any>> { return Result.ok({}); }
  async fileExists(): Promise<Result<boolean>> { return Result.ok(false); }
  async getDownloadUrl(): Promise<Result<string>> { return Result.ok(''); }
  async copyFile(): Promise<Result<void>> { return Result.ok(); }
  async moveFile(): Promise<Result<void>> { return Result.ok(); }
  async getUsageStats(): Promise<Result<any>> { return Result.ok({}); }
}

describe('AddClothingItem Use Case', () => {
  let useCase: AddClothingItem;
  let mockRepository: MockClothingItemRepository;
  let mockImageService: MockImageProcessingService;
  let mockCategorizationService: MockCategorizationService;
  let mockStorageService: MockStorageService;

  beforeEach(() => {
    mockRepository = new MockClothingItemRepository();
    mockImageService = new MockImageProcessingService();
    mockCategorizationService = new MockCategorizationService();
    mockStorageService = new MockStorageService();
    
    useCase = new AddClothingItem(
      mockRepository,
      mockImageService,
      mockCategorizationService,
      mockStorageService
    );
  });

  const validRequest: AddClothingItemRequest = {
    name: 'Test T-Shirt',
    color: 'Blue',
    size: 'M',
    season: ['spring', 'summer'],
    occasion: ['casual'],
    condition: 'good',
    userId: 'user123',
  };

  describe('execute', () => {
    it('should successfully add a clothing item', async () => {
      const result = await useCase.execute(validRequest);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.item).toBeDefined();
      expect(result.value.item.name).toBe('Test T-Shirt');
      expect(result.value.item.color).toBe('Blue');
      expect(result.value.item.userId).toBe('user123');
    });

    it('should fail when name is missing', async () => {
      const request = { ...validRequest, name: '' };
      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('Name is required');
    });

    it('should fail when color is missing', async () => {
      const request = { ...validRequest, color: '' };
      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('Color is required');
    });

    it('should fail when size is missing', async () => {
      const request = { ...validRequest, size: '' };
      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('Size is required');
    });

    it('should fail when userId is missing', async () => {
      const request = { ...validRequest, userId: '' };
      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('User ID is required');
    });

    it('should fail when condition is missing', async () => {
      const request = { ...validRequest, condition: '' };
      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('Condition is required');
    });

    it('should fail when purchase price is negative', async () => {
      const request = { ...validRequest, purchasePrice: -10 };
      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('Purchase price cannot be negative');
    });

    it('should process image when imageUri is provided', async () => {
      const request = {
        ...validRequest,
        imageUri: 'file://image.jpg',
        processingOptions: {
          enhanceImage: true,
          generateThumbnail: true,
        },
      };

      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.processingResults?.processedImageUrl).toBeDefined();
      expect(result.value.item.imageUrl).toBeDefined();
    });

    it('should perform auto-categorization when enabled', async () => {
      const request = {
        ...validRequest,
        autoCategorizationEnabled: true,
        imageUri: 'file://image.jpg',
      };

      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.processingResults?.categorizationResults).toBeDefined();
      // The auto-categorization should override the default category
      expect(result.value.item.category).toBe(ClothingCategory.TOPS);
    });

    it('should handle image processing failure gracefully', async () => {
      // Mock image processing to fail
      jest.spyOn(mockImageService, 'processImage').mockResolvedValue(
        Result.fail('Image processing failed')
      );

      const request = {
        ...validRequest,
        imageUri: 'file://invalid-image.jpg',
      };

      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.warnings).toContain('Image processing failed: Image processing failed');
    });

    it('should handle categorization failure gracefully', async () => {
      // Mock categorization to fail
      jest.spyOn(mockCategorizationService, 'categorizeItem').mockResolvedValue(
        Result.fail('Categorization failed')
      );

      const request = {
        ...validRequest,
        autoCategorizationEnabled: true,
      };

      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.warnings).toContain('Auto-categorization failed: Categorization failed');
    });

    it('should handle repository save failure', async () => {
      // Mock repository to fail
      jest.spyOn(mockRepository, 'save').mockResolvedValue(
        Result.fail('Database error')
      );

      const result = await useCase.execute(validRequest);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('Database error');
    });

    it('should set default values correctly', async () => {
      const result = await useCase.execute(validRequest);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.item.isFavorite).toBe(false);
      expect(result.value.item.isArchived).toBe(false);
      expect(result.value.item.timesWorn).toBe(0);
      expect(result.value.item.tags).toEqual([]);
    });

    it('should merge auto-categorization tags with existing tags', async () => {
      const request = {
        ...validRequest,
        tags: ['existing-tag'],
        autoCategorizationEnabled: true,
      };

      const result = await useCase.execute(request);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.item.tags).toContain('existing-tag');
      expect(result.value.item.tags).toContain('comfortable');
      expect(result.value.item.tags).toContain('cotton');
    });
  });
});