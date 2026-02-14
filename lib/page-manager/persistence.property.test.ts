/**
 * Property-based tests for page persistence round-trip
 * Feature: page-management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { saveToLocalStorage, loadFromLocalStorage } from './storage';
import { PageStorage, Page, PAGE_CONSTANTS } from './types';
import { Point, Stroke } from '../types';

/**
 * Arbitrary generator for Point objects
 */
const arbitraryPoint = (): fc.Arbitrary<Point> => {
  return fc.record({
    x: fc.float({ min: 0, max: 2000, noNaN: true }),
    y: fc.float({ min: 0, max: 2000, noNaN: true }),
    pressure: fc.option(fc.float({ min: 0, max: 1, noNaN: true })),
    timestamp: fc.integer({ min: 1 }),
  });
};

/**
 * Arbitrary generator for Stroke objects
 */
const arbitraryStroke = (): fc.Arbitrary<Stroke> => {
  return fc.record({
    points: fc.array(arbitraryPoint(), { minLength: 1, maxLength: 50 }),
    color: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
    brushType: fc.constantFrom('ink', 'pixel', 'eraser'),
    baseWidth: fc.float({ min: 1, max: 50, noNaN: true }),
  });
};

/**
 * Arbitrary generator for Page objects
 * Generates pages that will pass storage validation
 */
const arbitraryPage = (): fc.Arbitrary<Page> => {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // Ensure non-whitespace name
    strokes: fc.array(arbitraryStroke(), { minLength: 0, maxLength: 20 }),
    backgroundStyle: fc.constantFrom('plain', 'ruled', 'dotted', 'grid'),
    thumbnail: fc.oneof(
      fc.constant('data:image/jpeg;base64,test'),
      fc.string({ minLength: 10, maxLength: 100 }).map(s => `data:image/jpeg;base64,${s}`)
    ),
    createdAt: fc.integer({ min: 1, max: Date.now() }),
    lastModifiedAt: fc.integer({ min: 1, max: Date.now() }),
  });
};

describe('Page Persistence Round-Trip - Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  /**
   * Property 1: Page Persistence Round-Trip
   * 
   * For any page with strokes, background style, and metadata, saving the page
   * to localStorage and then loading it back should produce an equivalent page
   * with all data intact.
   * 
   * **Validates: Requirements 1.2, 1.3, 1.4, 8.2, 8.3, 9.4**
   */
  it('Property 1: saving and loading a page should preserve all data', () => {
    fc.assert(
      fc.property(
        arbitraryPage(),
        (page) => {
          // Create storage with the page
          const storage: PageStorage = {
            pages: { [page.id]: page },
            activePageId: page.id,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save to localStorage
          const saveResult = saveToLocalStorage(storage);
          expect(saveResult.success).toBe(true);

          // Load from localStorage
          const loadResult = loadFromLocalStorage();
          expect(loadResult.success).toBe(true);
          expect(loadResult.data).toBeDefined();

          // Verify the loaded page matches the original
          const loadedPage = loadResult.data!.pages[page.id];
          expect(loadedPage).toBeDefined();

          // Verify all fields are preserved
          expect(loadedPage.id).toBe(page.id);
          expect(loadedPage.name).toBe(page.name);
          expect(loadedPage.backgroundStyle).toBe(page.backgroundStyle);
          expect(loadedPage.thumbnail).toBe(page.thumbnail);
          expect(loadedPage.createdAt).toBe(page.createdAt);
          expect(loadedPage.lastModifiedAt).toBe(page.lastModifiedAt);

          // Verify strokes are preserved
          expect(loadedPage.strokes).toEqual(page.strokes);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should preserve multiple pages in a single round-trip', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 10 }),
        (pages) => {
          // Create storage with multiple pages
          const pagesRecord: Record<string, Page> = {};
          for (const page of pages) {
            pagesRecord[page.id] = page;
          }

          const storage: PageStorage = {
            pages: pagesRecord,
            activePageId: pages[0]?.id || null,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save to localStorage
          const saveResult = saveToLocalStorage(storage);
          expect(saveResult.success).toBe(true);

          // Load from localStorage
          const loadResult = loadFromLocalStorage();
          expect(loadResult.success).toBe(true);
          expect(loadResult.data).toBeDefined();

          // Verify all pages are preserved
          const loadedPages = loadResult.data!.pages;
          expect(Object.keys(loadedPages).length).toBe(pages.length);

          for (const originalPage of pages) {
            const loadedPage = loadedPages[originalPage.id];
            expect(loadedPage).toBeDefined();
            expect(loadedPage).toEqual(originalPage);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should preserve stroke data with all point properties', () => {
    fc.assert(
      fc.property(
        fc.record({
          page: arbitraryPage(),
          additionalStrokes: fc.array(arbitraryStroke(), { minLength: 1, maxLength: 5 }),
        }),
        ({ page, additionalStrokes }) => {
          // Add additional strokes to the page
          const pageWithStrokes: Page = {
            ...page,
            strokes: [...page.strokes, ...additionalStrokes],
          };

          const storage: PageStorage = {
            pages: { [pageWithStrokes.id]: pageWithStrokes },
            activePageId: pageWithStrokes.id,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save and load
          saveToLocalStorage(storage);
          const loadResult = loadFromLocalStorage();

          expect(loadResult.success).toBe(true);
          const loadedPage = loadResult.data!.pages[pageWithStrokes.id];

          // Verify all strokes are preserved
          expect(loadedPage.strokes.length).toBe(pageWithStrokes.strokes.length);

          // Verify each stroke's properties
          for (let i = 0; i < pageWithStrokes.strokes.length; i++) {
            const originalStroke = pageWithStrokes.strokes[i];
            const loadedStroke = loadedPage.strokes[i];

            expect(loadedStroke.color).toBe(originalStroke.color);
            expect(loadedStroke.brushType).toBe(originalStroke.brushType);
            expect(loadedStroke.baseWidth).toBe(originalStroke.baseWidth);
            expect(loadedStroke.points.length).toBe(originalStroke.points.length);

            // Verify each point in the stroke
            for (let j = 0; j < originalStroke.points.length; j++) {
              const originalPoint = originalStroke.points[j];
              const loadedPoint = loadedStroke.points[j];

              expect(loadedPoint.x).toBe(originalPoint.x);
              expect(loadedPoint.y).toBe(originalPoint.y);
              expect(loadedPoint.timestamp).toBe(originalPoint.timestamp);
              expect(loadedPoint.pressure).toBe(originalPoint.pressure);
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should preserve background style across all valid values', () => {
    fc.assert(
      fc.property(
        arbitraryPage(),
        fc.constantFrom('plain', 'ruled', 'dotted', 'grid'),
        (page, backgroundStyle) => {
          const pageWithBackground: Page = {
            ...page,
            backgroundStyle,
          };

          const storage: PageStorage = {
            pages: { [pageWithBackground.id]: pageWithBackground },
            activePageId: pageWithBackground.id,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save and load
          saveToLocalStorage(storage);
          const loadResult = loadFromLocalStorage();

          expect(loadResult.success).toBe(true);
          const loadedPage = loadResult.data!.pages[pageWithBackground.id];

          // Verify background style is preserved
          expect(loadedPage.backgroundStyle).toBe(backgroundStyle);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should preserve metadata timestamps accurately', () => {
    fc.assert(
      fc.property(
        arbitraryPage(),
        (page) => {
          const storage: PageStorage = {
            pages: { [page.id]: page },
            activePageId: page.id,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save and load
          saveToLocalStorage(storage);
          const loadResult = loadFromLocalStorage();

          expect(loadResult.success).toBe(true);
          const loadedPage = loadResult.data!.pages[page.id];

          // Verify timestamps are preserved exactly
          expect(loadedPage.createdAt).toBe(page.createdAt);
          expect(loadedPage.lastModifiedAt).toBe(page.lastModifiedAt);

          // Verify timestamps are valid numbers
          expect(typeof loadedPage.createdAt).toBe('number');
          expect(typeof loadedPage.lastModifiedAt).toBe('number');
          expect(loadedPage.createdAt).toBeGreaterThan(0);
          expect(loadedPage.lastModifiedAt).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should preserve thumbnail data', () => {
    fc.assert(
      fc.property(
        arbitraryPage(),
        (page) => {
          const storage: PageStorage = {
            pages: { [page.id]: page },
            activePageId: page.id,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save and load
          saveToLocalStorage(storage);
          const loadResult = loadFromLocalStorage();

          expect(loadResult.success).toBe(true);
          const loadedPage = loadResult.data!.pages[page.id];

          // Verify thumbnail is preserved
          expect(loadedPage.thumbnail).toBe(page.thumbnail);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should preserve activePageId in storage', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        (pages, activeIndex) => {
          const pagesRecord: Record<string, Page> = {};
          for (const page of pages) {
            pagesRecord[page.id] = page;
          }

          const activePageId = pages[activeIndex % pages.length]?.id || null;

          const storage: PageStorage = {
            pages: pagesRecord,
            activePageId,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save and load
          saveToLocalStorage(storage);
          const loadResult = loadFromLocalStorage();

          expect(loadResult.success).toBe(true);
          expect(loadResult.data!.activePageId).toBe(activePageId);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should handle pages with empty strokes array', () => {
    fc.assert(
      fc.property(
        arbitraryPage(),
        (page) => {
          const pageWithNoStrokes: Page = {
            ...page,
            strokes: [],
          };

          const storage: PageStorage = {
            pages: { [pageWithNoStrokes.id]: pageWithNoStrokes },
            activePageId: pageWithNoStrokes.id,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save and load
          saveToLocalStorage(storage);
          const loadResult = loadFromLocalStorage();

          expect(loadResult.success).toBe(true);
          const loadedPage = loadResult.data!.pages[pageWithNoStrokes.id];

          // Verify empty strokes array is preserved
          expect(Array.isArray(loadedPage.strokes)).toBe(true);
          expect(loadedPage.strokes.length).toBe(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should preserve data through multiple save/load cycles', () => {
    fc.assert(
      fc.property(
        arbitraryPage(),
        fc.integer({ min: 2, max: 5 }),
        (page, cycles) => {
          let currentStorage: PageStorage = {
            pages: { [page.id]: page },
            activePageId: page.id,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Perform multiple save/load cycles
          for (let i = 0; i < cycles; i++) {
            // Save
            const saveResult = saveToLocalStorage(currentStorage);
            expect(saveResult.success).toBe(true);

            // Load
            const loadResult = loadFromLocalStorage();
            expect(loadResult.success).toBe(true);
            expect(loadResult.data).toBeDefined();

            currentStorage = loadResult.data!;
          }

          // Verify the page is still intact after multiple cycles
          const finalPage = currentStorage.pages[page.id];
          expect(finalPage).toBeDefined();
          expect(finalPage).toEqual(page);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: should preserve page name with special characters', () => {
    fc.assert(
      fc.property(
        arbitraryPage(),
        fc.string({ minLength: 1, maxLength: 100 }),
        (page, specialName) => {
          const pageWithSpecialName: Page = {
            ...page,
            name: specialName,
          };

          const storage: PageStorage = {
            pages: { [pageWithSpecialName.id]: pageWithSpecialName },
            activePageId: pageWithSpecialName.id,
            version: PAGE_CONSTANTS.STORAGE_VERSION,
          };

          // Save and load
          saveToLocalStorage(storage);
          const loadResult = loadFromLocalStorage();

          expect(loadResult.success).toBe(true);
          const loadedPage = loadResult.data!.pages[pageWithSpecialName.id];

          // Verify name is preserved exactly
          expect(loadedPage.name).toBe(specialName);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
