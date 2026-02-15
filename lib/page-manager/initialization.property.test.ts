/**
 * Property-based tests for new page initialization
 * Feature: page-management
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createPage } from './page-manager';
import { Page, PAGE_CONSTANTS } from './types';

describe('New Page Initialization - Property Tests', () => {
  /**
   * Property 19: Complete Metadata Initialization
   * 
   * For any newly created page, the page metadata should include all required
   * fields: id, name, createdAt, lastModifiedAt, with valid values.
   * 
   * **Validates: Requirements 9.1**
   */
  it('Property 19: should initialize all required metadata fields with valid values', () => {
    fc.assert(
      fc.property(
        fc.record({
          existingPageCount: fc.integer({ min: 0, max: 100 }),
          customName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        }),
        ({ existingPageCount, customName }) => {
          // Create existing pages
          const existingPages: Record<string, Page> = {};
          for (let i = 0; i < existingPageCount; i++) {
            const page = createPage({}, `Existing Page ${i + 1}`);
            existingPages[page.id] = page;
          }
          
          // Create new page
          const page = createPage(existingPages, customName);
          
          // Verify all required metadata fields are present
          const hasId = 'id' in page;
          const hasName = 'name' in page;
          const hasCreatedAt = 'createdAt' in page;
          const hasLastModifiedAt = 'lastModifiedAt' in page;
          
          // Verify field types and valid values
          const hasValidId = typeof page.id === 'string' && page.id.length > 0;
          const hasValidName = typeof page.name === 'string' && page.name.length > 0;
          const hasValidCreatedAt = typeof page.createdAt === 'number' && 
                                    page.createdAt > 0 && 
                                    Number.isFinite(page.createdAt);
          const hasValidLastModifiedAt = typeof page.lastModifiedAt === 'number' && 
                                         page.lastModifiedAt > 0 && 
                                         Number.isFinite(page.lastModifiedAt);
          
          // All fields must be present and valid
          return hasId && hasName && hasCreatedAt && hasLastModifiedAt &&
                 hasValidId && hasValidName && hasValidCreatedAt && hasValidLastModifiedAt;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 23: New Page Initialization
   * 
   * For any new page created via the New Page button, the page should be
   * initialized with default settings: grid background, empty strokes
   * array, and a default name.
   * 
   * **Validates: Requirements 10.2, 10.4**
   */
  it('Property 23: should initialize new pages with default settings', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // Number of existing pages
        (existingPageCount) => {
          // Create a record of existing pages
          const existingPages: Record<string, Page> = {};
          
          for (let i = 0; i < existingPageCount; i++) {
            const page = createPage({}, `Existing Page ${i + 1}`);
            existingPages[page.id] = page;
          }
          
          // Create a new page (simulating New Page button click)
          const newPage = createPage(existingPages);
          
          // Verify default settings
          const hasPlainBackground = newPage.backgroundStyle === PAGE_CONSTANTS.DEFAULT_BACKGROUND;
          const hasEmptyStrokes = Array.isArray(newPage.strokes) && newPage.strokes.length === 0;
          const hasDefaultName = newPage.name.startsWith(PAGE_CONSTANTS.DEFAULT_PAGE_NAME);
          
          return hasPlainBackground && hasEmptyStrokes && hasDefaultName;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 23: should initialize with grid background style', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const page = createPage();
          return page.backgroundStyle === 'grid';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 23: should initialize with empty strokes array', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const page = createPage();
          return Array.isArray(page.strokes) && page.strokes.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 23: should initialize with default name format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        (existingCount) => {
          const existingPages: Record<string, Page> = {};
          
          for (let i = 0; i < existingCount; i++) {
            const page = createPage({}, `Page ${i}`);
            existingPages[page.id] = page;
          }
          
          const page = createPage(existingPages);
          const expectedName = `Untitled Page ${existingCount + 1}`;
          
          return page.name === expectedName;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 23: should initialize all required metadata fields', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const page = createPage();
          
          // Verify all required fields are present and valid
          const hasValidId = typeof page.id === 'string' && page.id.length > 0;
          const hasValidName = typeof page.name === 'string' && page.name.length > 0;
          const hasValidCreatedAt = typeof page.createdAt === 'number' && page.createdAt > 0;
          const hasValidLastModifiedAt = typeof page.lastModifiedAt === 'number' && page.lastModifiedAt > 0;
          const hasThumbnailField = typeof page.thumbnail === 'string';
          
          return hasValidId && hasValidName && hasValidCreatedAt && 
                 hasValidLastModifiedAt && hasThumbnailField;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 23: should initialize with matching creation and modification timestamps', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const page = createPage();
          
          // For a new page, createdAt and lastModifiedAt should be the same
          return page.createdAt === page.lastModifiedAt;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 23: should initialize with empty thumbnail string', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const page = createPage();
          
          // New pages should have empty thumbnail (generated later when saved)
          return page.thumbnail === '';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 23: should maintain default settings regardless of existing pages', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            backgroundStyle: fc.constantFrom('plain', 'ruled', 'dotted', 'grid'),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (existingPagesData) => {
          // Create existing pages with various settings
          const existingPages: Record<string, Page> = {};
          
          for (const data of existingPagesData) {
            const page = createPage({}, data.name);
            // Modify background to test that new page still gets default
            page.backgroundStyle = data.backgroundStyle;
            existingPages[page.id] = page;
          }
          
          // Create new page
          const newPage = createPage(existingPages);
          
          // Should still have default settings regardless of existing pages
          return newPage.backgroundStyle === 'grid' && 
                 newPage.strokes.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
