#!/usr/bin/env node
/**
 * build_pptx.js — Template de script PptxGenJS para presentaciones COIIAOC
 *
 * Uso:
 *   node build_pptx.js                          → genera /home/claude/output.pptx
 *   OUTPUT=/ruta/custom.pptx node build_pptx.js → ruta personalizada
 *
 * El skill genera una versión concreta de este script para cada presentación.
 * Este archivo es el template base con los helpers reutilizables.
 *
 * IMPORTANTE: Leer references/coiiaoc-tokens.md antes de modificar.
 */

const pptxgen = require("pptxgenjs");

const OUTPUT_PATH = process.env.OUTPUT || '/home/claude/output.pptx';

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Bernardo Ronquillo Japón';
pres.title = 'Presentación COIIAOC';

// ─── TOKENS ────────────────────────────────────────────────────────────────
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

// ─── HELPERS ───────────────────────────────────────────────────────────────

/** Kicker (badge superior) para slides oscuras (naranja luminoso) */
function addKicker(slide, text, y = 0.38) {
  slide.addText(text, {
    x: 0.55, y, w: 8.9, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: C.narLum, charSpacing: 2.5,
  });
}

/** Kicker para slides claras (naranja oscuro) */
function addKickerDark(slide, text, y = 0.38) {
  slide.addText(text, {
    x: 0.55, y, w: 8.9, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: C.narOsc, charSpacing: 2.5,
  });
}

/** H1 para slides oscuras (texto blanco) */
function addH1Dark(slide, text, y = 0.75) {
  slide.addText(text, {
    x: 0.55, y, w: 8.9, h: 1.0,
    fontFace: F.syne, fontSize: 36, bold: true, color: C.blanco,
  });
}

/** H1 para slides claras (azul institución) */
function addH1Light(slide, text, y = 0.62) {
  slide.addText(text, {
    x: 0.55, y, w: 8.9, h: 0.75,
    fontFace: F.syne, fontSize: 28, bold: true, color: C.azul,
  });
}

/** H2 / label de sección (verde outputs) */
function addH2(slide, text, x = 0.55, y = 1.4, w = 8.9) {
  slide.addText(text, {
    x, y, w, h: 0.35,
    fontFace: F.syne, fontSize: 16, bold: true, color: C.outputs,
  });
}

/** Card con borde cálido */
function addCard(slide, x, y, w, h, fillColor = C.blanco) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: C.borde, width: 0.5 },
  });
}

/** Barra de acento izquierda (para slides con fondo azul) */
function addAccentBar(slide, y = 0, h = 5.625, color = C.narLum) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y, w: 0.08, h,
    fill: { color }, line: { color, width: 0 },
  });
}

/** Tag IO/RE (etiqueta semántica) */
function addTag(slide, label, x, y, color, fillColor) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.88, h: 0.2,
    fill: { color: fillColor }, line: { color, width: 0.5 },
  });
  slide.addText(label, {
    x: x + 0.04, y: y + 0.02, w: 0.8, h: 0.16,
    fontFace: F.mono, fontSize: 7.5, bold: true, color, align: 'center',
  });
}

/** Footer estándar (copyright izquierda + número de página derecha) */
function addFooter(slide, slideNum, totalSlides, dark = true) {
  slide.addText('© 2025 Bernardo Ronquillo Japón · COIIAOC', {
    x: 0.55, y: 5.3, w: 5, h: 0.2,
    fontFace: F.mono, fontSize: 8,
    color: dark ? 'AAAAAA' : C.textoDim,
  });
  slide.addText(`${slideNum} / ${totalSlides}`, {
    x: 9.1, y: 5.3, w: 0.8, h: 0.2,
    fontFace: F.mono, fontSize: 9, color: C.textoDim, align: 'right',
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDES — reemplazar este bloque con el guión específico de la sesión
// ═══════════════════════════════════════════════════════════════════════════

// Ejemplo: Slide de portada
{
  const s = pres.addSlide();
  s.background = { color: C.azul };
  addAccentBar(s);
  addKicker(s, 'AUTOMATIZACIÓN · COIIAOC · PARTE N');
  addH1Dark(s, 'Título de la Presentación');
  s.addText('Subtítulo descriptivo', {
    x: 0.55, y: 1.62, w: 8.9, h: 0.3,
    fontFace: F.sans, fontSize: 14, color: '9AB0C8',
  });
  addFooter(s, 1, 1, true);
}

// ─── WRITE ─────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: OUTPUT_PATH })
  .then(() => console.log(`PPTX generado: ${OUTPUT_PATH}`))
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
