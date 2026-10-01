#!/usr/bin/env bash
# Обновление сайта на сервере (запускать от root): /srv/mwp-site/deploy/update.sh
# Забирает main с GitHub, ставит зависимости, применяет миграции, собирает и перезапускает.
set -euo pipefail

APP=/srv/mwp-site
cd "$APP"
as_app() { sudo -u mwp -H bash -c "cd $APP && $*"; }

as_app "git pull --ff-only"
as_app "npm ci --no-audit --no-fund"
as_app "npx prisma migrate deploy"
as_app "npm run build"
systemctl restart mwp-site
sleep 2
systemctl is-active mwp-site
curl -fsS -o /dev/null -w "Главная: %{http_code}\n" http://127.0.0.1:3000/
