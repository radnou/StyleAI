import { useState, useEffect, useCallback } from 'react';
import { Result } from '../../../../core/types';
import { ClothingItem, ClothingCategory, Season, Occasion, ItemCondition } from '../../domain/entities';
import { 
  AddClothingItem, 
  UpdateClothingItem, 
  GetClothingItems, 
  DeleteClothingItem,
  AddClothingItemRequest,
  UpdateClothingItemRequest,
  GetClothingItemsRequest,
  DeleteClothingItemRequest,
} from '../../application/use-cases';
import { FirebaseClothingItemRepository } from '../../infrastructure/repositories/FirebaseClothingItemRepository';
import { ExpoImageProcessingService } from '../../infrastructure/services/ExpoImageProcessingService';
import { GeminiClothingCategorizationService } from '../../infrastructure/services/GeminiClothingCategorizationService';
import { FirebaseStorageService } from '../../infrastructure/services/FirebaseStorageService';

export interface UseClothingItemsOptions {
  userId: string;
  autoLoad?: boolean;
  filters?: {
    category?: ClothingCategory;
    subcategory?: string;
    season?: Season;
    occasion?: Occasion;
    color?: string;
    tags?: string[];
    brand?: string;
    condition?: ItemCondition;
    isFavorite?: boolean;
    isArchived?: boolean;
    searchQuery?: string;
  };
  sort?: {
    field: 'name' | 'createdAt' | 'updatedAt' | 'lastWorn' | 'timesWorn' | 'purchaseDate' | 'purchasePrice';
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface UseClothingItemsState {
  items: ClothingItem[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
  availableFilters: any;
}

export interface UseClothingItemsActions {
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  addItem: (request: Omit<AddClothingItemRequest, 'userId'>) => Promise<Result<ClothingItem>>;
  updateItem: (request: Omit<UpdateClothingItemRequest, 'userId'>) => Promise<Result<ClothingItem>>;
  deleteItem: (itemId: string, deleteImages?: boolean) => Promise<Result<void>>;
  toggleFavorite: (itemId: string) => Promise<Result<void>>;
  toggleArchive: (itemId: string) => Promise<Result<void>>;
  wearItem: (itemId: string) => Promise<Result<void>>;
  setFilters: (filters: UseClothingItemsOptions['filters']) => void;
  setSort: (sort: UseClothingItemsOptions['sort']) => void;
  setPagination: (pagination: UseClothingItemsOptions['pagination']) => void;
  nextPage: () => void;
  previousPage: () => void;
  clearError: () => void;
}

export function useClothingItems(options: UseClothingItemsOptions): [UseClothingItemsState, UseClothingItemsActions] {
  const [state, setState] = useState<UseClothingItemsState>({
    items: [],
    loading: false,
    error: null,
    total: 0,
    page: options.pagination?.page || 1,
    limit: options.pagination?.limit || 20,
    hasNext: false,
    hasPrevious: false,
    availableFilters: null,
  });

  const [filters, setFiltersState] = useState(options.filters);
  const [sort, setSortState] = useState(options.sort);
  const [pagination, setPaginationState] = useState(options.pagination || { page: 1, limit: 20 });

  // Initialize repositories and use cases
  const repository = new FirebaseClothingItemRepository();
  const imageProcessingService = new ExpoImageProcessingService();
  const categorizationService = new GeminiClothingCategorizationService();
  const storageService = new FirebaseStorageService();

  const addItemUseCase = new AddClothingItem(
    repository,
    imageProcessingService,
    categorizationService,
    storageService
  );
  const updateItemUseCase = new UpdateClothingItem(
    repository,
    imageProcessingService,
    categorizationService,
    storageService
  );
  const getItemsUseCase = new GetClothingItems(repository);
  const deleteItemUseCase = new DeleteClothingItem(repository, storageService);

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const request: GetClothingItemsRequest = {
        userId: options.userId,
        filters,
        sort,
        pagination,
      };

      const result = await getItemsUseCase.execute(request);

      if (result.succeeded) {
        setState(prev => ({
          ...prev,
          items: result.value.items,
          total: result.value.total,
          page: result.value.page,
          limit: result.value.limit,
          hasNext: result.value.hasNext,
          hasPrevious: result.value.hasPrevious,
          availableFilters: result.value.availableFilters,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [options.userId, filters, sort, pagination]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const addItem = useCallback(async (
    request: Omit<AddClothingItemRequest, 'userId'>
  ): Promise<Result<ClothingItem>> => {
    const fullRequest: AddClothingItemRequest = {
      ...request,
      userId: options.userId,
    };

    const result = await addItemUseCase.execute(fullRequest);

    if (result.succeeded) {
      // Refresh the list to include the new item
      await refresh();
    }

    return result.succeeded 
      ? Result.ok<ClothingItem>(result.value.item)
      : Result.fail<ClothingItem>(result.message);
  }, [options.userId, refresh]);

  const updateItem = useCallback(async (
    request: Omit<UpdateClothingItemRequest, 'userId'>
  ): Promise<Result<ClothingItem>> => {
    const fullRequest: UpdateClothingItemRequest = {
      ...request,
      userId: options.userId,
    };

    const result = await updateItemUseCase.execute(fullRequest);

    if (result.succeeded) {
      // Update the item in the current list
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === result.value.item.id ? result.value.item : item
        ),
      }));
    }

    return result.succeeded 
      ? Result.ok<ClothingItem>(result.value.item)
      : Result.fail<ClothingItem>(result.message);
  }, [options.userId]);

  const deleteItem = useCallback(async (
    itemId: string,
    deleteImages: boolean = true
  ): Promise<Result<void>> => {
    const request: DeleteClothingItemRequest = {
      itemId,
      userId: options.userId,
      deleteImages,
    };

    const result = await deleteItemUseCase.execute(request);

    if (result.succeeded) {
      // Remove the item from the current list
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        total: prev.total - 1,
      }));
    }

    return result.succeeded 
      ? Result.ok<void>()
      : Result.fail<void>(result.message);
  }, [options.userId]);

  const toggleFavorite = useCallback(async (itemId: string): Promise<Result<void>> => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) {
      return Result.fail<void>('Item not found');
    }

    return updateItem({
      itemId,
      isFavorite: !item.isFavorite,
    }).then(result => 
      result.succeeded ? Result.ok<void>() : Result.fail<void>(result.message)
    );
  }, [state.items, updateItem]);

  const toggleArchive = useCallback(async (itemId: string): Promise<Result<void>> => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) {
      return Result.fail<void>('Item not found');
    }

    return updateItem({
      itemId,
      isArchived: !item.isArchived,
    }).then(result => 
      result.succeeded ? Result.ok<void>() : Result.fail<void>(result.message)
    );
  }, [state.items, updateItem]);

  const wearItem = useCallback(async (itemId: string): Promise<Result<void>> => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) {
      return Result.fail<void>('Item not found');
    }

    return updateItem({
      itemId,
      timesWorn: item.timesWorn + 1,
      lastWorn: new Date(),
    }).then(result => 
      result.succeeded ? Result.ok<void>() : Result.fail<void>(result.message)
    );
  }, [state.items, updateItem]);

  const setFilters = useCallback((newFilters: UseClothingItemsOptions['filters']) => {
    setFiltersState(newFilters);
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const setSort = useCallback((newSort: UseClothingItemsOptions['sort']) => {
    setSortState(newSort);
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const setPagination = useCallback((newPagination: UseClothingItemsOptions['pagination']) => {
    setPaginationState(newPagination || { page: 1, limit: 20 });
  }, []);

  const nextPage = useCallback(() => {
    if (state.hasNext) {
      setPaginationState(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [state.hasNext]);

  const previousPage = useCallback(() => {
    if (state.hasPrevious) {
      setPaginationState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
    }
  }, [state.hasPrevious]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto load when options change
  useEffect(() => {
    if (options.autoLoad !== false) {
      load();
    }
  }, [load, options.autoLoad]);

  // Update state when filters, sort, or pagination change
  useEffect(() => {
    setState(prev => ({ ...prev, page: pagination.page, limit: pagination.limit }));
  }, [pagination]);

  const actions: UseClothingItemsActions = {
    load,
    refresh,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    toggleArchive,
    wearItem,
    setFilters,
    setSort,
    setPagination,
    nextPage,
    previousPage,
    clearError,
  };

  return [state, actions];
}

// Additional specialized hooks
export function useFavoriteClothingItems(userId: string) {
  return useClothingItems({
    userId,
    filters: { isFavorite: true },
    sort: { field: 'updatedAt', direction: 'desc' },
  });
}

export function useArchivedClothingItems(userId: string) {
  return useClothingItems({
    userId,
    filters: { isArchived: true },
    sort: { field: 'updatedAt', direction: 'desc' },
  });
}

export function useClothingItemsByCategory(userId: string, category: ClothingCategory) {
  return useClothingItems({
    userId,
    filters: { category },
    sort: { field: 'name', direction: 'asc' },
  });
}