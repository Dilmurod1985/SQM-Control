-- rls_test.sql — вспомогательный файл для проверки RLS политик
-- Используйте psql или Supabase SQL editor

-- Пример: смоделировать jwt.claims
-- Установить локальную переменную jwt.claims, содержащую роль и user id
-- В psql можно сделать:
-- SET LOCAL jwt.claims = '{"role":"master"}';

-- Проверка: выполнить SELECT под вашей ролью (в Supabase SQL editor role определяется автоматически через auth.uid())
-- Примеры проверок:

-- 1) Просмотр всех аудитов (должен вернуть только доступные записи в соответствии с политиками)
SELECT id, template_id, department_id, workshop_id, shift_id, performed_by, performed_at FROM audits ORDER BY performed_at DESC LIMIT 50;

-- 2) Проверка, может ли мастер вставлять результат аудита (симулируем путем создания временного запроса)
-- В реальном окружении выполните вставку через API и проверьте, что RLS не блокирует.

-- 3) Проверка доступа к ccp_monitoring
SELECT id, ccp_code, department_id, measured_by, measured_at, measurement_value, pass FROM ccp_monitoring ORDER BY measured_at DESC LIMIT 50;

-- 4) Проверка non_conformities
SELECT id, title, severity, detected_by, assigned_to, department_id FROM non_conformities ORDER BY created_at DESC LIMIT 50;

-- 5) Тестирование функции get_current_user_role
SELECT get_current_user_role();

-- Примечание: для эмуляции разных пользователей используйте Supabase SQL editor и авторизацию под соответствующим пользователем.

