import { v4 as uuidv4 } from 'uuid';
import { BaseError } from '../../../../core/errors';
import { Guard } from '../../../../core/utils';
import { Result } from '../../../../core/types';
import { Season, Occasion } from '../../../wardrobe/domain/entities';

export interface StyleAnalysisProps {
  id?: string;
  imageUrl: string;
  analysisResult: AnalysisResult;
  suggestions: StyleSuggestion[];
  colorPalette: ColorAnalysis;
  patterns: PatternAnalysis[];
  styleScore: number; // 1-100
  confidence: number; // 0-1
  processing: ProcessingInfo;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisResult {
  dominantColors: string[];
  secondaryColors: string[];
  detectedItems: DetectedItem[];
  styleType: StyleType;
  formality: FormalityLevel;
  season: Season[];
  occasion: Occasion[];
  tags: string[];
  description: string;
  feedback: string;
}

export interface DetectedItem {
  type: string;
  category: string;
  confidence: number;
  boundingBox?: BoundingBox;
  color: string;
  attributes: ItemAttribute[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ItemAttribute {
  name: string;
  value: string;
  confidence: number;
}

export interface StyleSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  actionable: boolean;
  relatedItems?: string[];
  visualExamples?: string[];
}

export interface ColorAnalysis {
  dominant: ColorInfo;
  secondary: ColorInfo[];
  harmony: ColorHarmony;
  temperature: ColorTemperature;
  seasonalType?: SeasonalColorType;
}

export interface ColorInfo {
  hex: string;
  name: string;
  rgb: RGB;
  hsl: HSL;
  percentage: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface PatternAnalysis {
  type: PatternType;
  confidence: number;
  description: string;
  dominance: number; // 0-1
  complexity: ComplexityLevel;
}

export interface ProcessingInfo {
  processingTime: number;
  modelVersion: string;
  apiVersion: string;
  processingDate: Date;
  retryCount: number;
}

export enum StyleType {
  CASUAL = 'casual',
  BUSINESS = 'business',
  FORMAL = 'formal',
  SPORTY = 'sporty',
  BOHEMIAN = 'bohemian',
  MINIMALIST = 'minimalist',
  VINTAGE = 'vintage',
  TRENDY = 'trendy',
  CLASSIC = 'classic',
  EDGY = 'edgy',
  ROMANTIC = 'romantic',
  PREPPY = 'preppy',
}

export enum FormalityLevel {
  VERY_CASUAL = 'very_casual',
  CASUAL = 'casual',
  SMART_CASUAL = 'smart_casual',
  BUSINESS = 'business',
  FORMAL = 'formal',
  BLACK_TIE = 'black_tie',
}

export enum SuggestionType {
  COLOR_COMBINATION = 'color_combination',
  STYLE_IMPROVEMENT = 'style_improvement',
  ACCESSORY_ADDITION = 'accessory_addition',
  FIT_ADJUSTMENT = 'fit_adjustment',
  SEASONAL_ADAPTATION = 'seasonal_adaptation',
  OCCASION_MATCHING = 'occasion_matching',
  PATTERN_MIXING = 'pattern_mixing',
  LAYERING = 'layering',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum ColorHarmony {
  MONOCHROMATIC = 'monochromatic',
  ANALOGOUS = 'analogous',
  COMPLEMENTARY = 'complementary',
  TRIADIC = 'triadic',
  SPLIT_COMPLEMENTARY = 'split_complementary',
  TETRADIC = 'tetradic',
  NEUTRAL = 'neutral',
}

export enum ColorTemperature {
  WARM = 'warm',
  COOL = 'cool',
  NEUTRAL = 'neutral',
}

export enum SeasonalColorType {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}

export enum PatternType {
  SOLID = 'solid',
  STRIPES = 'stripes',
  POLKA_DOTS = 'polka_dots',
  FLORAL = 'floral',
  GEOMETRIC = 'geometric',
  ABSTRACT = 'abstract',
  ANIMAL_PRINT = 'animal_print',
  PLAID = 'plaid',
  PAISLEY = 'paisley',
  DAMASK = 'damask',
}

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
}

export class StyleAnalysis {
  private constructor(private props: StyleAnalysisProps) {}

  public static create(props: Omit<StyleAnalysisProps, 'id' | 'createdAt' | 'updatedAt'>): Result<StyleAnalysis> {
    const guardResult = Guard.againstNullOrUndefined(props.imageUrl, 'imageUrl');
    if (!guardResult.succeeded) {
      return Result.fail<StyleAnalysis>(guardResult.message);
    }

    const userIdResult = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (!userIdResult.succeeded) {
      return Result.fail<StyleAnalysis>(userIdResult.message);
    }

    const analysisResult = Guard.againstNullOrUndefined(props.analysisResult, 'analysisResult');
    if (!analysisResult.succeeded) {
      return Result.fail<StyleAnalysis>(analysisResult.message);
    }

    if (props.styleScore < 1 || props.styleScore > 100) {
      return Result.fail<StyleAnalysis>('Style score must be between 1 and 100');
    }

    if (props.confidence < 0 || props.confidence > 1) {
      return Result.fail<StyleAnalysis>('Confidence must be between 0 and 1');
    }

    const now = new Date();
    const analysis = new StyleAnalysis({
      ...props,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok<StyleAnalysis>(analysis);
  }

  public static fromPersistence(props: StyleAnalysisProps): Result<StyleAnalysis> {
    const guardResult = Guard.againstNullOrUndefined(props.id, 'id');
    if (!guardResult.succeeded) {
      return Result.fail<StyleAnalysis>(guardResult.message);
    }

    const analysis = new StyleAnalysis(props);
    return Result.ok<StyleAnalysis>(analysis);
  }

  public update(updates: Partial<Omit<StyleAnalysisProps, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Result<void> {
    if (updates.imageUrl !== undefined) {
      this.props.imageUrl = updates.imageUrl;
    }

    if (updates.analysisResult !== undefined) {
      this.props.analysisResult = updates.analysisResult;
    }

    if (updates.suggestions !== undefined) {
      this.props.suggestions = [...updates.suggestions];
    }

    if (updates.colorPalette !== undefined) {
      this.props.colorPalette = updates.colorPalette;
    }

    if (updates.patterns !== undefined) {
      this.props.patterns = [...updates.patterns];
    }

    if (updates.styleScore !== undefined) {
      if (updates.styleScore < 1 || updates.styleScore > 100) {
        return Result.fail<void>('Style score must be between 1 and 100');
      }
      this.props.styleScore = updates.styleScore;
    }

    if (updates.confidence !== undefined) {
      if (updates.confidence < 0 || updates.confidence > 1) {
        return Result.fail<void>('Confidence must be between 0 and 1');
      }
      this.props.confidence = updates.confidence;
    }

    if (updates.processing !== undefined) {
      this.props.processing = updates.processing;
    }

    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public addSuggestion(suggestion: StyleSuggestion): Result<void> {
    const suggestionResult = Guard.againstNullOrUndefined(suggestion, 'suggestion');
    if (!suggestionResult.succeeded) {
      return Result.fail<void>(suggestionResult.message);
    }

    this.props.suggestions.push(suggestion);
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public removeSuggestion(suggestionId: string): void {
    const index = this.props.suggestions.findIndex(s => s.id === suggestionId);
    if (index > -1) {
      this.props.suggestions.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  public getSuggestionsByType(type: SuggestionType): StyleSuggestion[] {
    return this.props.suggestions.filter(s => s.type === type);
  }

  public getSuggestionsByPriority(priority: Priority): StyleSuggestion[] {
    return this.props.suggestions.filter(s => s.priority === priority);
  }

  public getHighPrioritySuggestions(): StyleSuggestion[] {
    return this.getSuggestionsByPriority(Priority.HIGH);
  }

  public hasHighConfidence(): boolean {
    return this.props.confidence >= 0.8;
  }

  public isGoodStyleScore(): boolean {
    return this.props.styleScore >= 70;
  }

  public getDominantColor(): string {
    return this.props.colorPalette.dominant.hex;
  }

  public getDetectedItemsByCategory(category: string): DetectedItem[] {
    return this.props.analysisResult.detectedItems.filter(item => item.category === category);
  }

  public hasPattern(patternType: PatternType): boolean {
    return this.props.patterns.some(p => p.type === patternType);
  }

  public getProcessingTime(): number {
    return this.props.processing.processingTime;
  }

  // Getters
  public get id(): string {
    return this.props.id!;
  }

  public get imageUrl(): string {
    return this.props.imageUrl;
  }

  public get analysisResult(): AnalysisResult {
    return { ...this.props.analysisResult };
  }

  public get suggestions(): StyleSuggestion[] {
    return [...this.props.suggestions];
  }

  public get colorPalette(): ColorAnalysis {
    return { ...this.props.colorPalette };
  }

  public get patterns(): PatternAnalysis[] {
    return [...this.props.patterns];
  }

  public get styleScore(): number {
    return this.props.styleScore;
  }

  public get confidence(): number {
    return this.props.confidence;
  }

  public get processing(): ProcessingInfo {
    return { ...this.props.processing };
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public toJSON(): StyleAnalysisProps {
    return {
      ...this.props,
      suggestions: [...this.props.suggestions],
      patterns: [...this.props.patterns],
      analysisResult: { ...this.props.analysisResult },
      colorPalette: { ...this.props.colorPalette },
      processing: { ...this.props.processing },
    };
  }
}

export class StyleAnalysisNotFoundError extends BaseError {
  constructor(analysisId: string) {
    super(`Style analysis with ID ${analysisId} not found`, 'STYLE_ANALYSIS_NOT_FOUND');
  }
}

export class StyleAnalysisValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'STYLE_ANALYSIS_VALIDATION_ERROR');
  }
}

export class StyleAnalysisProcessingError extends BaseError {
  constructor(message: string) {
    super(message, 'STYLE_ANALYSIS_PROCESSING_ERROR');
  }
}