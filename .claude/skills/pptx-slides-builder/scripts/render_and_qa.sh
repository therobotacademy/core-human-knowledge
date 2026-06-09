#!/usr/bin/env bash
# render_and_qa.sh — Pipeline completo: PptxGenJS → python-pptx resave → PDF → JPGs
#
# Uso:
#   ./scripts/render_and_qa.sh <script_js> <output_name>
#
# Ejemplo:
#   ./scripts/render_and_qa.sh /home/claude/build_parte2.js parte2_overview
#
# Produce:
#   /home/claude/<output_name>.pptx   — archivo final
#   /home/claude/<output_name>.pdf    — PDF de QA (temporal)
#   /home/claude/slide-NN.jpg         — imágenes de QA

set -e

SCRIPT_JS="${1:?ERROR: se requiere ruta al script JS como primer argumento}"
OUTPUT_NAME="${2:?ERROR: se requiere nombre de salida como segundo argumento}"
PPTX_PATH="/home/claude/${OUTPUT_NAME}.pptx"
PDF_PATH="/home/claude/${OUTPUT_NAME}.pdf"

echo "── PASO 1: Generando PPTX con PptxGenJS ──"
OUTPUT="${PPTX_PATH}" node "${SCRIPT_JS}"
echo "   OK: ${PPTX_PATH}"

echo "── PASO 2: Re-save con python-pptx (corrige orden XML para PowerPoint) ──"
python3 -c "
from pptx import Presentation
p = Presentation('${PPTX_PATH}')
p.save('${PPTX_PATH}')
print('   OK: resave completado')
"

echo "── PASO 3: Convertir a PDF con LibreOffice ──"
SOFFICE_SCRIPT="$(dirname "$0")/office/soffice.py"
if [ -f "${SOFFICE_SCRIPT}" ]; then
  python3 "${SOFFICE_SCRIPT}" --headless --convert-to pdf "${PPTX_PATH}"
else
  # Fallback: buscar soffice en el PATH estándar
  soffice --headless --convert-to pdf --outdir /home/claude/ "${PPTX_PATH}"
fi
echo "   OK: ${PDF_PATH}"

echo "── PASO 4: Rasterizar slides para QA visual ──"
rm -f /home/claude/slide-*.jpg
pdftoppm -jpeg -r 150 "${PDF_PATH}" /home/claude/slide
echo "   OK: imágenes generadas:"
ls -1 /home/claude/slide-*.jpg

echo ""
echo "Pipeline completado. Inspeccionar imágenes con el tool view() antes de entregar."
echo "PPTX listo: ${PPTX_PATH}"
