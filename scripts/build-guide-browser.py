#!/usr/bin/env python3
"""CLI alias for scripts/build_guide_browser.py."""

from pathlib import Path
import runpy
import sys

target = Path(__file__).resolve().parent / "build_guide_browser.py"
runpy.run_path(str(target), run_name="__main__")
