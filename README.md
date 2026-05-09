# 🛩 cockpit

Plataforma personal de gestión de proyectos para devs solos con muchos repos abiertos. Inspirada en Linear + ClickUp pero recortada al hueso.

> **Knowledge base completa del proyecto**: `~/vault/01-Projects/cockpit/` (incluye decisions, roadmap, research, glossary).

## Stack

- **Backend**: Laravel 13 + PHP 8.4 + MySQL 8.4 (Docker)
- **Frontend**: Next.js 16 + React 19 + Tailwind 4 + TanStack Query + Zustand
- **DB en Docker** (puerto host 3320), Adminer en `:8083`. Laravel y Next.js corren en host (no Dockerizados).
- **Sin auth, single-user** — recortes deliberados (ver [decisions/2026-05-08-stack.md](../../vault/01-Projects/cockpit/decisions/2026-05-08-stack.md))

## Layout

```
cockpit/
├── backend/                    # Laravel 13 — API + scanner de repos
├── frontend/                   # Next.js 16 — UI
├── .claude/CLAUDE.md           # symlink → vault (instrucciones para Claude)
├── docs/                       # docs locales del repo (specs runtime, no notas)
├── plan-desarrollo.md          # roadmap operativo, paso a paso
└── README.md
```

## Setup

```bash
# 1. Levantar DB (MySQL 8 + Adminer)
docker compose up -d
# DB en localhost:3320, Adminer en http://localhost:8083 (login: cockpit/cockpit, server: db)

# 2. Backend
cd backend
# .env ya configurado para MySQL en 3320
php artisan key:generate     # solo primera vez
php artisan migrate
php artisan serve            # http://localhost:8000

# 3. Frontend (en otra terminal)
cd frontend
pnpm install
pnpm dev --port 3020         # 3000 chocaría con clipal — uso 3020
```

## Comandos clave

```bash
# Backend
php artisan cockpit:scan           # escanea ~/root/ y popula projects
php artisan cockpit:daily-suggest  # sugiere top 3 tasks de hoy
php artisan cockpit:sync-vault-tasks  # parsea - [ ] del vault
php artisan cockpit:weekly-review  # genera weekly review en _weekly/

# Frontend
pnpm dev
pnpm build
pnpm lint
```

## Roadmap

Ver [vault/01-Projects/cockpit/roadmap.md](../../vault/01-Projects/cockpit/roadmap.md) para fases, milestones, estimaciones.

**Estado actual**: Fase 0 (setup). Próximo milestone: lista de proyectos funcional.

## Knowledge base

Toda la doc estratégica del cockpit vive en el vault Obsidian:

- `vault/01-Projects/cockpit/README.md` — MOC del proyecto
- `vault/01-Projects/cockpit/decisions/` — ADRs
- `vault/01-Projects/cockpit/features/` — specs de las 6 funciones MVP
- `vault/01-Projects/cockpit/research/linear-clickup-inspiration.md` — qué tomamos de cada uno
- `vault/01-Projects/cockpit/roadmap.md` — fases y milestones
