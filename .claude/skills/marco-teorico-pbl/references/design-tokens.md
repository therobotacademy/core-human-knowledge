# Design Tokens COIIAOC v1.1 — PptxGenJS

Extraídos directamente del XML del archivo `M1_slides_II1-v6.pptx`.
Usar estos valores exactos en todos los slides de marco teórico.

---

## Colores (sin # prefix — PptxGenJS los rechaza con #)

```javascript
const C = {
  // Primarios
  az:   "1E3A5F",  // Azul Institución — fondos dark slides
  nl:   "FF8C3B",  // Naranja Luminoso — texto/accent en fondo azul (4.97:1)
  no:   "C2510A",  // Naranja Oscuro — texto/accent en fondo crema (7.55:1)
  cr:   "FAFAF7",  // Crema Técnico — fondos light slides
  wh:   "FFFFFF",

  // Funcionales (IO/RE)
  inp:  "2E6B9E",  // Inputs — azul medio
  out:  "0D7C5A",  // Outputs — verde proceso
  reg:  "B45309",  // Reglas — ámbar
  exc:  "B91C1C",  // Excepciones — rojo

  // Texto
  tx:   "1C1C1C",  // Texto principal
  ts:   "6B6B6B",  // Texto secundario
  td:   "9B9B9B",  // Texto dim / footer
  mute: "9AB0C8",  // Texto muted en slides azules

  // Estructurales
  bc:   "E8E3D8",  // Borde cálido
  parch: "F5F2EC", // Parchment (fila alternada en tablas light)

  // Cards
  card_dark: "243F6B", // Card bg en slides azules (ligeramente más claro que az)
  card_border_dark: "3A5A85", // Borde de card en slides azules
};
```

---

## Fuentes

```javascript
const F = {
  syne: "Syne",         // Headings, títulos, nombres de concepto (weight 700/800)
  mono: "IBM Plex Mono", // Labels, kickers, código, page numbers
  sans: "IBM Plex Sans", // Body text (weight 300/400/500)
};
```

---

## Layout — coordenadas en pulgadas (slide 10" × 5.625")

```javascript
const L = {
  W:  10,      // Ancho del slide
  H:  5.625,   // Alto del slide
  ML: 0.55,    // Margen izquierdo para texto
  TW: 8.90,    // Ancho del área de texto (ML a 9.45")
  CT: 0.38,    // Y del kicker (supra-título)
  TY: 0.64,    // Y del título
  FY: 5.30,    // Y del footer (page indicator)
};
```

### Elementos estructurales fijos

```javascript
// Barra naranja izquierda (dark slides únicamente)
{ x: 0, y: 0, w: 0.08, h: L.H, fill: { color: C.nl }, line: { color: C.nl, width: 1 } }

// Kicker (dark slide): IBM Plex Mono, 9pt, naranja luminoso
{ x: L.ML, y: L.CT, w: L.TW, h: 0.22, fontFace: F.mono, fontSize: 9, color: C.nl, charSpacing: 2.5 }

// Kicker (light slide): IBM Plex Mono, 9pt, naranja oscuro
{ x: L.ML, y: L.CT, w: L.TW, h: 0.22, fontFace: F.mono, fontSize: 9, color: C.no, charSpacing: 2.5 }

// Título dark slide: Syne 800, 26pt, h=0.95" (blanco + naranja, breakLine entre líneas)
{ x: L.ML, y: L.TY, w: L.TW, h: 0.95, fontFace: F.syne, fontSize: 26, bold: true }

// Título light slide: Syne 800, 20pt, h=0.50" (azul + naranja oscuro)
{ x: L.ML, y: L.TY, w: L.TW, h: 0.50, fontFace: F.syne, fontSize: 20, bold: true }

// Página inferior derecha
{ x: 9.1, y: L.FY, w: 0.8, h: 0.2, fontFace: F.mono, fontSize: 9, color: C.td, align: "right" }

// Referencia bibliográfica (dark slides, fila inferior)
{ x: L.ML, y: 5.08, w: L.TW, h: 0.18, fontFace: F.mono, fontSize: 7.5, color: "555555" }
```

---

## Zonas de contenido según tipo de slide

### Slide A (dark) — zona de contenido
- Contenido empieza en: `y = 1.68` (bajo título de 26pt a y=0.64)
- Espacio disponible: `4.85 - 1.68 = 3.17"` antes del pie de referencia
- Patrón típico: **4 cards en fila**
  - Ancho por card: `(8.9 - 3*gap) / 4 = 2.1"` con gap=0.15"
  - Alto de card: hasta `3.1"` máximo (deja espacio para ref en y=5.08)
  - Card bg: `card_dark` con borde `card_border_dark`, sin border-radius (usar RECTANGLE)

### Slide B (light) — zona de contenido
- Contenido empieza en: `y = 1.28`
- Patrón típico: **tabla de 3 columnas** + insight box al pie
  - Insight box: y=4.35, h=0.62, borde izquierdo azul (w=0.05), bg `EBF2F9`
  - Tabla: altura hasta `y = 4.28` (deja espacio para insight y footer)

### Slide C (light) — zona de contenido
- Contenido empieza en: `y = 1.28`
- Patrón típico: **flujo horizontal** (3 boxes + 2 flechas) + **3 rule cards**
  - Flow boxes: y=1.28, h=1.65
  - Rule cards: y=3.18, h=0.88
  - Nota al pie: y=4.18, h=0.22, italic, color `td`

### Slide D (dark) — zona de contenido
- Contenido empieza en: `y = 1.52`
- Patrón fijo: **3 transfer cards en fila**
  - Ancho por card: 2.75", gap=0.175"
  - Alto de card: 3.0"
  - Estructura interna: label (7.5pt mono, muted) → título (12.5pt Syne, naranja) → body (9.5pt sans, muted)
  - Pregunta de dominio: y=4.65, h=0.3, mono 8pt, color "444444"

---

## Reglas críticas de PptxGenJS

```javascript
// ❌ NUNCA: "#FF8C3B" — corrompe el archivo
// ✅ SIEMPRE: "FF8C3B"

// ❌ NUNCA: reutilizar objetos shadow/line entre calls (PptxGenJS muta en-place)
const makeShadow = () => ({ type: "outer", blur: 6, offset: 2, color: "000000", opacity: 0.12 });

// ❌ NUNCA: ROUNDED_RECTANGLE con accent bars rectangulares (las esquinas no encajan)
// ✅ SIEMPRE: usar RECTANGLE para cards con accent borders

// ❌ NUNCA: lineSpacing con bullets (causa espaciado excesivo)
// ✅ USAR: paraSpaceAfter para separación entre párrafos de bullet

// ❌ NUNCA: unicode "•" en texto (crea doble bullet)
// ✅ SIEMPRE: { bullet: true } en las opciones del run

// Después de generar:
// python3 -c "from pptx import Presentation; Presentation('raw.pptx').save('final.pptx')"
// Obligatorio para compatibilidad con PowerPoint (fix notesMasterIdLst ordering)
```

---

## Fuente visual de referencia

El archivo original es `M1_slides_II1-v6.pptx`. Si tienes acceso a él, puedes
verificar cualquier valor con:
```bash
extract-text M1_slides_II1-v6.pptx          # texto y estructura
python scripts/thumbnail.py M1_slides_II1-v6.pptx  # vista previa visual
python scripts/office/unpack.py M1_slides_II1-v6.pptx unpacked/  # XML raw
```
