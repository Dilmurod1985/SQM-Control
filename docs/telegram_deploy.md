# Деплой и тестирование Edge Function: telegramNotify

Этот документ пошагово объясняет, как развернуть и протестировать Supabase Edge Function `telegramNotify`, которая отправляет уведомления в Telegram при критических NC и превышениях ККТ.

Входные предпосылки
- Установлен Supabase CLI (https://supabase.com/docs/guides/cli)
- У вас есть доступ к проекту Supabase (project ref)
- Есть Service Role Key (суперключ) и BOT_TOKEN Telegram

Шаги деплоя

1) Подготовка секретов

  supabase secrets set TELEGRAM_BOT_TOKEN="<telegram-bot-token>" SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" SUPABASE_URL="https://<project>.supabase.co"

  - TELEGRAM_BOT_TOKEN — токен, который дал BotFather
  - SUPABASE_SERVICE_ROLE_KEY — секретный ключ Supabase (service role)
  - SUPABASE_URL — ваш Supabase URL

2) Деплой функции

  supabase functions deploy telegramNotify --project-ref <project-ref>

3) Разрешения и переменные

  - Убедитесь, что вы прописали секреты (см. шаг 1). Edge Function будет читать их из окружения.
  - После деплоя проверьте логи:

	supabase functions logs telegramNotify --project-ref <project-ref>

Тестирование функции напрямую

1) Тест вызовом Edge Function (используя service key)

  curl -X POST "https://<project>.functions.supabase.co/telegramNotify" \
	-H "Authorization: Bearer <service-role-key>" \
	-H "Content-Type: application/json" \
	-d '{"type":"nc","ncId":"test-nc-1","department_id":"<dept-id>","title":"Тест критического NC","message":"Тестовое сообщение: критическое несоответствие"}'

2) Тест через API вашего приложения (прокси)

  curl -X POST "https://your-app.example.com/api/notifications/telegram" \
	-H "Content-Type: application/json" \
	-d '{"type":"ccp","ccpCode":"CCP-01","department_id":"<dept-id>","message":"Тест CCP превышение"}'

  В этом случае API /api/notifications/telegram проксирует запрос к Edge Function (использует SUPABASE_EDGE_FUNCTIONS_URL и SUPABASE_SERVICE_ROLE_KEY).

Проверка в Telegram

- Убедитесь, что директор и мастер отправили `/start` боту, или вы получили их chat_id и сохранили в таблицу `user_telegram`.
- Пример SQL вставки:

  INSERT INTO user_telegram (user_id, telegram_chat_id) VALUES ('<profile-uuid>','<chat-id>') ON CONFLICT (user_id) DO UPDATE SET telegram_chat_id = EXCLUDED.telegram_chat_id;

Debugging
- Просмотр логов Edge Function: `supabase functions logs telegramNotify --project-ref <project-ref>`
- Если сообщения не доходят — проверьте, что TELEGRAM_BOT_TOKEN корректен и бот не заблокирован
- Если recipients пусты — убедитесь, что в таблице profiles есть роли director/master и у них есть записи в user_telegram

Безопасность
- Никогда не публикуйте SUPABASE_SERVICE_ROLE_KEY в клиентских приложениях.
- Переменные должны быть заданы как секреты в Supabase.

Если хотите, могу сгенерировать готовые команды для вашего проекта (подставлю project-ref и пример profile-uuid), или добавить скрипт PowerShell для автоматического теста.
