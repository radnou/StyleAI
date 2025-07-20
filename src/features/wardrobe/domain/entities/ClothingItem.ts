import { v4 as uuidv4 } from 'uuid';
import { BaseError } from '../../../../core/errors';
import { Guard } from '../../../../core/utils';
import { Result } from '../../../../core/types';

export interface ClothingItemProps {
  id?: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  brand?: string;
  color: string;
  size: string;
  season: Season[];
  occasion: Occasion[];
  imageUrl?: string;
  imageUrls?: string[];
  tags: string[];
  description?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  isFavorite: boolean;
  isArchived: boolean;
  condition: ItemCondition;
  material?: string;
  careInstructions?: string;
  timesWorn: number;
  lastWorn?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ClothingCategory {
  TOPS = 'tops',
  BOTTOMS = 'bottoms',
  OUTERWEAR = 'outerwear',
  DRESSES = 'dresses',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  UNDERWEAR = 'underwear',
  ACTIVEWEAR = 'activewear',
  FORMAL = 'formal',
  SLEEPWEAR = 'sleepwear',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  ALL_SEASONS = 'all_seasons',
}

export enum Occasion {
  CASUAL = 'casual',
  WORK = 'work',
  FORMAL = 'formal',
  PARTY = 'party',
  SPORTS = 'sports',
  VACATION = 'vacation',
  DATE = 'date',
  OUTDOOR = 'outdoor',
  LOUNGEWEAR = 'loungewear',
}

export enum ItemCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export class ClothingItem {
  private constructor(private props: ClothingItemProps) {}

  public static create(props: Omit<ClothingItemProps, 'id' | 'createdAt' | 'updatedAt'>): Result<ClothingItem> {
    const guardResult = Guard.againstNullOrUndefined(props.name, 'name');
    if (!guardResult.succeeded) {
      return Result.fail<ClothingItem>(guardResult.message);
    }

    const nameResult = Guard.againstAtMost(props.name, 100, 'name');
    if (!nameResult.succeeded) {
      return Result.fail<ClothingItem>(nameResult.message);
    }

    const colorResult = Guard.againstNullOrUndefined(props.color, 'color');
    if (!colorResult.succeeded) {
      return Result.fail<ClothingItem>(colorResult.message);
    }

    const sizeResult = Guard.againstNullOrUndefined(props.size, 'size');
    if (!sizeResult.succeeded) {
      return Result.fail<ClothingItem>(sizeResult.message);
    }

    const userIdResult = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (!userIdResult.succeeded) {
      return Result.fail<ClothingItem>(userIdResult.message);
    }

    const now = new Date();
    const item = new ClothingItem({
      ...props,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok<ClothingItem>(item);
  }

  public static fromPersistence(props: ClothingItemProps): Result<ClothingItem> {
    const guardResult = Guard.againstNullOrUndefined(props.id, 'id');
    if (!guardResult.succeeded) {
      return Result.fail<ClothingItem>(guardResult.message);
    }

    const item = new ClothingItem(props);
    return Result.ok<ClothingItem>(item);
  }

  public update(updates: Partial<Omit<ClothingItemProps, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Result<void> {
    if (updates.name !== undefined) {
      const nameResult = Guard.againstAtMost(updates.name, 100, 'name');
      if (!nameResult.succeeded) {
        return Result.fail<void>(nameResult.message);
      }
      this.props.name = updates.name;
    }

    if (updates.category !== undefined) {
      this.props.category = updates.category;
    }

    if (updates.subcategory !== undefined) {
      this.props.subcategory = updates.subcategory;
    }

    if (updates.brand !== undefined) {
      this.props.brand = updates.brand;
    }

    if (updates.color !== undefined) {
      this.props.color = updates.color;
    }

    if (updates.size !== undefined) {
      this.props.size = updates.size;
    }

    if (updates.season !== undefined) {
      this.props.season = updates.season;
    }

    if (updates.occasion !== undefined) {
      this.props.occasion = updates.occasion;
    }

    if (updates.imageUrl !== undefined) {
      this.props.imageUrl = updates.imageUrl;
    }

    if (updates.imageUrls !== undefined) {
      this.props.imageUrls = updates.imageUrls;
    }

    if (updates.tags !== undefined) {
      this.props.tags = updates.tags;
    }

    if (updates.description !== undefined) {
      this.props.description = updates.description;
    }

    if (updates.purchaseDate !== undefined) {
      this.props.purchaseDate = updates.purchaseDate;
    }

    if (updates.purchasePrice !== undefined) {
      this.props.purchasePrice = updates.purchasePrice;
    }

    if (updates.isFavorite !== undefined) {
      this.props.isFavorite = updates.isFavorite;
    }

    if (updates.isArchived !== undefined) {
      this.props.isArchived = updates.isArchived;
    }

    if (updates.condition !== undefined) {
      this.props.condition = updates.condition;
    }

    if (updates.material !== undefined) {
      this.props.material = updates.material;
    }

    if (updates.careInstructions !== undefined) {
      this.props.careInstructions = updates.careInstructions;
    }

    if (updates.timesWorn !== undefined) {
      this.props.timesWorn = updates.timesWorn;
    }

    if (updates.lastWorn !== undefined) {
      this.props.lastWorn = updates.lastWorn;
    }

    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public wear(): void {
    this.props.timesWorn += 1;
    this.props.lastWorn = new Date();
    this.props.updatedAt = new Date();
  }

  public toggleFavorite(): void {
    this.props.isFavorite = !this.props.isFavorite;
    this.props.updatedAt = new Date();
  }

  public archive(): void {
    this.props.isArchived = true;
    this.props.updatedAt = new Date();
  }

  public unarchive(): void {
    this.props.isArchived = false;
    this.props.updatedAt = new Date();
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

  public canBeWorn(): boolean {
    return !this.props.isArchived && this.props.condition !== ItemCondition.POOR;
  }

  public getWearFrequency(): number {
    if (!this.props.createdAt) return 0;
    
    const daysSinceCreation = Math.floor((Date.now() - this.props.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation === 0) return 0;
    
    return this.props.timesWorn / daysSinceCreation;
  }

  public getDaysSinceLastWorn(): number | null {
    if (!this.props.lastWorn) return null;
    
    return Math.floor((Date.now() - this.props.lastWorn.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Getters
  public get id(): string {
    return this.props.id!;
  }

  public get name(): string {
    return this.props.name;
  }

  public get category(): ClothingCategory {
    return this.props.category;
  }

  public get subcategory(): string | undefined {
    return this.props.subcategory;
  }

  public get brand(): string | undefined {
    return this.props.brand;
  }

  public get color(): string {
    return this.props.color;
  }

  public get size(): string {
    return this.props.size;
  }

  public get season(): Season[] {
    return [...this.props.season];
  }

  public get occasion(): Occasion[] {
    return [...this.props.occasion];
  }

  public get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  public get imageUrls(): string[] | undefined {
    return this.props.imageUrls ? [...this.props.imageUrls] : undefined;
  }

  public get tags(): string[] {
    return [...this.props.tags];
  }

  public get description(): string | undefined {
    return this.props.description;
  }

  public get purchaseDate(): Date | undefined {
    return this.props.purchaseDate;
  }

  public get purchasePrice(): number | undefined {
    return this.props.purchasePrice;
  }

  public get isFavorite(): boolean {
    return this.props.isFavorite;
  }

  public get isArchived(): boolean {
    return this.props.isArchived;
  }

  public get condition(): ItemCondition {
    return this.props.condition;
  }

  public get material(): string | undefined {
    return this.props.material;
  }

  public get careInstructions(): string | undefined {
    return this.props.careInstructions;
  }

  public get timesWorn(): number {
    return this.props.timesWorn;
  }

  public get lastWorn(): Date | undefined {
    return this.props.lastWorn;
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

  public toJSON(): ClothingItemProps {
    return {
      ...this.props,
      season: [...this.props.season],
      occasion: [...this.props.occasion],
      tags: [...this.props.tags],
      imageUrls: this.props.imageUrls ? [...this.props.imageUrls] : undefined,
    };
  }
}

export class ClothingItemNotFoundError extends BaseError {
  constructor(itemId: string) {
    super(`Clothing item with ID ${itemId} not found`, 'CLOTHING_ITEM_NOT_FOUND');
  }
}

export class ClothingItemValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'CLOTHING_ITEM_VALIDATION_ERROR');
  }
}