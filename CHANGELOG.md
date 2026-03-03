# Changelog

All notable changes to the Pneuma specification and tooling are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

- Interactive Kronum renderer — in development
- CLI tool for validation and conversion — planned

---

## [1.0.0-draft] — 2026-03-03

Initial draft of the Pneuma specification. Formalizes the Moirai DSL timeline data model as an open standard.

### Spec — Pneuma v1

**Event types (4):** `milestone`, `deadline`, `span`, `task`

- Point events (`milestone`, `deadline`): require `startDate` only; `endDate` must not be present
- Ranged events (`span`, `task`): require both `startDate` and `endDate`; `endDate` must be ≥ `startDate`
- `impact` field (integer 1–10) for visual weight / prioritization

**Relationship types (4):** `depends_on`, `triggers`, `blocks`, `informs`

- Dependency types (`depends_on`, `triggers`): directed, hard prerequisite semantics
- Constraint type (`blocks`): directed, blocking semantics
- Reference type (`informs`): semantic reference, not a hard dependency

**Layer model:**

- Named swimlanes with `id`, `label`, `color`, and optional `visibility` per ViewMode
- Every event references exactly one layer via `layerId`

**View model:**

- Named views with `mode` (`author` | `team` | `present`)
- Optional `layers` filter (subset of all layers)
- Optional `dateRange` for focused rendering windows

**Layout modes (informative, 4):** `lanes`, `overlay`, `timeline`, `vertical`

**Conformance levels:** Pneuma Basic, Full, Interactive

### Tooling

- JSON Schema: `spec/schema/pneuma-v1.schema.json` — validates all model structures, types, and formats
- CLI validator: `spec/schema/validate.mjs` — schema validation + 8 semantic error checks + 2 warnings
- Type counter: `spec/schema/count-types.mjs` — type count audit
- Example model: `examples/product-roadmap.json` — Q1/Q2 2026 cross-functional roadmap with 3 layers, 8 events, 3 relationships, 2 views

### Documentation

- `spec/README.md` — full specification (§1–§11 + Appendix A)
- `README.md` — project overview and quick start
- `VERSIONING.md` — versioning policy
- `CHANGELOG.md` — this file
- `docs/index.md` — documentation index

---

[Unreleased]: https://github.com/joshdavisind/pneuma/compare/v1.0.0-draft...HEAD
[1.0.0-draft]: https://github.com/joshdavisind/pneuma/releases/tag/v1.0.0-draft
