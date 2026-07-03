# SQM Control — MVP

Локальный репозиторий для проекта SQM Control (Next.js 15 + TypeScript + Supabase).

Коротко:
- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth + Storage + Realtime)
- Zod, React Hook Form
- Edge Function (Deno) для Telegram уведомлений

Быстрый старт (dev)

1. Установите зависимости:

```powershell
npm install
```

2. Создайте файл `.env.local` на основе `.env.example` и заполните переменные.

3. Запустите dev сервер:

```powershell
npm run dev
```

Seed и база данных (dev)

1. Установите psql и задайте `DATABASE_URL`.
2. Запустите скрипт:

```powershell
$env:DATABASE_URL = "postgres://user:pass@host:5432/db"
./scripts/apply_seed.ps1
```

Telegram Edge Function

- Секреты и деплой описаны в `docs/telegram_deploy.md`.
- Скрипты: `scripts/deploy_telegram.ps1`, `scripts/test_telegram.ps1`.

Admin

- Админская страница управления пользователями: `app/(admin)/users/page.tsx`.

CI

- GitHub Actions workflow находится в `.github/workflows/ci.yml`.

Безопасность

- Никогда не коммитьте секреты и service role key. Используйте `.env.local` и параметры секретов в Supabase.

Если нужно — помогу с деплоем на Vercel и настройкой Supabase в прод окружении.
