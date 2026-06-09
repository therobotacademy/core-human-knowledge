---
name: apm-docx-builder
description: Genera documentos Word (DOCX) para los materiales del curso APM Terminals 2026. Usa scripts/docx-apm-utils.js como módulo compartido y un script gen_Mx_Bx_docx.js por documento. Invocar cuando el usuario pide "versión Word", "DOCX" o "documento para imprimir" de un material del curso.
---

# apm-docx-builder

Convierte los materiales del curso APM (escritos en MD) a archivos .docx imprimibles con la paleta COIIAOC v1.1.

## Cuándo invocar

- Usuario pide "versión Word" / "DOCX" / "documento para imprimir" de un material
- Sesión de preparación de Bx: convertir M2 y M4 a DOCX
- Frases: "crea la versión Word de...", "genera el DOCX de...", "necesito imprimir..."

## Materiales que necesitan DOCX (por sesión)

| Material | Necesita DOCX | Motivo |
|---|---|---|
| M2 | **Sí** | Ficha/mapa/plantilla que el alumno rellena a mano o en Word |
| M4 | **Sí** | Plantilla del entregable — 2 versiones: blanco + ejemplo trabajado |
| M3 | No — HTML A4 | Ctrl+P desde navegador → PDF o papel |
| M1 | No — HTML 16:9 | Para proyectar |
| M0 | No — PPTX ya producido | Para proyectar |
| M5 | No — HTML 16:9 | Para proyectar |

## Infraestructura

### Módulo compartido

El motor es **curso-neutro**: vive en `.claude/skills/_shared/docx-core.js` (paleta, helpers y
`makeDoc()` genéricos; chip/título/footer por parámetro). `apm-docx-builder/docx-apm-utils.js` es un
**alias** (re-export) por compatibilidad — los `gen_*.js` siguen con `require('./docx-apm-utils')`.
Un curso nuevo puede requerir `../_shared/docx-core` directamente. Leer el core antes de un script nuevo.

Exporta (vía `docx-core`):
- **Paleta `C`**: `C.azul` (#1E3A5F) · `C.narOsc` (#C2510A) · `C.narLuz` (#FF8C3B) · `C.crema` (#FAFAF7) · `C.parchment` (#F5F2EC) · `C.borde` (#E8E3D8) · `C.texSec` (#6B6B6B) · `C.azMedio` (#2E6B9E) · `C.verde` (#0D7C5A) · `C.ambar` (#B45309) · `C.rojo` (#B91C1C) · `C.blanco` (#FFFFFF) · `C.texto` (#1C1C1C) · `C.narBg` (#FFF7ED)
- **Constantes de página A4**: `PAGE_W=11906`, `PAGE_H=16838`, `MARGIN=1440`, `CW=9026` (DXA)
- **Helpers de párrafo**: `t(text,opts)`, `b(text)`, `mono(text)`, `p(children,opts)`, `gap()`
- **Helpers de bloque**: `blockHdr(label,title)`, `versionDivider(label,title)`, `callout(text)`, `alertCallout(text)`, `infoCallout(text)`, `subLabel(text)`
- **Helpers de tabla**: `labelTable(rows)`, `rubricTable(rows)`, `twoColTable(colWidths, headers, rows)`
- **Fábrica de documento**: `makeDoc({ chip, title, subtitle, footer, children })` → Document A4 con header/footer y numbering config (bullets + numbers)
- **Re-exports de docx**: `Packer`, `Paragraph`, `TextRun`, `Table`, `TableRow`, `TableCell`, `AlignmentType`, `BorderStyle`, `WidthType`, `ShadingType`, `VerticalAlign`, `LevelFormat`, `bdr`, `noBdr`, `allBdr`

### Script por documento

```javascript
// scripts/gen_M2_B2_docx.js  (ejemplo para B2)
const fs = require("fs");
const u = require("./docx-apm-utils");
const { C, CW, Packer, Paragraph, TextRun, /* ... */ } = u;
const { t, b, p, gap, blockHdr, callout, labelTable, rubricTable, makeDoc } = u;

const OUT = "CONTENT/PARTE2-Materiales/B2-IORE_Documental/M2_plantilla-io-re_B2.docx";

const doc = makeDoc({
  chip: "APM TERMINALS · CURSO 2026 · SESIÓN B2",
  title: "Plantilla IO/RE",
  footer: "APM Terminals · Curso 2026 · B2 IO/RE Documental · M2 Plantilla IO/RE · v1.0",
  children: [
    // ... secciones del documento
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log("OK", OUT);
});
```

### Runtime

```bash
node scripts/gen_M2_B2_docx.js
```

### Validación

```bash
# ZIP structure
python -c "import zipfile; z=zipfile.ZipFile('CONTENT/.../M2_*.docx'); print(len(z.namelist()), 'files')"

# XML parsing (detecta errores de schema)
python -c "
import zipfile
from xml.etree import ElementTree as ET
path = 'CONTENT/.../M2_*.docx'
with zipfile.ZipFile(path) as z:
    for name in ['word/document.xml','word/styles.xml','word/numbering.xml']:
        data = z.read(name)
        ET.fromstring(data)
        print(f'OK {name} ({len(data)} bytes)')
"
```

Un DOCX válido tiene ≥ 26 archivos en el ZIP y todos los XML parsean sin error.

## Proceso paso a paso

1. **Leer el MD fuente** del material para entender estructura y contenido.
2. **Mapear secciones** a helpers de `docx-apm-utils`:
   - Intro / instrucciones → `callout()` o `infoCallout()`
   - Cabecera de bloque → `blockHdr(label, title)`
   - Tabla simple label/valor → `labelTable(rows)`
   - Tabla criterio con puntuación → `rubricTable(rows)`
   - Tabla 2 columnas genérica → `twoColTable(colWidths, headers, rows)`
   - Cajas de texto editable → Paragraph con fondo `C.parchment`, borde `allBdr(C.borde)`
   - Separador de versión → `versionDivider(label, title)`
3. **Escribir el script** `scripts/gen_Mx_Bx_docx.js`.
4. **Ejecutar** con `node`.
5. **Validar** ZIP (≥26 archivos) + XML (sin error de parseo).
6. Confirmar ruta del output.

## Reglas críticas (nunca saltarse)

- `ShadingType.CLEAR` — nunca `SOLID` (fondo negro en Word)
- `LevelFormat.BULLET` con numbering config — nunca `•` literal en TextRun
- `PageBreak` solo dentro de un `Paragraph`
- Sin `\n` en TextRun — usar `Paragraph` separados
- Tablas: `WidthType.DXA` siempre; `columnWidths` debe sumar exactamente al ancho de la tabla
- Cell margins siempre: `{ top: 80, bottom: 80, left: 120, right: 120 }`
- Ruta del módulo docx: `require("C:/Users/brjap/AppData/Roaming/npm/node_modules/docx")` — ya importado en `docx-apm-utils.js`

## Historial de scripts producidos

| Script | Material | Sesión | Estado |
|---|---|---|---|
| `scripts/gen_m4_b1_docx.js` | M4 plantilla candidatura | B1 | ✅ producido 2026-05-18 |
| `scripts/gen_m2_b1_docx.js` | M2 mapa candidatos | B1 | ✅ producido 2026-05-18 |
| `scripts/gen_M2_II3_docx.js` | M2 ficha diseño de prompt | II3 COIIAOC | ✅ producido 2026-05-19 |
| `scripts/gen_M2_II4_docx.js` | M2 plantilla Sheets + Email | II4 COIIAOC | ✅ producido 2026-05-19 |
| `scripts/gen_M_nodos_n8n_II3_docx.js` | Guía técnica nodos n8n workflow VERBEX | II2+II3 COIIAOC | ✅ producido 2026-05-19 |
| `scripts/gen_M2_B2_docx.js` | M2 plantilla IO/RE | B2 | ⬜ pendiente |
| `scripts/gen_M4_B2_docx.js` | M4 ficha IO/RE | B2 | ⬜ pendiente |
| `scripts/gen_M2_B3_docx.js` | M2 anatomía prompt RCTFC | B3 | ⬜ pendiente |
| `scripts/gen_M4_B3_docx.js` | M4 plantilla prompt sesión | B3 | ⬜ pendiente |
| `scripts/gen_M2_B4_docx.js` | M2 plantilla system prompt | B4 | ⬜ pendiente |
| `scripts/gen_M4_B4_docx.js` | M4 system prompt (EP2) | B4 | ⬜ pendiente |
| `scripts/gen_M2_B5_docx.js` | M2 ficha Make vs Buy | B5 | ⬜ pendiente |
| `scripts/gen_M4_B5_docx.js` | M4 evaluación Make vs Buy (EP3) | B5 | ⬜ pendiente |
| `scripts/gen_M2_B6_docx.js` | M2 checklist gobernanza | B6 | ⬜ pendiente |
| `scripts/gen_M4_B6_docx.js` | M4 DDF final (EP4 + cierre) | B6 | ⬜ pendiente |
