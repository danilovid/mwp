#!/usr/bin/env bash
# Резервная копия базы и загруженных фото: deploy/backup.sh /var/backups/mwp
# Хранит последние 14 копий.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$ROOT/backups}"
STAMP="$(date +%Y-%m-%d_%H-%M)"
mkdir -p "$DEST"

# Онлайн-копия SQLite (безопасно при работающем сайте)
sqlite3 "$ROOT/data/mwp.db" ".backup '$DEST/mwp-$STAMP.db'"
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C "$ROOT/data" uploads

ls -1t "$DEST"/mwp-*.db | tail -n +15 | xargs -r rm --
ls -1t "$DEST"/uploads-*.tar.gz | tail -n +15 | xargs -r rm --
echo "Готово: $DEST/mwp-$STAMP.db"
