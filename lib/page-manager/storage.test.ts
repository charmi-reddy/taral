/**
 * Tests for localStorage wrapper
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  StorageErrorType,
} from './storage';
import { PageStorage, PAGE_CONSTANTS } from './types';

describe('localStorage wrapper', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('saveToLocalStorage', () => {
    it('should save valid PageStorage data', () => {
      const data: PageStorage = {
        pages: {},
        activePageId: null,
        version: PAGE_CONSTANTS.STORAGE_VERSION,
      };

      const result = saveToLocalStorage(data);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify data was saved
      const saved = localStorage.getItem(PAGE_CONSTANTS.STORAGE_KEY);
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(data);
    });

    it('should save PageStorage with pages', () => {
      const data: PageStorage = {
        pages: {
          'test-id': {
            id: 'test-id',
            name: 'Test Page',
            strokes: [],
            backgroundStyle: 'plain',
            thumbnail: 'data:image/jpeg;base64,test',
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
          },
        },
        activePageId: 'test-id',
        version: PAGE_CONSTANTS.STORAGE_VERSION,
      };

      const result = saveToLocalStorage(data);

      expect(result.success).toBe(true);

      const saved = localStorage.getItem(PAGE_CONSTANTS.STORAGE_KEY);
      expect(JSON.parse(saved!)).toEqual(data);
    });

    it('should handle quota exceeded error', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      const data: PageStorage = {
        pages: {},
        activePageId: null,
        version: PAGE_CONSTANTS.STORAGE_VERSION,
      };

      const result = saveToLocalStorage(data);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(StorageErrorType.QUOTA_EXCEEDED);
      expect(result.error?.message).toContain('quota exceeded');

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle security error', () => {
      // Mock localStorage.setItem to throw SecurityError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        const error = new DOMException('Access denied', 'SecurityError');
        throw error;
      });

      const data: PageStorage = {
        pages: {},
        activePageId: null,
        version: PAGE_CONSTANTS.STORAGE_VERSION,
      };

      const result = saveToLocalStorage(data);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(StorageErrorType.ACCESS_DENIED);

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should return empty storage when no data exists', () => {
      const result = loadFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        pages: {},
        activePageId: null,
        version: PAGE_CONSTANTS.STORAGE_VERSION,
      });
    });

    it('should load valid PageStorage data', () => {
      const data: PageStorage = {
        pages: {
          'test-id': {
            id: 'test-id',
            name: 'Test Page',
            strokes: [],
            backgroundStyle: 'plain',
            thumbnail: 'data:image/jpeg;base64,test',
            createdAt: 1234567890,
            lastModifiedAt: 1234567890,
          },
        },
        activePageId: 'test-id',
        version: PAGE_CONSTANTS.STORAGE_VERSION,
      };

      localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

      const result = loadFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should handle corrupted JSON data', () => {
      localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, 'invalid json {');

      const result = loadFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
    });

    it('should handle invalid data structure', () => {
      localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify({ invalid: 'data' }));

      const result = loadFromLocalStorage();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
    });

    it('should skip invalid pages but keep valid ones', () => {
      const data = {
        pages: {
          'valid-id': {
            id: 'valid-id',
            name: 'Valid Page',
            strokes: [],
            backgroundStyle: 'plain',
            thumbnail: 'data:image/jpeg;base64,test',
            createdAt: 1234567890,
            lastModifiedAt: 1234567890,
          },
          'invalid-id': {
            id: 'invalid-id',
            // Missing required fields
          },
        },
        activePageId: null,
        version: PAGE_CONSTANTS.STORAGE_VERSION,
      };

      localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

      const result = loadFromLocalStorage();

      expect(result.success).toBe(true);
      expect(result.data?.pages['valid-id']).toBeDefined();
      expect(result.data?.pages['invalid-id']).toBeUndefined();
    });
  });

  describe('clearLocalStorage', () => {
    it('should clear localStorage data', () => {
      const data: PageStorage = {
        pages: {},
        activePageId: null,
        version: PAGE_CONSTANTS.STORAGE_VERSION,
      };

      localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

      const result = clearLocalStorage();

      expect(result.success).toBe(true);
      expect(localStorage.getItem(PAGE_CONSTANTS.STORAGE_KEY)).toBeNull();
    });
  });
});
