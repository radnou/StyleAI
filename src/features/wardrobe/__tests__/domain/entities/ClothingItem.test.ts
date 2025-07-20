import { ClothingItem, ClothingCategory, Season, Occasion, ItemCondition } from '../../../domain/entities';

describe('ClothingItem Entity', () => {
  const validProps = {
    name: 'Test T-Shirt',
    category: ClothingCategory.TOPS,
    color: 'Blue',
    size: 'M',
    season: [Season.SPRING, Season.SUMMER],
    occasion: [Occasion.CASUAL],
    tags: ['comfortable', 'cotton'],
    isFavorite: false,
    isArchived: false,
    condition: ItemCondition.GOOD,
    timesWorn: 0,
    userId: 'user123',
  };

  describe('create', () => {
    it('should create a valid clothing item', () => {
      const result = ClothingItem.create(validProps);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.name).toBe('Test T-Shirt');
      expect(result.value.category).toBe(ClothingCategory.TOPS);
      expect(result.value.id).toBeDefined();
      expect(result.value.createdAt).toBeInstanceOf(Date);
      expect(result.value.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail when name is missing', () => {
      const props = { ...validProps, name: '' };
      const result = ClothingItem.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('name');
    });

    it('should fail when name is too long', () => {
      const props = { ...validProps, name: 'x'.repeat(101) };
      const result = ClothingItem.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('name');
    });

    it('should fail when color is missing', () => {
      const props = { ...validProps, color: '' };
      const result = ClothingItem.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('color');
    });

    it('should fail when size is missing', () => {
      const props = { ...validProps, size: '' };
      const result = ClothingItem.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('size');
    });

    it('should fail when userId is missing', () => {
      const props = { ...validProps, userId: '' };
      const result = ClothingItem.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('userId');
    });
  });

  describe('update', () => {
    it('should update item properties', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      const updateResult = item.update({
        name: 'Updated T-Shirt',
        color: 'Red',
      });
      
      expect(updateResult.succeeded).toBe(true);
      expect(item.name).toBe('Updated T-Shirt');
      expect(item.color).toBe('Red');
      expect(item.updatedAt.getTime()).toBeGreaterThan(item.createdAt.getTime());
    });

    it('should fail when updating with invalid name', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      const updateResult = item.update({ name: 'x'.repeat(101) });
      
      expect(updateResult.succeeded).toBe(false);
      expect(updateResult.message).toContain('name');
    });
  });

  describe('wear', () => {
    it('should increment wear count and update last worn date', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      const initialWearCount = item.timesWorn;
      const initialLastWorn = item.lastWorn;
      
      item.wear();
      
      expect(item.timesWorn).toBe(initialWearCount + 1);
      expect(item.lastWorn).toBeInstanceOf(Date);
      expect(item.lastWorn).not.toBe(initialLastWorn);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      const initialFavorite = item.isFavorite;
      
      item.toggleFavorite();
      
      expect(item.isFavorite).toBe(!initialFavorite);
    });
  });

  describe('archive and unarchive', () => {
    it('should archive item', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      item.archive();
      
      expect(item.isArchived).toBe(true);
    });

    it('should unarchive item', () => {
      const itemResult = ClothingItem.create({ ...validProps, isArchived: true });
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      item.unarchive();
      
      expect(item.isArchived).toBe(false);
    });
  });

  describe('tag management', () => {
    it('should add tag successfully', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      const addResult = item.addTag('new-tag');
      
      expect(addResult.succeeded).toBe(true);
      expect(item.tags).toContain('new-tag');
    });

    it('should not add duplicate tags', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      const initialTagCount = item.tags.length;
      
      const addResult = item.addTag('comfortable'); // Already exists
      
      expect(addResult.succeeded).toBe(true);
      expect(item.tags.length).toBe(initialTagCount);
    });

    it('should fail to add empty tag', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      const addResult = item.addTag('');
      
      expect(addResult.succeeded).toBe(false);
      expect(addResult.message).toContain('empty');
    });

    it('should remove tag successfully', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      item.removeTag('comfortable');
      
      expect(item.tags).not.toContain('comfortable');
    });

    it('should check if item has tag', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      expect(item.hasTag('comfortable')).toBe(true);
      expect(item.hasTag('nonexistent')).toBe(false);
    });
  });

  describe('season and occasion suitability', () => {
    it('should check season suitability', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      expect(item.isSuitableForSeason(Season.SPRING)).toBe(true);
      expect(item.isSuitableForSeason(Season.WINTER)).toBe(false);
    });

    it('should be suitable for all seasons when marked as such', () => {
      const props = { ...validProps, season: [Season.ALL_SEASONS] };
      const itemResult = ClothingItem.create(props);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      expect(item.isSuitableForSeason(Season.WINTER)).toBe(true);
      expect(item.isSuitableForSeason(Season.SUMMER)).toBe(true);
    });

    it('should check occasion suitability', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      expect(item.isSuitableForOccasion(Occasion.CASUAL)).toBe(true);
      expect(item.isSuitableForOccasion(Occasion.FORMAL)).toBe(false);
    });
  });

  describe('wear metrics', () => {
    it('should calculate wear frequency', () => {
      // Mock date to have a consistent test
      const mockDate = new Date('2023-01-01');
      const itemResult = ClothingItem.create({
        ...validProps,
        timesWorn: 10,
      });
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      // Mock the creation date
      (item as any).props.createdAt = new Date('2023-01-01');
      
      // Frequency should be calculated properly
      const frequency = item.getWearFrequency();
      expect(frequency).toBeGreaterThanOrEqual(0);
    });

    it('should calculate days since last worn', () => {
      const lastWornDate = new Date();
      lastWornDate.setDate(lastWornDate.getDate() - 5); // 5 days ago
      
      const itemResult = ClothingItem.create({
        ...validProps,
        lastWorn: lastWornDate,
      });
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      const daysSince = item.getDaysSinceLastWorn();
      expect(daysSince).toBeGreaterThanOrEqual(4);
      expect(daysSince).toBeLessThanOrEqual(6);
    });

    it('should return null for days since last worn if never worn', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      const daysSince = item.getDaysSinceLastWorn();
      expect(daysSince).toBeNull();
    });
  });

  describe('canBeWorn', () => {
    it('should return true for normal items', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      expect(item.canBeWorn()).toBe(true);
    });

    it('should return false for archived items', () => {
      const props = { ...validProps, isArchived: true };
      const itemResult = ClothingItem.create(props);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      expect(item.canBeWorn()).toBe(false);
    });

    it('should return false for poor condition items', () => {
      const props = { ...validProps, condition: ItemCondition.POOR };
      const itemResult = ClothingItem.create(props);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      
      expect(item.canBeWorn()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const itemResult = ClothingItem.create(validProps);
      expect(itemResult.succeeded).toBe(true);
      
      const item = itemResult.value;
      const json = item.toJSON();
      
      expect(json.name).toBe(validProps.name);
      expect(json.category).toBe(validProps.category);
      expect(json.id).toBeDefined();
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
      expect(Array.isArray(json.season)).toBe(true);
      expect(Array.isArray(json.occasion)).toBe(true);
      expect(Array.isArray(json.tags)).toBe(true);
    });
  });
});