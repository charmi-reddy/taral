/**
 * Tests for useViewNavigation hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViewNavigation } from './useViewNavigation';

describe('useViewNavigation', () => {
  it('should initialize with home view and null values', () => {
    const { result } = renderHook(() => useViewNavigation());
    
    expect(result.current.viewState.currentView).toBe('home');
    expect(result.current.viewState.previousView).toBe(null);
    expect(result.current.viewState.activePageId).toBe(null);
  });
  
  it('should navigate to drawing view with page ID', () => {
    const { result } = renderHook(() => useViewNavigation());
    const testPageId = 'test-page-123';
    
    act(() => {
      result.current.navigateToDrawing(testPageId);
    });
    
    expect(result.current.viewState.currentView).toBe('drawing');
    expect(result.current.viewState.previousView).toBe('home');
    expect(result.current.viewState.activePageId).toBe(testPageId);
  });
  
  it('should navigate to home view and preserve activePageId', () => {
    const { result } = renderHook(() => useViewNavigation());
    const testPageId = 'test-page-456';
    
    // First navigate to drawing
    act(() => {
      result.current.navigateToDrawing(testPageId);
    });
    
    // Then navigate back to home
    act(() => {
      result.current.navigateToHome();
    });
    
    expect(result.current.viewState.currentView).toBe('home');
    expect(result.current.viewState.previousView).toBe('drawing');
    expect(result.current.viewState.activePageId).toBe(testPageId);
  });
  
  it('should preserve view state during multiple transitions', () => {
    const { result } = renderHook(() => useViewNavigation());
    const pageId1 = 'page-1';
    const pageId2 = 'page-2';
    
    // Navigate to drawing with page 1
    act(() => {
      result.current.navigateToDrawing(pageId1);
    });
    
    expect(result.current.viewState.currentView).toBe('drawing');
    expect(result.current.viewState.activePageId).toBe(pageId1);
    
    // Navigate to home
    act(() => {
      result.current.navigateToHome();
    });
    
    expect(result.current.viewState.currentView).toBe('home');
    expect(result.current.viewState.previousView).toBe('drawing');
    expect(result.current.viewState.activePageId).toBe(pageId1);
    
    // Navigate to drawing with page 2
    act(() => {
      result.current.navigateToDrawing(pageId2);
    });
    
    expect(result.current.viewState.currentView).toBe('drawing');
    expect(result.current.viewState.previousView).toBe('home');
    expect(result.current.viewState.activePageId).toBe(pageId2);
  });
  
  it('should update previousView correctly on each navigation', () => {
    const { result } = renderHook(() => useViewNavigation());
    
    // Initial state: home -> null
    expect(result.current.viewState.currentView).toBe('home');
    expect(result.current.viewState.previousView).toBe(null);
    
    // Navigate to drawing: drawing -> home
    act(() => {
      result.current.navigateToDrawing('page-1');
    });
    
    expect(result.current.viewState.currentView).toBe('drawing');
    expect(result.current.viewState.previousView).toBe('home');
    
    // Navigate to home: home -> drawing
    act(() => {
      result.current.navigateToHome();
    });
    
    expect(result.current.viewState.currentView).toBe('home');
    expect(result.current.viewState.previousView).toBe('drawing');
    
    // Navigate to drawing again: drawing -> home
    act(() => {
      result.current.navigateToDrawing('page-2');
    });
    
    expect(result.current.viewState.currentView).toBe('drawing');
    expect(result.current.viewState.previousView).toBe('home');
  });
  
  it('should handle navigating to home from home view', () => {
    const { result } = renderHook(() => useViewNavigation());
    
    // Already in home view
    expect(result.current.viewState.currentView).toBe('home');
    
    // Navigate to home again
    act(() => {
      result.current.navigateToHome();
    });
    
    expect(result.current.viewState.currentView).toBe('home');
    expect(result.current.viewState.previousView).toBe('home');
    expect(result.current.viewState.activePageId).toBe(null);
  });
  
  it('should handle navigating to drawing multiple times with different pages', () => {
    const { result } = renderHook(() => useViewNavigation());
    
    // Navigate to drawing with page 1
    act(() => {
      result.current.navigateToDrawing('page-1');
    });
    
    expect(result.current.viewState.activePageId).toBe('page-1');
    
    // Navigate to drawing with page 2 (without going to home first)
    act(() => {
      result.current.navigateToDrawing('page-2');
    });
    
    expect(result.current.viewState.currentView).toBe('drawing');
    expect(result.current.viewState.previousView).toBe('drawing');
    expect(result.current.viewState.activePageId).toBe('page-2');
  });
});
