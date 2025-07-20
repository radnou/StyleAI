import { Result } from '../../../../core/types';
import { ClothingCategory, Season, Occasion } from '../entities';

export interface CategorizationResult {
  category: ClothingCategory;
  subcategory: string;
  confidence: number; // 0-1
  alternatives: CategoryAlternative[];
  suggestedSeasons: Season[];
  suggestedOccasions: Occasion[];
  tags: string[];
  attributes: ItemAttribute[];
}

export interface CategoryAlternative {
  category: ClothingCategory;
  subcategory: string;
  confidence: number;
  reason: string;
}

export interface ItemAttribute {
  name: string;
  value: string;
  confidence: number;
}

export interface CategorizationInput {
  imageUrl?: string;
  name?: string;
  description?: string;
  brand?: string;
  existingTags?: string[];
  userHints?: {
    preferredCategory?: ClothingCategory;
    preferredSeasons?: Season[];
    preferredOccasions?: Occasion[];
  };
}

export interface CategoryRules {
  category: ClothingCategory;
  keywords: string[];
  visualCues: string[];
  seasonalRelevance: Record<Season, number>; // 0-1 relevance score
  occasionalRelevance: Record<Occasion, number>; // 0-1 relevance score
  commonSubcategories: string[];
}

export interface IClothingCategorizationService {
  /**
   * Categorize a clothing item using AI and rules
   */
  categorizeItem(input: CategorizationInput): Promise<Result<CategorizationResult>>;

  /**
   * Categorize items in batch
   */
  categorizeItems(inputs: CategorizationInput[]): Promise<Result<CategorizationResult[]>>;

  /**
   * Get category suggestions based on image
   */
  getCategorySuggestionsFromImage(imageUrl: string): Promise<Result<CategorizationResult>>;

  /**
   * Get category suggestions based on text
   */
  getCategorySuggestionsFromText(text: string): Promise<Result<CategorizationResult>>;

  /**
   * Validate category assignment
   */
  validateCategorization(
    category: ClothingCategory,
    subcategory: string,
    input: CategorizationInput
  ): Promise<Result<ValidationResult>>;

  /**
   * Get similar items by category
   */
  getSimilarItems(
    category: ClothingCategory,
    subcategory: string,
    attributes: ItemAttribute[]
  ): Promise<Result<SimilarItem[]>>;

  /**
   * Get category rules
   */
  getCategoryRules(category: ClothingCategory): Promise<Result<CategoryRules>>;

  /**
   * Update category rules (admin function)
   */
  updateCategoryRules(category: ClothingCategory, rules: CategoryRules): Promise<Result<void>>;

  /**
   * Get all available subcategories for a category
   */
  getSubcategories(category: ClothingCategory): Promise<Result<string[]>>;

  /**
   * Train categorization model with user feedback
   */
  trainModel(feedback: CategorizationFeedback[]): Promise<Result<void>>;

  /**
   * Get categorization accuracy metrics
   */
  getAccuracyMetrics(): Promise<Result<AccuracyMetrics>>;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  warnings: string[];
  suggestions: string[];
}

export interface SimilarItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subcategory: string;
  similarity: number; // 0-1
  imageUrl?: string;
  attributes: ItemAttribute[];
}

export interface CategorizationFeedback {
  originalResult: CategorizationResult;
  userCorrection: {
    category: ClothingCategory;
    subcategory: string;
    seasons: Season[];
    occasions: Occasion[];
  };
  input: CategorizationInput;
  userId: string;
  timestamp: Date;
}

export interface AccuracyMetrics {
  overallAccuracy: number;
  categoryAccuracy: Record<ClothingCategory, number>;
  confidence: number;
  totalPredictions: number;
  correctPredictions: number;
  lastUpdated: Date;
}

export class CategorizationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CategorizationError';
  }
}

export class InsufficientDataError extends CategorizationError {
  constructor() {
    super('Insufficient data to categorize item', 'INSUFFICIENT_DATA');
  }
}

export class UnsupportedCategoryError extends CategorizationError {
  constructor(category: string) {
    super(`Unsupported category: ${category}`, 'UNSUPPORTED_CATEGORY');
  }
}