---
name: md-guide-builder
description: >
  Produce una guía práctica en Markdown siguiendo el estilo de la casa de
  core-human-knowledge: documento `NN-TIPO-tema.md` con "idea rectora", secciones,
  tabla resumen, reglas numeradas y chuleta de comandos, acompañado de un diagrama
  SVG autoexplicativo (paleta COIIAOC · tipografía V2).

  Actívalo cuando Bernardo diga "haz una guía", "genera una guía md", "escribe un
  cheatsheet/tutorial/procedimiento/referencia", "documenta esto como guía",
  "/md-guide-builder", o cuando deje caer notas crudas pidiendo convertirlas en guía.

  Funciona en DOS modos: (a) dentro de este repo → numera, coloca en `guides/` y
  genera el SVG obligatorio; (b) en cualquier otra carpeta donde Bernardo esté
  trabajando → produce la guía con el mismo estilo y ofrece el SVG. El skill lleva
  embebida toda la convención, por lo que también puede emitir un PROMPT PORTÁTIL
  (ver `assets/PROMPT-TEMPLATE.md`) para copiar y pegar en cualquier sesión de Claude.

  Distinto de text-to-diagram (parte de prosa y solo hace SVG) y de
  code-diagram-explainer (parte de código). Este parte de un tema/notas y produce
  el par .md + .svg de una guía.
license: Proprietary — Bernardo Ronquillo Japón
---

# md-guide-builder

Convierte un tema o unas notas crudas en una **guía práctica**: el par `.md` + `.svg`
en el estilo de la casa. Pensado para usarse **dentro de este repo** (categoría
`guides/`) o **en cualquier carpeta** donde Bernardo trabaje localmente.

---

## 1 · Detectar el modo

| Señal | Modo | Comportamiento |
|---|---|---|
| El working dir es **este repo** (`core-human-knowledge`) o tiene una carpeta `guides/` con ficheros `NN-TIPO-…md` | **In-repo** | Numerar, colocar en `guides/`, **SVG obligatorio**, conservar crudo en `raw/` |
| Cualquier otra carpeta | **Anywhere** | Producir `.md` con el mismo estilo en el dir actual (o el que pida); **ofrecer** el SVG, no imponerlo |
| Bernardo pide "dame la plantilla" / "el prompt para usar fuera" | **Template** | Emitir el contenido de `assets/PROMPT-TEMPLATE.md` |

Si el tipo de guía es ambiguo, pregunta una sola cosa: **¿cheatsheet, tutorial,
procedimiento o referencia?** El resto procédelo sin pedir confirmación.

---

## 2 · Nombrar el fichero

`NN-TIPO-tema-en-kebab.md`

- **`NN`** — solo en modo **in-repo**: el siguiente consecutivo (dos dígitos, cero a
  la izquierda) inspeccionando `guides/`. **No reutilices números** (es un id
  histórico). En modo *anywhere* omite el `NN` salvo que la carpeta ya numere.
- **`TIPO`** en MAYÚSCULAS según el género:
  - `CHEATSHEET` — referencia rápida de comandos/reglas para consulta.
  - `TUTORIAL` — paso a paso para aprender a hacer algo de cero.
  - `PROCEDIMIENTO` — secuencia operativa repetible (runbook).
  - `REFERENCIA` — material de consulta exhaustivo, no lineal.
- **`tema-en-kebab`** — minúsculas, guiones, sin acentos.

Ejemplos vivos: `guides/01-CHEATSHEET-git-PR-vs-merge.md`, `guides/02-TUTORIAL-git-worktree.md`.

---

## 3 · Estructura del Markdown

Replica el esqueleto de las guías existentes (no lo inventes):

```markdown
# TIPO · Título descriptivo (con `código` si aplica)

> **Idea rectora: <la frase que lo resume todo>.**
> - matiz 1
> - matiz 2
> - matiz 3

---

## Sección 1 · <nombre>
**Qué es:** una frase.
**Reglas que aprendimos:**
- **Regla en negrita.** Explicación.
**Comandos:**
​```bash
comando ...        # comentario alineado
​```

---

## Sección 2 · <nombre>
…

---

## Tabla resumen — qué hace cada cosa
| Acción | ¿efecto A? | ¿efecto B? |
|---|:--:|:--:|
| … | **sí** | no |

---

## (opcional) Ejemplo real / Lo que pasó en esta sesión
> Moraleja: <transferible>.

---

*Referencia derivada de <origen> · AAAA-MM-DD.*
```

Reglas de redacción:
- **Idea rectora** obligatoria como blockquote tras el título. Es el ancla del SVG.
- Negrita para el concepto, prosa breve para el porqué. Comandos en bloque ` ```bash `
  con comentarios alineados.
- Cierra con un **footer en cursiva**: origen + fecha (usa la fecha de hoy del entorno).
- Idioma: español, registro directo, segunda persona ("sitúate", "fusiona").

---

## 4 · El SVG autoexplicativo (paleta COIIAOC · tipografía V2)

Obligatorio in-repo, opcional anywhere. Mismo basename que el `.md`.
**Fuente canónica de la paleta:** [`assets/paleta_curso_V2.html`](assets/paleta_curso_V2.html)
— ábrela para ver swatches, roles y HEX exactos (colores idénticos a v1.1; tipografía
de sistema Segoe UI / Consolas, sin dependencia de Google Fonts).
**Referencias vivas que debes replicar:** `guides/01-CHEATSHEET-git-PR-vs-merge.svg`
y `guides/02-TUTORIAL-git-worktree.svg`. Léelas antes de dibujar.

**Lienzo:** `width="1200"`, alto ~620–640, fondo `#F5F2EC`.
**Cabecera:** banda navy `#1E3A5F` (alto 58) + barra naranja `#FF8C3B` (6 px) a la
izquierda; título blanco bold ~16 px centrado; subtítulo `#9AB0C8` ~10.5 px con la idea rectora.

**Tokens de paleta:**

| Uso | Color |
|---|---|
| navy estructura / hub / texto fuerte | `#1E3A5F` |
| acento naranja (cabecera) | `#FF8C3B` |
| naranja acción / "propio" | `#C2510A` (oscuro `#7C2D12`) |
| verde integración / "compartido" | `#0D7C5A` (oscuro `#0A5C43`) |
| azul secundario | `#2E6B9E` |
| gris pizarra (flechas, labels) | `#6B6B6B` · `#9B9B9B` |
| subtítulo sobre navy | `#9AB0C8` |
| rojo aviso | `#B91C1C` |
| borde suave · panel claro | `#E8E3D8` · `#FAFAF7` |

**Tipografía:** texto `'Segoe UI', Arial, sans-serif`; mono `Consolas, 'Courier New', monospace`.
Clases reutilizables en `<style>`: `.role .bt .sub .cmd .lbl .mono .bul`.

**Defs base** (cópialas tal cual): markers de flecha `aSlate`/`aMute` y filtro de sombra `sh`:
```xml
<marker id="aSlate" markerWidth="10" markerHeight="8" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#6B6B6B"/></marker>
<filter id="sh" x="-6%" y="-6%" width="112%" height="118%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.08)"/></filter>
```

**Anatomía del cuerpo (arriba → abajo):**
1. **Diagrama central** = la idea rectora hecha visual (cajas + flechas con `<marker>` y sombra `sh`).
2. **Paneles / tabla** que desarrollan la comparación clave (color de borde por tema).
3. **Chips de reglas numeradas** (`①②③`), borde del color del tema, frase corta.
4. **Chuleta** de comandos en `.mono` dentro de panel claro `#FAFAF7`.
5. **Leyenda** de colores (cuadraditos + etiqueta).
6. **Footer** en cursiva gris `#9B9B9B` ~9.5 px: `tema · contexto · paleta COIIAOC (tipografía V2) · fecha`.

**Regla de oro:** el SVG debe **leerse solo**. Si hace falta abrir el `.md` para
entenderlo, le falta información al diagrama.

---

## 5 · Procedimiento

1. **Leer el material crudo completo** (notas, sesión, tema). No trabajes desde un resumen.
2. **Detectar el modo** (§1) y, si hace falta, preguntar solo el TIPO.
3. **Redactar el `.md`** con la estructura de §3.
4. **In-repo:** numerar (§2), colocar en `guides/`, y conservar el original sin tocar
   en `raw/` (si vino de ahí). **Anywhere:** escribir en el dir actual o el indicado.
5. **Generar el SVG** (§4) — obligatorio in-repo, ofrecido anywhere.
6. **Reportar** ruta(s) creada(s) y, si in-repo, recordar que el número `NN` queda fijado.

---

## 6 · Plantilla portátil

Para usar el estilo **fuera de este repo** sin cargar el skill, el prompt
autosuficiente vive en [`assets/PROMPT-TEMPLATE.md`](assets/PROMPT-TEMPLATE.md).
Cuando Bernardo pida "la plantilla" o "el prompt para usar en otro sitio", emítelo
tal cual (lleva embebidas todas las convenciones de §3 y §4).
