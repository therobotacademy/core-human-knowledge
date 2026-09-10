# UI & Interaction Contract: Guide Browser

**Feature**: `001-guide-browser`
**Date**: 2026-09-10
**Status**: Completed

---

## 1. Visual Layout Specifications

### Color Tokens (COIIAOC V2)
- **Top Header Bar**: Background `#1E3A5F`, text `#FFFFFF`, left accent border `#FF8C3B` (6px).
- **Page Background**: `#F5F2EC`.
- **Card Panels**: Background `#FFFFFF`, border `#E8E3D8`, hover border `#2E6B9E`, shadow `0 2px 8px rgba(0,0,0,0.06)`.
- **Badges & Tags**:
  - `CHEATSHEET`: Background `#FFF7ED`, border `#C2510A`, text `#7C2D12`.
  - `TUTORIAL`: Background `#E7F1EC`, border `#0D7C5A`, text `#0A5C43`.
  - `PROCEDIMIENTO`: Background `#EBF3F9`, border `#2E6B9E`, text `#1E3A5F`.
  - `REFERENCIA`: Background `#F3F4F6`, border `#6B6B6B`, text `#374151`.

### Typography
- Body / UI: `'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`.
- Code / Monospace: `Consolas, 'Courier New', monospace`.

---

## 2. Event & User Action Contracts

| Action / Trigger | UI Element | System Behavior |
|---|---|---|
| **Search Input** | `#search-input` (input event) | Filters visible cards instantly; highlights query matches. Empty search shows all. |
| **Category Filter** | `.filter-chip` (click event) | Sets `activeFilterType`; updates active chip style; filters card grid. |
| **Open Guide** | `.guide-card` (click event) | Transitions view to `#reader-view`; loads rendered Markdown and companion SVG; scrolls to top. |
| **Back to Catalog** | `#btn-back` (click event) | Restores `#catalog-view`; preserves previous search query and scroll position. |
| **View Mode Toggle** | `#view-toggle` buttons | Switches reader layout: `Split (50/50)` \| `Markdown Only` \| `SVG Only`. |
| **Copy Code Snippet** | `.copy-code-btn` (click event) | Writes code content to navigator clipboard; displays visual badge "¡Copiado! ✓" for 2 seconds. |
| **Keyboard Shortcut `/`** | Global keydown | Focuses `#search-input` when in catalog view. |
| **Keyboard Shortcut `Esc`** | Global keydown | If in reader view, returns to catalog view; if searching, clears search input. |
