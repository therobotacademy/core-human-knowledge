# COIIAOC Design Tokens — Referencia técnica para PptxGenJS

Leer este archivo cuando se construye un PPTX desde código.
Todos los HEX son sin prefijo `#` (requerido por PptxGenJS).

---

## 1. Paleta de colores

### Primarios

| Token               | HEX (sin #) | Uso                                      |
|---------------------|-------------|------------------------------------------|
| azul-institucion    | `1E3A5F`    | Portadas, cabeceras, panel izquierdo     |
| naranja-luminoso    | `FF8C3B`    | KPIs/badges **solo sobre azul**          |
| naranja-oscuro      | `C2510A`    | KPIs/badges **solo sobre blanco/crema**  |
| crema-tecnico       | `FAFAF7`    | Fondo de slides de contenido             |
| blanco              | `FFFFFF`    | Cards, tablas, superficies               |

### Funcionales IO/RE

| Token      | HEX      | Fondo suave | Uso semántico                  |
|------------|----------|-------------|--------------------------------|
| inputs     | `2E6B9E` | `EBF3FA`    | Tags Inputs, bordes activos    |
| outputs    | `0D7C5A` | `E8F7F2`    | Tags Outputs, OK, éxito        |
| reglas     | `B45309` | `FDF3E3`    | Tags Reglas, avisos medios     |
| excepciones| `B91C1C` | `FDECEA`    | Tags Excepciones, alertas      |

### Neutros

| Token      | HEX      | Uso                              |
|------------|----------|----------------------------------|
| texto      | `1C1C1C` | Cuerpo principal                 |
| texto-sub  | `6B6B6B` | Subtítulos, notas, captions      |
| texto-dim  | `9B9B9B` | Metadata, labels secundarios     |
| borde-calido| `E8E3D8`| Divisores, bordes de card        |
| parchment  | `F5F2EC` | Fondo alternativo cálido         |

### Regla de contraste — CRÍTICA

```
FF8C3B sobre 1E3A5F → 4.97:1 ✅ AA   (naranja luminoso sobre azul)
C2510A sobre FFFFFF → 7.55:1 ✅ AA+  (naranja oscuro sobre blanco)
C2510A sobre FAFAF7 → ~7.3:1 ✅ AA+  (naranja oscuro sobre crema)
C2510A sobre 1E3A5F → 2.45:1 ❌ PROHIBIDO
FF8C3B sobre FFFFFF → ~2.9:1 ❌ NO USAR
```

---

## 2. Tipografía — tamaños en pt (PptxGenJS)

| Elemento              | Fuente        | Peso | Tamaño pt | Color          |
|-----------------------|---------------|------|-----------|----------------|
| Título portada L1     | Syne          | bold | 40–44     | FFFFFF         |
| Título portada L2     | Syne          | bold | 36–40     | FF8C3B         |
| Kicker / badge        | IBM Plex Mono | 500  | 9–10      | FF8C3B (oscuro)|
| H1 slide contenido    | Syne          | bold | 28–32     | 1E3A5F         |
| H2 / label sección    | Syne          | bold | 16–22     | 0D7C5A         |
| Cuerpo texto          | IBM Plex Sans | 400  | 13–14     | 1C1C1C         |
| Bullets               | IBM Plex Sans | 400  | 12–13     | 1C1C1C         |
| Caption / nota        | IBM Plex Sans | 300  | 10–11     | 6B6B6B         |
| Código inline         | IBM Plex Mono | 400  | 10–12     | 1C1C1C         |
| KPI stat grande       | Syne          | bold | 36–48     | C2510A / FF8C3B|
| Tag IO/RE label       | IBM Plex Mono | bold | 7.5–9     | ver funcionales|
| Número de página      | IBM Plex Mono | 400  | 9         | 9B9B9B         |
| Copyright footer      | IBM Plex Mono | 400  | 8         | AAAAAA / textoDim |

---

## 3. Layout — coordenadas estándar (pulgadas, LAYOUT_16x9 = 10×5.625)

### Zona segura
```
Margen mínimo: 0.5" todos los lados
Zona de contenido: x=[0.55–9.45], y=[0.38–5.2]
Footer: y=5.28–5.38 (copyright izquierda, número de página derecha)
```

### Helpers reutilizables en PptxGenJS

```javascript
// Kicker (badge superior) — slides oscuras
slide.addText('TEXTO KICKER', {
  x: 0.55, y: 0.38, w: 8.9, h: 0.22,
  fontFace: 'IBM Plex Mono', fontSize: 9, color: 'FF8C3B',
  charSpacing: 2.5, align: 'left',
});

// Kicker — slides claras
// mismo pero color: 'C2510A'

// H1 slide oscura
slide.addText('Título', {
  x: 0.55, y: 0.82, w: 8.9, h: 0.75,
  fontFace: 'Syne', fontSize: 40, bold: true,
  color: 'FFFFFF', align: 'left',
});

// H1 slide clara
slide.addText('Título', {
  x: 0.55, y: 0.62, w: 8.9, h: 0.75,
  fontFace: 'Syne', fontSize: 28, bold: true,
  color: '1E3A5F', align: 'left',
});

// Accent bar izquierda (slides azules)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.08, h: 5.625,
  fill: { color: 'FF8C3B' }, line: { color: 'FF8C3B', width: 0 },
});

// Card con borde cálido
slide.addShape(pres.shapes.RECTANGLE, {
  x: X, y: Y, w: W, h: H,
  fill: { color: 'FFFFFF' },
  line: { color: 'E8E3D8', width: 0.5 },
});

// Tag IO/RE genérico
slide.addShape(pres.shapes.RECTANGLE, {
  x: X, y: Y, w: 0.88, h: 0.2,
  fill: { color: FILL }, line: { color: COLOR, width: 0.5 },
});
slide.addText('LABEL', {
  x: X, y: Y, w: 0.88, h: 0.2,
  fontFace: 'IBM Plex Mono', fontSize: 7.5, bold: true,
  color: COLOR, align: 'center',
});

// Footer estándar
slide.addText('© 2025 Bernardo Ronquillo Japón · COIIAOC', {
  x: 0.55, y: 5.3, w: 5, h: 0.2,
  fontFace: 'IBM Plex Mono', fontSize: 8,
  color: 'AAAAAA',  // oscuras | '9B9B9B' claras
  align: 'left',
});
slide.addText(`${N} / ${TOTAL}`, {
  x: 9.1, y: 5.3, w: 0.8, h: 0.2,
  fontFace: 'IBM Plex Mono', fontSize: 9, color: '9B9B9B', align: 'right',
});
```

---

## 4. Pitfalls críticos de PptxGenJS

```
❌ NUNCA usar "#" en colores → color: "#FF8C3B"    corrompe el archivo
✅ SIEMPRE sin prefijo       → color: "FF8C3B"

❌ NUNCA hex de 8 chars para opacidad → color: "00000020"
✅ Usar propiedad opacity separada    → opacity: 0.12

❌ NUNCA reusar objetos shadow/fill entre shapes (PptxGenJS los muta)
✅ Usar función factory: const makeShadow = () => ({ ... })

❌ NUNCA ROUNDED_RECTANGLE con accent bar lateral (esquinas no se cubren)
✅ Usar RECTANGLE para shapes con bordes izquierdos de acento
```

---

## 5. Constantes listas para copiar

```javascript
const C = {
  azul:      '1E3A5F',
  narLum:    'FF8C3B',
  narOsc:    'C2510A',
  crema:     'FAFAF7',
  blanco:    'FFFFFF',
  texto:     '1C1C1C',
  textoSub:  '6B6B6B',
  textoDim:  '9B9B9B',
  borde:     'E8E3D8',
  inputs:    '2E6B9E', inputsBg:  'EBF3FA',
  outputs:   '0D7C5A', outputsBg: 'E8F7F2',
  reglas:    'B45309', reglasBg:  'FDF3E3',
  excepc:    'B91C1C', excepcBg:  'FDECEA',
};

const F = {
  syne: 'Syne',
  mono: 'IBM Plex Mono',
  sans: 'IBM Plex Sans',
};
```
