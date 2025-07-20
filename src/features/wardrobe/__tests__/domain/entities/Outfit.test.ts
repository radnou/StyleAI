import { Outfit, OutfitProps } from '../../../domain/entities';
import { ClothingItem, ClothingCategory, Season, Occasion, ItemCondition } from '../../../domain/entities';

describe('Outfit Entity', () => {
  const createClothingItem = (id: string, category: ClothingCategory) => {
    const props = {
      name: `Test ${category}`,
      category,
      color: 'Black',
      size: 'M',
      season: [Season.ALL_SEASONS],
      occasion: [Occasion.CASUAL],
      tags: ['test'],
      isFavorite: false,
      isArchived: false,
      condition: ItemCondition.GOOD,
      timesWorn: 0,
      userId: 'user123',
    };
    
    const result = ClothingItem.create(props);
    if (!result.succeeded) throw new Error('Failed to create clothing item');
    
    // Override the ID for testing
    (result.value as any).props.id = id;
    return result.value;
  };

  const validItems = [
    createClothingItem('item1', ClothingCategory.TOPS),
    createClothingItem('item2', ClothingCategory.BOTTOMS),
    createClothingItem('item3', ClothingCategory.SHOES),
  ];

  const validProps: Omit<OutfitProps, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Casual Friday',
    items: validItems,
    occasion: Occasion.CASUAL,
    season: Season.SPRING,
    tags: ['comfortable', 'work'],
    notes: 'Perfect for casual Fridays at the office',
    isFavorite: false,
    timesWorn: 0,
    lastWorn: undefined,
    userId: 'user123',
  };

  describe('create', () => {
    it('should create a valid outfit', () => {
      const result = Outfit.create(validProps);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.name).toBe('Casual Friday');
      expect(result.value.items).toHaveLength(3);
      expect(result.value.occasion).toBe(Occasion.CASUAL);
      expect(result.value.season).toBe(Season.SPRING);
      expect(result.value.id).toBeDefined();
      expect(result.value.createdAt).toBeInstanceOf(Date);
      expect(result.value.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail when name is missing', () => {
      const props = { ...validProps, name: '' };
      const result = Outfit.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('name');
    });

    it('should fail when name is too long', () => {
      const props = { ...validProps, name: 'x'.repeat(101) };
      const result = Outfit.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('name');
    });

    it('should fail when items array is empty', () => {
      const props = { ...validProps, items: [] };
      const result = Outfit.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('at least one item');
    });

    it('should fail when items array has too many items', () => {
      const tooManyItems = Array(11).fill(null).map((_, i) => 
        createClothingItem(`item${i}`, ClothingCategory.TOPS)
      );
      const props = { ...validProps, items: tooManyItems };
      const result = Outfit.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('maximum');
    });

    it('should fail when userId is missing', () => {
      const props = { ...validProps, userId: '' };
      const result = Outfit.create(props);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('userId');
    });

    it('should create outfit without optional fields', () => {
      const minimalProps = {
        name: 'Minimal Outfit',
        items: [validItems[0]],
        occasion: Occasion.CASUAL,
        season: Season.SPRING,
        tags: [],
        isFavorite: false,
        timesWorn: 0,
        userId: 'user123',
      };
      
      const result = Outfit.create(minimalProps);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.notes).toBeUndefined();
      expect(result.value.lastWorn).toBeUndefined();
    });
  });

  describe('fromPersistence', () => {
    it('should recreate outfit from persisted data', () => {
      const persistedProps: OutfitProps = {
        id: 'existing-outfit-id',
        name: 'Persisted Outfit',
        items: validItems,
        occasion: Occasion.WORK,
        season: Season.FALL,
        tags: ['professional'],
        notes: 'Business meeting outfit',
        isFavorite: true,
        timesWorn: 5,
        lastWorn: new Date('2023-12-01'),
        userId: 'user123',
        createdAt: new Date('2023-11-01'),
        updatedAt: new Date('2023-12-01'),
      };
      
      const result = Outfit.fromPersistence(persistedProps);
      
      expect(result.succeeded).toBe(true);
      expect(result.value.id).toBe('existing-outfit-id');
      expect(result.value.name).toBe('Persisted Outfit');
      expect(result.value.timesWorn).toBe(5);
      expect(result.value.isFavorite).toBe(true);
    });

    it('should fail when id is missing in persisted data', () => {
      const propsWithoutId = {
        ...validProps,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as OutfitProps;
      
      const result = Outfit.fromPersistence(propsWithoutId);
      
      expect(result.succeeded).toBe(false);
      expect(result.message).toContain('id');
    });
  });

  describe('update', () => {
    it('should update outfit properties', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const updateResult = outfit.update({
        name: 'Updated Outfit',
        occasion: Occasion.FORMAL,
        tags: ['elegant', 'evening'],
      });
      
      expect(updateResult.succeeded).toBe(true);
      expect(outfit.name).toBe('Updated Outfit');
      expect(outfit.occasion).toBe(Occasion.FORMAL);
      expect(outfit.tags).toEqual(['elegant', 'evening']);
      expect(outfit.updatedAt.getTime()).toBeGreaterThan(outfit.createdAt.getTime());
    });

    it('should fail when updating with invalid name', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const updateResult = outfit.update({ name: 'x'.repeat(101) });
      
      expect(updateResult.succeeded).toBe(false);
      expect(updateResult.message).toContain('name');
    });

    it('should update items', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const newItems = [validItems[0], validItems[1]];
      const updateResult = outfit.update({ items: newItems });
      
      expect(updateResult.succeeded).toBe(true);
      expect(outfit.items).toHaveLength(2);
    });

    it('should fail when updating with empty items', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const updateResult = outfit.update({ items: [] });
      
      expect(updateResult.succeeded).toBe(false);
      expect(updateResult.message).toContain('at least one item');
    });
  });

  describe('wear', () => {
    it('should increment wear count and update last worn date', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const initialWearCount = outfit.timesWorn;
      
      outfit.wear();
      
      expect(outfit.timesWorn).toBe(initialWearCount + 1);
      expect(outfit.lastWorn).toBeInstanceOf(Date);
    });

    it('should update all items when outfit is worn', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const initialItemWearCounts = outfit.items.map(item => item.timesWorn);
      
      outfit.wear();
      
      outfit.items.forEach((item, index) => {
        expect(item.timesWorn).toBe(initialItemWearCounts[index] + 1);
        expect(item.lastWorn).toBeInstanceOf(Date);
      });
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const initialFavorite = outfit.isFavorite;
      
      outfit.toggleFavorite();
      
      expect(outfit.isFavorite).toBe(!initialFavorite);
    });
  });

  describe('tag management', () => {
    it('should add tag successfully', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const addResult = outfit.addTag('summer-ready');
      
      expect(addResult.succeeded).toBe(true);
      expect(outfit.tags).toContain('summer-ready');
    });

    it('should not add duplicate tags', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const initialTagCount = outfit.tags.length;
      
      const addResult = outfit.addTag('comfortable'); // Already exists
      
      expect(addResult.succeeded).toBe(true);
      expect(outfit.tags.length).toBe(initialTagCount);
    });

    it('should fail to add empty tag', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const addResult = outfit.addTag('');
      
      expect(addResult.succeeded).toBe(false);
      expect(addResult.message).toContain('empty');
    });

    it('should remove tag successfully', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      outfit.removeTag('comfortable');
      
      expect(outfit.tags).not.toContain('comfortable');
    });

    it('should check if outfit has tag', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      expect(outfit.hasTag('comfortable')).toBe(true);
      expect(outfit.hasTag('nonexistent')).toBe(false);
    });
  });

  describe('suitability checks', () => {
    it('should check if outfit is suitable for season', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      expect(outfit.isSuitableForSeason(Season.SPRING)).toBe(true);
      expect(outfit.isSuitableForSeason(Season.WINTER)).toBe(false);
    });

    it('should check if outfit is suitable for occasion', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      expect(outfit.isSuitableForOccasion(Occasion.CASUAL)).toBe(true);
      expect(outfit.isSuitableForOccasion(Occasion.FORMAL)).toBe(false);
    });

    it('should check if outfit is complete', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      // Has top, bottom, and shoes
      expect(outfit.isComplete()).toBe(true);
    });

    it('should detect incomplete outfit', () => {
      const incompleteProps = {
        ...validProps,
        items: [validItems[0]], // Only top
      };
      
      const outfitResult = Outfit.create(incompleteProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      expect(outfit.isComplete()).toBe(false);
    });
  });

  describe('item management', () => {
    it('should add item to outfit', () => {
      const outfitResult = Outfit.create({ ...validProps, items: [validItems[0]] });
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const newItem = createClothingItem('new-item', ClothingCategory.ACCESSORIES);
      
      const addResult = outfit.addItem(newItem);
      
      expect(addResult.succeeded).toBe(true);
      expect(outfit.items).toHaveLength(2);
      expect(outfit.items.some(item => item.id === 'new-item')).toBe(true);
    });

    it('should not add duplicate item', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const duplicateItem = validItems[0];
      
      const addResult = outfit.addItem(duplicateItem);
      
      expect(addResult.succeeded).toBe(false);
      expect(addResult.message).toContain('already in outfit');
    });

    it('should fail to add item when at maximum capacity', () => {
      const maxItems = Array(10).fill(null).map((_, i) => 
        createClothingItem(`item${i}`, ClothingCategory.TOPS)
      );
      const outfitResult = Outfit.create({ ...validProps, items: maxItems });
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const newItem = createClothingItem('extra-item', ClothingCategory.ACCESSORIES);
      
      const addResult = outfit.addItem(newItem);
      
      expect(addResult.succeeded).toBe(false);
      expect(addResult.message).toContain('maximum');
    });

    it('should remove item from outfit', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      const removeResult = outfit.removeItem('item1');
      
      expect(removeResult.succeeded).toBe(true);
      expect(outfit.items).toHaveLength(2);
      expect(outfit.items.some(item => item.id === 'item1')).toBe(false);
    });

    it('should fail to remove last item', () => {
      const outfitResult = Outfit.create({ ...validProps, items: [validItems[0]] });
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      const removeResult = outfit.removeItem('item1');
      
      expect(removeResult.succeeded).toBe(false);
      expect(removeResult.message).toContain('at least one item');
    });

    it('should check if outfit has item', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      expect(outfit.hasItem('item1')).toBe(true);
      expect(outfit.hasItem('nonexistent')).toBe(false);
    });

    it('should get items by category', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      const tops = outfit.getItemsByCategory(ClothingCategory.TOPS);
      expect(tops).toHaveLength(1);
      expect(tops[0].category).toBe(ClothingCategory.TOPS);
      
      const accessories = outfit.getItemsByCategory(ClothingCategory.ACCESSORIES);
      expect(accessories).toHaveLength(0);
    });
  });

  describe('metrics', () => {
    it('should calculate wear frequency', () => {
      const lastWornDate = new Date();
      lastWornDate.setDate(lastWornDate.getDate() - 10); // 10 days ago
      
      const outfitResult = Outfit.create({
        ...validProps,
        timesWorn: 5,
        lastWorn: lastWornDate,
      });
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      // Mock creation date for consistent test
      (outfit as any).props.createdAt = new Date('2023-01-01');
      
      const frequency = outfit.getWearFrequency();
      expect(frequency).toBeGreaterThan(0);
    });

    it('should calculate days since last worn', () => {
      const lastWornDate = new Date();
      lastWornDate.setDate(lastWornDate.getDate() - 7); // 7 days ago
      
      const outfitResult = Outfit.create({
        ...validProps,
        lastWorn: lastWornDate,
      });
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      const daysSince = outfit.getDaysSinceLastWorn();
      expect(daysSince).toBeGreaterThanOrEqual(6);
      expect(daysSince).toBeLessThanOrEqual(8);
    });

    it('should return null for days since last worn if never worn', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      
      const daysSince = outfit.getDaysSinceLastWorn();
      expect(daysSince).toBeNull();
    });

    it('should calculate outfit value', () => {
      const itemsWithPrice = validItems.map((item, index) => {
        const propsWithPrice = {
          name: item.name,
          category: item.category,
          color: item.color,
          size: item.size,
          season: item.season,
          occasion: item.occasion,
          tags: item.tags,
          isFavorite: false,
          isArchived: false,
          condition: item.condition,
          timesWorn: 0,
          userId: item.userId,
          purchasePrice: (index + 1) * 50, // $50, $100, $150
        };
        
        const result = ClothingItem.create(propsWithPrice);
        if (!result.succeeded) throw new Error('Failed to create item');
        
        (result.value as any).props.id = `item${index}`;
        return result.value;
      });
      
      const outfitResult = Outfit.create({ ...validProps, items: itemsWithPrice });
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const totalValue = outfit.getTotalValue();
      
      expect(totalValue).toBe(300); // $50 + $100 + $150
    });

    it('should return 0 for outfit value when items have no price', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const totalValue = outfit.getTotalValue();
      
      expect(totalValue).toBe(0);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const outfitResult = Outfit.create(validProps);
      expect(outfitResult.succeeded).toBe(true);
      
      const outfit = outfitResult.value;
      const json = outfit.toJSON();
      
      expect(json.name).toBe(validProps.name);
      expect(json.occasion).toBe(validProps.occasion);
      expect(json.season).toBe(validProps.season);
      expect(json.id).toBeDefined();
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
      expect(Array.isArray(json.items)).toBe(true);
      expect(json.items).toHaveLength(3);
      expect(Array.isArray(json.tags)).toBe(true);
    });
  });
});