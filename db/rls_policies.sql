-- RLS policies for SQM Control (improved per-role access)
-- Assumes user_role enum exists: ('director','master','auditor','worker')
-- Ensure pgcrypto extension for gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function: read role from JWT claims, fallback to profiles table
CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
	(current_setting('jwt.claims','true')::json ->> 'role'),
	(SELECT role::text FROM profiles WHERE id = auth.uid())
  );
$$;

-- Ensure profiles has a column for current shift (optional, used for RLS checks)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_shift_id uuid NULL;

-- Enable RLS and policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_self_or_director ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL AND (id = auth.uid() OR get_current_user_role() = 'director'));
CREATE POLICY profiles_update_self_or_director ON profiles FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (id = auth.uid() OR get_current_user_role() = 'director'))
  WITH CHECK (id = auth.uid() OR get_current_user_role() = 'director');
CREATE POLICY profiles_insert_director ON profiles FOR INSERT
  USING (get_current_user_role() = 'director')
  WITH CHECK (get_current_user_role() = 'director');

-- departments: select for authenticated, modify by director
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY departments_select_auth ON departments FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY departments_manage_director ON departments FOR INSERT, UPDATE, DELETE
  USING (get_current_user_role() = 'director')
  WITH CHECK (get_current_user_role() = 'director');

-- workshops: select for authenticated, modify by director
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY workshops_select_auth ON workshops FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY workshops_manage_director ON workshops FOR INSERT, UPDATE, DELETE
  USING (get_current_user_role() = 'director')
  WITH CHECK (get_current_user_role() = 'director');

-- shifts: visible to authenticated, modify by director
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY shifts_select_auth ON shifts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY shifts_manage_director ON shifts FOR INSERT, UPDATE, DELETE
  USING (get_current_user_role() = 'director') WITH CHECK (get_current_user_role() = 'director');

-- audit_templates: manage by director, read by auditors/master/director
ALTER TABLE audit_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_templates_select_auth ON audit_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY audit_templates_manage_director ON audit_templates FOR INSERT, UPDATE, DELETE
  USING (get_current_user_role() = 'director') WITH CHECK (get_current_user_role() = 'director');

-- audits
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
-- SELECT: director sees all, auditor sees all audits, master sees audits in own department/workshop, performer sees own
CREATE POLICY audits_select ON audits FOR SELECT
  USING (
	auth.uid() IS NOT NULL AND (
	  get_current_user_role() = 'director'
	  OR get_current_user_role() = 'auditor'
	  OR performed_by = auth.uid()
	  OR (
		get_current_user_role() = 'master' AND (
		  -- master may see audits in own department or workshop
		  (department_id IS NOT NULL AND department_id = (SELECT department_id FROM profiles WHERE id = auth.uid()))
		  OR (workshop_id IS NOT NULL AND workshop_id = (SELECT workshop_id FROM profiles WHERE id = auth.uid()))
		  -- or audits in the same shift as master's current_shift_id
		  OR (shift_id IS NOT NULL AND shift_id = (SELECT current_shift_id FROM profiles WHERE id = auth.uid()))
		)
	  )
	)
  );

-- INSERT: director, auditor, master (master limited to own dept/workshop)
CREATE POLICY audits_insert ON audits FOR INSERT
  USING (
	auth.uid() IS NOT NULL AND get_current_user_role() IN ('director','auditor','master')
  )
  WITH CHECK (
	(get_current_user_role() = 'director')
	OR (get_current_user_role() = 'auditor')
	OR (
	  get_current_user_role() = 'master' AND (
		(department_id IS NOT NULL AND department_id = (SELECT department_id FROM profiles WHERE id = auth.uid()))
		OR (workshop_id IS NOT NULL AND workshop_id = (SELECT workshop_id FROM profiles WHERE id = auth.uid()))
	  )
	)
  );

-- UPDATE: director or performer
CREATE POLICY audits_update ON audits FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (get_current_user_role() = 'director' OR performed_by = auth.uid()))
  WITH CHECK (get_current_user_role() = 'director' OR performed_by = auth.uid());

-- audit_results
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
-- SELECT: director, auditor, recorded_by, or master in same department of parent audit
CREATE POLICY audit_results_select ON audit_results FOR SELECT
  USING (
	auth.uid() IS NOT NULL AND (
	  get_current_user_role() = 'director'
	  OR get_current_user_role() = 'auditor'
	  OR recorded_by = auth.uid()
	  OR audit_id IN (SELECT id FROM audits WHERE department_id = (SELECT department_id FROM profiles WHERE id = auth.uid()) OR workshop_id = (SELECT workshop_id FROM profiles WHERE id = auth.uid()) )
	)
  );

-- INSERT: director, auditor, master (master only when audit belongs to their dept/workshop)
CREATE POLICY audit_results_insert ON audit_results FOR INSERT
  USING (auth.uid() IS NOT NULL AND get_current_user_role() IN ('director','auditor','master'))
  WITH CHECK (
	get_current_user_role() = 'director'
	OR get_current_user_role() = 'auditor'
	OR (
		get_current_user_role() = 'master' AND audit_id IN (
		SELECT id FROM audits WHERE (
		  department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())
		  OR workshop_id = (SELECT workshop_id FROM profiles WHERE id = auth.uid())
		  OR shift_id = (SELECT current_shift_id FROM profiles WHERE id = auth.uid())
		)
	  )
	)
  );

-- UPDATE: director or recorded_by
CREATE POLICY audit_results_update ON audit_results FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (get_current_user_role() = 'director' OR recorded_by = auth.uid()))
  WITH CHECK (get_current_user_role() = 'director' OR recorded_by = auth.uid());

-- ccp_monitoring
ALTER TABLE ccp_monitoring ENABLE ROW LEVEL SECURITY;
-- SELECT: director sees all, master sees own dept/workshop, user sees own records
CREATE POLICY ccp_select ON ccp_monitoring FOR SELECT
  USING (
	auth.uid() IS NOT NULL AND (
	  get_current_user_role() = 'director'
	  OR measured_by = auth.uid()
	  OR (
		get_current_user_role() = 'master' AND (
		  department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())
		  OR workshop_id = (SELECT workshop_id FROM profiles WHERE id = auth.uid())
		)
	  )
	)
  );

-- INSERT: any authenticated user, but workers restricted to creating ccp only
CREATE POLICY ccp_insert ON ccp_monitoring FOR INSERT
  USING (auth.uid() IS NOT NULL AND get_current_user_role() IN ('director','master','auditor','worker'))
  WITH CHECK (measured_by = auth.uid() OR get_current_user_role() = 'director');

-- UPDATE: director or measured_by
CREATE POLICY ccp_update ON ccp_monitoring FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (get_current_user_role() = 'director' OR measured_by = auth.uid()))
  WITH CHECK (get_current_user_role() = 'director' OR measured_by = auth.uid());

-- non_conformities
ALTER TABLE non_conformities ENABLE ROW LEVEL SECURITY;
-- SELECT: director, detected_by, assigned_to, master in same dept, auditor
CREATE POLICY nc_select ON non_conformities FOR SELECT
  USING (
	auth.uid() IS NOT NULL AND (
	  get_current_user_role() = 'director'
	  OR get_current_user_role() = 'auditor'
	  OR detected_by = auth.uid()
	  OR assigned_to = auth.uid()
	  OR (get_current_user_role() = 'master' AND department_id = (SELECT department_id FROM profiles WHERE id = auth.uid()))
	)
  );

-- INSERT: any authenticated user (report NC)
CREATE POLICY nc_insert ON non_conformities FOR INSERT
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (detected_by = auth.uid() OR get_current_user_role() = 'director');

-- UPDATE: director or assigned_to
CREATE POLICY nc_update ON non_conformities FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (get_current_user_role() = 'director' OR assigned_to = auth.uid()))
  WITH CHECK (get_current_user_role() = 'director' OR assigned_to = auth.uid());

-- corrective_actions
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
-- SELECT: director, creator, assignee, master in same dept, auditor
CREATE POLICY ca_select ON corrective_actions FOR SELECT
  USING (
	auth.uid() IS NOT NULL AND (
	  get_current_user_role() = 'director'
	  OR created_by = auth.uid()
	  OR assigned_to = auth.uid()
	  OR get_current_user_role() = 'auditor'
	  OR (get_current_user_role() = 'master' AND nc_id IN (SELECT id FROM non_conformities WHERE department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())))
	)
  );

-- INSERT: director, master, auditor
CREATE POLICY ca_insert ON corrective_actions FOR INSERT
  USING (auth.uid() IS NOT NULL AND get_current_user_role() IN ('director','master','auditor'))
  WITH CHECK (get_current_user_role() IN ('director','master','auditor'));

-- UPDATE: director or assigned_to
CREATE POLICY ca_update ON corrective_actions FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (get_current_user_role() = 'director' OR assigned_to = auth.uid()))
  WITH CHECK (get_current_user_role() = 'director' OR assigned_to = auth.uid());

-- products_batches: read authenticated, manage by director/master
ALTER TABLE products_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY pb_select ON products_batches FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY pb_manage ON products_batches FOR INSERT, UPDATE, DELETE
  USING (get_current_user_role() IN ('director','master')) WITH CHECK (get_current_user_role() IN ('director','master'));

-- documents: read authenticated, manage by director
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_select ON documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY documents_manage_director ON documents FOR INSERT, UPDATE, DELETE
  USING (get_current_user_role() = 'director') WITH CHECK (get_current_user_role() = 'director');

-- training_records: any authenticated can read own/department; create by director/master
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_select ON training_records FOR SELECT
  USING (auth.uid() IS NOT NULL AND (profile_id = auth.uid() OR get_current_user_role() = 'director' OR get_current_user_role() = 'auditor' OR department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY training_insert ON training_records FOR INSERT
  USING (auth.uid() IS NOT NULL AND get_current_user_role() IN ('director','master'))
  WITH CHECK (get_current_user_role() IN ('director','master'));

-- notifications: recipient can read, director can insert, server can insert
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (auth.uid() IS NOT NULL AND (recipient_id = auth.uid() OR get_current_user_role() = 'director'));
CREATE POLICY notifications_insert ON notifications FOR INSERT
  USING (auth.uid() IS NOT NULL AND (recipient_id = auth.uid() OR get_current_user_role() = 'director'))
  WITH CHECK (recipient_id = auth.uid() OR get_current_user_role() = 'director');

-- audit_log: inserts allowed by service role/director; select by director or actor
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_select ON audit_log FOR SELECT
  USING (auth.uid() IS NOT NULL AND (get_current_user_role() = 'director' OR actor_id = auth.uid()));
CREATE POLICY audit_log_insert ON audit_log FOR INSERT
  USING (auth.uid() IS NOT NULL AND (get_current_user_role() = 'director' OR TRUE))
  WITH CHECK (TRUE);

-- End of RLS policies
