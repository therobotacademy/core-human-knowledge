# Quickstart Validation Guide: Guide Browser

**Feature**: `001-guide-browser`
**Date**: 2026-09-10
**Status**: Ready for Validation

---

## 1. Prerequisites

- Any modern web browser installed on Windows (Microsoft Edge, Google Chrome, or Mozilla Firefox).
- No web server, Node.js, or external package dependencies required.

---

## 2. Running the Feature

### Step 1: Open the Guide Browser
From File Explorer or PowerShell:

```powershell
# Open directly in default web browser
Start-Process "guides\index.html"
```

---

## 3. End-to-End Validation Scenarios

### Scenario A: Catalog Discovery
1. Open `guides/index.html`.
2. **Verify**:
   - Header displays "core-human-knowledge — Catálogo de Guías Prácticas" with navy background and orange accent.
   - The grid displays all 6 active guides (`01`, `02`, `03`, `04`, `05`, `06`).
   - Each card displays its numeric badge, type tag (e.g. `CHEATSHEET`, `TUTORIAL`), title, and summary.

### Scenario B: Real-Time Search & Filtering
1. In the search box, type `git`.
2. **Verify**: The catalog updates instantly showing only guides `01`, `02`, and `03`.
3. Clear search and click the `TUTORIAL` filter tag.
4. **Verify**: Only guides tagged with `TUTORIAL` (e.g. `02`, `03`, `06`) remain visible.

### Scenario C: Reading a Guide with Companion SVG
1. Click on card `02-TUTORIAL-git-worktree`.
2. **Verify**:
   - The reader view opens smoothly.
   - Left pane displays the formatted Markdown with styled tables and command blocks.
   - Right pane displays the companion SVG diagram rendered sharp with full vector clarity.
3. Click the "Copiar" button on any command block.
4. **Verify**: The button flashes "¡Copiado! ✓" and the command is in your system clipboard.
5. Click "Volver al Catálogo" (or press `Esc`).
6. **Verify**: You return to the catalog grid.

### Scenario D: Updating the Catalog
When a new guide `07-...` is added to `guides/`:

```powershell
# Run the catalog builder script
powershell -ExecutionPolicy Bypass -File scripts\build-guide-browser.ps1
```

- **Verify**: `guides/index.html` updates its catalog data automatically to include guide `07`.
