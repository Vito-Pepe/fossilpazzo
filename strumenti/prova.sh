#!/usr/bin/env bash
# Prova un'app con jerry (JerryScript 2.1.0, il motore dell'orologio), senza orologio.
# Si lancia dentro WSL, dalla radice del repo:  bash strumenti/prova.sh apps/lightTestApp
# Unisce simulatore, layout, app e scenario (apps/<nome>/prova.js) in un solo script.
set -euo pipefail

[ $# -eq 1 ] || { echo "Uso: bash strumenti/prova.sh <cartella dell'app>"; exit 1; }

RADICE="$(cd "$(dirname "$0")/.." && pwd)"
APP="$(cd "$1" && pwd)"
SCRIPT="$(mktemp --suffix=.js)"
trap 'rm -f "$SCRIPT"' EXIT

{
    cat "$RADICE/strumenti/simulatore.js"
    echo "var LAYOUTS = {};"
    for f in "$APP"/build/files/layout/*; do
        echo "LAYOUTS['$(basename "$f")'] = $(cat "$f");"
    done
    echo "var app = (function () {"
    cat "$APP/app.js"
    echo "})();"
    cat "$APP/prova.js"
} > "$SCRIPT"

jerry "$SCRIPT"
