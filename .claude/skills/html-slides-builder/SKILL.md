---
name: html-slides-builder
description: Design system for COIIAOC course slide decks (M1 materials). Provides the exact color tokens, typography, and slide layout patterns from .claude/skills/html-slides-builder/assets/paleta_curso.html v1.1. Invoke before writing any HTML slide deck or PPTX-equivalent material for the COIIAOC course.
---
# html-slides-builder

Specification for producing M1 slide decks (and any PPTX-equivalent material) in the COIIAOC course. All slides are delivered as self-contained HTML 16:9 files that replicate the visual identity of the reference PPTXs in `.claude/skills/html-slides-builder/assets/`

## When to invoke

Fire **before writing the first line of any slide deck** for the COIIAOC course. Triggers:

- User asks to produce **M1** for any session (II1–II6 or extra)
- User says "produce slides", "haz las slides", "crea la presentación", "PPTX", "slide deck" in the context of COIIAOC course materials
- Any task that outputs an HTML file intended to be presented as a slide deck for this course
- User says "arranca M1", "produce M1", or "slides de la sesión II*"

Do **not** fire for M2 (DOCX worksheets), M3 (HTML step-by-step guides), M4 (JSON workflows), or M5 (interactive simulators). Those are separate formats.

Do **not** use SlideForge or its IEC color palette (`#6B8FA8`, `#2C4A5A`, `#F5F3E8`). That palette is for a different course.

## Source of truth

`.claude/skills/html-slides-builder/assets/paleta_curso.html` — v1.1 (contraste corregido). Reference PPTXs in `.claude/skills/html-slides-builder/assets/samples-parte1/`: `SESION 3 Automatizacion Zapier.pptx`, `SESION 4 Orquestacion Avanzada N8N.pptx`, `SESION 5 LLM-Cerebro-Agente.pptx`, `SESION 6 Agente Solar FV.pptx`.

### Palette version — which one to use

Two palette files share the **exact same colors**; they differ **only in typography**:

| File | Version | Typography | When |
| --- | --- | --- | --- |
| `assets/paleta_curso.html` | **v1.1 · DEFAULT** | Web fonts: Syne / IBM Plex (Google Fonts) | Slide decks (this skill) — the default |
| `assets/paleta_curso_V2.html` | **v2 · opt-in** | System fonts: Segoe UI / Arial (+ Consolas for code) | SVG diagrams, DOCX, offline contexts, or when the user explicitly asks for "**paleta_curso V2**" |

**Default = v1.1** (web fonts). Switch to **V2** only when the user asks for it or when the output must render **without** web fonts. Colors are identical across versions — when switching, change **only** the `font-family`, never a color.

---

## Design tokens

### Typography

| Role                           | Family            | Weights           | Import       |
| ------------------------------ | ----------------- | ----------------- | ------------ |
| Headlines, titles              | `Syne`          | 600 · 700 · 800 | Google Fonts |
| Badges, code, monospace labels | `IBM Plex Mono` | 400 · 500        | Google Fonts |
| Body, subtitles                | `IBM Plex Sans` | 300 · 400 · 500 | Google Fonts |

Google Fonts import URL:

```
https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap
```

**System-font variant (V2):** for SVG diagrams, DOCX or offline output (or on request), use `Segoe UI, Arial, sans-serif` (+ `Consolas, monospace` for code/HEX) instead of the web fonts — see *Palette version* above. Same colors, no Google Fonts.

### Color palette

#### Primaries

| Token name        | HEX         | Use                                     |
| ----------------- | ----------- | --------------------------------------- |
| Azul Institución | `#1E3A5F` | Cover slides, header strips, left panel |
| Crema Técnico    | `#FAFAF7` | Content slide backgrounds               |
| Blanco            | `#FFFFFF` | Data cards, tables, floating elements   |

#### Orange system — two variants, same identity

| Token name       | HEX                        | Contrast ratio    | Allowed backgrounds                   |
| ---------------- | -------------------------- | ----------------- | ------------------------------------- |
| Naranja Luminoso | `#FF8C3B`                | 4.97:1 ✅ WCAG AA | **Only** on `#1E3A5F` (blue)  |
| Naranja Oscuro   | `#C2510A`                | 7.55:1 ✅ WCAG AA | White `#FFFFFF` / Crema `#FAFAF7` |
| ❌ FORBIDDEN     | `#C2510A` on `#1E3A5F` | 2.45:1 ❌ FAIL    | Never — not under any circumstance   |

#### Functional (IO/RE tags)

| Token name      | HEX         | Contrast  | Use                                         |
| --------------- | ----------- | --------- | ------------------------------------------- |
| Azul Medio      | `#2E6B9E` | 4.62:1 ✅ | **Inputs** tags (IO/RE frames)        |
| Verde Proceso   | `#0D7C5A` | 5.40:1 ✅ | **Outputs** tags, success states      |
| Ámbar Regla    | `#B45309` | 6.17:1 ✅ | **Reglas** tags (IO/RE frames)        |
| Rojo Excepción | `#B91C1C` | 5.92:1 ✅ | **Excepciones** tags, critical alerts |

#### Neutrals

| HEX         | Name             | Use                                 |
| ----------- | ---------------- | ----------------------------------- |
| `#F5F2EC` | Parchment        | Page background (outside slides)    |
| `#E8E3D8` | Borde Cálido    | Dividers, card borders, table lines |
| `#9B9B9B` | Texto Dim        | Captions, very secondary text       |
| `#6B6B6B` | Texto Secundario | Subtitles, notes                    |
| `#1C1C1C` | Texto Principal  | Body text on light backgrounds      |

---

## Slide layout patterns

### Pattern A — Cover slide (portada)

Structure: full `#1E3A5F` background · 5px left border strip in `#FF8C3B` · content centered or left-aligned.

Elements:

- **Badge** (kicker): IBM Plex Mono, 10px, `#FF8C3B`, letter-spacing 0.18em, uppercase. e.g. `COIIAOC · Parte 2 · Sesión II1`
- **Headline**: Syne 800, large (clamp 26px–40px), white `#FFFFFF`, line-height 1.1, letter-spacing -0.02em
- **Subtitle/description**: IBM Plex Sans 300–400, ~14px, muted blue-white `#9AB0C8`
- **KPI / stat** (optional): Syne 800, ~36–38px, `#FF8C3B`
- **Footer**: IBM Plex Mono, ~10px, `#9B9B9B`

### Pattern B — Content slide (contenido)

Structure: narrow header strip `#1E3A5F` + main body on `#FAFAF7`.

Header strip elements:

- **Chip/tag**: IBM Plex Mono, 8px, `#FF8C3B`, border `rgba(255,140,59,.4)`, border-radius 2px, padding 2px 6px, letter-spacing 0.1em, uppercase
- **Title**: Syne 700, ~15px, white `#FFFFFF`

Body elements:

- Background: `#FAFAF7`
- **Data cards**: white `#FFFFFF`, border `#E8E3D8`, border-radius 6px, padding 10px. Value in Syne 800 (colored by context: `#C2510A` for KPIs, `#1E3A5F` for counts, `#0D7C5A` for success). Label in IBM Plex Sans, ~9px, `#6B6B6B`.
- **Callout/insight bar**: `#FFF7ED` background, 3px left border `#C2510A`, border-radius 0 5px 5px 0, text `#4A3000`, ~10px

### Pattern C — IO/RE frame

A structured box that organizes the IO/RE of a workflow step. Uses the functional color tags:

- **Inputs section**: label tag in `#2E6B9E`, content on white card
- **Outputs section**: label tag in `#0D7C5A`, content on white card
- **Reglas section**: label tag in `#B45309`, content on white card
- **Excepciones section**: label tag in `#B91C1C`, content on white card

Tag style: IBM Plex Mono, 8–9px, uppercase, letter-spacing 0.12em, background `rgba(<color>,.1)`, border 1px solid `<color>`, border-radius 3px, padding 2–3px 6–8px.

### Pattern D — Section divider

Full-bleed `#1E3A5F` · horizontal accent bar in `#FF8C3B` · large Syne 800 white title · small subtitle in `#9AB0C8`. Used between major blocks within the deck.

### Pattern E — Code / workflow node

Monospace block on `#1C1C1C` or dark `#1E3A5F` background. Code in IBM Plex Mono 400. Language label chip top-right. Caption in `#6B6B6B` below.

---

## HTML output spec

Every M1 deck is a **self-contained HTML file**:

- **Aspect ratio**: 16:9 (fixed width 960px or 100vw, height 540px or 56.25vw)
- **Keyboard navigation**: ← → arrow keys advance/retreat slides; current slide shown, others `display:none` or positioned off-screen
- **Slide counter**: `N / total` in IBM Plex Mono, bottom-right of each slide, `#9B9B9B`
- **No external JS dependencies**: navigation in vanilla JS inline at bottom of file
- **Print**: `@media print` hides navigation chrome; each slide breaks to a new page
- **Font loading**: Google Fonts via `<link>` in `<head>`; add `font-display: swap` fallback

### File naming convention

`M1_slides_<sesion>.html` — e.g. `M1_slides_II1.html`

### Output path

`CONTENT/PARTE2-Materiales/<sesion>-<nombre>/M1_slides_<sesion>.html`

---

## Procedure when invoked

1. **Confirm session context**: read the session's `README_<sesion>.md` (source of truth for content). Note: idea fuerza, PRDA, nodos, IO/RE, payloads, gate.
2. **Draft slide outline** (~8–12 slides for a 2.5h session):
   - Slide 1: Cover (Pattern A) — kicker, headline, subtitle
   - Slide 2: Agenda / what we build today
   - Slide 3–N: Core content using Pattern B + IO/RE (Pattern C) as needed
   - Slide N-1: Section divider (Pattern D) before practice block if applicable
   - Last slide: Gate / cierre — what was validated, what comes next
3. **Write HTML** implementing the tokens and patterns above. Inline all CSS. No external frameworks.
4. **Verify before delivering**:
   - No `#C2510A` on `#1E3A5F` backgrounds (forbidden combination)
   - All contrast ratios respected per the token table
   - Keyboard navigation works (← →)
   - Slide counter accurate
   - Google Fonts `<link>` present in `<head>`

---

## Editorial conventions — apply during generation, not as post-edit

Derived from the diff of `M1_slides_II1-v6-llm0.pptx` (raw LLM) vs `M1_slides_II1-v6.pptx` (Bernardo's manual revision). Consistent across all 10 slides — these are rules, not one-off fixes.

### A. Text and terminology

- Idea slide chip and closing reference: use **`IDEA CLAVE`**, never `IDEA FUERZA`
- Cover chip: `COIIAOC · PARTE 2 · SESIÓN II<N>` — no `DE 6` suffix or other progress counts
- Never prefix body text with meta-labels: ❌ `Nota pedagógica:`, ❌ `Idea fuerza:`, ❌ `Propósito:`, ❌ `Importante:`
- No self-referential commentary: ❌ "es deliberadamente mínimo", ❌ "el núcleo del módulo", ❌ "el plato fuerte"
- Footer year: current calendar year (`2026` in 2026)

### B. Footer / slide chrome

- Copyright string **only on slide 1 (cover)**: `© <year> Bernardo Ronquillo Japón` — without the `· COIIAOC` suffix
- Slide counter `N / total` on **every** slide (bottom-right, IBM Plex Mono, `#9B9B9B`)
- Cover badges: semantic only (`PRDA · <Capa>`, `n8n · <N> nodos`, `sin LLM` / `con LLM`). ❌ No internal-ops badges: `freeze <SHA>`, `commit <hash>`, `v<N>.<N>`

### C. Titles (h1)

- 2–4 words. ✅ `Pipeline de 4 nodos` · ❌ `Qué construimos hoy — pipeline de 4 nodos`
- Do not enumerate the slide's contents in the title. ✅ `Criterio de cumplimiento` · ❌ `Criterio de cierre · Lo que NO hace · Qué viene en II2`
- Use canonical acronyms when available. ✅ `Contrato IORE` · ❌ `Contrato completo del módulo II1`
- h1 bbox height: `0.47"` for single-line titles. Reserve `1.2"` only for titles that genuinely wrap

### D. Body

- Break prose into short lines / sub-paragraphs. Each line begins with a capitalized verb: `Importar el workflow`, `Asignar la credencial Telegram`, `Probar los 4 payloads`
- Idea-slide quotes: no redundant pronouns, no trailing period. ✅ `"El agente busca los datos"` · ❌ `"El agente busca datos él solo."`
- When the h1 is single-line, pull the content area upward (raise `top` of the first body block); do not leave vertical gaps

### Verification before delivering

Add these to the existing verification checklist:

- Chip on slide-idea reads `IDEA CLAVE` (not `IDEA FUERZA`)
- Copyright string appears on slide 1 only
- No meta-label prefixes (`Nota pedagógica:`, etc.) anywhere in body text
- All h1 are ≤ 4 words unless content genuinely requires more
- No commit hashes, version numbers, or freeze SHAs in cover badges

---

## Anti-patterns — never do these

- ❌ Use SlideForge IEC palette (`#6B8FA8`, `#2C4A5A`, `#F5F3E8`) — wrong course
- ❌ Use `#C2510A` on `#1E3A5F` — fails WCAG AA (2.45:1)
- ❌ Use `#FF8C3B` on `#FAFAF7` or `#FFFFFF` — fails WCAG AA
- ❌ Use a serif font — only Syne, IBM Plex Mono, IBM Plex Sans
- ❌ Use pure black `#000000` for text — use `#1C1C1C`
- ❌ Use pure white `#FFFFFF` as slide background — use `#FAFAF7` (Crema Técnico)
- ❌ Produce a `.pptx` binary — deliver as `.html` instead
