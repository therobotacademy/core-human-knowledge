# Quick Skill — Chuleta Operativa del Agente

> Guía rápida de ejecución para usuarios que ya conocen los procesos. Sin teoría ni preámbulos: qué pedir, qué dar de entrada y qué genera el agente.

---

## 1. Mapa de decisión rápida

| Entregable deseado | Pide al agente | Entrada necesaria | Salida generada |
|---|---|---|---|
| **Guía práctica numerada** | `"Procesa esta guía como [TIPO]"` | Fichero MD o notas en `raw/` | `guides/NN-TIPO-tema.md` + `.svg` |
| **Diagrama conceptual/flujo** | `"Convierte esto en diagrama"` | Texto estructurado / pasos | SVG autónomo (paleta COIIAOC v2) |
| **Diagrama de código/nodo** | `"Explica visualmente este código/nodo"` | Fragmento de código / nodo | SVG (pseudocódigo + ramas ✓/✗) |
| **Deck completo (PPTX + HTML)** | `"Genera presentación desde guión"` | `guion_*.json` estructurado | `.pptx` (editable) + `.html` (16:9) |
| **Slides HTML directas** | `"Genera slides HTML para esta sesión"` | Outline / Markdown de sesión | `.html` 16:9 (+ `.pptx` de respaldo) |
| **Marco teórico PBL (4 slides)** | `"Añade el marco teórico PBL"` | Nº sesión + concepto central | `marco_teorico_<sesion>.pptx` (A–D) |
| **Documentación de repositorio** | `"Documenta este repositorio"` | Repositorio o carpeta de código | DOCX estructurado con SVG por unidad |
| **Exportación a PDF navegable** | `"Exporta a PDF con marcadores"` | Fichero Markdown (+LaTeX) | PDF vía Chrome headless / WeasyPrint |

---

## 2. Instrucciones por entregable

### A. Guías prácticas (`guides/`)
- **Disparador:** Deja caer el material crudo en `raw/`.
- **Prompt:** `"Procesa raw/<archivo>.md como [CHEATSHEET | TUTORIAL | PROCEDIMIENTO | REFERENCIA]"`.
- **Comportamiento autónomo del agente:**
  1. Busca el siguiente número `NN` en `guides/` (ej. si existen 01, 02, 03 → asigna `04`).
  2. Nombra canónicamente `NN-TIPO-tema-en-kebab.md`.
  3. Genera en paralelo el diagrama complementario `NN-TIPO-tema-en-kebab.svg` (paleta COIIAOC v2, 1200 px, autocontenido).
  4. Actualiza la tabla de categorías en `README.md`.
  5. Conserva intacto el archivo original en `raw/`.

### B. Diagramas SVG (`text-to-diagram` & `code-diagram-explainer`)
- **Texto/Procesos:** Pide `"Diagrama de este marco/metodología"`. Pasa listas numeradas o jerarquías. Produce un SVG que sustituye al texto explicativo.
- **Código/Lógica:** Pide `"Diagrama del nodo <X>"`. Pasa la función o nodo (ej. JavaScript, Python, n8n). Produce un SVG con bloques de pseudocódigo real y bifurcaciones de éxito/fallo.
- **Estándar visual:** Fondo `#F5F2EC`, banda superior navy `#1E3A5F` (58 px) con acento `#FF8C3B` (6 px), tipografía `Segoe UI` y `Consolas`.

### C. Presentaciones (`pptx-slides-builder` & `html-slides-builder`)
- **Vía Fuente Única (Recomendada):**
  - Escribe o pide generar el guión JSON (`assets/guion_schema.json`).
  - Ejecuta / pide: `node scripts/build_from_guion.js` y `node scripts/build_html_from_guion.js`.
  - Produce a la vez el PPTX editable y el HTML para navegador.
- **Vía HTML directa:**
  - Pide diseñar directamente el HTML 16:9 con tokens COIIAOC.
  - Respaldo a PPTX: `python scripts/html_to_pptx.py input.html output.pptx` (renderiza slides como imágenes).
- **Marco PBL (4 slides A–D):**
  - Prompt: `"Genera marco PBL para sesión <N> sobre <Concepto>"`.
  - Produce A (concepto formal), B (taxonomía), C (mecanismo), D (cierre transferible) para intercalar en el deck principal.

### D. Documentos y código (`repo-code-explainer` & `pdf-export`)
- **Auditoría/Explicación de repos:** Pide `"Explica el repo <ruta>"` → analiza componentes, dibuja un SVG por cada módulo y ensambla el DOCX final.
- **Exportar Markdown a PDF:**
  - Sin marcadores: Pandoc → HTML → Chrome headless (`--headless=new --print-to-pdf`).
  - Con índice/bookmarks: Pandoc → WeasyPrint.

---

## 3. Invariantes no negociables

1. **`raw/` es de solo lectura:** Nunca borres ni modifiques ficheros en `raw/`. Son la fuente histórica original.
2. **Numeración `NN-` fija:** Una vez asignado un número en `guides/`, jamás se reutiliza ni se reordena.
3. **El SVG debe leerse solo:** Si un diagrama requiere abrir el Markdown para entender la idea rectora, el diagrama es defectuoso.
4. **Sin preguntas intermedias innecesarias:** El agente procesa, numera y formatea sin pedir confirmación, salvo si hay ambigüedad destructiva.
