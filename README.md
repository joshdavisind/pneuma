# Pneuma

> An open, portable JSON standard for timeline diagrams.

Pneuma formalizes the data model for project timelines, product roadmaps, and cross-functional plans. A Pneuma model is a single JSON file — renderer-agnostic, machine-validatable, and designed for collaboration.

---

## Quick Start

**Validate a model:**

```bash
npm install
npm test                                         # validate the bundled example
node spec/schema/validate.mjs my-timeline.json   # validate your model
```

**Model structure:**

```json
{
  "pneuma": "1.0",
  "metadata": {
    "title": "Product Roadmap — Q1/Q2 2026",
    "created": "2026-01-06",
    "authors": ["Josh Davis"],
    "tags": ["roadmap", "2026"]
  },
  "layers": [
    { "id": "engineering", "label": "Engineering", "color": "#0ea5e9" }
  ],
  "events": [
    {
      "id": "v1-release",
      "label": "v1.0 Release",
      "type": "milestone",
      "layerId": "engineering",
      "startDate": "2026-04-15",
      "impact": 10
    }
  ]
}
```

See [`examples/product-roadmap.json`](examples/product-roadmap.json) for a complete working example.

---

## Event Types

| Type | Duration | Use for |
|------|----------|---------|
| `milestone` | Point (startDate only) | Achievements, releases, decisions |
| `deadline` | Point (startDate only) | Hard external commitments |
| `span` | Range (startDate + endDate) | Phases and initiatives |
| `task` | Range (startDate + endDate) | Assigned work items |

## Relationship Types

| Type | Meaning |
|------|---------|
| `depends_on` | Source requires target to be complete |
| `triggers` | Target begins when source completes |
| `blocks` | Source prevents target from proceeding |
| `informs` | Informational — source provides context for target |

## View Modes

| Mode | Audience |
|------|----------|
| `author` | Individual contributor — full working detail |
| `team` | Internal team — coordination and progress |
| `present` | Stakeholders / executives — curated, clean |

---

## Repository Structure

```
pneuma/
├── README.md
├── CHANGELOG.md
├── VERSIONING.md
├── package.json
├── examples/
│   └── product-roadmap.json       ← complete working example
├── spec/
│   ├── README.md                  ← full Pneuma v1 specification
│   ├── type-registry.json         ← machine-readable type map
│   └── schema/
│       ├── pneuma-v1.schema.json  ← JSON Schema Draft 2020-12
│       ├── validate.mjs           ← CLI validator (8 error checks + 2 warnings)
│       └── count-types.mjs        ← type count audit
└── docs/
    └── index.md                   ← documentation index
```

---

## Versioning

See [VERSIONING.md](VERSIONING.md).

**TL;DR:** The spec uses [SemVer](https://semver.org). The `"pneuma"` field in model files uses `MAJOR.MINOR`. Schema files include the major version only (`pneuma-v1.schema.json`).

Current spec version: **1.0.0-draft**

---

## Renderers

- **[Kronum](https://github.com/joshdavisind/kronum)** — OSS React renderer for Pneuma timeline diagrams
- **[Gaia](https://github.com/joshdavisind/gaia)** — SaaS platform hosting Kronum as a first-class app

---

## Related

- **[Meridia](https://github.com/joshdavisind/meridia)** — companion standard for infrastructure architecture diagrams

---

## License

MIT
