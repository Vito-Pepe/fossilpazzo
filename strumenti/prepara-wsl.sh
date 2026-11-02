#!/usr/bin/env bash
# Prepara Ubuntu (WSL2) per compilare le app della Fossil Hybrid HR.
# Si lancia dentro WSL, dalla radice del repo:  bash strumenti/prepara-wsl.sh
# Si può rilanciare: salta i passaggi già fatti.
set -euo pipefail

RADICE="$(cd "$(dirname "$0")/.." && pwd)"
JERRY_DIR="$HOME/jerryscript"          # sorgenti e build di JerryScript
VENV="$HOME/venv-fossil"               # Python isolato (crc32c, poi pandas ecc.)
SDK_URL="https://github.com/MortenHannemose/Fossil-HR-SDK.git"
SDK_COMMIT="6ef0d7f01b0a1c837f9ed10a7f17574e000fe41e"   # ultimo commit, 27/08/2022

# sudo solo se non siamo già root (in WSL l'utente predefinito può essere root)
SUDO=""
[ "$(id -u)" -eq 0 ] || SUDO="sudo"

echo "== 1. Pacchetti di sistema"
export DEBIAN_FRONTEND=noninteractive
$SUDO apt-get update -qq
$SUDO apt-get install -y -qq build-essential cmake python3 python3-pip python3-venv jq make git sqlite3

echo "== 2. Ambiente Python ($VENV)"
[ -d "$VENV" ] || python3 -m venv "$VENV"
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q crc32c

echo "== 3. JerryScript v2.1.0 (l'SDK vuole proprio questa versione)"
if [ ! -d "$JERRY_DIR" ]; then
    git clone -q --branch v2.1.0 --depth 1 https://github.com/jerryscript-project/jerryscript.git "$JERRY_DIR"
fi
if [ ! -x "$JERRY_DIR/build/bin/jerry-snapshot" ]; then
    # JerryScript compila con -Werror e il gcc di Ubuntu 24.04 ha avvisi nuovi
    # rispetto al 2019: si spengono quelli che bloccano la build.
    (cd "$JERRY_DIR" && python3 tools/build.py --clean --jerry-cmdline-snapshot ON \
        --compile-flag=-Wno-address)
fi
$SUDO ln -sf "$JERRY_DIR/build/bin/jerry" /usr/local/bin/jerry
$SUDO ln -sf "$JERRY_DIR/build/bin/jerry-snapshot" /usr/local/bin/jerry-snapshot

echo "== 4. SDK Fossil HR in $RADICE/sdk"
if [ ! -d "$RADICE/sdk/.git" ]; then
    git clone -q "$SDK_URL" "$RADICE/sdk"
fi
git -C "$RADICE/sdk" -c advice.detachedHead=false checkout -q "$SDK_COMMIT"

echo "== Controllo"
jerry --version
command -v jerry-snapshot
"$VENV/bin/python" -c "import crc32c; print('crc32c', crc32c.__version__ if hasattr(crc32c, '__version__') else 'ok')"
echo "Pronto. Per compilare un'app:  bash strumenti/compila.sh apps/<nome>"
