---
name: code-diagram-explainer
description: >
  Genera diagramas SVG inline que explican visualmente fragmentos de código:
  nodos n8n, funciones, pipelines, clases, workflows. El diagrama incluye
  pseudo-código real extraído del fuente, flujo de control con ramas ✓/✗,
  anotaciones didácticas y paleta COIIAOC v2.

  Activa este skill SIEMPRE que Bernardo pida "explica este nodo", "idem para
  el nodo X", "diagrama del nodo", "esquema visual del código", "explica
  visualmente", "misma estructura que el diagrama anterior" o cualquier
  variante que implique producir un SVG explicativo de código. También actívalo
  proactivamente cuando se analice un workflow de n8n y se hayan producido ya
  uno o más diagramas de nodos en la misma sesión — la coherencia visual es
  obligatoria.
license: Proprietary — Bernardo Ronquillo Japón
---

# Code Diagram Explainer

Skill para producir diagramas SVG explicativos de código. Consolidado a partir
de los 8 diagramas producidos en la sesión II3 de VERBEX COMPOSITES (mayo 2026).

---

## 1 · Proceso de trabajo

### Paso 1 — Leer el código fuente

Antes de dibujar nada, leer el código completo del nodo o función. Si está en
un archivo JSON de workflow n8n, extraer con:

```python
for n in data['nodes']:
    if 'NOMBRE' in n['name']:
        print(n['parameters']['jsCode'])   # Code node
        print(n['parameters'])             # HTTP / Set node
```

Nunca dibujar desde memoria ni desde descripciones textuales — siempre desde
el fuente real.

### Paso 2 — Clasificar el tipo de nodo

| Tipo | Patrón visual dominante | Referencia en esta sesión |
|------|------------------------|--------------------------|
| **Flujo de checks secuenciales** | Cajas apiladas + ramas ✗ a la izquierda | Parser anti-alucinación, R04+R08, R01+R02 |
| **Ensamblaje / composición** | Contenedor con bloques internos | Construir body API |
| **Configuración declarativa** | Secciones separadas por divisores | Llamada Claude API |
| **Bifurcación única** | Diamante → rama izquierda (fallo) + derecha (ok) | R07, R03, R09 |
| **Bucle puro** | Rectángulo contenedor azul + checks internos | R05+R06 |

Elegir el patrón antes de escribir el SVG.

### Paso 3 — Identificar qué incluir

Para cada nodo, extraer:

- **Pseudo-código real**: las líneas clave del fuente, no paráfrasis
- **Condiciones de bifurcación**: el `if` literal que aparece en el código
- **Valores hardcoded relevantes**: umbrales, Sets, arrays
- **Campos de entrada y salida**: qué llega de upstream, qué sale a downstream
- **Deuda técnica / notas pedagógicas**: comentarios `// stub`, notas de
  evolución a sesiones posteriores

### Paso 4 — Renderizar el SVG · dos modos

- **Modo inline (por defecto):** `visualize:show_widget` — objeto de aprendizaje interactivo
  (clic → `sendPrompt`). Es el modo para explicar un fragmento en el chat.
- **Modo-fichero:** cuando el SVG debe **persistirse** (embeber en un DOCX, o para
  `repo-code-explainer` a escala de repo), usar el generador compartido **`svg_grammar.py`** (la
  gramática §2 en Python): `render(spec) → str`, `write(spec, ruta.svg)`, o CLI
  `python svg_grammar.py spec.json salida.svg`. La gramática vive **una sola vez aquí**; otros skills
  la **importan**, no la duplican. Formato de `spec` documentado en la cabecera de `svg_grammar.py`.

---

## 2 · Especificación técnica del SVG

### Dimensiones y viewBox

```
viewBox="0 0 680 H"   donde H se calcula por contenido
```

- Ancho fijo: **680px**
- Alto: variable. Calcular antes de dibujar:
  - Encabezado upstream: ~64px
  - Cada bloque/check: ~68–100px según contenido
  - Separadores: ~8px
  - Bloques de ramas paralelas: tomar el mayor + ~20px margen
  - Convergencia + output: ~80px
  - Leyenda: ~44px

### Sistema de clases CSS (inyectar en `<defs>` o como `<style>`)

El SVG usa clases semánticas para tipografía. Inyectarlas dentro del SVG
mediante un bloque `<style>` al inicio del elemento raíz:

```svg
<style>
  .th { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px;
        font-weight: 700; fill: #1C1C1C; }
  .ts { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px;
        fill: #6B6B6B; }
</style>
```

> **Nota (v2)**: solo **fuentes de sistema** — texto `'Segoe UI', Arial,
> sans-serif`; código/mono `Consolas, 'Courier New', monospace`. **Prohibido**
> Syne, IBM Plex y cualquier Google Font. No añadir `@import` dentro del SVG.

### Paleta COIIAOC v2 — tokens para diagramas

Los nodos del diagrama usan clases de color semánticas (roles **IO/RE** de v2)
definidas como grupos `<g class="node c-X">`. Implementarlas via atributos
directos en `<rect>`:

| Clase | fill rect | stroke rect | Rol IO/RE · uso |
|-------|-----------|-------------|-----|
| `c-blue` | `#EAF1F7` | `#2E6B9E` | **inputs** · contenedores, bucles, secciones principales |
| `c-purple` | `#FBEEE6` | `#C2510A` | **decisión/condición** (naranja-oscuro, solo sobre claro) |
| `c-teal` | `#E6F4EE` | `#0D7C5A` | **outputs** positivos, pasos de escritura |
| `c-amber` | `#FBF1E0` | `#B45309` | **reglas** · advertencias, degradaciones, stubs |
| `c-red` | `#FBEAEA` | `#B91C1C` | **excepciones** · errores, throws |
| `c-gray` | `#FAFAF7` | `#9B9B9B` | neutro · nodos upstream/downstream, init |

> Borde institucional de leyenda/contenedores: `#E8E3D8`. **Nunca** usar
> naranja-oscuro `#C2510A` sobre azul; el naranja sobre azul es `#FF8C3B`.

**Nodos upstream/downstream** (fuera del contenedor principal): usar `c-gray`
con `fill="#1E3A5F"` (azul institución) y texto `fill="#FF8C3B"` cuando sean
el nodo entrada/salida principal del pipeline.

### Marcadores de flecha

```svg
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
```

Aplicar con `marker-end="url(#arrow)"`. El color del arrowhead hereda de
`stroke` gracias a `context-stroke`.

### Líneas de flujo

| Tipo | Color | dash | Uso |
|------|-------|------|-----|
| Flujo principal (ok) | `#888780` | sólida | Conexión entre bloques |
| Rama error/fallo | `#B91C1C` | sólida | Throw, error |
| Rama advertencia | `#B45309` o `#BA7517` | sólida | Degradación |
| Rama ok explícita | `#0F6E56` | sólida | Validación superada |
| Deuda técnica | `#B91C1C` o `#B45309` | `stroke-dasharray="4 3"` | Evolución futura |
| Separador interno | `#B5D4F4` | `stroke-dasharray="4 3"` | Divide secciones dentro de contenedor |

### Etiquetas de rama

Texto junto a la línea de bifurcación, `font-family="IBM Plex Mono"`,
`font-size="10"`. Usar `✓` (verde `#0D7C5A`) y `✗` (rojo `#B91C1C`) en
bifurcaciones binarias. Etiquetas rotadas 90° en ramas laterales:

```svg
<text ... transform="rotate(-90 X Y)">fallo</text>   <!-- rama izquierda -->
<text ... transform="rotate(90 X Y)">ok</text>        <!-- rama derecha -->
```

### Pseudo-código en el SVG

Las líneas de código real del fuente se renderizan con:

```svg
<text ... font-family="IBM Plex Mono, monospace" font-size="11"
      fill="#1C1C1C">condicion_literal_del_codigo</text>
```

**Regla**: copiar la expresión real del fuente, no una descripción. Si la
línea es larga, truncar con `…` manteniendo la parte semántica clave.

Ejemplo correcto:
```
!CLIENTES_REGISTRADOS.includes(codErp)
```
Ejemplo incorrecto:
```
verifica si el cliente está en la lista
```

### Badges de acción

Rectángulos de color sólido dentro de un bloque check, alineados a la derecha,
para indicar la consecuencia de la condición:

```svg
<rect x="X" y="Y" width="96" height="22" rx="4" fill="#534AB7" stroke="none"/>
<text x="X+48" y="Y+11" text-anchor="middle" dominant-baseline="central"
      font-family="IBM Plex Mono, monospace" font-size="10"
      fill="#EEEDFE">→ ERROR</text>
```

Paleta de badges:

| Consecuencia | fill | texto fill |
|-------------|------|------------|
| → ERROR (duro) | `#B91C1C` | `#FAFAF7` |
| → ERROR (schema) | `#534AB7` | `#EEEDFE` |
| → PARCIAL | `#B45309` | `#FFF7ED` |
| → null + alerta | `#0F6E56` | `#9FE1CB` |
| → AOG | `#B91C1C` | `#FAFAF7` |

### Leyenda

Siempre al pie, dentro del viewBox. Rectángulo `fill="none"` con
`stroke="#E8E3D8"`. Texto `font-size="9"` IBM Plex Mono. Máximo 3–4 items.

### Interactividad con `sendPrompt`

Cada bloque puede llevar `onclick="sendPrompt('Pregunta didáctica...')"` en el
`<g>` contenedor. Esto convierte el diagrama en un objeto de aprendizaje
interactivo: el alumno hace clic en un bloque y lanza la pregunta al chat.

Reglas para las preguntas:
- Preguntar por el **por qué** del diseño, no por el qué (eso ya lo muestra el diagrama)
- Conectar con conceptos del curso: E4/E5, PRDA, IO/RE, SOUL/SKILL
- Máximo 12 palabras

Ejemplos buenos:
```
'¿Por qué R03 solo degrada a PARCIAL y no a ERROR?'
'¿Qué antipatrón E4 evita que R02 calcule las fechas?'
'¿Cuándo debería moverse este Set hardcoded a Google Sheets?'
```

---

## 3 · Estructura canónica por tipo de nodo

### 3a · Flujo de checks secuenciales

Usado en: parser anti-alucinación, R04+R08, R01+R02.

```
[UPSTREAM: nodo anterior]
        ↓
[INICIALIZACIÓN: deep clone + vars]
        ↓
[CHECK 1] ──✗──→ [ERROR_BLOCK_1]
        ↓ ✓
[CHECK 2] ──✗──→ [ERROR_BLOCK_2]
        ↓ ✓
   (continúa…)
        ↓
[ESCRITURA RESULTADO]
        ↓
[OUTPUT: return [{json: po}]]
        ↓
[DOWNSTREAM: nodo siguiente]
```

Todos los bloques de error de la izquierda convergen en una línea vertical
discontinua que baja al bloque `onError` o al output final.

### 3b · Ensamblaje / composición

Usado en: Construir body API.

```
[UPSTREAM]
     ↓
[CONTENEDOR principal (c-blue, border)]
  ├── [Bloque A] (c-purple, SOUL)
  ├── ── separador ──
  ├── [Bloque B] (c-teal, tablas)
  ├── ── separador ──
  ├── [Bloque C] (c-teal, schema)
  ├── ── separador ──
  └── [Bloque D] (c-amber, few-shot)
     ↓
[EMPAQUETADO: return body]
     ↓
[DOWNSTREAM]
```

### 3c · Bifurcación única

Usado en: R07, R03, R09.

```
[UPSTREAM]
     ↓
[INICIALIZACIÓN]
     ↓
[CONDICIÓN ÚNICA]
   ↙ fallo        ok ↘
[RAMA IZQUIERDA]   [RAMA DERECHA]
   ↘                ↙
     [CONVERGENCIA]
          ↓
     [OUTPUT]
```

### 3d · Configuración declarativa (HTTP / Set nodes)

Usado en: Llamada Claude API.

```
[UPSTREAM + descripción del input]
     ↓
[CONTENEDOR principal (c-blue)]
  ├── [Sección: método + endpoint] (c-purple)
  ├── ── separador ──
  ├── [Sección: cabeceras] (c-purple)
  ├── ── separador ──
  ├── [Sección: body] (c-teal)
  ├── ── separador ──
  └── [Sección: opciones / timeout] (c-gray)
     ↓
[RESPUESTA: estructura del objeto retornado]
     ↓
[DOWNSTREAM]
```

---

## 4 · Notas pedagógicas — qué escribir en el comentario post-diagrama

El diagrama va siempre acompañado de **3–4 párrafos de prosa** en el chat.
Cada párrafo sigue este patrón:

1. **El aspecto más no-obvio del nodo** — la decisión de diseño que no se ve
   en el código a primera vista.
2. **La conexión con el principio del curso** — E4/E5, SOUL/SKILL, PRDA,
   IO/RE, deuda técnica consciente.
3. **El contraste con el nodo anterior** — qué hace distinto este nodo, por
   qué existe separado.
4. (Opcional) **La evolución prevista** — qué cambia en II4/II5.

Nunca repetir lo que ya es visible en el diagrama. Los párrafos son el nivel
de abstracción superior al SVG.

---

## 5 · Checklist antes de renderizar

- [ ] ¿He leído el código fuente completo antes de dibujar?
- [ ] ¿El pseudo-código en el SVG es literal (no parafraseado)?
- [ ] ¿Las condiciones de bifurcación usan los operadores reales del código?
- [ ] ¿Los colores siguen la paleta COIIAOC v2?
- [ ] ¿El `viewBox` tiene alto suficiente para todo el contenido?
- [ ] ¿El nodo upstream y el downstream están identificados?
- [ ] ¿Cada bloque con `onclick` tiene una pregunta didáctica de "por qué"?
- [ ] ¿La leyenda al pie identifica las categorías de color usadas?
- [ ] ¿Los párrafos de prosa no repiten lo que ya muestra el SVG?
