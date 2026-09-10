# Tutorial · Superpowers en Google Antigravity: instalación, activación y sinergia con Spec-Kit

> Tutorial paso a paso para desplegar e integrar las habilidades de **Superpowers** (Brainstorming, TDD, Systematic Debugging, Code Review, Subagents) en Google Antigravity (IDE, CLI y Desktop) y su combinación con Spec-Kit.

---

## Idea rectora

**Superpowers dota de rigor de ingeniería al agente:** Añade protocolos disciplinados (TDD estricto, análisis de causa raíz antes de proponer fixes, revisiones de código de dos pasadas y diseño guiado). Puede instalarse como **plugin global nativo**, mediante **paquetes CLI** o **por workspace local**. En proyectos con Spec-Kit, Superpowers asume el control en la fase de codificación (`/speckit-implement`), garantizando que cada tarea se implemente mediante ciclos Red-Green-Refactor sin atajos.

---

## 1. Métodos de instalación

### Método 1: Plugin nativo global (Recomendado para Antigravity 2.0 e IDE)

Clona el repositorio adaptado de Superpowers directamente en la carpeta de plugins globales de Gemini/Antigravity:

```bash
git clone https://github.com/roundpilot/superpowers-antigravity ~/.gemini/config/plugins/superpowers
```

- **Ventaja:** Antigravity carga automáticamente el plugin en cada sesión iniciada; todos los skills quedan disponibles desde el primer turno.

---

### Método 2: Instalación global mediante CLI / Gestor de paquetes

Si utilizas Antigravity CLI (`agy`) o quieres registrar los skills en tu perfil global:

```bash
# Opción A: Mediante npx skills
npx skills add obra/superpowers -A "claude, agy"

# Opción B: Mediante gestor Python (uv)
uvx google-agents-cli setup
```

> **Nota de compatibilidad en Windows / Antigravity CLI:** Si los skills se instalan por defecto en `~/.agents/skills`, muévelos a `~/.gemini/antigravity-cli/skills` (o regístralos en `settings.json`) para que el CLI global los descubra de inmediato.

---

### Método 3: Configuración manual por Workspace (Ámbito de proyecto)

Para proyectos aislados donde no deseas alterar la configuración global de tu máquina:

1. **Descargar los skills:** Descarga la carpeta `skills/` del repositorio de Superpowers (ej. `brainstorming`, `test-driven-development`, `systematic-debugging`...).
2. **Copiar a la carpeta local:** Colócalos en la raíz de tu proyecto dentro de:
   - `.agents/skills/<skill-name>/SKILL.md` (estándar Antigravity) o
   - `.claude/skills/<skill-name>/SKILL.md` (si tu `AGENTS.md` enruta a `.claude`).
3. **Activación contextual:** El agente cargará dinámicamente el skill por coincidencia semántica o invocación explícita.

---

## 2. Sinergia estratégica: Spec-Kit + Superpowers

Ambas metodologías no compiten, sino que se complementan en una cadena de valor perfecta:

```
[Spec-Kit: Fases 1 a 5]
constitution ─▶ spec.md ─▶ plan.md ─▶ tasks.md ─▶ analyze
                                                    │
                 ┌──────────────────────────────────┘
                 ▼
      [Omitir /speckit-implement]
                 │
                 ▼
[Superpowers: Fase de Ejecución]
  1. using-git-worktrees       (Aislamiento de workspace)
  2. subagent-driven-dev       (Orquestador de tareas)
  3. test-driven-development   (Ciclo TDD: Red ➔ Green ➔ Refactor)
  4. requesting-code-review    (Revisión estricta de código)
```

> **Regla de oro de integración:** En proyectos que empleen Spec-Kit, tras validar `/speckit-analyze`, **omite** `/speckit-implement` y pide al agente ejecutar las tareas de `tasks.md` utilizando el skill `test-driven-development` y subagentes de Superpowers.

---

## 3. Catálogo de Superpoderes clave y cómo invocarlos

| Superpoder | Cuándo se dispara / Prompt | Efecto disciplinado |
|---|---|---|
| **`brainstorming`** | *"Vamos a diseñar...", "Explora opciones para..."* | Explora alternativas y requisitos antes de redactar código o planes. |
| **`test-driven-development`** | *"Implementa la tarea X con TDD"* | Obliga a escribir el test primero, verle fallar y luego escribir el mínimo código. |
| **`systematic-debugging`** | *"Tenemos este bug/error..."* | Prohíbe soluciones a ciegas; exige aislar la causa raíz con hipótesis verificables. |
| **`requesting-code-review`** | *"Revisa este commit/diff"* | Auditoría de dos pasadas: análisis estático y adherencia a requisitos. |
| **`using-git-worktrees`** | *"Arranca una nueva rama/feature"* | Crea un worktree aislado para no ensuciar la copia principal de trabajo. |

---

## 4. Reglas de oro numeradas

1. **① TDD estricto:** Jamás se genera código productivo sin su test previo que falle por la razón esperada.
2. **② Depuración con causa raíz:** Si un test o comando falla, el agente debe formular hipótesis y comprobarlas con logs antes de editar código.
3. **③ Despliegue en capas:** Usa el plugin global `~/.gemini/config/plugins/superpowers` para tus proyectos diarios y el scope de proyecto (`.agents/skills`) cuando requieras versiones personalizadas.
