-- Full seed for SQM Control (explicit 18 audit parameters)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Departments
INSERT INTO departments (id, name, code, description, created_at) VALUES
  (gen_random_uuid(), 'Цех убоя', 'D-001', 'Цех убоя и первичной обработки', now()),
  (gen_random_uuid(), 'Цех переработки', 'D-002', 'Цех переработки и фасовки', now())
ON CONFLICT DO NOTHING;

-- Workshops
INSERT INTO workshops (id, department_id, name, code, description, created_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), 'Участок приёма сырья', 'W-001', 'Приём и инспекция сырья', now()),
  (gen_random_uuid(), (SELECT id FROM departments WHERE name = 'Цех переработки' LIMIT 1), 'Участок фасовки', 'W-002', 'Фасовка и упаковка', now())
ON CONFLICT DO NOTHING;

-- Explicit 18 audit parameters for daily production audit
-- Each item: id, title, description, type, weight, critical
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM audit_templates WHERE title = 'Шаблон: Ежедневный производственный аудит (18)') THEN
	INSERT INTO audit_templates (id, title, description, items, version, created_by, created_at)
	VALUES (
	  gen_random_uuid(),
	  'Шаблон: Ежедневный производственный аудит (18)',
	  'Стандартный чек-лист из 18 параметров для ежедневных проверок',
	  jsonb_build_array(
		jsonb_build_object('id','A01','title','Температура приёмки сырья','description','Проверка температуры сырья при приёмке','type','number','weight',2,'critical',true),
		jsonb_build_object('id','A02','title','Гигиена персонала','description','Оценка соблюдения требований по одежде и личной гигиене','type','boolean','weight',2,'critical',true),
		jsonb_build_object('id','A03','title','Чистота оборудования','description','Визуальная оценка чистоты оборудования и поверхностей','type','boolean','weight',2,'critical',true),
		jsonb_build_object('id','A04','title','Рабочие инструкции','description','Наличие и доступность инструкций и протоколов','type','boolean','weight',1,'critical',false),
		jsonb_build_object('id','A05','title','ККТ — температура готовой продукции','description','Температура по точкам контроля','type','number','weight',2,'critical',true),
		jsonb_build_object('id','A06','title','Прослеживаемость партии','description','Маркировка и сопроводительные документы','type','boolean','weight',1,'critical',true),
		jsonb_build_object('id','A07','title','Условия хранения','description','Температура и влажность складских помещений','type','number','weight',1,'critical',true),
		jsonb_build_object('id','A08','title','Отсутствие посторонних предметов','description','Визуальная проверка на инородные тела','type','boolean','weight',1,'critical',true),
		jsonb_build_object('id','A09','title','Санитарные обработкы','description','Регулярность и записи санобработок','type','boolean','weight',1,'critical',false),
		jsonb_build_object('id','A10','title','Проверка тара/упаковки','description','Целостность и маркировка упаковки','type','boolean','weight',1,'critical',true),
		jsonb_build_object('id','A11','title','Электропитание и резерв','description','Работоспособность критического оборудования','type','boolean','weight',1,'critical',false),
		jsonb_build_object('id','A12','title','Контроль вредителей','description','Следы присутствия вредителей','type','boolean','weight',1,'critical',true),
		jsonb_build_object('id','A13','title','Техническое состояние конвейера','description','Износы, следы загрязнения, остатки','type','boolean','weight',1,'critical',true),
		jsonb_build_object('id','A14','title','Соблюдение температурного режима при транспортировке','description','Контроль транспорта внутри территории','type','number','weight',1,'critical',true),
		jsonb_build_object('id','A15','title','Контроль воды','description','Качество и температуры воды для технологических нужд','type','number','weight',1,'critical',true),
		jsonb_build_object('id','A16','title','Микробиологические пробы (по плану)','description','Наличие результатов/соответствие нормам','type','boolean','weight',1,'critical',false),
		jsonb_build_object('id','A17','title','Обучение персонала','description','Актуальность записей по обучению','type','boolean','weight',1,'critical',false),
		jsonb_build_object('id','A18','title','Этикетирование и сроки годности','description','Проверка соответствия маркировки с документами','type','boolean','weight',1,'critical',true)
	  ),
	  1,
	  NULL,
	  now()
	);
  END IF;
END$$;

-- Create sample users in profiles (use gen_random_uuid; in prod link to auth.users)
INSERT INTO profiles (id, full_name, email, phone, role, department_id, workshop_id, created_at) VALUES
  (gen_random_uuid(), 'Иван Директор', 'director@example.com', '+7-900-000-0001', 'director', NULL, NULL, now()),
  (gen_random_uuid(), 'Пётр Мастер', 'master@example.com', '+7-900-000-0002', 'master', (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок приёма сырья' LIMIT 1), now()),
  (gen_random_uuid(), 'Ольга Аудитор', 'auditor@example.com', '+7-900-000-0003', 'auditor', NULL, NULL, now()),
  (gen_random_uuid(), 'Алекс Рабочий', 'worker@example.com', '+7-900-000-0004', 'worker', (SELECT id FROM departments WHERE name = 'Цех переработки' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок фасовки' LIMIT 1), now())
ON CONFLICT DO NOTHING;

-- Sample CCPs and NCs
INSERT INTO ccp_monitoring (id, ccp_code, department_id, workshop_id, measured_by, measured_at, measurement_value, unit, pass, notes)
VALUES
  (gen_random_uuid(), 'CCP-01', (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), NULL, (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), now() - interval '2 hour', 4.3, '°C', TRUE, 'Температура в норме'),
  (gen_random_uuid(), 'CCP-02', (SELECT id FROM departments WHERE name = 'Цех переработки' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок фасовки' LIMIT 1), (SELECT id FROM profiles WHERE full_name = 'Алекс Рабочий' LIMIT 1), now() - interval '1 hour', 7.8, '°C', FALSE, 'Температура выше допустимой')
ON CONFLICT DO NOTHING;

INSERT INTO non_conformities (id, title, description, department_id, workshop_id, detected_by, detected_at, status, severity, photos, related_audit, assigned_to, created_at)
VALUES
  (gen_random_uuid(), 'Загрязнение конвейера', 'Найдены остатки продукта на ленте', (SELECT id FROM departments WHERE name = 'Цех переработки' LIMIT 1), (SELECT id FROM workshops WHERE name = 'Участок фасовки' LIMIT 1), (SELECT id FROM profiles WHERE full_name = 'Алекс Рабочий' LIMIT 1), now() - interval '3 day', 'open', 'high', NULL, NULL, (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), now()),
  (gen_random_uuid(), 'Аномальная температура при приёмке', 'Температура сырья выше нормы', (SELECT id FROM departments WHERE name = 'Цех убоя' LIMIT 1), NULL, (SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), now() - interval '1 day', 'in_progress', 'critical', NULL, NULL, (SELECT id FROM profiles WHERE full_name = 'Иван Директор' LIMIT 1), now())
ON CONFLICT DO NOTHING;

-- user_telegram mappings (placeholders)
INSERT INTO user_telegram (user_id, telegram_chat_id) VALUES
  ((SELECT id FROM profiles WHERE full_name = 'Иван Директор' LIMIT 1), '123456789'),
  ((SELECT id FROM profiles WHERE full_name = 'Пётр Мастер' LIMIT 1), '987654321')
ON CONFLICT DO NOTHING;

-- End of seed
