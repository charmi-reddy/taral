/**
 * Core page management functions
 */

import { Page, PageMetadata, PAGE_CONSTANTS } from './types';
import { generateUUID } from './uuid';

/**
 * Creates a new page with default values and sequential naming
 * @param existingPages Record of existing pages (used for sequential naming)
 * @param customName Optional custom name for the page
 * @returns A new Page object
 */
export function createPage(
  existingPages: Record<string, Page> = {},
  customName?: string
): Page {
  const now = Date.now();
  
  // Generate unique ID
  const id = generateUUID();
  
  // Determine page name
  let name: string;
  if (customName) {
    name = customName;
  } else {
    // Calculate sequential number based on existing pages
    const existingCount = Object.keys(existingPages).length;
    const pageNumber = existingCount + 1;
    name = `${PAGE_CONSTANTS.DEFAULT_PAGE_NAME} ${pageNumber}`;
  }
  
  // Create page with default values
  const page: Page = {
    id,
    name,
    strokes: [],
    backgroundStyle: PAGE_CONSTANTS.DEFAULT_BACKGROUND,
    thumbnail: '', // Empty thumbnail initially, will be generated when page is saved
    createdAt: now,
    lastModifiedAt: now,
  };
  
  return page;
}

/**
 * Retrieves a page by its ID
 * @param pages Record of all pages
 * @param id The page ID to retrieve
 * @returns The page if found, null otherwise
 */
export function getPage(
  pages: Record<string, Page>,
  id: string
): Page | null {
  return pages[id] ?? null;
}

/**
 * Retrieves metadata for all pages
 * @param pages Record of all pages
 * @returns Array of page metadata
 */
export function getAllPages(
  pages: Record<string, Page>
): PageMetadata[] {
  return Object.values(pages).map(page => ({
    id: page.id,
    name: page.name,
    thumbnail: page.thumbnail,
    createdAt: page.createdAt,
    lastModifiedAt: page.lastModifiedAt,
  }));
}

/**
 * Updates a page with new data and refreshes the lastModifiedAt timestamp
 * @param pages Record of all pages
 * @param id The page ID to update
 * @param updates Partial page data to update
 * @returns Updated pages record, or original if page not found
 */
export function updatePage(
  pages: Record<string, Page>,
  id: string,
  updates: Partial<Omit<Page, 'id' | 'createdAt'>>
): Record<string, Page> {
  const page = pages[id];
  
  if (!page) {
    return pages;
  }
  
  // Update the page with new data and refresh timestamp
  const updatedPage: Page = {
    ...page,
    ...updates,
    id: page.id, // Ensure ID cannot be changed
    createdAt: page.createdAt, // Ensure createdAt cannot be changed
    lastModifiedAt: Date.now(), // Always refresh timestamp on update
  };
  
  return {
    ...pages,
    [id]: updatedPage,
  };
}

/**
 * Deletes a page from the pages record
 * @param pages Record of all pages
 * @param id The page ID to delete
 * @returns Updated pages record with the page removed
 */
export function deletePage(
  pages: Record<string, Page>,
  id: string
): Record<string, Page> {
  const { [id]: _, ...remainingPages } = pages;
  return remainingPages;
}
