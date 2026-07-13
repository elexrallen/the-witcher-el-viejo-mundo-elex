#!/usr/bin/env python3
"""Prepara la carpeta _site/ para GitHub Pages."""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "app"
SITE_DIR = ROOT / "_site"


def run_sync_images() -> int:
    script = ROOT / "scripts" / "sync_images.py"
    result = subprocess.run([sys.executable, str(script)], check=False)
    return result.returncode


def copy_tree(source: Path, target: Path) -> None:
    if not source.is_dir():
        raise FileNotFoundError(f"No existe: {source}")

    if target.exists():
        shutil.rmtree(target)

    shutil.copytree(
        source,
        target,
        ignore=shutil.ignore_patterns("__pycache__", "*.pyc"),
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--skip-sync",
        action="store_true",
        help="No volver a copiar imágenes desde data/images",
    )
    args = parser.parse_args()

    if not args.skip_sync:
        code = run_sync_images()
        if code != 0:
            return code

    if not APP_DIR.is_dir():
        print(f"No existe la carpeta de la app: {APP_DIR}", file=sys.stderr)
        return 1

    if not (APP_DIR / "data" / "images").is_dir():
        print(
            "Faltan imágenes en app/data/images. Ejecuta scripts/sync_images.py primero.",
            file=sys.stderr,
        )
        return 1

    copy_tree(APP_DIR, SITE_DIR)

    file_count = sum(1 for _ in SITE_DIR.rglob("*") if _.is_file())
    print(f"Sitio listo en {SITE_DIR} ({file_count} archivos)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
