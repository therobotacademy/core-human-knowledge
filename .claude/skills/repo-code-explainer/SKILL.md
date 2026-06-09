---
name: repo-code-explainer
description: >
  Documenta el CÓDIGO de un repositorio como un paquete didáctico: una serie de
  diagramas SVG (uno por unidad — función, clase, agente, task, tool, nodo) con la
  gramática visual COIIAOC v1.1, rasterizados a PNG y ensamblados en un DOCX que los
  embebe con narrativa "por qué". Orquesta a escala de repo: compone la gramática de
  code-diagram-explainer (un fragmento → SVG) y la infraestructura DOCX de
  apm-docx-builder (material → DOCX con imágenes embebidas).

  Activa este skill cuando el usuario pida "documenta el código de este repo",
  "genera la guía técnica del repositorio", "diagramas + DOCX del codebase",
  "explica el código de <repo> en un Word", o `/repo-code-explainer`.

  Distinto de code-diagram-explainer (UN fragmento, render inline) y de apm-docx-builder
  (DOCX sin la fase de diagramado). Este parte de un REPOSITORIO y entrega SVG+PNG+DOCX.
license: Proprietary — Bernardo Ronquillo Japón
---

# repo-code-explainer · PROTOTIPO

> **ESTADO: PROTOTIPO (2026-06-08).** Primera implementación, validada sobre
> `MVP-Crew_NCR` (Crew CrewAI · 3 agentes · 3 tasks · 2 tools · 4 modelos). Propuesta y
> contexto en `docs/proceso-codigo/PROPUESTA.md`. Precedente del patrón DOCX+SVG:
> `CONTENT/PARTE2-Materiales/II3-LLM_Semantico/M_nodos-n8n-workflow_II3.docx`.

Skill **orquestador** de la mitad "Top" del agente. Convierte un repositorio en un
**paquete de documentación de código**: SVG por unidad + DOCX que los integra. No
reimplementa la gramática visual ni el motor DOCX: los **compone**.

---

## 1. Salida

```
<out>/
├── svg/   NN-<unidad>.svg     ← un SVG por unidad de código (gramática v1.1)
├── png/   NN-<unidad>.png     ← rasterizado (para embeber en Word)
└── <repo>.docx                ← portada + una sección por unidad (narrativa + imagen)
```

NUNCA escribir dentro del repo fuente (puede ser un git anidado / submódulo): la salida
va a una carpeta de materiales **fuera** del repo.

---

## 2. Pipeline (5 etapas · criterio ↔ determinismo)

1. **Inventariar** — listar las **unidades documentables** (clase, función, agente, task, tool,
   modelo, orquestación) y asignar a cada una el **patrón** de `code-diagram-explainer`: checks ·
   ensamblaje · config declarativa · bifurcación · bucle. **Automatizado en `inventory.py`**
   (escaneo AST → `inventario.json`). **Puerta humana #1** (revisar qué entra).
2. **Diagramar** *(criterio)* — por unidad, leer el **código real** (nunca de memoria) y
   producir el SVG: pseudo-código **literal**, ramas ✓/✗, badges, leyenda. Persistir a fichero.
3. **Rasterizar** *(determinista)* — `svg/*.svg` → `png/*.png` con PyMuPDF (`fitz`) a DPI ~150.
4. **Ensamblar** *(determinista)* — DOCX: portada + por unidad (`blockHdr` + 2–4 líneas de
   prosa "por qué" + imagen embebida). Validar ZIP≥26 / XML.
5. **QA** *(humano + determinista)* — DOCX válido + revisión visual de cada diagrama. **Puerta humana #2.**

---

## 3. Gramática visual (heredada de code-diagram-explainer · paleta v1.1)

`viewBox="0 0 680 H"`. Clases de color por semántica:

| Clase | fill | stroke | Uso |
|---|---|---|---|
| `c-blue` | `#EBF4FF` | `#2E6B9E` | contenedor de unidad, secciones principales |
| `c-purple` | `#EEEDFE` | `#534AB7` | config / condiciones / checks |
| `c-teal` | `#E6F7F2` | `#0D7C5A` | salidas, escritura, outputs |
| `c-amber` | `#FFF7ED` | `#B45309` | degradaciones, fallback, stubs |
| `c-red` | `#FFF5F5` | `#B91C1C` | errores, throws |
| `c-gray` | `#FAFAF7` | `#9B9B9B` | upstream/downstream; nodo principal `#1E3A5F` + texto `#FF8C3B` |

Pseudo-código en IBM Plex Mono (fallback `monospace`); **expresión literal del fuente**, no paráfrasis.

---

## 4. Implementación del prototipo

- `inventory.py` — **etapa 1 automática**: escaneo AST de un repo Python → unidades + patrón
  (agente · task · tool · modelo · orquestación · función). Emite `inventario.json`. Genérico
  (cualquier repo Python); valida la lista de unidades del caso.
- `gen_repo_diagrams.py` — etapa 2: render de los SVG **importando** la gramática compartida
  `code-diagram-explainer/svg_grammar.py` (modo-fichero); aquí solo viven las *specs* de contenido.
  **Consume `inventario.json`**: cruza cobertura (curado ↔ unidades reales) y **auto-stubea** los core
  sin curar. El **contenido rico** de cada diagrama sigue curado a mano (ver §6).
- `build_docx.py` — etapas 3-4: rasteriza SVG→PNG (`fitz`) y ensambla el DOCX (`python-docx`).

```powershell
python .claude/skills/repo-code-explainer/inventory.py <repo>     # → inventario.json
python .claude/skills/repo-code-explainer/gen_repo_diagrams.py    # → svg/
python .claude/skills/repo-code-explainer/build_docx.py           # → png/ + .docx
```

---

## 5. Caso de validación · MVP-Crew_NCR (8 unidades)

| # | Unidad | Fuente | Patrón |
|---|---|---|---|
| 01 | Orquestación del Crew (secuencial) | `main.py` `run()` | flujo |
| 02 | Agente `clasificador` (+tool `lookup_tipo_nc`) | `agents.py` | config declarativa |
| 03 | Agente `causas` (8D, +tool `lookup_causas_raiz`) | `agents.py` | config declarativa |
| 04 | Agente `planes` (CAPA, sin tool) | `agents.py` | config declarativa |
| 05 | Cadena de Tasks (`context` + `output_pydantic`) | `tasks.py` | flujo de checks |
| 06 | Modelos Pydantic (contrato structured output) | `tasks.py` | ensamblaje |
| 07 | Tool `lookup_tipo_nc` (match + fallback) | `tools.py` | bifurcación |
| 08 | Tool `lookup_causas_raiz` (validación + top-3) | `tools.py` | bifurcación |

---

## 6. Estado Phase-2 (decisiones §8 de la PROPUESTA)

- ✅ **Auto-inventario + cross-check**: `inventory.py` (AST) detecta unidades; `gen_repo_diagrams.py`
  **consume `inventario.json`** → valida cobertura (ningún core sin diagrama, ningún diagrama sobre
  unidad inexistente) y **auto-stub** de los core sin curar. *Lo que sigue curado a mano* es el
  **contenido rico** (pseudo-código/ramas); los auto-stubs son mínimos (firma/campos/role).
- ✅ **Nombre** fijado: `repo-code-explainer`.
- ✅ **DOCX vectorial PNG+SVG**: embebe cada diagrama como **par PNG+SVG** (capa `asvg:svgBlip`, el
  patrón del II3) con `python-docx` + inyección OOXML (`attach_svg`), **sin Node**. Verificado: 16 media
  (8 PNG + 8 SVG), 8 `svgBlip`, Content_Types `svg`. *(el render vectorial en Word tiene la misma
  estructura que el II3 conocido-bueno; no verificable aquí sin Word).*
- ✅ **Motor DOCX curso-neutro**: el engine Node se extrajo a `_shared/docx-core.js` (paleta + helpers +
  `makeDoc` genéricos); `apm-docx-builder/docx-apm-utils.js` es ahora un alias por compatibilidad.
  repo-code-explainer no lo necesita (va por `python-docx`), pero queda disponible para cursos nuevos.
- ✅ **Modo-fichero unificado**: la gramática SVG vive en `code-diagram-explainer/svg_grammar.py`;
  `gen_repo_diagrams.py` la **importa** (ya no se duplica). Salida byte-idéntica verificada.
