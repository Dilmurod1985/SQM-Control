-- Seed data for SQM Control (run after Supabase auth users exist OR temporarily disable FK checks)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Departments
INSERT INTO departments (id, name, code, description, created_at) VALUES
  (gen_random_uuid(), 'Цех убоя', 'D-001', 'Цех убоя и первичной обработки', now()),
  (gen_random_uuid(), 'Цех переработки', 'D-002', 'Цех переработки и фасовки', now())
RETURNING id;

-- For demo convenience capture department ids
-- NOTE: replace the following ids with actual returned ids if running interactively

-- Workshops
INSERT INTO workshops (id, department_id, name, code, description, created_at) VALUES
  (gen_random_uuid(), (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), 'Участок приёма сырья', 'W-001', 'Приём и инспекция сырья', now()),
  (gen_random_uuid(), (SELECT id FROM departments WHERE name = 'Цех переработки' LIMIT 1), 'Участок фасовки', 'W-002', 'Фасовка и упаковка', now());

-- Create sample audit templates (18 items, mix of critical)
INSERT INTO audit_templates (id, title, description, items, version, created_by, created_at) VALUES
  (gen_random_uuid(), 'Шаблон: Ежедневный производственный аудит', '18 пунктов контроля: гигиена, температура, оборудование',
   (
	 SELECT jsonb_agg(j) FROM (
	   SELECT jsonb_build_object('id', 'item-'||i, 'title', 'Пункт проверки '||i, 'description', 'Описание пункта '||i, 'type', 'boolean', 'weight', 1, 'critical', (i % 5 = 0)) AS j
	   FROM generate_series(1,18) AS s(i)
	 ) t
   ), 1, NULL, now()),
  (gen_random_uuid(), 'Шаблон: Гигиена персонала', 'Контроль чистоты и одежды персонала',
   (
	 SELECT jsonb_agg(j) FROM (
	   SELECT jsonb_build_object('id', 'hygiene-'||i, 'title', 'Гигиенический пункт '||i, 'description', 'Описание '||i, 'type', 'boolean', 'weight', 1, 'critical', (i = 1)) AS j
	   FROM generate_series(1,6) AS s(i)
	 ) t
   ), 1, NULL, now());

-- NOTE: profiles references auth.users. If auth.users not populated, temporarily disable FK checks:
-- SET session_replication_role = 'replica';
-- Insert sample profiles (UUIDs used; replace with actual auth.user IDs when available)
INSERT INTO profiles (id, full_name, email, phone, role, department_id, workshop_id, created_at)
VALUES
  (gen_random_uuid(), 'Иван Директор', 'director@example.com', '+7-900-000-0001', 'director', NULL, NULL, now()),
  (gen_random_uuid(), 'Пётр Мастер', 'master@example.com', '+7-900-000-0002', 'master', (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок приёма сырья' LIMIT 1), now()),
  (gen_random_uuid(), 'Ольга Аудитор', 'auditor@example.com', '+7-900-000-0003', 'auditor', NULL, NULL, now()),
  (gen_random_uuid(), 'Алекс Рабочий', 'worker@example.com', '+7-900-000-0004', 'worker', (SELECT id FROM departments WHERE name = 'Цех переработки' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок фасовки' LIMIT 1), now());
-- SET session_replication_role = 'origin';

-- Sample CCP monitoring entries
INSERT INTO ccp_monitoring (id, ccp_code, department_id, workshop_id, measured_by, measured_at, measurement_value, unit, pass, notes)
VALUES
  (gen_random_uuid(), 'CCP-01', (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), NULL, (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), now() - interval '2 hour', 4.3, '°C', TRUE, 'Температура в норме'),
  (gen_random_uuid(), 'CCP-02', (SELECT id FROM departments WHERE name = 'Цех переработки' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок фасовки' LIMIT 1), (SELECT id FROM profiles WHERE full_name = 'Алекс Рабочий' LIMIT 1), now() - interval '1 hour', 7.8, '°C', FALSE, 'Температура выше допустимой');

-- Sample non_conformities
INSERT INTO non_conformities (id, title, description, department_id, workshop_id, detected_by, detected_at, status, severity, related_audit, assigned_to, created_at)
VALUES
  (gen_random_uuid(), 'Несоответствие: загрязнение оборудования', 'Найдены остатки на конвейере', (SELECT id FROM departments WHERE name = 'Цех переработки' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок фасовки' LIMIT 1), (SELECT id FROM profiles WHERE full_name = 'Алекс Рабочий' LIMIT 1), now() - interval '3 day', 'open', 'high', NULL, (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), now()),
  (gen_random_uuid(), 'Несоответствие: температура', 'Аномальная температура на приёмке', (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), NULL, (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), now() - interval '1 day', 'in_progress', 'medium', NULL, (SELECT id FROM profiles WHERE full_name = 'Иван Директор' LIMIT 1), now());

-- Simple audit example (linked to template)
INSERT INTO audits (id, template_id, department_id, workshop_id, shift_id, performed_by, performed_at, overall_score, notes, created_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM audit_templates WHERE title LIKE 'Шаблон: Ежедневный%' LIMIT 1), (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок приёма сырья' LIMIT 1), NULL, (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), now() - interval '6 hour', 88, 'Проведён согласно регламенту', now());

-- Audit results tied to the audit (one sample row)
INSERT INTO audit_results (id, audit_id, item_id, item_title, status, score, comment, recorded_by, recorded_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM audits LIMIT 1), 'item-1', 'Пункт проверки 1', 'ok', 5, 'Все хорошо', (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), now());

-- Sample corrective action (CAPA)
INSERT INTO corrective_actions (id, nc_id, title, description, created_by, assigned_to, created_at, due_date, completed)
VALUES
  (gen_random_uuid(), (SELECT id FROM non_conformities LIMIT 1), 'Очистить оборудование', 'Провести регламентную чистку конвейера и повторную инспекцию', (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), (SELECT id FROM profiles WHERE full_name = 'Иван Директор' LIMIT 1), now(), now() + interval '3 day', FALSE);

-- Seed complete
-- Reminder: if profiles fk fails because auth.users empty, create corresponding auth.users or run seed with session_replication_role = 'replica'
