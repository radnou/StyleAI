// Mock responses for Gemini AI API
export const mockGeminiResponses = {
  categorization: {
    success: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  category: 'tops',
                  subcategory: 'T-Shirt',
                  confidence: 0.95,
                  alternatives: [
                    {
                      category: 'activewear',
                      subcategory: 'Athletic Top',
                      confidence: 0.7,
                      reason: 'Could be athletic wear based on material',
                    },
                  ],
                  suggestedSeasons: ['spring', 'summer', 'all_seasons'],
                  suggestedOccasions: ['casual', 'sports', 'vacation'],
                  tags: ['comfortable', 'cotton', 'everyday', 'basic'],
                  attributes: [
                    {
                      name: 'sleeve_length',
                      value: 'short',
                      confidence: 0.98,
                    },
                    {
                      name: 'neckline',
                      value: 'crew',
                      confidence: 0.92,
                    },
                    {
                      name: 'fit',
                      value: 'regular',
                      confidence: 0.88,
                    },
                    {
                      name: 'pattern',
                      value: 'solid',
                      confidence: 0.95,
                    },
                  ],
                }),
              },
            ],
          },
        },
      ],
    },
    partialConfidence: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  category: 'bottoms',
                  subcategory: 'Jeans',
                  confidence: 0.65,
                  alternatives: [
                    {
                      category: 'bottoms',
                      subcategory: 'Trousers',
                      confidence: 0.6,
                      reason: 'Material unclear from image',
                    },
                    {
                      category: 'bottoms',
                      subcategory: 'Chinos',
                      confidence: 0.55,
                      reason: 'Could be chinos based on color',
                    },
                  ],
                  suggestedSeasons: ['fall', 'winter', 'spring'],
                  suggestedOccasions: ['casual', 'work'],
                  tags: ['denim', 'versatile'],
                  attributes: [
                    {
                      name: 'fit',
                      value: 'slim',
                      confidence: 0.7,
                    },
                    {
                      name: 'rise',
                      value: 'mid',
                      confidence: 0.65,
                    },
                  ],
                }),
              },
            ],
          },
        },
      ],
    },
    dress: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  category: 'dresses',
                  subcategory: 'Cocktail Dress',
                  confidence: 0.92,
                  alternatives: [
                    {
                      category: 'dresses',
                      subcategory: 'Evening Dress',
                      confidence: 0.85,
                      reason: 'Formal style suitable for evening',
                    },
                  ],
                  suggestedSeasons: ['spring', 'summer', 'fall'],
                  suggestedOccasions: ['party', 'formal', 'date'],
                  tags: ['elegant', 'formal', 'chic'],
                  attributes: [
                    {
                      name: 'length',
                      value: 'knee-length',
                      confidence: 0.9,
                    },
                    {
                      name: 'sleeve_length',
                      value: 'sleeveless',
                      confidence: 0.95,
                    },
                    {
                      name: 'neckline',
                      value: 'v-neck',
                      confidence: 0.88,
                    },
                  ],
                }),
              },
            ],
          },
        },
      ],
    },
    shoes: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  category: 'shoes',
                  subcategory: 'Sneakers',
                  confidence: 0.98,
                  alternatives: [
                    {
                      category: 'shoes',
                      subcategory: 'Athletic Shoes',
                      confidence: 0.9,
                      reason: 'Sports brand design',
                    },
                  ],
                  suggestedSeasons: ['all_seasons'],
                  suggestedOccasions: ['casual', 'sports', 'outdoor'],
                  tags: ['comfortable', 'athletic', 'everyday'],
                  attributes: [
                    {
                      name: 'type',
                      value: 'low-top',
                      confidence: 0.95,
                    },
                    {
                      name: 'closure',
                      value: 'lace-up',
                      confidence: 0.98,
                    },
                    {
                      name: 'material',
                      value: 'canvas/rubber',
                      confidence: 0.85,
                    },
                  ],
                }),
              },
            ],
          },
        },
      ],
    },
    accessories: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  category: 'accessories',
                  subcategory: 'Handbag',
                  confidence: 0.94,
                  alternatives: [
                    {
                      category: 'accessories',
                      subcategory: 'Tote Bag',
                      confidence: 0.8,
                      reason: 'Large size suitable for tote',
                    },
                  ],
                  suggestedSeasons: ['all_seasons'],
                  suggestedOccasions: ['work', 'casual', 'formal'],
                  tags: ['leather', 'professional', 'spacious'],
                  attributes: [
                    {
                      name: 'size',
                      value: 'medium',
                      confidence: 0.85,
                    },
                    {
                      name: 'closure',
                      value: 'zipper',
                      confidence: 0.9,
                    },
                    {
                      name: 'material',
                      value: 'leather',
                      confidence: 0.88,
                    },
                  ],
                }),
              },
            ],
          },
        },
      ],
    },
    error: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Invalid JSON response',
              },
            ],
          },
        },
      ],
    },
  },
  styleAnalysis: {
    success: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  overallStyle: 'casual-chic',
                  styleDescription: 'Your style combines comfort with contemporary fashion, featuring versatile pieces that work for both relaxed and semi-formal occasions.',
                  keyElements: [
                    'Clean lines and minimalist aesthetics',
                    'Neutral color palette with occasional pops of color',
                    'Mix of classic and modern pieces',
                    'Emphasis on quality fabrics and fit',
                  ],
                  colorAnalysis: {
                    dominantColors: ['navy', 'white', 'gray', 'black'],
                    accentColors: ['burgundy', 'olive', 'camel'],
                    recommendation: 'Your neutral base allows for easy mixing and matching. Consider adding more vibrant accent pieces.',
                  },
                  seasonalTrends: {
                    current: 'Your wardrobe is well-suited for transitional weather',
                    suggestions: [
                      'Add lightweight layers for spring',
                      'Incorporate more breathable fabrics for summer',
                    ],
                  },
                  personalityTraits: [
                    'Practical and efficiency-focused',
                    'Appreciates timeless style over trends',
                    'Values comfort without sacrificing appearance',
                    'Professional with a relaxed edge',
                  ],
                  recommendations: [
                    {
                      category: 'tops',
                      suggestion: 'Add structured blazers to elevate casual outfits',
                      reason: 'Will complement your existing casual pieces',
                    },
                    {
                      category: 'accessories',
                      suggestion: 'Invest in statement accessories',
                      reason: 'Can transform basic outfits instantly',
                    },
                    {
                      category: 'shoes',
                      suggestion: 'Add versatile ankle boots',
                      reason: 'Perfect for your style aesthetic and practical needs',
                    },
                  ],
                  styleScore: {
                    versatility: 0.85,
                    cohesiveness: 0.88,
                    trendiness: 0.65,
                    uniqueness: 0.72,
                    overall: 0.82,
                  },
                }),
              },
            ],
          },
        },
      ],
    },
    minimal: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  overallStyle: 'minimalist',
                  styleDescription: 'Clean, simple, and functional wardrobe',
                  keyElements: ['Neutral colors', 'Simple silhouettes'],
                  colorAnalysis: {
                    dominantColors: ['black', 'white', 'gray'],
                    accentColors: ['navy'],
                    recommendation: 'Consider adding subtle texture variations',
                  },
                  seasonalTrends: {
                    current: 'Year-round basics',
                    suggestions: ['Add seasonal accessories'],
                  },
                  personalityTraits: ['Practical', 'Focused'],
                  recommendations: [
                    {
                      category: 'all',
                      suggestion: 'Maintain your minimalist approach',
                      reason: 'Consistency is key to your style',
                    },
                  ],
                  styleScore: {
                    versatility: 0.9,
                    cohesiveness: 0.95,
                    trendiness: 0.5,
                    uniqueness: 0.6,
                    overall: 0.8,
                  },
                }),
              },
            ],
          },
        },
      ],
    },
  },
  outfitRecommendation: {
    success: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  outfits: [
                    {
                      id: 'outfit-1',
                      name: 'Smart Casual Friday',
                      items: [
                        { id: 'item-1', category: 'tops', name: 'White Oxford Shirt' },
                        { id: 'item-2', category: 'bottoms', name: 'Dark Wash Jeans' },
                        { id: 'item-3', category: 'shoes', name: 'Brown Leather Loafers' },
                        { id: 'item-4', category: 'accessories', name: 'Leather Belt' },
                      ],
                      occasion: 'work',
                      season: 'all_seasons',
                      style: 'smart-casual',
                      confidence: 0.92,
                      reasoning: 'Perfect balance of professional and relaxed for casual Fridays',
                      alternatives: [
                        {
                          itemToReplace: 'item-3',
                          suggestion: 'White Sneakers',
                          reason: 'For a more relaxed vibe',
                        },
                      ],
                      colorHarmony: 0.88,
                      styleCoherence: 0.9,
                    },
                    {
                      id: 'outfit-2',
                      name: 'Weekend Brunch',
                      items: [
                        { id: 'item-5', category: 'tops', name: 'Striped T-Shirt' },
                        { id: 'item-6', category: 'bottoms', name: 'Khaki Chinos' },
                        { id: 'item-7', category: 'shoes', name: 'White Canvas Sneakers' },
                        { id: 'item-8', category: 'accessories', name: 'Baseball Cap' },
                      ],
                      occasion: 'casual',
                      season: 'spring',
                      style: 'relaxed',
                      confidence: 0.88,
                      reasoning: 'Comfortable and stylish for weekend activities',
                      alternatives: [],
                      colorHarmony: 0.85,
                      styleCoherence: 0.87,
                    },
                    {
                      id: 'outfit-3',
                      name: 'Date Night',
                      items: [
                        { id: 'item-9', category: 'tops', name: 'Black Dress Shirt' },
                        { id: 'item-10', category: 'bottoms', name: 'Charcoal Dress Pants' },
                        { id: 'item-11', category: 'shoes', name: 'Black Oxford Shoes' },
                        { id: 'item-12', category: 'outerwear', name: 'Navy Blazer' },
                      ],
                      occasion: 'date',
                      season: 'fall',
                      style: 'formal',
                      confidence: 0.94,
                      reasoning: 'Sophisticated and elegant for special occasions',
                      alternatives: [
                        {
                          itemToReplace: 'item-12',
                          suggestion: 'Leather Jacket',
                          reason: 'For edgier look',
                        },
                      ],
                      colorHarmony: 0.92,
                      styleCoherence: 0.95,
                    },
                  ],
                  overallRecommendations: [
                    'Your wardrobe supports versatile outfit combinations',
                    'Consider adding more mid-layer pieces for seasonal transitions',
                    'Accessories can elevate your basic outfits significantly',
                  ],
                  missingCategories: ['outerwear', 'formal_shoes'],
                  styleConsistency: 0.86,
                }),
              },
            ],
          },
        },
      ],
    },
    limited: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  outfits: [
                    {
                      id: 'outfit-1',
                      name: 'Basic Casual',
                      items: [
                        { id: 'item-1', category: 'tops', name: 'T-Shirt' },
                        { id: 'item-2', category: 'bottoms', name: 'Jeans' },
                      ],
                      occasion: 'casual',
                      season: 'all_seasons',
                      style: 'basic',
                      confidence: 0.75,
                      reasoning: 'Limited wardrobe options available',
                      alternatives: [],
                      colorHarmony: 0.8,
                      styleCoherence: 0.8,
                    },
                  ],
                  overallRecommendations: [
                    'Build your wardrobe with versatile basics',
                    'Add shoes and accessories to complete outfits',
                  ],
                  missingCategories: ['shoes', 'accessories', 'outerwear'],
                  styleConsistency: 0.7,
                }),
              },
            ],
          },
        },
      ],
    },
  },
};

// Mock Gemini API fetch responses
export const mockGeminiFetch = (url: string, options: any) => {
  const body = JSON.parse(options.body);
  const prompt = body.contents[0].parts[0].text.toLowerCase();

  // Determine response based on prompt content
  if (prompt.includes('categorize') || prompt.includes('clothing item')) {
    if (prompt.includes('error')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockGeminiResponses.categorization.error,
      });
    }
    
    if (prompt.includes('dress')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockGeminiResponses.categorization.dress,
      });
    }
    
    if (prompt.includes('shoe') || prompt.includes('sneaker')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockGeminiResponses.categorization.shoes,
      });
    }
    
    if (prompt.includes('bag') || prompt.includes('accessory')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockGeminiResponses.categorization.accessories,
      });
    }
    
    if (prompt.includes('jean') || prompt.includes('bottom')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockGeminiResponses.categorization.partialConfidence,
      });
    }
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => mockGeminiResponses.categorization.success,
    });
  }

  if (prompt.includes('style analysis') || prompt.includes('analyze wardrobe')) {
    if (prompt.includes('minimal')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockGeminiResponses.styleAnalysis.minimal,
      });
    }
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => mockGeminiResponses.styleAnalysis.success,
    });
  }

  if (prompt.includes('outfit') || prompt.includes('recommendation')) {
    if (prompt.includes('limited')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockGeminiResponses.outfitRecommendation.limited,
      });
    }
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => mockGeminiResponses.outfitRecommendation.success,
    });
  }

  // Default response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => mockGeminiResponses.categorization.success,
  });
};

// Mock Gemini API error responses
export const mockGeminiError = (type: 'network' | 'rateLimit' | 'invalid' | 'timeout') => {
  switch (type) {
    case 'network':
      return Promise.reject(new Error('Network error'));
    case 'rateLimit':
      return Promise.resolve({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          error: {
            message: 'Rate limit exceeded',
            code: 429,
            status: 'RESOURCE_EXHAUSTED',
          },
        }),
      });
    case 'invalid':
      return Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: {
            message: 'Invalid API key',
            code: 400,
            status: 'INVALID_ARGUMENT',
          },
        }),
      });
    case 'timeout':
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 100);
      });
    default:
      return Promise.reject(new Error('Unknown error'));
  }
};

// Helper to setup Gemini mocks in tests
export const setupGeminiMocks = () => {
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    global.fetch = jest.fn((url: string, options: any) => {
      if (url.includes('generativelanguage.googleapis.com')) {
        return mockGeminiFetch(url, options);
      }
      return originalFetch(url, options);
    }) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
};

// Mock Gemini service methods
export const mockGeminiService = {
  categorizeItem: jest.fn(),
  categorizeItems: jest.fn(),
  getCategorySuggestionsFromImage: jest.fn(),
  getCategorySuggestionsFromText: jest.fn(),
  validateCategorization: jest.fn(),
  getSimilarItems: jest.fn(),
  getCategoryRules: jest.fn(),
  updateCategoryRules: jest.fn(),
  getSubcategories: jest.fn(),
  trainModel: jest.fn(),
  getAccuracyMetrics: jest.fn(),
};

// Reset all mocks
export const resetGeminiMocks = () => {
  Object.values(mockGeminiService).forEach(mock => {
    mock.mockReset();
  });
};