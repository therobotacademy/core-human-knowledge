# Plantilla de prompt — Guía MD (estilo casa)

Copia el bloque de abajo en cualquier sesión de Claude (cualquier carpeta, cualquier
proyecto), rellena los `«campos»` y bórralo lo que no apliques. Lleva embebida toda la
convención de las guías de `core-human-knowledge`, así que funciona sin tener el repo
delante.

> Atajo: si solo quieres el `.md` y no el diagrama, borra el bloque **B (SVG)**.
>
> Fuente canónica de la paleta (solo si trabajas **dentro del repo**, donde el fichero
> existe): [`paleta_curso_V2.html`](paleta_curso_V2.html) — swatches, roles y HEX exactos
> (está junto a esta plantilla en `assets/`). Fuera del repo, los tokens ya van embebidos
> en el bloque B, así que no hace falta.

---

```text
Actúa como redactor de guías prácticas. Quiero una GUÍA en mi estilo de casa.

TEMA: «de qué trata la guía»
TIPO: «CHEATSHEET | TUTORIAL | PROCEDIMIENTO | REFERENCIA»
MATERIAL DE PARTIDA: «pega aquí notas, transcripción de la sesión, comandos, o
                      describe el tema; si no hay material, infiérelo del contexto»
SALIDA: «carpeta/fichero destino — por defecto el directorio actual»
NOMBRE: NN-TIPO-tema-en-kebab.md
        (usa NN consecutivo de dos dígitos SOLO si la carpeta destino ya numera guías;
         si no, omite el NN. tema-en-kebab = minúsculas, guiones, sin acentos)

=== A · MARKDOWN (obligatorio) ===
Estructura exacta a replicar:

  # TIPO · Título descriptivo (con `código` si aplica)

  > **Idea rectora: <la frase que lo resume todo>.**
  > - matiz 1
  > - matiz 2
  > - matiz 3

  ---

  ## Sección 1 · <nombre>
  **Qué es:** una frase.
  **Reglas que aprendimos:**
  - **Regla en negrita.** Explicación breve.
  **Comandos:**
  ```bash
  comando ...        # comentario alineado
  ```

  ## Sección 2 · <nombre>
  …

  ## Tabla resumen — qué hace cada cosa
  | Acción | ¿efecto A? | ¿efecto B? |
  |---|:--:|:--:|
  | … | **sí** | no |

  ## (opcional) Ejemplo real
  > Moraleja: <lo transferible>.

  *Referencia derivada de <origen> · AAAA-MM-DD.*   ← usa la fecha de hoy

Reglas de redacción:
- La "idea rectora" como blockquote justo tras el título es OBLIGATORIA: es el ancla.
- Negrita para el concepto, prosa breve para el porqué. Comandos en bloque ```bash```
  con comentarios alineados.
- Español, registro directo, segunda persona ("sitúate", "fusiona").
- Cierra con footer en cursiva: origen + fecha de hoy.

=== B · SVG autoexplicativo (mismo basename .svg; bórralo si no lo quieres) ===
Un diagrama que se LEA SOLO (si hay que abrir el .md para entenderlo, le falta info).

Lienzo: width="1200", alto ~620–640, fondo #F5F2EC.
Cabecera: banda navy #1E3A5F (alto 58) + barra naranja #FF8C3B (6px) a la izquierda;
          título blanco bold ~16px centrado; subtítulo #9AB0C8 ~10.5px = la idea rectora.

Paleta (tokens):
  navy estructura/texto fuerte  #1E3A5F      acento cabecera     #FF8C3B
  naranja acción / "propio"     #C2510A (oscuro #7C2D12)
  verde integración/"compartido"#0D7C5A (oscuro #0A5C43)
  azul secundario               #2E6B9E      gris flechas/labels #6B6B6B · #9B9B9B
  subtítulo sobre navy          #9AB0C8      rojo aviso          #B91C1C
  borde suave #E8E3D8 · panel claro #FAFAF7

Tipografía: texto 'Segoe UI', Arial, sans-serif; mono Consolas, 'Courier New', monospace.
Clases en <style>: .role .bt .sub .cmd .lbl .mono .bul

Defs base (cópialas tal cual):
  <marker id="aSlate" markerWidth="10" markerHeight="8" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#6B6B6B"/></marker>
  <filter id="sh" x="-6%" y="-6%" width="112%" height="118%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.08)"/></filter>

Anatomía del cuerpo (arriba → abajo):
  1. Diagrama central = la idea rectora hecha visual (cajas + flechas con marker y sombra sh).
  2. Paneles / tabla con la comparación clave (color de borde por tema).
  3. Chips de reglas numeradas ①②③ (borde del color del tema, frase corta).
  4. Chuleta de comandos en .mono dentro de panel claro #FAFAF7.
  5. Leyenda de colores (cuadraditos + etiqueta).
  6. Footer en cursiva gris #9B9B9B ~9.5px: tema · contexto · paleta COIIAOC (tipografía V2) · fecha.

=== ENTREGA ===
1. Escribe el/los fichero(s) en SALIDA.
2. Dime la ruta de cada uno.
3. No me pidas confirmación para el procesado rutinario; pregunta solo si el TIPO es
   ambiguo o si vas a sobrescribir algo que yo no creé.
```

---

*Plantilla derivada de la categoría `guides/` de core-human-knowledge · paleta COIIAOC (tipografía V2).*
