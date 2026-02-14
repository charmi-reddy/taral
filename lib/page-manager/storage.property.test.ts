/**
 * Property-based tests for page storage and unique identifiers
 * Feature: page-management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './storage';
import { PageStorage, Page, PAGE_CONSTANTS } from './types';
import { generateUUID } from './uuid';

describe('Page Storage - Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  /**
   * Property 2: Unique Page Identifiers
   * 
   * For any set of pages in the system, all page IDs should be unique,
   * and each page's ID should remain unchanged across save/load cycles.
   * 
   * **Validates: Requirements 1.5, 10.5**
   */
  it('Property 2: all page IDs should be unique in any set of pages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }), // Number of pages to create
        (pageCount) => {
          const pages: Record<string, Page> = {};
          const pageIds = new Set<string>();

          // Create pages with unique IDs
          for (let i = 0; i < pageCount; i++) {
            const id = generateUUID();
            pageIds.add(id);
            
            pages[id] = {
              id,
              name: `Page ${i + 1}`,
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            };
          }

          // All page IDs should be unique
          expect(pageIds.size).toBe(pageCount);
          expect(Object.keys(pages).length).toBe(pageCount);

          // All page IDs in the pages object should match the set
          for (const pageId in pages) {
            expect(pageIds.has(pageId)).toBe(true);
            expect(pages[pageId].id).toBe(pageId);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: page IDs should remain unchanged across save/load cycles', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            strokes: fc.constant([]), // Simplified for testing
            backgroundStyle: fc.constantFrom('plain', 'grid', 'dots'),
            thumbnail: fc.constant('data:image/jpeg;base64,test'),
            createdAt: fc.integer({ min: 1 }),
            lastModifiedAt: fc.integer({ min: 1 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (pageData) => {
          // Generate unique IDs for each page
          const pages: Record<string, Page> = {};
          const originalIds: string[] = [];

          for (const data of pageData) {
            const id = generateUUID();
            originalIds.push(id);
            pages[id] = {
              id,
              ...data,
            };
          }

          // Save to localStorage
          const storage: PageStorage = {
            pages,
            activePageId: originalIds[0] || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          const saveResult = saveToLocalStorage(storage);
          expect(saveResult.success).toBe(true);

          // Load from localStorage
          const loadResult = loadFromLocalStorage();
          expect(loadResult.success).toBe(true);
          expect(loadResult.data).toBeDefined();

          const loadedPages = loadResult.data!.pages;

          // Verify all original IDs are present
          expect(Object.keys(loadedPages).length).toBe(originalIds.length);

          // Verify each page ID remains unchanged
          for (const originalId of originalIds) {
            expect(loadedPages[originalId]).toBeDefined();
            expect(loadedPages[originalId].id).toBe(originalId);
          }

          // Verify all IDs are still unique
          const loadedIds = Object.keys(loadedPages);
          const uniqueLoadedIds = new Set(loadedIds);
          expect(uniqueLoadedIds.size).toBe(loadedIds.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: page IDs should remain unchanged through multiple save/load cycles', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }), // Number of save/load cycles
        fc.integer({ min: 1, max: 15 }), // Number of pages
        (cycles, pageCount) => {
          // Create initial pages with unique IDs
          const pages: Record<string, Page> = {};
          const originalIds: string[] = [];

          for (let i = 0; i < pageCount; i++) {
            const id = generateUUID();
            originalIds.push(id);
            pages[id] = {
              id,
              name: `Page ${i + 1}`,
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            };
          }

          let currentPages = pages;

          // Perform multiple save/load cycles
          for (let cycle = 0; cycle < cycles; cycle++) {
            const storage: PageStorage = {
              pages: currentPages,
              activePageId: originalIds[0],
              version: PAGE_CONSTANTS.STORAGE_VERSION,
            };

            const saveResult = saveToLocalStorage(storage);
            expect(saveResult.success).toBe(true);

            const loadResult = loadFromLocalStorage();
            expect(loadResult.success).toBe(true);
            expect(loadResult.data).toBeDefined();

            currentPages = loadResult.data!.pages;

            // Verify all original IDs are still present
            for (const originalId of originalIds) {
              expect(currentPages[originalId]).toBeDefined();
              expect(currentPages[originalId].id).toBe(originalId);
            }

            // Verify all IDs are still unique
            const currentIds = Object.keys(currentPages);
            const uniqueIds = new Set(currentIds);
            expect(uniqueIds.size).toBe(originalIds.length);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: adding new pages should not affect existing page IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Initial page count
        fc.integer({ min: 1, max: 10 }), // Pages to add
        (initialCount, addCount) => {
          // Create initial pages
          const initialPages: Record<string, Page> = {};
          const initialIds: string[] = [];

          for (let i = 0; i < initialCount; i++) {
            const id = generateUUID();
            initialIds.push(id);
            initialPages[id] = {
              id,
              name: `Initial Page ${i + 1}`,
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            };
          }

          // Save initial pages
          const initialStorage: PageStorage = {
            pages: initialPages,
            activePageId: null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };
          saveToLocalStorage(initialStorage);

          // Load and add new pages
          const loadResult = loadFromLocalStorage();
          expect(loadResult.success).toBe(true);
          
          const loadedPages = { ...loadResult.data!.pages };
          const newIds: string[] = [];

          for (let i = 0; i < addCount; i++) {
            const id = generateUUID();
            newIds.push(id);
            loadedPages[id] = {
              id,
              name: `New Page ${i + 1}`,
              strokes: [],
              backgroundStyle: 'plain',
              thumbnail: 'data:image/jpeg;base64,test',
              createdAt: Date.now(),
              lastModifiedAt: Date.now(),
            };
          }

          // Save updated pages
          const updatedStorage: PageStorage = {
            pages: loadedPages,
            activePageId: null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };
          saveToLocalStorage(updatedStorage);

          // Load again and verify
          const finalLoadResult = loadFromLocalStorage();
          expect(finalLoadResult.success).toBe(true);
          
          const finalPages = finalLoadResult.data!.pages;

          // All initial IDs should still exist and be unchanged
          for (const initialId of initialIds) {
            expect(finalPages[initialId]).toBeDefined();
            expect(finalPages[initialId].id).toBe(initialId);
          }

          // All new IDs should exist
          for (const newId of newIds) {
            expect(finalPages[newId]).toBeDefined();
            expect(finalPages[newId].id).toBe(newId);
          }

          // All IDs should be unique
          const allIds = [...initialIds, ...newIds];
          const uniqueIds = new Set(allIds);
          expect(uniqueIds.size).toBe(allIds.length);
          expect(Object.keys(finalPages).length).toBe(allIds.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
