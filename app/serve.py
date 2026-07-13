#!/usr/bin/env python3
"""Servidor local para la app de exploración."""

from __future__ import annotations

import argparse
import http.server
import socketserver
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class AppHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **getattr(http.server.SimpleHTTPRequestHandler, "extensions_map", {}),
        ".webmanifest": "application/manifest+json",
        ".js": "application/javascript",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()

    images_dir = ROOT / "app" / "data" / "images"
    if not images_dir.is_dir():
        print("Aviso: no hay imágenes en app/data/images.")
        print("Ejecuta: py -3 scripts/sync_images.py")
        print()

    with socketserver.TCPServer(("", args.port), AppHandler) as httpd:
        print(f"The Witcher: El Viejo Mundo -> http://localhost:{args.port}/app/")
        print(f"Automa (solitario)          -> http://localhost:{args.port}/app/automa/")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
