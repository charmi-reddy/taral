/**
 * localStorage wrapper with error handling for page persistence
 */

import { PageStorage, PAGE_CONSTANTS } from './types';

/**
 * Result type for storage operations
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

/**
 * Storage error types
 */
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  CORRUPTED_DATA = 'CORRUPTED_DATA',
  UNKNOWN = 'UNKNOWN',
}

export interface StorageError {
  type: StorageErrorType;
  message: string;
  originalError?: unknown;
}

/**
 * Saves page storage data to localStorage
 * @param data The PageStorage data to save
 * @returns StorageResult indicating success or failure
 */
export function saveToLocalStorage(data: PageStorage): StorageResult<void> {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, json);
    return { success: true };
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: {
          type: StorageErrorType.QUOTA_EXCEEDED,
          message: 'localStorage quota exceeded. Please delete some pages to free up space.',
          originalError: error,
        },
      };
    }

    // Handle security/access errors (private browsing, disabled storage)
    if (error instanceof DOMException && error.name === 'SecurityError') {
      return {
        success: false,
        error: {
          type: StorageErrorType.ACCESS_DENIED,
          message: 'localStorage access denied. This may occur in private browsing mode.',
          originalError: error,
        },
      };
    }

    // Unknown error
    console.error('Failed to save to localStorage:', error);
    return {
      success: false,
      error: {
        type: StorageErrorType.UNKNOWN,
        message: 'An unknown error occurred while saving data.',
        originalError: error,
      },
    };
  }
}

/**
 * Loads page storage data from localStorage
 * @returns StorageResult with PageStorage data or error
 */
export function loadFromLocalStorage(): StorageResult<PageStorage> {
  try {
    const json = localStorage.getItem(PAGE_CONSTANTS.STORAGE_KEY);

    // No data stored yet - return empty storage
    if (!json) {
      return {
        success: true,
        data: {
          pages: {},
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        },
      };
    }

    // Parse and validate data
    const data = JSON.parse(json);
    const validatedData = validatePageStorage(data);

    if (!validatedData) {
      return {
        success: false,
        error: {
          type: StorageErrorType.CORRUPTED_DATA,
          message: 'Stored data is corrupted or invalid. Using default values.',
        },
      };
    }

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      console.error('Failed to parse localStorage data:', error);
      return {
        success: false,
        error: {
          type: StorageErrorType.CORRUPTED_DATA,
          message: 'Stored data is corrupted. Using default values.',
          originalError: error,
        },
      };
    }

    // Handle security/access errors
    if (error instanceof DOMException && error.name === 'SecurityError') {
      return {
        success: false,
        error: {
          type: StorageErrorType.ACCESS_DENIED,
          message: 'localStorage access denied. This may occur in private browsing mode.',
          originalError: error,
        },
      };
    }

    // Unknown error
    console.error('Failed to load from localStorage:', error);
    return {
      success: false,
      error: {
        type: StorageErrorType.UNKNOWN,
        message: 'An unknown error occurred while loading data.',
        originalError: error,
      },
    };
  }
}

/**
 * Validates PageStorage data structure
 * @param data The data to validate
 * @returns Validated PageStorage or null if invalid
 */
function validatePageStorage(data: any): PageStorage | null {
  try {
    // Check basic structure
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Validate pages object
    if (!data.pages || typeof data.pages !== 'object') {
      return null;
    }

    // Validate version
    if (typeof data.version !== 'number' || data.version <= 0) {
      return null;
    }

    // Validate activePageId (can be null or string)
    if (data.activePageId !== null && typeof data.activePageId !== 'string') {
      return null;
    }

    // Validate each page
    for (const pageId in data.pages) {
      const page = data.pages[pageId];
      if (!validatePage(page)) {
        console.warn(`Invalid page data for ID ${pageId}, skipping`);
        delete data.pages[pageId];
      }
    }

    return data as PageStorage;
  } catch (error) {
    console.error('Page storage validation failed:', error);
    return null;
  }
}

/**
 * Validates a single Page object
 * @param page The page to validate
 * @returns true if valid, false otherwise
 */
function validatePage(page: any): boolean {
  try {
    // Check required fields
    if (!page || typeof page !== 'object') return false;
    if (!page.id || typeof page.id !== 'string') return false;
    if (!page.name || typeof page.name !== 'string') return false;
    if (!Array.isArray(page.strokes)) return false;
    if (!page.backgroundStyle || typeof page.backgroundStyle !== 'string') return false;
    if (typeof page.thumbnail !== 'string') return false; // Allow empty string

    // Validate timestamps
    if (typeof page.createdAt !== 'number' || page.createdAt <= 0) return false;
    if (typeof page.lastModifiedAt !== 'number' || page.lastModifiedAt <= 0) return false;

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clears all page data from localStorage
 * Useful for testing or resetting the application
 */
export function clearLocalStorage(): StorageResult<void> {
  try {
    localStorage.removeItem(PAGE_CONSTANTS.STORAGE_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return {
      success: false,
      error: {
        type: StorageErrorType.UNKNOWN,
        message: 'Failed to clear localStorage.',
        originalError: error,
      },
    };
  }
}
