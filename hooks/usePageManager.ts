/**
 * React hook for managing page state and operations
 * Provides CRUD operations, active page management, and auto-save functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Page, PageMetadata, PAGE_CONSTANTS } from '../lib/page-manager/types';
import {
  createPage,
  getPage,
  getAllPages,
  updatePage,
  deletePage,
} from '../lib/page-manager/page-manager';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  StorageError,
} from '../lib/page-manager/storage';

export interface UsePageManagerReturn {
  // State
  pages: Record<string, Page>;
  activePageId: string | null;
  storageError: StorageError | null;
  
  // Page CRUD operations
  createNewPage: (customName?: string) => Page;
  getPageById: (id: string) => Page | null;
  getAllPageMetadata: () => PageMetadata[];
  updatePageData: (id: string, updates: Partial<Omit<Page, 'id' | 'createdAt'>>) => void;
  updatePageName: (id: string, newName: string) => boolean;
  deletePageById: (id: string) => void;
  
  // Active page management
  setActivePageId: (id: string | null) => void;
  getActivePage: () => Page | null;
  
  // Persistence
  saveNow: () => void;
}

/**
 * Custom hook for page management with state, persistence, and auto-save
 */
export function usePageManager(): UsePageManagerReturn {
  const [pages, setPages] = useState<Record<string, Page>>({});
  const [activePageId, setActivePageIdState] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<StorageError | null>(null);
  
  // Ref to track if initial load has completed
  const hasLoadedRef = useRef(false);
  
  // Ref for debounce timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Load pages from localStorage on mount
   */
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    const result = loadFromLocalStorage();
    
    if (result.success && result.data) {
      setPages(result.data.pages);
      setActivePageIdState(result.data.activePageId);
      setStorageError(null);
    } else if (result.error) {
      console.error('Failed to load pages:', result.error.message);
      setStorageError(result.error);
      // Continue with empty state
      setPages({});
      setActivePageIdState(null);
    }
    
    hasLoadedRef.current = true;
  }, []);
  
  /**
   * Persist current state to localStorage
   */
  const persistToStorage = useCallback(() => {
    const result = saveToLocalStorage({
      pages,
      activePageId,
      version: PAGE_CONSTANTS.STORAGE_VERSION,
    });
    
    if (!result.success && result.error) {
      console.error('Failed to save pages:', result.error.message);
      setStorageError(result.error);
    } else {
      setStorageError(null);
    }
  }, [pages, activePageId]);
  
  /**
   * Auto-save with debouncing (1 second delay)
   */
  useEffect(() => {
    // Skip auto-save if initial load hasn't completed
    if (!hasLoadedRef.current) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      persistToStorage();
    }, PAGE_CONSTANTS.AUTO_SAVE_DEBOUNCE_MS);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pages, activePageId, persistToStorage]);
  
  /**
   * Create a new page
   */
  const createNewPage = useCallback((customName?: string): Page => {
    const newPage = createPage(pages, customName);
    setPages(prev => ({
      ...prev,
      [newPage.id]: newPage,
    }));
    return newPage;
  }, [pages]);
  
  /**
   * Get a page by ID
   */
  const getPageById = useCallback((id: string): Page | null => {
    return getPage(pages, id);
  }, [pages]);
  
  /**
   * Get metadata for all pages
   */
  const getAllPageMetadata = useCallback((): PageMetadata[] => {
    return getAllPages(pages);
  }, [pages]);
  
  /**
   * Update a page with new data
   */
  const updatePageData = useCallback((
    id: string,
    updates: Partial<Omit<Page, 'id' | 'createdAt'>>
  ): void => {
    setPages(prev => updatePage(prev, id, updates));
  }, []);
  
  /**
   * Update a page name with validation
   * Validates that the name is not empty/whitespace-only and within 100 character limit
   * Returns true if update was successful, false if validation failed
   */
  const updatePageName = useCallback((id: string, newName: string): boolean => {
    // Validate: reject empty or whitespace-only names
    if (!newName || newName.trim().length === 0) {
      return false;
    }
    
    // Validate: enforce 100-character limit
    if (newName.length > PAGE_CONSTANTS.MAX_PAGE_NAME_LENGTH) {
      return false;
    }
    
    // Update the page name
    setPages(prev => updatePage(prev, id, { name: newName }));
    
    // Persist changes immediately (clear debounce and save now)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Trigger immediate save by calling persistToStorage in next tick
    // This ensures the state update has been applied
    Promise.resolve().then(() => {
      persistToStorage();
    });
    
    return true;
  }, [persistToStorage]);
  
  /**
   * Delete a page
   */
  const deletePageById = useCallback((id: string): void => {
    setPages(prev => deletePage(prev, id));
    
    // Clear active page if it was deleted
    if (activePageId === id) {
      setActivePageIdState(null);
    }
  }, [activePageId]);
  
  /**
   * Set the active page ID
   */
  const setActivePageId = useCallback((id: string | null): void => {
    setActivePageIdState(id);
  }, []);
  
  /**
   * Get the currently active page
   */
  const getActivePage = useCallback((): Page | null => {
    if (!activePageId) return null;
    return getPage(pages, activePageId);
  }, [pages, activePageId]);
  
  /**
   * Save immediately without debouncing
   */
  const saveNow = useCallback((): void => {
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Save immediately
    persistToStorage();
  }, [persistToStorage]);
  
  return {
    // State
    pages,
    activePageId,
    storageError,
    
    // Page CRUD operations
    createNewPage,
    getPageById,
    getAllPageMetadata,
    updatePageData,
    updatePageName,
    deletePageById,
    
    // Active page management
    setActivePageId,
    getActivePage,
    
    // Persistence
    saveNow,
  };
}
