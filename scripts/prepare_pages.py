#!/usr/bin/env python3
"""Prepara la carpeta _site/ para GitHub Pages."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "app"
AUTOMA_DIR = ROOT / "automa"
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

    export_icons = ROOT / "scripts" / "export_app_icons.mjs"
    icons_out = APP_DIR / "js" / "icons.js"
    in_ci = os.environ.get("CI", "").lower() in {"1", "true", "yes"}
    if (
        export_icons.is_file()
        and shutil.which("node")
        and (AUTOMA_DIR / "node_modules").is_dir()
        and not in_ci
    ):
        print("> node scripts/export_app_icons.mjs", flush=True)
        icon_result = subprocess.run(
            ["node", str(export_icons)],
            cwd=ROOT,
            check=False,
            timeout=120,
        )
        if icon_result.returncode != 0:
            print("Aviso: no se pudieron regenerar iconos de la app.", file=sys.stderr)
    elif in_ci and icons_out.is_file():
        print(f"CI: usando iconos existentes en {icons_out.relative_to(ROOT)}", flush=True)
    elif in_ci:
        print("Aviso: falta app/js/icons.js en CI.", file=sys.stderr)

    if not APP_DIR.is_dir():
        print(f"No existe la carpeta de la app: {APP_DIR}", file=sys.stderr)
        return 1

    if not (APP_DIR / "data" / "images").is_dir():
        print(
            "Faltan imágenes en app/data/images. Ejecuta scripts/sync_images.py primero.",
            file=sys.stderr,
        )
        return 1

    print(f"Copiando {APP_DIR.relative_to(ROOT)}/ -> {SITE_DIR.name}/ ...", flush=True)
    copy_tree(APP_DIR, SITE_DIR)

    file_count = sum(1 for _ in SITE_DIR.rglob("*") if _.is_file())
    print(f"Sitio listo en {SITE_DIR} ({file_count} archivos)", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
