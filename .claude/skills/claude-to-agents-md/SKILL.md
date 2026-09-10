---
name: claude-to-agents-md
description: >
  Migra, adapta y sincroniza las instrucciones de un proyecto desde `CLAUDE.md` hacia
  un `AGENTS.md` canónico y plenamente compatible con el esquema, entorno y reglas de
  Google Antigravity y ecosistemas multi-agente.

  Actívalo cuando el usuario diga "/claude-to-agents-md", "migra CLAUDE.md a AGENTS.md",
  "adapta las instrucciones a Antigravity", "convierte CLAUDE.md para agentes", o cuando
  se inicialice un repositorio existente en Antigravity conservando su configuración previa de Claude Code.
license: Proprietary — Bernardo Ronquillo Japón
---

# claude-to-agents-md

Skill para transformar un archivo de instrucciones específico de Claude Code (`CLAUDE.md`) en un archivo **`AGENTS.md`** optimizado para **Google Antigravity** (CLI, IDE y versión desktop) y agentes autónomos estándar, preservando las directivas del proyecto y añadiendo rigor operativo.

---

## 1. Principios de la migración

1. **Sin roturas de compatibilidad:** `CLAUDE.md` se mantiene intacto; `AGENTS.md` se genera como fuente de verdad para Antigravity y otros agentes.
2. **Reutilización de skills locales:** Se evita duplicar `.claude/skills/` en `.agents/`; se instruye explícitamente al agente para enrutar la búsqueda a `.claude/skills/`.
3. **Adaptación de entorno y herramientas:** Se reemplazan supuestos de Claude Code por convenciones nativas de Antigravity (herramientas nativas, shell del sistema operativo, enlaces `file:///`).
4. **Formalización de invariantes y DoD:** Se explicitan los límites de autonomía y los criterios de aceptación (*Definition of Done*).

---

## 2. Proceso paso a paso de migración

### Paso 1: Auditoría del `CLAUDE.md` original
Lee el `CLAUDE.md` del repositorio y extrae:
- Rol del agente y relación de delegación con el usuario.
- Modelo de carpetas (bandejas de entrada, carpetas de salida curada).
- Convenciones de nombrado de archivos y versionado/numeración (`NN-`).
- Reglas de estilo, diseño o gramática visual (tokens de color, tipografía, estructura de diagramas).
- Flujos de trabajo y categorías documentadas.

### Paso 2: Análisis del entorno de ejecución
Detecta el entorno operativo del proyecto:
- **Sistema Operativo y Shell:** Windows / PowerShell (o Linux / Bash).
- **Herramientas nativas disponibles:** `view_file`, `write_to_file`, `replace_file_content`, `run_command`, `ask_question`.
- **Rutas de skills:** Localizar si existen skills en `.claude/skills/` para enrutar el agente allí en lugar de forzar `.agents/skills/`.

### Paso 3: Redacción del `AGENTS.md` canónico
Escribe `AGENTS.md` en la raíz del repositorio respetando la siguiente estructura de 5 secciones:

```markdown
# [Nombre del proyecto] — instrucciones del repositorio para agentes (Antigravity)

[Propósito del repositorio, rol del agente y referencia al README.md principal].

---

## 1. Entorno de ejecución y convenciones del agente
- **Plataforma:** Google Antigravity (CLI / IDE / desktop) y agentes compatibles.
- **Sistema Operativo y Shell:** [Windows / PowerShell o Linux / Bash].
- **Herramientas del agente:**
  - Uso exclusivo de herramientas nativas (`view_file`, `write_to_file`, `replace_file_content`, `run_command`).
  - Prohibición de comandos interactivos `cd` (usar rutas absolutas o relativas al root).
  - Enlaces en Markdown: esquema clickable `file:///` con barras normales `/`.
- **Codificación:** UTF-8 sin BOM en todos los ficheros generados.
- **Enrutamiento de skills locales:** Las skills del repositorio residen en `.claude/skills/`. El agente debe consultarlas y ejecutarlas directamente desde allí sin duplicar en `.agents/`.

---

## 2. Modelo general e invariantes del repositorio
- **Bandejas de entrada vs. Salida curada:** Definir claramente carpetas de origen (ej. `raw/`) y destino.
- **Invariante crítica de seguridad:** Protección absoluta del material original (prohibido borrar o sobreescribir fuentes crudas).
- **Numeración y versionado:** Regla de identificadores estables y consecutivos (`NN-`).
- **Autonomía operativa:** Actuar sin pedir confirmación para tareas rutinarias; detenerse y preguntar únicamente ante ambigüedad de categoría o acciones destructivas/irreversibles.

---

## 3. Categorías principales y procedimientos paso a paso
Para cada categoría del repositorio:
- **Disparador:** Qué evento o archivo inicia el trabajo.
- **Procedimiento:** Pasos exactos de numeración, nombrado canónico y generación.
- **Estándares asociados:** Si incluye artefactos visuales (SVG, PDF, DOCX), detallar la gramática visual exacta (dimensiones, paleta de tokens HEX, tipografía, anatomía y regla de oro: el diagrama debe ser autoexplicativo).

---

## 4. Otras categorías y estructura del workspace
- Mapeo de carpetas de procesos, transcripciones de sesiones o documentación auxiliar.
- Procedimiento para dar de alta futuras categorías.

---

## 5. Criterios de aceptación (Definition of Done)
Lista de comprobación estricta para dar una tarea por finalizada:
1. Ubicación y nombrado canónico exacto.
2. Artefactos complementarios generados y conformes a estándares.
3. Ficheros fuente intactos.
4. Índices del proyecto (`README.md`) actualizados y sincronizados.
```

### Paso 4: Validación y comprobación cruzada
1. Verificar que no se hayan omitido reglas ni tokens del `CLAUDE.md` original.
2. Comprobar que los enlaces a archivos del workspace utilicen sintaxis `file:///` clickable.
3. Verificar que `CLAUDE.md` no se haya borrado ni dañado.
