# Superpowers for Antigravity

Si usas SpecKit, enlaza con esta parte del manual: [superpowers-guide.com/en/tdd](https://superpowers-guide.com/en/tdd)

- Una completa guía [Spec Kit vs. Superpowers ⚡ — A Comprehensive Comparison &amp; Practical Guide to Combining Both](https://dev.to/truongpx396/spec-kit-vs-superpowers-a-comprehensive-comparison-practical-guide-to-combining-both-52jj)

> [!NOTA] Nota
> En este caso omite `./speckit-implement`para utilizar los skills de Superpowers en la implementación

## Método 1: Instalación nativa (Recomendado para Antigravity 2.0)

Si estás utilizando la versión más reciente del IDE, puedes clonar directamente el repositorio oficial adaptado en el directorio de plugins de tu configuración global de Gemini: [1]

git clone https://github.com/roundpilot/superpowers-antigravity ~/.gemini/config/plugins/superpowers

Al hacer esto, Antigravity ejecutará automáticamente el plugin al iniciar la sesión y los superpoderes estarán listos desde tu primer mensaje. [3]

## Método 2: Instalación global mediante paquetes o CLI

Si deseas instalar las habilidades a nivel global para que estén disponibles en todos tus proyectos dentro del ecosistema de Antigravity, utiliza las siguientes alternativas en tu terminal:

* Usando npx: `npx skills add obra/superpowers -A "claude, agy, etc."`
* Usando el gestor de paquetes de Python (uv) si vienes desde la interfaz CLI. Primero asegúrate de tener configurado tu entorno y despliega el instalador:

```
uvx google-agents-cli setup
```

Nota: Si las habilidades se guardan por defecto en ~/.agents/skills, muévelas manualmente a ~/.gemini/antigravity-cli/skills para que el CLI global de Antigravity las reconozca.

---

## Método 3: Configuración manual por Proyecto (Workspace Scope)

Si solo quieres dotar de estos "superpoderes" a un proyecto específico en el que estás trabajando:

1. Descarga los archivos: Ve al repositorio de GitHub de obra/superpowers y descarga la carpeta skills que contiene los archivos Markdown (como brainstorming.md o test_driven_development.md).
2. Copia los archivos: Pega estos archivos Markdown dentro de la carpeta local de tu proyecto en la ruta <tu-proyecto></tu>/.agent/skills/.
3. Activación: Abre el chat del agente dentro de Antigravity en ese proyecto e invoca el superpoder de forma natural (ej. "Usemos el superpoder de TDD para solucionar este error" o "Por favor, sigue el protocolo de brainstorming")
