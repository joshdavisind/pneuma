# Pneuma v1 Specification

**Version:** 1.0.0-draft  
**Status:** Pre-release — pending community review  
**Schema:** [`schema/pneuma-v1.schema.json`](schema/pneuma-v1.schema.json)

---

## Table of Contents

1. [Introduction & Design Goals](#1-introduction--design-goals)
2. [Model Structure](#2-model-structure)
3. [Layers](#3-layers)
4. [Events](#4-events)
5. [Relationships](#5-relationships)
6. [Views](#6-views)
7. [Metadata](#7-metadata)
8. [Layout Modes](#8-layout-modes)
9. [Schema Validation](#9-schema-validation)
10. [Extension Points](#10-extension-points)
11. [Conformance Levels](#11-conformance-levels)
- [Appendix A: Type Summary](#appendix-a-type-summary)

---

## §1 Introduction & Design Goals

**Pneuma** is an open, portable JSON standard for timeline diagrams. It defines a formal data model for communicating project timelines, product roadmaps, and cross-functional plans in a way that is:

- **Renderer-agnostic** — any tool can render a valid Pneuma model
- **Tool-agnostic** — not tied to any SaaS platform or file format
- **Human-readable** — JSON that a developer can write and understand directly
- **Machine-validatable** — every model is checkable against a JSON Schema
- **Collaboration-aware** — first-class view modes for different audiences (author, team, stakeholder)

### Origin

Pneuma formalizes the Moirai DSL — a timeline data model built for the Gaia diagramming platform. Rather than keeping this model proprietary, Pneuma extracts it into an open standard so any renderer, import tool, or export pipeline can interoperate.

### Design Goals

| Goal | Implementation |
|------|---------------|
| Portable between tools | Plain JSON, no vendor-specific fields |
| Audience-appropriate output | `mode` field on views (author / team / present) |
| Layer-based organization | Named swimlanes with color identity |
| Semantic event types | `milestone`, `deadline`, `span`, `task` — each with clear date semantics |
| Explicit dependencies | `relationships` array with typed edges |
| Extendable without breakage | `x_` prefix for custom fields; `metadata` escape hatch on events |
| Deterministic rendering | Same JSON → same output for a given renderer |

---

## §2 Model Structure

A Pneuma model is a single JSON object with the following top-level fields:

```json
{
  "pneuma": "1.0",
  "metadata": { ... },
  "layers": [ ... ],
  "events": [ ... ],
  "relationships": [ ... ],
  "views": [ ... ]
}
```

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pneuma` | string | ✅ | Spec version (`MAJOR.MINOR`, e.g. `"1.0"`). Must be `1.x` for this schema. |
| `metadata` | object | ✅ | Model title, description, authors, tags |
| `layers` | array | ✅ | One or more named swimlanes |
| `events` | array | ✅ | All events in the model |
| `relationships` | array | — | Dependency and reference edges between events |
| `views` | array | — | Named audience-specific views |

The `relationships` and `views` fields are optional. A minimal valid Pneuma model has only `pneuma`, `metadata`, `layers`, and `events`.

### Version Field

The `"pneuma"` field uses `MAJOR.MINOR` format. Patch releases (editorial only) do not require a version bump in the model file. See §9 for validation details.

---

## §3 Layers

Layers are named swimlanes that group events by concern — for example, by team, workstream, or phase. Every event belongs to exactly one layer.

### Layer Schema

```json
{
  "id": "engineering",
  "label": "Engineering",
  "color": "#0ea5e9",
  "visibility": ["author", "team", "present"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier. Alphanumeric, hyphens, underscores, dots. |
| `label` | string | ✅ | Human-readable display name |
| `color` | string | ✅ | Hex color (`#rrggbb`) or CSS named color for visual identity |
| `visibility` | array of ViewMode | — | Which view modes show this layer. Default: all three modes. |

### Layer IDs

Layer IDs follow the same pattern as event IDs: `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$`. Use short, stable identifiers — they are referenced by every event in the layer.

### Layer Visibility

The `visibility` array controls which view modes include this layer. If omitted, the layer appears in all modes.

```json
{
  "id": "internal-notes",
  "label": "Internal Notes",
  "color": "#94a3b8",
  "visibility": ["author"]
}
```

In the example above, the layer appears only in `author` mode — it is hidden from `team` and `present` views.

---

## §4 Events

Events are the core content of a Pneuma model. There are four event types with distinct date semantics.

### Event Types

| Type | Point / Range | startDate | endDate | Use for |
|------|--------------|-----------|---------|---------|
| `milestone` | Point | ✅ Required | ❌ Must not have | Significant achievements, decisions, releases |
| `deadline` | Point | ✅ Required | ❌ Must not have | Hard external commitments, cutoff dates |
| `span` | Range | ✅ Required | ✅ Required | Phases, initiatives with natural boundaries |
| `task` | Range | ✅ Required | ✅ Required | Concrete work items with start and end |

**Date rule:** `endDate >= startDate` for span and task types. The validator enforces this.

### Event Schema

```json
{
  "id": "eng-alpha",
  "label": "Alpha Build",
  "type": "span",
  "layerId": "engineering",
  "startDate": "2026-02-09",
  "endDate": "2026-03-27",
  "impact": 10,
  "notes": "Core platform: spaces, diagram creation, renderers, share links."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier within the model |
| `label` | string | ✅ | Display name |
| `type` | EventType | ✅ | `milestone`, `deadline`, `span`, or `task` |
| `layerId` | string | ✅ | ID of the layer this event belongs to |
| `startDate` | date | ✅ | ISO 8601 date (`YYYY-MM-DD`) |
| `endDate` | date | Conditional | Required for `span`/`task`. Must be absent for `milestone`/`deadline`. |
| `impact` | integer 1–10 | — | Relative importance. Default 5. Used by renderers for visual weight. |
| `notes` | string | — | Free-form description or context |
| `metadata` | object | — | Arbitrary extension fields — see §10 |

### Event ID Format

`^[a-zA-Z0-9][a-zA-Z0-9_.-]*$` — alphanumeric start, then alphanumeric, underscores, hyphens, or dots. IDs must be unique across all events in the model.

### milestone

A point-in-time achievement. Rendered as a diamond or vertical marker.

```json
{
  "id": "v1-release",
  "label": "v1.0 Release",
  "type": "milestone",
  "layerId": "engineering",
  "startDate": "2026-04-15",
  "impact": 10
}
```

### deadline

A hard external date. Rendered distinctly from a milestone — typically as a flag or warning marker — to communicate that it is a constraint, not an achievement.

```json
{
  "id": "board-deadline",
  "label": "Board Presentation Cutoff",
  "type": "deadline",
  "layerId": "discovery",
  "startDate": "2026-03-31",
  "impact": 9
}
```

### span

A phase or initiative with defined start and end. Rendered as a horizontal bar.

```json
{
  "id": "beta-phase",
  "label": "Closed Beta",
  "type": "span",
  "layerId": "engineering",
  "startDate": "2026-04-01",
  "endDate": "2026-05-31",
  "impact": 8
}
```

### task

A concrete work item. Semantically equivalent to `span` but with stronger connotation that it is assigned and tracked. Renderers may style tasks differently from spans (e.g., striped fill vs. solid).

```json
{
  "id": "repo-setup",
  "label": "Repo Scaffold & CI",
  "type": "task",
  "layerId": "engineering",
  "startDate": "2026-01-12",
  "endDate": "2026-01-23",
  "impact": 6
}
```

---

## §5 Relationships

Relationships express directed or semantic connections between events. They are optional — a valid Pneuma model may have no relationships.

### Relationship Types

| Type | Category | Directed | Meaning |
|------|----------|----------|---------|
| `depends_on` | Dependency | ✅ | Source cannot start or complete until target is done |
| `triggers` | Dependency | ✅ | Completion of source initiates or enables target |
| `blocks` | Constraint | ✅ | Source prevents target from proceeding |
| `informs` | Reference | — | Source provides context or input for target (informational, not a hard dependency) |

**Directed** means the edge has a clear source → target semantic. `informs` is listed as undirected because the insight or input flows between both events without a strict prerequisite relationship, though the JSON still has `source` and `target` fields.

### Relationship Schema

```json
{
  "id": "rel-prd-to-alpha",
  "type": "triggers",
  "source": "disco-spec-deadline",
  "target": "eng-alpha",
  "label": "PRD triggers alpha sprint"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier within the model |
| `type` | RelationshipType | ✅ | `depends_on`, `triggers`, `blocks`, or `informs` |
| `source` | string | ✅ | Source event ID |
| `target` | string | ✅ | Target event ID |
| `label` | string | — | Optional human-readable edge label |

### Integrity Constraint

Every `source` and `target` must reference an event ID that exists in the `events` array. The validator enforces this (Check 5).

---

## §6 Views

Views let you define audience-specific cuts of the model. A view selects which layers to show and optionally restricts the date window.

### View Schema

```json
{
  "id": "view-present",
  "label": "Stakeholder View",
  "mode": "present",
  "layers": ["engineering", "marketing"],
  "dateRange": {
    "start": "2026-02-01",
    "end": "2026-06-30"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `label` | string | ✅ | Human-readable name |
| `mode` | ViewMode | ✅ | `author`, `team`, or `present` |
| `layers` | array of string | — | Layer IDs to include. Default: all layers. |
| `dateRange` | object | — | Optional date window: `{ "start": "...", "end": "..." }` |

### View Modes

| Mode | Audience | Typical Content |
|------|----------|----------------|
| `author` | Individual contributor | All layers, all events, all notes — full working detail |
| `team` | Internal cross-functional team | All layers visible, focus on coordination and progress |
| `present` | External stakeholders / executives | Curated layers, clean labels, key milestones and deadlines only |

View modes interact with layer visibility (§3). A layer with `"visibility": ["author"]` will be excluded from `team` and `present` views regardless of whether it appears in the view's `layers` array.

### Default View

If no `views` array is present, the default behavior is equivalent to an `author` mode view with all layers and no date restriction.

---

## §7 Metadata

The `metadata` object provides human and machine-readable context for the model.

```json
{
  "metadata": {
    "title": "Product Roadmap — Q1/Q2 2026",
    "description": "Cross-functional roadmap for the Gaia platform launch.",
    "created": "2026-01-06",
    "authors": ["Josh Davis", "Team Lead"],
    "tags": ["roadmap", "2026", "q1", "q2"]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Model title |
| `description` | string | — | One- or two-sentence summary |
| `created` | date | — | ISO 8601 creation date |
| `authors` | string[] | — | List of author names or identifiers |
| `tags` | string[] | — | Arbitrary tag labels for categorization |

The metadata object uses `additionalProperties: true`, so renderers and tools may add their own fields without breaking validation.

---

## §8 Layout Modes

Layout modes are informative renderer hints — they describe how a renderer should arrange events spatially. They are not part of the core model validation schema; they may appear in view or renderer configuration.

| Mode | Description |
|------|-------------|
| `lanes` | Horizontal swimlane layout — one row per layer, events placed along a time axis within each lane |
| `overlay` | All events share a single time axis, layers distinguished by color only |
| `timeline` | Linear horizontal Gantt-style — spans shown as horizontal bars, point events as markers |
| `vertical` | Top-to-bottom flow — time axis runs vertically, events stacked downward |

**These are renderer hints, not model fields.** The validator does not check layout mode values in the model itself. Renderers should accept a layout preference as a separate configuration option and fall back to their default if the requested mode is unsupported.

The default layout mode for Pneuma renderers is `lanes`.

---

## §9 Schema Validation

Every Pneuma model should be validated before rendering or sharing. The reference validator is at [`schema/validate.mjs`](schema/validate.mjs).

### Running the Validator

```bash
# Validate the bundled example
npm test

# Validate any model
node spec/schema/validate.mjs examples/my-timeline.json
```

### Checks Performed

The validator performs two categories of checks:

**Errors (exit code 1 — model is invalid):**

| # | Check | Description |
|---|-------|-------------|
| 0 | Version compatibility | Model's `pneuma` field major version must be `1` |
| 1 | Schema validation | Model must conform to `pneuma-v1.schema.json` (Draft 2020-12) |
| 2 | Unique event IDs | No two events may share an ID |
| 3 | Unique relationship IDs | No two relationships may share an ID |
| 4 | Unique view IDs | No two views may share an ID |
| 5 | Relationship integrity | Every `source` and `target` must reference a known event ID |
| 6 | Layer reference integrity | Every `event.layerId` must reference a known layer ID |
| 7 | Date consistency | `endDate >= startDate` for span/task; `endDate` absent for milestone/deadline |

**Warnings (exit code 0 — model is valid but worth reviewing):**

| # | Check | Description |
|---|-------|-------------|
| 8 | Orphan events | Events not referenced by any relationship (informational) |
| 9 | Impact range | Impact values outside 1–10 (schema enforces this; belt-and-suspenders check) |

### Schema Location

The JSON Schema is at `spec/schema/pneuma-v1.schema.json`. It targets [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/schema).

---

## §10 Extension Points

Pneuma provides two extension mechanisms for model authors and tool builders.

### `x_` Prefix Convention

Custom fields added to any object (layer, event, relationship, view) should use the `x_` prefix to signal that they are non-standard extensions. This prevents naming collisions with future spec versions.

```json
{
  "id": "eng-alpha",
  "label": "Alpha Build",
  "type": "span",
  "layerId": "engineering",
  "startDate": "2026-02-09",
  "endDate": "2026-03-27",
  "x_jiraKey": "PLAT-204",
  "x_assignee": "alex@example.com"
}
```

The validator does not reject unknown fields on events — `additionalProperties: false` is enforced at the top-level model object, but individual object schemas allow metadata fields.

### `metadata` Object

The `metadata` field on events accepts arbitrary properties. This is the preferred escape hatch for tool-specific data that is too structured for `notes` but not stable enough for a spec addition.

```json
{
  "id": "eng-alpha",
  "metadata": {
    "jiraKey": "PLAT-204",
    "estimatedHours": 480,
    "riskLevel": "high"
  }
}
```

### Future Spec Additions

New event types, relationship types, or view modes added in minor versions will always be backward-compatible. Models targeting `"pneuma": "1.0"` remain valid when `1.1` is released — new additions are opt-in.

---

## §11 Conformance Levels

Tools that claim Pneuma compatibility should declare which conformance level they support.

### Pneuma Basic

Minimum viable implementation. Required for any tool claiming Pneuma compliance.

- Read and write all four event types (`milestone`, `deadline`, `span`, `task`)
- Read and write layers with color and optional visibility
- Validate models against `pneuma-v1.schema.json`
- Render point events (milestone, deadline) distinctly from ranged events (span, task)

### Pneuma Full

Complete feature support.

- All Pneuma Basic requirements
- Read and write `relationships` with all four relationship types
- Read and write `views` with all three view modes and optional `dateRange`
- Apply layer visibility rules per view mode
- Support `metadata` and `x_` extension fields (preserve, do not discard)
- Pass all validator checks (0–7 errors; warnings are informational)

### Pneuma Interactive

Full implementation with interactive renderer capabilities.

- All Pneuma Full requirements
- Layer toggle UI (show/hide individual layers)
- View switcher UI (switch between defined views)
- Date range zoom/pan
- Event detail panel (label, type, dates, impact, notes, metadata)
- Relationship edge rendering with type-appropriate visual style
- Export to Pneuma JSON (round-trip capable)

---

## Appendix A: Type Summary

### Event Types (4)

| Type | Duration | Renderer Convention |
|------|----------|-------------------|
| `milestone` | Point | Diamond or vertical marker |
| `deadline` | Point | Flag or warning marker (distinct from milestone) |
| `span` | Range | Solid horizontal bar |
| `task` | Range | Horizontal bar (may use striped fill to distinguish from span) |

### Relationship Types (4)

| Type | Category | Directed | Renderer Convention |
|------|----------|----------|-------------------|
| `depends_on` | Dependency | ✅ | Solid arrow |
| `triggers` | Dependency | ✅ | Solid arrow (dashed alternative) |
| `blocks` | Constraint | ✅ | Bold or red arrow |
| `informs` | Reference | — | Light or dotted edge |

### View Modes (3)

| Mode | Audience |
|------|----------|
| `author` | Individual contributor |
| `team` | Internal team |
| `present` | External stakeholders |

### Layout Modes (4, informative)

| Mode | Description |
|------|-------------|
| `lanes` | Horizontal swimlanes (default) |
| `overlay` | Shared timeline, color-coded layers |
| `timeline` | Gantt-style horizontal bars |
| `vertical` | Top-to-bottom time axis |
