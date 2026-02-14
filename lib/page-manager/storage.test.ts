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

  describe('Edge Cases', () => {
    describe('Quota Exceeded Error Handling', () => {
      it('should handle quota exceeded with large page data', () => {
        // Mock localStorage.setItem to throw QuotaExceededError
        const originalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = vi.fn(() => {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        });

        // Create large page data
        const largeData: PageStorage = {
          pages: {
            'page-1': {
              id: 'page-1',
              name: 'Large Page',
              strokes: Array(1000).fill({
                points: Array(100).fill({ x: 0, y: 0 }),
                color: '#000000',
                size: 5,
              }),
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,' + 'x'.repeat(10000),
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: 'page-1',
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        const result = saveToLocalStorage(largeData);

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.QUOTA_EXCEEDED);
        expect(result.error?.message).toContain('quota exceeded');
        expect(result.error?.originalError).toBeDefined();

        // Restore original
        Storage.prototype.setItem = originalSetItem;
      });

      it('should continue operating after quota exceeded error', () => {
        const originalSetItem = Storage.prototype.setItem;
        let callCount = 0;

        // First call throws, second succeeds
        Storage.prototype.setItem = vi.fn(() => {
          callCount++;
          if (callCount === 1) {
            throw new DOMException('Quota exceeded', 'QuotaExceededError');
          }
        });

        const data: PageStorage = {
          pages: {},
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        // First attempt fails
        const result1 = saveToLocalStorage(data);
        expect(result1.success).toBe(false);

        // Second attempt succeeds
        const result2 = saveToLocalStorage(data);
        expect(result2.success).toBe(true);

        Storage.prototype.setItem = originalSetItem;
      });
    });

    describe('Corrupted Data Recovery', () => {
      it('should recover from completely invalid JSON', () => {
        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, '}{invalid json');

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
        expect(result.error?.message).toContain('corrupted');
      });

      it('should recover from null data', () => {
        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, 'null');

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should recover from array instead of object', () => {
        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, '[]');

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should recover from string instead of object', () => {
        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, '"just a string"');

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should recover from number instead of object', () => {
        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, '12345');

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should handle page with invalid timestamp (zero)', () => {
        const data = {
          pages: {
            'invalid-timestamp': {
              id: 'invalid-timestamp',
              name: 'Invalid Page',
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: 0,
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['invalid-timestamp']).toBeUndefined();
      });

      it('should handle page with negative timestamp', () => {
        const data = {
          pages: {
            'negative-timestamp': {
              id: 'negative-timestamp',
              name: 'Invalid Page',
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: -1,
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['negative-timestamp']).toBeUndefined();
      });

      it('should handle page with string timestamp', () => {
        const data = {
          pages: {
            'string-timestamp': {
              id: 'string-timestamp',
              name: 'Invalid Page',
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: '2024-01-01',
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['string-timestamp']).toBeUndefined();
      });

      it('should handle page with null strokes', () => {
        const data = {
          pages: {
            'null-strokes': {
              id: 'null-strokes',
              name: 'Invalid Page',
              strokes: null,
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['null-strokes']).toBeUndefined();
      });

      it('should handle mixed valid and invalid pages', () => {
        const data = {
          pages: {
            'valid-1': {
              id: 'valid-1',
              name: 'Valid Page 1',
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
            'invalid-1': {
              id: 'invalid-1',
              name: 'Invalid Page',
              // Missing strokes
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
            'valid-2': {
              id: 'valid-2',
              name: 'Valid Page 2',
              strokes: [],
              backgroundStyle: 'grid',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
            'invalid-2': {
              id: 'invalid-2',
              // Missing name
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['valid-1']).toBeDefined();
        expect(result.data?.pages['valid-2']).toBeDefined();
        expect(result.data?.pages['invalid-1']).toBeUndefined();
        expect(result.data?.pages['invalid-2']).toBeUndefined();
      });
    });

    describe('Missing Fields with Default Values', () => {
      it('should handle missing pages object', () => {
        const data = {
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should handle missing version', () => {
        const data = {
          pages: {},
          activePageId: null,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should handle invalid version (zero)', () => {
        const data = {
          pages: {},
          activePageId: null,
          version: 0,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should handle invalid version (negative)', () => {
        const data = {
          pages: {},
          activePageId: null,
          version: -1,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should handle invalid activePageId (number)', () => {
        const data = {
          pages: {},
          activePageId: 123,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should handle invalid activePageId (object)', () => {
        const data = {
          pages: {},
          activePageId: { id: 'test' },
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
      });

      it('should handle page missing id field', () => {
        const data = {
          pages: {
            'test-id': {
              // Missing id
              name: 'Test Page',
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['test-id']).toBeUndefined();
      });

      it('should handle page missing name field', () => {
        const data = {
          pages: {
            'test-id': {
              id: 'test-id',
              // Missing name
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['test-id']).toBeUndefined();
      });

      it('should handle page missing backgroundStyle field', () => {
        const data = {
          pages: {
            'test-id': {
              id: 'test-id',
              name: 'Test Page',
              strokes: [],
              // Missing backgroundStyle
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['test-id']).toBeUndefined();
      });

      it('should handle page missing thumbnail field', () => {
        const data = {
          pages: {
            'test-id': {
              id: 'test-id',
              name: 'Test Page',
              strokes: [],
              backgroundStyle: 'plain',
              // Missing thumbnail
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['test-id']).toBeUndefined();
      });

      it('should handle page missing both timestamp fields', () => {
        const data = {
          pages: {
            'test-id': {
              id: 'test-id',
              name: 'Test Page',
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              // Missing createdAt and lastModifiedAt
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['test-id']).toBeUndefined();
      });

      it('should handle empty string for required fields', () => {
        const data = {
          pages: {
            'test-id': {
              id: '',
              name: '',
              strokes: [],
              backgroundStyle: '',
              thumbnail: '',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            },
          },
          activePageId: null,
          version: PAGE_CONSTANTS.STORAGE_VERSION,
        };

        localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(data));

        const result = loadFromLocalStorage();

        expect(result.success).toBe(true);
        expect(result.data?.pages['test-id']).toBeUndefined();
      });
    });
  });
});
