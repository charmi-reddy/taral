/**
 * Property-based tests for page naming
 * Feature: page-management
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createPage } from './page-manager';
import { Page } from './types';

describe('Page Naming - Property Tests', () => {
  /**
   * Property 3: Sequential Default Naming
   * 
   * For any number N of existing pages, creating a new page should assign it
   * a default name in the format "Untitled Page M" where M = N + 1.
   * 
   * **Validates: Requirements 1.1, 2.1**
   */
  it('Property 3: should assign sequential default names based on existing page count', () => {
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
          
          // Create a new page without custom name
          const newPage = createPage(existingPages);
          
          // Expected name should be "Untitled Page M" where M = N + 1
          const expectedNumber = existingPageCount + 1;
          const expectedName = `Untitled Page ${expectedNumber}`;
          
          return newPage.name === expectedName;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: should maintain sequential naming across multiple page creations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Number of pages to create sequentially
        (pageCount) => {
          const pages: Record<string, Page> = {};
          
          // Create pages one by one and verify sequential naming
          for (let i = 0; i < pageCount; i++) {
            const newPage = createPage(pages);
            const expectedName = `Untitled Page ${i + 1}`;
            
            // Verify the name is correct
            if (newPage.name !== expectedName) {
              return false;
            }
            
            // Add the page to the collection
            pages[newPage.id] = newPage;
          }
          
          // All pages should have sequential names
          return Object.keys(pages).length === pageCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: should start at 1 when no pages exist', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // No input needed
        () => {
          // Create a page with no existing pages
          const page = createPage({});
          
          // Should be "Untitled Page 1"
          return page.name === 'Untitled Page 1';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: should not affect custom-named pages in the count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }), // Number of existing pages
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }), // Custom names
        (existingCount, customNames) => {
          // Create existing pages with custom names
          const existingPages: Record<string, Page> = {};
          
          for (let i = 0; i < existingCount; i++) {
            const customName = customNames[i % customNames.length];
            const page = createPage({}, customName);
            existingPages[page.id] = page;
          }
          
          // Create a new page without custom name
          const newPage = createPage(existingPages);
          
          // Should still follow sequential numbering based on count
          const expectedName = `Untitled Page ${existingCount + 1}`;
          
          return newPage.name === expectedName;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: sequential naming should be independent of page IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 30 }), // Number of existing pages
        (existingCount) => {
          // Create pages with random IDs (via createPage)
          const existingPages: Record<string, Page> = {};
          
          for (let i = 0; i < existingCount; i++) {
            const page = createPage({}, `Random Name ${Math.random()}`);
            existingPages[page.id] = page;
          }
          
          // Create new page
          const newPage = createPage(existingPages);
          
          // Name should be based on count, not IDs
          const expectedName = `Untitled Page ${existingCount + 1}`;
          
          return newPage.name === expectedName;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: should handle empty existing pages object', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const page = createPage({});
          return page.name === 'Untitled Page 1';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: should handle undefined existing pages', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const page = createPage();
          return page.name === 'Untitled Page 1';
        }
      ),
      { numRuns: 100 }
    );
  });
});
