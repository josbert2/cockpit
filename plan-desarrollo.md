# Plan de desarrollo — cockpit

> Operativo. Cómo se construye cada fase, paso a paso. Para visión y rationale ver `vault/01-Projects/cockpit/roadmap.md`.

## Fase 0 — Setup base

- [x] Scaffold Laravel + Next.js
- [x] Estructura de carpetas (`backend/`, `frontend/`, `.claude/`, `docs/`)
- [x] Symlink `.claude/CLAUDE.md` → vault
- [ ] Configurar SQLite en backend/.env
- [ ] `php artisan migrate` (verifica que arranque)
- [ ] Instalar deps frontend que faltan: `@tanstack/react-query`, `@tanstack/react-table`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-tooltip`
- [ ] Layout shell: sidebar + main + topbar (componentes vacíos)
- [ ] Dark mode con next-themes
- [ ] Tokens semánticos en Tailwind config (primary, success, danger, warning, muted)
- [ ] Git init + first commit

## Fase 1 — Project list

### Backend
- [ ] Migration `projects`:
  ```
  id, path (unique), name, status enum(HOT,ACTIVE,PAUSED,IDLE,STALE),
  last_commit_at, last_commit_msg, commits_30d, stack (string),
  notes (text nullable), pinned (bool), archived (bool),
  created_at, updated_at
  ```
- [ ] Model `Project` con casts y scopes (`scopeHot`, `scopeActive`, etc.)
- [ ] Service `RepoScanner`: recorre `~/root/`, ejecuta `git log` para metadata, infiere stack por archivos clave
- [ ] Command `php artisan cockpit:scan` que llama al service y upserts
- [ ] API `GET /api/projects` con filtros y orden
- [ ] DTO `ProjectData` (spatie/laravel-data)
- [ ] Test: scanner detecta correctamente HOT/ACTIVE/PAUSED en repos fixture

### Frontend
- [ ] Página `/` (Project list)
- [ ] Hook `useProjects(filters)` con TanStack Query
- [ ] Componente `<ProjectListItem>` denso con: status badge, name, days-since, stack, commits-30d
- [ ] Filtros: status pills, stack multiselect, search
- [ ] Sort dropdown: hot first, alphabetical, most-active-30d
- [ ] Atajos teclado: `J/K` move, `Enter` open project, `/` search, `cmd+k` palette
- [ ] Empty state con CTA "Run scan"

## Fase 2 — Daily focus
(continuará — esto es Fase 1 detallada solamente)
