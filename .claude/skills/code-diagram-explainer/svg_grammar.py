#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
svg_grammar.py — Gramática visual de code-diagram-explainer (paleta COIIAOC v2), en Python.

FUENTE ÚNICA del renderer de diagramas de código por bloques apilados (+ rama lateral ✓/✗).
Vive aquí (en el skill dueño de la gramática); otros skills la IMPORTAN en vez de duplicarla
(p. ej. `repo-code-explainer/gen_repo_diagrams.py`).

Dos MODOS de salida:
  · render(spec) -> str   : devuelve el SVG (para incrustar inline; equivalente a `visualize:show_widget`)
  · write(spec, path)     : MODO-FICHERO — escribe el SVG a disco (para repo-code-explainer / DOCX)

Formato de `spec` (dict):
  {
    "title": str, "sub": str,
    "legend": [[cls, etiqueta], ...],          # cls ∈ blue|purple|teal|amber|red|gray
    "blocks": [ block, ... ]
  }
  block:
    {"node": true, "label": str}               # nodo upstream/downstream (azul institución)
    {"cls": <cls>, "label": str,
     "lines": [str, ...],                       # pseudo-código LITERAL (mono)
     "in": str,                                 # (opcional) etiqueta de la flecha entrante
     "branch": {"cls": <cls>, "label": str,     # (opcional) rama lateral ✗
                "lines": [...], "tag": "✗", "err": bool}}

CLI (modo-fichero):  python svg_grammar.py <spec.json> <salida.svg>
"""
import json
import sys
from pathlib import Path

# Tipografía COIIAOC v2: solo fuentes de sistema (prohibido Syne / IBM Plex).
FONT = "'Segoe UI',Arial,sans-serif"
MONO = "Consolas,'Courier New',monospace"

# Paleta COIIAOC v2 (clase → (fill, stroke)). Mapea a los roles IO/RE:
#   blue=inputs · teal=outputs · amber=reglas · red=excepciones ·
#   purple→naranja-oscuro (decisión/condición, solo sobre claro) · gray=neutro.
CLS = {
    "blue":   ("#EAF1F7", "#2E6B9E"),   # inputs
    "purple": ("#FBEEE6", "#C2510A"),   # decisión/condición (naranja-oscuro v2)
    "teal":   ("#E6F4EE", "#0D7C5A"),   # outputs
    "amber":  ("#FBF1E0", "#B45309"),   # reglas / advertencias
    "red":    ("#FBEAEA", "#B91C1C"),   # excepciones
    "gray":   ("#FAFAF7", "#9B9B9B"),   # neutro / upstream-downstream
}
NODE_FILL, NODE_TEXT = "#1E3A5F", "#FF8C3B"   # azul institución + naranja luminoso

W = 720
XM, WM = 60, 410          # columna principal
XB, WB = 498, 206         # columna de ramas
CXM = XM + WM / 2


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def head(h, title, sub):
    s = f'<svg width="{W}" height="{h}" viewBox="0 0 {W} {h}" xmlns="http://www.w3.org/2000/svg" font-family="{FONT}">\n'
    s += f'''  <defs>
    <marker id="a" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#888780"/></marker>
    <marker id="ax" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#B91C1C"/></marker>
    <filter id="sh" x="-4%" y="-4%" width="108%" height="116%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#0000001a"/></filter>
  </defs>
  <rect width="{W}" height="{h}" fill="#ffffff"/>
'''
    s += f'  <text x="{W/2:.0f}" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="#1C1C1C">{esc(title)}</text>\n'
    s += f'  <text x="{W/2:.0f}" y="43" text-anchor="middle" font-size="10" fill="#6B6B6B">{esc(sub)}</text>\n'
    return s


def txt(x, y, s, size=11, fill="#1C1C1C", anchor="start", weight=None, mono=False, italic=False):
    w = f' font-weight="{weight}"' if weight else ""
    it = ' font-style="italic"' if italic else ""
    ff = f' font-family="{MONO}"' if mono else ""
    return f'  <text x="{x:.0f}" y="{y:.0f}" text-anchor="{anchor}" font-size="{size}"{w}{it}{ff} fill="{fill}">{esc(s)}</text>\n'


def block_h(b):
    if b.get("node"):
        return 34
    return 24 + len(b.get("lines", [])) * 15 + 8


def draw_block(x, y, w, b):
    if b.get("node"):
        s = f'  <rect x="{x}" y="{y}" width="{w}" height="34" rx="7" fill="{NODE_FILL}" filter="url(#sh)"/>\n'
        s += txt(x + w / 2, y + 21, b["label"], size=11, fill=NODE_TEXT, anchor="middle", weight="700", mono=True)
        return s
    fill, stroke = CLS[b["cls"]]
    h = block_h(b)
    s = f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" fill="{fill}" stroke="{stroke}" stroke-width="1.6" filter="url(#sh)"/>\n'
    s += f'  <rect x="{x}" y="{y}" width="{w}" height="20" rx="7" fill="{stroke}"/>\n'
    s += f'  <rect x="{x}" y="{y+11}" width="{w}" height="9" fill="{stroke}"/>\n'
    s += txt(x + 9, y + 14, b["label"], size=9.5, fill="#ffffff", weight="700")
    for i, ln in enumerate(b.get("lines", [])):
        s += txt(x + 12, y + 36 + i * 15, ln, size=10.5, mono=True, fill="#1C1C1C")
    return s


def render(spec):
    """Devuelve el SVG (string) del diagrama descrito por `spec`."""
    blocks = spec["blocks"]
    gap = 20
    heights = [block_h(b) for b in blocks]
    H = 56 + sum(heights) + gap * (len(blocks) - 1) + 50
    s = head(H, spec["title"], spec["sub"])
    y = 56
    centers = []
    for i, b in enumerate(blocks):
        bh = heights[i]
        s += draw_block(XM, y, WM, b)
        centers.append((y, bh))
        # rama lateral
        br = b.get("branch")
        if br:
            brh = 24 + len(br.get("lines", [])) * 15 + 8
            by = y + (bh - brh) / 2
            s += draw_block(XB, by, WB, br)
            mk = "ax" if br.get("err") else "a"
            col = "#B91C1C" if br.get("err") else "#888780"
            s += f'  <line x1="{XM+WM}" y1="{y+bh/2:.0f}" x2="{XB}" y2="{by+brh/2:.0f}" stroke="{col}" stroke-width="1.6" marker-end="url(#{mk})"/>\n'
            s += txt((XM + WM + XB) / 2, ((y + bh / 2) + (by + brh / 2)) / 2 - 3, br.get("tag", "✗"),
                     size=8.5, fill=col, mono=True, anchor="middle")
        y += bh + gap
    # flechas de flujo principal
    for i in range(len(blocks) - 1):
        y1 = centers[i][0] + centers[i][1]
        y2 = centers[i + 1][0]
        lab = blocks[i + 1].get("in")
        s += f'  <line x1="{CXM:.0f}" y1="{y1}" x2="{CXM:.0f}" y2="{y2}" stroke="#888780" stroke-width="2" marker-end="url(#a)"/>\n'
        if lab:
            s += txt(CXM + 8, (y1 + y2) / 2 + 3, lab, size=9, fill="#6B6B6B", mono=True)
    # leyenda
    ly = H - 34
    s += f'  <rect x="{XM}" y="{ly}" width="{W-2*XM}" height="24" rx="6" fill="none" stroke="#E8E3D8"/>\n'
    lx = XM + 10
    for cls, lab in spec.get("legend", []):
        _, stroke = CLS[cls]
        s += f'  <rect x="{lx}" y="{ly+7}" width="11" height="10" rx="2" fill="{stroke}"/>\n'
        s += txt(lx + 16, ly + 16, lab, size=8.5, fill="#6B6B6B")
        lx += 24 + len(lab) * 6
    s += "</svg>\n"
    return s


def write(spec, path):
    """MODO-FICHERO: renderiza `spec` y lo escribe en `path` (crea carpetas). Devuelve el Path."""
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(render(spec), encoding="utf-8")
    return p


def main():
    if len(sys.argv) != 3:
        sys.exit("uso: python svg_grammar.py <spec.json> <salida.svg>")
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    print("[OK]", write(spec, sys.argv[2]))


if __name__ == "__main__":
    main()
