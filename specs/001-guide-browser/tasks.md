# Tasks: Guide Browser Artifact

**Feature**: `001-guide-browser`
**Input**: Design documents from `specs/001-guide-browser/` (`spec.md`, `plan.md`, `data-model.md`, `contracts/`, `quickstart.md`)
**Status**: Ready for Implementation

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping (`US1`, `US2`, `US3`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project layout and asset preparation

- [ ] T001 Create `scripts/build-guide-browser.ps1` script skeleton for scanning and building the guide catalog.
- [ ] T002 [P] Establish base HTML structure and COIIAOC v2 design tokens (CSS variables) in `guides/index.html`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data ingestion and client-side state infrastructure (blocks all user stories)

- [ ] T003 Implement guide scanner and metadata parser in `scripts/build-guide-browser.ps1` to parse `guides/*.md`, verify companion `*.svg`, and output structured JSON matching `contracts/catalog-schema.json`.
- [ ] T004 Implement client-side store, embedded catalog dataset, and `ReaderState` controller in `guides/index.html`.

**Checkpoint**: Foundation ready — catalog data can be loaded and rendered into views.

---

## Phase 3: User Story 1 - Discover and Browse Guides Catalog (Priority: P1) — MVP

**Goal**: Deliver a clean, responsive catalog displaying all guides with metadata and type badges.
**Independent Test**: Open `guides/index.html` and verify that guides `01` to `06` appear as cards with numbers, titles, and category tags.

- [ ] T005 [US1] Build responsive catalog grid layout with guide cards in `guides/index.html`.
- [ ] T006 [US1] Render guide metadata badges (numeric ID, type badge with COIIAOC colors, and summary) on each card.
- [ ] T007 [US1] Implement top navigation header with navy branding (`#1E3A5F`), accent bar (`#FF8C3B`), and total guide counter.

**Checkpoint**: MVP Complete — Users can open `guides/index.html` and visually browse the full collection of guides.

---

## Phase 4: User Story 2 - Read Guide Content with Companion SVG (Priority: P1)

**Goal**: Full reader view displaying formatted Markdown text alongside the companion SVG diagram.
**Independent Test**: Click card `02-TUTORIAL-git-worktree`; verify rendered text, code blocks, tables, and the companion SVG side-by-side.

- [ ] T008 [US2] Implement reader view container and transition logic (Card click ➔ Reader view; Back button ➔ Catalog view).
- [ ] T009 [US2] Integrate lightweight client-side Markdown parser in `guides/index.html` to render headings, lists, tables, and blockquotes.
- [ ] T010 [US2] Implement companion SVG rendering container with responsive scaling and error fallback if SVG is missing.
- [ ] T011 [US2] Implement layout mode selector in reader view: `Split (50/50)` | `Texto` | `Diagrama`.
- [ ] T012 [US2] Add one-click copy button to all pre/code blocks with visual confirmation ("¡Copiado! ✓").

**Checkpoint**: Core Reader Complete — Dual deliverable (MD + SVG) is fully readable and interactive.

---

## Phase 5: User Story 3 - Search and Filter by Keyword and Type (Priority: P2)

**Goal**: Real-time filtering by category type and keyword search across title, tags, and summary.
**Independent Test**: Search `git` (shows 01, 02, 03); click `CHEATSHEET` tag (shows only cheatsheets).

- [ ] T013 [US3] Implement category filter chips (`ALL`, `CHEATSHEET`, `TUTORIAL`, `PROCEDIMIENTO`, `REFERENCIA`) with active toggles.
- [ ] T014 [US3] Implement real-time search input filtering catalog cards by query in < 10ms.
- [ ] T015 [US3] Add keyboard shortcuts: `/` to focus search bar in catalog, `Esc` to close reader or clear search.

---

## Phase 6: Polish & Verification

**Purpose**: End-to-end integration and catalog build execution

- [ ] T016 Execute `scripts/build-guide-browser.ps1` to scan all 6 repository guides (`01` through `06`) and compile `guides/index.html`.
- [ ] T017 Execute validation scenarios from `specs/001-guide-browser/quickstart.md` in browser.
- [ ] T018 Update [README.md](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/README.md) and [quick-skill.md](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/quick-skill.md) with instructions to access the guide browser.

---

## Dependencies & Execution Order

```
Phase 1 (Setup) ──────▶ Phase 2 (Foundational)
                               │
                               ▼
                    Phase 3 (User Story 1 - MVP)
                               │
                               ▼
                    Phase 4 (User Story 2 - Reader & SVG)
                               │
                               ▼
                    Phase 5 (User Story 3 - Search & Filter)
                               │
                               ▼
                    Phase 6 (Polish & Verification)
```
