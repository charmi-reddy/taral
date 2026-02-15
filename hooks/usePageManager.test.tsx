/**
 * Unit tests for usePageManager hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePageManager } from './usePageManager';
import { PAGE_CONSTANTS } from '../lib/page-manager/types';
import * as storage from '../lib/page-manager/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('usePageManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllTimers();
    vi.clearAllMocks();
  });
  
  describe('Initialization', () => {
    it('should initialize with empty state when no data in localStorage', async () => {
      const { result } = renderHook(() => usePageManager());
      
      await waitFor(() => {
        expect(result.current.pages).toEqual({});
        expect(result.current.activePageId).toBeNull();
        expect(result.current.storageError).toBeNull();
      });
    });
  });
  
  describe('Page Creation', () => {
    it('should create a new page with default name', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage();
      });
      
      expect(newPage).toBeDefined();
      expect(newPage!.name).toBe('Untitled Page 1');
      expect(newPage!.strokes).toEqual([]);
      expect(newPage!.backgroundStyle).toBe('plain');
      expect(newPage!.thumbnail).toBe(''); // Empty initially
      expect(result.current.pages[newPage!.id]).toEqual(newPage);
    });
    
    it('should create a new page with custom name', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('My Drawing');
      });
      
      expect(newPage!.name).toBe('My Drawing');
    });
    
    it('should create pages with sequential default names', () => {
      const { result } = renderHook(() => usePageManager());
      
      let page1, page2, page3;
      act(() => {
        page1 = result.current.createNewPage();
      });
      act(() => {
        page2 = result.current.createNewPage();
      });
      act(() => {
        page3 = result.current.createNewPage();
      });
      
      expect(page1!.name).toBe('Untitled Page 1');
      expect(page2!.name).toBe('Untitled Page 2');
      expect(page3!.name).toBe('Untitled Page 3');
    });
  });
  
  describe('Page Retrieval', () => {
    it('should retrieve a page by ID', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Test Page');
      });
      
      const retrieved = result.current.getPageById(newPage!.id);
      expect(retrieved).toEqual(newPage);
    });
    
    it('should return null for non-existent page ID', () => {
      const { result } = renderHook(() => usePageManager());
      
      const retrieved = result.current.getPageById('non-existent-id');
      expect(retrieved).toBeNull();
    });
    
    it('should get all page metadata', () => {
      const { result } = renderHook(() => usePageManager());
      
      act(() => {
        result.current.createNewPage('Page 1');
        result.current.createNewPage('Page 2');
      });
      
      const metadata = result.current.getAllPageMetadata();
      expect(metadata).toHaveLength(2);
      expect(metadata[0].name).toBe('Page 1');
      expect(metadata[1].name).toBe('Page 2');
    });
  });
  
  describe('Page Updates', () => {
    it('should update page name', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Old Name');
      });
      
      act(() => {
        result.current.updatePageData(newPage!.id, { name: 'New Name' });
      });
      
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.name).toBe('New Name');
    });
    
    it('should update page strokes', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage();
      });
      
      const testStrokes = [
        { points: [{ x: 0, y: 0 }], color: '#000000', size: 2 },
      ];
      
      act(() => {
        result.current.updatePageData(newPage!.id, { strokes: testStrokes as any });
      });
      
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.strokes).toEqual(testStrokes);
    });
    
    it('should update lastModifiedAt timestamp on update', async () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage();
      });
      
      const originalTimestamp = newPage!.lastModifiedAt;
      
      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));
      
      act(() => {
        result.current.updatePageData(newPage!.id, { name: 'Updated' });
      });
      
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.lastModifiedAt).toBeGreaterThan(originalTimestamp);
    });
  });
  
  describe('Page Name Updates', () => {
    it('should update page name with valid name', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Old Name');
      });
      
      let success;
      act(() => {
        success = result.current.updatePageName(newPage!.id, 'New Name');
      });
      
      expect(success).toBe(true);
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.name).toBe('New Name');
    });
    
    it('should reject empty name', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Original Name');
      });
      
      let success;
      act(() => {
        success = result.current.updatePageName(newPage!.id, '');
      });
      
      expect(success).toBe(false);
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.name).toBe('Original Name');
    });
    
    it('should reject whitespace-only name', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Original Name');
      });
      
      let success;
      act(() => {
        success = result.current.updatePageName(newPage!.id, '   ');
      });
      
      expect(success).toBe(false);
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.name).toBe('Original Name');
    });
    
    it('should reject name exceeding 100 characters', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Original Name');
      });
      
      const longName = 'a'.repeat(101);
      let success;
      act(() => {
        success = result.current.updatePageName(newPage!.id, longName);
      });
      
      expect(success).toBe(false);
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.name).toBe('Original Name');
    });
    
    it('should accept name with exactly 100 characters', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Original Name');
      });
      
      const maxLengthName = 'a'.repeat(100);
      let success;
      act(() => {
        success = result.current.updatePageName(newPage!.id, maxLengthName);
      });
      
      expect(success).toBe(true);
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.name).toBe(maxLengthName);
    });
    
    it('should accept name with leading/trailing spaces if not all whitespace', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Original Name');
      });
      
      let success;
      act(() => {
        success = result.current.updatePageName(newPage!.id, '  Valid Name  ');
      });
      
      expect(success).toBe(true);
      const updated = result.current.getPageById(newPage!.id);
      expect(updated!.name).toBe('  Valid Name  ');
    });
  });
  
  describe('Page Deletion', () => {
    it('should delete a page', async () => {
      const { result } = renderHook(() => usePageManager());
      
      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.pages).toBeDefined();
      });
      
      // Verify we start with empty pages (localStorage was cleared in beforeEach)
      const initialPageCount = Object.keys(result.current.pages).length;
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage();
      });
      
      // Should have one more page now
      expect(Object.keys(result.current.pages)).toHaveLength(initialPageCount + 1);
      
      act(() => {
        result.current.deletePageById(newPage!.id);
      });
      
      expect(result.current.getPageById(newPage!.id)).toBeNull();
      // Should be back to initial count
      expect(Object.keys(result.current.pages)).toHaveLength(initialPageCount);
    });
    
    it('should clear activePageId when deleting active page', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage();
        result.current.setActivePageId(newPage!.id);
      });
      
      expect(result.current.activePageId).toBe(newPage!.id);
      
      act(() => {
        result.current.deletePageById(newPage!.id);
      });
      
      expect(result.current.activePageId).toBeNull();
    });
    
    it('should not clear activePageId when deleting non-active page', () => {
      const { result } = renderHook(() => usePageManager());
      
      let page1, page2;
      act(() => {
        page1 = result.current.createNewPage();
        page2 = result.current.createNewPage();
        result.current.setActivePageId(page1!.id);
      });
      
      act(() => {
        result.current.deletePageById(page2!.id);
      });
      
      expect(result.current.activePageId).toBe(page1!.id);
    });
  });
  
  describe('Active Page Management', () => {
    it('should set active page ID', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage();
        result.current.setActivePageId(newPage!.id);
      });
      
      expect(result.current.activePageId).toBe(newPage!.id);
    });
    
    it('should get active page', () => {
      const { result } = renderHook(() => usePageManager());
      
      let newPage;
      act(() => {
        newPage = result.current.createNewPage('Active Page');
        result.current.setActivePageId(newPage!.id);
      });
      
      const activePage = result.current.getActivePage();
      expect(activePage).toEqual(newPage);
    });
    
    it('should return null when no active page is set', () => {
      const { result } = renderHook(() => usePageManager());
      
      const activePage = result.current.getActivePage();
      expect(activePage).toBeNull();
    });
  });
  
  describe('Auto-save', () => {
    it('should debounce multiple rapid changes', async () => {
      vi.useFakeTimers();
      const saveSpy = vi.spyOn(storage, 'saveToLocalStorage');
      
      const { result } = renderHook(() => usePageManager());
      
      // Wait for initial load
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      
      saveSpy.mockClear(); // Clear any calls from initial load
      
      let page;
      act(() => {
        page = result.current.createNewPage();
      });
      
      // Make multiple rapid updates
      act(() => {
        result.current.updatePageData(page!.id, { name: 'Name 1' });
      });
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      
      act(() => {
        result.current.updatePageData(page!.id, { name: 'Name 2' });
      });
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      
      act(() => {
        result.current.updatePageData(page!.id, { name: 'Name 3' });
      });
      
      // Fast-forward past debounce delay
      await act(async () => {
        await vi.advanceTimersByTimeAsync(PAGE_CONSTANTS.AUTO_SAVE_DEBOUNCE_MS);
      });
      
      // Should have saved only once after all the updates
      expect(saveSpy).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });
  });
  
  describe('Immediate Save', () => {
    it('should call saveToLocalStorage when saveNow is called', () => {
      const saveSpy = vi.spyOn(storage, 'saveToLocalStorage');
      const { result } = renderHook(() => usePageManager());
      
      act(() => {
        result.current.createNewPage('Test Page');
        result.current.saveNow();
      });
      
      // Should have called save function
      expect(saveSpy).toHaveBeenCalled();
    });
  });
  
  describe('Error Handling', () => {
    it('should set storageError when save fails', () => {
      const { result } = renderHook(() => usePageManager());
      
      // Mock saveToLocalStorage to return an error
      const saveSpy = vi.spyOn(storage, 'saveToLocalStorage').mockReturnValue({
        success: false,
        error: {
          type: storage.StorageErrorType.QUOTA_EXCEEDED,
          message: 'Quota exceeded',
        },
      });
      
      act(() => {
        result.current.createNewPage();
        result.current.saveNow();
      });
      
      expect(result.current.storageError).toBeDefined();
      expect(result.current.storageError!.type).toBe('QUOTA_EXCEEDED');
      
      saveSpy.mockRestore();
    });
  });
});
