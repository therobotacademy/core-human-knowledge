# pSkills — COIIAOC LuminaBeta

Skills are reusable Claude Code behaviors stored in `.claude/skills/`. Each skill has a `SKILL.md` that defines trigger phrases, inputs, outputs, and execution rules. Claude loads a skill's instructions when invoked — either automatically on matching context or explicitly via `/skill-name`.

## How skills work

- **Automatic trigger:** Claude recognizes trigger phrases in the conversation and activates the skill without explicit command.
- **Explicit invocation:** Type `/skill-name` to force-activate a skill regardless of context.
- Skills are stateless — they load fresh from `SKILL.md` on each invocation.

> **Mapa visual de toda la casuística:** [`_content-creation-map/`](_content-creation-map/) — 5 SVG (overview · slides · documentos · diagramas · lecciones/editorial) que muestran entrada → skill → salida. Esta tabla es el texto; los SVG son el mapa.
>
> **Vista estructural (procesos):** la lista de skills por **proceso**, sus relaciones y la invariante «sin huérfanos» viven en [`docs/AGENTE-PROCESOS/`](../../docs/AGENTE-PROCESOS/PROCESO.md), regenerada por `mapa-procesos-agente`. Esta README/`USE-CASES.md` son la vista **operativa** (entrada→skill→salida); el mapa de procesos es la vista **estructural**.

---

## Familias de creación de contenido

| Familia                             | Skills (local)                                                                                                      | Salida                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Slides / decks**            | `pptx-slides-builder` · `html-slides-builder` · `marco-teorico-pbl` · ~~`html2pptx`~~                   | PPTX · HTML · PDF               |
| **Diagramas**                 | `code-diagram-explainer` · `text-to-diagram`                                                                   | SVG                               |
| **Guías / docs**             | `md-guide-builder`                                                                                                | `.md` + `.svg` (par de guía) |
| **Documentos**                | `apm-docx-builder` · (globales: `pdf-export`, `word-template-gen`)                                           | DOCX · PDF                       |
| **Documentación de código** | `repo-code-explainer` (compone Diagramas + Documentos) → [`proceso-codigo`](../../docs/proceso-codigo/PROCESO.md) | DOCX (SVG embebidos)              |

Skills de edición editorial y lecciones (`lesson-from-source`, `authorship-validator`, `voice-refiner`, `atlas-slop-ai`) son **de usuario** (`~/.claude/skills/`), no viven en este repo; aparecen en la hoja 03 del mapa por completitud.

---

## Slides / decks

### `pptx-slides-builder` — guión JSON → PPTX **y** HTML (fuente única)

Genera decks COIIAOC (overview, teoría, taller) desde un guión JSON estructurado. **El guión es la fuente única**: el mismo fichero produce PPTX editable y HTML navegable.

|                  |                                                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Invoke** | `/pptx-slides-builder` · "crea la presentación/deck/overview de sesión", menciones de VERBEX/PRDA/IO-RE en material docente                                                          |
| **Input**  | guión JSON (`assets/guion_schema.json`) — tipos: portada · portada_secundaria · contenido_cards · flujo · tabla · iore · divider · gate · impacto · cierre · preview_sesion |
| **Output** | `build_from_guion.js` → `<name>.pptx` (editable) · `build_html_from_guion.js` → `<name>.html` (16:9, nav ← →, contador, print) · ambos a `PPTX_OUT_DIR` o `SAMPLE/`     |
| **Do NOT** | autorar el HTML a mano ni convertir HTML→PPTX — se escribe**un** guión y se generan ambos                                                                                        |

Pipeline: redactar guión → `node scripts/build_from_guion.js` (y/o `build_html_from_guion.js`) → **QA visual obligatorio** (PowerPoint COM → JPG, o Chrome `--print-to-pdf` → PyMuPDF para el HTML) → corregir guión (máx 2 ciclos). Leer `references/coiiaoc-tokens.md` antes de tocar coordenadas/colores.

### `html-slides-builder` — design system de decks HTML + conversor de respaldo

Sistema de diseño (tokens, tipografía, patrones A–E) para decks HTML COIIAOC autorados a mano. Incluye `scripts/html_to_pptx.py` como **respaldo**: convierte un HTML ya terminado en PPTX de imágenes (no editable, fidelidad visual) vía Chrome→PDF→PyMuPDF→python-pptx.

|                            |                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Invoke**           | `/html-slides-builder` · "produce slides", "haz las slides", "arranca M1" (cuando se autora HTML directamente, no desde guión) |
| **Input**            | contexto de sesión (`README_<sesion>.md`), outline de 8–12 slides                                                              |
| **Output**           | HTML 16:9 autocontenido · (respaldo)`html_to_pptx.py` → PPTX de imágenes                                                      |
| **Fuente de verdad** | `html-slides-builder/assets/paleta_curso.html` v1.1                                                                              |

**Convenciones editoriales** (aplican a HTML *y* PPTX, en generación no como corrección): `IDEA CLAVE` (no `IDEA FUERZA`), h1 de 2–4 palabras, sin meta-etiquetas (`Nota pedagógica:`…), sin SHA/commits en badges, copyright solo en slide 1. Ver sección "Editorial conventions" del `SKILL.md`.

### `marco-teorico-pbl` — 4 slides de marco teórico (PBL)

Convierte una sesión en Project Based Learning genuino añadiendo 4 slides A–D: A concepto formal · B taxonomía · C mecanismo · D cierre transferible.

|                      |                                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Invoke**     | "añade el marco teórico", "convierte en PBL", "slide A a D" · proactivo en sesión nueva II2–II6 / Extra                                                               |
| **Input**      | nº de sesión + fase PRDA + concepto central (o PPTX de la sesión). Conceptos predefinidos en `references/concepto-por-fase.md`; derivación para sesiones no listadas |
| **Output**     | `marco_teorico_<sesion>.pptx` (4 slides) → `CONTENT/PARTE2-Materiales/_PBL_Slides/` · re-guardado con python-pptx                                                    |
| **Inserción** | A tras portada · B/C antes de la idea clave · D tras el gate del deck M1                                                                                                 |

### `html2pptx` — **ARCHIVADO · no usar**

Scripts rotos en Windows (paths `/home/claude/`, bash puro, dependencias `pdftoppm`/LibreOffice no disponibles). Para PPTX usar `pptx-slides-builder` (desde guión). Para convertir un HTML ya autorado, `html-slides-builder/scripts/html_to_pptx.py`.

---

## Diagramas

### `code-diagram-explainer` — código → SVG explicativo

Diagramas SVG inline que explican un fragmento de código (nodo n8n, función, pipeline, clase): pseudo-código real + flujo de control con ramas ✓/✗ + anotaciones + paleta v1.1.

|                  |                                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Invoke** | "explica este nodo", "diagrama del nodo", "esquema visual del código", "explica visualmente" · proactivo si ya hay otros diagramas de nodos en la sesión |
| **Input**  | fragmento de código fuente                                                                                                                                 |
| **Output** | SVG inline (se incrusta en guías/slides del curso)                                                                                                         |

### `text-to-diagram` — texto estructurado → SVG autónomo

Convierte descripciones de metodologías, marcos conceptuales y flujos en SVG autónomo que sustituye al texto. Complementa a `code-diagram-explainer` (que trabaja sobre código fuente); este skill trabaja sobre texto/conceptos.

|                  |                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Invoke** | `/text-to-diagram` · "convierte en diagrama", "diagrama de este marco/flujo/metodología" |
| **Input**  | texto estructurado (metodología, marco, lista de pasos, relaciones)                         |
| **Output** | SVG autónomo inline                                                                         |

---

## Guías / docs

### `md-guide-builder` — tema/notas → guía `.md` + `.svg` (estilo casa)

Produce una **guía práctica** en el estilo de la categoría `guides/`: documento
`NN-TIPO-tema.md` (idea rectora + secciones + tabla resumen + chuleta de comandos) con
su **SVG autoexplicativo** (paleta COIIAOC · tipografía V2). Funciona dentro del repo
(numera y coloca en `guides/`) o en cualquier otra carpeta donde se trabaje.

|                  |                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Invoke** | `/md-guide-builder` · "haz una guía", "genera un cheatsheet/tutorial/procedimiento", "documenta esto como guía", "dame la plantilla portátil" |
| **Input**  | un tema o notas crudas + el TIPO (CHEATSHEET · TUTORIAL · PROCEDIMIENTO · REFERENCIA)                                                            |
| **Output** | `NN-TIPO-tema.md` (+ `.svg` mismo basename) en `guides/` (in-repo) o en el dir actual (anywhere)                                              |
| **Extra**  | emite un**prompt portátil** (`assets/PROMPT-TEMPLATE.md`) para copiar y pegar el estilo en cualquier sesión, sin el repo                  |

---

## Documentos

### `apm-docx-builder` — material de curso → DOCX

Convierte materiales (MD) a `.docx` imprimibles con paleta v1.1. **Otro curso** (APM Terminals 2026). Usa `scripts/docx-apm-utils.js` + un `gen_Mx_Bx_docx.js` por documento.

|                  |                                                                   |
| ---------------- | ----------------------------------------------------------------- |
| **Invoke** | "versión Word", "DOCX", "documento para imprimir" de un material |
| **Output** | `<material>.docx`                                               |

### Globales (usuario, no en este repo)

- **`pdf-export`** — Markdown (+LaTeX) → PDF. Pandoc·KaTeX → HTML → Chrome (por defecto), o WeasyPrint (PDF con marcadores).
- **`word-template-gen`** — catálogo de temas → plantilla Word (.docx) + render MD → PDF/Word/HTML (mismo estilo en PDF y Word).

> Las guías HTML del curso (M2/M3) se autoran en HTML y se imprimen a PDF con `Chrome --print-to-pdf` (no necesitan skill).

---

## Documentación de código

### `repo-code-explainer` — repositorio → SVG por unidad + DOCX integrado

Skill **orquestador** que convierte un repositorio completo en un paquete de documentación de código: un SVG por unidad (función, clase, agente, task, tool, nodo) con la gramática visual COIIAOC v1.1, rasterizados a PNG, y ensamblados en un DOCX con narrativa "por qué". Compone `code-diagram-explainer` (gramática SVG) y `apm-docx-builder` (motor DOCX) a escala de repo.

|                  |                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Invoke** | `/repo-code-explainer` · "documenta el código de este repo", "genera la guía técnica del repositorio", "diagramas + DOCX del codebase" |
| **Input**  | ruta al repo fuente (Python) → `inventory.py` (AST) emite `inventario.json`; contenido rico de cada diagrama curado a mano              |
| **Output** | `svg/NN-<unidad>.svg` · `png/NN-<unidad>.png` · `<repo>.docx` (portada + sección por unidad) — siempre **fuera** del repo fuente       |
| **Estado** | PROTOTIPO (2026-06-08) · validado sobre `MVP-Crew_NCR` (8 unidades)                                                                        |

Pipeline (5 etapas): **inventariar** (AST → `inventario.json`, puerta humana #1) → **diagramar** (SVG por unidad, pseudo-código literal del fuente) → **rasterizar** (SVG → PNG, PyMuPDF) → **ensamblar** (DOCX python-docx, PNG+SVG embebidos) → **QA** (puerta humana #2).

```powershell
python .claude/skills/repo-code-explainer/inventory.py <repo>   # → inventario.json
python .claude/skills/repo-code-explainer/gen_repo_diagrams.py  # → svg/
python .claude/skills/repo-code-explainer/build_docx.py         # → png/ + .docx
```

Distinto de `code-diagram-explainer` (un fragmento, render inline) y de `apm-docx-builder` (DOCX sin fase de diagramado).

---

## Guía de selección

```
¿SLIDES?
├─ Autoría desde guión JSON   → pptx-slides-builder  → PPTX editable + HTML (fuente única)
├─ Marco teórico PBL (A–D)     → marco-teorico-pbl    → PPTX insertable en M1
└─ Ya tienes HTML autorado y quieres PPTX
                               → html-slides-builder/html_to_pptx.py  (imágenes · no editable)
   (html2pptx ARCHIVADO — no usar)

¿DIAGRAMA de código?           → code-diagram-explainer → SVG
¿DIAGRAMA de texto/conceptos?  → text-to-diagram        → SVG

¿DOCUMENTO?
├─ Markdown → PDF              → pdf-export        (global)
├─ Tema → DOCX + render        → word-template-gen (global)
└─ Material curso APM → DOCX   → apm-docx-builder

¿DOCUMENTACIÓN DE CÓDIGO?      → repo-code-explainer → SVG/PNG + DOCX integrado
```

Detalle completo de cada flujo en [`_content-creation-map/`](_content-creation-map/) y casuística por metodología en [`USE-CASES.md`](USE-CASES.md).

---

## Gobernanza · FIRST-CODE-THEN-LEARN

El código es la fuente de verdad. Una sesión del curso no produce materiales (M1–M5) hasta que su código pasa un checkpoint de freeze. Orden por sesión: M2/M3 (estables) → M1 (síntesis) → M5 (frágil). Ref: `CONTENT/PARTE2-Materiales/plan_first-code-then-learn.md`.

## Adding a new skill

1. Create `.claude/skills/<slug>/SKILL.md` — define triggers, inputs, outputs, pipeline, constraints.
2. Add an entry to this README (en su familia) y, si aplica, al mapa `_content-creation-map/`.
3. Register trigger phrases in `.claude/settings.json` if automatic activation is needed.
