// ─── pptx_helpers.js ─────────────────────────────────────────────────────────
// Funciones auxiliares reutilizables para generar slides de marco teórico COIIAOC
// Requiere: npm install -g pptxgenjs
// Uso: const h = require('./pptx_helpers'); const pres = h.newPres("Título");
//
// IMPORTANTE: Copia este archivo al directorio de trabajo antes de importarlo.
// No importes desde la ruta del skill directamente.

const pptxgen = require("pptxgenjs");

// ── Tokens de color (sin # prefix) ──────────────────────────────────────────
const C = {
  az: "1E3A5F", nl: "FF8C3B", no: "C2510A", cr: "FAFAF7", wh: "FFFFFF",
  inp: "2E6B9E", out: "0D7C5A", reg: "B45309", exc: "B91C1C",
  tx: "1C1C1C", ts: "6B6B6B", td: "9B9B9B", mute: "9AB0C8",
  bc: "E8E3D8", parch: "F5F2EC",
  card_dark: "243F6B", card_border_dark: "3A5A85",
};

// ── Tokens de fuente ─────────────────────────────────────────────────────────
const F = { syne: "Syne", mono: "IBM Plex Mono", sans: "IBM Plex Sans" };

// ── Constantes de layout ─────────────────────────────────────────────────────
const L = { W: 10, H: 5.625, ML: 0.55, TW: 8.90, CT: 0.38, TY: 0.64, FY: 5.30 };

// ── Nueva presentación ───────────────────────────────────────────────────────
function newPres(title, author = "Bernardo Ronquillo Japón") {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = author;
  pres.title = title;
  return pres;
}

// ── Barra naranja izquierda (solo dark slides) ────────────────────────────────
function addLeftBar(slide) {
  slide.addShape("rect", {
    x: 0, y: 0, w: 0.08, h: L.H,
    fill: { color: C.nl }, line: { color: C.nl, width: 1 },
  });
}

// ── Kicker (supra-título) ────────────────────────────────────────────────────
// dark=true → naranja luminoso; dark=false → naranja oscuro
function addKicker(slide, text, dark = true) {
  slide.addText(text, {
    x: L.ML, y: L.CT, w: L.TW, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: dark ? C.nl : C.no,
    charSpacing: 2.5, margin: 0,
  });
}

// ── Título bicolor ───────────────────────────────────────────────────────────
// dark=true → Syne 26pt, blanco+naranja luminoso, h=0.95"
// dark=false → Syne 20pt, azul+naranja oscuro, h=0.50"
function addTitle(slide, line1, line2, dark = true) {
  const col1 = dark ? C.wh : C.az;
  const col2 = dark ? C.nl : C.no;
  const runs = [{ text: line1, options: { color: col1, breakLine: !!line2 } }];
  if (line2) runs.push({ text: line2, options: { color: col2 } });
  slide.addText(runs, {
    x: L.ML, y: L.TY, w: L.TW, h: dark ? 0.95 : 0.50,
    fontFace: F.syne, fontSize: dark ? 26 : 20, bold: true, margin: 0,
  });
}

// ── Indicador de página (bottom right) ──────────────────────────────────────
function addPageLabel(slide, label) {
  slide.addText(label, {
    x: 9.1, y: L.FY, w: 0.8, h: 0.2,
    fontFace: F.mono, fontSize: 9, color: C.td, align: "right", margin: 0,
  });
}

// ── Referencia bibliográfica (dark slides, fila inferior) ────────────────────
function addRef(slide, text) {
  slide.addText(text, {
    x: L.ML, y: 5.08, w: L.TW, h: 0.18,
    fontFace: F.mono, fontSize: 7.5, color: "555555", margin: 0,
  });
}

// ── Insight / axiom box (light slides) ───────────────────────────────────────
// Rectángulo con borde izquierdo de color y fondo azul pálido
function addInsightBox(slide, text, x, y, w, h, accentColor = C.az) {
  slide.addShape("rect", {
    x, y, w, h, fill: { color: "EBF2F9" }, line: { color: C.bc, width: 0.5 },
  });
  slide.addShape("rect", {
    x, y, w: 0.05, h, fill: { color: accentColor }, line: { color: accentColor, width: 0.5 },
  });
  slide.addText(text, {
    x: x + 0.15, y: y + 0.05, w: w - 0.2, h: h - 0.1,
    fontFace: F.sans, fontSize: 9, color: C.ts, wrap: true, valign: "middle", margin: 0,
  });
}

// ── Card oscura (para slides A y D) ─────────────────────────────────────────
// Añade el rectángulo de fondo. El contenido se añade con addText/addShape por separado.
function addDarkCard(slide, x, y, w, h) {
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: C.card_dark }, line: { color: C.card_border_dark, width: 0.75 },
  });
}

// ── Card clara con borde izquierdo de color (para slide C rule cards) ────────
function addAccentCard(slide, x, y, w, h, accentColor = C.az, bgColor = "F4F1EB") {
  slide.addShape("rect", {
    x, y, w, h, fill: { color: bgColor }, line: { color: C.bc, width: 0.5 },
  });
  slide.addShape("rect", {
    x, y, w: 0.05, h, fill: { color: accentColor }, line: { color: accentColor, width: 0.5 },
  });
}

// ── Etiqueta de tag (banda coloreada en la parte superior de una card) ────────
function addTagStrip(slide, x, y, w, tagText, tagColor) {
  const h = 0.20;
  slide.addShape("rect", {
    x, y, w, h: h, fill: { color: tagColor }, line: { color: tagColor, width: 0.5 },
  });
  slide.addText(tagText, {
    x: x + 0.1, y: y + 0.01, w: w - 0.15, h: h - 0.02,
    fontFace: F.mono, fontSize: 7, color: C.wh, valign: "middle", charSpacing: 1, margin: 0,
  });
}

// ── Flecha de flujo (texto "→") ───────────────────────────────────────────────
function addFlowArrow(slide, x, y) {
  slide.addText("→", {
    x, y, w: 0.3, h: 0.35,
    fontFace: F.sans, fontSize: 20, color: C.bc, align: "center", margin: 0,
  });
}

// ── Esqueleto completo de slide A (dark, PEAS / concepto intro) ──────────────
// cards = [{ letter, en, es, verbex }]  — exactamente 4 elementos
function buildSlideA(pres, sessionNum, kicker, titleLine1, titleLine2, cards, refText) {
  const s = pres.addSlide();
  s.background = { color: C.az };
  addLeftBar(s);
  addKicker(s, kicker);
  addTitle(s, titleLine1, titleLine2, true);
  addPageLabel(s, "A / 4");
  if (refText) addRef(s, refText);

  const cW = 2.1, gap = 0.15, cH = 3.1, cY = 1.68;
  cards.forEach((card, i) => {
    const cX = L.ML + i * (cW + gap);
    addDarkCard(s, cX, cY, cW, cH);
    s.addText(card.letter, {
      x: cX + 0.12, y: cY + 0.15, w: cW - 0.2, h: 0.55,
      fontFace: F.syne, fontSize: 34, bold: true, color: C.nl, margin: 0,
    });
    s.addText(card.en, {
      x: cX + 0.12, y: cY + 0.73, w: cW - 0.2, h: 0.18,
      fontFace: F.mono, fontSize: 7.5, color: "6A8DAA", charSpacing: 1, margin: 0,
    });
    s.addText(card.es, {
      x: cX + 0.12, y: cY + 0.94, w: cW - 0.2, h: 0.24,
      fontFace: F.syne, fontSize: 11, bold: true, color: C.wh, margin: 0,
    });
    s.addText(card.verbex, {
      x: cX + 0.12, y: cY + 1.22, w: cW - 0.22, h: 1.76,
      fontFace: F.sans, fontSize: 9, color: C.mute, wrap: true, valign: "top", margin: 0,
    });
  });
  return s;
}

// ── Esqueleto de slide D (dark, cierre transferible) ─────────────────────────
// cards = [{ label, title, body }]  — exactamente 3 elementos
function buildSlideD(pres, kicker, domainQuestion, cards) {
  const s = pres.addSlide();
  s.background = { color: C.az };
  addLeftBar(s);
  addKicker(s, kicker);
  addTitle(s, "Lo que aprendimos — ", "en términos transferibles", true);
  addPageLabel(s, "D / 4");

  const cW = 2.75, cH = 3.0, cY = 1.52, gap = 0.175;
  cards.forEach((card, i) => {
    const cX = L.ML + i * (cW + gap);
    addDarkCard(s, cX, cY, cW, cH);
    s.addText(card.label, {
      x: cX + 0.15, y: cY + 0.12, w: cW - 0.3, h: 0.20,
      fontFace: F.mono, fontSize: 7.5, color: "6A8DAA", charSpacing: 1.5, margin: 0,
    });
    s.addText(card.title, {
      x: cX + 0.15, y: cY + 0.36, w: cW - 0.3, h: 0.54,
      fontFace: F.syne, fontSize: 12.5, bold: true, color: C.nl, wrap: true, margin: 0,
    });
    s.addText(card.body, {
      x: cX + 0.15, y: cY + 0.98, w: cW - 0.3, h: 1.9,
      fontFace: F.sans, fontSize: 9.5, color: C.mute, wrap: true, valign: "top", margin: 0,
    });
  });

  if (domainQuestion) {
    s.addText(domainQuestion, {
      x: L.ML, y: 4.65, w: L.TW, h: 0.3,
      fontFace: F.mono, fontSize: 8, color: "444444", wrap: true, margin: 0,
    });
  }
  return s;
}

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  C, F, L,
  newPres, addLeftBar, addKicker, addTitle, addPageLabel, addRef,
  addInsightBox, addDarkCard, addAccentCard, addTagStrip, addFlowArrow,
  buildSlideA, buildSlideD,
};

// ── Ejemplo de uso mínimo ─────────────────────────────────────────────────────
// const h = require('./pptx_helpers');
// const pres = h.newPres("Marco Teórico · II3");
//
// // Slide A (usa buildSlideA para estructura PEAS)
// h.buildSlideA(pres, "II3",
//   "MARCO TEÓRICO · II3 · SLIDE A — insertar tras portada",
//   "El problema de fundamentación simbólica:", "por qué los LLMs pueden extraer estructura",
//   [
//     { letter: "S", en: "Symbol Grounding", es: "Fundamentación simbólica",
//       verbex: "Por qué un sistema de reglas no puede leer 'AOG' en texto libre\ny necesita al LLM como intermediario" },
//     // ... resto de cards
//   ],
//   "Harnad 1990 · The Symbol Grounding Problem · Robotics and Autonomous Systems"
// );
//
// // Slide B, C: construir manualmente con las helpers individuales
// const sB = pres.addSlide();
// sB.background = { color: h.C.cr };
// h.addKicker(sB, "MARCO TEÓRICO · II3 · SLIDE B", false);
// h.addTitle(sB, "Taxonomía de errores LLM ", "en extracción estructurada", false);
// // ... addTable, addInsightBox, etc.
//
// // Slide D (usa buildSlideD para estructura de 3 cards)
// h.buildSlideD(pres,
//   "MARCO TEÓRICO · II3 · SLIDE D · CIERRE — insertar tras Gate F3",
//   "Pregunta de dominio: ¿Qué parte de tu pipeline confías al LLM y qué parte a las reglas? ¿Lo has justificado formalmente?",
//   [
//     { label: "CONCEPTO ABSTRACTO", title: "Symbol grounding + extracción vs razonamiento",
//       body: "Los LLMs no razonan: distribucionalmente asocian patrones..." },
//     { label: "EN VERBEX · II3", title: "SOUL + SKILL + parser anti-alucinación",
//       body: "El LLM extrae estructura del texto libre PO..." },
//     { label: "EN OTRO DOMINIO", title: "Procesamiento de facturas en sector seguros",
//       body: "Texto libre → JSON → reglas de validación deterministas..." },
//   ]
// );
//
// await pres.writeFile({ fileName: "II3_marco_raw.pptx" });
// // Luego: python3 -c "from pptx import Presentation; Presentation('II3_marco_raw.pptx').save('marco_teorico_II3.pptx')"
