---
name: text-to-diagram
description: >
  Convierte secciones de texto estructurado (metodologías, procesos, arquitecturas,
  marcos conceptuales, marcos teóricos, flujos operativos) en diagramas SVG visuales
  que sustituyen al texto — no lo decoran. El diagrama debe poder leerse de forma
  autónoma, sin necesidad de leer el texto original.

  Activa este skill SIEMPRE que el usuario pida "genera un diagrama para", "visualiza
  este apartado", "convierte esto en diagrama", "hazlo visual", "sustituye el texto
  con un diagrama", "ilustra la metodología / el proceso / la arquitectura / el flujo",
  o cualquier variante que implique transformar prosa estructurada en una representación
  visual. También actívalo proactivamente cuando el usuario suba un documento y pida
  explicar o ilustrar una sección específica (apartado, capítulo, subsección).

  Distinto de code-diagram-explainer (que parte de código fuente) y de
  marco-teorico-pbl (que genera slides PBL). Este skill parte de texto/prosa.
license: Proprietary — Bernardo Ronquillo Japón
---

# Text-to-Diagram

Convierte secciones de texto estructurado en diagramas SVG autónomos.
Consolidado a partir del diagrama de la sección 1.3 del TFG de Jaime Sánchez Pérez
(Metodología PDCA + ingeniería de datos, mayo 2026).

---

## 1 · Proceso de trabajo obligatorio

### Paso 1 — Leer el texto completo de la sección

Antes de dibujar nada, leer la sección completa. Identificar:

- **Estructura jerárquica**: ¿hay fases, capas, niveles, etapas?
- **Relaciones**: ¿flujo secuencial, ciclo, jerarquía, paralelismo, retroalimentación?
- **Entidades clave**: ¿qué conceptos/actores/sistemas aparecen nominalmente?
- **Cardinalidad**: ¿cuántos nodos? Si hay más de 7–8 nodos principales, dividir en dos diagramas.

**Nunca dibujar desde un resumen o paráfrasis del texto.** Leer el original.

### Paso 2 — Seleccionar el tipo de diagrama

| Tipo de contenido | Tipo de diagrama |
|---|---|
| Proceso con pasos en secuencia, decisiones, ramas | **Flowchart** |
| Cosas dentro de otras cosas, capas tecnológicas, arquitectura | **Structural** |
| Ciclos (PDCA, Deming, PDCA+fases) | **Flowchart** con retorno explícito |
| Marco teórico con conceptos relacionados | **Structural** o **Flowchart** según relación dominante |
| Comparación before/after, modelo anterior vs. propuesto | **Tabla visual** (dos columnas dentro de un structural) |
| Causa-efecto, causa raíz → impacto | **Flowchart** descendente |
| Pipeline de datos (extracción → proceso → análisis → viz) | **Flowchart** vertical |

Cuando hay **dos estructuras en paralelo** (ej: fuentes heterogéneas → fases → outputs), usar **flowchart vertical con columnas laterales** para fuentes y outputs.

### Paso 3 — Identificar qué incluye el diagrama

Extraer del texto:

- **Nodos principales**: las entidades o fases que el texto nombra explícitamente
- **Etiquetas**: usar las palabras exactas del texto (no paráfrasis) cuando sean cortas; parafrasear solo si el texto es demasiado largo para un nodo
- **Relaciones**: flechas y su dirección (¿quién produce qué para quién?)
- **Retroalimentaciones**: si el texto menciona un ciclo, cerrar la flecha
- **Notas pedagógicas / elementos fuera de scope**: nodos `c-gray` al margen o línea discontinua

### Paso 4 — Construir con `visualize:show_widget`

Usar siempre `visualize:show_widget`. No crear archivos `.svg` standalone.

---

## 2 · Principio central: el diagrama sustituye el texto

El diagrama es exitoso si el lector puede entender la sección **sin leer la prosa original**.
Esto implica:

- Toda entidad mencionada en el texto como actor, fase o sistema tiene un nodo
- Toda relación direccional del texto tiene una flecha
- Todo ciclo o retroalimentación tiene una flecha de retorno
- Los nodos tienen subtítulos que capturan el detalle esencial (≤5 palabras)
- **No hay texto explicativo dentro del SVG** más allá de labels y subtítulos de nodos

La prosa que acompaña al diagrama en el chat explica el **nivel de abstracción superior**: por qué ese diseño, qué decisión conceptual toma el diagrama, qué queda fuera. Nunca repite lo que el diagrama ya muestra.

---

## 3 · Especificación técnica del SVG

### ViewBox y dimensiones

```
viewBox="0 0 680 H"   — ancho fijo 680px, alto por contenido
```

Calcular H antes de dibujar:
- Encabezado: ~60px
- Cada fila de nodos: ~80–100px (nodo 60px + gap 20px)
- Columnas laterales (fuentes/outputs): calcular desde la fila que inician
- Leyenda: ~44px
- Margen inferior: +20px

### Paleta COIIAOC v1.1 — asignación semántica

| Categoría de nodo | Clase SVG | Cuándo usar |
|---|---|---|
| Marco contenedor / ciclo meta | `c-gray` | PDCA, marco metodológico, wrapper |
| Fases de proceso / pipeline | `c-purple` | Fases 1–N de un proceso estándar |
| Outputs / resultados / capas de decisión | `c-teal` | Análisis, visualización, resultados |
| Fuentes de datos / inputs externos | `c-blue` | SAP, APIs, archivos, sistemas origen |
| Alertas, advertencias, deuda técnica | `c-amber` | Limitaciones, deuda, notas críticas |
| Errores, exclusiones, fuera de scope | `c-red` | Lo que el texto dice que NO hace |
| Nodo upstream/downstream neutro | `c-gray` fondo `#1E3A5F` + texto `#FF8C3B` | Nodo principal de entrada/salida |

**Regla de 2–3 colores por diagrama**: no usar todas las clases a la vez.
Elegir los colores que mejor representan las categorías semánticas del texto específico.

### Conectores y flechas

Incluir siempre el marker en `<defs>`:
```svg
<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
  <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
        stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</marker>
```

| Tipo de relación | Línea |
|---|---|
| Flujo principal (secuencial, obligatorio) | `stroke="#888780"` sólida, `marker-end` |
| Retroalimentación / ciclo | `stroke="#B5D4F4"` discontinua `stroke-dasharray="4 3"`, `marker-end` |
| Relación débil / opcional | `stroke="#B5D4F4"` discontinua, sin arrowhead |
| Fuente → fase (convergencia) | `stroke="#888780"` sólida con ligera diagonal |

**Regla anti-cruce**: si una flecha cruza un nodo no relacionado, trazar con L-bend:
```svg
<path d="M x1 y1 L x1 ymid L x2 ymid L x2 y2" fill="none"
      stroke="#888780" stroke-width="1" marker-end="url(#arrow)"/>
```

### Interactividad con sendPrompt

Cada nodo principal lleva `onclick="sendPrompt('...')"`. Las preguntas deben:
- Preguntar por el **por qué** del diseño o la decisión
- Conectar con el dominio del texto (no genéricas)
- Máximo 12 palabras

Ejemplos buenos para un TFG logístico:
```
'¿Por qué se elige Power Query como motor ETL y no Python directamente?'
'¿Qué diferencia hay entre validación estadística y validación operativa?'
'¿Qué significa que el análisis sea prescriptivo y no solo descriptivo?'
```

---

## 4 · Patrones de layout por tipo de diagrama

### 4a · Pipeline de datos vertical (más frecuente en TFGs y metodologías)

```
[MARCO META: ciclo, metodología]
           ↓
[FUENTES]    →    [FASE 1]
(columna izq)     [FASE 2]
                  [FASE 3]    ←←←  [OUTPUTS triangulación]
                  [FASE 4]         (columna derecha)
                       ↓
                [OUTPUT FINAL]
                       ↓↑  (retorno al marco)
```

- Fuentes: columna izquierda, x ≈ 20–124, alineadas con las fases que alimentan
- Fases: columna central, x ≈ 178–388, apiladas verticalmente, gap 30px
- Outputs: columna derecha, x ≈ 474–644, alineados con las fases que los producen
- Retorno: `<path>` curvo por la derecha exterior, texto rotado 90°

### 4b · Ciclo cerrado (PDCA, Deming, event loop)

No dibujar como anillo. Usar flowchart vertical con flecha de retorno lateral:

```
[PLAN]  →  [DO]  →  [CHECK]  →  [ACT]
  ↑_________________________________↓
```

O apilado vertical con retorno por la izquierda.

### 4c · Arquitectura de capas (stack tecnológico, arquitectura software)

```
[CAPA SUPERIOR: visualización]
[CAPA ANÁLISIS]
[CAPA INTEGRACIÓN]
[CAPA FUENTES]
```

Usar structural diagram con contenedores `rx="12"` y fill progresivo (50→100→200 stop de la misma ramp).

### 4d · Comparación modelo anterior vs. propuesto

Dos columnas paralelas, mismo número de filas, color diferente:

```
[MODELO ANTERIOR]    [MODELO PROPUESTO]
  c-red/c-amber         c-teal/c-purple
  (limitaciones)        (mejoras)
```

---

## 5 · Leyenda obligatoria

Todo diagrama con más de 2 colores debe tener leyenda al pie:

```svg
<rect x="40" y="H-36" width="600" height="28" rx="6" fill="none"
      stroke="#E8E3D8" stroke-width="0.5"/>
<!-- items: color fill + texto descriptivo, separados por x -->
```

Items: máximo 4. Cada item: cuadrado de color (10×10) + texto `ts` descriptivo (≤4 palabras).

---

## 6 · Checklist antes de renderizar

- [ ] ¿He leído la sección completa del texto original?
- [ ] ¿Toda entidad mencionada como actor/fase/sistema tiene un nodo?
- [ ] ¿Toda relación direccional tiene una flecha?
- [ ] ¿Los ciclos y retroalimentaciones tienen flecha de retorno?
- [ ] ¿Los labels de nodos usan las palabras exactas del texto?
- [ ] ¿El alto del viewBox cubre todos los elementos + 20px margen?
- [ ] ¿Las flechas no cruzan nodos no relacionados?
- [ ] ¿Hay leyenda si hay más de 2 colores?
- [ ] ¿Cada nodo principal tiene `onclick` con pregunta de "por qué"?
- [ ] ¿La prosa que acompaña el diagrama NO repite lo que ya muestra el SVG?

---

## 7 · Prosa post-diagrama: qué escribir

Después del diagrama, 2–3 párrafos en el chat. Cada párrafo aborda:

1. **La decisión de diseño no obvia**: ¿por qué ese layout y no otro? ¿qué se sacrificó?
2. **Lo que el diagrama no puede mostrar**: matices del texto que son prosa por naturaleza
3. **Conexión con el contexto del documento**: cómo esta sección encaja con la siguiente

Nunca describir lo que el lector ya puede ver en el diagrama.
