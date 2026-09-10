# LaTeX y Overleaf — guía mínima de ficheros

> Para alguien nuevo en LaTeX/Overleaf. Qué es cada fichero del paper, cuáles se editan, cuáles se generan solos, y qué versionar en git.

## En una frase

**LaTeX** es un lenguaje para componer documentos: escribes texto + comandos en un fichero `.tex` y un "compilador" (`pdflatex`) lo convierte en un `.pdf`. **Overleaf** es un editor LaTeX en el navegador que compila por ti automáticamente (no tienes que instalar nada ni ejecutar comandos).

## Los ficheros que SÍ importan (fuente + resultado)

| Fichero | Qué es | ¿Editar? | ¿Versionar en git? |
|---------|--------|----------|--------------------|
| `main-v2.4.tex` | **El paper.** Texto + comandos LaTeX. La fuente real. | Sí (o, en nuestro flujo, se genera desde `main-v2.4.md`) | ✅ Sí |
| `references.bib` | **La bibliografía**, en formato BibTeX (una entrada por cita). | Sí (al añadir una cita) | ✅ Sí |
| `template-v2.tex` | Plantilla con el "preámbulo" (paquetes, formato). | Rara vez | ✅ Sí |
| `main-v2.4.pdf` | **El resultado** que se lee/comparte. | No (se genera) | ⚠️ Opcional (es regenerable; útil tenerlo para compartir) |

> En nuestro proyecto el `.tex` se **genera** desde el Markdown (`main-v2.4.md`) con el pipeline `latex-md-roundtrip`. Aun así, el `.tex` es lo que sube a Overleaf.

## Los ficheros intermedios (los genera el compilador — no tocar)

Cuando compilas, LaTeX crea ficheros auxiliares de trabajo. **No se editan a mano y normalmente NO se versionan** (son basura regenerable, como los `.pyc` de Python o un `build/`).

| Extensión | Qué guarda | Por qué existe |
|-----------|-----------|----------------|
| `.aux` | **Auxiliar**: referencias cruzadas, etiquetas (`\label`), números de tabla/figura, claves de cita. | Es la "memoria" entre pasadas: en la 1ª pasada LaTeX no sabe aún que la "Tabla 5" es la 5; lo apunta aquí y lo resuelve en la 2ª. *(Es justo el fichero que miramos para verificar que `tab:tab5` → 5.)* |
| `.log` | **Registro** completo de la compilación: avisos y errores. | Donde se mira si algo falla ("undefined reference", "missing citation", error de sintaxis). |
| `.out` | Destinos de los hipervínculos (lo crea el paquete `hyperref`). | Para que los enlaces internos del PDF (índice, citas) salten al sitio correcto. |
| `.bbl` | La **bibliografía ya formateada** que produce BibTeX a partir del `.bib`. | LaTeX la inserta en el PDF; es el "puente" entre `references.bib` y el documento. |
| `.blg` | El **log de BibTeX** (avisos al procesar las citas). | Para diagnosticar problemas de bibliografía. |
| (otros) `.toc`, `.lot`, `.lof`, `.synctex.gz` | Índice, lista de tablas/figuras, sincronización editor↔PDF. | Generados según el documento. |

## Por qué se compila 3 veces (+ bibtex)

El flujo típico es: `pdflatex → bibtex → pdflatex → pdflatex`.

1. **`pdflatex` (1ª):** escribe el `.aux` con etiquetas y citas, pero las referencias aún salen como `??`.
2. **`bibtex`:** lee el `.aux` + `references.bib` y genera el `.bbl` (bibliografía formateada).
3. **`pdflatex` (2ª):** inserta la bibliografía y resuelve la mayoría de referencias.
4. **`pdflatex` (3ª):** cuadra los últimos números (referencias que cambiaron de página al crecer el texto).

> **En Overleaf no haces nada de esto:** pulsas *Recompile* y Overleaf ejecuta las pasadas necesarias. Los intermedios existen igual, pero quedan ocultos y los gestiona él.

## Qué subir a Overleaf

Solo la **fuente**: `main-v2.4.tex` + `references.bib` (+ figuras si las hubiera, p. ej. una carpeta `figures/`). Overleaf genera el PDF y todos los intermedios por su cuenta.

## Qué versionar en git

**Versiona la fuente, ignora los intermedios.** Bloque recomendado para un `.gitignore` en la carpeta del paper:

```gitignore
# Intermedios de LaTeX (regenerables — no versionar)
*.aux
*.log
*.out
*.bbl
*.blg
*.toc
*.lot
*.lof
*.synctex.gz
*.fls
*.fdb_latexmk
```

Lo que **sí** se versiona: `*.tex`, `*.bib`, plantillas, figuras y (opcionalmente) el `*.pdf` final si quieres conservar el entregable.

## Glosario exprés

- **Preámbulo:** la parte del `.tex` antes de `\begin{document}`; carga paquetes y fija el formato.
- **`\label{}` / `\ref{}`:** etiquetas y referencias cruzadas (numeración automática de tablas, figuras, secciones). Se resuelven vía el `.aux`.
- **`\cite{}` / `\citep{}`:** citas a entradas de `references.bib`.
- **BibTeX:** la herramienta que convierte `references.bib` + `.aux` en la bibliografía (`.bbl`).
