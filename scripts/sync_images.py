#!/usr/bin/env python3
"""Copia las imágenes de cartas a app/data/images para servir y publicar."""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "images"
TARGET = ROOT / "app" / "data" / "images"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Eliminar la carpeta destino antes de copiar",
    )
    args = parser.parse_args()

    if not SOURCE.is_dir():
        print(f"No existe la carpeta de imágenes: {SOURCE}", file=sys.stderr)
        return 1

    if args.clean and TARGET.exists():
        shutil.rmtree(TARGET)

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(SOURCE, TARGET, dirs_exist_ok=True)

    file_count = sum(1 for _ in TARGET.rglob("*") if _.is_file())
    print(f"Imágenes sincronizadas en {TARGET} ({file_count} archivos)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
