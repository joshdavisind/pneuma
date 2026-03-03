# Versioning Policy

Pneuma follows [Semantic Versioning 2.0.0](https://semver.org) for the specification.

---

## Three Things That Are Versioned

### 1. The Pneuma Specification (`spec/README.md`)

The spec document uses full SemVer: **`MAJOR.MINOR.PATCH`**

```
1.0.0        — initial stable release
1.1.0        — added new relationship type (minor, backward-compatible)
1.0.1        — editorial clarifications only (patch, no behavioral change)
2.0.0        — breaking structural change (major)
```

During pre-release, versions carry a `-draft` suffix: `1.0.0-draft`.

### 2. The `"pneuma"` Field in Model Files

Model JSON documents declare their target spec version using `MAJOR.MINOR` only:

```json
{
  "pneuma": "1.0",
  ...
}
```

**Rationale:** Patch changes are editorial only — they carry no behavioral difference for model authors or validators. A model targeting `1.0.x` does not need to change its declaration between patch releases.

| Spec change | Model field update required? |
|---|---|
| PATCH (editorial) | No |
| MINOR (new types/fields, additive) | Only if the model uses the new additions |
| MAJOR (breaking) | Yes — validators will reject mismatched versions |

### 3. Schema Filenames

Schema files are named by major version only:

```
spec/schema/pneuma-v1.schema.json
spec/schema/pneuma-v2.schema.json   ← only created on a major bump
```

**Rationale:** Minor additions are backward-compatible — `pneuma-v1.schema.json` remains valid for all `1.x` spec versions.

---

## What Constitutes Each Change Level

### MAJOR (breaking)

Changes that make existing valid models invalid, or change how a validator or renderer must interpret a model:

- Renaming or removing an existing event type
- Renaming or removing an existing relationship type
- Changing the type or semantics of a required field
- Removing a field that validators or renderers depend on
- Restructuring the top-level model shape
- Changing the `"pneuma"` version field format

### MINOR (additive)

Changes that are backward-compatible — existing valid models remain valid:

- Adding new event types
- Adding new relationship types
- Adding new view modes
- Adding new optional metadata fields
- Adding new conformance level requirements
- Adding new rendering conventions

### PATCH (editorial)

Changes with no behavioral impact:

- Clarifying prose, fixing ambiguous wording
- Correcting typos or formatting
- Adding or improving examples
- Fixing a broken link
- Updating the changelog or appendix

---

## Compatibility Guarantees

- **Models targeting `1.x`** will remain valid Pneuma models indefinitely within the `1.x` line.
- **`pneuma-v1.schema.json`** will not have its existing enum values removed or required fields added within the `1.x` line.
