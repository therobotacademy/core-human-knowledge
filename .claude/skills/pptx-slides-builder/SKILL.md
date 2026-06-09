---
name: pptx-coiiaoc-overview
description: >
  Genera presentaciones PPTX de apertura de sesión ("overview") para el curso
  "Automatización de Procesos con Agentes Inteligentes" (COIIAOC) de Bernardo
  Ronquillo Japón. Activa este skill cuando el usuario pida crear una
  presentación, deck, overview, o introducción para cualquier sesión o parte
  del curso COIIAOC, o cuando mencione VERBEX, PRDA, IO/RE, n8n, o Claude API
  en el contexto de preparar material docente. El skill produce un PPTX
  validado, con paleta corporativa v1.1, listo para entregar.
license: Proprietary — Bernardo Ronquillo Japón
---

# PPTX COIIAOC Overview · Skill operativo

Genera presentaciones de apertura de sesión para el curso COIIAOC siguiendo
la identidad corporativa v1.1.

Lee este archivo completo antes de empezar.

---

## 1. Pipeline obligatorio

```
PASO 1  Redactar el guión en JSON siguiendo assets/guion_schema.json.
        Estructura: { meta: {...}, slides: [ { type, kicker, h1, subtitulo, fondo, content, notas }, ... ] }

PASO 2  Ejecutar el builder:
        node scripts/build_from_guion.js <guion.json> [output_name]
        Salida: SAMPLE/<output_name>.pptx   (o PPTX_OUT_DIR si está definida)

PASO 3  QA visual — abrir el PPTX y revisar cada slide:
        - Overflow de texto (h1 largo, cuerpos que se salen del bounding box)
        - Solapamiento en footer (y=5.3)
        - Violaciones de contraste (naranja oscuro sobre azul → PROHIBIDO)
        - Nodos o cards fuera de márgenes
        En Windows se puede exportar JPGs para QA sin abrir PowerPoint:
        $ppt = (New-Object -ComObject PowerPoint.Application); $ppt.Visible = 1
        $pres = $ppt.Presentations.Open("<ruta-absoluta>.pptx")
        $pres.Slides(1).Export("<ruta>.jpg","JPG",1920,1080)

PASO 4  Si hay defectos → corregir el guión JSON y repetir PASO 2.
        Máximo 2 ciclos antes de entregar con nota de gaps.
```

**Regla de oro:** el QA visual es obligatorio. Los defectos más comunes son
overflow en h1 con títulos > 50 chars y solapamiento en el footer.

### Doble salida: el guión es la fuente única (PPTX + HTML)

El **mismo** `guion.json` produce dos formatos con dos builders paralelos:

```
node scripts/build_from_guion.js   <guion.json> [output_name]   → <name>.pptx  (editable, PowerPoint)
node scripts/build_html_from_guion.js <guion.json> [output_name] → <name>.html  (self-contained 16:9, navegable, imprimible)
```

- **PPTX** (`build_from_guion.js`): deck editable con shapes nativos. Para entregar/editar en PowerPoint.
- **HTML** (`build_html_from_guion.js`): deck 16:9 autocontenido — navegación ← →, contador `N/total`, Google Fonts inline, `@media print` (una slide por página A4 apaisada → Chrome `--print-to-pdf` da el PDF). Mismos tipos de slide, mismos tokens de color, misma convención de footer.

No autorar HTML a mano ni convertir HTML→PPTX: se escribe **un** guión y se generan ambos. Output a `PPTX_OUT_DIR` (compartido por ambos builders) o `../SAMPLE`.

QA del HTML en Windows (sin `pdftoppm`): Chrome `--headless=new --print-to-pdf` → PyMuPDF (`fitz`) rasteriza a PNG → `Read`.

**Convenciones editoriales obligatorias** (texto, footer, títulos, cuerpo):
leer la sección **"Editorial conventions"** de
`.claude/skills/html-slides-builder/SKILL.md` antes de redactar el `guion.json`.
Esas reglas son comunes a HTML y PPTX, y se aplican durante la generación, no
como corrección posterior. Resumen: `IDEA CLAVE` (no `IDEA FUERZA`); copyright
solo en slide 1; h1 de 2–4 palabras; sin meta-etiquetas `Nota pedagógica:` /
`Idea fuerza:`; quotes sin punto final ni redundancias.

---

## 2. Tokens de diseño — leer references/coiiaoc-tokens.md

Antes de escribir cualquier coordenada o color, leer el archivo de tokens.
Contiene los HEX sin # para PptxGenJS, tamaños en pt, y las reglas de
contraste obligatorias.

Regla crítica de contraste:
- Naranja luminoso `FF8C3B` → solo sobre fondo azul `1E3A5F` (4.97:1 ✅)
- Naranja oscuro `C2510A` → solo sobre blanco/crema (7.55:1 ✅)
- `C2510A` sobre `1E3A5F` → PROHIBIDO (2.45:1 ❌)

---

## 3. Tipos de slide implementados

Ver references/slide-types.md para plantillas por tipo.

| Tipo | Fondo por defecto | Descripción |
|---|---|---|
| `portada` | azul | Portada principal con accent bar, chip de caso ancla y stats |
| `portada_secundaria` | azul | Alias de portada — misma plantilla, contenido de "idea fuerza" |
| `contenido` | crema | Cards 2×2 con kicker + h1 (alias de contenido_cards) |
| `contenido_cards` | crema | Cards 2×2 o 3×1 + code block opcional + callouts |
| `flujo` | crema | Nodos coloreados con flechas + KPI cards + callout |
| `tabla` | crema | Header azul + filas alternadas + callouts |
| `iore` | crema | Grid 2×2 con INPUTS/OUTPUTS/REGLAS/EXCEPCIONES |
| `divider` | azul | Separador de bloque — h1 48pt + subtítulo |
| `gate` | crema | Gate card verde + 2 cols (fuera scope / siguiente sesión) |
| `impacto` | crema | Banner central con rich text + 2 cols ❌/✅ |
| `cierre` | azul | Pregunta grande + respuesta + condiciones |
| `preview_sesion` | azul | H1 + pasos numerados con oval naranja |
| `nodos` | azul | (stub) Arco de sesiones — usar renderGenerico hasta implementar |
| `mvp` | crema | (stub) Tarjeta MVP — usar renderGenerico hasta implementar |
| `dos_columnas` | crema | (stub) Layout 2 columnas — usar renderGenerico hasta implementar |

---

## 4. P0 Fix — h1 overflow (resuelto en v6, commit 71025a8)

`addH1` usa `margin:0` + `fit:"resize"` para evitar el eco de overflow.
No añadir `margin` ni `fit` diferentes en otros text boxes de h1.

```javascript
// CORRECTO — no modificar estos parámetros
function addH1(s, text, dark = false) {
  s.addText(text, {
    x: 0.55, y: dark ? 0.62 : 0.82,
    w: 8.9,  h: dark ? 1.2  : 1.4,
    fontFace: F.syne, fontSize: dark ? 28 : 36,
    bold: true, color: dark ? C.azul : C.blanco,
    wrap: true, valign: "top",
    margin: 0,
    fit: "resize",
  });
}
const H1_BOTTOM_DARK  = 1.82;  // 0.62 + 1.2
const H1_BOTTOM_LIGHT = 2.22;  // 0.82 + 1.4
```

Recomendación de guión: mantener h1 < 50 chars para evitar word-wrap a 2 líneas.

---

## 5. Defectos frecuentes a vigilar en QA

- H1 > 50 chars → word-wrap a 2 líneas (comportamiento correcto, no es bug)
- Footer `© 2025` y número de slide solapados en y=5.3
- Naranja oscuro `C2510A` sobre fondo azul `1E3A5F` (violación de contraste)
- Cards fuera del margen inferior (>5.2")
- Code block con demasiadas líneas que desborda el slide

---

## 6. Convenciones de nomenclatura

```
<output_name>.pptx          — PPTX generado en SAMPLE/ o PPTX_OUT_DIR
guion_<sesion>.json         — guión fuente (guardar junto al PPTX)
SAMPLE/qa-vN/slide-NN.jpg   — imágenes QA (exportadas con COM de PowerPoint)
```

---

## 7. Dependencias del entorno

- `node` (v18+) + `pptxgenjs` 4.0.1 en `node_modules/` del skill
- Windows: PowerShell + Microsoft Office (para exportar JPG en QA visual)
- El builder NO requiere python-pptx, LibreOffice, ni pdftoppm

Verificar con: `node -e "require('pptxgenjs'); console.log('OK')"` en el
directorio `.claude/skills/pptx-slides-builder/`.
