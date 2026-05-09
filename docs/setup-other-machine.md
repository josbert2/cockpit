# Setup del cockpit en otra máquina

Este doc te lleva de cero a cockpit corriendo en cualquier Linux/Mac. Probado en Ubuntu 24.

## Pre-requisitos
| Herramienta | Min versión | Para qué |
|---|---|---|
| PHP | 8.3+ | Laravel 13 backend |
| Composer | 2.x | PHP deps |
| Node.js | 20+ | Next.js frontend |
| pnpm | 10+ | Package manager frontend |
| Docker + Compose v2 | latest | MySQL + Adminer |
| Git | any | clonar repos |

```bash
# Verificá que tenés todo
php --version
composer --version
node --version
pnpm --version
docker --version && docker compose version
```

## 1. Clonar el repo
```bash
mkdir -p ~/root/personal && cd ~/root/personal
git clone git@github.com:josbert2/cockpit.git
cd cockpit
```

## 2. Setup del vault (knowledge base)
El cockpit lee/escribe del vault Obsidian. Cloná el vault primero:
```bash
mkdir -p ~/vault
git clone git@github.com:josbert2/obsidian-git.git ~/vault
```

Setear variable de entorno (en `.env` del backend más abajo):
```
VAULT_ROOT=/home/<tu-user>/vault
```

## 3. Backend (Laravel + MySQL en Docker)

```bash
cd ~/root/personal/cockpit

# Levantar MySQL + Adminer
docker compose up -d
# MySQL en :3320, Adminer en :8083

cd backend

# Composer install
composer install --no-interaction

# Copiar .env y configurar
cp .env.example .env
# Editar .env y setear:
#   VAULT_ROOT=/home/<tu-user>/vault
#   DB_CONNECTION=mysql
#   DB_HOST=127.0.0.1
#   DB_PORT=3320
#   DB_DATABASE=cockpit
#   DB_USERNAME=cockpit
#   DB_PASSWORD=cockpit
#   REVERB_APP_ID=<random hex 8 bytes>
#   REVERB_APP_KEY=<random hex 16 bytes>
#   REVERB_APP_SECRET=<random hex 16 bytes>
#   REVERB_HOST="127.0.0.1"
#   REVERB_PORT=8085
#   REVERB_SCHEME=http
#   BROADCAST_CONNECTION=reverb

php artisan key:generate
php artisan migrate --force

# Primer scan de proyectos en ~/root/
php artisan cockpit:scan

# Primer sync de TODOs del vault
php artisan cockpit:sync-vault
```

## 4. Frontend (Next.js)
```bash
cd ~/root/personal/cockpit/frontend
pnpm install

# Copiar env y setear
cat > .env.local <<EOF
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_REVERB_KEY=<mismo que REVERB_APP_KEY del backend>
NEXT_PUBLIC_REVERB_HOST=127.0.0.1
NEXT_PUBLIC_REVERB_PORT=8085
NEXT_PUBLIC_REVERB_SCHEME=http
EOF
```

## 5. Levantar todo (3 procesos en paralelo)

En 3 terminales separadas:

```bash
# Terminal 1 — Backend Laravel
cd ~/root/personal/cockpit/backend
php artisan serve --port 8000

# Terminal 2 — Reverb WebSocket
cd ~/root/personal/cockpit/backend
php artisan reverb:start --port 8085

# Terminal 3 — Vault watcher (auto-sync de TODOs)
cd ~/root/personal/cockpit/backend
php artisan cockpit:watch-vault --interval=5

# Terminal 4 — Frontend
cd ~/root/personal/cockpit/frontend
pnpm dev --port 3020
```

Abrí: **http://localhost:3020**

## 6. (Opcional) Auto-arranque con systemd

Crear units en `~/.config/systemd/user/`:

```ini
# cockpit-backend.service
[Unit]
Description=Cockpit Laravel backend
After=network-online.target

[Service]
WorkingDirectory=%h/root/personal/cockpit/backend
ExecStart=/usr/bin/php artisan serve --port 8000
Restart=on-failure

[Install]
WantedBy=default.target
```

Crear similares para `reverb.service` (`reverb:start`) y `vault-watcher.service` (`cockpit:watch-vault`). Después:

```bash
systemctl --user daemon-reload
systemctl --user enable --now cockpit-backend.service
systemctl --user enable --now cockpit-reverb.service
systemctl --user enable --now cockpit-vault-watcher.service
```

## 7. Verificar que todo anda

```bash
# Backend health
curl http://localhost:8000/api/dashboard/summary | jq .tasks_open

# Frontend
curl -o /dev/null -w "%{http_code}\n" http://localhost:3020

# Watcher activo
curl http://localhost:8000/api/vault/sync-status | jq .watcher_active

# DB tiene proyectos
docker exec cockpit-db mysql -ucockpit -pcockpit cockpit -e "SELECT COUNT(*) FROM projects;"
```

## Troubleshooting

| Error | Solución |
|---|---|
| `port 8085 already in use` | otro Reverb corriendo · `pkill -f reverb` o cambiar `REVERB_PORT` |
| `port 3320 already in use` | otro MySQL · cambiar puerto en `docker-compose.yml` y en `.env` |
| `could not find driver` (PDO) | falta extensión PHP MySQL · `apt install php8.4-mysql` |
| watcher_active = false | el daemon no está corriendo · `php artisan cockpit:watch-vault` en una terminal |
| frontend tira CORS | revisar `backend/config/cors.php` que `allowed_origins` incluya el host del frontend |
| Reverb no conecta del browser | verificar que el `NEXT_PUBLIC_REVERB_KEY` matchea el `REVERB_APP_KEY` |

## Lo que NO se commitea (para no compartir secretos)
- `.env` (backend) — contiene REVERB_APP_SECRET y DB password
- `.env.local` (frontend) — contiene REVERB_APP_KEY público
- `database/database.sqlite` (deprecated, ya usamos MySQL)
- `node_modules`, `vendor`, `.next`, `bootstrap/cache/*`
