#!/usr/bin/env node
/**
 * Pneuma v1 Schema Validator
 *
 * Usage:
 *   node validate.mjs <model.json>
 *
 * Exit codes:
 *   0 — valid (errors: 0, warnings may be present)
 *   1 — invalid (one or more errors)
 *
 * Checks performed:
 *
 *   ERRORS (exit 1):
 *   0. Version compatibility    — model's pneuma major version matches this schema (v1.x)
 *   1. Schema validation        — model conforms to pneuma-v1.schema.json
 *   2. Unique event IDs         — no duplicate event IDs
 *   3. Unique relationship IDs  — no duplicate relationship IDs
 *   4. Unique view IDs          — no duplicate view IDs
 *   5. Relationship integrity   — all source/target event IDs exist
 *   6. Layer reference integrity— every event.layerId references a real layer
 *   7. Date consistency         — endDate >= startDate for span/task; endDate absent for milestone/deadline
 *
 *   WARNINGS (exit 0):
 *   8. Orphan events            — events unreferenced by any relationship or view (info only)
 *   9. Impact range             — impact values outside 1–10 (schema enforces this too, belt-and-suspenders)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __dir = dirname(fileURLToPath(import.meta.url));

const [,, modelPath] = process.argv;

if (!modelPath) {
  console.error('Usage: node validate.mjs <model.json>');
  process.exit(1);
}

// Load schema and model
const schema = JSON.parse(readFileSync(join(__dir, 'pneuma-v1.schema.json'), 'utf8'));
let model;
try {
  model = JSON.parse(readFileSync(modelPath, 'utf8'));
} catch (e) {
  console.error(`❌ Failed to parse ${modelPath}: ${e.message}`);
  process.exit(1);
}

// JSON Schema validation
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const schemaValid = validate(model);

let errors = 0;
let warnings = 0;

if (!schemaValid) {
  console.error('❌ Schema validation failed:');
  for (const e of validate.errors) {
    console.error(`  ${e.instancePath || '/'} — ${e.message} ${JSON.stringify(e.params)}`);
    errors++;
  }
} else {
  console.log('✅ Schema validation passed');
}

// Collect model elements
const layers = model.layers || [];
const events = model.events || [];
const relationships = model.relationships || [];
const views = model.views || [];

// 0. Version compatibility check
const SCHEMA_MAJOR = 1;
if (model.pneuma) {
  const [major] = model.pneuma.split('.').map(Number);
  if (isNaN(major)) {
    console.error(`❌ Invalid pneuma version format: "${model.pneuma}" — expected MAJOR.MINOR (e.g., "1.0")`);
    errors++;
  } else if (major !== SCHEMA_MAJOR) {
    console.error(`❌ Version mismatch: model declares pneuma "${model.pneuma}" but this schema validates v${SCHEMA_MAJOR}.x only`);
    errors++;
  } else {
    console.log(`✅ Version check passed (${model.pneuma} compatible with schema v${SCHEMA_MAJOR}.x)`);
  }
}

// 1. Build layer ID set
const layerIds = new Set(layers.map(l => l.id));

// 2. Unique event IDs
const eventIds = new Set();
for (const event of events) {
  if (eventIds.has(event.id)) {
    console.error(`❌ Duplicate event ID: "${event.id}"`);
    errors++;
  }
  eventIds.add(event.id);
}
if (errors === 0) console.log(`✅ Unique event IDs (${events.length} events)`);

// 3. Unique relationship IDs
const relIds = new Set();
for (const rel of relationships) {
  if (relIds.has(rel.id)) {
    console.error(`❌ Duplicate relationship ID: "${rel.id}"`);
    errors++;
  }
  relIds.add(rel.id);
}
if (relationships.length > 0) console.log(`✅ Unique relationship IDs (${relationships.length} relationships)`);

// 4. Unique view IDs
const viewIds = new Set();
for (const view of views) {
  if (viewIds.has(view.id)) {
    console.error(`❌ Duplicate view ID: "${view.id}"`);
    errors++;
  }
  viewIds.add(view.id);
}
if (views.length > 0) console.log(`✅ Unique view IDs (${views.length} views)`);

// 5. Relationship integrity — source/target must exist
for (const rel of relationships) {
  if (!eventIds.has(rel.source)) {
    console.error(`❌ Relationship "${rel.id}" references unknown source event: "${rel.source}"`);
    errors++;
  }
  if (!eventIds.has(rel.target)) {
    console.error(`❌ Relationship "${rel.id}" references unknown target event: "${rel.target}"`);
    errors++;
  }
}

// 6. Layer reference integrity — every event.layerId must reference a real layer
for (const event of events) {
  if (!layerIds.has(event.layerId)) {
    console.error(`❌ Event "${event.id}" references unknown layerId: "${event.layerId}"`);
    errors++;
  }
}
if (errors === 0) console.log(`✅ Layer reference integrity (all events reference known layers)`);

// 7. Date consistency
for (const event of events) {
  const hasDuration = event.type === 'span' || event.type === 'task';
  const isPoint = event.type === 'milestone' || event.type === 'deadline';

  if (hasDuration) {
    if (!event.endDate) {
      console.error(`❌ Event "${event.id}" (type: ${event.type}) requires endDate`);
      errors++;
    } else {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      if (end < start) {
        console.error(`❌ Event "${event.id}": endDate (${event.endDate}) is before startDate (${event.startDate})`);
        errors++;
      }
    }
  }

  if (isPoint && event.endDate) {
    console.error(`❌ Event "${event.id}" (type: ${event.type}) must not have endDate — point events have a single date`);
    errors++;
  }
}
if (errors === 0) console.log(`✅ Date consistency (all events have valid date fields for their type)`);

// 8. Orphan events (warning only) — events not referenced by any relationship or view
{
  const referenced = new Set();
  for (const rel of relationships) {
    referenced.add(rel.source);
    referenced.add(rel.target);
  }
  for (const view of views) {
    // Views can reference layers, which implicitly include events.
    // We only flag events not in any relationship as orphans.
    // This is informative — not an error.
  }
  for (const event of events) {
    if (!referenced.has(event.id) && relationships.length > 0) {
      console.warn(`⚠️  Orphan event: "${event.id}" (not referenced by any relationship)`);
      warnings++;
    }
  }
}

// 9. Impact range sanity check (belt-and-suspenders — schema already enforces 1–10)
for (const event of events) {
  if (event.impact !== undefined && (event.impact < 1 || event.impact > 10)) {
    console.warn(`⚠️  Event "${event.id}" has impact ${event.impact} — out of range 1–10`);
    warnings++;
  }
}

// Summary
console.log('');
console.log(`Layers: ${layers.length} | Events: ${events.length} | Relationships: ${relationships.length} | Views: ${views.length}`);
console.log(`Result: ${errors} errors, ${warnings} warnings`);
process.exit(errors > 0 ? 1 : 0);
