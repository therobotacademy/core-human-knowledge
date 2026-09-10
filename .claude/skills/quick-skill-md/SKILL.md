---
name: quick-skill-md
description: >
  Genera o actualiza una chuleta operativa `quick-skill.md` en la raíz de cualquier repositorio.
  Es agnóstico a la estructura de carpetas: audita y descubre dinámicamente las reglas del agente,
  skills locales, procesos de trabajo, bandejas de entrada/salida e invariantes no negociables,
  destilándolos en una referencia de ejecución ultra-densa (cero paja) para usuarios que conocen
  los procesos y no quieren leer READMEs ni documentación extensa.

  Actívalo cuando el usuario diga "/quick-skill-md", "actualiza quick-skill.md",
  "regenera la chuleta operativa", "resume lo que puede hacer el agente", o tras crear/modificar
  skills, procesos o reglas en cualquier proyecto.
license: Proprietary — Bernardo Ronquillo Japón
---

# quick-skill-md

Skill agnóstico para descubrir, sintetizar y mantener al día **`quick-skill.md`** en la raíz de cualquier repositorio o espacio de trabajo.

Produce una guía rápida de cero fricción ("cheat sheet operativo") pensada para usuarios que conocen los procesos del proyecto y solo necesitan consultar en segundos **qué pedir al agente, qué insumo entregarle, qué artefacto devuelve y qué límites respetar**.

---

## 1. Principio de agnosticismo estructural

Este skill **no asume nombres ni jerarquías fijas de carpetas**. Toda la información de `quick-skill.md` se deriva por **descubrimiento dinámico** sobre el entorno de trabajo actual.

---

## 2. Proceso de ejecución paso a paso

### Paso 1: Descubrimiento y auditoría del repositorio

1. **Descubrir directivas e invariantes de agente:**
   - Inspeccionar los ficheros de instrucciones raíz: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` o `.agents/rules/*.md`.
   - Extraer:
     - Invariantes de seguridad (ficheros que nunca deben borrarse, modos solo lectura).
     - Políticas de autonomía (qué acciones ejecuta sin confirmación y cuándo debe detenerse a preguntar).
     - Convenciones de nombrado, versionado o numeración de artefactos.
     - Estándares visuales, paletas o guías de estilo declaradas.

2. **Descubrir catálogo de skills y herramientas locales:**
   - Localizar los directorios de skills disponibles inspeccionando posibles rutas estándar:
     - `.claude/skills/`
     - `.agents/skills/`
     - `.agent/skills/`
     - `skills/`
   - Para cada skill descubierto:
     - Leer su `SKILL.md` (frontmatter y cuerpo) o su `README.md`.
     - Descartar o etiquetar skills marcados como obsoletos o archivados.
     - Extraer: nombre del skill, frases de invocación / prompts recomendados, formato del insumo (input) y formato/ubicación del entregable (output).

3. **Descubrir flujos de trabajo, procesos y bandejas:**
   - Identificar carpetas de entrada (ej. `raw/`, `inbox/`, `inputs/`).
   - Identificar carpetas de salida curada o artefactos finales (ej. `guides/`, `docs/`, `output/`, `dist/`).
   - Identificar procesos documentados (subcarpetas con `PROCESO.md`, `WORKFLOW.md`, scripts o pipelines).

---

### Paso 2: Destilación y redacción de `quick-skill.md`

El documento generado en la raíz del repositorio debe seguir estrictamente esta arquitectura:

```markdown
# Quick Skill — Chuleta Operativa del Agente

> [Subtítulo breve de contexto del repositorio]. Sin teoría ni preámbulos: qué pedir, qué dar de entrada y qué genera el agente.

---

## 1. Mapa de decisión rápida (Top)
[Tabla comparativa directa: Entregable deseado | Prompt para el agente | Entrada necesaria | Salida generada]

---

## 2. Instrucciones operativas por familia de entregables
[Bloques concisos agrupando las capacidades descubiertas (ej. Guías/Docs, Diagramas, Slides, Código, etc.)]
- Disparador exacto (dónde colocar insumo o qué comando invocar).
- Prompt o frase recomendada.
- Pasos autónomos que realiza el agente.
- Ubicación y formato de salida.

---

## 3. Invariantes no negociables (Bottom)
[Lista numerada de 3 a 5 reglas críticas extraídas de las instrucciones del proyecto]
- Qué nunca tocar/borrar.
- Qué convenciones de nombrado respetar siempre.
- Requisitos de calidad o autonomía.
```

---

### Paso 3: Validación y guardado

1. **Verificación cruzada:** Asegurarse de que cada prompt, ruta de fichero y script mencionado en `quick-skill.md` existe y es válido en el workspace actual.
2. **Escritura:** Guardar como `quick-skill.md` en la raíz del repositorio.
3. **Sincronización:** Si existen índices generales del proyecto (ej. `README.md`), reflejar la existencia de la chuleta rápida si procede.
