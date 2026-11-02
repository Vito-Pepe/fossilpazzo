#!/usr/bin/env bash
# Compila un'app in .wapp senza toccare telefono e orologio (niente adb).
# Si lancia dentro WSL, dalla radice del repo:  bash strumenti/compila.sh apps/lightTestApp
# Il .wapp finisce in <app>/build/<identifier>.wapp
set -euo pipefail

[ $# -eq 1 ] || { echo "Uso: bash strumenti/compila.sh <cartella dell'app>"; exit 1; }

RADICE="$(cd "$(dirname "$0")/.." && pwd)"
APP="$(cd "$1" && pwd)"
export PATH="$HOME/venv-fossil/bin:$PATH"   # python3 con crc32c

# Solo i target compile e pack: push e install userebbero adb.
make -C "$APP" compile pack WATCH_SDK_PATH="$RADICE/sdk/"
ls -l "$APP"/build/*.wapp
