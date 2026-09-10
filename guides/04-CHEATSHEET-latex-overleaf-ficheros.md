# Cheatsheet · LaTeX y Overleaf: mapa de ficheros, compilación y Git

> Guía de referencia rápida para identificar los ficheros de un documento LaTeX/Overleaf: qué se edita, qué se genera solo, cómo funciona el ciclo de compilación de 3 pasadas y qué versionar en Git.

---

## Idea rectora

**LaTeX** es un lenguaje de composición: texto + comandos en un `.tex` que un compilador convierte en `.pdf`. **Overleaf** es su entorno en navegador que compila automáticamente en segundo plano. En Git y en el flujo de trabajo: **versiona y sube únicamente las fuentes (`.tex`, `.bib`, figuras); ignora siempre los ficheros intermedios (`.aux`, `.log`, `.bbl`...)**.

---

## 1. Mapa de ficheros: fuente vs. intermedios

### Ficheros que SÍ importan (fuente + resultado)

| Fichero | Qué es | ¿Se edita? | ¿Se sube a Overleaf? | ¿En Git? |
|---|---|---|---|---|
| `main.tex` | **El documento/paper:** Texto y comandos. | ✅ Sí (o se genera de `.md`) | ✅ Sí (indispensable) | ✅ Sí |
| `references.bib` | **Bibliografía:** Entradas BibTeX por cita. | ✅ Sí (al añadir citas) | ✅ Sí | ✅ Sí |
| `template.tex` / `.cls` / `.sty` | **Plantilla / estilo:** Preámbulo y macros. | ⚠️ Rara vez | ✅ Sí | ✅ Sí |
| `figures/` | **Activos visuales:** Imágenes, gráficas. | ⚠️ Al actualizar figuras | ✅ Sí | ✅ Sí |
| `main.pdf` | **Resultado final:** Documento generado. | ❌ No (se autogenera) | ❌ No (Overleaf lo crea) | ⚠️ Opcional |

### Ficheros intermedios (generados automáticamente — NO tocar)

| Extensión | Nombre | Función en el compilador |
|---|---|---|
| `.aux` | **Auxiliar** | Almacena etiquetas (`\label`), números de tabla/figura y citas entre pasadas de compilación. |
| `.log` | **Registro** | Transcripción de avisos, warnings y errores de compilación (`undefined control sequence`, etc.). |
| `.out` | **Bookmarks** | Hipervínculos e índice de navegación generado por el paquete `hyperref`. |
| `.bbl` | **Bibliografía formateada** | Puente generado por BibTeX a partir de `references.bib` y `.aux` listo para incrustar. |
| `.blg` | **Log de BibTeX** | Errores y diagnósticos específicos de procesamiento bibliográfico. |
| `.toc` / `.lot` / `.lof` | **Sumarios** | Tablas de contenido, listas de tablas y listas de figuras. |

---

## 2. El ciclo de compilación: por qué se compila 3 veces (+ bibtex)

Cuando compilas en local, las referencias cruzadas y la bibliografía no pueden resolverse en una sola pasada:

```
[1ª Pasada: pdflatex] ─▶ Escribe .aux (etiquetas/citas como '??')
         │
         ▼
[2ª Pasada: bibtex]   ─▶ Lee .aux + references.bib ─▶ Genera .bbl
         │
         ▼
[3ª Pasada: pdflatex] ─▶ Incrusta .bbl y resuelve referencias cruzadas
         │
         ▼
[4ª Pasada: pdflatex] ─▶ Cuadra numeración definitiva y saltos de página ─▶ PDF final
```

> **En Overleaf:** Todo este ciclo ocurre de forma automática al pulsar *Recompile*. Los ficheros `.aux`, `.bbl` y `.log` se generan en servidores internos y permanecen ocultos.

---

## 3. Reglas de oro numeradas

1. **① Versiona la fuente pura:** En Git solo viven `.tex`, `.bib`, estilos (`.sty`/`.cls`) y la carpeta de figuras.
2. **② El `.aux` es el árbitro:** Si una referencia (`\ref`) o cita (`\cite`) aparece rota con `??`, el problema está en la sincronización del `.aux` o en la falta de una pasada de compilación.
3. **③ Overleaf solo necesita insumos:** No exportes ni subas ficheros auxiliares a Overleaf; deja que el motor de Overleaf los regenere limpios en cada build.

---

## 4. Chuleta `.gitignore` recomendada

Añade este bloque al `.gitignore` en la raíz del documento:

```gitignore
# LaTeX - Ficheros intermedios generados (nunca versionar)
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
