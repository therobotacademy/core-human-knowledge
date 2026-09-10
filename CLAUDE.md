# core-human-knowledge — instrucciones del repositorio

Base de conocimiento práctico que Bernardo delega habitualmente en Claude y que **no debe olvidarse** (ver `README.md`). El conocimiento se organiza en **categorías**: una carpeta por categoría. `guides/` es la **primera**; se añadirán más con el tiempo (ver §Próximas categorías).

---

## Modelo general (común a todas las categorías)

- **`raw/` = bandeja de entrada.** Cuando Bernardo «deja caer» un fichero, normalmente aparece en `raw/` (o en la raíz del repo). Es el material **crudo, sin procesar**.
- **Carpetas de categoría = salida curada.** Cada categoría transforma el material crudo a su **formato canónico**. Conserva el original en `raw/` como fuente intacta; **no lo borres**.
- **Numeración estable.** En las categorías que numeran, el prefijo `NN-` es **consecutivo** y **no se reutiliza**: es un identificador histórico, aunque luego se reordene el contenido.
- **Actúa sin pedir confirmación** para el procesado rutinario descrito aquí; pregunta solo si el material es ambiguo (no se sabe a qué categoría va) o si una acción es destructiva.

---

## Categoría · `guides/`

Guías prácticas en Markdown, cada una acompañada de un **diagrama SVG autoexplicativo** con el mismo basename.

### Disparador
Bernardo deja caer un `.md` que es una **guía práctica** (cheatsheet, tutorial, procedimiento, referencia…).

### Procesado
1. **Numera.** Calcula el siguiente `NN` consecutivo (dos dígitos, con cero a la izquierda) inspeccionando los ficheros ya presentes en `guides/`. No reutilices números.
2. **Nombra** `NN-TIPO-tema-en-kebab.md`, con `TIPO` en MAYÚSCULAS según el género: `CHEATSHEET`, `TUTORIAL`, `PROCEDIMIENTO`, `REFERENCIA`… Sigue el patrón de las existentes:
   - `01-CHEATSHEET-git-PR-vs-merge.md`
   - `02-TUTORIAL-git-worktree.md`
3. **Coloca en `guides/`** la versión numerada. Conserva el original sin tocar en `raw/`.
4. **Genera el SVG** `NN-…svg`, junto al `.md`, siguiendo la gramática visual de abajo.
5. **Actualiza el índice** de `README.md`.
6. **Regenera la app (`guides/index.html`)** ejecutando `python scripts/build_guide_browser.py`.

### Gramática visual del SVG (paleta COIIAOC · tipografía V2)
Referencia viva: `guides/01-CHEATSHEET-git-PR-vs-merge.svg` y `guides/02-TUTORIAL-git-worktree.svg`. Replica su estructura, no la inventes de cero.

**Lienzo:** `width="1200"`, alto ~620–640, `viewBox` idéntico. Fondo `#F5F2EC`.

**Cabecera:** banda navy `#1E3A5F` a todo el ancho (alto 58) + barra de acento naranja `#FF8C3B` (6 px) a la izquierda. Título blanco bold (~16 px / 800) centrado; subtítulo centrado en `#9AB0C8` (~10.5 px) con la **idea rectora**.

**Paleta (tokens):**

| Uso | Color |
| --- | --- |
| navy estructura / hub / texto fuerte | `#1E3A5F` |
| acento naranja (barra de cabecera) | `#FF8C3B` |
| naranja acción / «propio» | `#C2510A` (oscuro `#7C2D12`) |
| verde integración / «compartido» | `#0D7C5A` (oscuro `#0A5C43`) |
| azul secundario | `#2E6B9E` |
| gris pizarra (flechas, labels) | `#6B6B6B` · `#9B9B9B` |
| subtítulo sobre navy | `#9AB0C8` |
| rojo aviso | `#B91C1C` |
| borde suave · panel claro | `#E8E3D8` · `#FAFAF7` |

**Tipografía:** texto `'Segoe UI', Arial, sans-serif`; mono `Consolas, 'Courier New', monospace`. Define clases reutilizables en `<style>` (p. ej. `.role .bt .sub .cmd .lbl .mono`).

**Anatomía del cuerpo (de arriba abajo):**
1. **Diagrama central** = la idea rectora hecha visual: cajas conectadas con flechas (usa `<marker>` para las puntas y un filtro de sombra `sh`).
2. **Paneles / tabla** que desarrollan la comparación clave (p. ej. comparten vs propio, opción A vs B), con borde de color por tema.
3. **Chips de reglas numeradas** (`①②③`), cada uno con borde del color de su tema y una frase corta.
4. **Chuleta** de comandos en `mono` dentro de un panel claro `#FAFAF7`.
5. **Leyenda** de colores (cuadraditos + etiqueta).
6. **Footer** en cursiva gris `#9B9B9B` (~9.5 px): `tema · contexto · paleta COIIAOC (tipografía V2) · fecha`.

**Regla de oro:** el SVG debe **leerse solo**. Si hace falta abrir el `.md` para entenderlo, le falta información al diagrama.

---

## Próximas categorías

- `guides/` ✅ — definida arriba.
- _(pendientes — cada nueva categoría se documenta aquí con su disparador, su formato canónico y su procesado, replicando la estructura de `guides/`.)_
