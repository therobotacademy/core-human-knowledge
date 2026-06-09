# Skills — Casuística de creación de contenidos

Cómo se crean los contenidos del repositorio con los skills: **qué entra, qué skill lo procesa, qué sale**. Este documento es la versión narrativa de los diagramas en [`_content-creation-map/`](_content-creation-map/) (overview · slides · documentos · diagramas · lecciones/editorial).

> **Capas.** Esta es la **vista operativa** (entrada→skill→salida, metodologías A/B, mapa de decisión). La **vista estructural** —procesos, relaciones tipadas, invariante «sin huérfanos»— vive en [`docs/AGENTE-PROCESOS/`](../../docs/AGENTE-PROCESOS/PROCESO.md), regenerada por `mapa-procesos-agente`. La familia editorial (D) y el eje metodológico A/B solo se modelan **aquí**; los 4 procesos locales de generación, **allí**.

---

## Las dos metodologías de producción

| | **Metodología A · Akademos** | **Metodología B · Producción directa** |
|---|---|---|
| **Proceso** | Multi-agente orquestado (HERMES → DÉDALO → personas) | Claude Code, sesión única secuencial |
| **Checkpoint intermedio** | `D3_outline.md` (prosa por slide, verificado antes de renderizar) | El guión JSON / HTML es el primer artefacto |
| **Escalabilidad** | Alta — `MEMORY.md` garantiza coherencia entre sesiones | Depende de la memoria del autor / del guión |
| **Coste extra** | ~$0.05–0.15 por módulo (haiku ×3 + sonnet ×1) | $0 extra |

Ambas metodologías desembocan en los **mismos** skills de renderizado. Lo que cambia es **cómo se llega al guión/outline**, no cómo se produce el artefacto final.

---

## A · Slides / decks

**Principio: el guión JSON es la fuente única.** Un mismo `guion_*.json` produce PPTX editable *y* HTML navegable. No se autora HTML a mano ni se convierte HTML→PPTX (salvo respaldo).

```
contenido ─▶ guion_*.json ─┬─ build_from_guion.js      ─▶ <name>.pptx  (editable)
                           └─ build_html_from_guion.js  ─▶ <name>.html  (16:9, nav, print) ─▶ Chrome --print-to-pdf ─▶ PDF
```

| Skill | Entrada | Salida | Cuándo |
|---|---|---|---|
| `pptx-slides-builder` | `guion_*.json` (12 tipos de slide) | `.pptx` + `.html` | deck de sesión: overview, teoría (M1), taller (M3) |
| `marco-teorico-pbl` | sesión + PRDA + concepto | `marco_teorico_<sesion>.pptx` (A–D) | añadir capa PBL; se **inserta** en el deck M1 |
| `html-slides-builder` | contexto de sesión + outline | HTML 16:9 · (respaldo) `html_to_pptx.py` → PPTX imágenes | autoría HTML directa o cuando ya hay un HTML y se quiere PPTX |
| ~~`html2pptx`~~ | — | — | **ARCHIVADO** (paths Linux, pdftoppm/LibreOffice) |

**QA visual obligatorio** en ambos formatos. PPTX: PowerPoint COM → JPG. HTML: `Chrome --print-to-pdf` → PyMuPDF (`fitz`) → PNG → `Read`. Defectos típicos: eco de PptxGenJS cuando un h1/cita wrapea sin `fit:resize` (mantener ≤ ~36–50 chars en una línea), nodo navy-sobre-navy, footer solapado.

---

## B · Diagramas

```
fragmento de código ─▶ code-diagram-explainer ─▶ SVG inline (pseudo-código + flujo ✓/✗)
texto estructurado   ─▶ text-to-diagram      ─▶ SVG autónomo (sustituye al texto)
repositorio (código) ─▶ repo-code-explainer  ─▶ DOCX con un diagrama por unidad
```

| Skill | Entrada | Salida |
|---|---|---|
| `code-diagram-explainer` | nodo n8n · función · pipeline · workflow | SVG explicativo, se incrusta en guías/slides |
| `text-to-diagram` | texto/conceptos estructurados (metodología, marco, flujo) | SVG autónomo que sustituye al texto |
| `repo-code-explainer` | un repositorio de código | DOCX que explica el repo (un SVG por unidad) — `proceso-codigo` |

Familia de **activos visuales de curso**. Detalle estructural en `docs/proceso-diagramas/` y
`docs/proceso-codigo/`; vista visual en `_content-creation-map/04-diagramas.svg`.

---

## C · Documentos

```
Markdown (+LaTeX) ─▶ pdf-export ─┬─ Pandoc·KaTeX → HTML → Chrome   ─▶ PDF (por defecto)
                                 └─ WeasyPrint                    ─▶ PDF navegable (marcadores)

catálogo de temas ─▶ word-template-gen ─▶ plantilla Word (.docx) + render MD → PDF/Word/HTML
material curso APM ─▶ apm-docx-builder ─▶ DOCX  (otro curso · APM Terminals 2026)
```

| Skill | Ámbito | Entrada → Salida |
|---|---|---|
| `pdf-export` | global (usuario) | MD → PDF (Chrome fiel / WeasyPrint con bookmarks) |
| `word-template-gen` | global (usuario) | tema → DOCX + render MD; mismo estilo en PDF y Word |
| `apm-docx-builder` | local · otro curso | material APM → DOCX |

> Las guías paso a paso del curso (M2/M3) se autoran en HTML (paleta A4) y se imprimen con `Chrome --print-to-pdf`. No necesitan skill: es el mismo pipeline que un MD vía pdf-export, pero partiendo de HTML autorado.

---

## D · Lecciones y editorial (skills globales)

```
fuente (URL/PDF/texto) ─▶ lesson-from-source ─▶ lección estructurada
borrador ─▶ authorship-validator (VIDAL) ─▶ voice-refiner (≥85% humano) ─▶ artículo publicable
digest ─▶ atlas-slop-ai ─▶ matriz 2×2 (autoría × sustancia)
```

`lesson-from-source` alimenta el diseño instruccional; la cadena `authorship-validator → voice-refiner` y `atlas-slop-ai` sirven a la publicación editorial (Substack/LinkedIn), un dominio distinto del material docente. Viven en `~/.claude/skills/`.

---

## Ejemplo real cerrado — Módulo extra CrewAI

Caso trabajado de extremo a extremo bajo **Metodología B** (producción directa), sobre código congelado (`MVP-B_Crew_NCR/`, freeze `e72a375`):

| # | Material | Skill / pipeline | Salida en `CONTENT/PARTE2-Materiales/EXTRA-CrewAI/` |
|---|---|---|---|
| M4 | script de referencia | empaquetado (whitelist, sin `.env`) | `crew-ncr/` + `crew-ncr.zip` |
| M2 | guía práctica | HTML autorado → `Chrome --print-to-pdf` | `M2_guia-paso-a-paso_crewai.html` + `.pdf` |
| M3 | taller (S2) | `pptx-slides-builder` (guión único) | `M3_slides_taller_crewai.pptx` + `.pdf` + `.html` |
| M1 | teoría (S1) | `pptx-slides-builder` (guión único) | `M1_slides_teoria_crewai.pptx` + `.pdf` + `.html` |
| PBL | marco A–D | `marco-teorico-pbl` | `_PBL_Slides/marco_teorico_Extra-CrewAI.pptx` + `.pdf` |

M1 y M3 demuestran la **fuente única**: un `guion_*.json` → PPTX + HTML. El marco PBL se inserta en M1 (A tras portada · B/C antes de la idea clave · D tras el gate).

---

## Mapa de decisión

```
¿Cuál es el entregable?

SLIDES
  ├─ deck de sesión (overview/teoría/taller)
  │     → escribir guion_*.json → pptx-slides-builder → PPTX editable + HTML
  ├─ capa teórica PBL
  │     → marco-teorico-pbl → 4 slides A–D (insertar en M1)
  └─ ya existe un HTML autorado y quiero PPTX
        → html-slides-builder/html_to_pptx.py (imágenes · no editable)

DIAGRAMA de código        → code-diagram-explainer → SVG
DIAGRAMA de texto/marco   → text-to-diagram → SVG autónomo
DOCUMENTAR un repositorio → repo-code-explainer → DOCX (diagramas embebidos)
DOCUMENTO PDF (desde MD)  → pdf-export
DOCUMENTO Word            → word-template-gen · (curso APM) apm-docx-builder
GUÍA del curso (HTML→PDF) → autorar HTML + Chrome --print-to-pdf
```

---

## Requisitos y blockers vigentes

| Tema | Estado | Nota |
|---|---|---|
| Fuentes Syne + IBM Plex como fuentes de sistema | recomendado | Para QA visual fiel de PPTX/HTML; en HTML cargan vía Google Fonts, en PPTX dependen del sistema |
| `pdftoppm` para rasterizar PDF | no disponible (Windows) | Usar PyMuPDF (`fitz`) — ya instalado — en su lugar |
| Chrome headless `--print-to-pdf` | OK | Requiere `--headless=new` + `--user-data-dir`; matar procesos chrome colgados antes de reintentar |
| `html2pptx` | archivado | No usar; sustituido por la doble salida de `pptx-slides-builder` |
