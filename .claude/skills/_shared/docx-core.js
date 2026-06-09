"use strict";
// docx-core.js — Motor CURSO-NEUTRO para generar DOCX A4 (paleta COIIAOC v1.1).
// Paleta, helpers de párrafo/bloque/tabla y la fábrica makeDoc() son genéricos:
// el chip, el título y el footer se pasan por parámetro (no hay nada de un curso concreto).
// Importar: const u = require('../_shared/docx-core');
// (El curso APM lo usa vía el alias apm-docx-builder/docx-apm-utils.js, por compatibilidad.)

const DOCX_PATH = "C:/Users/brjap/AppData/Roaming/npm/node_modules/docx";
const docx = require(DOCX_PATH);
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, LevelFormat, TabStopType,
} = docx;

// ── PALETA ────────────────────────────────────────────────────────────────────
const C = {
  azul:      "1E3A5F",
  narOsc:    "C2510A",
  narLuz:    "FF8C3B",
  crema:     "FAFAF7",
  parchment: "F5F2EC",
  borde:     "E8E3D8",
  texSec:    "6B6B6B",
  azMedio:   "2E6B9E",
  verde:     "0D7C5A",
  ambar:     "B45309",
  rojo:      "B91C1C",
  blanco:    "FFFFFF",
  texto:     "1C1C1C",
  narBg:     "FFF7ED",
  verdeBg:   "F0FFF8",
  rojoBg:    "FFF5F5",
};

// ── DIMENSIONES (A4, márgenes 1 inch = 1440 DXA) ─────────────────────────────
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1440;
const CW     = PAGE_W - 2 * MARGIN; // 9026 DXA — ancho de contenido

// columnas estándar de tabla 2-col (label + value)
const COL1 = 3800;
const COL2 = CW - COL1; // 5226

// ── HELPERS DE BORDE ──────────────────────────────────────────────────────────
const bdr    = (color, size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const noBdr  = ()                => ({ style: BorderStyle.NONE,   size: 0, color: "FFFFFF" });
const allBdr = (color = C.borde) => ({
  top: bdr(color), bottom: bdr(color), left: bdr(color), right: bdr(color),
});

// ── HELPERS DE TEXTO ─────────────────────────────────────────────────────────
/** TextRun normal */
const t = (text, o = {}) =>
  new TextRun({ text, font: "Arial", size: 20, color: C.texto, ...o });

/** TextRun negrita */
const b = (text, o = {}) => t(text, { bold: true, ...o });

/** TextRun mono (chip/badge) */
const mono = (text, o = {}) =>
  new TextRun({ text, font: "Courier New", size: 16, color: C.narOsc, bold: true, ...o });

// ── HELPERS DE PÁRRAFO ───────────────────────────────────────────────────────
/** Párrafo simple */
const p = (children, opts = {}) =>
  new Paragraph({
    children: Array.isArray(children) ? children : [children],
    spacing: { before: 0, after: 0 },
    ...opts,
  });

/** Espacio vertical */
const gap = (before = 80, after = 80) =>
  p(t(" "), { spacing: { before, after } });

// ── ELEMENTOS DE DISEÑO ───────────────────────────────────────────────────────

/**
 * Cabecera azul de bloque (Bloque N · Título)
 * @returns {Paragraph[]}
 */
function blockHdr(text) {
  return [
    p(t(" "), { spacing: { before: 160, after: 0 } }),
    new Paragraph({
      children: [b(text, { size: 22, color: C.blanco })],
      shading: { fill: C.azul, type: ShadingType.CLEAR },
      spacing: { before: 0, after: 0 },
      indent: { left: 140, right: 140 },
    }),
  ];
}

/**
 * Divisor de sección/versión (barra azul con acento naranja izquierdo)
 * @param {string} mainText — texto principal (blanco, grande)
 * @param {string} [subText] — subtexto opcional (naranja luminoso)
 * @returns {Paragraph[]}
 */
function versionDivider(mainText, subText) {
  const children = [b(mainText, { size: 26, color: C.blanco })];
  if (subText) {
    children.push(t("   " + subText, { size: 18, color: C.narLuz }));
  }
  return [
    gap(200, 0),
    new Paragraph({
      children,
      shading: { fill: C.azul, type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.THICK, size: 32, color: C.narOsc, space: 0 } },
      spacing: { before: 0, after: 0 },
      indent: { left: 140, right: 140 },
    }),
    gap(0, 120),
  ];
}

/**
 * Callout con borde naranja izquierdo y fondo crema
 * @param {string[]} lines — una línea por elemento del array
 * @returns {Paragraph[]}
 */
function callout(lines) {
  return lines.map((line, i) => new Paragraph({
    children: [t(line, { size: 18, color: "4A3000", italics: true })],
    border: { left: { style: BorderStyle.THICK, size: 20, color: C.narOsc, space: 8 } },
    shading: { fill: C.narBg, type: ShadingType.CLEAR },
    spacing: { before: i === 0 ? 120 : 20, after: i === lines.length - 1 ? 120 : 0 },
    indent: { left: 200, right: 200 },
  }));
}

/**
 * Callout de alerta / bandera roja (borde rojo)
 * @param {string[]} lines
 * @returns {Paragraph[]}
 */
function alertCallout(lines) {
  return lines.map((line, i) => new Paragraph({
    children: [t(line, { size: 18, color: "7F1D1D", italics: true })],
    border: { left: { style: BorderStyle.THICK, size: 20, color: C.rojo, space: 8 } },
    shading: { fill: C.rojoBg, type: ShadingType.CLEAR },
    spacing: { before: i === 0 ? 120 : 20, after: i === lines.length - 1 ? 120 : 0 },
    indent: { left: 200, right: 200 },
  }));
}

/**
 * Callout verde (info / buena práctica)
 * @param {string[]} lines
 * @returns {Paragraph[]}
 */
function infoCallout(lines) {
  return lines.map((line, i) => new Paragraph({
    children: [t(line, { size: 18, color: "064E3B", italics: true })],
    border: { left: { style: BorderStyle.THICK, size: 20, color: C.verde, space: 8 } },
    shading: { fill: C.verdeBg, type: ShadingType.CLEAR },
    spacing: { before: i === 0 ? 120 : 20, after: i === lines.length - 1 ? 120 : 0 },
    indent: { left: 200, right: 200 },
  }));
}

/**
 * Etiqueta de sub-elemento (negrita azul oscuro)
 */
function subLabel(text) {
  return new Paragraph({
    children: [b(text, { size: 18, color: C.azul })],
    spacing: { before: 140, after: 60 },
  });
}

/**
 * Caja de texto editable en blanco (N líneas sombreadas, para escritura a mano)
 * @param {number} numLines
 * @returns {Table}
 */
function textBoxBlank(numLines = 2) {
  const rows = [];
  for (let i = 0; i < numLines; i++) {
    rows.push(new TableRow({
      height: { value: 460, rule: "atLeast" },
      children: [new TableCell({
        width: { size: CW, type: WidthType.DXA },
        borders: {
          top:    i === 0 ? bdr(C.borde) : noBdr(),
          bottom: bdr(C.borde),
          left:   bdr(C.borde),
          right:  bdr(C.borde),
        },
        shading: { fill: C.parchment, type: ShadingType.CLEAR },
        margins: { top: 40, bottom: 40, left: 120, right: 120 },
        children: [p(t(" "))],
      })],
    }));
  }
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CW],
    rows,
  });
}

/**
 * Caja de texto con contenido (versión ejemplo)
 * @param {string[]} paragraphLines — una línea por párrafo
 * @returns {Table}
 */
function textBoxFilled(paragraphLines) {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CW],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: CW, type: WidthType.DXA },
        borders: allBdr(C.borde),
        shading: { fill: C.parchment, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: paragraphLines.map(line =>
          p(t(line, { size: 18, italics: true, color: C.texto }))
        ),
      })],
    })],
  });
}

/**
 * Tabla label-valor de 2 columnas (Bloques de identificación / firma)
 * rows: Array de [label, value]
 * @returns {Table}
 */
function labelTable(rows) {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [COL1, COL2],
    rows: rows.map(([label, value]) => new TableRow({
      children: [
        new TableCell({
          width: { size: COL1, type: WidthType.DXA },
          borders: allBdr(),
          shading: { fill: C.parchment, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [p(t(label, { size: 18, color: C.texSec }))],
        }),
        new TableCell({
          width: { size: COL2, type: WidthType.DXA },
          borders: allBdr(),
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [p(t(value, { size: 18 }))],
        }),
      ],
    })),
  });
}

/**
 * Tabla de rúbrica de puntuación 1–4 (2 columnas: descripción | puntuación)
 * rows: Array de [descripcion, puntuacion_string]
 * @param {[string, string][]} rows
 * @param {boolean} hasHeader — si true, primera fila es cabecera azul
 * @returns {Table}
 */
function rubricTable(rows) {
  const CD = 7400, CS = CW - CD; // 1626
  const hdrRow = new TableRow({
    children: [
      new TableCell({
        width: { size: CD, type: WidthType.DXA },
        borders: allBdr(C.azMedio),
        shading: { fill: C.azul, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [p(b("Respuesta", { size: 18, color: C.blanco }))],
      }),
      new TableCell({
        width: { size: CS, type: WidthType.DXA },
        borders: allBdr(C.azMedio),
        shading: { fill: C.azul, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 60, right: 60 },
        children: [new Paragraph({ children: [b("Punt.", { size: 18, color: C.blanco })], alignment: AlignmentType.CENTER })],
      }),
    ],
  });

  const bodyRows = rows.map(([desc, punt]) => new TableRow({
    children: [
      new TableCell({
        width: { size: CD, type: WidthType.DXA },
        borders: allBdr(),
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [p(t(desc, { size: 18 }))],
      }),
      new TableCell({
        width: { size: CS, type: WidthType.DXA },
        borders: allBdr(),
        margins: { top: 80, bottom: 80, left: 60, right: 60 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          children: [b(punt, { size: 24, color: C.azMedio })],
          alignment: AlignmentType.CENTER,
        })],
      }),
    ],
  }));

  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CD, CS],
    rows: [hdrRow, ...bodyRows],
  });
}

/**
 * Tabla de 2 columnas con header azul (genérica)
 * colWidths: [w1, w2]  —  headers: [h1, h2]
 * rows: Array de [celda1_texto|string[], celda2_texto|string[]]
 */
function twoColTable(colWidths, headers, rows) {
  const [W1, W2] = colWidths;
  const mkCell = (content, w, isHdr = false, shading = null) => {
    const lines = Array.isArray(content) ? content : [content];
    return new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders: allBdr(isHdr ? C.azMedio : C.borde),
      shading: isHdr
        ? { fill: C.azul, type: ShadingType.CLEAR }
        : shading
          ? { fill: shading, type: ShadingType.CLEAR }
          : undefined,
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: lines.map(line => new Paragraph({
        children: [isHdr
          ? b(line, { size: 18, color: C.blanco })
          : t(line, { size: 18 })],
        spacing: { before: 0, after: 0 },
      })),
    });
  };

  const hdrRow = new TableRow({
    children: [mkCell(headers[0], W1, true), mkCell(headers[1], W2, true)],
  });

  const bodyRows = rows.map(([c1, c2]) => new TableRow({
    children: [
      mkCell(c1, W1, false, C.parchment),
      mkCell(c2, W2, false),
    ],
  }));

  return new Table({
    width: { size: W1 + W2, type: WidthType.DXA },
    columnWidths: [W1, W2],
    rows: [hdrRow, ...bodyRows],
  });
}

/**
 * Fábrica de documento A4 con header/footer estándar (curso-neutro)
 * @param {object} opts
 * @param {string} opts.chip     — texto del chip (ej. "CURSO · AÑO · SESIÓN")
 * @param {string} opts.title    — título del documento
 * @param {string} opts.subtitle — subtítulo
 * @param {string} opts.footer   — texto de pie (ej. "Curso · Año · Sesión · Material · vN")
 * @param {Paragraph[]|Table[]} opts.children — contenido principal
 * @returns {Document}
 */
function makeDoc({ chip, title, subtitle, footer, children }) {
  return new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 560, hanging: 280 } } },
          }],
        },
        {
          reference: "numbers",
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 560, hanging: 280 } } },
          }],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: "Arial", size: 20, color: C.texto } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: chip, font: "Courier New", size: 16, color: C.narOsc, bold: true }),
              new TextRun({ text: "\t" }),
              new TextRun({ text: title, font: "Arial", size: 16, color: C.texSec }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.azul, space: 6 } },
            tabStops: [{ type: TabStopType.RIGHT, position: CW }],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: footer, font: "Arial", size: 16, color: C.texSec }),
              new TextRun({ text: "\t" }),
              new TextRun({ text: "Página ", font: "Arial", size: 16, color: C.texSec }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: C.texSec }),
            ],
            border: { top: { style: BorderStyle.SINGLE, size: 8, color: C.azul, space: 6 } },
            tabStops: [{ type: TabStopType.RIGHT, position: CW }],
          })],
        }),
      },
      children: [
        // Chip + Título del documento
        new Paragraph({ children: [mono(chip)], spacing: { before: 0, after: 40 } }),
        new Paragraph({
          children: [b(title, { size: 44, color: C.azul })],
          spacing: { before: 0, after: 40 },
          border: { bottom: { style: BorderStyle.THICK, size: 16, color: C.narOsc, space: 6 } },
        }),
        new Paragraph({
          children: [t(subtitle, { size: 18, color: C.texSec, italics: true })],
          spacing: { before: 80, after: 160 },
        }),
        ...children,
      ],
    }],
  });
}

// ── EXPORTS ───────────────────────────────────────────────────────────────────
module.exports = {
  // clases docx re-exportadas (para que los scripts consumidores no repitan el require)
  ...docx,
  Packer,

  // paleta y dimensiones
  C, PAGE_W, PAGE_H, MARGIN, CW, COL1, COL2,

  // bordes
  bdr, noBdr, allBdr,

  // texto
  t, b, mono,

  // párrafos
  p, gap,

  // elementos de diseño
  blockHdr,
  versionDivider,
  callout,
  alertCallout,
  infoCallout,
  subLabel,

  // tablas
  labelTable,
  textBoxBlank,
  textBoxFilled,
  rubricTable,
  twoColTable,

  // fábrica
  makeDoc,
};
