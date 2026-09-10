# core-human-knowledge — instrucciones del repositorio para agentes (Antigravity)

Base de conocimiento práctico que Bernardo delega en agentes de IA (Antigravity, Claude Code, etc.) y que **no debe olvidarse** (ver [README.md](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/README.md)). El conocimiento se organiza en **categorías**: una carpeta por categoría. `guides/` es la categoría activa principal; se integran progresivamente `processes/` y `sessions/` (ver §Otras categorías).

---

## 1. Entorno de ejecución y convenciones del agente

- **Plataforma:** Google Antigravity (CLI / IDE / desktop).
- **Sistema Operativo y Shell:** Windows / PowerShell.
- **Herramientas del agente:**
  - Emplea herramientas nativas del agente (`view_file`, `write_to_file`, `replace_file_content`, `run_command`).
  - No ejecutes comandos interactivos `cd`; utiliza rutas absolutas o relativas al directorio raíz del workspace.
  - Enlaces a ficheros en Markdown: formato clickable con esquema `file:///` y barras inclinadas `/` (ej. `[README.md](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/README.md)` o rutas relativas).
- **Codificación:** Todos los ficheros generados (`.md`, `.svg`) deben escribirse en **UTF-8** sin BOM.
- **Enrutamiento de skills locales:** Las skills de autoría y materiales residen en `.claude/skills/` y las skills de SpecKit residen en `.agents/skills/`. El agente consulta directamente ambas ubicaciones sin duplicar ficheros innecesariamente.

---

## 2. Modelo general (común a todas las categorías)

- **`raw/` = bandeja de entrada.** Cuando Bernardo «deja caer» un fichero, normalmente aparece en `raw/` (o en la raíz del repo). Es el material **crudo, sin procesar**.
- **Carpetas de categoría = salida curada.** Cada categoría transforma el material crudo a su **formato canónico**.
- **Invariante crítica de seguridad:** Conserva siempre el original en `raw/` como fuente intacta; **NUNCA lo borres ni lo sobreescribas**.
- **Numeración estable y consecutiva.** En las categorías que numeran (como `guides/`), el prefijo `NN-` (dos dígitos: `01`, `02`, `03`...) es **consecutivo** y **no se reutiliza**: es un identificador histórico permanente, incluso si luego se reordena el contenido.
- **Autonomía operativa:** **Actúa sin pedir confirmación** para el procesado rutinario descrito aquí. Pregunta a Bernardo únicamente si:
  1. El material es ambiguo (no se identifica con certeza a qué categoría pertenece).
  2. Una acción solicitada es potencialmente destructiva o implica pérdida irreversible de información.

---

## 3. Categoría · `guides/` (Guías prácticas y cheatsheets)

Guías prácticas en Markdown, cada una acompañada obligatoriamente de un **diagrama SVG autoexplicativo** con el mismo basename.

### Disparador
Bernardo deja caer en `raw/` (o en la raíz del repositorio) un fichero `.md` que es una **guía práctica** (cheatsheet, tutorial, procedimiento, referencia...).

### Procedimiento de procesado paso a paso
1. **Inspecciona y numera:** Revisa los ficheros ya presentes en `guides/` y calcula el siguiente `NN` consecutivo (dos dígitos con cero a la izquierda: `01`, `02`, `03`, `04`...). No reutilices números existentes.
2. **Nombra canónicamente:** `NN-TIPO-tema-en-kebab.md`, con `TIPO` en MAYÚSCULAS según el género (`CHEATSHEET`, `TUTORIAL`, `PROCEDIMIENTO`, `REFERENCIA`...). Sigue el patrón de las existentes:
   - `01-CHEATSHEET-git-PR-vs-merge.md`
   - `02-TUTORIAL-git-worktree.md`
   - `03-TUTORIAL-git-force-with-lease.md`
3. **Coloca en `guides/`:** Guarda la versión formateada y numerada en `guides/`. Conserva intacto el original en `raw/`.
4. **Genera el SVG complementario:** Crea `NN-TIPO-tema-en-kebab.svg` en `guides/`, junto al `.md`, siguiendo estrictamente la gramática visual descrita a continuación.
5. **Actualiza el índice:** Registra la nueva guía y su diagrama en la tabla de categorías de [README.md](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/README.md).

### Gramática visual del SVG (Paleta COIIAOC · Tipografía V2)
**Referencias vivas en el repositorio:**
- [01-CHEATSHEET-git-PR-vs-merge.svg](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/guides/01-CHEATSHEET-git-PR-vs-merge.svg)
- [02-TUTORIAL-git-worktree.svg](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/guides/02-TUTORIAL-git-worktree.svg)
- [03-TUTORIAL-git-force-with-lease.svg](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/guides/03-TUTORIAL-git-force-with-lease.svg)

Replica la estructura, proporciones y estilo de estos ficheros; no inventes parámetros desde cero.

#### Lienzo y cabecera
- **Lienzo:** `width="1200"`, alto ~620–640 px, `viewBox="0 0 1200 <alto>"`. Fondo general: `#F5F2EC`.
- **Cabecera:**
  - Banda navy `#1E3A5F` a todo el ancho (alto 58 px, `y="0"`).
  - Barra de acento naranja `#FF8C3B` (6 px de ancho) en el borde izquierdo (`x="0"`, `width="6"`).
  - Título blanco bold (~16 px, font-weight 800) centrado horizontalmente.
  - Subtítulo centrado en `#9AB0C8` (~10.5 px) que sintetice la **idea rectora**.

#### Paleta de colores (Design Tokens COIIAOC)

| Token / Uso | Color HEX | Notas / Variante oscura |
| --- | --- | --- |
| Navy estructura / hub / texto fuerte | `#1E3A5F` | Encabezados, bordes principales |
| Acento naranja | `#FF8C3B` | Barra lateral izquierda de cabecera |
| Naranja acción / «propio» / ramas locales | `#C2510A` | Variante oscura: `#7C2D12` |
| Verde integración / «compartido» / remoto | `#0D7C5A` | Variante oscura: `#0A5C43` |
| Azul secundario / conectores | `#2E6B9E` | Cajas informativas, flujo alternativo |
| Gris pizarra (flechas, labels) | `#6B6B6B` · `#9B9B9B` | Texto secundario y flechas conectoras |
| Subtítulo sobre navy | `#9AB0C8` | Texto claro sobre fondo oscuro |
| Rojo aviso / advertencia / peligro | `#B91C1C` | Alertas de pérdida de datos o conflicto |
| Borde suave · panel claro | `#E8E3D8` · `#FAFAF7` | Cajas de comandos y fondos secundarios |

#### Tipografía y estilos
- **Fuente de texto:** `'Segoe UI', Arial, sans-serif`.
- **Fuente monospace:** `Consolas, 'Courier New', monospace`.
- Incluir bloque `<style>` con clases reutilizables: `.role`, `.bt`, `.sub`, `.cmd`, `.lbl`, `.mono`.
- Utilizar definiciones `<defs>` para marcadores de flecha (`<marker id="arrow"...>`) y filtros de sombra suave (`<filter id="sh"...>`).

#### Anatomía del cuerpo (de arriba abajo)
1. **Diagrama central:** Representación visual de la idea rectora mediante cajas conectadas con flechas y sombras.
2. **Paneles comparativos / tabla:** Desarrollan la distinción clave (ej. comparten vs. propio, local vs. remoto, opción A vs. B) con bordes codificados por color.
3. **Chips de reglas numeradas (`①②③`):** Cajas breves con borde del color temático y una frase directiva contundente.
4. **Chuleta de comandos:** Bloque en fuente `mono` sobre fondo `#FAFAF7` con borde `#E8E3D8` con los comandos listos para copiar.
5. **Leyenda:** Muestras de color cuadradas con etiquetas identificativas.
6. **Footer:** Texto en cursiva `#9B9B9B` (~9.5 px): `tema · contexto · paleta COIIAOC (tipografía V2) · fecha`.

**Regla de oro del SVG:** El diagrama debe **leerse y entenderse solo**. Si es indispensable abrir el `.md` para comprenderlo, al SVG le falta información estructural.

---

## 4. Otras categorías del repositorio

### `processes/` — Procesos de creación de materiales (COIIAOC)
- Documentación de flujos de trabajo importados del agente de creación de contenidos (`processes/coiiaoc-materials/`).
- Cada proceso reside en su propia carpeta con un `PROCESO.md` canónico y sus diagramas en `svg/`:
  - `proceso-codigo/`: explicación didáctica de código.
  - `proceso-diagramas/`: flujos y gramática para diagramación.
  - `proceso-documentos/`: generación de documentos DOCX/PDF.
  - `proceso-slides/`: pipelines de presentaciones PPTX y HTML.
  - `MATERIALES-PROCESOS/`: mapa integrador de procesos y skills.

### `sessions/` — Logs de sesión y contexto
- Registro cronológico de interacciones (turnos prompt → respuesta) para trazabilidad del trabajo realizado.

### Próximas categorías
- Cada nueva categoría se documentará en este fichero (`AGENTS.md`) definiendo su disparador, formato canónico y procedimiento de procesado, antes de registrarla en `README.md`.

---

## 5. Criterios de aceptación (Definition of Done)

Para considerar completado un encargo sobre el repositorio:
1. El fichero procesado reside en su carpeta canónica con la nomenclatura exacta (`NN-TIPO-tema-en-kebab.md`).
2. Si es una guía, el diagrama SVG complementario existe, es autocontenido y cumple al 100% la paleta COIIAOC y tipografía V2.
3. El fichero original en `raw/` permanece intacto.
4. Si se añade una nueva guía o categoría, el índice de [README.md](file:///C:/Users/brjap/Documents/__CODE_gpu/(core-human-knowledge/README.md) queda actualizado y sincronizado.
