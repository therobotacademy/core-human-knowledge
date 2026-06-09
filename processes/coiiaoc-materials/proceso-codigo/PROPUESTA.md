# Propuesta de proceso — Documentación de código (repo → diagramas + DOCX)

**Estado:** PROPUESTA (no es un proceso construido) · **Fecha:** 2026-06-08 · **Rama:** `skills/procesos`
**Slug futuro:** `proceso-codigo` · **Skill nuevo propuesto:** `repo-code-explainer`

> Este documento es una **propuesta**, no un `PROCESO.md` activo. Se llama `PROPUESTA.md` a propósito:
> `mapa-procesos-agente` solo descubre `docs/proceso-*/PROCESO.md`, así que esta carpeta **no entra
> en el lint** hasta que el skill exista (si se nombrara `PROCESO.md` con `skills: [repo-code-explainer]`,
> el lint lo marcaría como *skill colgante* porque aún no está instalado).

---

## 1. Motivación · el caso particular

Falta un proceso para **documentar el código de un repositorio**: convertir un codebase en un
documento navegable que **explique cada unidad** (función, clase, agente, nodo, tool) con un diagrama
y prosa didáctica. Hoy existen las piezas sueltas pero no el orquestador a escala de repo:

- `code-diagram-explainer` produce **un** SVG explicativo de **un** fragmento de código (`proceso-diagramas`).
- `apm-docx-builder` ensambla un **DOCX** con paleta v1.1 (`proceso-documentos`).

**Precedente que valida el patrón** — `CONTENT/PARTE2-Materiales/II3-LLM_Semantico/`:
`M_nodos-n8n-workflow_II3.docx` documenta los 9 nodos del workflow n8n de II3, con los 9 SVG de
`n8n-svg-nodes/` **embebidos**. Inspección del `.docx`: **18 ficheros de media = 9 SVG (vector) + 9
PNG (raster)**. Es decir, el patrón Word ya en uso es **embeber cada diagrama como par PNG+SVG**
(PNG para compatibilidad de visualización, SVG para calidad vectorial), ensamblado con la infraestructura
de `apm-docx-builder` (`gen_M_nodos_n8n_II3_docx.js`).

La propuesta **generaliza ese caso puntual a un proceso repetible** y lo aplica como caso concreto a un
repositorio Python (CrewAI), no a un workflow n8n.

---

## 2. Qué sería este proceso

Un proceso **compuesto** de la mitad "Top" del agente: un pipeline que, partiendo de un repositorio,
produce **una serie de diagramas + un DOCX que los integra con narrativa**. Cumple las cinco
invariantes de "proceso":

1. **Pipeline de N etapas** (inventariar → diagramar → rasterizar → ensamblar → QA).
2. **Acoplamiento por fichero** — cada etapa persiste su artefacto: inventario → `svg/NN-*.svg` →
   `png/NN-*.png` → `<repo>.docx`. Reanudable y auditable.
3. **Capa de fuentes inmutable** — el repositorio de código nunca se modifica.
4. **Puerta humana** — revisión del inventario (qué se documenta) y del DOCX final (firma).
5. **Un entregable** — el DOCX explicativo del repo.

**Topología:** un solo skill orquestador (`repo-code-explainer`) con **pipeline interno** + un **bucle
por unidad** (como Wiki: setup + bucle por fuente). El skill **compone** la gramática visual de
`code-diagram-explainer` y la infraestructura DOCX de `apm-docx-builder`; no las reimplementa.

**Frontera criterio↔determinismo:** *inventariar* y *diagramar* son **criterio** (leer el código,
elegir patrón, escribir pseudo-código literal); *rasterizar* y *ensamblar* son **deterministas**
(SVG→PNG, construir el `.docx`).

---

## 3. El skill nuevo · `repo-code-explainer`

| | |
| --- | --- |
| **Nombre (tentativo)** | `repo-code-explainer` (alt.: `codebase-doc-builder`, `codigo-a-docx`) |
| **Invoke** | "documenta el código de este repo", "genera la guía técnica del repositorio", "diagramas + DOCX del codebase", `/repo-code-explainer` |
| **Input** | ruta a un repositorio (o subcarpeta) de código fuente |
| **Output** | `svg/NN-<unidad>.svg` (serie) + `png/NN-<unidad>.png` (raster) + `<repo>.docx` (integrado) |
| **Compone** | gramática SVG de `code-diagram-explainer` · infra DOCX de `apm-docx-builder` |
| **NO hace** | no modifica el código; no es para un solo fragmento (eso es `code-diagram-explainer`); no es para texto/prosa (eso es `text-to-diagram`) |

### Diferencia clave con `code-diagram-explainer`

`code-diagram-explainer` renderiza **inline** (`visualize:show_widget`) y documenta **una** unidad.
`repo-code-explainer` opera **a escala de repo** y debe **persistir SVG a fichero** (para rasterizar y
embeber en Word). Decisión de diseño a tomar: (a) extender `code-diagram-explainer` para emitir también
ficheros `.svg`, o (b) que `repo-code-explainer` incruste la gramática y emita ficheros directamente
(como hizo `scripts/gen_proceso_svgs.py` en esta misma sesión). **Recomendado: (a)** — una sola fuente
de la gramática visual, dos modos de salida (widget | fichero).

---

## 4. Arquitectura de artefactos

| Capa | Mutabilidad | Propietario | Qué contiene |
|---|---|---|---|
| **Fuentes** 🔒 | inmutable | — | el repositorio de código (p. ej. `MVP-Crew_NCR/`: `agents.py`, `tasks.py`, `tools.py`, `main.py`, `data/`) |
| **Inventario** | regenerable | el proceso | `inventario.md`/`.json` — lista de unidades + patrón visual asignado + orden |
| **Intermedios** | regenerable | el proceso | `svg/NN-<unidad>.svg` (gramática v1.1) → `png/NN-<unidad>.png` (raster para Word) |
| **Entregable** | mutable | el humano | `<repo>.docx` — portada + una sección por unidad (narrativa + imagen embebida PNG+SVG) |

Acoplamiento por fichero en toda la cadena: **código → inventario → SVG → PNG → DOCX**.

---

## 5. Pipeline de etapas

1. **Inventariar** *(criterio)* — escanear el repo, listar las **unidades documentables** (clases,
   funciones públicas, agentes, tasks, tools, nodos, modelos) y asignar a cada una el **patrón visual**
   de `code-diagram-explainer` (checks secuenciales · ensamblaje · configuración declarativa ·
   bifurcación · bucle). Emite `inventario.md`. **Puerta humana #1:** se revisa qué entra.
2. **Diagramar** *(criterio)* — por unidad, leer el **código real** y producir el SVG con la gramática
   v1.1 (pseudo-código literal, ramas ✓/✗, badges, leyenda). Persistir a `svg/NN-<unidad>.svg`.
3. **Rasterizar** *(determinista)* — `svg/*.svg` → `png/*.png` vía Chrome `--headless --screenshot` o
   PyMuPDF (`fitz`), DPI ~140. Necesario porque Word no garantiza render SVG en todos los visores.
4. **Ensamblar** *(determinista)* — DOCX con `apm-docx-builder` (`docx-apm-utils.js`): portada +
   índice + una sección por unidad (`blockHdr` + 2–4 líneas de prosa "por qué" + imagen **embebida
   como PNG con el SVG vectorial detrás**, patrón del II3). Validar ZIP≥26 / XML.
5. **QA** *(humano + determinista)* — DOCX válido + revisión visual de cada diagrama (sin overflow,
   pseudo-código legible). **Puerta humana #2:** firma del DOCX. Máx. 2 ciclos.

---

## 6. Caso concreto · `MVP-Crew_NCR`

Ruta: `CONTENT/PARTE2-coiiaoc-Materiales/II-CrewIA/MVP-Crew_NCR/` (Crew CrewAI 1.x, ~577 líneas en 5
`.py`). Inventario real de unidades y su patrón visual asignado (análogo a los 9 nodos del II3):

| # | Unidad | Fuente | Patrón `code-diagram-explainer` |
|---|---|---|---|
| 01 | **Orquestación del Crew** (secuencial, 3 agentes, `tasks_output`→JSON) | `main.py` `run()` + `Crew(Process.sequential)` | flujo / pipeline |
| 02 | **Agente `clasificador`** (severidad AS9100 · cláusula · contención) + tool `lookup_tipo_nc` | `agents.py` | configuración declarativa |
| 03 | **Agente `causas`** (análisis 8D D1–D5) + tool `lookup_causas_raiz` | `agents.py` | configuración declarativa |
| 04 | **Agente `planes`** (CAPA · confianza · alertas, sin tool) | `agents.py` | configuración declarativa |
| 05 | **Cadena de Tasks** (`context=` encadenado + `output_pydantic`) | `tasks.py` `build_tasks` | flujo de checks |
| 06 | **Modelos Pydantic** (`Clasificacion` · `Analisis8D` · `AccionCorrectiva` · `PlanFinal`) | `tasks.py` | ensamblaje / estructura |
| 07 | **Tool `lookup_tipo_nc`** (match catálogo + fallback conservador) | `tools.py` | bifurcación |
| 08 | **Tool `lookup_causas_raiz`** (validación de área + top-3 por frecuencia) | `tools.py` | bifurcación |

→ **~8 SVG + ~8 PNG embebidos** en `MVP-Crew_NCR.docx`. (`run_test_set.py` y `data/*.csv` se citan en
prosa pero no necesitan diagrama propio; decisión a confirmar en la etapa de inventario.)

Este caso es ideal como **primer caso de validación** del skill: pequeño, autocontenido, con los tres
tipos de unidad CrewAI (agent · task · tool) + orquestación + contrato de datos — cubre casi todos los
patrones de la gramática en un solo repo.

---

## 7. Encaje en el mapa de procesos

`proceso-codigo` sería un **cuarto proceso** de generación que **compone** los otros dos:

- comparte la **gramática SVG** con `proceso-diagramas` → relación `informa`;
- comparte la **infraestructura DOCX** con `proceso-documentos` → relación `informa`.

**Frontmatter que tendría su `PROCESO.md`** (cuando el skill exista):

```yaml
proceso: codigo
titulo: Documentación de código (repo → diagramas + DOCX)
orden: 4
estado: documentado          # mientras sea propuesta: futuro
lane: generacion
color: "#5d4037"
skills: [repo-code-explainer]
entregable: "DOCX explicativo del repo (SVG embebidos)"
actualizado: 2026-06-08
relaciones:
  - {hacia: diagramas, tipo: informa, etiqueta: "comparte gramática SVG"}
  - {hacia: documentos, tipo: informa, etiqueta: "comparte infra DOCX"}
```

**Para que aparezca YA en el mapa como futuro** (sin construir el skill), declararlo en el frontmatter
`futuros:` de `docs/AGENTE-PROCESOS/PROCESO.md` **con `skills: []`** (si se pusiera el skill aún
inexistente, el lint daría *colgante*). Pasaría a proceso real con su `PROCESO.md` cuando se implemente
`repo-code-explainer`.

---

## 8. Decisiones abiertas

| # | Decisión | Opciones |
|---|---|---|
| 1 | Emisión de SVG a fichero | (a) extender `code-diagram-explainer` con modo-fichero · (b) skill nuevo lo incrusta |
| 2 | Rasterizado SVG→PNG | Chrome `--headless --screenshot` · PyMuPDF (`fitz`) — ambos disponibles en Windows |
| 3 | Alcance del inventario | ¿toda función pública? ¿solo unidades "didácticas"? ¿incluir tests/harness? |
| 4 | Dominio del DOCX | `apm-docx-builder` es "otro curso (APM)"; ¿generalizar su `docx-apm-utils.js` a un módulo de curso-neutro? |
| 5 | Nombre del skill | `repo-code-explainer` · `codebase-doc-builder` · `codigo-a-docx` |
| 6 | Alta en el mapa | ¿declarar `futuro` ahora, o esperar a construir el skill? |

---

## 9. Siguientes pasos sugeridos

1. **Validar esta propuesta** y fijar las decisiones del §8.
2. (Opcional) Declarar `codigo` como `futuro` en `docs/AGENTE-PROCESOS/PROCESO.md` (`skills: []`) y
   regenerar el mapa → aparecería como caja discontinua "◌ futuro".
3. **Construir `repo-code-explainer`** con `MVP-Crew_NCR` como caso de validación (como Corrección/Wiki
   validaron `build-single-process`): los ~8 diagramas + el DOCX forzarán refinar la gramática a escala repo.
4. **Documentar el proceso** con `build-single-process` (crear `docs/proceso-codigo/PROCESO.md` con el
   frontmatter del §7) y **regenerar el mapa** con `mapa-procesos-agente`.

---

*Propuesta · sesión 2026-06-08 (`sessions/26.06.08-LOG-kit-process-oriented-agent.md`).
Precedente: `CONTENT/PARTE2-Materiales/II3-LLM_Semantico/M_nodos-n8n-workflow_II3.docx` (+ `n8n-svg-nodes/`).
Caso concreto: `CONTENT/PARTE2-coiiaoc-Materiales/II-CrewIA/MVP-Crew_NCR/`.
Procesos hermanos: `docs/proceso-diagramas/`, `docs/proceso-documentos/`.*
