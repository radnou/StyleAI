import { Result } from '../../../../core/types';
import { Recommendation, RecommendationType, Priority } from '../entities';
import { ClothingItem, Outfit, Season, Occasion } from '../../../wardrobe/domain/entities';

export interface RecommendationInput {
  userId: string;
  type: RecommendationType;
  context: RecommendationContext;
  preferences: UserPreferences;
  constraints?: RecommendationConstraints;
  options?: RecommendationOptions;
}

export interface RecommendationContext {
  occasion?: Occasion;
  season?: Season;
  weather?: WeatherCondition;
  event?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  location?: string;
  budget?: BudgetRange;
  existingItems?: string[]; // ClothingItem IDs
  inspirationImages?: string[];
}

export interface UserPreferences {
  preferredStyles: string[];
  colorPreferences: string[];
  avoidColors?: string[];
  preferredBrands?: string[];
  avoidBrands?: string[];
  sizePreferences?: Record<string, string>;
  bodyType?: string;
  skinTone?: string;
  lifestyle?: string;
  personalityTraits?: string[];
  styleGoals?: string[];
}

export interface RecommendationConstraints {
  maxItems?: number;
  maxPrice?: number;
  onlyOwnedItems?: boolean;
  excludeItems?: string[];
  requiredCategories?: string[];
  sustainabilityFocus?: boolean;
  ethicalBrands?: boolean;
}

export interface RecommendationOptions {
  includeAlternatives: boolean;
  includeShoppingLinks: boolean;
  includeStylingTips: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  priorityLevel: Priority;
  expirationDays?: number;
}

export interface WeatherCondition {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  humidity: number;
  uvIndex?: number;
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface RecommendationScore {
  overall: number; // 0-1
  styleMatch: number; // 0-1
  colorHarmony: number; // 0-1
  seasonalFit: number; // 0-1
  occasionMatch: number; // 0-1
  priceValue: number; // 0-1
  personalityFit: number; // 0-1
  trendiness: number; // 0-1
  sustainability: number; // 0-1
}

export interface RecommendationInsight {
  type: 'style' | 'color' | 'fit' | 'occasion' | 'trend' | 'budget' | 'sustainability';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  learnMore?: string;
}

export interface RecommendationPerformance {
  recommendationId: string;
  views: number;
  clicks: number;
  implementations: number;
  ratings: number[];
  feedback: string[];
  conversionRate: number;
  userSatisfaction: number;
  timeToImplement?: number;
}

export interface IRecommendationService {
  /**
   * Generate personalized recommendations
   */
  generateRecommendations(input: RecommendationInput): Promise<Result<Recommendation[]>>;

  /**
   * Get outfit recommendations based on existing items
   */
  getOutfitRecommendations(
    userId: string,
    existingItems: ClothingItem[],
    context: RecommendationContext
  ): Promise<Result<Recommendation[]>>;

  /**
   * Get item recommendations to complete wardrobe
   */
  getWardrobeCompletionRecommendations(
    userId: string,
    wardrobe: ClothingItem[],
    goals: string[]
  ): Promise<Result<Recommendation[]>>;

  /**
   * Get seasonal recommendations
   */
  getSeasonalRecommendations(
    userId: string,
    season: Season,
    preferences: UserPreferences
  ): Promise<Result<Recommendation[]>>;

  /**
   * Get occasion-specific recommendations
   */
  getOccasionRecommendations(
    userId: string,
    occasion: Occasion,
    context: RecommendationContext
  ): Promise<Result<Recommendation[]>>;

  /**
   * Get trend-based recommendations
   */
  getTrendRecommendations(
    userId: string,
    preferences: UserPreferences,
    trendLevel: 'conservative' | 'moderate' | 'cutting-edge'
  ): Promise<Result<Recommendation[]>>;

  /**
   * Get budget-friendly recommendations
   */
  getBudgetRecommendations(
    userId: string,
    budget: BudgetRange,
    preferences: UserPreferences
  ): Promise<Result<Recommendation[]>>;

  /**
   * Get sustainable fashion recommendations
   */
  getSustainableRecommendations(
    userId: string,
    preferences: UserPreferences,
    sustainabilityLevel: 'minimal' | 'moderate' | 'strict'
  ): Promise<Result<Recommendation[]>>;

  /**
   * Score a recommendation
   */
  scoreRecommendation(
    recommendation: Recommendation,
    preferences: UserPreferences,
    context: RecommendationContext
  ): Promise<Result<RecommendationScore>>;

  /**
   * Get recommendation insights
   */
  getRecommendationInsights(
    recommendation: Recommendation,
    userHistory: Recommendation[]
  ): Promise<Result<RecommendationInsight[]>>;

  /**
   * Update recommendation based on feedback
   */
  updateRecommendationWithFeedback(
    recommendationId: string,
    feedback: RecommendationFeedback
  ): Promise<Result<Recommendation>>;

  /**
   * Get similar recommendations
   */
  getSimilarRecommendations(
    recommendationId: string,
    limit?: number
  ): Promise<Result<Recommendation[]>>;

  /**
   * Get recommendation performance metrics
   */
  getRecommendationPerformance(
    recommendationId: string
  ): Promise<Result<RecommendationPerformance>>;

  /**
   * Get personalized recommendation strategy
   */
  getPersonalizedStrategy(
    userId: string,
    preferences: UserPreferences,
    history: Recommendation[]
  ): Promise<Result<RecommendationStrategy>>;

  /**
   * Validate recommendation logic
   */
  validateRecommendation(
    recommendation: Recommendation,
    context: RecommendationContext
  ): Promise<Result<ValidationResult>>;

  /**
   * Get recommendation alternatives
   */
  getRecommendationAlternatives(
    recommendationId: string,
    constraints: RecommendationConstraints
  ): Promise<Result<Recommendation[]>>;

  /**
   * Batch generate recommendations
   */
  batchGenerateRecommendations(
    inputs: RecommendationInput[]
  ): Promise<Result<Recommendation[]>>;

  /**
   * Get recommendation analytics
   */
  getRecommendationAnalytics(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<Result<RecommendationAnalytics>>;
}

export interface RecommendationFeedback {
  rating: number; // 1-5
  useful: boolean;
  implemented: boolean;
  reasons: string[];
  improvements: string[];
  alternativePreferences: string[];
  userId: string;
  timestamp: Date;
}

export interface RecommendationStrategy {
  userId: string;
  primaryApproach: 'style-first' | 'color-first' | 'occasion-first' | 'trend-first' | 'budget-first';
  secondaryFactors: string[];
  personalityWeight: number;
  trendWeight: number;
  practicalityWeight: number;
  budgetWeight: number;
  sustainabilityWeight: number;
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  learningRate: number;
  confidence: number;
  lastUpdated: Date;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  warnings: string[];
  suggestions: string[];
  score: number;
}

export interface RecommendationAnalytics {
  totalRecommendations: number;
  implementationRate: number;
  averageRating: number;
  topPerformingTypes: RecommendationType[];
  userSatisfaction: number;
  accuracyTrend: number[];
  preferences: {
    mostLiked: string[];
    leastLiked: string[];
    emerging: string[];
    declining: string[];
  };
  insights: string[];
  recommendations: string[];
  period: { start: Date; end: Date };
}

export class RecommendationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'RecommendationError';
  }
}

export class InsufficientDataError extends RecommendationError {
  constructor() {
    super('Insufficient data to generate recommendations', 'INSUFFICIENT_DATA');
  }
}

export class InvalidPreferencesError extends RecommendationError {
  constructor(message: string) {
    super(message, 'INVALID_PREFERENCES');
  }
}

export class NoRecommendationsFoundError extends RecommendationError {
  constructor() {
    super('No suitable recommendations found for the given criteria', 'NO_RECOMMENDATIONS_FOUND');
  }
}