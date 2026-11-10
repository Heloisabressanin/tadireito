#!/bin/bash
# Runs the daily law watch on this Mac (launchd), while GitHub Actions is unavailable.
# Reports go to ~/TaDireito-Veille/ and a macOS notification appears when a human must look.
# Installed by scripts/veille/instalar-no-mac.sh; logs in ~/TaDireito-Veille/veille.log.
set -u
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
SAIDA="$HOME/TaDireito-Veille"
mkdir -p "$SAIDA"
NODE="$(ls -d "$HOME"/.nvm/versions/node/v24*/bin/node 2>/dev/null | tail -1)"
[ -x "$NODE" ] || NODE="$(command -v node)"
HOJE="$(TZ=America/Sao_Paulo date +%F)"
RELATORIO="$SAIDA/$HOJE.md"

cd "$REPO" || exit 1
"$NODE" scripts/veille/veille.mts --relatorio "$RELATORIO" >/dev/null 2>"$SAIDA/erro.txt"
CODIGO=$?
echo "$(date '+%F %T') codigo=$CODIGO" >> "$SAIDA/veille.log"

notificar() {
  /usr/bin/osascript -e "display notification \"$1\" with title \"Tá Direito · Veille des lois\" sound name \"Glass\""
}
case $CODIGO in
  0) rm -f "$RELATORIO" ;;  # nothing changed: no report, no noise
  2) notificar "Une source officielle a changé : ouvre ~/TaDireito-Veille/$HOJE.md (ou demande à Claude)." ;;
  *) notificar "La veille a planté (code $CODIGO) : voir ~/TaDireito-Veille/erro.txt" ;;
esac
exit 0
