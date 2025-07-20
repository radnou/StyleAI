import { Result } from '../../../../core/types';
import { StyleAnalysis, AnalysisResult, StyleSuggestion } from '../entities';

export interface StyleAnalysisInput {
  imageUrl: string;
  userPreferences?: UserStylePreferences;
  context?: AnalysisContext;
  options?: AnalysisOptions;
}

export interface UserStylePreferences {
  preferredStyles: string[];
  colorPreferences: string[];
  bodyType?: string;
  skinTone?: string;
  hairColor?: string;
  lifestyle?: string;
  budget?: BudgetRange;
  avoidColors?: string[];
  preferredBrands?: string[];
}

export interface AnalysisContext {
  occasion?: string;
  season?: string;
  weather?: WeatherCondition;
  location?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  event?: string;
}

export interface AnalysisOptions {
  includeColorAnalysis: boolean;
  includePatternAnalysis: boolean;
  includeSuggestions: boolean;
  includeAlternatives: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  language?: string;
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

export interface StyleComparisonResult {
  similarity: number; // 0-1
  differences: string[];
  improvements: string[];
  score: number; // 1-100
}

export interface TrendAnalysis {
  currentTrends: Trend[];
  alignment: number; // 0-1, how well the style aligns with trends
  suggestions: string[];
  trendScore: number; // 1-100
}

export interface Trend {
  id: string;
  name: string;
  description: string;
  popularity: number; // 0-1
  category: string;
  season: string;
  tags: string[];
  exampleImages: string[];
  relevance: number; // 0-1, relevance to user's style
}

export interface StyleEvolution {
  timeline: StyleTimelinePoint[];
  progression: number; // 0-1, how much style has evolved
  consistency: number; // 0-1, how consistent style is
  recommendations: string[];
}

export interface StyleTimelinePoint {
  date: Date;
  styleScore: number;
  dominantStyle: string;
  confidence: number;
  imageUrl: string;
  analysisId: string;
}

export interface IStyleAnalysisService {
  /**
   * Analyze a single outfit/style from image
   */
  analyzeStyle(input: StyleAnalysisInput): Promise<Result<StyleAnalysis>>;

  /**
   * Analyze multiple images in batch
   */
  analyzeMultipleStyles(inputs: StyleAnalysisInput[]): Promise<Result<StyleAnalysis[]>>;

  /**
   * Compare two styles
   */
  compareStyles(
    imageUrl1: string,
    imageUrl2: string,
    context?: AnalysisContext
  ): Promise<Result<StyleComparisonResult>>;

  /**
   * Get style suggestions based on analysis
   */
  getStyleSuggestions(
    analysis: StyleAnalysis,
    preferences: UserStylePreferences
  ): Promise<Result<StyleSuggestion[]>>;

  /**
   * Analyze current fashion trends
   */
  analyzeTrends(
    styleType?: string,
    season?: string,
    location?: string
  ): Promise<Result<TrendAnalysis>>;

  /**
   * Get style evolution analysis for a user
   */
  getStyleEvolution(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<Result<StyleEvolution>>;

  /**
   * Get personalized style recommendations
   */
  getPersonalizedRecommendations(
    userId: string,
    preferences: UserStylePreferences,
    context: AnalysisContext
  ): Promise<Result<StyleSuggestion[]>>;

  /**
   * Validate style analysis result
   */
  validateAnalysis(analysis: AnalysisResult): Promise<Result<ValidationResult>>;

  /**
   * Get style confidence score
   */
  getConfidenceScore(analysis: AnalysisResult): Promise<Result<number>>;

  /**
   * Improve analysis with user feedback
   */
  improveWithFeedback(
    analysisId: string,
    feedback: StyleFeedback
  ): Promise<Result<StyleAnalysis>>;

  /**
   * Get similar styles
   */
  getSimilarStyles(
    analysis: StyleAnalysis,
    limit?: number
  ): Promise<Result<SimilarStyle[]>>;

  /**
   * Get style compatibility score
   */
  getCompatibilityScore(
    style1: StyleAnalysis,
    style2: StyleAnalysis
  ): Promise<Result<number>>;

  /**
   * Generate style report
   */
  generateStyleReport(
    userId: string,
    analyses: StyleAnalysis[]
  ): Promise<Result<StyleReport>>;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface StyleFeedback {
  rating: number; // 1-5
  accuracy: number; // 1-5
  usefulness: number; // 1-5
  corrections: {
    category?: string;
    colors?: string[];
    style?: string;
    suggestions?: string[];
  };
  comments: string;
  userId: string;
  timestamp: Date;
}

export interface SimilarStyle {
  id: string;
  imageUrl: string;
  similarity: number; // 0-1
  styleType: string;
  description: string;
  tags: string[];
  analysisId: string;
}

export interface StyleReport {
  userId: string;
  period: { start: Date; end: Date };
  summary: {
    totalAnalyses: number;
    averageScore: number;
    dominantStyle: string;
    mostUsedColors: string[];
    styleConsistency: number;
    improvement: number;
  };
  trends: {
    styleEvolution: StyleEvolution;
    colorEvolution: ColorEvolution;
    preferenceChanges: PreferenceChange[];
  };
  recommendations: {
    immediateActions: string[];
    longTermGoals: string[];
    shoppingList: string[];
  };
  insights: string[];
  generatedAt: Date;
}

export interface ColorEvolution {
  timeline: ColorTimelinePoint[];
  dominantColors: string[];
  colorConsistency: number;
  seasonalAdaptation: number;
}

export interface ColorTimelinePoint {
  date: Date;
  dominantColor: string;
  colorPalette: string[];
  confidence: number;
}

export interface PreferenceChange {
  aspect: string;
  from: string;
  to: string;
  confidence: number;
  date: Date;
}

export class StyleAnalysisError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StyleAnalysisError';
  }
}

export class ImageAnalysisError extends StyleAnalysisError {
  constructor(message: string) {
    super(message, 'IMAGE_ANALYSIS_ERROR');
  }
}

export class InsufficientImageQualityError extends StyleAnalysisError {
  constructor() {
    super('Image quality is insufficient for analysis', 'INSUFFICIENT_IMAGE_QUALITY');
  }
}

export class UnsupportedStyleError extends StyleAnalysisError {
  constructor(style: string) {
    super(`Unsupported style: ${style}`, 'UNSUPPORTED_STYLE');
  }
}