#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
inventory.py — Etapa 1 (INVENTARIAR) de repo-code-explainer, AUTOMÁTICA.

Phase-2: sustituye el inventario hard-codeado por un escaneo AST de un repo Python.
Detecta unidades documentables y les asigna el patrón visual de code-diagram-explainer:

  · modelo Pydantic  (ClassDef con base BaseModel)        → ensamblaje
  · agente CrewAI    (x = Agent(...))                       → config-declarativa
  · task CrewAI      (x = Task(...), incluso anidada)       → flujo-de-checks
  · tool             (def con @tool)                        → bifurcacion
  · orquestación     (x = Crew(...))                        → flujo
  · función / clase  (top-level)                            → generico

Uso:
    python .claude/skills/repo-code-explainer/inventory.py <ruta-repo> [salida.json]

Sin args usa MVP-Crew_NCR como caso por defecto. Imprime un resumen y escribe el JSON.
La etapa 2 (diagramar el contenido rico de cada unidad) sigue siendo criterio/LLM; este
inventario fija QUÉ se documenta y con QUÉ patrón.
"""
import ast
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
DEFAULT_TARGET = REPO / "CONTENT" / "PARTE2-coiiaoc-Materiales" / "II-CrewIA" / "MVP-Crew_NCR"
DEFAULT_OUT = REPO / "CONTENT" / "PARTE2-coiiaoc-Materiales" / "II-CrewIA" / "M_codigo-crew_NCR" / "inventario.json"

PATRON = {
    "modelo": "ensamblaje", "agente": "config-declarativa", "task": "flujo-de-checks",
    "tool": "bifurcacion", "orquestacion": "flujo", "funcion": "generico", "clase": "generico",
}


def call_name(node):
    """Nombre de la función llamada en un ast.Call (Name o Attribute)."""
    f = node.func
    if isinstance(f, ast.Name):
        return f.id
    if isinstance(f, ast.Attribute):
        return f.attr
    return None


def deco_name(d):
    if isinstance(d, ast.Name):
        return d.id
    if isinstance(d, ast.Attribute):
        return d.attr
    if isinstance(d, ast.Call):
        return call_name(d)
    return None


def short(node, n=60):
    try:
        s = ast.unparse(node)
    except Exception:
        s = "<...>"
    s = " ".join(s.split())
    return s[:n] + ("…" if len(s) > n else "")


def kw(call, name):
    for k in call.keywords:
        if k.arg == name:
            return k.value
    return None


def target_name(assign):
    t = assign.targets[0]
    return t.id if isinstance(t, ast.Name) else short(t, 30)


def scan_file(py: Path, rel: str):
    units = []
    try:
        tree = ast.parse(py.read_text(encoding="utf-8"), filename=str(py))
    except SyntaxError:
        return units

    def add(name, kind, lineno, detail):
        units.append({"name": name, "kind": kind, "patron": PATRON[kind],
                      "file": rel, "linea": lineno, "detalle": detail})

    # --- top-level: clases, funciones, asignaciones ---
    for st in tree.body:
        if isinstance(st, ast.ClassDef):
            bases = [b.id for b in st.bases if isinstance(b, ast.Name)]
            if "BaseModel" in bases:
                fields = [n.target.id for n in st.body if isinstance(n, ast.AnnAssign)
                          and isinstance(n.target, ast.Name)]
                add(st.name, "modelo", st.lineno, {"campos": fields})
            else:
                add(st.name, "clase", st.lineno, {"bases": bases})
        elif isinstance(st, ast.FunctionDef):
            if any(deco_name(d) == "tool" for d in st.decorator_list):
                doc = (ast.get_docstring(st) or "").split("\n")[0]
                add(st.name, "tool", st.lineno, {"doc": doc, "args": [a.arg for a in st.args.args]})
            elif not st.name.startswith("_"):
                add(st.name, "funcion", st.lineno, {"args": [a.arg for a in st.args.args]})
        elif isinstance(st, ast.Assign) and isinstance(st.value, ast.Call):
            cn = call_name(st.value)
            if cn == "Agent":
                role = kw(st.value, "role")
                tools = kw(st.value, "tools")
                add(target_name(st), "agente", st.lineno, {
                    "role": short(role) if role else None,
                    "tools": short(tools, 40) if tools else "[]"})
            elif cn == "Crew":
                add(target_name(st), "orquestacion", st.lineno, {"call": short(st.value, 50)})

    # --- anidado: Task(...) y Crew(...) dentro de funciones ---
    seen = {(u["file"], u["linea"]) for u in units}
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call):
            cn = call_name(node.value)
            if cn in ("Task", "Crew") and (rel, node.lineno) not in seen:
                if cn == "Task":
                    agent = kw(node.value, "agent")
                    ctx = kw(node.value, "context")
                    out = kw(node.value, "output_pydantic")
                    add(target_name(node), "task", node.lineno, {
                        "agent": short(agent, 20) if agent else None,
                        "context": short(ctx, 30) if ctx else None,
                        "output_pydantic": short(out, 20) if out else None})
                else:
                    add(target_name(node), "orquestacion", node.lineno, {"call": short(node.value, 50)})
                seen.add((rel, node.lineno))
    return units


def scan_repo(target: Path):
    units = []
    for py in sorted(target.rglob("*.py")):
        if "__pycache__" in py.parts:
            continue
        units.extend(scan_file(py, str(py.relative_to(target)).replace("\\", "/")))
    # orden: por tipo (orquestación primero) y luego por fichero/línea
    orden_kind = {"orquestacion": 0, "agente": 1, "task": 2, "modelo": 3, "tool": 4, "funcion": 5, "clase": 6}
    units.sort(key=lambda u: (orden_kind.get(u["kind"], 9), u["file"], u["linea"]))
    return units


def main():
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_TARGET
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT
    units = scan_repo(target)

    print(f"== INVENTARIO · {target.name} ==  ({len(units)} unidades)")
    by = {}
    for u in units:
        by.setdefault(u["kind"], []).append(u)
    for kind in ["orquestacion", "agente", "task", "modelo", "tool", "funcion", "clase"]:
        for u in by.get(kind, []):
            print(f"  [{u['kind']:<12} · {u['patron']:<16}] {u['name']:<22} {u['file']}:{u['linea']}")

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(units, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[OK] {out.relative_to(REPO)}  ·  resumen: " +
          ", ".join(f"{k}={len(v)}" for k, v in sorted(by.items())))


if __name__ == "__main__":
    main()
