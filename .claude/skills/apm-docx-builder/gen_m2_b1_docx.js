"use strict";
// gen_m2_b1_docx.js — Genera M2_mapa-candidatos_B1.docx
// Importa utilidades compartidas de docx-apm-utils.js

const path = require("path");
const fs   = require("fs");
const u    = require("./docx-apm-utils");
const {
  C, CW, Packer,
  Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  LevelFormat,
  t, b, mono, p, gap,
  blockHdr, versionDivider, callout, alertCallout,
  subLabel, labelTable, rubricTable, twoColTable, makeDoc,
  allBdr, bdr, noBdr,
} = u;

// ── CONSTANTES ────────────────────────────────────────────────────────────────
const CHIP    = "APM TERMINALS · CURSO 2026 · SESIÓN B1";
const TITLE   = "Mapa de Candidatos a Agente";
const SUB     = "M2 · B1 Concepto Agente · PBL — Últimos 35 min de la sesión";
const FOOTER  = "APM Terminals · Curso 2026 · B1 · M2 Mapa de candidatos · v1.0";

const OUT = "CONTENT/PARTE2-Materiales/B1-Concepto_Agente/M2_mapa-candidatos_B1.docx";

// ── TABLA DE TRABAJO (7 columnas) ────────────────────────────────────────────
// Anchos: # 300 | Proceso 1900 | C1 620 | C2 620 | C3 620 | C4 colisión 4426 | Marca 540 = 9026
const TW = { N: 300, PROC: 1900, C1: 620, C2: 620, C3: 620, COL4: 4426, MARCA: 540 };

// Cabecera de la tabla de trabajo
function workingTableHeader() {
  const hdr = (text, w, center = false) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: allBdr(C.azMedio),
    shading: { fill: C.azul, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    children: [new Paragraph({
      children: [b(text, { size: 16, color: C.blanco })],
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
    })],
  });
  return new TableRow({ children: [
    hdr("#",                                         TW.N,    true),
    hdr("Proceso candidato",                         TW.PROC),
    hdr("C1\nReglas",                               TW.C1,   true),
    hdr("C2\nVolumen",                              TW.C2,   true),
    hdr("C3\nError",                                TW.C3,   true),
    hdr("Criterio 4 · ¿Dónde colisionan las reglas hoy?", TW.COL4),
    hdr("Marca",                                     TW.MARCA, true),
  ]});
}

// Fila de ejemplo (fila 0, pre-rellena)
function workingTableExample() {
  const cell = (text, w, center = false, shade = null, size = 18) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: allBdr(),
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({
      children: [t(text, { size, italics: true, color: C.texSec })],
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
    })],
  });

  return new TableRow({ children: [
    cell("0",  TW.N,    true, C.parchment, 16),
    cell("Ejemplo — Avería en grúa RTG: decidir si registrar en GMAO o intervenir directamente", TW.PROC, false, C.parchment),
    cell("3",  TW.C1,   true, C.parchment, 18),
    cell("3",  TW.C2,   true, C.parchment, 18),
    cell("3",  TW.C3,   true, C.parchment, 18),
    cell('"Toda avería se registra en GMAO antes de intervenir" choca con "toda interrupción operativa > 15 min activa intervención inmediata". El humano lo resuelve por experiencia; con el GMAO caído hasta la regla de registro deja de aplicar. Es donde el operador duda y consulta al supervisor.', TW.COL4, false, C.parchment),
    cell("🔴", TW.MARCA, true, C.parchment, 20),
  ]});
}

// Fila en blanco (para rellenar)
function workingTableBlankRow(n) {
  const blankCell = (w, center = false) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: allBdr(),
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    children: [p(t(" "))],
  });
  return new TableRow({
    height: { value: 720, rule: "atLeast" },
    children: [
      new TableCell({
        width: { size: TW.N, type: WidthType.DXA },
        borders: allBdr(),
        shading: { fill: C.parchment, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 80, right: 80 },
        children: [new Paragraph({ children: [b(String(n), { size: 16, color: C.texSec })], alignment: AlignmentType.CENTER })],
      }),
      blankCell(TW.PROC),
      blankCell(TW.C1,   true),
      blankCell(TW.C2,   true),
      blankCell(TW.C3,   true),
      blankCell(TW.COL4),
      blankCell(TW.MARCA, true),
    ],
  });
}

function workingTable() {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [TW.N, TW.PROC, TW.C1, TW.C2, TW.C3, TW.COL4, TW.MARCA],
    rows: [
      workingTableHeader(),
      workingTableExample(),
      ...([1, 2, 3, 4, 5].map(workingTableBlankRow)),
    ],
  });
}

// ── TABLA DE TRAMPAS (2 columnas) ────────────────────────────────────────────
function trapsTable() {
  const W_TRAP = 3400, W_AVOID = CW - W_TRAP; // 5626
  const rows = [
    [
      "Elegir un proceso porque \"es el que más nos molesta\"",
      "Molestia ≠ colisión. Un proceso molesto sin colisión es un caso de RPA, no de agente.",
    ],
    [
      "Elegir un proceso enorme (\"toda la operativa del muelle\")",
      "Acotar a una decisión concreta dentro del proceso. El agente razona sobre una intervención, no sobre una operativa completa.",
    ],
    [
      "Elegir un proceso con coste de error nivel 1 (seguridad / aduanas / carga peligrosa)",
      "El curso no es el sitio para entrenarse en agentes regulados. Tomamos casos con error nivel 2 o superior.",
    ],
    [
      "Inventar la colisión para que encaje",
      "Si tienes que forzarla, no es candidato. Mejor descartar y buscar otro.",
    ],
    [
      "Confundir agente con chatbot",
      "Pregunta de filtro: \"¿hay decisiones de procedimiento que hoy toma una persona consultando documentación?\" Si no, es un chatbot informativo, no un agente.",
    ],
  ];

  const hdrRow = new TableRow({ children: [
    new TableCell({
      width: { size: W_TRAP, type: WidthType.DXA },
      borders: allBdr(C.azMedio),
      shading: { fill: C.azul, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [p(b("Trampa", { size: 18, color: C.blanco }))],
    }),
    new TableCell({
      width: { size: W_AVOID, type: WidthType.DXA },
      borders: allBdr(C.azMedio),
      shading: { fill: C.azul, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [p(b("Cómo evitarla", { size: 18, color: C.blanco }))],
    }),
  ]});

  const bodyRows = rows.map(([trap, avoid]) => new TableRow({ children: [
    new TableCell({
      width: { size: W_TRAP, type: WidthType.DXA },
      borders: allBdr(),
      shading: { fill: C.parchment, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [p(t(trap, { size: 17, color: C.texSec, italics: true }))],
    }),
    new TableCell({
      width: { size: W_AVOID, type: WidthType.DXA },
      borders: allBdr(),
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [p(t(avoid, { size: 17 }))],
    }),
  ]}));

  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [W_TRAP, W_AVOID],
    rows: [hdrRow, ...bodyRows],
  });
}

// ── CONTENIDO DEL DOCUMENTO ───────────────────────────────────────────────────
const children = [

  // § 1 · Para qué sirve esta ficha
  ...versionDivider("§ 1 · Para qué sirve esta ficha"),
  p(t("En la primera parte de la sesión has resuelto un caso concreto (la grúa RTG con el GMAO caído). Ahora vas a aplicar el mismo criterio a procesos reales de tu día a día en APM Terminals e identificar un buen candidato a agente documental de campo sobre el que trabajaremos las próximas cinco sesiones.", { size: 18 })),
  gap(80, 80),
  ...callout([
    "Esta ficha no se queda en B1. El proceso elegido aquí alimenta el Diagrama IO/RE (B2), el System Prompt (B4), la Evaluación Make vs Buy (B5) y el Protocolo de Supervisión (B6). Elegir bien aquí es elegir bien para todo el curso.",
  ]),

  // § 2 · Los cuatro criterios
  ...versionDivider("§ 2 · Los cuatro criterios"),
  p(t("Para que un proceso sea buen candidato a agente documental, los cuatro criterios deben dar respuesta razonable. No todos cuentan igual: el criterio 4 es el que decide.", { size: 18 })),
  gap(80, 0),

  // Criterio 1
  ...blockHdr("Criterio 1 · Reglas definibles"),
  gap(0, 80),
  ...callout(["Pregunta: ¿podrías escribir las reglas que aplica hoy el humano que lo resuelve?"]),
  gap(0, 80),
  rubricTable([
    ["Sí, en una página: hay procedimiento documentado y se sigue",                                               "4"],
    ["Sí, pero el procedimiento está repartido entre la cabeza del responsable, el manual y un mail antiguo",     "3"],
    ["Parcial: hay reglas, pero también \"depende del día\"",                                                     "2"],
    ["No: cada caso se resuelve por experiencia y olfato",                                                        "1"],
  ]),
  gap(0, 80),
  ...callout(["Ejemplo APM: procedimiento de reefer alarm (4) vs. priorización informal de incidencias del muelle (2)."]),

  // Criterio 2
  ...blockHdr("Criterio 2 · Frecuencia / volumen"),
  gap(0, 80),
  ...callout(["Pregunta: ¿cuántas veces al mes ocurre? Si el agente lo automatiza, ¿se nota?"]),
  gap(0, 80),
  rubricTable([
    ["Decenas / cientos al día — automatizarlo libera horas reales",                         "4"],
    ["Varias veces al día",                                                                   "3"],
    ["Algunas veces a la semana",                                                             "2"],
    ["Una vez al mes — automatizar cuesta más de lo que vale",                              "1"],
  ]),

  // Criterio 3
  ...blockHdr("Criterio 3 · Coste del error manejable o escalable"),
  gap(0, 80),
  ...callout(["Pregunta: si el agente se equivoca, ¿qué pasa? ¿se puede detectar y revertir antes de que cause daño?"]),
  gap(0, 80),
  rubricTable([
    ["Error reversible · hay validación humana fácil · sin impacto físico o de seguridad",                                          "4"],
    ["Error detectable en horas · impacto operativo limitado",                                                                       "3"],
    ["Error con impacto económico o reputacional notable · detección lenta",                                                         "2"],
    ["Error con impacto en seguridad de personas, integridad de carga peligrosa o de información regulada",                         "1"],
  ]),
  gap(0, 80),
  ...alertCallout(["Bandera roja: todo proceso con puntuación 1 en este criterio no es candidato, aunque los otros tres salgan altos."]),

  // Criterio 4
  ...blockHdr("Criterio 4 · Dónde colisionan las reglas hoy  (criterio clave · \"el lago de selenio\")"),
  gap(0, 80),
  ...callout(["Pregunta: ¿dónde el humano que hoy lo resuelve duda, porque hay dos reglas válidas y no hay jerarquía clara entre ellas?"]),
  gap(0, 80),
  p(t("Aquí no se puntúa de 1 a 4. Aquí se describe la colisión en una o dos frases. Si no hay colisión real, no hay candidato — automatizar un proceso ya resuelto no es valioso.", { size: 18 })),
  gap(0, 80),
  twoColTable(
    [5400, CW - 5400],
    ["Calidad de la colisión", "Marca"],
    [
      ["Colisión nítida: dos reglas explícitas, ambas válidas, en tensión visible",                                               "🔴"],
      ["Colisión presente pero ambigua: hay tensión, falta perfilar las reglas",                                                  "🟠"],
      ["Tensión percibida pero más \"falta de procedimiento\" que colisión genuina",                                              "🟡"],
      ["Sin colisión: el proceso es lineal — lo que hay es trabajo manual repetitivo (un RPA, no un agente)",                    "⚪"],
    ],
  ),
  gap(0, 80),
  ...callout(["Solo los procesos marcados 🔴 son candidatos fuertes a agente documental. Los 🟠 pueden afinarse. Los 🟡 y ⚪ se descartan en esta sesión."]),

  // § 3 · Cómo rellenar
  ...versionDivider("§ 3 · Cómo rellenar"),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [b("Individualmente · 5 min", { size: 19 }), t(" — escribe en silencio 3 procesos de tu día a día que crees que podrían ser candidatos.", { size: 19 })],
    spacing: { before: 80, after: 80 },
  }),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [b("Por parejas · 8 min", { size: 19 }), t(" — comparte con la persona de al lado. Apuntad uno o dos procesos donde ambos veáis colisión real (criterio 4 🔴 o 🟠).", { size: 19 })],
    spacing: { before: 80, after: 80 },
  }),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [b("Plenario · 15 min", { size: 19 }), t(" — el instructor recoge candidatos en pizarra. Para cada uno: ¿qué dos reglas chocan? ¿cuál es el \"lago de selenio\"?", { size: 19 })],
    spacing: { before: 80, after: 80 },
  }),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [b("Selección colectiva · 7 min", { size: 19 }), t(" — el grupo elige un único proceso para llevar a B2. El criterio: no el más fácil sino el que mejor permite ver la colisión y el razonamiento. Decisión por consenso simple; si hay empate, decide el instructor.", { size: 19 })],
    spacing: { before: 80, after: 80 },
  }),

  // § 4 · Tabla de trabajo
  ...versionDivider("§ 4 · Tabla de trabajo"),
  ...callout(["Una fila por candidato. La primera está rellena como ejemplo trabajado (es el caso que has visto en la primera parte de la sesión)."]),
  gap(0, 80),
  workingTable(),

  // § 5 · Selección final
  ...versionDivider("§ 5 · Selección final"),
  labelTable([
    ["Proceso elegido para B2 → B6", ""],
    ["Resumen de la colisión (una frase)", ""],
    ["Quién en la sala lo conoce mejor (rol / nombre)", ""],
  ]),
  gap(0, 80),
  p(t("Este es el proceso que llevamos a B2 para construir su Diagrama IO/RE.", { size: 18, color: C.texSec, italics: true })),

  // § 6 · Trampas conocidas
  ...versionDivider("§ 6 · Trampas conocidas"),
  trapsTable(),
];

// ── GENERAR ───────────────────────────────────────────────────────────────────
const doc = makeDoc({ chip: CHIP, title: TITLE, subtitle: SUB, footer: FOOTER, children });

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log("OK " + OUT);
}).catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
