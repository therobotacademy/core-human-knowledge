#!/usr/bin/env node
/**
 * build_html_from_guion.js — Genera un deck HTML 16:9 COIIAOC desde el MISMO
 * guión JSON que consume build_from_guion.js (assets/guion_schema.json).
 *
 * Uso:
 *   node build_html_from_guion.js <guion.json> [output_name]
 *   Salida: <OUTPUT_DIR>/<output_name>.html  (OUTPUT_DIR = PPTX_OUT_DIR || ../SAMPLE)
 *
 * El guión es la FUENTE ÚNICA: el mismo fichero produce PPTX (editable) con
 * build_from_guion.js y HTML (self-contained, navegable, imprimible) con este.
 *
 * Tipos: portada, portada_secundaria, contenido(_cards), flujo, tabla, iore,
 *        divider, gate, impacto, cierre, preview_sesion.
 *
 * Slide de referencia: 1280×720 px, escalado a viewport. Navegación ← →,
 * contador N/total, @media print (una slide por página A4 apaisada).
 */
const fs = require("fs");
const path = require("path");

const guionPath = process.argv[2];
if (!guionPath) {
  console.error("ERROR: se requiere ruta al guión JSON como primer argumento");
  process.exit(1);
}
const guion = JSON.parse(fs.readFileSync(guionPath, "utf8"));
const meta = guion.meta || {};
const outputName = process.argv[3] || meta.output_name || "output";
const OUTPUT_DIR = process.env.PPTX_OUT_DIR || path.join(__dirname, "..", "SAMPLE");
const OUTPUT_PATH = path.join(OUTPUT_DIR, `${outputName}.html`);

// ─── Tokens (paridad con build_from_guion.js / coiiaoc-tokens.md) ───────────
const C = {
  azul: "#1E3A5F", narLum: "#FF8C3B", narOsc: "#C2510A", crema: "#FAFAF7",
  blanco: "#FFFFFF", texto: "#1C1C1C", textoSub: "#6B6B6B", textoDim: "#9B9B9B",
  borde: "#E8E3D8", mute: "#9AB0C8",
  inputs: "#2E6B9E", inputsBg: "#EBF3FA", outputs: "#0D7C5A", outputsBg: "#E8F7F2",
  reglas: "#B45309", reglasBg: "#FDF3E3", excepc: "#B91C1C", excepcBg: "#FDECEA",
  slate: "#7898AA",
};
const TOTAL = guion.slides.length;

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function nl2br(s) { return esc(s).replace(/\n/g, "<br>"); }
function resolveColor(name) {
  const map = { inputs: C.inputs, outputs: C.outputs, reglas: C.reglas, excepc: C.excepc, azul: C.azul, narLum: C.narLum, narOsc: C.narOsc, slate: C.slate };
  return map[name] || (String(name).startsWith("#") ? name : "#" + name);
}
function resolveBg(name) {
  const map = { inputs: C.inputsBg, outputs: C.outputsBg, reglas: C.reglasBg, excepc: C.excepcBg };
  return map[name] || resolveColor(name);
}
const DARK_TYPES = new Set(["portada", "portada_secundaria", "divider", "cierre", "preview_sesion", "nodos"]);
function isDark(slide) {
  if (slide.fondo === "azul") return true;
  if (slide.fondo === "crema") return false;
  return DARK_TYPES.has(slide.type);
}

// ─── Footer (copyright solo slide 1 · contador siempre) ─────────────────────
function footer(n, dark) {
  const year = new Date().getFullYear();
  const cp = n === 1 ? `<div class="cp">© ${year} Bernardo Ronquillo Japón</div>` : "";
  return `${cp}<div class="counter">${n} / ${TOTAL}</div>`;
}
function kicker(text, dark) {
  if (!text) return "";
  return `<div class="kicker ${dark ? "k-dark" : "k-light"}">${esc(text)}</div>`;
}
function h1(text, dark) {
  return `<h1 class="${dark ? "h1-dark" : "h1-light"}">${nl2br(text)}</h1>`;
}

// ─── Renderers por tipo ─────────────────────────────────────────────────────
function rPortada(s, n) {
  const c = s.content || {};
  let chip = c.chip ? `<div class="chip">${esc(c.chip)}</div>` : "";
  let stats = "";
  if (c.stats) {
    stats = `<div class="stats">` + c.stats.map(st =>
      `<div class="stat"><div class="stat-val">${esc(st.val)}</div><div class="stat-lbl">${esc(st.label)}</div></div>`).join("") + `</div>`;
  } else if (c.badges) {
    stats = `<div class="badges">` + c.badges.map(b => `<span class="badge">${esc(b)}</span>`).join("") + `</div>`;
  }
  const h2 = s.h2_naranja ? `<div class="cover-h2">${esc(s.h2_naranja)}</div>` : "";
  const sub = s.subtitulo ? `<div class="cover-sub">${esc(s.subtitulo)}</div>` : "";
  return `<div class="accent-bar"></div>
    ${kicker(s.kicker, true)}
    <div class="cover-h1">${esc(s.h1_blanco || s.h1 || "")}</div>
    ${h2}${sub}${chip}${stats}`;
}

function rContenido(s, n) {
  const c = s.content || {};
  const cards = c.cards_2x2 || c.cards || [];
  const cols = c.cols || 2;
  const sub = s.subtitulo ? `<div class="sub">${esc(s.subtitulo)}</div>` : "";
  const cardsHtml = cards.length ? `<div class="cards cols-${cols}">` + cards.map(card => `
      <div class="card">
        <div class="card-title">${esc(card.title)}</div>
        ${card.sub ? `<div class="card-sub">${esc(card.sub)}</div>` : ""}
        ${card.body ? `<div class="card-body">${esc(card.body)}</div>` : ""}
      </div>`).join("") + `</div>` : "";
  let code = "";
  if (c.code_block) {
    code = `<div class="code">${c.code_block.lang ? `<span class="code-lang">${esc(c.code_block.lang)}</span>` : ""}<pre>${esc(c.code_block.code)}</pre></div>`;
  }
  const callouts = c.callouts || (c.callout ? [c.callout] : []);
  const co = callouts.map(t => `<div class="callout">${esc(t)}</div>`).join("");
  return `${kicker(s.kicker, false)}${h1(s.h1, false)}${sub}${cardsHtml}${code}${co}`;
}

function rFlujo(s, n) {
  const c = s.content || {};
  const nodos = (c.nodos || []).map((nd, i, arr) => {
    const col = resolveColor(nd.color), bg = resolveBg(nd.color);
    const arrow = i < arr.length - 1 ? `<div class="flow-arrow">▶</div>` : "";
    return `<div class="node" style="border-color:${col};background:${bg}">
        <div class="node-name" style="color:${col}">${nl2br(nd.nombre)}</div>
        ${nd.tipo ? `<div class="node-type">${esc(nd.tipo)}</div>` : ""}
      </div>${arrow}`;
  }).join("");
  const kpis = (c.kpis || []).map(k =>
    `<div class="kpi"><div class="kpi-val" style="color:${resolveColor(k.color || "narOsc")}">${esc(k.val)}</div><div class="kpi-lbl">${esc(k.label)}</div></div>`).join("");
  const co = c.callout ? `<div class="callout">${esc(c.callout)}</div>` : "";
  return `${kicker(s.kicker, false)}${h1(s.h1, false)}
    <div class="flow">${nodos}</div>
    ${kpis ? `<div class="kpis">${kpis}</div>` : ""}${co}`;
}

function rTabla(s, n) {
  const c = s.content || {};
  const cols = c.columnas || [];
  const head = `<tr>` + cols.map(x => `<th>${esc(x)}</th>`).join("") + `</tr>`;
  const rows = (c.filas || []).map(f => `<tr>` + f.cols.map((cell, i) => `<td class="${i === 0 ? "td-mono" : ""}">${esc(cell)}</td>`).join("") + `</tr>`).join("");
  const callouts = c.callouts || (c.callout ? [c.callout] : []);
  const co = callouts.map(t => `<div class="callout">${esc(t)}</div>`).join("");
  return `${kicker(s.kicker, false)}${h1(s.h1, false)}
    <table class="tbl">${head}${rows}</table>${co}`;
}

function rIore(s, n) {
  const c = s.content || {};
  const block = (label, items, color, bg) => `
    <div class="iore-block" style="--bg:${bg};--cl:${color}">
      <div class="iore-tag">${label}</div>
      <ul>${(items || []).slice(0, 6).map(it => `<li>${esc(it)}</li>`).join("")}</ul>
    </div>`;
  return `${kicker(s.kicker, false)}${h1(s.h1, false)}
    <div class="iore-grid">
      ${block("INPUTS", c.inputs, C.inputs, C.inputsBg)}
      ${block("OUTPUTS", c.outputs, C.outputs, C.outputsBg)}
      ${block("REGLAS", c.reglas, C.reglas, C.reglasBg)}
      ${block("EXCEPCIONES", c.excepciones, C.excepc, C.excepcBg)}
    </div>`;
}

function rDivider(s, n) {
  const sub = s.subtitulo ? `<div class="div-sub">${esc(s.subtitulo)}</div>` : "";
  return `<div class="accent-bar"></div>
    ${s.kicker ? `<div class="kicker k-dark div-kicker">${esc(s.kicker)}</div>` : ""}
    <div class="div-h1">${nl2br(s.h1)}</div>${sub}`;
}

function rGate(s, n) {
  const c = s.content || {};
  const gate = c.gate ? `<div class="gate-card"><span class="gate-tag">${esc(c.gate.label || "Gate ✓")}</span><span class="gate-desc">${esc(c.gate.descripcion || "")}</span></div>` : "";
  const fuera = (c.fuera_scope && c.fuera_scope.length) ? `<div class="gate-col gate-neg"><div class="gate-col-title">❌ Fuera de scope</div>${c.fuera_scope.map(i => `<div class="gate-item">→ ${esc(i)}</div>`).join("")}</div>` : "";
  let sig = "";
  if (c.siguiente) {
    sig = `<div class="gate-col gate-next"><div class="gate-col-title">→ ${esc(c.siguiente.titulo || "")}</div>${(c.siguiente.items || []).map(i => `<div class="gate-item">· ${esc(i)}</div>`).join("")}${c.siguiente.idea_fuerza ? `<div class="gate-if">${esc(c.siguiente.idea_fuerza)}</div>` : ""}</div>`;
  }
  return `${kicker(s.kicker, false)}${h1(s.h1, false)}${gate}<div class="gate-cols">${fuera}${sig}</div>`;
}

function rImpacto(s, n) {
  const c = s.content || {};
  const enun = (c.enunciado || []).map(p => `<span class="${p.enfasis ? "enf" : ""}">${esc(p.texto)}</span>`).join("");
  const colN = c.columna_negativa, colP = c.columna_positiva;
  const neg = colN ? `<div class="imp-col imp-neg"><div class="imp-col-title">${esc(colN.titulo)}</div>${(colN.items || []).map(i => `<div class="imp-item">→ ${esc(i)}</div>`).join("")}</div>` : "";
  const pos = colP ? `<div class="imp-col imp-pos"><div class="imp-col-title">${esc(colP.titulo)}</div>${(colP.items || []).map(i => `<div class="imp-item">→ ${esc(i)}</div>`).join("")}</div>` : "";
  return `${kicker(s.kicker, false)}${h1(s.h1, false)}
    <div class="enunciado">${enun}</div>
    <div class="imp-cols">${neg}${pos}</div>`;
}

function rCierre(s, n) {
  const c = s.content || {};
  const resp = c.respuesta ? `<div class="cierre-resp">${esc(c.respuesta)}</div>` : "";
  const cond = (c.condiciones || []).map(x => `<div class="cierre-cond">→ ${esc(x)}</div>`).join("");
  return `<div class="accent-bar"></div>${kicker(s.kicker, true)}
    <div class="cierre-q">${esc(s.h1)}</div>${resp}${cond}`;
}

function rPreview(s, n) {
  const c = s.content || {};
  const pasos = (c.pasos || []).map(p => `
    <div class="paso"><div class="paso-num">${esc(p.num)}</div>
      <div class="paso-body"><div class="paso-titulo">${esc(p.titulo)}</div><div class="paso-det">${esc(p.detalle)}</div></div></div>`).join("");
  return `<div class="accent-bar"></div>${kicker(s.kicker, true)}
    <div class="prev-h1">${esc(s.h1)}</div>
    ${s.subtitulo_prda ? `<div class="prev-prda">${esc(s.subtitulo_prda)}</div>` : ""}
    <div class="pasos">${pasos}</div>`;
}

const RENDERERS = {
  portada: rPortada, portada_secundaria: rPortada,
  contenido: rContenido, contenido_cards: rContenido,
  flujo: rFlujo, tabla: rTabla, iore: rIore, divider: rDivider,
  gate: rGate, impacto: rImpacto, cierre: rCierre, preview_sesion: rPreview,
};

const slidesHtml = guion.slides.map((s, i) => {
  const n = i + 1;
  const dark = isDark(s);
  const renderer = RENDERERS[s.type] || rContenido;
  return `<section class="slide ${dark ? "dark" : "light"}" data-n="${n}">
    <div class="slide-inner">${renderer(s, n)}</div>
    <div class="footer">${footer(n, dark)}</div>
  </section>`;
}).join("\n");

// ─── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
:root{
  --azul:${C.azul};--narLum:${C.narLum};--narOsc:${C.narOsc};--crema:${C.crema};
  --blanco:${C.blanco};--texto:${C.texto};--textoSub:${C.textoSub};--textoDim:${C.textoDim};
  --borde:${C.borde};--mute:${C.mute};--inputs:${C.inputs};--inputsBg:${C.inputsBg};
  --outputs:${C.outputs};--outputsBg:${C.outputsBg};--reglas:${C.reglas};--reglasBg:${C.reglasBg};
  --excepc:${C.excepc};--excepcBg:${C.excepcBg};
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#11202F;font-family:'IBM Plex Sans',Arial,sans-serif;overflow:hidden}
#stage{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}
.slide{width:1280px;height:720px;position:absolute;display:none;overflow:hidden}
.slide.active{display:block}
.slide.dark{background:var(--azul)}
.slide.light{background:var(--crema)}
.slide-inner{position:absolute;inset:0;padding:48px 70px 70px}
.accent-bar{position:absolute;left:0;top:0;width:10px;height:100%;background:var(--narLum)}
.kicker{font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:.18em;text-transform:uppercase;font-weight:500}
.k-dark{color:var(--narLum)} .k-light{color:var(--narOsc)}
h1{font-family:'Syne',sans-serif;font-weight:800;line-height:1.05;margin:14px 0 10px}
.h1-dark{color:var(--blanco);font-size:40px}
.h1-light{color:var(--azul);font-size:40px}
.sub{font-size:18px;color:var(--textoSub);margin-bottom:14px;max-width:1050px;line-height:1.45}
.footer{position:absolute;left:70px;right:70px;bottom:26px;display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--textoDim)}
.slide.dark .footer{color:var(--mute)}
.cp{opacity:.8}.counter{margin-left:auto}

/* Portada */
.cover-h1{font-family:'Syne',sans-serif;font-weight:800;font-size:58px;color:var(--blanco);line-height:1.05;margin-top:18px}
.cover-h2{font-family:'Syne',sans-serif;font-weight:800;font-size:58px;color:var(--narLum);line-height:1.05}
.cover-sub{font-size:19px;color:var(--mute);margin-top:18px;max-width:1050px;line-height:1.5}
.chip{display:inline-block;margin-top:22px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--narLum);border:1px solid var(--narLum);background:#0D2E4A;padding:5px 12px;border-radius:3px}
.badges{margin-top:26px;display:flex;gap:10px;flex-wrap:wrap}
.badge{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--narLum);border:1px solid var(--narLum);background:#0D2E4A;padding:5px 11px;border-radius:3px}
.stats{margin-top:30px;display:flex;gap:50px}
.stat-val{font-family:'Syne',sans-serif;font-weight:800;font-size:54px;color:var(--narLum);line-height:1}
.stat-lbl{font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--mute);margin-top:6px}

/* Cards */
.cards{display:grid;gap:16px;margin-top:6px}
.cards.cols-2{grid-template-columns:1fr 1fr}
.cards.cols-3{grid-template-columns:1fr 1fr 1fr}
.card{background:var(--blanco);border:1px solid var(--borde);border-left:6px solid var(--azul);border-radius:4px;padding:16px 18px}
.card-title{font-family:'Syne',sans-serif;font-weight:700;font-size:21px;color:var(--azul)}
.card-sub{font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--narOsc);margin-top:4px}
.card-body{font-size:16px;color:var(--textoSub);margin-top:9px;line-height:1.45}

/* Code */
.code{position:relative;background:#1C1C1C;border-radius:4px;padding:16px 18px;margin-top:14px;overflow:auto}
.code-lang{position:absolute;top:0;right:0;background:var(--narOsc);color:#fff;font-family:'IBM Plex Mono',monospace;font-size:11px;padding:2px 8px;border-radius:0 4px 0 4px}
.code pre{font-family:'IBM Plex Mono',monospace;font-size:14.5px;color:#E8E3D8;line-height:1.55;white-space:pre}

/* Callout */
.callout{background:#FFF7ED;border-left:4px solid var(--narOsc);border-radius:0 4px 4px 0;padding:12px 16px;margin-top:14px;font-size:16px;color:var(--texto);line-height:1.45}

/* Flujo */
.flow{display:flex;align-items:stretch;gap:6px;margin-top:30px}
.node{flex:1;border:2px solid;border-radius:5px;padding:18px 12px;text-align:center;display:flex;flex-direction:column;justify-content:center}
.node-name{font-family:'Syne',sans-serif;font-weight:700;font-size:19px}
.node-type{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--textoSub);margin-top:8px}
.flow-arrow{align-self:center;color:var(--narOsc);font-size:18px;padding:0 2px}
.kpis{display:flex;gap:14px;margin-top:18px}
.kpi{flex:1;background:var(--blanco);border:1px solid var(--borde);border-radius:4px;padding:12px;text-align:center}
.kpi-val{font-family:'Syne',sans-serif;font-weight:800;font-size:38px;line-height:1}
.kpi-lbl{font-size:13px;color:var(--textoSub);margin-top:6px}

/* Tabla */
.tbl{width:100%;border-collapse:collapse;margin-top:18px;font-size:16px}
.tbl th{background:var(--azul);color:var(--narLum);font-family:'IBM Plex Mono',monospace;font-size:13px;text-transform:uppercase;letter-spacing:.04em;text-align:left;padding:9px 12px}
.tbl td{padding:11px 12px;border-bottom:1px solid var(--borde);color:var(--texto);vertical-align:top;line-height:1.35}
.tbl tr:nth-child(even) td{background:#F5F2EC}
.td-mono{font-family:'IBM Plex Mono',monospace;font-weight:600;color:var(--azul)}

/* IORE */
.iore-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}
.iore-block{background:var(--blanco);border:1px solid var(--borde);border-radius:4px;padding:14px}
.iore-tag{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--cl);background:var(--bg);border:1px solid var(--cl);border-radius:3px;padding:3px 9px;margin-bottom:8px}
.iore-block ul{list-style:none}
.iore-block li{font-family:'IBM Plex Mono',monospace;font-size:13.5px;color:var(--texto);padding:3px 0 3px 14px;position:relative;line-height:1.35}
.iore-block li:before{content:"·";position:absolute;left:2px;color:var(--cl)}

/* Divider */
.div-kicker{margin-bottom:10px}
.div-h1{font-family:'Syne',sans-serif;font-weight:800;font-size:68px;color:var(--blanco);line-height:1.05;margin-top:60px}
.div-sub{font-size:20px;color:var(--mute);margin-top:26px;max-width:1050px;line-height:1.5}

/* Gate */
.gate-card{display:flex;align-items:center;gap:14px;background:var(--outputsBg);border:1px solid var(--outputs);border-left:6px solid var(--outputs);border-radius:4px;padding:14px 16px;margin-top:16px}
.gate-tag{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:700;color:var(--outputs);border:1px solid var(--outputs);border-radius:3px;padding:3px 10px;white-space:nowrap}
.gate-desc{font-size:16px;color:var(--texto);line-height:1.4}
.gate-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.gate-col{background:var(--blanco);border:1px solid var(--borde);border-radius:4px;padding:16px;position:relative}
.gate-neg{border-left:6px solid var(--excepc)} .gate-next{border-left:6px solid var(--azul)}
.gate-col-title{font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:700;margin-bottom:10px}
.gate-neg .gate-col-title{color:var(--excepc)} .gate-next .gate-col-title{color:var(--azul)}
.gate-item{font-size:16px;color:var(--textoSub);margin:6px 0;line-height:1.35}
.gate-if{margin-top:12px;font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--azul);background:var(--inputsBg);border:1px solid var(--azul);border-radius:3px;padding:8px 10px}

/* Impacto */
.enunciado{background:var(--azul);border-radius:4px;padding:22px;margin-top:16px;text-align:center;font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:var(--blanco)}
.enunciado .enf{color:var(--narLum)}
.imp-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.imp-col{border:1px solid;border-radius:4px;padding:16px}
.imp-neg{background:var(--excepcBg);border-color:var(--excepc)} .imp-pos{background:var(--outputsBg);border-color:var(--outputs)}
.imp-col-title{font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:700;margin-bottom:10px}
.imp-neg .imp-col-title{color:var(--excepc)} .imp-pos .imp-col-title{color:var(--outputs)}
.imp-item{font-size:17px;margin:8px 0;line-height:1.35}
.imp-neg .imp-item{color:var(--excepc)} .imp-pos .imp-item{color:var(--outputs)}

/* Cierre */
.cierre-q{font-family:'Syne',sans-serif;font-weight:800;font-size:40px;color:var(--blanco);margin-top:40px;line-height:1.15;max-width:1080px}
.cierre-resp{background:#0D2A45;border:1px solid var(--narLum);border-radius:4px;padding:12px 16px;margin-top:28px;font-family:'Syne',sans-serif;font-size:24px;color:var(--mute);display:inline-block}
.cierre-cond{font-size:19px;color:var(--mute);margin-top:14px}

/* Preview */
.prev-h1{font-family:'Syne',sans-serif;font-weight:800;font-size:46px;color:var(--blanco);margin-top:14px}
.prev-prda{font-family:'IBM Plex Mono',monospace;font-size:15px;color:var(--narLum);font-weight:700;margin-top:8px}
.pasos{margin-top:28px}
.paso{display:flex;align-items:center;gap:18px;margin-bottom:26px}
.paso-num{flex:none;width:54px;height:54px;border-radius:50%;background:var(--narLum);color:var(--azul);font-family:'Syne',sans-serif;font-weight:800;font-size:20px;display:flex;align-items:center;justify-content:center}
.paso-titulo{font-family:'Syne',sans-serif;font-weight:700;font-size:21px;color:var(--blanco)}
.paso-det{font-size:16px;color:var(--mute);margin-top:3px}

/* Nav */
#nav{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:10px;font-family:'IBM Plex Mono',monospace;font-size:12px}
#nav button{background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:4px;padding:6px 12px;cursor:pointer}

@media print{
  @page{size:13.333in 7.5in;margin:0}
  body{overflow:visible;background:#fff}
  #stage{position:static;display:block}
  #nav{display:none}
  .slide{display:block!important;position:relative;page-break-after:always;transform:none!important}
  .slide:last-child{page-break-after:avoid}
}
`;

const HTML = `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(meta.title || outputName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body>
<div id="stage"><div id="deck">
${slidesHtml}
</div></div>
<div id="nav"><button onclick="go(-1)">← Ant</button><span id="pos"></span><button onclick="go(1)">Sig →</button></div>
<script>
const slides=[...document.querySelectorAll('.slide')];let cur=0;
const stage=document.getElementById('stage');
function fit(){const s=Math.min(innerWidth/1280,innerHeight/720);slides.forEach(sl=>sl.style.transform='scale('+s+')');}
function show(i){cur=Math.max(0,Math.min(slides.length-1,i));slides.forEach((sl,j)=>sl.classList.toggle('active',j===cur));document.getElementById('pos').textContent=(cur+1)+' / '+slides.length;}
function go(d){show(cur+d);}
addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' ')go(1);if(e.key==='ArrowLeft')go(-1);});
addEventListener('resize',fit);fit();show(0);
</script>
</body></html>`;

fs.writeFileSync(OUTPUT_PATH, HTML, "utf8");
console.log(`OK: ${OUTPUT_PATH}`);
