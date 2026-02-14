/**
 * Tests for UUID generation utility
 */

import { describe, it, expect } from 'vitest';
import { generateUUID } from './uuid';

describe('UUID Generation', () => {
  it('should generate a valid UUID format', () => {
    const uuid = generateUUID();
    
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    expect(uuid).toMatch(uuidRegex);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    const uuid3 = generateUUID();
    
    expect(uuid1).not.toBe(uuid2);
    expect(uuid2).not.toBe(uuid3);
    expect(uuid1).not.toBe(uuid3);
  });

  it('should generate UUIDs with correct length', () => {
    const uuid = generateUUID();
    
    // UUID format is 36 characters (32 hex + 4 hyphens)
    expect(uuid).toHaveLength(36);
  });

  it('should generate many unique UUIDs', () => {
    const uuids = new Set<string>();
    const count = 1000;
    
    for (let i = 0; i < count; i++) {
      uuids.add(generateUUID());
    }
    
    // All UUIDs should be unique
    expect(uuids.size).toBe(count);
  });
});
