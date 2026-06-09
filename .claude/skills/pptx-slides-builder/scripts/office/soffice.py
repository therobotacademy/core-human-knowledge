#!/usr/bin/env python3
"""
soffice.py — Wrapper portable para LibreOffice en entornos sandboxed.

Detecta automáticamente la ruta de soffice en el sistema y ejecuta
conversiones de documentos sin necesidad de configuración manual.

Uso equivalente a soffice:
  python3 soffice.py --headless --convert-to pdf documento.pptx
  python3 soffice.py --headless --convert-to pdf --outdir /tmp/ doc.pptx
"""

import subprocess
import sys
import os
from pathlib import Path


SOFFICE_CANDIDATES = [
    "soffice",
    "/usr/bin/soffice",
    "/usr/lib/libreoffice/program/soffice",
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    "/snap/bin/libreoffice",
    "libreoffice",
]


def find_soffice() -> str:
    """Encuentra la ruta a soffice en el sistema."""
    for candidate in SOFFICE_CANDIDATES:
        try:
            result = subprocess.run(
                ["which", candidate] if not candidate.startswith("/") else ["test", "-f", candidate],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                return candidate
        except FileNotFoundError:
            continue

    # Intento directo
    for candidate in SOFFICE_CANDIDATES:
        if Path(candidate).exists():
            return candidate

    raise RuntimeError(
        "LibreOffice no encontrado. Instalar con:\n"
        "  sudo apt install libreoffice   (Ubuntu/Debian)\n"
        "  brew install --cask libreoffice  (macOS)"
    )


def main():
    args = sys.argv[1:]

    # Detectar --outdir y archivo de entrada para inferir directorio de salida
    outdir = None
    input_file = None

    i = 0
    filtered_args = []
    while i < len(args):
        if args[i] == "--outdir" and i + 1 < len(args):
            outdir = args[i + 1]
            filtered_args.extend([args[i], args[i + 1]])
            i += 2
        else:
            filtered_args.append(args[i])
            if not args[i].startswith("-"):
                input_file = args[i]
            i += 1

    # Si no se especificó --outdir, usar el directorio del archivo de entrada
    if outdir is None and input_file:
        input_path = Path(input_file).resolve()
        if input_path.exists():
            outdir = str(input_path.parent)
            filtered_args = filtered_args[:-1] + ["--outdir", outdir, filtered_args[-1]]

    soffice = find_soffice()
    cmd = [soffice] + filtered_args

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)

    # Informar el archivo de salida generado
    if input_file and "--convert-to" in args:
        fmt_idx = args.index("--convert-to") + 1
        if fmt_idx < len(args):
            fmt = args[fmt_idx]
            input_path = Path(input_file).resolve()
            out_dir = Path(outdir) if outdir else input_path.parent
            out_file = out_dir / (input_path.stem + "." + fmt)
            if out_file.exists():
                print(f"convert {input_file} as a Impress document -> {out_file} using filter : impress_pdf_Export")

    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
