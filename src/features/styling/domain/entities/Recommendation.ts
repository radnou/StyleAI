import { v4 as uuidv4 } from 'uuid';
import { BaseError } from '../../../../core/errors';
import { Guard } from '../../../../core/utils';
import { Result } from '../../../../core/types';
import { Season, Occasion } from '../../../wardrobe/domain/entities';

export interface RecommendationProps {
  id?: string;
  type: RecommendationType;
  title: string;
  description: string;
  reason: string;
  confidence: number; // 0-1
  priority: Priority;
  season: Season[];
  occasion: Occasion[];
  items: RecommendationItem[];
  alternatives: RecommendationItem[];
  tags: string[];
  imageUrl?: string;
  inspirationImages?: string[];
  styleScore: number; // 1-100
  isImplemented: boolean;
  implementedAt?: Date;
  feedback?: UserFeedback;
  expiresAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendationItem {
  id: string;
  type: ItemType;
  category: string;
  subcategory?: string;
  name: string;
  description: string;
  color: string;
  brands?: string[];
  priceRange?: PriceRange;
  availability: Availability;
  images?: string[];
  attributes: ItemAttribute[];
  purchaseLinks?: PurchaseLink[];
  isOwned: boolean;
  ownedItemId?: string;
  priority: Priority;
}

export interface UserFeedback {
  rating: number; // 1-5
  liked: boolean;
  implemented: boolean;
  comments?: string;
  improvements?: string[];
  submittedAt: Date;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface PurchaseLink {
  retailer: string;
  url: string;
  price: number;
  currency: string;
  inStock: boolean;
  lastChecked: Date;
}

export interface ItemAttribute {
  name: string;
  value: string;
  importance: number; // 0-1
}

export interface Availability {
  inStock: boolean;
  estimatedRestockDate?: Date;
  alternatives: string[];
}

export enum RecommendationType {
  OUTFIT_COMPLETE = 'outfit_complete',
  ITEM_ADDITION = 'item_addition',
  STYLE_IMPROVEMENT = 'style_improvement',
  COLOR_COORDINATION = 'color_coordination',
  SEASONAL_UPDATE = 'seasonal_update',
  OCCASION_SPECIFIC = 'occasion_specific',
  TREND_BASED = 'trend_based',
  PERSONAL_STYLE = 'personal_style',
  BUDGET_FRIENDLY = 'budget_friendly',
  CAPSULE_WARDROBE = 'capsule_wardrobe',
}

export enum ItemType {
  EXACT_MATCH = 'exact_match',
  SIMILAR_ITEM = 'similar_item',
  STYLE_INSPIRATION = 'style_inspiration',
  COMPLEMENTARY = 'complementary',
  ALTERNATIVE = 'alternative',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class Recommendation {
  private constructor(private props: RecommendationProps) {}

  public static create(props: Omit<RecommendationProps, 'id' | 'createdAt' | 'updatedAt'>): Result<Recommendation> {
    const guardResult = Guard.againstNullOrUndefined(props.title, 'title');
    if (!guardResult.succeeded) {
      return Result.fail<Recommendation>(guardResult.message);
    }

    const titleResult = Guard.againstAtMost(props.title, 200, 'title');
    if (!titleResult.succeeded) {
      return Result.fail<Recommendation>(titleResult.message);
    }

    const descriptionResult = Guard.againstNullOrUndefined(props.description, 'description');
    if (!descriptionResult.succeeded) {
      return Result.fail<Recommendation>(descriptionResult.message);
    }

    const reasonResult = Guard.againstNullOrUndefined(props.reason, 'reason');
    if (!reasonResult.succeeded) {
      return Result.fail<Recommendation>(reasonResult.message);
    }

    const userIdResult = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (!userIdResult.succeeded) {
      return Result.fail<Recommendation>(userIdResult.message);
    }

    if (props.confidence < 0 || props.confidence > 1) {
      return Result.fail<Recommendation>('Confidence must be between 0 and 1');
    }

    if (props.styleScore < 1 || props.styleScore > 100) {
      return Result.fail<Recommendation>('Style score must be between 1 and 100');
    }

    if (props.items.length === 0) {
      return Result.fail<Recommendation>('Recommendation must contain at least one item');
    }

    const now = new Date();
    const recommendation = new Recommendation({
      ...props,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok<Recommendation>(recommendation);
  }

  public static fromPersistence(props: RecommendationProps): Result<Recommendation> {
    const guardResult = Guard.againstNullOrUndefined(props.id, 'id');
    if (!guardResult.succeeded) {
      return Result.fail<Recommendation>(guardResult.message);
    }

    const recommendation = new Recommendation(props);
    return Result.ok<Recommendation>(recommendation);
  }

  public update(updates: Partial<Omit<RecommendationProps, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Result<void> {
    if (updates.type !== undefined) {
      this.props.type = updates.type;
    }

    if (updates.title !== undefined) {
      const titleResult = Guard.againstAtMost(updates.title, 200, 'title');
      if (!titleResult.succeeded) {
        return Result.fail<void>(titleResult.message);
      }
      this.props.title = updates.title;
    }

    if (updates.description !== undefined) {
      this.props.description = updates.description;
    }

    if (updates.reason !== undefined) {
      this.props.reason = updates.reason;
    }

    if (updates.confidence !== undefined) {
      if (updates.confidence < 0 || updates.confidence > 1) {
        return Result.fail<void>('Confidence must be between 0 and 1');
      }
      this.props.confidence = updates.confidence;
    }

    if (updates.priority !== undefined) {
      this.props.priority = updates.priority;
    }

    if (updates.season !== undefined) {
      this.props.season = [...updates.season];
    }

    if (updates.occasion !== undefined) {
      this.props.occasion = [...updates.occasion];
    }

    if (updates.items !== undefined) {
      if (updates.items.length === 0) {
        return Result.fail<void>('Recommendation must contain at least one item');
      }
      this.props.items = [...updates.items];
    }

    if (updates.alternatives !== undefined) {
      this.props.alternatives = [...updates.alternatives];
    }

    if (updates.tags !== undefined) {
      this.props.tags = [...updates.tags];
    }

    if (updates.imageUrl !== undefined) {
      this.props.imageUrl = updates.imageUrl;
    }

    if (updates.inspirationImages !== undefined) {
      this.props.inspirationImages = [...updates.inspirationImages];
    }

    if (updates.styleScore !== undefined) {
      if (updates.styleScore < 1 || updates.styleScore > 100) {
        return Result.fail<void>('Style score must be between 1 and 100');
      }
      this.props.styleScore = updates.styleScore;
    }

    if (updates.isImplemented !== undefined) {
      this.props.isImplemented = updates.isImplemented;
    }

    if (updates.implementedAt !== undefined) {
      this.props.implementedAt = updates.implementedAt;
    }

    if (updates.feedback !== undefined) {
      this.props.feedback = updates.feedback;
    }

    if (updates.expiresAt !== undefined) {
      this.props.expiresAt = updates.expiresAt;
    }

    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public implement(): Result<void> {
    if (this.props.isImplemented) {
      return Result.fail<void>('Recommendation is already implemented');
    }

    this.props.isImplemented = true;
    this.props.implementedAt = new Date();
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public addFeedback(feedback: UserFeedback): Result<void> {
    const feedbackResult = Guard.againstNullOrUndefined(feedback, 'feedback');
    if (!feedbackResult.succeeded) {
      return Result.fail<void>(feedbackResult.message);
    }

    if (feedback.rating < 1 || feedback.rating > 5) {
      return Result.fail<void>('Rating must be between 1 and 5');
    }

    this.props.feedback = feedback;
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public addItem(item: RecommendationItem): Result<void> {
    const itemResult = Guard.againstNullOrUndefined(item, 'item');
    if (!itemResult.succeeded) {
      return Result.fail<void>(itemResult.message);
    }

    this.props.items.push(item);
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public removeItem(itemId: string): Result<void> {
    const index = this.props.items.findIndex(item => item.id === itemId);
    if (index > -1) {
      this.props.items.splice(index, 1);
      this.props.updatedAt = new Date();
    }

    if (this.props.items.length === 0) {
      return Result.fail<void>('Recommendation must contain at least one item');
    }

    return Result.ok<void>();
  }

  public addAlternative(alternative: RecommendationItem): Result<void> {
    const alternativeResult = Guard.againstNullOrUndefined(alternative, 'alternative');
    if (!alternativeResult.succeeded) {
      return Result.fail<void>(alternativeResult.message);
    }

    this.props.alternatives.push(alternative);
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public addTag(tag: string): Result<void> {
    const tagResult = Guard.againstNullOrUndefined(tag, 'tag');
    if (!tagResult.succeeded) {
      return Result.fail<void>(tagResult.message);
    }

    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag === '') {
      return Result.fail<void>('Tag cannot be empty');
    }

    if (!this.props.tags.includes(trimmedTag)) {
      this.props.tags.push(trimmedTag);
      this.props.updatedAt = new Date();
    }

    return Result.ok<void>();
  }

  public removeTag(tag: string): void {
    const index = this.props.tags.indexOf(tag.trim().toLowerCase());
    if (index > -1) {
      this.props.tags.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  public hasTag(tag: string): boolean {
    return this.props.tags.includes(tag.trim().toLowerCase());
  }

  public isSuitableForSeason(season: Season): boolean {
    return this.props.season.includes(season) || this.props.season.includes(Season.ALL_SEASONS);
  }

  public isSuitableForOccasion(occasion: Occasion): boolean {
    return this.props.occasion.includes(occasion);
  }

  public isExpired(): boolean {
    if (!this.props.expiresAt) return false;
    return new Date() > this.props.expiresAt;
  }

  public hasHighConfidence(): boolean {
    return this.props.confidence >= 0.8;
  }

  public isHighPriority(): boolean {
    return this.props.priority === Priority.HIGH;
  }

  public getOwnedItems(): RecommendationItem[] {
    return this.props.items.filter(item => item.isOwned);
  }

  public getItemsToAcquire(): RecommendationItem[] {
    return this.props.items.filter(item => !item.isOwned);
  }

  public getEstimatedCost(): number {
    return this.props.items
      .filter(item => !item.isOwned && item.priceRange)
      .reduce((total, item) => total + (item.priceRange!.min + item.priceRange!.max) / 2, 0);
  }

  public getItemsByCategory(category: string): RecommendationItem[] {
    return this.props.items.filter(item => item.category === category);
  }

  // Getters
  public get id(): string {
    return this.props.id!;
  }

  public get type(): RecommendationType {
    return this.props.type;
  }

  public get title(): string {
    return this.props.title;
  }

  public get description(): string {
    return this.props.description;
  }

  public get reason(): string {
    return this.props.reason;
  }

  public get confidence(): number {
    return this.props.confidence;
  }

  public get priority(): Priority {
    return this.props.priority;
  }

  public get season(): Season[] {
    return [...this.props.season];
  }

  public get occasion(): Occasion[] {
    return [...this.props.occasion];
  }

  public get items(): RecommendationItem[] {
    return [...this.props.items];
  }

  public get alternatives(): RecommendationItem[] {
    return [...this.props.alternatives];
  }

  public get tags(): string[] {
    return [...this.props.tags];
  }

  public get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  public get inspirationImages(): string[] | undefined {
    return this.props.inspirationImages ? [...this.props.inspirationImages] : undefined;
  }

  public get styleScore(): number {
    return this.props.styleScore;
  }

  public get isImplemented(): boolean {
    return this.props.isImplemented;
  }

  public get implementedAt(): Date | undefined {
    return this.props.implementedAt;
  }

  public get feedback(): UserFeedback | undefined {
    return this.props.feedback;
  }

  public get expiresAt(): Date | undefined {
    return this.props.expiresAt;
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

  public toJSON(): RecommendationProps {
    return {
      ...this.props,
      season: [...this.props.season],
      occasion: [...this.props.occasion],
      items: [...this.props.items],
      alternatives: [...this.props.alternatives],
      tags: [...this.props.tags],
      inspirationImages: this.props.inspirationImages ? [...this.props.inspirationImages] : undefined,
    };
  }
}

export class RecommendationNotFoundError extends BaseError {
  constructor(recommendationId: string) {
    super(`Recommendation with ID ${recommendationId} not found`, 'RECOMMENDATION_NOT_FOUND');
  }
}

export class RecommendationValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'RECOMMENDATION_VALIDATION_ERROR');
  }
}

export class RecommendationExpiredError extends BaseError {
  constructor(recommendationId: string) {
    super(`Recommendation with ID ${recommendationId} has expired`, 'RECOMMENDATION_EXPIRED');
  }
}