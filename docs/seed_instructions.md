# Инструкции по применению seed (dev)

Этот документ описывает как применить seed-скрипт в development окружении.

Файлы:
- db/seed_full.sql — основной seed с начальными данными (audit templates, users, ccp, nc, etc.)
- db/seed_full_with_replica.sql — обёртка, отключающая FK-проверки для разработки
- scripts/apply_seed.ps1 — PowerShell скрипт для применения seed
- scripts/validate_seed.ps1 — PowerShell скрипт для валидации результатов

Внимание: используйте обёртку с отключением FK ТОЛЬКО в dev среде.

Требования:
- Установите psql (Postgres client) и добавьте в PATH
- Установите переменную окружения DATABASE_URL (Postgres connection string)

Пример (PowerShell):

```powershell
$env:DATABASE_URL = "postgres://postgres:password@db-host:5432/postgres"
./scripts/apply_seed.ps1
```

Если вы не хотите отключать FK, запустите напрямую:

psql $DATABASE_URL -f db/seed_full.sql

Проверка:

```powershell
$env:DATABASE_URL = "postgres://postgres:password@db-host:5432/postgres"
./scripts/validate_seed.ps1
```

Особенности с auth.users:
- Таблица profiles ссылается на auth.users(id). Если у вас нет соответствующих записей в auth.users, то вставка profiles может упасть из-за FK. В dev можно использовать seed_full_with_replica.sql (он устанавливает session_replication_role = 'replica'), либо предварительно создать auth.users через Supabase Auth.

Настройка Telegram:
- После применения seed заполните реальные chat_id в таблице user_telegram (через admin UI или SQL):
  INSERT INTO user_telegram (user_id, telegram_chat_id) VALUES ('<profile-uuid>','<chat-id>') ON CONFLICT (user_id) DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id;

Откат:
- Seed не содержит DROP-операций. Для отката вручную удалите записи или восстановите DB из резервной копии.

Если нужно, могу подготовить аналогичные bash-скрипты для Linux/macOS и добавить автоматический backup перед применением seed.
