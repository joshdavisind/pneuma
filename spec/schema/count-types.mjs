#!/usr/bin/env node
/**
 * Count Pneuma type enum values from the JSON Schema.
 * Source of truth for type counts in the spec.
 *
 * Usage: node count-types.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(join(__dir, 'pneuma-v1.schema.json'), 'utf8'));

const defs = schema.$defs;

const categories = {
  'Event Types': 'EventType',
  'Relationship Types': 'RelationshipType',
  'View Modes': 'ViewMode',
  'Layout Modes': 'LayoutMode',
};

let total = 0;

console.log('\nPneuma Type Count — from pneuma-v1.schema.json\n');
console.log('─'.repeat(55));

for (const [label, defName] of Object.entries(categories)) {
  const def = defs[defName];
  if (!def || !def.enum) {
    console.log(`  ${label.padEnd(40)} [missing $def: ${defName}]`);
    continue;
  }
  const count = def.enum.length;
  total += count;
  console.log(`  ${label.padEnd(40)} ${String(count).padStart(4)}   ${def.enum.join(', ')}`);
}

console.log('─'.repeat(55));
console.log(`  ${'TOTAL'.padEnd(40)} ${String(total).padStart(4)}`);
console.log();
