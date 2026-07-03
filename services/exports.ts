import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import { getSupabaseServerClient } from '../lib/supabaseClient'

// Примитивный экспорт аудитов в XLSX
export async function exportAuditsXlsx(options: { from?: string | null; to?: string | null; department_id?: string | null }) {
  const supabase = getSupabaseServerClient()
  const { data: audits } = await supabase
    .from('audits')
    .select('id,performed_at,performed_by,overall_score,notes,department_id,workshop_id,shift_id')
    .gte('performed_at', options.from || '1970-01-01')
    .lte('performed_at', options.to || new Date().toISOString())
    .order('performed_at', { ascending: false })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Audits')
  sheet.columns = [
    { header: 'ID', key: 'id', width: 36 },
    { header: 'Дата', key: 'performed_at', width: 24 },
    { header: 'Провел', key: 'performed_by', width: 36 },
    { header: 'Оценка', key: 'overall_score', width: 12 },
    { header: 'Отдел', key: 'department_id', width: 24 },
    { header: 'Цех', key: 'workshop_id', width: 24 },
    { header: 'Смена', key: 'shift_id', width: 18 },
    { header: 'Примечание', key: 'notes', width: 60 }
  ]

  (audits || []).forEach((a: any) => {
    sheet.addRow({ id: a.id, performed_at: a.performed_at, performed_by: a.performed_by, overall_score: a.overall_score, department_id: a.department_id, workshop_id: a.workshop_id, shift_id: a.shift_id, notes: a.notes })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}

// Примитивный экспорт несоответствий в XLSX
export async function exportNcXlsx(options: { from?: string | null; to?: string | null; department_id?: string | null }) {
  const supabase = getSupabaseServerClient()
  const { data: ncs } = await supabase
    .from('non_conformities')
    .select('id,title,severity,status,detected_by,detected_at,assigned_to,due_date')
    .order('detected_at', { ascending: false })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('NonConformities')
  sheet.columns = [
    { header: 'ID', key: 'id', width: 36 },
    { header: 'Заголовок', key: 'title', width: 40 },
    { header: 'Серьёзность', key: 'severity', width: 12 },
    { header: 'Статус', key: 'status', width: 14 },
    { header: 'Обнаружил', key: 'detected_by', width: 36 },
    { header: 'Дата', key: 'detected_at', width: 24 },
    { header: 'Назначен', key: 'assigned_to', width: 36 },
    { header: 'Срок', key: 'due_date', width: 18 }
  ]

  (ncs || []).forEach((n: any) => {
    sheet.addRow({ id: n.id, title: n.title, severity: n.severity, status: n.status, detected_by: n.detected_by, detected_at: n.detected_at, assigned_to: n.assigned_to, due_date: n.due_date })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}

// Простой PDF экспорт аудитов (таблица)
export async function exportAuditsPdf(options: { from?: string | null; to?: string | null }) {
  const supabase = getSupabaseServerClient()
  const { data: audits } = await supabase
    .from('audits')
    .select('id,performed_at,performed_by,overall_score,notes')
    .order('performed_at', { ascending: false })

  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  const chunks: Buffer[] = []
  doc.on('data', (chunk) => chunks.push(chunk))
  const title = `Отчёт по аудитам (${options.from || '...'} — ${options.to || '...'})`
  doc.fontSize(14).text(title, { align: 'center' })
  doc.moveDown()

  const tableTop = doc.y
  const itemHeight = 20
  // Header
  doc.fontSize(10).text('ID', 40, tableTop)
  doc.text('Дата', 180, tableTop)
  doc.text('Провёл', 260, tableTop)
  doc.text('Оценка', 380, tableTop)
  doc.text('Примечание', 440, tableTop)

  let y = tableTop + 18
  ;(audits || []).forEach((a: any) => {
    doc.fontSize(9).text(a.id.slice(0, 8), 40, y)
    doc.text(a.performed_at ? new Date(a.performed_at).toLocaleString() : '-', 180, y)
    doc.text(a.performed_by || '-', 260, y)
    doc.text(a.overall_score?.toString() || '-', 380, y)
    doc.text(a.notes ? (a.notes.length > 50 ? a.notes.substring(0, 47) + '...' : a.notes) : '-', 440, y, { width: 120 })
    y += itemHeight
    if (y > 730) { doc.addPage(); y = 40 }
  })

  doc.end()
  const pdfBuffer = Buffer.concat(chunks)
  return pdfBuffer
}

// Пример SQL / query шаблона для сложного отчёта (comment)
/*
SELECT a.id, a.performed_at, p.full_name as performer, a.overall_score,
  d.name as department, w.name as workshop, s.name as shift
FROM audits a
LEFT JOIN profiles p ON p.id = a.performed_by
LEFT JOIN departments d ON d.id = a.department_id
LEFT JOIN workshops w ON w.id = a.workshop_id
LEFT JOIN shifts s ON s.id = a.shift_id
WHERE a.performed_at BETWEEN '2026-07-01' AND '2026-07-02'
ORDER BY a.performed_at DESC;
*/

export default { exportAuditsXlsx, exportAuditsPdf, exportNcXlsx }
