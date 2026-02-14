/**
 * Property-based tests for timestamp updates on page modification
 * Feature: page-management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { createPage, updatePage } from './page-manager';
import { Page } from './types';
import { Stroke, BackgroundStyle } from '../types';

describe('Timestamp Update on Modification - Property Tests', () => {
  beforeEach(() => {
    // Use fake timers to control Date.now()
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Property 20: Timestamp Update on Modification
   * 
   * For any page modification (adding strokes, changing background, renaming),
   * the lastModifiedAt timestamp should be updated to a value greater than
   * the previous timestamp.
   * 
   * **Validates: Requirements 9.2**
   */
  it('Property 20: should update lastModifiedAt when adding strokes', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            points: fc.array(
              fc.record({
                x: fc.float({ min: 0, max: 1000 }),
                y: fc.float({ min: 0, max: 1000 }),
              }),
              { minLength: 2, maxLength: 10 }
            ),
            color: fc.constantFrom('#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'),
            width: fc.integer({ min: 1, max: 20 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (strokesData) => {
          // Create initial page
          const initialTime = 1000000;
          vi.setSystemTime(initialTime);
          
          const pages: Record<string, Page> = {};
          const page = createPage(pages);
          pages[page.id] = page;
          
          const originalTimestamp = page.lastModifiedAt;
          
          // Advance time
          const updateTime = initialTime + 5000;
          vi.setSystemTime(updateTime);
          
          // Convert test data to Stroke format
          const strokes: Stroke[] = strokesData.map(s => ({
            points: s.points,
            color: s.color,
            width: s.width,
          }));
          
          // Update page with new strokes
          const updatedPages = updatePage(pages, page.id, { strokes });
          const updatedPage = updatedPages[page.id];
          
          // Verify timestamp was updated and is greater than original
          return updatedPage.lastModifiedAt > originalTimestamp;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: should update lastModifiedAt when changing background', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('plain', 'ruled', 'dotted', 'grid'),
        (newBackground: BackgroundStyle) => {
          // Create initial page
          const initialTime = 1000000;
          vi.setSystemTime(initialTime);
          
          const pages: Record<string, Page> = {};
          const page = createPage(pages);
          pages[page.id] = page;
          
          const originalTimestamp = page.lastModifiedAt;
          
          // Advance time
          const updateTime = initialTime + 3000;
          vi.setSystemTime(updateTime);
          
          // Update page with new background
          const updatedPages = updatePage(pages, page.id, { 
            backgroundStyle: newBackground 
          });
          const updatedPage = updatedPages[page.id];
          
          // Verify timestamp was updated and is greater than original
          return updatedPage.lastModifiedAt > originalTimestamp;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: should update lastModifiedAt when renaming page', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (newName) => {
          // Create initial page
          const initialTime = 1000000;
          vi.setSystemTime(initialTime);
          
          const pages: Record<string, Page> = {};
          const page = createPage(pages);
          pages[page.id] = page;
          
          const originalTimestamp = page.lastModifiedAt;
          
          // Advance time
          const updateTime = initialTime + 2000;
          vi.setSystemTime(updateTime);
          
          // Update page with new name
          const updatedPages = updatePage(pages, page.id, { name: newName });
          const updatedPage = updatedPages[page.id];
          
          // Verify timestamp was updated and is greater than original
          return updatedPage.lastModifiedAt > originalTimestamp;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: should update lastModifiedAt when updating thumbnail', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        (newThumbnail) => {
          // Create initial page
          const initialTime = 1000000;
          vi.setSystemTime(initialTime);
          
          const pages: Record<string, Page> = {};
          const page = createPage(pages);
          pages[page.id] = page;
          
          const originalTimestamp = page.lastModifiedAt;
          
          // Advance time
          const updateTime = initialTime + 4000;
          vi.setSystemTime(updateTime);
          
          // Update page with new thumbnail
          const updatedPages = updatePage(pages, page.id, { 
            thumbnail: newThumbnail 
          });
          const updatedPage = updatedPages[page.id];
          
          // Verify timestamp was updated and is greater than original
          return updatedPage.lastModifiedAt > originalTimestamp;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: should update lastModifiedAt for multiple simultaneous changes', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          backgroundStyle: fc.constantFrom('plain', 'ruled', 'dotted', 'grid'),
          strokes: fc.array(
            fc.record({
              points: fc.array(
                fc.record({
                  x: fc.float({ min: 0, max: 1000 }),
                  y: fc.float({ min: 0, max: 1000 }),
                }),
                { minLength: 2, maxLength: 5 }
              ),
              color: fc.constantFrom('#000000', '#FF0000', '#00FF00', '#0000FF'),
              width: fc.integer({ min: 1, max: 20 }),
            }),
            { minLength: 0, maxLength: 5 }
          ),
        }),
        (updates) => {
          // Create initial page
          const initialTime = 1000000;
          vi.setSystemTime(initialTime);
          
          const pages: Record<string, Page> = {};
          const page = createPage(pages);
          pages[page.id] = page;
          
          const originalTimestamp = page.lastModifiedAt;
          
          // Advance time
          const updateTime = initialTime + 6000;
          vi.setSystemTime(updateTime);
          
          // Convert strokes to proper format
          const strokes: Stroke[] = updates.strokes.map(s => ({
            points: s.points,
            color: s.color,
            width: s.width,
          }));
          
          // Update page with multiple changes
          const updatedPages = updatePage(pages, page.id, {
            name: updates.name,
            backgroundStyle: updates.backgroundStyle as BackgroundStyle,
            strokes,
          });
          const updatedPage = updatedPages[page.id];
          
          // Verify timestamp was updated and is greater than original
          return updatedPage.lastModifiedAt > originalTimestamp;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: should reflect the exact time of modification', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialTime: fc.integer({ min: 1000000, max: 2000000 }),
          timeAdvance: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ initialTime, timeAdvance, name }) => {
          // Create initial page at specific time
          vi.setSystemTime(initialTime);
          
          const pages: Record<string, Page> = {};
          const page = createPage(pages);
          pages[page.id] = page;
          
          // Advance to update time
          const updateTime = initialTime + timeAdvance;
          vi.setSystemTime(updateTime);
          
          // Update page
          const updatedPages = updatePage(pages, page.id, { name });
          const updatedPage = updatedPages[page.id];
          
          // Verify timestamp matches the exact update time
          return updatedPage.lastModifiedAt === updateTime;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: should preserve createdAt timestamp during modifications', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (newName) => {
          // Create initial page
          const initialTime = 1000000;
          vi.setSystemTime(initialTime);
          
          const pages: Record<string, Page> = {};
          const page = createPage(pages);
          pages[page.id] = page;
          
          const originalCreatedAt = page.createdAt;
          
          // Advance time
          vi.setSystemTime(initialTime + 5000);
          
          // Update page
          const updatedPages = updatePage(pages, page.id, { name: newName });
          const updatedPage = updatedPages[page.id];
          
          // Verify createdAt remains unchanged
          return updatedPage.createdAt === originalCreatedAt;
        }
      ),
      { numRuns: 100 }
    );
  });
});
