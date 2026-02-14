// Type definitions for the Page Management System

import { Stroke, BackgroundStyle } from '../types';

/**
 * Represents a single drawing page with all its content and metadata
 */
export interface Page {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // User-defined name
  strokes: Stroke[];             // Array of drawing strokes
  backgroundStyle: BackgroundStyle; // Background style
  thumbnail: string;             // Base64-encoded thumbnail image
  createdAt: number;             // Unix timestamp
  lastModifiedAt: number;        // Unix timestamp
}

/**
 * Metadata for a page (used for grid display without full page data)
 */
export interface PageMetadata {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: number;
  lastModifiedAt: number;
}

/**
 * Storage structure for localStorage persistence
 */
export interface PageStorage {
  pages: Record<string, Page>;  // Map of page ID to Page
  activePageId: string | null;
  version: number;              // Schema version for migrations
}

/**
 * View state for navigation between home and drawing views
 */
export type View = 'home' | 'drawing';

export interface ViewState {
  currentView: View;
  previousView: View | null;
  activePageId: string | null;
}

/**
 * Constants for page management
 */
export const PAGE_CONSTANTS = {
  DEFAULT_PAGE_NAME: 'Untitled Page',
  DEFAULT_BACKGROUND: 'plain' as BackgroundStyle,
  THUMBNAIL_WIDTH: 300,
  THUMBNAIL_HEIGHT: 200,
  MAX_PAGE_NAME_LENGTH: 100,
  STORAGE_KEY: 'doodle-pages',
  STORAGE_VERSION: 1,
  AUTO_SAVE_DEBOUNCE_MS: 1000,
} as const;
