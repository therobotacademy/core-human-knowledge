# Phase 0: Research & Technical Decisions — Guide Browser

**Feature**: `001-guide-browser`
**Date**: 2026-09-10
**Status**: Completed

---

## 1. Artifact Delivery Format & Architecture

### Decision
A **single-file, self-contained HTML/CSS/Vanilla JS application** placed at `guides/index.html`, paired with a lightweight build/sync script `scripts/build-guide-browser.ps1` (or Python equivalent) to regenerate the embedded guide catalog metadata whenever a new guide is added to `guides/`.

### Rationale
- **Zero Friction & Offline Operation**: Double-clicking `guides/index.html` opens the browser immediately in any modern web browser (Edge, Chrome, Firefox) via standard `file:///` protocol without launching local web servers (`npm run dev`, `python -m http.server`, etc.).
- **Native SVG Fidelity**: Browsers render SVG vectors natively with hardware acceleration, responsive scaling, and crystal-clear typography matching the COIIAOC design tokens.
- **Client-Side Responsiveness**: Filtering across 6 to 100+ guides executes in memory in < 10ms with zero network lag.
- **In-Browser Markdown Rendering**: Embedding a lightweight, self-contained Markdown parser (e.g. bundled inline or lightweight parser function) renders clean HTML with syntax-highlighted code blocks, tables, and copy buttons.

### Alternatives Considered & Rejected
1. **React / Vite SPA**:
   - *Rejected*: Requires `node_modules`, npm scripts, build pipelines, and an HTTP server. Violates simplicity and introduces maintenance burden for a documentation repository.
2. **Pure Markdown Index (e.g., in README.md or a separate .md file)**:
   - *Rejected*: Markdown lacks interactive live search, real-time category filtering, responsive split-pane reading, and one-click clipboard copying.
3. **Python Desktop GUI (Tkinter/PyQt)**:
   - *Rejected*: Requires local Python runtime dependencies and does not render SVG and formatted Markdown as cleanly as browser engines.

---

## 2. Visual Design & Theme Integration

### Decision
Strict adherence to the **COIIAOC Design System & Typography V2** specified in `AGENTS.md`:
- **Palette Tokens**:
  - Navy structure/headers: `#1E3A5F`
  - Accent orange: `#FF8C3B`
  - Local/Action orange: `#C2510A`
  - Shared/Clean green: `#0D7C5A` (light variant `#E7F1EC`)
  - Secondary blue: `#2E6B9E`
  - Background: `#F5F2EC`
  - Cards & panels: `#FFFFFF` and `#FAFAF7`, borders `#E8E3D8`
- **Typography**:
  - Text & UI: `'Segoe UI', Arial, sans-serif`
  - Code & Commands: `Consolas, 'Courier New', monospace`
- **Dual View Layout**:
  - Left pane (or tab 1): Rendered Markdown guide.
  - Right pane (or tab 2 / full modal): Companion SVG diagram with zoom/pan capability.

---

## 3. Guide Discovery & Catalog Ingestion

### Decision
A pre-indexed JSON catalog embedded directly within `guides/index.html`, plus a simple generator script (`scripts/build-guide-browser.ps1`) that scans `guides/*.md` and `guides/*.svg`, parses YAML/frontmatter or H1/blockquotes, and updates the embedded dataset.

### Rationale
- Reading local filesystem files via JavaScript from `file:///` is restricted by browser CORS/same-origin security policies (browsers forbid `fetch("01-CHEATSHEET-git-PR-vs-merge.md")` on `file:///` URLs in certain environments).
- Pre-embedding the guide catalog and Markdown contents directly inside `guides/index.html` (or via a companion `guides/catalog.js` loaded via `<script src="catalog.js">`) completely bypasses browser CORS restrictions, ensuring 100% offline portability on Windows out of the box.
