# Feature Specification: Guide Browser Artifact

**Feature Directory**: `specs/001-guide-browser`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Design a friendly and simple artifact to browse guides and read their contents"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and Browse Guides Catalog (Priority: P1)

As a developer or student working with the repository, I want a clean, visual catalog displaying all available guides in `guides/` with their numbering, category tags (CHEATSHEET, TUTORIAL, PROCEDIMIENTO, REFERENCIA), and concise summaries so that I can quickly discover the guidance I need without manually opening folder directories.

**Why this priority**: Core navigation baseline. Without an intuitive catalog view, users cannot explore the repository's curated knowledge efficiently.

**Independent Test**:
- Open the browser artifact.
- Verify that all active guides (e.g. 01 to 06) are listed with their numeric badge, category tag, title, and descriptive summary.

**Acceptance Scenarios**:
1. **Given** the repository contains guides `01` through `06` in `guides/`, **When** the user opens the browser artifact, **Then** all 6 guides are displayed with proper titles, numbers, and color-coded type badges.
2. **Given** the guides catalog is displayed, **When** the user inspects a guide entry, **Then** the entry indicates whether the companion SVG diagram is available.

---

### User Story 2 - Read Guide Content with Companion SVG (Priority: P1)

As a user consulting a practical guide, I want to read its rendered Markdown content alongside its self-explanatory SVG diagram in a unified, comfortable reader view so that I can inspect commands and visual architecture simultaneously.

**Why this priority**: Primary value deliverable. The purpose of `core-human-knowledge` is reading the dual MD + SVG deliverable.

**Independent Test**:
- Select any guide (e.g., `02-TUTORIAL-git-worktree` or `05-CHEATSHEET-spec-kit`).
- Verify that the Markdown renders with clean typography (tables, code snippets, rule chips) and the companion SVG renders directly in high resolution.

**Acceptance Scenarios**:
1. **Given** the user selects a guide from the catalog, **When** the reader view opens, **Then** the guide's Markdown text is displayed with syntax highlighting and formatted tables.
2. **Given** a guide has a companion SVG diagram, **When** viewing the guide, **Then** the SVG diagram is rendered inline or in a side-by-side / split pane without broken image links or clipping.
3. **Given** a user is reading a guide, **When** they click "Back to Catalog", **Then** the reader returns to the guide list while preserving scroll and filter state.

---

### User Story 3 - Search and Filter by Keyword and Type (Priority: P2)

As the repository expands with new guides, I want to filter guides by category (e.g., only `CHEATSHEET` or only `TUTORIAL`) or search by keyword (e.g., "git", "latex", "spec-kit", "overleaf") to find specific procedures instantly.

**Why this priority**: Usability accelerator for repeat users. Prevents cognitive overload as new numbers are added.

**Independent Test**:
- Type "git" into the search bar. Confirm only Git guides (`01`, `02`, `03`) remain visible.
- Click the `CHEATSHEET` filter chip. Confirm only cheatsheets are shown.

**Acceptance Scenarios**:
1. **Given** the catalog displays all guides, **When** the user types a search term, **Then** the list updates in real time filtering by title, tags, and summary keywords.
2. **Given** active filters are applied, **When** the user clicks "Clear filters", **Then** all guides are restored.

---

### Edge Cases

- **Missing companion SVG**: If a guide lacks an SVG file, the reader displays a non-intrusive banner indicating "Diagram pending" without breaking the Markdown display.
- **Offline / Local Execution**: The artifact must function completely offline (file:// protocol) without external CDN dependencies that could fail in restricted or air-gapped environments.
- **Large Tables and Wide Code Blocks**: Preformatted blocks and Markdown tables must have horizontal scrolling to prevent layout disruption on narrower screens.
- **Dynamic Growth**: Adding a new guide (`07-...`) should require minimal or automated updates to the browser catalog.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST catalogue all guides present in `guides/` respecting the canonical naming pattern `NN-TIPO-tema.md`.
- **FR-002**: System MUST render a responsive catalog view featuring guide number, category badge, human-friendly title, and preview summary.
- **FR-003**: System MUST display both the formatted Markdown content and the companion SVG diagram in a unified, distraction-free reading interface.
- **FR-004**: System MUST adhere to the COIIAOC visual grammar (Navy `#1E3A5F`, Accent `#FF8C3B`, Soft background `#F5F2EC`, Segoe UI and Consolas typography).
- **FR-005**: System MUST provide real-time search filtering across guide titles, types, and keywords.
- **FR-006**: System MUST operate as a self-contained local artifact with zero server setup or external build requirements.
- **FR-007**: System MUST provide direct copy-to-clipboard functionality for command blocks within cheatsheets.
- **FR-008**: Artifact format: [NEEDS CLARIFICATION: Should the artifact be a self-contained single-page HTML application (`guides/index.html`), a Python/local lightweight generator, or an interactive Markdown/Antigravity artifact?]

---

### Key Entities

- **Guide**:
  - `id`: String identifier (e.g., `01`, `02`, `05`).
  - `type`: Category (`CHEATSHEET`, `TUTORIAL`, `PROCEDIMIENTO`, `REFERENCIA`).
  - `title`: Human-readable title extracted from H1.
  - `slug`: Kebab-case identifier.
  - `mdPath`: Relative path to the `.md` file.
  - `svgPath`: Relative path to the companion `.svg` file.
  - `summary`: Short extract or idea rectora.
  - `tags`: Keywords for search and filtering.

- **Catalog**:
  - `guides`: List of all `Guide` entities.
  - `activeFilter`: Current category filter selection.
  - `searchQuery`: Current text query.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can locate and open any guide from the catalog in ≤ 2 clicks or within 5 seconds.
- **SC-002**: Markdown text rendering and SVG diagrams load simultaneously with zero visual clipping or broken links.
- **SC-003**: Filter and keyword search updates the catalog in real time (< 50ms response time).
- **SC-004**: 100% functional offline from local disk via standard browser without installing web servers (`npm`, `python -m http.server`, etc.).
- **SC-005**: Code snippets can be copied to the clipboard with a single click.

---

## Assumptions

- Guides remain in `guides/` following the canonical `NN-TIPO-tema.md` format with companion `NN-TIPO-tema.svg`.
- Target environment is standard modern web browsers (Chrome, Edge, Firefox) on Windows.
- No remote backend or database is required; guide data can be indexed statically or dynamically via client-side scripts.
