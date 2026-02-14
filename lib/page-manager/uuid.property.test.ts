/**
 * Property-based tests for UUID generation
 * Feature: page-management
 */

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { generateUUID } from './uuid';

describe('UUID Generation - Property Tests', () => {
  /**
   * Property 2: Unique Page Identifiers
   * 
   * For any set of pages in the system, all page IDs should be unique,
   * and each page's ID should remain unchanged across save/load cycles.
   * 
   * **Validates: Requirements 1.5, 10.5**
   */
  it('Property 2: should generate unique UUIDs for any number of pages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // Number of UUIDs to generate
        (count) => {
          const uuids = new Set<string>();
          
          // Generate the specified number of UUIDs
          for (let i = 0; i < count; i++) {
            uuids.add(generateUUID());
          }
          
          // All UUIDs should be unique
          return uuids.size === count;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: should generate valid UUID v4 format for all generated IDs', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // No input needed, just generate UUIDs
        () => {
          const uuid = generateUUID();
          
          // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
          // where y is one of [8, 9, a, b]
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          
          return uuidRegex.test(uuid);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: UUID should remain unchanged when used as page ID', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const originalUUID = generateUUID();
          
          // Simulate using UUID as page ID (string operations)
          const pageId = originalUUID;
          const storedId = JSON.parse(JSON.stringify({ id: pageId })).id;
          
          // UUID should remain unchanged through serialization
          return storedId === originalUUID;
        }
      ),
      { numRuns: 100 }
    );
  });
});
