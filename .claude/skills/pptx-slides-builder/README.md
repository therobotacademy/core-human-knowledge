# pptx-coiiaoc-overview · Skill para Claude Code

Skill de producción de presentaciones PPTX para el curso **"Automatización de Procesos con Agentes Inteligentes"** (COIIAOC)
de Bernardo Ronquillo Japón.

---

## Instalación en Claude Code

```bash
# 1. Descomprimir en la carpeta de skills del proyecto
unzip pptx-coiiaoc-overview.zip -d .claude/skills/

# 2. Verificar dependencias del entorno
node -e "require('pptxgenjs')" || npm install -g pptxgenjs
python3 -c "from pptx import Presentation" || pip install python-pptx --break-system-packages

# 3. El skill se activa automáticamente en Claude Code cuando
#    Claude detecta solicitudes de presentaciones COIIAOC
```

---

## Estructura

```
pptx-coiiaoc-overview/
├── SKILL.md                        ← Instrucciones y pipeline principal
├── README.md                       ← Este archivo
├── references/
│   ├── coiiaoc-tokens.md           ← Tokens de color, tipografía, coordenadas
│   └── slide-types.md              ← Plantillas PptxGenJS por tipo de slide
├── scripts/
│   ├── build_pptx.js               ← Template de script con helpers reutilizables
│   ├── build_from_guion.js         ← Motor: convierte guión JSON → PPTX
│   ├── render_and_qa.sh            ← Pipeline completo: PptxGenJS → PDF → JPGs
│   └── office/
│       └── soffice.py              ← Wrapper portable de LibreOffice
└── assets/
    ├── guion_schema.json           ← Schema JSON del guión de entrada
    └── guion_parte2_overview.json  ← Guión completo de la presentación Parte 2
```

---

## Uso típico en Claude Code

### Opción A — Reproducir la presentación existente desde el guión

```bash
# Genera el PPTX de la Parte 2 a partir del guión incluido
node .claude/skills/pptx-coiiaoc-overview/scripts/build_from_guion.js \
  .claude/skills/pptx-coiiaoc-overview/assets/guion_parte2_overview.json \
  parte2_overview

# Pipeline completo (incluye QA visual)
bash .claude/skills/pptx-coiiaoc-overview/scripts/render_and_qa.sh \
  .claude/skills/pptx-coiiaoc-overview/scripts/build_from_guion.js \
  parte2_overview
```

### Opción B — Crear una presentación nueva

1. Editar `assets/guion_schema.json` como referencia
2. Crear `assets/guion_sesionXX.json` con el guión de la sesión nueva
3. Ejecutar `build_from_guion.js` con el nuevo guión

### Opción C — Script ad-hoc para control total

Usar `scripts/build_pptx.js` como template base y editar directamente.
Todos los helpers (`addKicker`, `addH1Light`, `addCard`, `addFooter`, etc.)
están disponibles como funciones reutilizables.

---

## Pipeline de calidad obligatorio

```bash
# 1. Generar PPTX
node scripts/build_pptx.js

# 2. Re-save con python-pptx (corrige orden XML que PowerPoint exige)
python3 -c "from pptx import Presentation; p=Presentation('output.pptx'); p.save('output.pptx')"

# 3. Convertir a PDF con LibreOffice
python3 scripts/office/soffice.py --headless --convert-to pdf output.pptx

# 4. Rasterizar para inspección visual
pdftoppm -jpeg -r 150 output.pdf slide

# 5. Inspeccionar slide-NN.jpg con view() antes de entregar
```

**Por qué es obligatorio el re-save con python-pptx:**
PptxGenJS 4.0.1 coloca `notesMasterIdLst` antes de `sldSz` en `presentation.xml`,
violando el orden OOXML que PowerPoint (no LibreOffice) exige. python-pptx
corrige este orden al re-guardar.

---

## Paleta corporativa COIIAOC v1.1

| Token            | HEX         | Uso                                 |
| ---------------- | ----------- | ----------------------------------- |
| azul-institucion | `#1E3A5F` | Portadas, cabeceras                 |
| naranja-luminoso | `#FF8C3B` | KPIs sobre fondo azul (4.97:1 ✅)   |
| naranja-oscuro   | `#C2510A` | KPIs sobre blanco/crema (7.55:1 ✅) |
| crema-tecnico    | `#FAFAF7` | Fondo slides de contenido           |

**Regla crítica:** `#C2510A` sobre `#1E3A5F` = 2.45:1 — **PROHIBIDO** ❌

---

## Defectos comunes a vigilar en QA

| Defecto                    | Causa                            | Fix                                       |
| -------------------------- | -------------------------------- | ----------------------------------------- |
| Texto desbordado por abajo | `h` del texto box insuficiente | Aumentar `h` o reducir `fontSize`     |
| Footer solapado            | Dos elementos en y≈5.3          | Separar a izquierda/derecha con `align` |
| Tool label en dos líneas  | Campo demasiado estrecho         | Aumentar `w` o reducir texto            |
| Naranja oscuro sobre azul  | Violación de contraste          | Cambiar a `FF8C3B` sobre azul           |

---

© 2025 Bernardo Ronquillo Japón · COIIAOC
