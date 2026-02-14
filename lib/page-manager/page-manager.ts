/**
 * Core page management functions
 */

import { Page, PAGE_CONSTANTS } from './types';
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
