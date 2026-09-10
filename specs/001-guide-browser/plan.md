# Implementation Plan: Guide Browser Artifact

**Branch**: `001-guide-browser` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-guide-browser/spec.md`

---

## Summary

Deliver a friendly, lightweight, zero-dependency guide browser and reader artifact at `guides/index.html` allowing users to explore all practical guides in `guides/`, search/filter by keywords and categories, and read their Markdown text alongside their companion SVG diagrams in a responsive split view. Accompanied by a PowerShell catalog builder script `scripts/build-guide-browser.ps1` to keep the catalog synchronized as new guides arrive.

---

## Technical Context

**Language/Version**: HTML5, Modern CSS (Flexbox/Grid, CSS variables), Vanilla JavaScript (ES2020+), PowerShell 5.1+ / 7+.

**Primary Dependencies**: None (Zero third-party runtime packages or npm dependencies; bundled lightweight Markdown parser inline).

**Storage**: Embedded JSON catalog within `guides/index.html` (or `guides/catalog.js` loaded locally) to guarantee 100% offline compatibility on `file:///` without CORS restrictions.

**Testing**: Browser integration verification via Edge/Chrome on Windows; PowerShell validation script to verify guide parsing.

**Target Platform**: Windows (Edge, Chrome, Firefox) via local `file:///` protocol and Antigravity IDE preview.

**Project Type**: Single-page web application / documentation artifact + automation script.

**Performance Goals**: Instant page load (< 100ms), real-time search filtering (< 10ms), zero network calls.

**Constraints**: Completely offline-capable, zero build step required to view, COIIAOC visual grammar compliance (Navy `#1E3A5F`, Accent `#FF8C3B`, Background `#F5F2EC`).

**Scale/Scope**: Designed for 6 current guides, scales smoothly to 100+ guides without layout or performance degradation.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitutional Principle | Status | Evaluation & Compliance Notes |
|---|---|---|
| **I. Knowledge-Base Integrity (`raw/` untouchable)** | ✅ PASS | The browser reads from `guides/`; `raw/` files are completely untouched and remain pristine. |
| **II. Canonical Dual Deliverables (MD + SVG)** | ✅ PASS | The reader view displays both the canonical `.md` text and companion `.svg` diagram side-by-side. |
| **III. Stable Consecutive Numbering (`NN-`)** | ✅ PASS | The browser catalog parses and sorts by the consecutive two-digit `id` prefix (`01`, `02`, `03`...). |
| **IV. Spec-Driven & Autonomous Execution** | ✅ PASS | Designed through formal SpecKit phases (specify ➔ plan ➔ tasks ➔ implement). |
| **V. Multi-Agent & Antigravity Compatibility** | ✅ PASS | Native PowerShell script (`.ps1`), clickable `file:///` links, and UTF-8 encoding without BOM. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-guide-browser/
├── spec.md              # Requirements and user scenarios
├── plan.md              # Technical implementation plan (this file)
├── research.md          # Phase 0: Technical decisions and trade-offs
├── data-model.md        # Phase 1: Entity models and state transitions
├── quickstart.md        # Phase 1: Validation and verification guide
├── contracts/           # Phase 1: Catalog JSON schema & UI contract
│   ├── catalog-schema.json
│   └── ui-contract.md
├── checklists/
│   └── requirements.md  # Requirements quality gate checklist
└── tasks.md             # Phase 2: Actionable tasks (generated next)
```

### Source Code (repository root)

```text
core-human-knowledge/
├── guides/
│   ├── index.html                       # The Guide Browser application
│   ├── 01-CHEATSHEET-git-PR-vs-merge.*  # Existing guide assets
│   ├── 02-TUTORIAL-git-worktree.*
│   └── ...
└── scripts/
    └── build-guide-browser.ps1          # Catalog scanner & HTML generator script
```

**Structure Decision**: A single standalone HTML file `guides/index.html` living alongside the guides it presents, plus a build script `scripts/build-guide-browser.ps1` to re-scan and sync the embedded dataset when new guides are added.

---

## Complexity Tracking

> **No constitutional violations detected. Clean, zero-dependency architecture.**
