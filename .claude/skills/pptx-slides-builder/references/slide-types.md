# Slide Types — Plantillas PptxGenJS

Cada sección muestra el patrón de código para un tipo de slide recurrente.
Usar como punto de partida; ajustar contenido y coordenadas según el guión.

Las constantes `C`, `F`, `H1_BOTTOM_DARK`, `H1_BOTTOM_LIGHT` y las funciones
`addFooter`, `addKicker`, `addH1`, `addAccentBar`, `addCard`, `addCallout`
están definidas en `scripts/build_from_guion.js` — no duplicarlas.

---

## TIPO: Portada (fondo azul)

```javascript
const s = pres.addSlide();
s.background = { color: C.azul };
addAccentBar(s);
addKicker(s, 'CONTEXTO · BADGE · PARTE N');  // narLum

// Título blanco (línea 1)
s.addText('Línea uno del título', {
  x: 0.55, y: 0.82, w: 8.9, h: 0.85,
  fontFace: F.syne, fontSize: 40, bold: true, color: C.blanco, wrap: true, valign: 'top',
});
// Título naranja (línea 2, opcional)
s.addText('Línea dos del título', {
  x: 0.55, y: 1.62, w: 8.9, h: 0.75,
  fontFace: F.syne, fontSize: 40, bold: true, color: C.narLum, wrap: true, valign: 'top',
});
// Subtítulo
s.addText('Descripción de la sesión · duración', {
  x: 0.55, y: 2.5, w: 8.9, h: 0.55,
  fontFace: F.sans, fontSize: 14, color: '9AB0C8', wrap: true,
});
// Chip de caso ancla
s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 3.15, w: 3.4, h: 0.32, fill: { color: '0D2E4A' }, line: { color: C.narLum, width: 0.5 } });
s.addText('CASO ANCLA · descripción corta', { x: 0.65, y: 3.19, w: 3.2, h: 0.24, fontFace: F.mono, fontSize: 9, color: C.narLum });
// Stats row (3 KPIs)
[{ val: 'X', label: 'stat1' }, { val: 'Yh', label: 'stat2' }, { val: 'Z', label: 'stat3' }].forEach((st, i) => {
  const x = 0.55 + i * 1.8;
  s.addText(st.val,   { x, y: 3.72, w: 1.6, h: 0.65, fontFace: F.syne, fontSize: 42, bold: true, color: C.narLum, align: 'center' });
  s.addText(st.label, { x, y: 4.35, w: 1.6, h: 0.22, fontFace: F.mono, fontSize: 10,  color: '9AB0C8', align: 'center' });
});
addFooter(s, n, true);
```

**content del guión:**
```json
{
  "chip": "VERBEX COMPOSITES · Caso ancla Parte 2",
  "stats": [
    { "val": "6",   "label": "sesiones" },
    { "val": "15h", "label": "lectivas" },
    { "val": "2",   "label": "MVPs"     }
  ]
}
```
Alternativa: `badges: ["BADGE A", "BADGE B"]` en lugar de `stats` (portada de módulo sin KPIs).

---

## TIPO: Slide de contenido / cards (fondo crema)

`contenido` y `contenido_cards` usan el mismo renderer.

```javascript
const s = pres.addSlide();
s.background = { color: C.crema };
addKicker(s, 'CONTEXTO · BLOQUE', true);  // narOsc
// P0 FIX: margin:0 + fit:"resize" — no cambiar estos parámetros
addH1(s, 'Título de la slide', true);  // ends at H1_BOTTOM_DARK = 1.82

let yNext = H1_BOTTOM_DARK;
if (slide.subtitulo) {
  s.addText(slide.subtitulo, { x: 0.55, y: yNext, w: 8.9, h: 0.32, fontFace: F.sans, fontSize: 13, color: C.textoSub, wrap: true });
  yNext += 0.35;
} else { yNext += 0.06; }

// Cards 2×2 (cols: 2, por defecto)
const cards = [
  { title: 'Card A', sub: 'subtítulo A', body: 'descripción A' },
  { title: 'Card B', sub: 'subtítulo B', body: 'descripción B' },
  { title: 'Card C', sub: 'subtítulo C', body: 'descripción C' },
  { title: 'Card D', sub: 'subtítulo D', body: 'descripción D' },
];
const cW = 4.45, cH = 1.4, gap = 4.65;
cards.forEach((card, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.55 + col * gap, y = yNext + row * (cH + 0.12);
  addCard(s, x, y, cW, cH);
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: cH, fill: { color: C.azul }, line: { color: C.azul, width: 0 } });
  s.addText(card.title, { x: x + 0.15, y: y + 0.1,  w: 4.2, h: 0.3,  fontFace: F.syne, fontSize: 16, bold: true, color: C.azul });
  s.addText(card.sub,   { x: x + 0.15, y: y + 0.38, w: 4.2, h: 0.2,  fontFace: F.mono, fontSize: 9,  color: C.narOsc });
  s.addText(card.body,  { x: x + 0.15, y: y + 0.62, w: 4.2, h: 0.68, fontFace: F.sans, fontSize: 12, color: C.textoSub, wrap: true });
});
addFooter(s, n, false);
```

**content del guión (2×2):**
```json
{
  "cards_2x2": [
    { "title": "IO/RE",  "sub": "Inputs · Outputs · Reglas · Excepciones", "body": "Plantilla entregada en I2." },
    { "title": "PRDA",   "sub": "Percibir → Razonar → Decidir → Actuar",   "body": "Ciclo agéntico de Parte 2." },
    { "title": "E5",     "sub": "El LLM no calcula ni decide",              "body": "Es arquitectura obligatoria." },
    { "title": "n8n",    "sub": "Herramienta dominante desde I4",           "body": "n8n + Claude API." }
  ]
}
```

**Variantes Cat-C:**
- `cols: 3` → grid 3×1 con cards más estrechas (cW=2.9)
- `code_block: { lang: "js", code: "..." }` → bloque de código dark bg debajo de las cards
- `callouts: ["Texto A", "Texto B"]` → callouts naranjas apilados al final

---

## TIPO: Flujo horizontal (fondo crema)

```javascript
const s = pres.addSlide();
s.background = { color: C.crema };
addKicker(s, 'PIPELINE · BLOQUE', true);
addH1(s, 'Título del flujo', true);  // ends at 1.82

const nodos = [
  { nombre: 'Nodo 1\nsubnombre', tipo: 'Tipo/Tool', color: 'inputs'  },
  { nombre: 'Nodo 2\nsubnombre', tipo: 'Tipo/Tool', color: 'reglas'  },
  { nombre: 'Nodo 3\nsubnombre', tipo: 'Tipo/Tool', color: 'outputs' },
  { nombre: 'Nodo 4\nsubnombre', tipo: 'Tipo/Tool', color: 'outputs' },
];
const kpis = [
  { val: '4', label: 'canales',   color: 'narOsc' },
  { val: '0', label: 'hardcoded', color: 'outputs' },
  { val: '7', label: 'reglas JS', color: 'azul'   },
];

const nodoY = 1.9, nodoH = 1.3, arrowW = 0.28;
const nodoW = (8.9 - (nodos.length - 1) * arrowW) / nodos.length;
nodos.forEach((nodo, i) => {
  const x = 0.55 + i * (nodoW + arrowW);
  const color = resolveColor(nodo.color), bg = resolveBg(nodo.color);
  s.addShape(pres.shapes.RECTANGLE, { x, y: nodoY, w: nodoW, h: nodoH, fill: { color: bg }, line: { color, width: 1 } });
  s.addText(nodo.nombre, { x, y: nodoY + 0.14, w: nodoW, h: 0.6, fontFace: F.syne, fontSize: 12, bold: true, color, align: 'center', wrap: true, valign: 'top' });
  s.addText(nodo.tipo,   { x, y: nodoY + 0.82, w: nodoW, h: 0.28, fontFace: F.mono, fontSize: 7.5, color: C.textoSub, align: 'center' });
  if (i < nodos.length - 1) {
    const ax = x + nodoW;
    s.addShape(pres.shapes.LINE, { x: ax, y: nodoY + nodoH / 2, w: arrowW, h: 0, line: { color: C.narOsc, width: 1.5 } });
    s.addText('▶', { x: ax + arrowW - 0.2, y: nodoY + nodoH / 2 - 0.13, w: 0.2, h: 0.22, fontFace: F.sans, fontSize: 10, color: C.narOsc });
  }
});
let yNext = nodoY + nodoH + 0.12;
// KPI cards
const kW = (8.9 - (kpis.length - 1) * 0.1) / kpis.length;
kpis.forEach((kpi, i) => {
  const x = 0.55 + i * (kW + 0.1);
  addCard(s, x, yNext, kW, 0.7);
  s.addText(kpi.val,   { x, y: yNext + 0.04, w: kW, h: 0.38, fontFace: F.syne, fontSize: 26, bold: true, color: resolveColor(kpi.color || 'narOsc'), align: 'center' });
  s.addText(kpi.label, { x, y: yNext + 0.42, w: kW, h: 0.24, fontFace: F.sans, fontSize: 9,  color: C.textoSub, align: 'center', wrap: true });
});
yNext += 0.78;
addCallout(s, 'Texto del callout', 0.55, yNext, 8.9, 0.44);
addFooter(s, n, false);
```

**content del guión:**
```json
{
  "nodos": [
    { "nombre": "Recepción\nEmail/API", "tipo": "Trigger / n8n", "color": "inputs"  },
    { "nombre": "Normalización\nClaude",  "tipo": "LLM Node",      "color": "reglas"  },
    { "nombre": "Validación\nR01–R09",   "tipo": "JS Function",    "color": "outputs" },
    { "nombre": "Emisión\nJSON",         "tipo": "HTTP Request",   "color": "outputs" }
  ],
  "kpis": [
    { "val": "4",  "label": "canales entrada", "color": "narOsc"  },
    { "val": "0",  "label": "reglas hardcoded", "color": "outputs" },
    { "val": "7",  "label": "reglas JS",        "color": "azul"    }
  ],
  "callout": "El LLM no decide — extrae. Las reglas JS deciden."
}
```

Colores válidos para `color` en nodos/kpis: `inputs`, `outputs`, `reglas`,
`excepc`, `azul`, `narOsc`, `narLum` (o cualquier HEX de 6 dígitos).

---

## TIPO: IO/RE — contrato de sesión (fondo crema)

Grid 2×2 con los cuatro cuadrantes: INPUTS, OUTPUTS, REGLAS, EXCEPCIONES.

```javascript
const s = pres.addSlide();
s.background = { color: C.crema };
addKicker(s, 'IO/RE · CONTRATO', true);
addH1(s, 'Contrato II1 — Ingesta Canal', true);

const bW = 4.4, bH = 1.6, gap = 0.1, startY = 1.88;
const blocks = [
  { label: 'Inputs',      items: ['item 1', 'item 2'], color: C.inputs,  bg: C.inputsBg  },
  { label: 'Outputs',     items: ['item 1', 'item 2'], color: C.outputs, bg: C.outputsBg },
  { label: 'Reglas',      items: ['R01: ...',  'R02: ...'], color: C.reglas,  bg: C.reglasBg  },
  { label: 'Excepciones', items: ['EX01: ...'],             color: C.excepc,  bg: C.excepcBg  },
];
blocks.forEach((block, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.55 + col * (bW + gap);
  const y = startY + row * (bH + gap);
  addIoreBlock(s, x, y, bW, bH, block.label, block.items, block.color, block.bg);
});
addFooter(s, n, false);
```

**content del guión:**
```json
{
  "inputs":      ["Email crudo (MIME)", "Webhook JSON", "PDF adjunto"],
  "outputs":     ["canal: email|api|pdf", "payload_normalizado: {...}", "confianza: 0–1"],
  "reglas":      ["R01: Si canal=email → extraer From/Subject/Body", "R02: Si confianza < 0.7 → flag revisión"],
  "excepciones": ["EX01: Adjunto > 5MB → rechazar", "EX02: Idioma no ES/EN → escalar"]
}
```

Cada cuadrante muestra hasta 6 ítems (el renderer hace `.slice(0, 6)`).

---

## TIPO: Divider — separador de bloque (fondo azul)

```javascript
const s = pres.addSlide();
s.background = { color: C.azul };
addAccentBar(s);
s.addText('BLOQUE PRÁCTICO · PARTE 2', {
  x: 0.55, y: 0.55, w: 8.9, h: 0.22,
  fontFace: F.mono, fontSize: 9, color: C.narLum, charSpacing: 2.5,
});
s.addText('Título grande\ncon salto si procede', {
  x: 0.55, y: 1.05, w: 8.9, h: 2.3,
  fontFace: F.syne, fontSize: 48, bold: true, color: C.blanco,
  wrap: true, valign: 'top',
});
s.addText('Subtítulo descriptivo del bloque.', {
  x: 0.55, y: 3.5, w: 8.9, h: 0.85,
  fontFace: F.sans, fontSize: 14, color: '9AB0C8', wrap: true,
});
addFooter(s, n, true);
```

**Guión mínimo:**
```json
{
  "type": "divider",
  "kicker": "BLOQUE PRÁCTICO · PARTE 2",
  "h1": "Construimos\nel agente II1",
  "subtitulo": "45 minutos · n8n + Claude API"
}
```

El `h1` soporta `\n` explícito para controlar el salto de línea en 48pt.

---

## TIPO: Gate — cierre de sesión con criterio de éxito (fondo crema)

```javascript
const s = pres.addSlide();
s.background = { color: C.crema };
addKicker(s, 'GATE F1 · CIERRE II1', true);
addH1(s, '¿Podemos pasar a II2?', true);  // ends at 1.82

// Gate card (fondo verde claro, borde verde)
s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 1.88, w: 8.9, h: 0.72, fill: { color: C.outputsBg }, line: { color: C.outputs, width: 1 } });
s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 1.88, w: 0.06, h: 0.72, fill: { color: C.outputs }, line: { color: C.outputs, width: 0 } });
const tagW = 1.1;
s.addShape(pres.shapes.RECTANGLE, { x: 0.68, y: 1.92, w: tagW, h: 0.2, fill: { color: C.outputsBg }, line: { color: C.outputs, width: 0.5 } });
s.addText('Gate F1 ✓', { x: 0.68, y: 1.93, w: tagW, h: 0.18, fontFace: F.mono, fontSize: 8, bold: true, color: C.outputs, align: 'center' });
s.addText('El pipeline normaliza correctamente el 100% de los casos de prueba.', {
  x: 0.72, y: 2.15, w: 8.22, h: 0.42, fontFace: F.sans, fontSize: 10.5, color: C.texto, wrap: true,
});

// Columna izquierda — fuera de scope
const colY = 2.7, colH = 2.5, colW = 4.33;
addCard(s, 0.55, colY, colW, colH);
s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: colY, w: 0.06, h: colH, fill: { color: C.excepc }, line: { color: C.excepc, width: 0 } });
s.addText('❌  Fuera de scope', { x: 0.7, y: colY + 0.1, w: colW - 0.2, h: 0.24, fontFace: F.mono, fontSize: 8.5, bold: true, color: C.excepc });
['Clasificación multilingüe', 'Validación de adjuntos > 5MB'].forEach((item, i) => {
  s.addText('→  ' + item, { x: 0.7, y: colY + 0.4 + i * 0.34, w: colW - 0.2, h: 0.3, fontFace: F.sans, fontSize: 10.5, color: C.textoSub, wrap: true });
});

// Columna derecha — siguiente sesión
addCard(s, 5.22, colY, colW, colH);
s.addShape(pres.shapes.RECTANGLE, { x: 5.22, y: colY, w: 0.06, h: colH, fill: { color: C.azul }, line: { color: C.azul, width: 0 } });
s.addText('→  II2 Clasificación PRDA', { x: 5.36, y: colY + 0.1, w: colW - 0.2, h: 0.24, fontFace: F.mono, fontSize: 8.5, bold: true, color: C.azul });
['Reglas de priorización R10–R15', 'Routing automático', 'Test de regresión full'].forEach((item, i) => {
  s.addText('·  ' + item, { x: 5.36, y: colY + 0.4 + i * 0.34, w: colW - 0.2, h: 0.3, fontFace: F.sans, fontSize: 10.5, color: C.textoSub, wrap: true });
});
// Idea fuerza (banner azul al fondo de la columna derecha)
const ifY = colY + colH - 0.36;
s.addShape(pres.shapes.RECTANGLE, { x: 5.24, y: ifY, w: colW - 0.04, h: 0.28, fill: { color: C.inputsBg }, line: { color: C.azul, width: 0.5 } });
s.addText('En II2 añadimos razonamiento encima de lo que II1 ya extrae.', {
  x: 5.32, y: ifY + 0.02, w: colW - 0.2, h: 0.24, fontFace: F.mono, fontSize: 7.5, color: C.azul, wrap: true,
});
addFooter(s, n, false);
```

**content del guión:**
```json
{
  "gate": {
    "label": "Gate F1 ✓",
    "descripcion": "El pipeline normaliza correctamente el 100% de los casos de prueba."
  },
  "fuera_scope": ["Clasificación multilingüe", "Validación de adjuntos > 5MB"],
  "siguiente": {
    "titulo": "II2 Clasificación PRDA",
    "items": ["Reglas de priorización R10–R15", "Routing automático", "Test de regresión full"],
    "idea_fuerza": "En II2 añadimos razonamiento encima de lo que II1 ya extrae."
  }
}
```

---

## TIPO: Slide de alto impacto (fondo crema)

```javascript
const s = pres.addSlide();
s.background = { color: C.crema };
addKicker(s, 'PRINCIPIO · CATEGORÍA', true);
addH1(s, 'La regla que no podéis romper', true);

// Banner azul con rich text (enunciado array)
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.55, y: H1_BOTTOM_DARK, w: 8.9, h: 1.0,
  fill: { color: C.azul }, line: { color: C.azul, width: 0 },
});
const partes = [
  { texto: 'El LLM ',    enfasis: false },
  { texto: 'extrae',     enfasis: true  },
  { texto: '.  Las reglas ', enfasis: false },
  { texto: 'calculan',   enfasis: true  },
  { texto: '.',          enfasis: false },
];
s.addText(partes.map(p => ({
  text: p.texto,
  options: { color: p.enfasis ? C.narLum : C.blanco, fontFace: F.syne, fontSize: 28, bold: true },
})), { x: 0.55, y: H1_BOTTOM_DARK + 0.16, w: 8.9, h: 0.68, align: 'center' });

// Columnas ❌ / ✅
const colY = H1_BOTTOM_DARK + 1.1;
const colH = 5.2 - colY;
// Izquierda antipatrón
s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: colY, w: 4.22, h: colH, fill: { color: C.excepcBg }, line: { color: C.excepc, width: 1 } });
s.addText('❌  ANTIPATRÓN', { x: 0.75, y: colY + 0.1, w: 3.8, h: 0.28, fontFace: F.mono, fontSize: 9, bold: true, color: C.excepc });
['LLM decide prioridad', 'LLM valida catálogo', 'LLM calcula fechas'].forEach((t, i) => {
  s.addText('→  ' + t, { x: 0.75, y: colY + 0.44 + i * 0.4, w: 3.8, h: 0.36, fontFace: F.sans, fontSize: 12, color: C.excepc, wrap: true });
});
// Derecha patrón correcto
s.addShape(pres.shapes.RECTANGLE, { x: 5.23, y: colY, w: 4.22, h: colH, fill: { color: C.outputsBg }, line: { color: C.outputs, width: 1 } });
s.addText('✅  PATRÓN E5', { x: 5.43, y: colY + 0.1, w: 3.8, h: 0.28, fontFace: F.mono, fontSize: 9, bold: true, color: C.outputs });
['LLM extrae del texto libre', 'R01–R09 JS determinista deciden', 'Parser anti-alucinación valida'].forEach((t, i) => {
  s.addText('→  ' + t, { x: 5.43, y: colY + 0.44 + i * 0.4, w: 3.8, h: 0.36, fontFace: F.sans, fontSize: 12, color: C.outputs, wrap: true });
});
addFooter(s, n, false);
```

**content del guión:**
```json
{
  "enunciado": [
    { "texto": "El LLM ",          "enfasis": false },
    { "texto": "extrae",           "enfasis": true  },
    { "texto": ".  Las reglas ",   "enfasis": false },
    { "texto": "calculan",         "enfasis": true  },
    { "texto": ".",                "enfasis": false }
  ],
  "columna_negativa": {
    "titulo": "❌  ANTIPATRÓN",
    "items":  ["LLM decide prioridad", "LLM valida catálogo", "LLM calcula fechas"]
  },
  "columna_positiva": {
    "titulo": "✅  PATRÓN E5",
    "items":  ["LLM extrae del texto libre", "R01–R09 JS determinista deciden", "Parser anti-alucinación valida"]
  }
}
```

---

## TIPO: Diagrama de nodos secuenciales (arco de sesiones)

```javascript
const s = pres.addSlide();
s.background = { color: C.azul };
addAccentBar(s);
addKicker(s, 'ROADMAP · PARTE 2');
addH1(s, 'Seis sesiones · un agente completo', false);  // false = fondo oscuro → texto blanco

const sessions = [
  { id: 'II1', prda: 'PERCIBIR', title: 'Ingesta',   color: C.inputs  },
  { id: 'II2', prda: 'RAZONAR',  title: 'Reglas',    color: C.reglas  },
  { id: 'II3', prda: 'DECIDIR',  title: 'Routing',   color: C.outputs },
  { id: 'II4', prda: 'ACTUAR',   title: 'Emisión',   color: C.narLum  },
  { id: 'II5', prda: 'EVALUAR',  title: 'Métricas',  color: C.slate   },
  { id: 'II6', prda: 'ESCALAR',  title: 'Deploy',    color: C.excepc  },
];

sessions.forEach((sess, i) => {
  const x = 0.4 + i * 1.58;
  if (i < sessions.length - 1) {
    s.addShape(pres.shapes.LINE, { x: x + 1.28, y: 3.0, w: 0.3, h: 0, line: { color: C.narLum, width: 1.5 } });
  }
  s.addShape(pres.shapes.OVAL, { x: x + 0.04, y: 2.1, w: 1.2, h: 1.2, fill: { color: '0D2A45' }, line: { color: sess.color, width: 2 } });
  s.addText(sess.id,    { x: x + 0.04, y: 2.44, w: 1.2, h: 0.46, fontFace: F.syne, fontSize: 14, bold: true, color: sess.color, align: 'center' });
  s.addText(sess.prda,  { x: x - 0.04, y: 1.85, w: 1.38, h: 0.22, fontFace: F.mono, fontSize: 7.5, color: '9AB0C8', align: 'center', charSpacing: 1 });
  s.addText(sess.title, { x: x - 0.04, y: 3.4,  w: 1.38, h: 0.6,  fontFace: F.sans, fontSize: 10.5, color: C.blanco, align: 'center' });
});
addFooter(s, n, true);
```

---

## TIPO: Slide de cierre (fondo azul)

```javascript
const s = pres.addSlide();
s.background = { color: C.azul };
addAccentBar(s);
addKicker(s, 'CIERRE · PARTE 2');
s.addText('¿Se puede construir un agente industrial en 15 horas?', {
  x: 0.55, y: 1.0, w: 8.9, h: 1.4,
  fontFace: F.syne, fontSize: 30, bold: true, color: C.blanco, wrap: true,
});
// Respuesta banner
s.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 2.58, w: 8.9, h: 0.58, fill: { color: '0D2A45' }, line: { color: C.narLum, width: 0.5 } });
s.addText('En 6 sesiones:  Sí.', { x: 0.75, y: 2.7, w: 8.5, h: 0.34, fontFace: F.syne, fontSize: 18, color: '9AB0C8' });
// Condiciones
['Con las herramientas correctas', 'Con la arquitectura correcta', 'Con disciplina E5'].forEach((c, i) => {
  s.addText('→  ' + c, { x: 0.55, y: 3.38 + i * 0.42, w: 8.9, h: 0.36, fontFace: F.sans, fontSize: 14, color: '9AB0C8' });
});
addFooter(s, n, true);
```

**content del guión:**
```json
{
  "respuesta": "En 6 sesiones:  Sí.",
  "condiciones": ["Con las herramientas correctas", "Con la arquitectura correcta", "Con disciplina E5"]
}
```

---

## TIPO: Slide preview de próxima sesión (fondo azul)

```javascript
const s = pres.addSlide();
s.background = { color: C.azul };
addAccentBar(s);
addKicker(s, 'PRÓXIMA SESIÓN · II2');
s.addText('II2 — Clasificación y Routing PRDA', {
  x: 0.55, y: 0.75, w: 8.9, h: 0.72,
  fontFace: F.syne, fontSize: 36, bold: true, color: C.blanco,
});
// Pasos numerados
const pasos = [
  { num: '01', titulo: 'Reglas de priorización', detalle: 'R10–R15 — lógica determinista de clasificación' },
  { num: '02', titulo: 'Routing automático',     detalle: 'HTTP Request node a endpoint correcto según canal' },
  { num: '03', titulo: 'Test de regresión full', detalle: 'Validar II1 + II2 como sistema integrado' },
];
pasos.forEach((p, i) => {
  const y = 2.05 + i * 1.05;
  s.addShape(pres.shapes.OVAL, { x: 0.55, y, w: 0.62, h: 0.62, fill: { color: C.narLum }, line: { color: C.narLum, width: 0 } });
  s.addText(p.num,    { x: 0.55, y, w: 0.62, h: 0.62, fontFace: F.syne, fontSize: 16, bold: true, color: C.azul, align: 'center', valign: 'middle' });
  s.addText(p.titulo, { x: 1.32, y, w: 7.8, h: 0.3, fontFace: F.syne, fontSize: 15, bold: true, color: C.blanco });
  s.addText(p.detalle,{ x: 1.32, y: y + 0.3, w: 7.8, h: 0.32, fontFace: F.sans, fontSize: 12, color: '9AB0C8' });
});
addFooter(s, n, true);
```

**content del guión:**
```json
{
  "pasos": [
    { "num": "01", "titulo": "Reglas de priorización", "detalle": "R10–R15 — lógica determinista de clasificación" },
    { "num": "02", "titulo": "Routing automático",     "detalle": "HTTP Request node a endpoint correcto" },
    { "num": "03", "titulo": "Test de regresión full", "detalle": "Validar II1 + II2 como sistema integrado" }
  ],
  "footer_ref": "Materiales en aula virtual · sesión II2"
}
```
