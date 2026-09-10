# Core Human Knowledge

PENDIENTES:

- See tag `paleta_curso_V2' en 53-APM. Esto aplica a nivel top, no modifica los skills!!

> Este repositorio contiene aquel conocimiento práctico que delego habitualmente en Claude, y que no debo olvidar.

Es una **base de conocimiento personal** pensada para trabajarse *con* Claude Code: el material crudo entra, Claude lo procesa a un formato canónico, y el resultado queda versionado para no perderse. Las reglas operativas que Claude sigue al procesar viven en [`CLAUDE.md`](CLAUDE.md).

---

## Cómo funciona — modelo de dos niveles

1. **`raw/` = bandeja de entrada.** Aquí «caen» los ficheros sin procesar (un MD que es una guía, notas, un volcado…). El original se conserva intacto como fuente.
2. **Carpetas de categoría = salida curada.** Cada categoría transforma ese material crudo a su formato canónico (p. ej. una guía numerada con su diagrama). La numeración `NN-` es consecutiva y estable: nunca se reutiliza.

El detalle del disparador, el procesado paso a paso y la gramática visual de los diagramas está en [`CLAUDE.md`](CLAUDE.md).

---

## Estructura

```
core-human-knowledge/
├── AGENTS.md            ← instrucciones del repositorio para agentes (Antigravity)
├── CLAUDE.md            ← reglas operativas para Claude Code
├── README.md            ← este documento
├── quick-skill.md       ← chuleta operativa densa de comandos y skills
├── raw/                 ← bandeja de entrada (material crudo, sin procesar)
├── guides/              ← CATEGORÍA 1 · guías prácticas + SVG + index.html (explorador offline)
├── processes/           ← procesos de generación de materiales (COIIAOC)
├── sessions/            ← logs de sesión (qué se hizo y por qué)
├── scripts/             ← utilidades de build y compilación (build-guide-browser.ps1)
├── specs/               ← especificaciones Spec-Kit (SDD)
└── .claude/skills/      ← skills locales del proyecto
```

---

## Categorías

### `guides/` — guías prácticas

Cada guía es un `.md` acompañado de un **diagrama SVG autoexplicativo** (legible sin abrir el `.md`), con la paleta y la tipografía COIIAOC. El nombre sigue el patrón `NN-TIPO-tema.md` (`CHEATSHEET`, `TUTORIAL`, …). La gramática visual del SVG está especificada en [`AGENTS.md`](AGENTS.md#3-categoría--guides-guías-prácticas-y-cheatsheets).

> 🌐 **Explorador interactivo offline:** Abre [`guides/index.html`](guides/index.html) en tu navegador para explorar el catálogo, buscar en tiempo real, filtrar por categoría y leer guías con su diagrama SVG sincronizado en pantalla dividida (100% offline, sin dependencias ni servidor web).
> Recompilar tras añadir guías: `powershell -ExecutionPolicy Bypass -File scripts\build-guide-browser.ps1`.

| #  | Guía                                                                                               | Diagrama                                        |
| -- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 01 | [Cheatsheet · Git nativo (merge) vs. Pull Requests (`gh`)](guides/01-CHEATSHEET-git-PR-vs-merge.md) | [SVG](guides/01-CHEATSHEET-git-PR-vs-merge.svg)    |
| 02 | [Tutorial · `git worktree`](guides/02-TUTORIAL-git-worktree.md)                                     | [SVG](guides/02-TUTORIAL-git-worktree.svg)         |
| 03 | [Tutorial · `git push --force-with-lease`](guides/03-TUTORIAL-git-force-with-lease.md)              | [SVG](guides/03-TUTORIAL-git-force-with-lease.svg) |
| 04 | [Cheatsheet · LaTeX y Overleaf: mapa de ficheros y compilación](guides/04-CHEATSHEET-latex-overleaf-ficheros.md) | [SVG](guides/04-CHEATSHEET-latex-overleaf-ficheros.svg) |
| 05 | [Cheatsheet · Spec-Kit (GitHub): Spec-Driven Development](guides/05-CHEATSHEET-spec-kit.md)        | [SVG](guides/05-CHEATSHEET-spec-kit.svg)           |
| 06 | [Tutorial · Superpowers en Google Antigravity y sinergia Spec-Kit](guides/06-TUTORIAL-superpowers-antigravity.md) | [SVG](guides/06-TUTORIAL-superpowers-antigravity.svg) |

### `processes/` — procesos de generación de materiales

Conocimiento de proceso importado del agente de creación de contenido del curso COIIAOC («Creación de Contenido COIIAOC»). Cada subcarpeta documenta un proceso (`PROCESO.md`) con sus diagramas en `svg/`:

- [`proceso-codigo/`](processes/coiiaoc-materials/proceso-codigo/PROCESO.md) — explicación didáctica de código.
- [`proceso-diagramas/`](processes/coiiaoc-materials/proceso-diagramas/PROCESO.md) — generación de diagramas.
- [`proceso-documentos/`](processes/coiiaoc-materials/proceso-documentos/PROCESO.md) — generación de documentos (DOCX/PDF).
- [`proceso-slides/`](processes/coiiaoc-materials/proceso-slides/PROCESO.md) — generación de presentaciones.
- [`MATERIALES-PROCESOS/`](processes/coiiaoc-materials/MATERIALES-PROCESOS/PROCESO.md) — mapa que conecta los procesos anteriores con las fuentes y las skills.

---

## Automatización — `.claude/skills/`

Skills de Claude Code que producen los artefactos del repo (diagramas, slides PPTX, documentos DOCX, mapas de proceso). Son la maquinaria que ejecutan los procesos de `processes/`; no son conocimiento en sí, sino las herramientas que lo generan.

## `sessions/` — logs de sesión

Registro cronológico de cada sesión de trabajo (prompt → respuesta), para tener contexto de qué se hizo y por qué. Generados con la skill `log-turn`.

---

## Cómo añadir conocimiento

1. Deja caer el fichero en `raw/` (o en la raíz del repo).
2. Pide a Claude que lo procese — seguirá las reglas de [`CLAUDE.md`](CLAUDE.md): lo numera, lo coloca en la categoría que corresponda y genera los artefactos (p. ej. el SVG de una guía).
3. Revisa el resultado y haz `commit`.

> Cada nueva categoría se documenta primero en [`CLAUDE.md`](CLAUDE.md) (disparador + formato canónico + procesado) y se añade aquí a la sección **Categorías**.
