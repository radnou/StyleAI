import { StyleAnalysis, StyleAnalysisProps } from '../../../domain/entities';

describe('StyleAnalysis Entity', () => {
  const validProps: Omit<StyleAnalysisProps, 'id' | 'createdAt' | 'updatedAt'> = {
    userId: 'user123',
    overallStyle: 'casual-chic',
    styleDescription: 'A blend of casual comfort with sophisticated elements',
    keyElements: [
      'Clean lines and minimalist aesthetics',
      'Neutral color palette',
      'Mix of classic and modern pieces',
    ],
    colorAnalysis: {
      dominantColors: ['navy', 'white', 'gray'],
      accentColors: ['burgundy', 'olive'],
      recommendation: 'Add more vibrant accent pieces for visual interest',
    },
    seasonalTrends: {
      current: 'Well-suited for transitional weather',
      suggestions: [
        'Add lightweight layers for spring',
        'Incorporate breathable fabrics for summer',
      ],
    },
    personalityTraits: [
      'Practical and efficiency-focused',
      'Appreciates timeless style',
      'Values comfort',
    ],
    recommendations: [
      {
        category: 'tops',
        suggestion: 'Add structured blazers',
        reason: 'Will complement existing casual pieces',
      },
      {
        category: 'accessories',
        suggestion: 'Invest in statement accessories',
        reason: 'Can transform basic outfits',
      },
    ],
    styleScore: {
      versatility: 0.85,
      cohesiveness: 0.88,
      trendiness: 0.65,
      uniqueness: 0.72,
      overall: 0.82,
    },
    wardrobeAnalysis: {
      totalItems: 45,
      categoryDistribution: {
        tops: 15,
        bottoms: 10,
        dresses: 3,
        outerwear: 5,
        shoes: 8,
        accessories: 4,
      },
      colorDistribution: {
        neutrals: 0.6,
        darks: 0.25,
        brights: 0.15,
      },
      seasonalCoverage: {
        spring: 0.8,
        summer: 0.7,
        fall: 0.85,
        winter: 0.75,
      },
    },
  };

  describe('create', () => {
    it('should create a valid style analysis', () => {
      const result = StyleAnalysis.create(validProps);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.userId).toBe('user123');
      expect(result.value.overallStyle).toBe('casual-chic');
      expect(result.value.styleDescription).toBe(validProps.styleDescription);
      expect(result.value.keyElements).toHaveLength(3);
      expect(result.value.id).toBeDefined();
      expect(result.value.createdAt).toBeInstanceOf(Date);
      expect(result.value.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail when userId is missing', () => {
      const props = { ...validProps, userId: '' };
      const result = StyleAnalysis.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('userId');
    });

    it('should fail when overallStyle is missing', () => {
      const props = { ...validProps, overallStyle: '' };
      const result = StyleAnalysis.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('overallStyle');
    });

    it('should fail when styleDescription is missing', () => {
      const props = { ...validProps, styleDescription: '' };
      const result = StyleAnalysis.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('styleDescription');
    });

    it('should fail when keyElements is empty', () => {
      const props = { ...validProps, keyElements: [] };
      const result = StyleAnalysis.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('key elements');
    });

    it('should fail when recommendations is empty', () => {
      const props = { ...validProps, recommendations: [] };
      const result = StyleAnalysis.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('recommendation');
    });

    it('should create analysis with minimal required fields', () => {
      const minimalProps = {
        userId: 'user123',
        overallStyle: 'minimalist',
        styleDescription: 'Simple and functional',
        keyElements: ['Clean lines'],
        colorAnalysis: {
          dominantColors: ['black', 'white'],
          accentColors: [],
          recommendation: 'Consider subtle accents',
        },
        seasonalTrends: {
          current: 'Year-round basics',
          suggestions: [],
        },
        personalityTraits: ['Practical'],
        recommendations: [
          {
            category: 'all',
            suggestion: 'Maintain consistency',
            reason: 'Works well',
          },
        ],
        styleScore: {
          versatility: 0.9,
          cohesiveness: 0.95,
          trendiness: 0.5,
          uniqueness: 0.6,
          overall: 0.8,
        },
      };
      
      const result = StyleAnalysis.create(minimalProps);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.wardrobeAnalysis).toBeUndefined();
    });
  });

  describe('fromPersistence', () => {
    it('should recreate analysis from persisted data', () => {
      const persistedProps: StyleAnalysisProps = {
        id: 'existing-analysis-id',
        ...validProps,
        createdAt: new Date('2023-11-01'),
        updatedAt: new Date('2023-12-01'),
      };
      
      const result = StyleAnalysis.fromPersistence(persistedProps);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.id).toBe('existing-analysis-id');
      expect(result.value.overallStyle).toBe('casual-chic');
      expect(result.value.createdAt).toEqual(new Date('2023-11-01'));
    });

    it('should fail when id is missing in persisted data', () => {
      const propsWithoutId = {
        ...validProps,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as StyleAnalysisProps;
      
      const result = StyleAnalysis.fromPersistence(propsWithoutId);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('id');
    });
  });

  describe('update', () => {
    it('should update analysis properties', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      const updateResult = analysis.update({
        overallStyle: 'modern-minimalist',
        styleDescription: 'Updated description',
        recommendations: [
          {
            category: 'shoes',
            suggestion: 'Add ankle boots',
            reason: 'Versatile option',
          },
        ],
      });
      
      expect(updateResult.succeeded).toBe(true);
      expect(analysis.overallStyle).toBe('modern-minimalist');
      expect(analysis.styleDescription).toBe('Updated description');
      expect(analysis.recommendations).toHaveLength(1);
      expect(analysis.updatedAt.getTime()).toBeGreaterThan(analysis.createdAt.getTime());
    });

    it('should fail when updating with invalid overallStyle', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      const updateResult = analysis.update({ overallStyle: '' });
      
      expect(updateResult.succeeded).toBe(false);
      expect(updateResult.message).toContain('overallStyle');
    });

    it('should update style score', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      const newScore = {
        versatility: 0.9,
        cohesiveness: 0.92,
        trendiness: 0.7,
        uniqueness: 0.75,
        overall: 0.87,
      };
      
      const updateResult = analysis.update({ styleScore: newScore });
      
      expect(updateResult.succeeded).toBe(true);
      expect(analysis.styleScore.overall).toBe(0.87);
      expect(analysis.styleScore.versatility).toBe(0.9);
    });
  });

  describe('style score methods', () => {
    it('should check if style is balanced', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // All scores are relatively close (0.65 - 0.88)
      expect(analysis.isStyleBalanced()).toBe(true);
    });

    it('should detect unbalanced style', () => {
      const unbalancedProps = {
        ...validProps,
        styleScore: {
          versatility: 0.95,
          cohesiveness: 0.9,
          trendiness: 0.3, // Very low
          uniqueness: 0.85,
          overall: 0.75,
        },
      };
      
      const analysisResult = StyleAnalysis.create(unbalancedProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      expect(analysis.isStyleBalanced()).toBe(false);
    });

    it('should identify strongest aspect', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // cohesiveness: 0.88 is highest
      expect(analysis.getStrongestAspect()).toBe('cohesiveness');
    });

    it('should identify weakest aspect', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // trendiness: 0.65 is lowest
      expect(analysis.getWeakestAspect()).toBe('trendiness');
    });

    it('should check if needs improvement', () => {
      const lowScoreProps = {
        ...validProps,
        styleScore: {
          versatility: 0.5,
          cohesiveness: 0.55,
          trendiness: 0.4,
          uniqueness: 0.45,
          overall: 0.48,
        },
      };
      
      const analysisResult = StyleAnalysis.create(lowScoreProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      expect(analysis.needsImprovement()).toBe(true);
    });

    it('should not need improvement with good scores', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // overall: 0.82 is above 0.6 threshold
      expect(analysis.needsImprovement()).toBe(false);
    });
  });

  describe('color analysis methods', () => {
    it('should check if color palette is neutral', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // navy, white, gray are all neutrals
      expect(analysis.hasNeutralPalette()).toBe(true);
    });

    it('should detect non-neutral palette', () => {
      const colorfulProps = {
        ...validProps,
        colorAnalysis: {
          dominantColors: ['red', 'blue', 'green'],
          accentColors: ['yellow', 'purple'],
          recommendation: 'Very colorful wardrobe',
        },
      };
      
      const analysisResult = StyleAnalysis.create(colorfulProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      expect(analysis.hasNeutralPalette()).toBe(false);
    });

    it('should count total colors', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // 3 dominant + 2 accent = 5 total
      expect(analysis.getTotalColors()).toBe(5);
    });

    it('should check if needs more color', () => {
      const monochromeProps = {
        ...validProps,
        colorAnalysis: {
          dominantColors: ['black', 'white'],
          accentColors: [],
          recommendation: 'Add color',
        },
      };
      
      const analysisResult = StyleAnalysis.create(monochromeProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      expect(analysis.needsMoreColor()).toBe(true);
    });

    it('should not need more color with sufficient palette', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // Has 5 colors total
      expect(analysis.needsMoreColor()).toBe(false);
    });
  });

  describe('wardrobe analysis methods', () => {
    it('should get dominant category', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // tops: 15 is highest
      expect(analysis.getDominantCategory()).toBe('tops');
    });

    it('should return null when no wardrobe analysis', () => {
      const propsWithoutWardrobe = {
        ...validProps,
        wardrobeAnalysis: undefined,
      };
      
      const analysisResult = StyleAnalysis.create(propsWithoutWardrobe);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      expect(analysis.getDominantCategory()).toBeNull();
    });

    it('should check if wardrobe is balanced', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // Distribution is relatively balanced
      expect(analysis.isWardrobeBalanced()).toBe(true);
    });

    it('should detect unbalanced wardrobe', () => {
      const unbalancedProps = {
        ...validProps,
        wardrobeAnalysis: {
          ...validProps.wardrobeAnalysis!,
          categoryDistribution: {
            tops: 30, // Dominant
            bottoms: 5,
            dresses: 1,
            outerwear: 2,
            shoes: 3,
            accessories: 1,
          },
        },
      };
      
      const analysisResult = StyleAnalysis.create(unbalancedProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      expect(analysis.isWardrobeBalanced()).toBe(false);
    });

    it('should calculate seasonal coverage score', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      // Average of 0.8, 0.7, 0.85, 0.75 = 0.775
      const coverage = analysis.getSeasonalCoverageScore();
      expect(coverage).toBeCloseTo(0.775, 2);
    });

    it('should return 0 for seasonal coverage when no analysis', () => {
      const propsWithoutWardrobe = {
        ...validProps,
        wardrobeAnalysis: undefined,
      };
      
      const analysisResult = StyleAnalysis.create(propsWithoutWardrobe);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      expect(analysis.getSeasonalCoverageScore()).toBe(0);
    });
  });

  describe('recommendation methods', () => {
    it('should get recommendations by category', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      const topRecommendations = analysis.getRecommendationsByCategory('tops');
      expect(topRecommendations).toHaveLength(1);
      expect(topRecommendations[0].suggestion).toContain('blazers');
    });

    it('should return empty array for category without recommendations', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      const shoeRecommendations = analysis.getRecommendationsByCategory('shoes');
      expect(shoeRecommendations).toHaveLength(0);
    });

    it('should check if has recommendation for category', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      expect(analysis.hasRecommendationForCategory('tops')).toBe(true);
      expect(analysis.hasRecommendationForCategory('shoes')).toBe(false);
    });

    it('should add recommendation', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      const initialCount = analysis.recommendations.length;
      
      const addResult = analysis.addRecommendation({
        category: 'shoes',
        suggestion: 'Add versatile sneakers',
        reason: 'For casual comfort',
      });
      
      expect(addResult.succeeded).toBe(true);
      expect(analysis.recommendations).toHaveLength(initialCount + 1);
    });

    it('should fail to add recommendation with empty suggestion', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      
      const addResult = analysis.addRecommendation({
        category: 'shoes',
        suggestion: '',
        reason: 'For comfort',
      });
      
      expect(addResult.succeeded).toBe(false);
      expect(addResult.message).toContain('suggestion');
    });
  });

  describe('validation', () => {
    it('should validate style scores', () => {
      const invalidScoreProps = {
        ...validProps,
        styleScore: {
          versatility: 1.5, // Invalid: > 1
          cohesiveness: 0.88,
          trendiness: -0.1, // Invalid: < 0
          uniqueness: 0.72,
          overall: 0.82,
        },
      };
      
      const result = StyleAnalysis.create(invalidScoreProps);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('score');
    });

    it('should validate recommendations have required fields', () => {
      const invalidRecommendationProps = {
        ...validProps,
        recommendations: [
          {
            category: '',
            suggestion: 'Add something',
            reason: 'Because',
          },
        ],
      };
      
      const result = StyleAnalysis.create(invalidRecommendationProps);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('category');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const analysisResult = StyleAnalysis.create(validProps);
      expect(analysisResult.succeeded).toBe(true);
      
      const analysis = analysisResult.value;
      const json = analysis.toJSON();
      
      expect(json.userId).toBe(validProps.userId);
      expect(json.overallStyle).toBe(validProps.overallStyle);
      expect(json.id).toBeDefined();
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
      expect(Array.isArray(json.keyElements)).toBe(true);
      expect(Array.isArray(json.recommendations)).toBe(true);
      expect(json.styleScore).toEqual(validProps.styleScore);
      expect(json.wardrobeAnalysis).toEqual(validProps.wardrobeAnalysis);
    });
  });
});