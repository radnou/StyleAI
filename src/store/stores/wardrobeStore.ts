import { StateCreator } from 'zustand';

/**
 * Wardrobe item types
 */
export type WardrobeItemType = 
  | 'top' 
  | 'bottom' 
  | 'dress' 
  | 'outerwear' 
  | 'shoes' 
  | 'accessory' 
  | 'undergarment';

/**
 * Seasons
 */
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

/**
 * Occasions
 */
export type Occasion = 
  | 'casual' 
  | 'work' 
  | 'formal' 
  | 'party' 
  | 'sports' 
  | 'travel' 
  | 'date' 
  | 'wedding';

/**
 * Individual wardrobe item
 */
export interface WardrobeItem {
  id: string;
  name: string;
  type: WardrobeItemType;
  brand?: string;
  color: string;
  size?: string;
  price?: number;
  currency?: string;
  imageUrl: string;
  tags: string[];
  seasons: Season[];
  occasions: Occasion[];
  description?: string;
  purchaseDate?: Date;
  lastWorn?: Date;
  wearCount: number;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wardrobe state
 */
export interface WardrobeState {
  items: WardrobeItem[];
  favoriteItems: string[]; // Array of item IDs
  archivedItems: string[]; // Array of item IDs
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: WardrobeItemType;
    color?: string;
    season?: Season;
    occasion?: Occasion;
    search?: string;
  };
  sortBy: 'name' | 'createdAt' | 'lastWorn' | 'wearCount' | 'price';
  sortOrder: 'asc' | 'desc';
}

/**
 * Wardrobe actions
 */
export interface WardrobeActions {
  addWardrobeItem: (item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'wearCount'>) => void;
  updateWardrobeItem: (id: string, updates: Partial<WardrobeItem>) => void;
  removeWardrobeItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleArchived: (id: string) => void;
  recordWear: (id: string, date?: Date) => void;
  setWardrobe: (items: WardrobeItem[]) => void;
  setWardrobeFilters: (filters: Partial<WardrobeState['filters']>) => void;
  setSorting: (sortBy: WardrobeState['sortBy'], sortOrder: WardrobeState['sortOrder']) => void;
  clearWardrobeError: () => void;
}

/**
 * Complete wardrobe slice interface
 */
export interface WardrobeSlice {
  wardrobe: WardrobeState;
  addWardrobeItem: WardrobeActions['addWardrobeItem'];
  updateWardrobeItem: WardrobeActions['updateWardrobeItem'];
  removeWardrobeItem: WardrobeActions['removeWardrobeItem'];
  toggleFavorite: WardrobeActions['toggleFavorite'];
  toggleArchived: WardrobeActions['toggleArchived'];
  recordWear: WardrobeActions['recordWear'];
  setWardrobe: WardrobeActions['setWardrobe'];
  setWardrobeFilters: WardrobeActions['setWardrobeFilters'];
  setSorting: WardrobeActions['setSorting'];
  clearWardrobeError: WardrobeActions['clearWardrobeError'];
}

/**
 * Initial wardrobe state
 */
const initialWardrobeState: WardrobeState = {
  items: [],
  favoriteItems: [],
  archivedItems: [],
  isLoading: false,
  error: null,
  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

/**
 * Creates the wardrobe store slice
 */
export const createWardrobeSlice: StateCreator<
  any,
  [['zustand/immer', never]],
  [],
  WardrobeSlice
> = (set) => ({
  wardrobe: initialWardrobeState,

  addWardrobeItem: (newItem) => {
    set((state: any) => {
      const item: WardrobeItem = {
        ...newItem,
        id: Date.now().toString(), // Simple ID generation for now
        wearCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      state.wardrobe.items.push(item);
      state.wardrobe.error = null;
    });
  },

  updateWardrobeItem: (id, updates) => {
    set((state: any) => {
      const itemIndex = state.wardrobe.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        Object.assign(state.wardrobe.items[itemIndex], {
          ...updates,
          updatedAt: new Date(),
        });
        state.wardrobe.error = null;
      }
    });
  },

  removeWardrobeItem: (id) => {
    set((state: any) => {
      state.wardrobe.items = state.wardrobe.items.filter(item => item.id !== id);
      state.wardrobe.favoriteItems = state.wardrobe.favoriteItems.filter(itemId => itemId !== id);
      state.wardrobe.archivedItems = state.wardrobe.archivedItems.filter(itemId => itemId !== id);
      state.wardrobe.error = null;
    });
  },

  toggleFavorite: (id) => {
    set((state: any) => {
      const itemIndex = state.wardrobe.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.wardrobe.items[itemIndex].isFavorite = !state.wardrobe.items[itemIndex].isFavorite;
        state.wardrobe.items[itemIndex].updatedAt = new Date();
        
        if (state.wardrobe.items[itemIndex].isFavorite) {
          if (!state.wardrobe.favoriteItems.includes(id)) {
            state.wardrobe.favoriteItems.push(id);
          }
        } else {
          state.wardrobe.favoriteItems = state.wardrobe.favoriteItems.filter(itemId => itemId !== id);
        }
      }
    });
  },

  toggleArchived: (id) => {
    set((state: any) => {
      const itemIndex = state.wardrobe.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.wardrobe.items[itemIndex].isArchived = !state.wardrobe.items[itemIndex].isArchived;
        state.wardrobe.items[itemIndex].updatedAt = new Date();
        
        if (state.wardrobe.items[itemIndex].isArchived) {
          if (!state.wardrobe.archivedItems.includes(id)) {
            state.wardrobe.archivedItems.push(id);
          }
        } else {
          state.wardrobe.archivedItems = state.wardrobe.archivedItems.filter(itemId => itemId !== id);
        }
      }
    });
  },

  recordWear: (id, date = new Date()) => {
    set((state: any) => {
      const itemIndex = state.wardrobe.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.wardrobe.items[itemIndex].lastWorn = date;
        state.wardrobe.items[itemIndex].wearCount += 1;
        state.wardrobe.items[itemIndex].updatedAt = new Date();
      }
    });
  },

  setWardrobe: (items) => {
    set((state: any) => {
      state.wardrobe.items = items;
      state.wardrobe.favoriteItems = items.filter(item => item.isFavorite).map(item => item.id);
      state.wardrobe.archivedItems = items.filter(item => item.isArchived).map(item => item.id);
      state.wardrobe.error = null;
    });
  },

  setWardrobeFilters: (filters) => {
    set((state: any) => {
      Object.assign(state.wardrobe.filters, filters);
    });
  },

  setSorting: (sortBy, sortOrder) => {
    set((state: any) => {
      state.wardrobe.sortBy = sortBy;
      state.wardrobe.sortOrder = sortOrder;
    });
  },

  clearWardrobeError: () => {
    set((state: any) => {
      state.wardrobe.error = null;
    });
  },
});