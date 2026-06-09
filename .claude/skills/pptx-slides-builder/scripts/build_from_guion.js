#!/usr/bin/env node
/**
 * build_from_guion.js — Genera un PPTX COIIAOC a partir de un guión JSON.
 *
 * Uso:
 *   node build_from_guion.js <guion.json> [output_name]
 *
 * El guión JSON sigue el schema en assets/guion_schema.json.
 * Tipos implementados: portada, contenido_cards, flujo, tabla, iore,
 *                      divider, gate, impacto, cierre, preview_sesion
 */

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ─── Cargar guión ─────────────────────────────────────────────────────────
const guionPath = process.argv[2];
if (!guionPath) {
  console.error("ERROR: se requiere ruta al guión JSON como primer argumento");
  process.exit(1);
}

const guion = JSON.parse(fs.readFileSync(guionPath, "utf8"));
const meta = guion.meta;
const outputName = process.argv[3] || meta.output_name || "output";
const OUTPUT_DIR = process.env.PPTX_OUT_DIR || path.join(__dirname, "..", "SAMPLE");
const OUTPUT_PATH = path.join(OUTPUT_DIR, `${outputName}.pptx`);

// ─── Setup ────────────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Bernardo Ronquillo Japón";
pres.title = meta.title;

// ─── TOKENS ───────────────────────────────────────────────────────────────
const C = {
  azul:      "1E3A5F",
  narLum:    "FF8C3B",
  narOsc:    "C2510A",
  crema:     "FAFAF7",
  blanco:    "FFFFFF",
  texto:     "1C1C1C",
  textoSub:  "6B6B6B",
  textoDim:  "9B9B9B",
  borde:     "E8E3D8",
  inputs:    "2E6B9E", inputsBg:  "EBF3FA",
  outputs:   "0D7C5A", outputsBg: "E8F7F2",
  reglas:    "B45309", reglasBg:  "FDF3E3",
  excepc:    "B91C1C", excepcBg:  "FDECEA",
  slate:     "7898AA",
};

const F = { syne: "Syne", mono: "IBM Plex Mono", sans: "IBM Plex Sans" };

function resolveColor(name) { return C[name] || name; }
function resolveBg(name) {
  const map = { inputs: C.inputsBg, outputs: C.outputsBg, reglas: C.reglasBg, excepc: C.excepcBg };
  return map[name] || C[name] || name;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────
const TOTAL = guion.slides.length;

function addFooter(s, n, dark = true) {
  // Editorial rule: copyright string only on slide 1 (portada), counter on every slide.
  if (n === 1) {
    const year = new Date().getFullYear();
    s.addText(`© ${year} Bernardo Ronquillo Japón`, {
      x: 0.55, y: 5.3, w: 5, h: 0.2,
      fontFace: F.mono, fontSize: 8,
      color: dark ? "AAAAAA" : C.textoDim,
    });
  }
  s.addText(`${n} / ${TOTAL}`, {
    x: 9.1, y: 5.3, w: 0.8, h: 0.2,
    fontFace: F.mono, fontSize: 9, color: C.textoDim, align: "right",
  });
}

function addKicker(s, text, dark = false) {
  s.addText(text, {
    x: 0.55, y: 0.38, w: 8.9, h: 0.22,
    fontFace: F.mono, fontSize: 9,
    color: dark ? C.narOsc : C.narLum,
    charSpacing: 2.5,
  });
}

// P0 FIX: margin:0 removes default 0.1" L/R insets so full 8.9" is available;
// fit:"resize" prevents overflow echo for titles that still wrap to 2 lines
function addH1(s, text, dark = false) {
  s.addText(text, {
    x: 0.55, y: dark ? 0.62 : 0.82,
    w: 8.9, h: dark ? 1.2 : 1.4,
    fontFace: F.syne, fontSize: dark ? 28 : 36,
    bold: true, color: dark ? C.azul : C.blanco,
    wrap: true, valign: "top",
    margin: 0,
    fit: "resize",
  });
}
// y base donde termina h1 (para posicionar elementos subsiguientes)
const H1_BOTTOM_DARK  = 0.62 + 1.2;  // = 1.82
const H1_BOTTOM_LIGHT = 0.82 + 1.4;  // = 2.22

function addAccentBar(s) {
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.08, h: 5.625,
    fill: { color: C.narLum }, line: { color: C.narLum, width: 0 },
  });
}

function addCard(s, x, y, w, h, fillColor = C.blanco) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: C.borde, width: 0.5 },
  });
}

function addCallout(s, text, x, y, w, h, accentColor = C.narOsc, bgColor = "FFF7ED") {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: bgColor }, line: { color: accentColor, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.05, h, fill: { color: accentColor }, line: { color: accentColor, width: 0 } });
  s.addText(text, {
    x: x + 0.12, y, w: w - 0.17, h,
    fontFace: F.sans, fontSize: 10.5, color: C.texto, wrap: true, valign: "middle",
  });
}

function addIoreBlock(s, x, y, w, h, label, items, color, bgColor) {
  addCard(s, x, y, w, h);
  // Tag
  const tagW = Math.min(label.length * 0.095 + 0.28, w - 0.24);
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.1, y: y + 0.08, w: tagW, h: 0.2, fill: { color: bgColor }, line: { color: color, width: 0.5 } });
  s.addText(label.toUpperCase(), { x: x + 0.1, y: y + 0.08, w: tagW, h: 0.2, fontFace: F.mono, fontSize: 8, bold: true, color, align: "center" });
  // Items
  items.slice(0, 6).forEach((item, i) => {
    s.addText("· " + item, {
      x: x + 0.12, y: y + 0.34 + i * 0.22,
      w: w - 0.22, h: 0.2,
      fontFace: F.mono, fontSize: 8, color: C.texto, wrap: true, valign: "top",
    });
  });
}

// ─── RENDERERS ────────────────────────────────────────────────────────────

function renderPortada(s, slide, n) {
  s.background = { color: C.azul };
  addAccentBar(s);
  addKicker(s, slide.kicker);

  s.addText(slide.h1_blanco || slide.h1, {
    x: 0.55, y: 0.82, w: 8.9, h: 0.85,
    fontFace: F.syne, fontSize: 40, bold: true, color: C.blanco, wrap: true, valign: "top",
  });
  if (slide.h2_naranja) {
    s.addText(slide.h2_naranja, {
      x: 0.55, y: 1.62, w: 8.9, h: 0.75,
      fontFace: F.syne, fontSize: 40, bold: true, color: C.narLum, wrap: true, valign: "top",
    });
  }
  if (slide.subtitulo) {
    s.addText(slide.subtitulo, {
      x: 0.55, y: 2.5, w: 8.9, h: 0.55,
      fontFace: F.sans, fontSize: 14, color: "9AB0C8", wrap: true,
    });
  }

  const c = slide.content || {};
  if (c.chip) {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 3.15, w: 3.4, h: 0.32, fill: { color: "0D2E4A" }, line: { color: C.narLum, width: 0.5 } });
    s.addText(c.chip, { x: 0.65, y: 3.19, w: 3.2, h: 0.24, fontFace: F.mono, fontSize: 9, color: C.narLum });
  }
  if (c.stats) {
    c.stats.forEach((st, i) => {
      const x = 0.55 + i * 1.8;
      s.addText(st.val,   { x, y: 3.72, w: 1.6, h: 0.65, fontFace: F.syne, fontSize: 42, bold: true, color: C.narLum, align: "center" });
      s.addText(st.label, { x, y: 4.35, w: 1.6, h: 0.22, fontFace: F.mono, fontSize: 10, color: "9AB0C8", align: "center" });
    });
  }
  // Badges (Cat C — portada II1 sin stats). Cumulative x prevents overlap when badges differ in length.
  if (c.badges && !c.stats) {
    let cumX = 0.55;
    c.badges.forEach((badge) => {
      const bW = Math.min(badge.length * 0.085 + 0.3, 2.2);
      s.addShape(pres.shapes.RECTANGLE, { x: cumX, y: 3.62, w: bW, h: 0.26, fill: { color: "0D2E4A" }, line: { color: C.narLum, width: 0.5 } });
      s.addText(badge, { x: cumX + 0.06, y: 3.64, w: bW - 0.12, h: 0.2, fontFace: F.mono, fontSize: 8, color: C.narLum });
      cumX += bW + 0.1;
    });
  }
  addFooter(s, n, true);
}

function renderContenidoCards(s, slide, n) {
  s.background = { color: C.crema };
  addKicker(s, slide.kicker, true);
  addH1(s, slide.h1, true);  // ends at H1_BOTTOM_DARK = 1.82

  let yNext = H1_BOTTOM_DARK;

  if (slide.subtitulo) {
    s.addText(slide.subtitulo, {
      x: 0.55, y: yNext, w: 8.9, h: 0.32,
      fontFace: F.sans, fontSize: 13, color: C.textoSub, wrap: true,
    });
    yNext += 0.35;
  } else {
    yNext += 0.06;
  }

  const c = slide.content || {};
  const cards = c.cards_2x2 || [];
  const cols = c.cols || 2;
  const cardsStart = yNext;

  if (cols === 3) {
    const cW = 2.9, gap = 0.1;
    const cH = 1.85;
    cards.forEach((card, i) => {
      const x = 0.55 + i * (cW + gap);
      addCard(s, x, cardsStart, cW, cH);
      s.addShape(pres.shapes.RECTANGLE, { x, y: cardsStart, w: 0.06, h: cH, fill: { color: C.azul }, line: { color: C.azul, width: 0 } });
      s.addText(card.title, { x: x + 0.12, y: cardsStart + 0.1,  w: cW - 0.18, h: 0.28, fontFace: F.syne, fontSize: 13, bold: true, color: C.azul, wrap: true });
      s.addText(card.sub,   { x: x + 0.12, y: cardsStart + 0.38, w: cW - 0.18, h: 0.2,  fontFace: F.mono, fontSize: 8, color: C.narOsc });
      s.addText(card.body,  { x: x + 0.12, y: cardsStart + 0.6,  w: cW - 0.18, h: 1.1,  fontFace: F.sans, fontSize: 10.5, color: C.textoSub, wrap: true });
    });
    yNext = cardsStart + cH + 0.1;
  } else {
    const cW = 4.45, cH = 1.4, gap = 4.65;
    cards.forEach((card, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.55 + col * gap, y = cardsStart + row * (cH + 0.12);
      addCard(s, x, y, cW, cH);
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: cH, fill: { color: C.azul }, line: { color: C.azul, width: 0 } });
      s.addText(card.title, { x: x + 0.15, y: y + 0.1,  w: 4.2, h: 0.3,  fontFace: F.syne, fontSize: 16, bold: true, color: C.azul });
      s.addText(card.sub,   { x: x + 0.15, y: y + 0.38, w: 4.2, h: 0.2,  fontFace: F.mono, fontSize: 9,  color: C.narOsc });
      s.addText(card.body,  { x: x + 0.15, y: y + 0.62, w: 4.2, h: 0.68, fontFace: F.sans, fontSize: 12, color: C.textoSub, wrap: true });
    });
    const rows = Math.ceil(cards.length / 2);
    yNext = cardsStart + rows * (cH + 0.12);
  }

  // Code block (Cat C)
  if (c.code_block) {
    const lines = (c.code_block.code || "").split("\n").length;
    const codeH = Math.min(Math.max(lines * 0.175 + 0.15, 0.55), 5.15 - yNext);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: yNext, w: 8.9, h: codeH, fill: { color: "1C1C1C" }, line: { color: "1C1C1C", width: 0 } });
    if (c.code_block.lang) {
      s.addShape(pres.shapes.RECTANGLE, { x: 9.02, y: yNext, w: 0.43, h: 0.18, fill: { color: C.narOsc }, line: { color: C.narOsc, width: 0 } });
      s.addText(c.code_block.lang, { x: 9.02, y: yNext + 0.01, w: 0.43, h: 0.16, fontFace: F.mono, fontSize: 6.5, color: C.blanco, align: "center" });
    }
    s.addText(c.code_block.code, {
      x: 0.65, y: yNext + 0.08, w: 8.7, h: codeH - 0.12,
      fontFace: F.mono, fontSize: 8.5, color: "E8E3D8", wrap: false, valign: "top",
    });
    yNext += codeH + 0.08;
  }

  // Callouts (Cat C)
  const callouts = c.callouts || (c.callout ? [c.callout] : []);
  callouts.forEach((text) => {
    if (yNext + 0.38 < 5.22) {
      addCallout(s, text, 0.55, yNext, 8.9, 0.38);
      yNext += 0.45;
    }
  });

  addFooter(s, n, false);
}

function renderFlujo(s, slide, n) {
  s.background = { color: C.crema };
  addKicker(s, slide.kicker, true);
  addH1(s, slide.h1, true);  // ends at 1.82

  const c = slide.content || {};
  const nodos = c.nodos || [];
  const kpis  = c.kpis  || [];
  const nodoY = 1.9, nodoH = 1.3;
  const nodoW = nodos.length > 0 ? (8.9 - (nodos.length - 1) * 0.28) / nodos.length : 2.0;
  const arrowW = 0.28;

  nodos.forEach((nodo, i) => {
    const x = 0.55 + i * (nodoW + arrowW);
    const color = resolveColor(nodo.color);
    const bg    = resolveBg(nodo.color);
    s.addShape(pres.shapes.RECTANGLE, { x, y: nodoY, w: nodoW, h: nodoH, fill: { color: bg }, line: { color, width: 1 } });
    s.addText(nodo.nombre, { x, y: nodoY + 0.14, w: nodoW, h: 0.6, fontFace: F.syne, fontSize: 12, bold: true, color, align: "center", wrap: true, valign: "top" });
    s.addText(nodo.tipo,   { x, y: nodoY + 0.82, w: nodoW, h: 0.28, fontFace: F.mono, fontSize: 7.5, color: C.textoSub, align: "center" });
    if (i < nodos.length - 1) {
      const ax = x + nodoW;
      s.addShape(pres.shapes.LINE, { x: ax, y: nodoY + nodoH / 2, w: arrowW, h: 0, line: { color: C.narOsc, width: 1.5 } });
      s.addText("▶", { x: ax + arrowW - 0.2, y: nodoY + nodoH / 2 - 0.13, w: 0.2, h: 0.22, fontFace: F.sans, fontSize: 10, color: C.narOsc });
    }
  });

  let yNext = nodoY + nodoH + 0.12;

  // KPI cards
  if (kpis.length > 0) {
    const kW = (8.9 - (kpis.length - 1) * 0.1) / kpis.length;
    kpis.forEach((kpi, i) => {
      const x = 0.55 + i * (kW + 0.1);
      addCard(s, x, yNext, kW, 0.7);
      s.addText(kpi.val,   { x, y: yNext + 0.04, w: kW, h: 0.38, fontFace: F.syne, fontSize: 26, bold: true, color: resolveColor(kpi.color || "narOsc"), align: "center" });
      s.addText(kpi.label, { x, y: yNext + 0.42, w: kW, h: 0.24, fontFace: F.sans, fontSize: 9, color: C.textoSub, align: "center", wrap: true });
    });
    yNext += 0.78;
  }

  if (c.callout && yNext + 0.38 < 5.22) {
    addCallout(s, c.callout, 0.55, yNext, 8.9, 0.44);
  }

  addFooter(s, n, false);
}

function renderIore(s, slide, n) {
  s.background = { color: C.crema };
  addKicker(s, slide.kicker, true);
  addH1(s, slide.h1, true);  // ends at 1.82

  const c = slide.content || {};
  const bW = 4.4, bH = 1.6, gap = 0.1, startY = 1.88;

  const blocks = [
    { label: "Inputs",      items: c.inputs      || [], color: C.inputs, bg: C.inputsBg  },
    { label: "Outputs",     items: c.outputs     || [], color: C.outputs, bg: C.outputsBg },
    { label: "Reglas",      items: c.reglas      || [], color: C.reglas, bg: C.reglasBg  },
    { label: "Excepciones", items: c.excepciones || [], color: C.excepc, bg: C.excepcBg  },
  ];

  blocks.forEach((block, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.55 + col * (bW + gap);
    const y = startY + row * (bH + gap);
    addIoreBlock(s, x, y, bW, bH, block.label, block.items, block.color, block.bg);
  });

  addFooter(s, n, false);
}

function renderTabla(s, slide, n) {
  s.background = { color: C.crema };
  addKicker(s, slide.kicker, true);
  addH1(s, slide.h1, true);  // ends at 1.82

  const c = slide.content || {};
  const cols   = c.columnas || [];
  const anchos = c.anchos || cols.map(() => 1 / cols.length);
  const filas  = c.filas  || [];
  const tX = 0.55, tW = 8.9, tY = 1.88;
  const hdrH = 0.28, rowH = 0.38;

  // Header
  s.addShape(pres.shapes.RECTANGLE, { x: tX, y: tY, w: tW, h: hdrH, fill: { color: C.azul }, line: { color: C.azul, width: 0 } });
  let xc = tX + 0.06;
  cols.forEach((label, i) => {
    const cW = tW * anchos[i];
    s.addText(label.toUpperCase(), { x: xc, y: tY + 0.05, w: cW - 0.08, h: 0.18, fontFace: F.mono, fontSize: 8, bold: true, color: C.narLum });
    xc += cW;
  });

  // Rows
  filas.forEach((fila, ri) => {
    const y = tY + hdrH + ri * rowH;
    const bg = ri % 2 === 0 ? C.blanco : C.crema;
    s.addShape(pres.shapes.RECTANGLE, { x: tX, y, w: tW, h: rowH, fill: { color: bg }, line: { color: C.borde, width: 0.3 } });
    let xr = tX + 0.06;
    fila.cols.forEach((cell, ci) => {
      const cW = tW * anchos[ci];
      s.addText(cell, {
        x: xr, y: y + 0.05, w: cW - 0.1, h: rowH - 0.08,
        fontFace: ci <= 1 ? F.mono : F.sans, fontSize: ci === 1 ? 8 : 9.5,
        color: C.texto, wrap: true, valign: "top",
      });
      xr += cW;
    });
  });

  // Callouts
  let cY = tY + hdrH + filas.length * rowH + 0.1;
  const callouts = c.callouts || (c.callout ? [c.callout] : []);
  callouts.forEach((text) => {
    if (cY + 0.36 < 5.22) {
      addCallout(s, text, tX, cY, tW, 0.36);
      cY += 0.43;
    }
  });

  addFooter(s, n, false);
}

function renderDivider(s, slide, n) {
  s.background = { color: C.azul };
  addAccentBar(s);

  if (slide.kicker) {
    s.addText(slide.kicker, { x: 0.55, y: 0.55, w: 8.9, h: 0.22, fontFace: F.mono, fontSize: 9, color: C.narLum, charSpacing: 2.5 });
  }
  s.addText(slide.h1 || "", {
    x: 0.55, y: 1.05, w: 8.9, h: 2.3,
    fontFace: F.syne, fontSize: 48, bold: true, color: C.blanco,
    wrap: true, valign: "top",
  });
  if (slide.subtitulo) {
    s.addText(slide.subtitulo, {
      x: 0.55, y: 3.5, w: 8.9, h: 0.85,
      fontFace: F.sans, fontSize: 14, color: "9AB0C8", wrap: true,
    });
  }

  addFooter(s, n, true);
}

function renderGate(s, slide, n) {
  s.background = { color: C.crema };
  addKicker(s, slide.kicker, true);
  addH1(s, slide.h1, true);  // ends at 1.82

  const c = slide.content || {};

  // Gate card — full width, fondo verde claro
  if (c.gate) {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 1.88, w: 8.9, h: 0.72, fill: { color: C.outputsBg }, line: { color: C.outputs, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 1.88, w: 0.06, h: 0.72, fill: { color: C.outputs }, line: { color: C.outputs, width: 0 } });
    const tagW = 1.1;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.68, y: 1.92, w: tagW, h: 0.2, fill: { color: C.outputsBg }, line: { color: C.outputs, width: 0.5 } });
    s.addText(c.gate.label || "Gate ✓", { x: 0.68, y: 1.93, w: tagW, h: 0.18, fontFace: F.mono, fontSize: 8, bold: true, color: C.outputs, align: "center" });
    s.addText(c.gate.descripcion || "", { x: 0.72, y: 2.15, w: 8.22, h: 0.42, fontFace: F.sans, fontSize: 10.5, color: C.texto, wrap: true });
  }

  // Dos columnas
  const colY = 2.7, colH = 2.5, colW = 4.33;

  if (c.fuera_scope && c.fuera_scope.length > 0) {
    addCard(s, 0.55, colY, colW, colH);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: colY, w: 0.06, h: colH, fill: { color: C.excepc }, line: { color: C.excepc, width: 0 } });
    s.addText("❌  Fuera de scope", { x: 0.7, y: colY + 0.1, w: colW - 0.2, h: 0.24, fontFace: F.mono, fontSize: 8.5, bold: true, color: C.excepc });
    c.fuera_scope.forEach((item, i) => {
      s.addText("→  " + item, { x: 0.7, y: colY + 0.4 + i * 0.34, w: colW - 0.2, h: 0.3, fontFace: F.sans, fontSize: 10.5, color: C.textoSub, wrap: true });
    });
  }

  if (c.siguiente) {
    addCard(s, 5.22, colY, colW, colH);
    s.addShape(pres.shapes.RECTANGLE, { x: 5.22, y: colY, w: 0.06, h: colH, fill: { color: C.azul }, line: { color: C.azul, width: 0 } });
    s.addText("→  " + (c.siguiente.titulo || ""), { x: 5.36, y: colY + 0.1, w: colW - 0.2, h: 0.24, fontFace: F.mono, fontSize: 8.5, bold: true, color: C.azul });
    (c.siguiente.items || []).forEach((item, i) => {
      s.addText("·  " + item, { x: 5.36, y: colY + 0.4 + i * 0.34, w: colW - 0.2, h: 0.3, fontFace: F.sans, fontSize: 10.5, color: C.textoSub, wrap: true });
    });
    if (c.siguiente.idea_fuerza) {
      const ifY = colY + colH - 0.36;
      s.addShape(pres.shapes.RECTANGLE, { x: 5.24, y: ifY, w: colW - 0.04, h: 0.28, fill: { color: C.inputsBg }, line: { color: C.azul, width: 0.5 } });
      s.addText(c.siguiente.idea_fuerza, { x: 5.32, y: ifY + 0.02, w: colW - 0.2, h: 0.24, fontFace: F.mono, fontSize: 7.5, color: C.azul, wrap: true });
    }
  }

  addFooter(s, n, false);
}

function renderImpacto(s, slide, n) {
  s.background = { color: C.crema };
  addKicker(s, slide.kicker, true);
  addH1(s, slide.h1, true);

  s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: H1_BOTTOM_DARK, w: 8.9, h: 1.0, fill: { color: C.azul }, line: { color: C.azul, width: 0 } });
  const partes = slide.content?.enunciado || [];
  s.addText(partes.map(p => ({
    text: p.texto,
    options: { color: p.enfasis ? C.narLum : C.blanco, fontFace: F.syne, fontSize: 28, bold: true },
  })), { x: 0.55, y: H1_BOTTOM_DARK + 0.16, w: 8.9, h: 0.68, align: "center" });

  const neg = slide.content?.columna_negativa;
  const pos = slide.content?.columna_positiva;
  const colY = H1_BOTTOM_DARK + 1.1;
  const colH = 5.2 - colY;
  if (neg) {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: colY, w: 4.22, h: colH, fill: { color: C.excepcBg }, line: { color: C.excepc, width: 1 } });
    s.addText(neg.titulo, { x: 0.75, y: colY + 0.1, w: 3.8, h: 0.28, fontFace: F.mono, fontSize: 9, bold: true, color: C.excepc });
    (neg.items || []).forEach((t, i) => { s.addText("→  " + t, { x: 0.75, y: colY + 0.44 + i * 0.4, w: 3.8, h: 0.36, fontFace: F.sans, fontSize: 12, color: C.excepc, wrap: true }); });
  }
  if (pos) {
    s.addShape(pres.shapes.RECTANGLE, { x: 5.23, y: colY, w: 4.22, h: colH, fill: { color: C.outputsBg }, line: { color: C.outputs, width: 1 } });
    s.addText(pos.titulo, { x: 5.43, y: colY + 0.1, w: 3.8, h: 0.28, fontFace: F.mono, fontSize: 9, bold: true, color: C.outputs });
    (pos.items || []).forEach((t, i) => { s.addText("→  " + t, { x: 5.43, y: colY + 0.44 + i * 0.4, w: 3.8, h: 0.36, fontFace: F.sans, fontSize: 12, color: C.outputs, wrap: true }); });
  }
  addFooter(s, n, false);
}

function renderCierre(s, slide, n) {
  s.background = { color: C.azul };
  addAccentBar(s);
  addKicker(s, slide.kicker);
  s.addText(slide.h1, { x: 0.55, y: 1.0, w: 8.9, h: 1.4, fontFace: F.syne, fontSize: 30, bold: true, color: C.blanco, wrap: true });
  if (slide.content?.respuesta) {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 2.58, w: 8.9, h: 0.58, fill: { color: "0D2A45" }, line: { color: C.narLum, width: 0.5 } });
    s.addText(slide.content.respuesta, { x: 0.75, y: 2.7, w: 8.5, h: 0.34, fontFace: F.syne, fontSize: 18, color: "9AB0C8" });
  }
  (slide.content?.condiciones || []).forEach((c, i) => {
    s.addText("→  " + c, { x: 0.55, y: 3.38 + i * 0.42, w: 8.9, h: 0.36, fontFace: F.sans, fontSize: 14, color: "9AB0C8" });
  });
  addFooter(s, n, true);
}

function renderPreviewSesion(s, slide, n) {
  s.background = { color: C.azul };
  addAccentBar(s);
  addKicker(s, slide.kicker);
  s.addText(slide.h1, { x: 0.55, y: 0.75, w: 8.9, h: 0.72, fontFace: F.syne, fontSize: 36, bold: true, color: C.blanco });
  if (slide.subtitulo_prda) {
    s.addText(slide.subtitulo_prda, { x: 0.55, y: 1.52, w: 2.0, h: 0.32, fontFace: F.mono, fontSize: 12, color: C.narLum, bold: true });
  }
  (slide.content?.pasos || []).forEach((p, i) => {
    const y = 2.05 + i * 1.05;
    s.addShape(pres.shapes.OVAL, { x: 0.55, y, w: 0.62, h: 0.62, fill: { color: C.narLum }, line: { color: C.narLum, width: 0 } });
    s.addText(p.num,     { x: 0.55, y, w: 0.62, h: 0.62, fontFace: F.syne, fontSize: 16, bold: true, color: C.azul, align: "center", valign: "middle" });
    s.addText(p.titulo,  { x: 1.32, y, w: 7.8, h: 0.3, fontFace: F.syne, fontSize: 15, bold: true, color: C.blanco });
    s.addText(p.detalle, { x: 1.32, y: y + 0.3, w: 7.8, h: 0.32, fontFace: F.sans, fontSize: 12, color: "9AB0C8" });
  });
  if (slide.content?.footer_ref) {
    s.addText(slide.content.footer_ref, { x: 3.0, y: 5.3, w: 6.5, h: 0.2, fontFace: F.mono, fontSize: 9, color: C.narLum, align: "right" });
  }
  addFooter(s, n, true);
}

function renderGenerico(s, slide, n) {
  const dark = (slide.fondo || "crema") === "azul";
  s.background = { color: dark ? C.azul : C.crema };
  if (dark) addAccentBar(s);
  if (slide.kicker) addKicker(s, slide.kicker, !dark);
  if (slide.h1)     addH1(s, slide.h1, !dark);
  if (slide.subtitulo) {
    s.addText(slide.subtitulo, {
      x: 0.55, y: dark ? H1_BOTTOM_LIGHT : H1_BOTTOM_DARK,
      w: 8.9, h: 0.3,
      fontFace: F.sans, fontSize: 13, color: dark ? "9AB0C8" : C.textoSub,
    });
  }
  s.addText(`[tipo: ${slide.type}] — implementar renderer en build_from_guion.js`, {
    x: 0.55, y: 2.3, w: 8.9, h: 0.4,
    fontFace: F.mono, fontSize: 11, color: C.narOsc, italic: true,
  });
  addFooter(s, n, dark);
}

// ─── DISPATCH ─────────────────────────────────────────────────────────────

const RENDERERS = {
  portada:            renderPortada,
  portada_secundaria: renderPortada,
  contenido:          renderContenidoCards,
  contenido_cards:    renderContenidoCards,
  flujo:              renderFlujo,
  tabla:              renderTabla,
  iore:               renderIore,
  divider:            renderDivider,
  gate:               renderGate,
  impacto:            renderImpacto,
  cierre:             renderCierre,
  preview_sesion:     renderPreviewSesion,
};

guion.slides.forEach((slide, i) => {
  const n = i + 1;
  const s = pres.addSlide();
  const renderer = RENDERERS[slide.type] || renderGenerico;
  renderer(s, slide, n);
});

// ─── WRITE ────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: OUTPUT_PATH })
  .then(() => console.log(`OK: ${OUTPUT_PATH}`))
  .catch(e => { console.error("Error:", e.message); process.exit(1); });
