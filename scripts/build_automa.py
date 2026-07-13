#!/usr/bin/env python3
"""Compila el Automa (React/Vite) hacia app/automa/."""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTOMA_DIR = ROOT / "automa"
OUTPUT_DIR = ROOT / "app" / "automa"


def find_npm() -> str:
    npm = shutil.which("npm")
    if npm:
        return npm
    raise RuntimeError("No se encontró npm. Instala Node.js para compilar el Automa.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--install",
        action="store_true",
        help="Ejecutar npm install antes del build",
    )
    args = parser.parse_args()

    if not AUTOMA_DIR.is_dir():
        print(f"No existe la carpeta del automa: {AUTOMA_DIR}", file=sys.stderr)
        return 1

    npm = find_npm()
    commands: list[list[str]] = []

    if args.install or not (AUTOMA_DIR / "node_modules").is_dir():
        commands.append([npm, "install"])

    commands.append([npm, "run", "build"])

    for command in commands:
        print(f"> {' '.join(command)}")
        result = subprocess.run(command, cwd=AUTOMA_DIR, check=False)
        if result.returncode != 0:
            return result.returncode

    if not (OUTPUT_DIR / "index.html").is_file():
        print(f"Build incompleto: falta {OUTPUT_DIR / 'index.html'}", file=sys.stderr)
        return 1

    print(f"Automa compilado en {OUTPUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
