---
name: marco-teorico-pbl
description: >
  Genera 4 slides de marco teórico (A–D) para insertar en cualquier sesión del
  curso "Automatización de Procesos con Agentes Inteligentes" (COIIAOC Parte 2,
  sesiones II1–II6). Convierte una sesión tutorial en Project Based Learning
  genuino añadiendo concepto formal, taxonomía, mecanismo y cierre transferible.
  Actívalo siempre que Bernardo diga "añade el marco teórico", "genera los
  slides teóricos", "crea la capa conceptual", "convierte en PBL", "slide A
  a D", o cuando suba un PPTX de sesión y pida añadir base teórica. También
  actívalo proactivamente cuando se produzca una sesión nueva para II2–II6.
  Produce un PPTX listo para insertar (paleta COIIAOC v1.1, fuentes Syne /
  IBM Plex, compatible con PowerPoint).
---

# Marco Teórico PBL — Workflow

## Qué hace este skill

Toma una sesión (número + fase PRDA + descripción o PPTX) y produce 4 slides
de marco teórico listos para insertar en el deck existente:

| Slide | Fondo | Función pedagógica | Posición en el deck |
|-------|-------|-------------------|---------------------|
| **A** | Azul oscuro | Concepto formal introductorio (PEAS, definición, principio) | Tras portada, antes de "Idea clave" |
| **B** | Crema | Taxonomía / tabla comparativa con consecuencias de diseño | Tras A, antes de "Idea clave" |
| **C** | Crema | Mecanismo concreto: flujo, DFA, secuencia de pasos | Tras B, antes de "Idea clave" o slide específico |
| **D** | Azul oscuro | Cierre transferible: concepto abstracto → VERBEX → otro dominio | Tras el Gate Fx (último slide del deck) |

---

## Paso 1 · Capturar el contexto de sesión

Extrae del input:
- Número de sesión: II1, II2, II3, II4, II5 o II6
- Fase PRDA dominante: Percibir / Razonar / Actuar / Sistema
- Concepto técnico central de la sesión (qué construye el alumno)
- Si se aporta PPTX: lee el texto con `extract-text` para entender el contenido antes de diseñar

Si el número de sesión es II1 o II2, los conceptos están predefinidos en
`references/concepto-por-fase.md`. Para II3–II6, derive los conceptos del
contenido del PPTX usando la tabla de mapeo como guía.

---

## Paso 2 · Seleccionar conceptos teóricos

Lee `references/concepto-por-fase.md`.

Cada sesión tiene asignados:
- **Concepto A**: qué marco formal introduce el slide A (PEAS, tipos de agentes, etc.)
- **Concepto B**: qué taxonomía o tabla comparativa muestra el slide B
- **Concepto C**: qué mecanismo o estructura formal ilustra el slide C
- **Dominio transferible**: qué caso de otro sector ilustra el slide D

Si la sesión no está en el archivo (II5, II6), usa el patrón de derivación:
> El concepto A debe responder "¿qué principio de Ciencias de la Computación
> o Ingeniería de Sistemas justifica el diseño de esta sesión?" El concepto
> debe ser transferible a cualquier sistema agéntico, no solo a VERBEX.

---

## Paso 3 · Diseñar el contenido de cada slide

### Slide A (azul, concepto introductorio)
- Kicker: `MARCO TEÓRICO · IIx · SLIDE A — insertar tras portada`
- Título línea 1 (blanco): concepto breve
- Título línea 2 (naranja #FF8C3B): subtítulo que lo acota
- Contenido: 2–4 cards o diagrama que defina el concepto formalmente
- Anclaje VERBEX: en cada card, una línea que conecta con el caso concreto
- Footer referencia: autor, obra, capítulo si aplica

### Slide B (crema, taxonomía)
- Kicker: `MARCO TEÓRICO · IIx · SLIDE B`
- Título (azul #1E3A5F, 20pt): ¿cómo encaja VERBEX en esta taxonomía?
- Tabla de 3 cols: Dimensión | VERBEX es… | Consecuencia para el diseño
- Insight box al pie: consecuencia arquitectónica directa

### Slide C (crema, mecanismo)
- Kicker: `MARCO TEÓRICO · IIx · SLIDE C`
- Título bicolor (azul + naranja oscuro #C2510A, 20pt): mecanismo nombrado formalmente
- Diagrama de flujo, DFA o secuencia de pasos
- Cards de reglas o transiciones si aplica

### Slide D (azul, cierre)
- Kicker: `MARCO TEÓRICO · IIx · SLIDE D · CIERRE — insertar tras Gate Fx`
- Título: "Lo que aprendimos — en términos transferibles"
- 3 cards: Concepto abstracto | En VERBEX · IIx | En otro dominio
- Footer pregunta de dominio: una pregunta que el alumno pueda aplicar en su propio proyecto

---

## Paso 4 · Generar el PPTX

Lee `references/design-tokens.md` para los colores, fuentes y coordenadas exactas.
Lee `scripts/pptx_helpers.js` para las funciones auxiliares reutilizables.

Proceso de generación:
```bash
# 1. Instala dependencias si es necesario
npm list -g pptxgenjs 2>/dev/null || npm install -g pptxgenjs

# 2. Escribe el script de generación
# Usa las helpers de scripts/pptx_helpers.js como base
# Guarda en /home/claude/build_IIx_marco.js

# 3. Genera el PPTX raw
node build_IIx_marco.js

# 4. Re-guarda con python-pptx (fix OOXML ordering para PowerPoint)
python3 -c "
from pptx import Presentation
Presentation('IIx_marco_raw.pptx').save('marco_teorico_IIx.pptx')
print('OK')
"

# 5. QA visual — Linux (Claude.ai sandbox)
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf marco_teorico_IIx.pptx
pdftoppm -jpeg -r 150 marco_teorico_IIx.pdf slide_qa
# Inspecciona slide_qa-1.jpg … slide_qa-4.jpg con view()

# 5'. QA visual — Windows (Claude Code local, sin pdftoppm)
# Requiere LibreOffice instalado en C:\Program Files\LibreOffice\ y PyMuPDF (`pip install pymupdf`).
"/c/Program Files/LibreOffice/program/soffice.exe" --headless --convert-to pdf marco_teorico_IIx.pptx
python -X utf8 -c "
import fitz
doc = fitz.open('marco_teorico_IIx.pdf')
for i, page in enumerate(doc, 1):
    page.get_pixmap(dpi=140).save(f'qa_slide_{i}.png')
"
# Inspecciona qa_slide_1.png … qa_slide_4.png con la herramienta Read (las imágenes
# se muestran inline al asistente). Nota: PyMuPDF emite el warning «No common
# ancestor in structure tree» — es benigno, las imágenes salen correctas.
```

### Defectos a verificar en QA
- Título de slides B/C: ¿desborda sobre el contenido? Si sí, reducir fontSize a 18pt
- Cards de slide A: ¿el body text es visible? Color mínimo: `9AB0C8` sobre `243F6B`
- Slide D: ¿el footer "Pregunta de dominio" se solapa con las cards?
- Slide D: ¿la pregunta de dominio es legible? El helper actual la pinta en `#444444`
  (gris oscuro) sobre fondo azul `#1E3A5F` → invisible. Override a `C.mute` (#9AB0C8)
  en tu script de build hasta que se arregle el helper (`buildSlideD` en `pptx_helpers.js`).
- Todos: ¿el indicador de página (A/4, B/4…) está en la esquina inferior derecha?

---

## Paso 5 · Entregar

Copia el archivo final a `/mnt/user-data/outputs/marco_teorico_IIx.pptx`
y llama a `present_files`.

Acompaña con una tabla de posición de inserción:

| Slide | Insertar en posición | En el deck de IIx |
|-------|---------------------|-------------------|
| A | Tras slide 1 (portada) | Nueva posición 2 |
| B | Tras slide A | Nueva posición 3 |
| C | Tras slide B | Nueva posición 4 |
| D | Al final, tras Gate Fx | Última posición |

---

## Invariantes de diseño (NO negociables)

1. **0 LLM calls en los slides B y C**: el marco teórico explica POR QUÉ se usa
   esa arquitectura, no añade nueva funcionalidad.
2. **VERBEX siempre presente**: cada slide A–C tiene al menos un anclaje
   explícito a VERBEX (sensor, PO, PN, regla R0x, etc.).
3. **Slide D siempre tiene 3 columnas**: concepto abstracto · VERBEX · otro dominio.
   El tercer dominio NUNCA es de automatización industrial.
4. **python-pptx re-save es obligatorio**: PptxGenJS 4.x coloca `notesMasterIdLst`
   antes de `sldSz` en violation del OOXML spec. PowerPoint rechaza el archivo
   sin este paso. LibreOffice lo acepta igual, pero la entrega es para PowerPoint.
5. **Numeración de slides**: usar `X / 4` (A/4, B/4, C/4, D/4) para distinguirlos
   de los slides numerados del deck original.
