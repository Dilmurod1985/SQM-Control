// TypeScript interfaces for SQM Control (DB models)
// Автоген. Отражает структуру таблиц Supabase/Postgres

export type UserRole = 'director' | 'master' | 'auditor' | 'worker';
export type NCStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type NCSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DocumentStatus = 'draft' | 'active' | 'archived';

export interface UploadMeta {
  key: string;
  url?: string;
  size?: number;
  mime?: string;
  uploaded_at?: string; // ISO
}

export interface Profile {
  id: string; // uuid (auth.users)
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  department_id?: string | null;
  workshop_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  created_at?: string;
}

export interface Workshop {
  id: string;
  department_id?: string | null;
  name: string;
  code?: string | null;
  description?: string | null;
  created_at?: string;
}

export interface Shift {
  id: string;
  name: string;
  start_time?: string | null; // HH:MM:SS
  end_time?: string | null; // HH:MM:SS
  created_at?: string;
}

export type AuditItemType = 'boolean' | 'scale' | 'text' | 'number' | 'select';

export interface AuditTemplateItem {
  id: string;
  title: string;
  description?: string;
  type: AuditItemType;
  weight?: number;
  critical?: boolean;
  options?: string[]; // for select
}

export interface AuditTemplate {
  id: string;
  title: string;
  description?: string | null;
  items: AuditTemplateItem[]; // JSONB
  version?: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Audit {
  id: string;
  template_id?: string | null;
  department_id?: string | null;
  workshop_id?: string | null;
  shift_id?: string | null;
  performed_by?: string | null;
  performed_at?: string | null;
  overall_score?: number | null;
  notes?: string | null;
  attachments?: UploadMeta[] | null;
  created_at?: string;
}

export interface AuditResult {
  id: string;
  audit_id: string;
  item_id?: string | null;
  item_title?: string | null;
  status?: string | null; // 'ok'|'minor'|... произвольно
  score?: number | null;
  comment?: string | null;
  photo?: UploadMeta | null;
  recorded_by?: string | null;
  recorded_at?: string | null;
}

export interface CCPMonitoring {
  id: string;
  ccp_code: string;
  department_id?: string | null;
  workshop_id?: string | null;
  measured_by?: string | null;
  measured_at?: string | null;
  measurement_value?: number | null;
  unit?: string | null;
  pass?: boolean | null;
  photo?: UploadMeta | null;
  location?: { lat?: number; lng?: number; accuracy?: number } | null;
  notes?: string | null;
}

export interface NonConformity {
  id: string;
  title: string;
  description?: string | null;
  department_id?: string | null;
  workshop_id?: string | null;
  detected_by?: string | null;
  detected_at?: string | null;
  status?: NCStatus;
  severity?: NCSeverity;
  photos?: UploadMeta[] | null;
  related_audit?: string | null;
  assigned_to?: string | null;
  due_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CorrectiveAction {
  id: string;
  nc_id: string;
  title: string;
  description?: string | null;
  created_by?: string | null;
  assigned_to?: string | null;
  created_at?: string | null;
  due_date?: string | null;
  completed?: boolean | null;
  completed_at?: string | null;
  evidence?: UploadMeta[] | null;
}

export interface ProductBatch {
  id: string;
  product_code: string;
  product_name: string;
  batch_number: string;
  production_date?: string | null;
  expiry_date?: string | null;
  quantity?: number | null;
  unit?: string | null;
  trace_events?: any[] | null;
  documents?: UploadMeta[] | null;
  created_at?: string | null;
}

export interface DocumentRecord {
  id: string;
  title: string;
  version?: number | null;
  status?: DocumentStatus | null;
  file?: UploadMeta | null;
  notes?: string | null;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
}

export interface TrainingRecord {
  id: string;
  profile_id: string;
  course_name: string;
  date_taken?: string | null;
  expiry_date?: string | null;
  certificate?: UploadMeta | null;
  notes?: string | null;
  recorded_by?: string | null;
  recorded_at?: string | null;
}

export interface NotificationRecord {
  id: string;
  recipient_id: string;
  actor_id?: string | null;
  type?: string | null;
  payload?: Record<string, any> | null;
  read?: boolean | null;
  created_at?: string | null;
}

export interface AuditLogRecord {
  id: number; // bigserial
  actor_id?: string | null;
  action: string;
  object_type?: string | null;
  object_id?: string | null;
  changes?: Record<string, any> | null;
  created_at?: string | null;
}

// API types
export interface CreateAuditPayload {
  template_id?: string | null;
  department_id?: string | null;
  workshop_id?: string | null;
  shift_id?: string | null;
  performed_by?: string | null;
  performed_at?: string | null;
  results: Partial<AuditResult>[];
  notes?: string | null;
  attachments?: UploadMeta[];
}

export interface ExportOptions {
  format: 'xlsx' | 'pdf';
  from?: string | null; // ISO date
  to?: string | null;
  department_id?: string | null;
}

export default {} as const;
