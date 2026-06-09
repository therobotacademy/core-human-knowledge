#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_repo_diagrams.py — repo-code-explainer · etapa 2 (DIAGRAMAR).

Render de los SVG del caso MVP-Crew_NCR usando la gramática COMPARTIDA de
code-diagram-explainer (`svg_grammar.py`, modo-fichero). La gramática NO se
duplica aquí: este fichero aporta solo el CONTENIDO (la spec de cada unidad).

El INVENTARIO de unidades lo produce `inventory.py` (etapa 1, AST). El contenido
rico por unidad sigue curado a mano (fase criterio/LLM pendiente).

    python .claude/skills/repo-code-explainer/gen_repo_diagrams.py
"""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
# gramática compartida — vive en el skill dueño (code-diagram-explainer)
sys.path.insert(0, str(REPO / ".claude" / "skills" / "code-diagram-explainer"))
import svg_grammar as g  # noqa: E402

OUT = REPO / "CONTENT" / "PARTE2-coiiaoc-Materiales" / "II-CrewIA" / "M_codigo-crew_NCR"
SVG_DIR = OUT / "svg"
INV = OUT / "inventario.json"

# ---------------------------------------------------------------- INVENTARIO MVP-Crew_NCR
DIAGRAMS = {
"01-orquestacion-crew": {
  "title": "Orquestación del Crew · main.py", "sub": "run(ncr_text) · Process.sequential · 3 agentes encadenados",
  "legend": [("blue","entrada/salida"),("purple","config Crew"),("teal","mapeo de salida")],
  "blocks": [
    {"node": True, "label": "stdin  →  texto libre del NCR"},
    {"cls":"blue","label":"run(ncr_text)","lines":["tasks = build_tasks(clasif, causas, planes, ncr_text)"]},
    {"cls":"purple","label":"Crew(...)","in":"agents+tasks","lines":[
        "agents=[clasificador, causas, planes]","process=Process.sequential, verbose=True"]},
    {"cls":"teal","label":"crew.kickoff()  →  result","in":"kickoff","lines":[
        "tasks_output[0].pydantic → clasificacion","tasks_output[1].pydantic → analisis_8d",
        "tasks_output[2].pydantic → plan_final"]},
    {"node": True, "label": "stdout → JSON (ncr_id, clasificacion, analisis_8d, **plan)"},
  ]},

"02-agente-clasificador": {
  "title": "Agente · clasificador (AS9100)", "sub": "agents.py · configuración declarativa · 1 tool",
  "legend": [("purple","role/goal/backstory"),("teal","tools"),("gray","llm")],
  "blocks": [
    {"cls":"purple","label":"role / goal","lines":[
        "role: Clasificador de No Conformidades AS9100","goal: severidad + cláusula AS9100 + contención"]},
    {"cls":"purple","label":"backstory","in":"","lines":[
        "auditor calidad aeronáutica (15 años)","SIEMPRE confirma severidad/cláusula con catálogo"]},
    {"cls":"teal","label":"tools","in":"","lines":["[lookup_tipo_nc]"]},
    {"cls":"gray","label":"llm","in":"","lines":["LLM(anthropic/claude-sonnet-4, temperature=0.1)"]},
    {"node": True, "label": "→ Task clasificacion (output_pydantic=Clasificacion)"},
  ]},

"03-agente-causas": {
  "title": "Agente · causas (8D)", "sub": "agents.py · configuración declarativa · 1 tool",
  "legend": [("purple","role/goal/backstory"),("teal","tools")],
  "blocks": [
    {"cls":"purple","label":"role / goal","lines":[
        "role: Analista de Causas Raíz 8D","goal: análisis 8D D1-D5 + área de la NC"]},
    {"cls":"purple","label":"backstory","in":"","lines":[
        "ingeniero calidad · 8D / RCCA (500+ NCRs)","SIEMPRE consulta lookup_causas_raiz(area=...)"]},
    {"cls":"teal","label":"tools","in":"","lines":["[lookup_causas_raiz]"]},
    {"node": True, "label": "→ Task causas (context=[clasificacion], =Analisis8D)"},
  ]},

"04-agente-planes": {
  "title": "Agente · planes (CAPA)", "sub": "agents.py · configuración declarativa · SIN tool (razonamiento puro)",
  "legend": [("purple","role/goal/backstory"),("amber","sin tool")],
  "blocks": [
    {"cls":"purple","label":"role / goal","lines":[
        "role: Gestor de Planes de Acción Correctiva","goal: CAPA + confianza global + alertas"]},
    {"cls":"purple","label":"backstory","in":"","lines":[
        "responsable CAPA Tier 2 · plazos en días hábiles","responsables por área (no personas)"]},
    {"cls":"amber","label":"tools","in":"","lines":["[]  ← sin herramienta: solo razona sobre el 8D"]},
    {"node": True, "label": "→ Task planes (context=[causas], =PlanFinal)"},
  ]},

"05-cadena-tasks": {
  "title": "Cadena de Tasks · tasks.py", "sub": "build_tasks() · context encadenado + output_pydantic (structured output)",
  "legend": [("blue","Task"),("teal","structured output")],
  "blocks": [
    {"node": True, "label": "ncr_text (inyectado en la description)"},
    {"cls":"blue","label":"task_clasificacion","lines":[
        "agent=clasificador","output_pydantic=Clasificacion"]},
    {"cls":"blue","label":"task_causas","in":"context","lines":[
        "context=[task_clasificacion]","agent=causas · output_pydantic=Analisis8D"]},
    {"cls":"blue","label":"task_planes","in":"context","lines":[
        "context=[task_causas]","agent=planes · output_pydantic=PlanFinal"]},
    {"node": True, "label": "[task_clasificacion, task_causas, task_planes]"},
  ]},

"06-modelos-pydantic": {
  "title": "Modelos Pydantic · contrato de salida", "sub": "tasks.py · output_pydantic enruta al structured output del provider",
  "legend": [("blue","modelo"),("purple","campo validado")],
  "blocks": [
    {"cls":"blue","label":"Clasificacion","lines":[
        "ncr_id · severidad: Literal[Minor|Major|Critical]","tipo_nc · clausula_as9100 · descripcion_breve",
        "requiere_contencion_inmediata: bool"]},
    {"cls":"blue","label":"Analisis8D","in":"","lines":[
        "D1_equipo · D2_descripcion · D3_contencion","D4_causa_raiz · D5_accion_correctiva"]},
    {"cls":"blue","label":"AccionCorrectiva","in":"","lines":[
        "id · descripcion · responsable","plazo_dias: int > 0 · estado = 'Abierta'"]},
    {"cls":"blue","label":"PlanFinal","in":"","lines":[
        "plan_acciones: list[AccionCorrectiva]","confianza: float [0.0, 1.0] · alertas: list[str]"]},
  ]},

"07-tool-lookup-tipo-nc": {
  "title": "Tool · lookup_tipo_nc", "sub": "tools.py · catálogo AS9100 (data/tipos_nc.csv) · bifurcación con fallback",
  "legend": [("purple","match"),("amber","fallback"),("teal","return")],
  "blocks": [
    {"node": True, "label": "tipo: str  (descripción libre del tipo de NC)"},
    {"cls":"purple","label":"match exacto","lines":["t.tipo_nc.lower() == tipo.strip().lower()"],
        "branch":{"cls":"purple","label":"match parcial","tag":"✗","lines":[
            "substring (ambos sentidos)"]}},
    {"cls":"purple","label":"¿encontrado?","in":"","lines":["match is None ?"],
        "branch":{"cls":"amber","err":False,"tag":"✗ None","label":"fallback","lines":[
            "Major · 8.7 · contención","+ aviso: no en catálogo"]}},
    {"cls":"teal","label":"return (JSON)","in":"✓","lines":[
        "{severidad, clausula_as9100, requiere_contencion}"]},
  ]},

"08-tool-lookup-causas": {
  "title": "Tool · lookup_causas_raiz", "sub": "tools.py · catálogo 8D (data/causas_raiz.csv) · validación + top-3",
  "legend": [("purple","check"),("red","error"),("teal","return")],
  "blocks": [
    {"node": True, "label": "area: str  (material|proceso|humano|proveedor|documental)"},
    {"cls":"purple","label":"validar área","lines":["area.lower() in _AREAS_VALIDAS ?"],
        "branch":{"cls":"red","err":True,"tag":"✗","label":"return error","lines":[
            "{error, areas_validas}"]}},
    {"cls":"blue","label":"cargar + filtrar","in":"✓","lines":[
        "causas = _cargar_causas_raiz()","[c for c in causas if c.area == area]"]},
    {"cls":"purple","label":"ordenar por frecuencia","in":"","lines":[
        "sort key=_ORDEN_FRECUENCIA{Alta:0,Media:1,Baja:2}"]},
    {"cls":"teal","label":"return (JSON)","in":"","lines":[
        "[{causa, frecuencia}]  ·  máx. 3 elementos"]},
  ]},
}


# Qué unidades del inventario cubre cada diagrama curado (puente con inventory.py).
# Permite el CROSS-CHECK: ningún core sin diagrama, ningún diagrama sobre unidad inexistente.
COVERS = {
    "01-orquestacion-crew":  ["crew"],
    "02-agente-clasificador": ["clasificador"],
    "03-agente-causas":       ["causas"],
    "04-agente-planes":       ["planes"],
    "05-cadena-tasks":        ["task_clasificacion", "task_causas", "task_planes"],
    "06-modelos-pydantic":    ["Clasificacion", "Analisis8D", "AccionCorrectiva", "PlanFinal"],
    "07-tool-lookup-tipo-nc": ["lookup_tipo_nc"],
    "08-tool-lookup-causas":  ["lookup_causas_raiz"],
}
CORE = {"orquestacion", "agente", "task", "modelo", "tool"}  # kinds que SIEMPRE merecen diagrama


def stub_spec(u):
    """Diagrama mínimo auto-generado desde el inventario (unidad core sin curar)."""
    d = u.get("detalle", {}) or {}
    k = u["kind"]
    if k == "modelo":
        lines = [", ".join(d.get("campos", []))[:54] or "(sin campos)"]
    elif k == "agente":
        lines = [f"role: {d.get('role', '?')}"[:54], f"tools: {d.get('tools', '[]')}"[:54]]
    elif k == "task":
        lines = [f"agent={d.get('agent')}", f"context={d.get('context')}", f"output={d.get('output_pydantic')}"]
    elif k == "tool":
        lines = [(d.get("doc") or "(sin docstring)")[:54], f"args: {d.get('args', [])}"]
    else:
        lines = [f"args: {d.get('args', [])}"]
    return {"title": f"{k} · {u['name']}",
            "sub": f"{u['file']}:{u['linea']} · patrón {u['patron']} · auto-stub (sin curar)",
            "legend": [("blue", k)],
            "blocks": [{"node": True, "label": u["name"]},
                       {"cls": "blue", "label": k, "lines": [ln for ln in lines if ln]}]}


def main():
    SVG_DIR.mkdir(parents=True, exist_ok=True)
    for name, spec in DIAGRAMS.items():
        g.write(spec, SVG_DIR / f"{name}.svg")
        print("[OK] curado ", (SVG_DIR / f"{name}.svg").name)

    # ---- cross-check contra el inventario auto (inventory.py) ----
    if not INV.exists():
        print(f"\n[!] {INV.name} no encontrado — ejecuta inventory.py para validar cobertura.")
        return
    inv = json.loads(INV.read_text(encoding="utf-8"))
    by_name = {u["name"]: u for u in inv}
    covered = {n for names in COVERS.values() for n in names}

    # diagramas curados que apuntan a unidades inexistentes (drift inverso)
    for n in sorted(covered - set(by_name)):
        print(f"[!] curado cubre unidad inexistente en el repo: {n}")

    core = [u for u in inv if u["kind"] in CORE]
    uncovered = [u for u in core if u["name"] not in covered]
    for u in uncovered:                        # auto-stub de los core sin curar
        key = f"stub-{u['kind']}-{u['name']}"
        g.write(stub_spec(u), SVG_DIR / f"{key}.svg")
        print(f"[OK] auto-stub {key}.svg")

    genericos = [u for u in inv if u["kind"] not in CORE]
    print(f"\n== COBERTURA ==  core {len(core)-len(uncovered)}/{len(core)} cubiertos · "
          f"{len(uncovered)} auto-stub · {len(genericos)} genéricos no diagramados "
          f"({', '.join(sorted({u['name'] for u in genericos}))})")


if __name__ == "__main__":
    main()
