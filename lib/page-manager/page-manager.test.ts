/**
 * Unit tests for page manager core functions
 */

import { describe, it, expect } from 'vitest';
import { createPage, getPage, getAllPages, updatePage, deletePage } from './page-manager';
import { PAGE_CONSTANTS, Page } from './types';

describe('createPage', () => {
  it('should create a page with unique ID', () => {
    const page = createPage();
    
    expect(page.id).toBeDefined();
    expect(typeof page.id).toBe('string');
    expect(page.id.length).toBeGreaterThan(0);
  });

  it('should create a page with default name "Untitled Page 1" when no pages exist', () => {
    const page = createPage({});
    
    expect(page.name).toBe('Untitled Page 1');
  });

  it('should create a page with sequential name based on existing pages', () => {
    const existingPages = {
      'id1': createPage({}, 'Page 1'),
      'id2': createPage({}, 'Page 2'),
      'id3': createPage({}, 'Page 3'),
    };
    
    const newPage = createPage(existingPages);
    
    expect(newPage.name).toBe('Untitled Page 4');
  });

  it('should use custom name when provided', () => {
    const page = createPage({}, 'My Custom Page');
    
    expect(page.name).toBe('My Custom Page');
  });

  it('should initialize page with empty strokes array', () => {
    const page = createPage();
    
    expect(page.strokes).toEqual([]);
    expect(Array.isArray(page.strokes)).toBe(true);
  });

  it('should initialize page with default background style', () => {
    const page = createPage();
    
    expect(page.backgroundStyle).toBe(PAGE_CONSTANTS.DEFAULT_BACKGROUND);
    expect(page.backgroundStyle).toBe('grid');
  });

  it('should initialize page with empty thumbnail', () => {
    const page = createPage();
    
    expect(page.thumbnail).toBe('');
  });

  it('should set creation timestamp', () => {
    const before = Date.now();
    const page = createPage();
    const after = Date.now();
    
    expect(page.createdAt).toBeGreaterThanOrEqual(before);
    expect(page.createdAt).toBeLessThanOrEqual(after);
    expect(typeof page.createdAt).toBe('number');
  });

  it('should set lastModifiedAt timestamp equal to createdAt', () => {
    const page = createPage();
    
    expect(page.lastModifiedAt).toBe(page.createdAt);
  });

  it('should create multiple pages with unique IDs', () => {
    const page1 = createPage();
    const page2 = createPage();
    const page3 = createPage();
    
    expect(page1.id).not.toBe(page2.id);
    expect(page2.id).not.toBe(page3.id);
    expect(page1.id).not.toBe(page3.id);
  });

  it('should handle empty existing pages object', () => {
    const page = createPage({});
    
    expect(page.name).toBe('Untitled Page 1');
  });

  it('should handle undefined existing pages', () => {
    const page = createPage();
    
    expect(page.name).toBe('Untitled Page 1');
  });
});

describe('getPage', () => {
  it('should retrieve a page by ID', () => {
    const page1 = createPage({}, 'Page 1');
    const page2 = createPage({}, 'Page 2');
    const pages = {
      [page1.id]: page1,
      [page2.id]: page2,
    };
    
    const retrieved = getPage(pages, page1.id);
    
    expect(retrieved).toEqual(page1);
  });

  it('should return null for non-existent page ID', () => {
    const page1 = createPage({}, 'Page 1');
    const pages = {
      [page1.id]: page1,
    };
    
    const retrieved = getPage(pages, 'non-existent-id');
    
    expect(retrieved).toBeNull();
  });

  it('should return null for empty pages object', () => {
    const retrieved = getPage({}, 'some-id');
    
    expect(retrieved).toBeNull();
  });
});

describe('getAllPages', () => {
  it('should return metadata for all pages', () => {
    const page1 = createPage({}, 'Page 1');
    const page2 = createPage({}, 'Page 2');
    const pages = {
      [page1.id]: page1,
      [page2.id]: page2,
    };
    
    const metadata = getAllPages(pages);
    
    expect(metadata).toHaveLength(2);
    expect(metadata[0]).toEqual({
      id: page1.id,
      name: page1.name,
      thumbnail: page1.thumbnail,
      createdAt: page1.createdAt,
      lastModifiedAt: page1.lastModifiedAt,
    });
    expect(metadata[1]).toEqual({
      id: page2.id,
      name: page2.name,
      thumbnail: page2.thumbnail,
      createdAt: page2.createdAt,
      lastModifiedAt: page2.lastModifiedAt,
    });
  });

  it('should return empty array for empty pages object', () => {
    const metadata = getAllPages({});
    
    expect(metadata).toEqual([]);
  });

  it('should not include strokes or backgroundStyle in metadata', () => {
    const page = createPage({}, 'Test Page');
    const pages = { [page.id]: page };
    
    const metadata = getAllPages(pages);
    
    expect(metadata[0]).not.toHaveProperty('strokes');
    expect(metadata[0]).not.toHaveProperty('backgroundStyle');
  });
});

describe('updatePage', () => {
  it('should update page name', () => {
    const page = createPage({}, 'Old Name');
    const pages = { [page.id]: page };
    
    const updated = updatePage(pages, page.id, { name: 'New Name' });
    
    expect(updated[page.id].name).toBe('New Name');
  });

  it('should update page strokes', () => {
    const page = createPage({}, 'Test Page');
    const pages = { [page.id]: page };
    const newStrokes = [{ points: [[0, 0], [10, 10]], color: '#000000', size: 2 }];
    
    const updated = updatePage(pages, page.id, { strokes: newStrokes as any });
    
    expect(updated[page.id].strokes).toEqual(newStrokes);
  });

  it('should update page background style', () => {
    const page = createPage({}, 'Test Page');
    const pages = { [page.id]: page };
    
    const updated = updatePage(pages, page.id, { backgroundStyle: 'grid' });
    
    expect(updated[page.id].backgroundStyle).toBe('grid');
  });

  it('should refresh lastModifiedAt timestamp on update', async () => {
    const page = createPage({}, 'Test Page');
    const pages = { [page.id]: page };
    const originalTimestamp = page.lastModifiedAt;
    
    // Wait a bit to ensure timestamp changes
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const before = Date.now();
    const updated = updatePage(pages, page.id, { name: 'Updated Name' });
    const after = Date.now();
    
    expect(updated[page.id].lastModifiedAt).toBeGreaterThan(originalTimestamp);
    expect(updated[page.id].lastModifiedAt).toBeGreaterThanOrEqual(before);
    expect(updated[page.id].lastModifiedAt).toBeLessThanOrEqual(after);
  });

  it('should not change page ID', () => {
    const page = createPage({}, 'Test Page');
    const pages = { [page.id]: page };
    
    const updated = updatePage(pages, page.id, { name: 'New Name' });
    
    expect(updated[page.id].id).toBe(page.id);
  });

  it('should not change createdAt timestamp', () => {
    const page = createPage({}, 'Test Page');
    const pages = { [page.id]: page };
    const originalCreatedAt = page.createdAt;
    
    const updated = updatePage(pages, page.id, { name: 'New Name' });
    
    expect(updated[page.id].createdAt).toBe(originalCreatedAt);
  });

  it('should return original pages if page not found', () => {
    const page = createPage({}, 'Test Page');
    const pages = { [page.id]: page };
    
    const updated = updatePage(pages, 'non-existent-id', { name: 'New Name' });
    
    expect(updated).toBe(pages);
  });

  it('should update multiple fields at once', () => {
    const page = createPage({}, 'Test Page');
    const pages = { [page.id]: page };
    const newStrokes = [{ points: [[0, 0]], color: '#ff0000', size: 3 }];
    
    const updated = updatePage(pages, page.id, {
      name: 'Updated Page',
      backgroundStyle: 'dots',
      strokes: newStrokes as any,
      thumbnail: 'data:image/jpeg;base64,abc123',
    });
    
    expect(updated[page.id].name).toBe('Updated Page');
    expect(updated[page.id].backgroundStyle).toBe('dots');
    expect(updated[page.id].strokes).toEqual(newStrokes);
    expect(updated[page.id].thumbnail).toBe('data:image/jpeg;base64,abc123');
  });
});

describe('deletePage', () => {
  it('should delete a page by ID', () => {
    const page1 = createPage({}, 'Page 1');
    const page2 = createPage({}, 'Page 2');
    const pages = {
      [page1.id]: page1,
      [page2.id]: page2,
    };
    
    const updated = deletePage(pages, page1.id);
    
    expect(updated[page1.id]).toBeUndefined();
    expect(updated[page2.id]).toEqual(page2);
  });

  it('should return pages without the deleted page', () => {
    const page1 = createPage({}, 'Page 1');
    const page2 = createPage({}, 'Page 2');
    const page3 = createPage({}, 'Page 3');
    const pages = {
      [page1.id]: page1,
      [page2.id]: page2,
      [page3.id]: page3,
    };
    
    const updated = deletePage(pages, page2.id);
    
    expect(Object.keys(updated)).toHaveLength(2);
    expect(updated[page1.id]).toEqual(page1);
    expect(updated[page3.id]).toEqual(page3);
  });

  it('should handle deleting non-existent page gracefully', () => {
    const page1 = createPage({}, 'Page 1');
    const pages = { [page1.id]: page1 };
    
    const updated = deletePage(pages, 'non-existent-id');
    
    expect(updated[page1.id]).toEqual(page1);
    expect(Object.keys(updated)).toHaveLength(1);
  });

  it('should return empty object when deleting last page', () => {
    const page = createPage({}, 'Only Page');
    const pages = { [page.id]: page };
    
    const updated = deletePage(pages, page.id);
    
    expect(updated).toEqual({});
    expect(Object.keys(updated)).toHaveLength(0);
  });

  it('should not mutate original pages object', () => {
    const page1 = createPage({}, 'Page 1');
    const page2 = createPage({}, 'Page 2');
    const pages = {
      [page1.id]: page1,
      [page2.id]: page2,
    };
    
    const updated = deletePage(pages, page1.id);
    
    expect(pages[page1.id]).toEqual(page1); // Original still has page1
    expect(updated[page1.id]).toBeUndefined(); // Updated doesn't have page1
  });
});
