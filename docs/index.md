# Pneuma Documentation

Welcome to the Pneuma documentation index.

---

## Specification

- **[Pneuma v1 Specification](../spec/README.md)** — the authoritative specification document
  - §1 Introduction & Design Goals
  - §2 Model Structure
  - §3 Layers
  - §4 Events (milestone, deadline, span, task)
  - §5 Relationships (depends_on, triggers, blocks, informs)
  - §6 Views
  - §7 Metadata
  - §8 Layout Modes
  - §9 Schema Validation
  - §10 Extension Points
  - §11 Conformance Levels
  - Appendix A: Type Summary

## Schema & Tooling

- **[JSON Schema](../spec/schema/pneuma-v1.schema.json)** — Draft 2020-12 schema for model validation
- **[Validator](../spec/schema/validate.mjs)** — CLI validator (8 error checks, 2 warnings)
- **[Type Counter](../spec/schema/count-types.mjs)** — type count audit script
- **[Type Registry](../spec/type-registry.json)** — machine-readable event and relationship type map

## Examples

- **[Product Roadmap](../examples/product-roadmap.json)** — Q1/Q2 2026 cross-functional roadmap (3 layers, 8 events, 3 relationships, 2 views)

## Project

- **[README](../README.md)** — project overview and quick start
- **[CHANGELOG](../CHANGELOG.md)** — version history
- **[VERSIONING](../VERSIONING.md)** — versioning policy

## Renderers

- **[Kronum](https://github.com/joshdavisind/kronum)** — OSS React renderer for Pneuma models
- **[Gaia](https://github.com/joshdavisind/gaia)** — SaaS platform with Kronum as a first-class app

## Related Standards

- **[Meridia](https://github.com/joshdavisind/meridia)** — companion standard for infrastructure architecture diagrams
