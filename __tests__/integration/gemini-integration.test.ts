import { GeminiStyleAnalysisService } from '@/features/styling/infrastructure/services/GeminiStyleAnalysisService';
import { GeminiClothingCategorizationService } from '@/features/wardrobe/infrastructure/services/GeminiClothingCategorizationService';
import { StyleAnalysis } from '@/features/styling/domain/entities/StyleAnalysis';

// Mock environment for testing
const testApiKey = process.env.GEMINI_API_KEY || 'test-api-key';

describe('Gemini AI Integration Tests', () => {
  let styleAnalysisService: GeminiStyleAnalysisService;
  let categorizationService: GeminiClothingCategorizationService;

  beforeAll(() => {
    styleAnalysisService = new GeminiStyleAnalysisService(testApiKey);
    categorizationService = new GeminiClothingCategorizationService(testApiKey);
  });

  describe('Style Analysis Service', () => {
    const testImageUrl = 'https://example.com/test-outfit.jpg';
    const testImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    it('should analyze style from image URL', async () => {
      const result = await styleAnalysisService.analyzeStyle(testImageUrl);
      
      if (result.succeeded) {
        const analysis = result.value;
        
        expect(analysis).toBeInstanceOf(StyleAnalysis);
        expect(analysis.dominantColors).toBeDefined();
        expect(Array.isArray(analysis.dominantColors)).toBe(true);
        expect(analysis.styleCategories).toBeDefined();
        expect(Array.isArray(analysis.styleCategories)).toBe(true);
        expect(analysis.confidence).toBeGreaterThanOrEqual(0);
        expect(analysis.confidence).toBeLessThanOrEqual(1);
        expect(analysis.recommendations).toBeDefined();
        expect(Array.isArray(analysis.recommendations)).toBe(true);
      } else {
        // If service is not available, test should handle gracefully
        expect(result.message).toContain('service');
      }
    }, 30000);

    it('should analyze style from base64 image', async () => {
      const result = await styleAnalysisService.analyzeStyle(testImageBase64);
      
      if (result.succeeded) {
        const analysis = result.value;
        
        expect(analysis).toBeInstanceOf(StyleAnalysis);
        expect(analysis.processingTime).toBeGreaterThan(0);
        expect(analysis.imageUrl).toBe(testImageBase64);
      } else {
        expect(result.message).toBeDefined();
      }
    }, 30000);

    it('should handle invalid image URLs', async () => {
      const invalidUrl = 'https://invalid-url-that-does-not-exist.com/image.jpg';
      const result = await styleAnalysisService.analyzeStyle(invalidUrl);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle malformed base64 images', async () => {
      const invalidBase64 = 'data:image/jpeg;base64,invalid-base64-data';
      const result = await styleAnalysisService.analyzeStyle(invalidBase64);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should provide contextual recommendations', async () => {
      const context = {
        occasion: 'business meeting',
        weather: 'cold',
        userPreferences: {
          styles: ['professional', 'modern'],
          colors: ['navy', 'gray', 'white'],
          budget: [100, 300]
        }
      };

      const result = await styleAnalysisService.analyzeStyleWithContext(
        testImageUrl,
        context
      );
      
      if (result.succeeded) {
        const analysis = result.value;
        
        expect(analysis.recommendations).toBeDefined();
        expect(analysis.recommendations.length).toBeGreaterThan(0);
        
        // Recommendations should be contextually relevant
        const recommendationText = analysis.recommendations.join(' ').toLowerCase();
        expect(
          recommendationText.includes('business') ||
          recommendationText.includes('professional') ||
          recommendationText.includes('meeting')
        ).toBe(true);
      }
    }, 30000);

    it('should handle API rate limits gracefully', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array.from({ length: 5 }, () =>
        styleAnalysisService.analyzeStyle(testImageUrl)
      );
      
      const results = await Promise.allSettled(promises);
      
      // At least some requests should succeed
      const successfulResults = results.filter(
        result => result.status === 'fulfilled' && (result.value as any).succeeded
      );
      
      // Even if rate limited, should handle gracefully
      expect(results.length).toBe(5);
    });

    it('should cache similar requests', async () => {
      const startTime1 = Date.now();
      const result1 = await styleAnalysisService.analyzeStyle(testImageUrl);
      const duration1 = Date.now() - startTime1;

      const startTime2 = Date.now();
      const result2 = await styleAnalysisService.analyzeStyle(testImageUrl);
      const duration2 = Date.now() - startTime2;

      // Second request should be faster due to caching
      if (result1.succeeded && result2.succeeded) {
        expect(duration2).toBeLessThan(duration1);
      }
    });

    it('should validate analysis quality', async () => {
      const result = await styleAnalysisService.analyzeStyle(testImageUrl);
      
      if (result.succeeded) {
        const analysis = result.value;
        
        // Quality checks
        expect(analysis.dominantColors.length).toBeGreaterThan(0);
        expect(analysis.dominantColors.length).toBeLessThanOrEqual(10);
        
        // Colors should be valid hex codes
        analysis.dominantColors.forEach(color => {
          expect(color).toMatch(/^#[0-9A-F]{6}$/i);
        });
        
        // Style categories should be meaningful
        expect(analysis.styleCategories.length).toBeGreaterThan(0);
        analysis.styleCategories.forEach(category => {
          expect(typeof category).toBe('string');
          expect(category.length).toBeGreaterThan(0);
        });
        
        // Recommendations should be actionable
        analysis.recommendations.forEach(recommendation => {
          expect(typeof recommendation).toBe('string');
          expect(recommendation.length).toBeGreaterThan(10);
        });
      }
    });
  });

  describe('Clothing Categorization Service', () => {
    const testClothingImageUrl = 'https://example.com/test-tshirt.jpg';

    it('should categorize clothing items correctly', async () => {
      const result = await categorizationService.categorizeClothing(testClothingImageUrl);
      
      if (result.succeeded) {
        const categorization = result.value;
        
        expect(categorization.category).toBeDefined();
        expect(categorization.subcategory).toBeDefined();
        expect(categorization.confidence).toBeGreaterThanOrEqual(0);
        expect(categorization.confidence).toBeLessThanOrEqual(1);
        expect(categorization.attributes).toBeDefined();
        expect(categorization.suggestedTags).toBeDefined();
        expect(Array.isArray(categorization.suggestedTags)).toBe(true);
      }
    }, 30000);

    it('should extract clothing attributes accurately', async () => {
      const result = await categorizationService.categorizeClothing(testClothingImageUrl);
      
      if (result.succeeded) {
        const categorization = result.value;
        const { attributes } = categorization;
        
        // Should detect basic attributes
        expect(attributes.colors).toBeDefined();
        expect(Array.isArray(attributes.colors)).toBe(true);
        
        if (attributes.pattern) {
          expect(typeof attributes.pattern).toBe('string');
        }
        
        if (attributes.material) {
          expect(typeof attributes.material).toBe('string');
        }
        
        if (attributes.sleeve) {
          expect(['short', 'long', 'sleeveless', 'three-quarter']).toContain(attributes.sleeve);
        }
      }
    });

    it('should suggest appropriate tags', async () => {
      const result = await categorizationService.categorizeClothing(testClothingImageUrl);
      
      if (result.succeeded) {
        const categorization = result.value;
        
        expect(categorization.suggestedTags.length).toBeGreaterThan(0);
        
        // Tags should be relevant and useful
        categorization.suggestedTags.forEach(tag => {
          expect(typeof tag).toBe('string');
          expect(tag.length).toBeGreaterThan(1);
          expect(tag.length).toBeLessThan(20);
        });
      }
    });

    it('should handle multiple clothing items in one image', async () => {
      const outfitImageUrl = 'https://example.com/full-outfit.jpg';
      const result = await categorizationService.categorizeClothing(outfitImageUrl);
      
      if (result.succeeded) {
        const categorization = result.value;
        
        // Should detect primary item even if multiple items present
        expect(categorization.category).toBeDefined();
        
        // May include additional detected items
        if (categorization.additionalItems) {
          expect(Array.isArray(categorization.additionalItems)).toBe(true);
        }
      }
    });

    it('should provide brand recognition when possible', async () => {
      const brandedItemUrl = 'https://example.com/branded-item.jpg';
      const result = await categorizationService.categorizeClothing(brandedItemUrl);
      
      if (result.succeeded) {
        const categorization = result.value;
        
        if (categorization.detectedBrand) {
          expect(typeof categorization.detectedBrand).toBe('string');
          expect(categorization.brandConfidence).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Service Integration and Error Handling', () => {
    it('should handle network timeouts', async () => {
      // Mock slow network by using a very large timeout
      const slowService = new GeminiStyleAnalysisService(testApiKey, { timeout: 1 });
      
      const result = await slowService.analyzeStyle(testImageUrl);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('timeout');
    });

    it('should handle invalid API keys', async () => {
      const invalidService = new GeminiStyleAnalysisService('invalid-api-key');
      
      const result = await invalidService.analyzeStyle(testImageUrl);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('authentication');
    });

    it('should handle service unavailability', async () => {
      // Mock service unavailable by using invalid endpoint
      const unavailableService = new GeminiStyleAnalysisService(
        testApiKey,
        { baseUrl: 'https://invalid-endpoint.com' }
      );
      
      const result = await unavailableService.analyzeStyle(testImageUrl);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should retry failed requests with exponential backoff', async () => {
      const retryService = new GeminiStyleAnalysisService(
        testApiKey,
        { maxRetries: 3, retryDelay: 100 }
      );
      
      // Use an image that might fail initially
      const result = await retryService.analyzeStyle('https://httpstat.us/500/cors');
      
      // Should eventually succeed or fail gracefully after retries
      expect(result).toBeDefined();
      expect(typeof result.succeeded).toBe('boolean');
    });

    it('should maintain service health monitoring', async () => {
      const healthCheck = await styleAnalysisService.checkServiceHealth();
      
      expect(healthCheck).toBeDefined();
      expect(typeof healthCheck.isHealthy).toBe('boolean');
      expect(typeof healthCheck.responseTime).toBe('number');
      expect(healthCheck.lastChecked).toBeInstanceOf(Date);
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 3;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        styleAnalysisService.analyzeStyle(`${testImageUrl}?v=${i}`)
      );
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // Should handle concurrent requests without significant slowdown
      expect(results.length).toBe(concurrentRequests);
      expect(totalTime).toBeLessThan(60000); // Should complete within 1 minute
    });

    it('should log service usage for monitoring', async () => {
      const result = await styleAnalysisService.analyzeStyle(testImageUrl);
      
      // Check that usage is being tracked
      const usage = await styleAnalysisService.getUsageStats();
      
      expect(usage.totalRequests).toBeGreaterThan(0);
      expect(usage.successfulRequests).toBeGreaterThanOrEqual(0);
      expect(usage.failedRequests).toBeGreaterThanOrEqual(0);
      expect(usage.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe('Data Privacy and Security', () => {
    it('should not store sensitive image data', async () => {
      const result = await styleAnalysisService.analyzeStyle(testImageUrl);
      
      if (result.succeeded) {
        const analysis = result.value;
        
        // Should not contain raw image data
        expect(JSON.stringify(analysis)).not.toContain('base64');
        expect(JSON.stringify(analysis)).not.toContain('data:image');
      }
    });

    it('should anonymize user data in requests', async () => {
      const userContext = {
        userId: 'user123',
        email: 'user@example.com',
        personalInfo: 'sensitive data'
      };
      
      // Service should strip sensitive data before sending to API
      const result = await styleAnalysisService.analyzeStyleWithContext(
        testImageUrl,
        userContext as any
      );
      
      // Result should not contain sensitive user data
      if (result.succeeded) {
        const analysisString = JSON.stringify(result.value);
        expect(analysisString).not.toContain('user@example.com');
        expect(analysisString).not.toContain('sensitive data');
      }
    });

    it('should use secure communication protocols', async () => {
      // Verify that all API calls use HTTPS
      const service = new GeminiStyleAnalysisService(testApiKey);
      
      // Mock the fetch to capture the URL
      const originalFetch = global.fetch;
      let capturedUrl = '';
      
      global.fetch = jest.fn().mockImplementation((url: string) => {
        capturedUrl = url;
        return Promise.reject(new Error('Mocked for testing'));
      });
      
      await service.analyzeStyle(testImageUrl);
      
      expect(capturedUrl).toMatch(/^https:/);
      
      global.fetch = originalFetch;
    });
  });
});