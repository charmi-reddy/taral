/**
 * Unit tests for page manager core functions
 */

import { describe, it, expect } from 'vitest';
import { createPage } from './page-manager';
import { PAGE_CONSTANTS } from './types';

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
    expect(page.backgroundStyle).toBe('plain');
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
