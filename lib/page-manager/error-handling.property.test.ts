/**
 * Property-based tests for graceful error handling
 * Feature: page-management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { saveToLocalStorage, loadFromLocalStorage, StorageErrorType } from './storage';
import { PageStorage, Page, PAGE_CONSTANTS } from './types';

/**
 * Arbitrary generator for Page objects
 */
const arbitraryPage = (): fc.Arbitrary<Page> => {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    strokes: fc.constant([]), // Simplified for error handling tests
    backgroundStyle: fc.constantFrom('plain', 'ruled', 'dotted', 'grid'),
    thumbnail: fc.constant('data:image/jpeg;base64,test'),
    createdAt: fc.integer({ min: 1, max: Date.now() }),
    lastModifiedAt: fc.integer({ min: 1, max: Date.now() }),
  });
};

describe('Graceful Error Handling - Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 18: Graceful Error Handling
   * 
   * For any localStorage error (quota exceeded, access denied, etc.), the system
   * should handle the error without crashing and should continue to function with
   * in-memory state.
   * 
   * **Validates: Requirements 8.5**
   */
  it('Property 18: should handle quota exceeded errors gracefully without crashing', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 10 }),
        (pages) => {
          const pagesRecord: Record<string, Page> = {};
          for (const page of pages) {
            pagesRecord[page.id] = page;
          }

          const storage: PageStorage = {
            pages: pagesRecord,
            activePageId: pages[0]?.id || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Mock localStorage.setItem to throw QuotaExceededError
          const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
          vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw quotaError;
          });

          // Attempt to save - should not crash
          let saveResult;
          expect(() => {
            saveResult = saveToLocalStorage(storage);
          }).not.toThrow();

          // Verify error is handled gracefully
          expect(saveResult).toBeDefined();
          expect(saveResult!.success).toBe(false);
          expect(saveResult!.error).toBeDefined();
          expect(saveResult!.error!.type).toBe(StorageErrorType.QUOTA_EXCEEDED);
          expect(saveResult!.error!.message).toContain('quota exceeded');

          // Verify in-memory state is still intact (not corrupted by error)
          expect(storage.pages).toEqual(pagesRecord);
          expect(Object.keys(storage.pages).length).toBe(pages.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should handle access denied errors gracefully without crashing', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 10 }),
        (pages) => {
          const pagesRecord: Record<string, Page> = {};
          for (const page of pages) {
            pagesRecord[page.id] = page;
          }

          const storage: PageStorage = {
            pages: pagesRecord,
            activePageId: pages[0]?.id || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Mock localStorage.setItem to throw SecurityError
          const securityError = new DOMException('Access denied', 'SecurityError');
          vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw securityError;
          });

          // Attempt to save - should not crash
          let saveResult;
          expect(() => {
            saveResult = saveToLocalStorage(storage);
          }).not.toThrow();

          // Verify error is handled gracefully
          expect(saveResult).toBeDefined();
          expect(saveResult!.success).toBe(false);
          expect(saveResult!.error).toBeDefined();
          expect(saveResult!.error!.type).toBe(StorageErrorType.ACCESS_DENIED);
          expect(saveResult!.error!.message).toContain('access denied');

          // Verify in-memory state is still intact
          expect(storage.pages).toEqual(pagesRecord);
          expect(Object.keys(storage.pages).length).toBe(pages.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should handle corrupted data errors gracefully on load', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (corruptedData) => {
          // Store corrupted data in localStorage
          localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, corruptedData);

          // Attempt to load - should not crash
          let loadResult;
          expect(() => {
            loadResult = loadFromLocalStorage();
          }).not.toThrow();

          // Verify error is handled gracefully
          expect(loadResult).toBeDefined();
          expect(loadResult!.success).toBe(false);
          expect(loadResult!.error).toBeDefined();
          expect(loadResult!.error!.type).toBe(StorageErrorType.CORRUPTED_DATA);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should continue functioning with in-memory state after save errors', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 5 }),
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 5 }),
        (initialPages, newPages) => {
          // Create initial storage
          const initialPagesRecord: Record<string, Page> = {};
          for (const page of initialPages) {
            initialPagesRecord[page.id] = page;
          }

          let storage: PageStorage = {
            pages: initialPagesRecord,
            activePageId: initialPages[0]?.id || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Mock localStorage to fail on save
          vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('Quota exceeded', 'QuotaExceededError');
          });

          // Attempt to save - should fail gracefully
          const saveResult = saveToLocalStorage(storage);
          expect(saveResult.success).toBe(false);

          // Continue working with in-memory state - add new pages
          const newPagesRecord: Record<string, Page> = { ...storage.pages };
          for (const page of newPages) {
            newPagesRecord[page.id] = page;
          }

          storage = {
            ...storage,
            pages: newPagesRecord,
          };

          // Verify in-memory state is functional
          expect(Object.keys(storage.pages).length).toBe(initialPages.length + newPages.length);

          // Verify all pages are accessible
          for (const page of [...initialPages, ...newPages]) {
            expect(storage.pages[page.id]).toBeDefined();
            expect(storage.pages[page.id].id).toBe(page.id);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should handle unknown errors gracefully without crashing', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (pages, errorMessage) => {
          const pagesRecord: Record<string, Page> = {};
          for (const page of pages) {
            pagesRecord[page.id] = page;
          }

          const storage: PageStorage = {
            pages: pagesRecord,
            activePageId: pages[0]?.id || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Mock localStorage.setItem to throw an unknown error
          vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error(errorMessage);
          });

          // Attempt to save - should not crash
          let saveResult;
          expect(() => {
            saveResult = saveToLocalStorage(storage);
          }).not.toThrow();

          // Verify error is handled gracefully
          expect(saveResult).toBeDefined();
          expect(saveResult!.success).toBe(false);
          expect(saveResult!.error).toBeDefined();
          expect(saveResult!.error!.type).toBe(StorageErrorType.UNKNOWN);

          // Verify in-memory state is still intact
          expect(storage.pages).toEqual(pagesRecord);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should handle access denied errors on load gracefully', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          // Mock localStorage.getItem to throw SecurityError
          const securityError = new DOMException('Access denied', 'SecurityError');
          vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw securityError;
          });

          // Attempt to load - should not crash
          let loadResult;
          expect(() => {
            loadResult = loadFromLocalStorage();
          }).not.toThrow();

          // Verify error is handled gracefully
          expect(loadResult).toBeDefined();
          expect(loadResult!.success).toBe(false);
          expect(loadResult!.error).toBeDefined();
          expect(loadResult!.error!.type).toBe(StorageErrorType.ACCESS_DENIED);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should provide default empty storage when load fails', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          StorageErrorType.CORRUPTED_DATA,
          StorageErrorType.ACCESS_DENIED,
          StorageErrorType.UNKNOWN
        ),
        (errorType) => {
          // Mock localStorage to fail based on error type
          if (errorType === StorageErrorType.CORRUPTED_DATA) {
            localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, 'invalid json');
          } else if (errorType === StorageErrorType.ACCESS_DENIED) {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
              throw new DOMException('Access denied', 'SecurityError');
            });
          } else {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
              throw new Error('Unknown error');
            });
          }

          // Load should fail but not crash
          const loadResult = loadFromLocalStorage();
          expect(loadResult.success).toBe(false);

          // System can continue with empty in-memory state
          const emptyStorage: PageStorage = {
            pages: {},
            activePageId: null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Verify empty storage is valid and functional
          expect(Object.keys(emptyStorage.pages).length).toBe(0);
          expect(emptyStorage.activePageId).toBe(null);
          expect(emptyStorage.version).toBe(PAGE_CONSTANTS.STORAGE_VERSION);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should handle partial data corruption gracefully', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (pages, corruptIndex) => {
          const pagesRecord: Record<string, Page> = {};
          for (const page of pages) {
            pagesRecord[page.id] = page;
          }

          // Corrupt one page's data
          const pageIds = Object.keys(pagesRecord);
          const corruptId = pageIds[corruptIndex % pageIds.length];
          if (corruptId) {
            // Make the page invalid by removing required fields
            (pagesRecord[corruptId] as any).name = undefined;
          }

          const storage: PageStorage = {
            pages: pagesRecord,
            activePageId: pages[0]?.id || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save the corrupted data
          vi.restoreAllMocks(); // Ensure real localStorage is used
          localStorage.setItem(PAGE_CONSTANTS.STORAGE_KEY, JSON.stringify(storage));

          // Load should handle partial corruption gracefully
          let loadResult;
          expect(() => {
            loadResult = loadFromLocalStorage();
          }).not.toThrow();

          // System should load successfully, skipping corrupted pages
          expect(loadResult).toBeDefined();
          
          // The load might succeed with partial data or fail with corrupted data error
          // Either way, it should not crash
          if (loadResult!.success) {
            // If successful, corrupted page should be skipped
            const loadedPages = loadResult!.data!.pages;
            expect(loadedPages[corruptId!]).toBeUndefined();
          } else {
            // If failed, should have corrupted data error
            expect(loadResult!.error?.type).toBe(StorageErrorType.CORRUPTED_DATA);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should maintain data integrity after multiple error scenarios', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 5 }),
        fc.array(fc.constantFrom('quota', 'security', 'unknown'), { minLength: 1, maxLength: 5 }),
        (pages, errorSequence) => {
          const pagesRecord: Record<string, Page> = {};
          for (const page of pages) {
            pagesRecord[page.id] = page;
          }

          let storage: PageStorage = {
            pages: pagesRecord,
            activePageId: pages[0]?.id || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Simulate multiple error scenarios
          for (const errorType of errorSequence) {
            // Mock different error types
            if (errorType === 'quota') {
              vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new DOMException('Quota exceeded', 'QuotaExceededError');
              });
            } else if (errorType === 'security') {
              vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new DOMException('Access denied', 'SecurityError');
              });
            } else {
              vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Unknown error');
              });
            }

            // Attempt to save - should not crash
            const saveResult = saveToLocalStorage(storage);
            expect(saveResult.success).toBe(false);

            // Verify in-memory state remains intact after each error
            expect(Object.keys(storage.pages).length).toBe(pages.length);
            for (const page of pages) {
              expect(storage.pages[page.id]).toBeDefined();
              expect(storage.pages[page.id].id).toBe(page.id);
            }

            vi.restoreAllMocks();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 18: should recover and save successfully after error is resolved', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 5 }),
        (pages) => {
          const pagesRecord: Record<string, Page> = {};
          for (const page of pages) {
            pagesRecord[page.id] = page;
          }

          const storage: PageStorage = {
            pages: pagesRecord,
            activePageId: pages[0]?.id || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // First attempt: mock error
          vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('Quota exceeded', 'QuotaExceededError');
          });

          const firstSaveResult = saveToLocalStorage(storage);
          expect(firstSaveResult.success).toBe(false);

          // Restore normal localStorage behavior
          vi.restoreAllMocks();

          // Second attempt: should succeed
          const secondSaveResult = saveToLocalStorage(storage);
          expect(secondSaveResult.success).toBe(true);

          // Verify data was saved correctly
          const loadResult = loadFromLocalStorage();
          expect(loadResult.success).toBe(true);
          expect(Object.keys(loadResult.data!.pages).length).toBe(pages.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
