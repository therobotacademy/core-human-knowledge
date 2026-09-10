# Phase 1: Data Model — Guide Browser

**Feature**: `001-guide-browser`
**Date**: 2026-09-10
**Status**: Completed

---

## 1. Core Entities

### Entity: `Guide`
Represents a curated, canonical practical guide in `guides/`.

| Field | Type | Description | Validation / Constraints |
|---|---|---|---|
| `id` | `string` | Two-digit numerical identifier (e.g., `"01"`, `"02"`, `"05"`). | Pattern `^\d{2}$`, unique, consecutive. |
| `type` | `string` | Category genre. | Enum: `CHEATSHEET`, `TUTORIAL`, `PROCEDIMIENTO`, `REFERENCIA`. |
| `slug` | `string` | Kebab-case topic identifier. | Lowercase letters, numbers, hyphens (`git-worktree`, `spec-kit`). |
| `title` | `string` | Clean human-readable title extracted from Markdown H1. | Non-empty string. |
| `summary` | `string` | Short description or idea rectora extracted from blockquote. | Max 250 characters. |
| `mdFilename` | `string` | Filename of the guide markdown. | Pattern `^\d{2}-[A-Z]+-[a-z0-9-]+\.md$`. |
| `svgFilename` | `string` | Filename of the companion SVG. | Pattern `^\d{2}-[A-Z]+-[a-z0-9-]+\.svg$`. |
| `hasSvg` | `boolean` | Flag indicating if companion SVG exists. | `true` or `false`. |
| `tags` | `string[]` | Keywords for search and filtering. | Non-empty array of strings. |
| `contentMarkdown` | `string` | Full UTF-8 markdown text of the guide. | Raw markdown string. |
| `contentSvg` | `string` | Full XML/SVG string of the companion diagram. | Raw SVG markup or relative asset URL. |

---

### Entity: `Catalog`
Represents the collective dataset and active filtering criteria.

| Field | Type | Description |
|---|---|---|
| `version` | `string` | Semantic or timestamp version of the catalog index. |
| `lastUpdated` | `string` | ISO 8601 date string of last sync. |
| `guides` | `Guide[]` | Ordered collection of guides sorted by `id` ascending. |
| `totalGuides` | `number` | Count of cataloged guides. |
| `availableTypes` | `string[]` | Set of unique types currently present in the collection. |

---

### Entity: `ReaderState` (Client-Side UI State)
Tracks active navigation and reader preferences in the browser.

| Field | Type | Description | State Transitions |
|---|---|---|---|
| `viewMode` | `string` | Active screen. | `catalog` ⟷ `reader` |
| `selectedGuideId` | `string \| null` | Currently active guide being read. | `null` ➔ `"01"` ➔ `null` |
| `activeFilterType` | `string` | Active category filter. | `"ALL"` or specific type (`"CHEATSHEET"`). |
| `searchQuery` | `string` | Text query entered in search input. | Real-time string value. |
| `displayMode` | `string` | Layout mode in reader view. | `"split"` (MD + SVG side-by-side) \| `"md-only"` \| `"svg-only"` |

---

## 2. State Transitions & Lifecycle

```
[CATALOG VIEW]
      │
      ├─ User types in Search ──▶ Filter guides by title/tags/summary (< 10ms)
      ├─ User clicks Type Chip ─▶ Filter guides by selected type
      │
      └─ User clicks Guide Card
            │
            ▼
     [READER VIEW]
            │
            ├─ Toggle Display Mode ──▶ "Split" (MD + SVG) | "Texto" | "Diagrama"
            ├─ Click Copy Command ───▶ Copy snippet to clipboard + show "Copiado ✓"
            │
            └─ Click "Volver al Catálogo" ──▶ Restore CATALOG VIEW (preserves filter)
```
