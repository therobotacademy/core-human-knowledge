# Cheatsheet · Spec-Kit (GitHub): Spec-Driven Development (SDD)

> Guía de referencia rápida del ciclo de vida de **Spec-Kit**: el framework de *Spec-Driven Development* (SDD) de GitHub que convierte especificaciones en ejecutables mediante pipelines de IA deterministas, erradicando el "vibe coding".

---

## Idea rectora

**Spec-Driven Development (SDD):** Las especificaciones dejan de ser documentación estática para convertirse en artefactos estructurados y ejecutables. El ciclo de vida garantiza que ninguna línea de código se escriba sin haber validado previamente la pirámide determinista: **Constitución (`constitution.md`) ➔ Especificación (`spec.md`) ➔ Plan técnico (`plan.md`) ➔ Tareas ordenadas (`tasks.md`) ➔ Auditoría cruzada (`analyze`) ➔ Implementación (`implement`)**.

---

## 1. El ciclo de vida de Spec-Kit paso a paso

```
[0. init / check] ────▶ [1. constitution] ────▶ [2. specify] ────▶ [3. clarify]
  Configuración           Reglas globales         spec.md           Reduce dudas
                                                                         │
[6. implement] ◀───── [5. analyze] ◀────── [4. tasks] ◀────── [3b. plan] ┘
  Genera código         Auditoría cruzada     tasks.md          plan.md + data-model
```

| Fase | Comando / Slash | Insumo | Artefacto resultante | Propósito principal |
|---|---|---|---|---|
| **0. Setup** | `specify init . --integration [model]` | Entorno local | `.specify/` | Inicializa el workspace e integraciones CLI. |
| **1. Constitución** | `/speckit-constitution [prompt]` | Principios y políticas | `.specify/memory/constitution.md` | Fija arquitectura, estándares de API, seguridad y calidad. |
| **2. Especificar** | `/speckit-specify [descripción]` | Requisitos en lenguaje natural | `specs/NNN-<nombre>/spec.md` | Define casos de uso, requisitos funcionales y criterios de éxito sin tecnología. |
| **3. Clarificar** | `/speckit-clarify` | `spec.md` activo | `spec.md` (resuelto) | Lanza hasta 5 preguntas para eliminar lagunas y decisiones ambiguas. |
| **4. Planificar** | `/speckit-plan [detalles técnicos]` | `spec.md` + tech stack | `plan.md`, `data-model.md`, `contracts/` | Fija arquitectura técnica, modelos de datos, endpoints y pruebas. |
| **5. Tareas** | `/speckit-tasks` | `spec.md` + `plan.md` | `specs/NNN-<nombre>/tasks.md` | Desglosa la implementación en subtareas atómicas y ordenadas por dependencia. |
| **6. Auditar** | `/speckit-analyze` | Trilogía spec + plan + tasks | Informe de inconsistencias | Análisis *read-only* de coherencia entre los tres documentos clave. |
| **7. Implementar** | `/speckit-implement` | `tasks.md` validado | Código fuente + tests | Ejecuta la generación de código y validación automatizada tarea a tarea. |

---

## 2. Anatomía de una Feature (`specs/NNN-feature/`)

Cada funcionalidad se aísla en su propio directorio numerado consecutivamente:

```
specs/003-user-auth/
├── spec.md                  # Especificación funcional pura (agnóstica de tech)
├── plan.md                  # Arquitectura técnica, dependencias y fases
├── research.md              # Alternativas consideradas y justificaciones
├── data-model.md            # Entidades, esquemas, tipos y validaciones
├── quickstart.md            # Escenarios de prueba e integración guiada
├── tasks.md                 # Lista ordenada de tareas atómicas
└── contracts/               # Contratos OpenAPI, GraphQL o CLI
    └── api-contracts.json
```

---

## 3. Reglas de oro numeradas

1. **① La especificación es agnóstica de implementación:** En `/speckit-specify`, prohíbe mencionar frameworks, bases de datos o sintaxis concreta; define solo el *qué*, no el *cómo*.
2. **② Validación de constitución obligatoria:** Cada `/speckit-plan` realiza un *Constitution Check*; si viola un principio de `constitution.md`, la fase no avanza.
3. **③ Jamás implementes sin `/speckit-analyze` limpio:** El comando de análisis cruzado es la última barrera para detectar discrepancias entre contratos, entidades y tareas antes de codificar.

---

## 4. Chuleta de comandos rápidos

```bash
# 1. Instalación de la CLI mediante uv
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z
specify check

# 2. Inicialización en el proyecto
specify init . --integration claude    # O antigravity / copilot

# 3. Pipeline guiado por el agente
/speckit-constitution [principios del proyecto]
/speckit-specify [descripción del caso de negocio]
/speckit-clarify
/speckit-plan [especificaciones del stack y endpoints]
/speckit-tasks
/speckit-analyze
/speckit-implement
```
