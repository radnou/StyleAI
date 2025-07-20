import { v4 as uuidv4 } from 'uuid';
import { BaseError } from '../../../../core/errors';
import { Guard } from '../../../../core/utils';
import { Result } from '../../../../core/types';
import { ClothingItem, ClothingCategory, Season, Occasion } from './ClothingItem';

export interface OutfitProps {
  id?: string;
  name: string;
  items: ClothingItem[];
  occasion: Occasion;
  season: Season;
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  timesWorn: number;
  lastWorn?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Outfit {
  private static readonly MAX_ITEMS = 10;
  private static readonly MIN_ITEMS = 1;
  
  private constructor(private props: OutfitProps) {}

  public static create(props: Omit<OutfitProps, 'id' | 'createdAt' | 'updatedAt'>): Result<Outfit> {
    // Validate name
    const nameResult = Guard.againstNullOrUndefined(props.name, 'name');
    if (!nameResult.succeeded) {
      return Result.fail<Outfit>(nameResult.message);
    }

    const nameLength = Guard.againstAtMost(props.name, 100, 'name');
    if (!nameLength.succeeded) {
      return Result.fail<Outfit>(nameLength.message);
    }

    // Validate items
    if (!props.items || props.items.length === 0) {
      return Result.fail<Outfit>('Outfit must have at least one item');
    }

    if (props.items.length > this.MAX_ITEMS) {
      return Result.fail<Outfit>(`Outfit cannot have more than ${this.MAX_ITEMS} items (maximum capacity)`);
    }

    // Validate userId
    const userIdResult = Guard.againstNullOrUndefined(props.userId, 'userId');
    if (!userIdResult.succeeded) {
      return Result.fail<Outfit>(userIdResult.message);
    }

    const now = new Date();
    const outfit = new Outfit({
      ...props,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok<Outfit>(outfit);
  }

  public static fromPersistence(props: OutfitProps): Result<Outfit> {
    const idResult = Guard.againstNullOrUndefined(props.id, 'id');
    if (!idResult.succeeded) {
      return Result.fail<Outfit>(idResult.message);
    }

    const outfit = new Outfit(props);
    return Result.ok<Outfit>(outfit);
  }

  public update(updates: Partial<Omit<OutfitProps, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Result<void> {
    if (updates.name !== undefined) {
      const nameResult = Guard.againstAtMost(updates.name, 100, 'name');
      if (!nameResult.succeeded) {
        return Result.fail<void>(nameResult.message);
      }
      this.props.name = updates.name;
    }

    if (updates.items !== undefined) {
      if (updates.items.length === 0) {
        return Result.fail<void>('Outfit must have at least one item');
      }
      if (updates.items.length > Outfit.MAX_ITEMS) {
        return Result.fail<void>(`Outfit cannot have more than ${Outfit.MAX_ITEMS} items`);
      }
      this.props.items = updates.items;
    }

    if (updates.occasion !== undefined) {
      this.props.occasion = updates.occasion;
    }

    if (updates.season !== undefined) {
      this.props.season = updates.season;
    }

    if (updates.tags !== undefined) {
      this.props.tags = updates.tags;
    }

    if (updates.notes !== undefined) {
      this.props.notes = updates.notes;
    }

    if (updates.isFavorite !== undefined) {
      this.props.isFavorite = updates.isFavorite;
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

    // Also update each item's wear count
    this.props.items.forEach(item => item.wear());
  }

  public toggleFavorite(): void {
    this.props.isFavorite = !this.props.isFavorite;
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

  public addItem(item: ClothingItem): Result<void> {
    if (this.props.items.length >= Outfit.MAX_ITEMS) {
      return Result.fail<void>(`Outfit already has maximum number of items (${Outfit.MAX_ITEMS})`);
    }

    if (this.props.items.some(i => i.id === item.id)) {
      return Result.fail<void>('Item is already in outfit');
    }

    this.props.items.push(item);
    this.props.updatedAt = new Date();
    return Result.ok<void>();
  }

  public removeItem(itemId: string): Result<void> {
    if (this.props.items.length <= Outfit.MIN_ITEMS) {
      return Result.fail<void>('Outfit must have at least one item');
    }

    const index = this.props.items.findIndex(item => item.id === itemId);
    if (index > -1) {
      this.props.items.splice(index, 1);
      this.props.updatedAt = new Date();
    }

    return Result.ok<void>();
  }

  public hasItem(itemId: string): boolean {
    return this.props.items.some(item => item.id === itemId);
  }

  public getItemsByCategory(category: ClothingCategory): ClothingItem[] {
    return this.props.items.filter(item => item.category === category);
  }

  public isSuitableForSeason(season: Season): boolean {
    return this.props.season === season || this.props.season === Season.ALL_SEASONS;
  }

  public isSuitableForOccasion(occasion: Occasion): boolean {
    return this.props.occasion === occasion;
  }

  public isComplete(): boolean {
    // An outfit is considered complete if it has at least a top and bottom (or a dress)
    const hasDress = this.props.items.some(item => item.category === ClothingCategory.DRESSES);
    const hasTop = this.props.items.some(item => item.category === ClothingCategory.TOPS);
    const hasBottom = this.props.items.some(item => item.category === ClothingCategory.BOTTOMS);
    
    return hasDress || (hasTop && hasBottom);
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

  public getTotalValue(): number {
    return this.props.items.reduce((total, item) => {
      return total + (item.purchasePrice || 0);
    }, 0);
  }

  // Getters
  public get id(): string {
    return this.props.id!;
  }

  public get name(): string {
    return this.props.name;
  }

  public get items(): ClothingItem[] {
    return [...this.props.items];
  }

  public get occasion(): Occasion {
    return this.props.occasion;
  }

  public get season(): Season {
    return this.props.season;
  }

  public get tags(): string[] {
    return [...this.props.tags];
  }

  public get notes(): string | undefined {
    return this.props.notes;
  }

  public get isFavorite(): boolean {
    return this.props.isFavorite;
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

  public toJSON(): OutfitProps {
    return {
      ...this.props,
      items: [...this.props.items],
      tags: [...this.props.tags],
    };
  }
}

export class OutfitNotFoundError extends BaseError {
  constructor(outfitId: string) {
    super(`Outfit with ID ${outfitId} not found`, 'OUTFIT_NOT_FOUND');
  }
}

export class OutfitValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'OUTFIT_VALIDATION_ERROR');
  }
}