"use strict";
// gen_m4_b1_docx.js — Genera M4_plantilla-candidatura_B1.docx
// Paleta: paleta_curso.html (COIIAOC v1.1)

const DOCX_PATH = "C:/Users/brjap/AppData/Roaming/npm/node_modules/docx";
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, LevelFormat, TabStopType,
} = require(DOCX_PATH);
const fs = require("fs");

// ── PALETA ────────────────────────────────────────────────────────────────────
const C = {
  azul:     "1E3A5F",
  narOsc:   "C2510A",
  narLuz:   "FF8C3B",
  crema:    "FAFAF7",
  parchment:"F5F2EC",
  borde:    "E8E3D8",
  texSec:   "6B6B6B",
  azMedio:  "2E6B9E",
  verde:    "0D7C5A",
  ambar:    "B45309",
  rojo:     "B91C1C",
  blanco:   "FFFFFF",
  texto:    "1C1C1C",
  narBg:    "FFF7ED",
};

// ── DIMENSIONES (A4, márgenes 1 inch = 1440 DXA) ─────────────────────────────
const PAGE_W  = 11906;
const PAGE_H  = 16838;
const MARGIN  = 1440;
const CW      = PAGE_W - 2 * MARGIN; // 9026 DXA

// columnas de tabla 2-cols (label + value)
const C1 = 3800;
const C2 = CW - C1; // 5226

// ── HELPERS DE BORDE ──────────────────────────────────────────────────────────
const bdr  = (color, size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const noBdr = ()               => ({ style: BorderStyle.NONE,   size: 0, color: "FFFFFF" });
const allBdr = (color = C.borde) => ({
  top: bdr(color), bottom: bdr(color), left: bdr(color), right: bdr(color),
});
const noBdrs = () => ({
  top: noBdr(), bottom: noBdr(), left: noBdr(), right: noBdr(),
});

// ── HELPERS DE TEXTO ─────────────────────────────────────────────────────────
const t = (text, o = {}) =>
  new TextRun({ text, font: "Arial", size: 20, color: C.texto, ...o });

const b = (text, o = {}) => t(text, { bold: true, ...o });

const mono = (text, o = {}) =>
  new TextRun({ text, font: "Courier New", size: 16, color: C.narOsc, bold: true, ...o });

// Párrafo simple
const p = (children, opts = {}) =>
  new Paragraph({ children: Array.isArray(children) ? children : [children],
    spacing: { before: 0, after: 0 }, ...opts });

// Espacio en blanco
const gap = (before = 80, after = 80) =>
  p(t(" "), { spacing: { before, after } });

// ── ELEMENTOS DE DISEÑO ───────────────────────────────────────────────────────

// Cabecera azul de bloque (Bloque N · Título)
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

// Divisor de versión (barra azul con acento naranja)
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

// Callout (borde izquierdo naranja + fondo crema)
function callout(lines) {
  return lines.map((line, i) => new Paragraph({
    children: [t(line, { size: 18, color: "4A3000", italics: true })],
    border: { left: { style: BorderStyle.THICK, size: 20, color: C.narOsc, space: 8 } },
    shading: { fill: C.narBg, type: ShadingType.CLEAR },
    spacing: { before: i === 0 ? 120 : 20, after: i === lines.length - 1 ? 120 : 0 },
    indent: { left: 200, right: 200 },
  }));
}

// Etiqueta de sub-elemento (negrita azul)
function subLabel(text) {
  return new Paragraph({
    children: [b(text, { size: 18, color: C.azul })],
    spacing: { before: 140, after: 60 },
  });
}

// Caja de texto editable en blanco (N líneas sombreadas)
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

// Caja de texto con contenido (versión ejemplo)
function textBoxFilled(paragraphs) {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CW],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: CW, type: WidthType.DXA },
        borders: allBdr(C.borde),
        shading: { fill: C.parchment, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: paragraphs.map(txt =>
          p(t(txt, { size: 18, italics: true, color: C.texto }))
        ),
      })],
    })],
  });
}

// Tabla label-valor de 2 columnas (Bloques 1 y 5)
function labelTable(rows) {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [C1, C2],
    rows: rows.map(([label, value]) => new TableRow({
      children: [
        new TableCell({
          width: { size: C1, type: WidthType.DXA },
          borders: allBdr(),
          shading: { fill: C.parchment, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [p(t(label, { size: 18, color: C.texSec }))],
        }),
        new TableCell({
          width: { size: C2, type: WidthType.DXA },
          borders: allBdr(),
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [p(t(value, { size: 18 }))],
        }),
      ],
    })),
  });
}

// Tabla de criterios 3 columnas (Bloque 3)
function criteriaTable(rows) {
  const CA = 4400, CB = 1200, CC = CW - CA - CB; // 3426
  const hdrCell = (text, w) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: allBdr(C.azMedio),
    shading: { fill: C.azul, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      children: [b(text, { size: 18, color: C.blanco })],
      alignment: w === CB ? AlignmentType.CENTER : AlignmentType.LEFT,
    })],
  });
  const hdr = new TableRow({
    children: [
      hdrCell("Criterio", CA),
      hdrCell("Puntuación 1–4", CB),
      hdrCell("Nota breve", CC),
    ],
  });
  const body = rows.map(([crit, punt, nota]) => new TableRow({
    children: [
      new TableCell({
        width: { size: CA, type: WidthType.DXA }, borders: allBdr(),
        shading: { fill: C.parchment, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [p(t(crit, { size: 18, color: C.texSec }))],
      }),
      new TableCell({
        width: { size: CB, type: WidthType.DXA }, borders: allBdr(),
        margins: { top: 80, bottom: 80, left: 60, right: 60 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          children: [t(punt, { size: 20, bold: punt !== "__", color: punt !== "__" ? C.verde : C.borde })],
          alignment: AlignmentType.CENTER,
        })],
      }),
      new TableCell({
        width: { size: CC, type: WidthType.DXA }, borders: allBdr(),
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [p(t(nota, { size: 18 }))],
      }),
    ],
  }));
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CA, CB, CC],
    rows: [hdr, ...body],
  });
}

// Tabla de 2 col para Bloque 4 (celda derecha acepta array)
function bloque4Table(rows) {
  const CQ = 3600, CA2 = CW - CQ; // 5426
  const hdr = new TableRow({
    children: [
      new TableCell({
        width: { size: CQ, type: WidthType.DXA },
        borders: allBdr(C.azMedio), shading: { fill: C.azul, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [p(b("Pregunta", { size: 18, color: C.blanco }))],
      }),
      new TableCell({
        width: { size: CA2, type: WidthType.DXA },
        borders: allBdr(C.azMedio), shading: { fill: C.azul, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [p(b("Respuesta", { size: 18, color: C.blanco }))],
      }),
    ],
  });
  const body = rows.map(([pregunta, resp]) => {
    const respLines = Array.isArray(resp) ? resp : [resp];
    return new TableRow({
      children: [
        new TableCell({
          width: { size: CQ, type: WidthType.DXA }, borders: allBdr(),
          shading: { fill: C.parchment, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [p(t(pregunta, { size: 18, color: C.texSec }))],
        }),
        new TableCell({
          width: { size: CA2, type: WidthType.DXA }, borders: allBdr(),
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: respLines.map(line =>
            p(t(line, { size: 18 }))
          ),
        }),
      ],
    });
  });
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CQ, CA2],
    rows: [hdr, ...body],
  });
}

// ── CONTENIDO DEL DOCUMENTO ───────────────────────────────────────────────────

// Intro común (3 callouts)
const intro = [
  ...callout(["Qué es esta plantilla: lo que el alumno sale con la mano al cerrar B1. Cinco bloques que capturan el proceso elegido en el PBL, la colisión de reglas que lo justifica como candidato, y la información mínima para llevar a B2."]),
  gap(40, 40),
  ...callout(["Cómo se usa: cada alumno (o subgrupo) rellena su propia ficha. El grupo entrega una sola ficha consolidada al instructor, la del proceso elegido por consenso. Las demás se conservan como notas personales."]),
  gap(40, 40),
  ...callout(["Cómo evoluciona: esta ficha es la primera página del Documento de Diseño Funcional que se construye a lo largo de B2–B6. En B2 se añade el Diagrama IO/RE, en B4 el System Prompt, en B5 la Evaluación Make vs Buy, en B6 el Protocolo de Supervisión."]),
];

// ── VERSIÓN 1: PLANTILLA EN BLANCO ───────────────────────────────────────────
const v1 = [
  ...versionDivider("VERSIÓN 1 · PLANTILLA EN BLANCO"),
  p(t("Imprimir en A4 a una sola cara · usa la página siguiente si necesitas más espacio en cualquier bloque.", { size: 17, color: C.texSec, italics: true })),

  // BLOQUE 1
  ...blockHdr("Bloque 1 · Identificación del proceso"),
  gap(0, 80),
  labelTable([
    ["Proceso candidato", ""],
    ["Departamento o área en APM", ""],
    ["Frecuencia aproximada (veces/día · semana · mes)", ""],
    ["Quién en el equipo conoce mejor este proceso", ""],
    ["Quién toma hoy la decisión cuando hay duda", ""],
  ]),

  // BLOQUE 2
  ...blockHdr("Bloque 2 · La colisión (criterio clave del mapa)"),
  gap(0, 80),
  ...callout(["Sin colisión real entre reglas, no hay candidato a agente. Si esta sección no tiene una respuesta nítida, conviene reconsiderar el proceso elegido antes de avanzar a B2."]),
  gap(0, 60),
  subLabel("Regla A en juego (escrita literal o reformulada del procedimiento existente):"),
  textBoxBlank(2),
  subLabel("Regla B en juego (la que entra en tensión con A):"),
  textBoxBlank(2),
  subLabel("Cuándo colisionan (un ejemplo concreto de una situación en la que has visto a alguien dudar):"),
  textBoxBlank(3),
  subLabel("Cómo se resuelve hoy (humano + criterio · improvisación · escalado · otro):"),
  textBoxBlank(2),

  // BLOQUE 3
  ...blockHdr("Bloque 3 · Cribado por los tres criterios cuantitativos"),
  gap(0, 80),
  ...callout(["Recogido del mapa M2. Si el coste del error está en nivel 1 (seguridad de personas · carga peligrosa · información regulada), el proceso no es candidato aunque los otros criterios den bien."]),
  gap(0, 80),
  criteriaTable([
    ["Reglas definibles",                    "__", ""],
    ["Frecuencia / volumen",                 "__", ""],
    ["Coste del error manejable o escalable","__", ""],
  ]),
  gap(0, 80),
  p([
    b("Total cuantitativo (suma 3–12): ", { size: 18 }),
    t("_____    ", { size: 18, color: C.borde }),
    t("(Cualitativo del criterio 4 —la colisión— ya está en el bloque 2.)", { size: 16, color: C.texSec, italics: true }),
  ]),

  // BLOQUE 4
  ...blockHdr("Bloque 4 · Lo que llevamos a B2"),
  gap(0, 80),
  bloque4Table([
    [
      "¿Qué documentación técnica existe sobre este proceso? (manuales, GMAO, fichas)",
      [""],
    ],
    [
      "¿Hay un ejemplo reciente de incidencia que podamos usar como caso base?",
      [""],
    ],
    [
      "¿Qué tres preguntas abiertas tengo sobre este proceso al volver a B2?",
      ["1. ___________________________________________",
       "2. ___________________________________________",
       "3. ___________________________________________"],
    ],
  ]),

  // BLOQUE 5
  ...blockHdr("Bloque 5 · Firma y trazabilidad"),
  gap(0, 80),
  labelTable([
    ["Nombre del responsable de la ficha", ""],
    ["Fecha · sesión",                     "B1 · 2026-05-19"],
    ["Sub-grupo (si aplica)",              ""],
    ["Versión de la ficha",               "1.0 · B1"],
  ]),

  new Paragraph({ children: [], pageBreakBefore: true }),
];

// ── VERSIÓN 2: EJEMPLO TRABAJADO RTG ─────────────────────────────────────────
const v2 = [
  ...versionDivider(
    "VERSIÓN 2 · EJEMPLO TRABAJADO · CASO RTG",
    "(referencia · entregar solo al cierre del PBL)"
  ),

  // BLOQUE 1
  ...blockHdr("Bloque 1 · Identificación del proceso"),
  gap(0, 80),
  labelTable([
    ["Proceso candidato",                                    "Triaje y respuesta a averías en grúa RTG"],
    ["Departamento o área en APM",                           "Operaciones de muelle + Mantenimiento equipo"],
    ["Frecuencia aproximada (veces/día · semana · mes)",     "~10–15 incidencias / semana · 1–2 por turno"],
    ["Quién en el equipo conoce mejor este proceso",         "Supervisor de mantenimiento + jefe de turno"],
    ["Quién toma hoy la decisión cuando hay duda",           "Jefe de turno tras consulta verbal al supervisor"],
  ]),

  // BLOQUE 2
  ...blockHdr("Bloque 2 · La colisión"),
  gap(0, 80),
  subLabel("Regla A en juego:"),
  textBoxFilled(["Toda avería en equipo crítico se registra en GMAO antes de cualquier intervención, con foto, lectura del PLC y descripción del síntoma. Sin registro no hay intervención."]),
  subLabel("Regla B en juego:"),
  textBoxFilled(["Toda interrupción operativa de más de 15 minutos en bloque con buque atracado activa intervención inmediata para liberar la zona. La ventana de atraque es prioritaria sobre cualquier otro protocolo."]),
  subLabel("Cuándo colisionan:"),
  textBoxFilled(["Cuando el GMAO está caído (mantenimiento programado o error 503) y hay buque atracado esperando. Pasó tres veces el último trimestre. La Regla A obliga a registrar y la Regla B obliga a actuar; no se pueden cumplir las dos."]),
  subLabel("Cómo se resuelve hoy:"),
  textBoxFilled(["Consulta verbal al supervisor de turno. El supervisor autoriza saltarse el registro previo. La nota de cierre se documenta a posteriori. No hay procedimiento escrito para esta excepción."]),

  // BLOQUE 3
  ...blockHdr("Bloque 3 · Cribado por los tres criterios cuantitativos"),
  gap(0, 80),
  criteriaTable([
    ["Reglas definibles",                    "3", "Procedimiento escrito, pero la regla del 15 min está en otro documento"],
    ["Frecuencia / volumen",                 "3", "Varias decisiones por turno entre todas las grúas"],
    ["Coste del error manejable o escalable","3", "Impacto operativo (retraso buque) · no afecta a seguridad de personas"],
  ]),
  gap(0, 80),
  p([
    b("Total cuantitativo: ", { size: 18 }),
    t("9 / 12", { size: 18, bold: true, color: C.verde }),
    t("   ·   colisión nítida en el bloque 2.", { size: 18, color: C.texSec }),
  ]),

  // BLOQUE 4
  ...blockHdr("Bloque 4 · Lo que llevamos a B2"),
  gap(0, 80),
  bloque4Table([
    [
      "¿Qué documentación técnica existe sobre este proceso?",
      ["Procedimiento PMA-001 (mantenimiento) · Protocolo de muelle PMU-007 · Manual técnico RTG (genérico del fabricante)"],
    ],
    [
      "¿Hay un ejemplo reciente de incidencia que podamos usar como caso base?",
      ["Sí — incidencia del 2026-04-12 documentada en GMAO una vez restablecido el sistema. Adjuntar."],
    ],
    [
      "¿Qué tres preguntas abiertas tengo?",
      [
        "1. ¿Quién decide oficialmente cuando la Regla A y la Regla B chocan?",
        "2. ¿Existe la excepción documentada o solo se da verbalmente?",
        "3. ¿Cómo audita calidad estas excepciones a posteriori?",
      ],
    ],
  ]),

  // BLOQUE 5
  ...blockHdr("Bloque 5 · Firma y trazabilidad"),
  gap(0, 80),
  labelTable([
    ["Nombre del responsable de la ficha", "Ejemplo · sin firma"],
    ["Fecha · sesión",                     "B1 · 2026-05-19"],
    ["Sub-grupo (si aplica)",              "Ejemplo de referencia"],
    ["Versión de la ficha",               "1.0 · B1"],
  ]),

  new Paragraph({ children: [], pageBreakBefore: true }),
];

// ── NOTAS PARA EL INSTRUCTOR ──────────────────────────────────────────────────
const notes = [
  ...versionDivider("NOTAS PARA EL INSTRUCTOR"),
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [
      b("No entregar la versión 2 al inicio del PBL. ", { size: 19 }),
      t("Reparte solo la plantilla en blanco al arrancar el bloque PBL. La versión trabajada se entrega al cierre, junto con la decisión grupal de qué proceso se lleva a B2.", { size: 19 }),
    ],
    spacing: { before: 80, after: 80 },
  }),
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [
      b("La ficha que se entrega al instructor es la del grupo, ", { size: 19 }),
      t("la del proceso consensuado. Las fichas individuales se las queda cada alumno como nota personal.", { size: 19 }),
    ],
    spacing: { before: 80, after: 80 },
  }),
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [
      b("En B2 esta ficha se digitaliza ", { size: 19 }),
      t("y se transforma en la primera sección del Documento de Diseño Funcional. Los alumnos no rellenan en papel a partir de B2: pasan a Copilot Pages.", { size: 19 }),
    ],
    spacing: { before: 80, after: 80 },
  }),
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [
      b("Si ningún proceso pasa el bloque 2 (no hay colisión real), ", { size: 19 }),
      t("el grupo debe buscar otro candidato. El criterio es estricto: sin colisión, no hay candidato.", { size: 19 }),
    ],
    spacing: { before: 80, after: 80 },
  }),
];

// ── DOCUMENTO ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 560, hanging: 280 } } },
      }],
    }],
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
            new TextRun({ text: "APM TERMINALS · CURSO 2026 · SESIÓN B1", font: "Courier New", size: 16, color: C.narOsc, bold: true }),
            new TextRun({ text: "\t", size: 16 }),
            new TextRun({ text: "Plantilla de Candidatura a Agente · M4", font: "Arial", size: 16, color: C.texSec }),
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
            new TextRun({ text: "APM Terminals · Curso 2026 · B1 · M4 Plantilla candidatura · v1.0", font: "Arial", size: 16, color: C.texSec }),
            new TextRun({ text: "\t", size: 16 }),
            new TextRun({ text: "Página ", font: "Arial", size: 16, color: C.texSec }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: C.texSec }),
          ],
          border: { top: { style: BorderStyle.SINGLE, size: 8, color: C.azul, space: 6 } },
          tabStops: [{ type: TabStopType.RIGHT, position: CW }],
        })],
      }),
    },
    children: [
      // ── CABECERA DEL DOCUMENTO ──────────────────────────────────────
      new Paragraph({
        children: [mono("APM TERMINALS · CURSO 2026 · SESIÓN B1")],
        spacing: { before: 0, after: 40 },
      }),
      new Paragraph({
        children: [b("Plantilla de Candidatura a Agente", { size: 44, color: C.azul })],
        spacing: { before: 0, after: 40 },
        border: { bottom: { style: BorderStyle.THICK, size: 16, color: C.narOsc, space: 6 } },
      }),
      new Paragraph({
        children: [t("M4 · B1 Concepto Agente · Primera página del Documento de Diseño Funcional", { size: 18, color: C.texSec, italics: true })],
        spacing: { before: 80, after: 160 },
      }),

      // ── INTRO ───────────────────────────────────────────────────────
      ...intro,

      // ── VERSIÓN 1 ───────────────────────────────────────────────────
      ...v1,

      // ── VERSIÓN 2 ───────────────────────────────────────────────────
      ...v2,

      // ── NOTAS ───────────────────────────────────────────────────────
      ...notes,
    ],
  }],
});

// ── SALIDA ────────────────────────────────────────────────────────────────────
const OUT = "CONTENT/PARTE2-Materiales/B1-Concepto_Agente/M4_plantilla-candidatura_B1.docx";

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log("OK " + OUT);
}).catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
