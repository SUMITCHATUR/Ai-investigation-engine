import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { getCaseAuditTrail, getCaseNotes, getCaseReview, getStructuredEvidence, recordAuditEvent } from '../data'
import { runInvestigation } from './investigationEngine'

const disclaimer = 'TRACE//AI identifies suspicious patterns and supports human investigation. It does not independently determine fraud, guilt, intent, or legal responsibility. Final decisions must be made by authorized human investigators.'
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
const dateLabel = (value) => value ? new Date(value).toLocaleString('en-IN') : 'Not available'

function reportModel(caseItem) {
  const analysis = runInvestigation(caseItem.caseId)
  const evidence = getStructuredEvidence(caseItem)
  return {
    caseItem,
    analysis,
    notes: getCaseNotes(caseItem.caseId),
    review: getCaseReview(caseItem.caseId),
    evidence,
    paymentId: caseItem.relatedRecords?.find((item) => item.type === 'Payment')?.id || evidence.find((item) => item.type === 'Payment')?.source_id || caseItem.payment || 'Not available',
    vendorId: evidence.find((item) => item.type === 'Vendor')?.description.match(/VND-[\w-]+/)?.[0] || caseItem.vendorId || 'Not available',
  }
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportCaseCsv(caseItem) {
  const model = reportModel(caseItem)
  const headers = ['case_id', 'project_id', 'project_name', 'vendor_id', 'vendor_name', 'invoice_id', 'invoice_amount', 'expected_amount', 'payment_id', 'payment_amount', 'progress_percentage', 'risk_score', 'risk_level', 'status', 'priority', 'created_date', 'updated_date', 'anomaly_type', 'anomaly_score']
  const anomalies = model.analysis.anomalies.length ? model.analysis.anomalies : [{ title: '', score: '' }]
  const escape = (value) => {
    const str = String(value ?? '')
    const safeStr = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str
    return `"${safeStr.replaceAll('"', '""')}"`
  }
  const rows = anomalies.map((anomaly) => [
    caseItem.caseId, caseItem.projectId, caseItem.projectName, caseItem.vendorId || 'VND-UNKNOWN', caseItem.vendor, caseItem.invoiceId,
    caseItem.invoiceAmount, caseItem.expectedAmount, model.paymentId, caseItem.paymentAmount, caseItem.projectProgress,
    model.analysis.riskScore, model.analysis.riskLevel, caseItem.status, caseItem.priority, caseItem.createdDate, caseItem.updatedDate,
    anomaly.title, anomaly.score,
  ])
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
  recordAuditEvent(caseItem.caseId, 'CSV exported', 'Structured case and anomaly data exported')
  saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${caseItem.caseId}-case-data.csv`)
}

export async function exportCasePdf(caseItem) {
  const model = reportModel(caseItem)
  recordAuditEvent(caseItem.caseId, 'Report generated', 'Investigation PDF report generated')
  const audit = getCaseAuditTrail(caseItem.caseId)
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const fetchFont = async (url) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to load font: ${url}`)
    return res.arrayBuffer()
  }
  const [regularBytes, boldBytes] = await Promise.all([
    fetchFont('/fonts/Nirmala.ttf'),
    fetchFont('/fonts/NirmalaB.ttf'),
  ])
  const regularFont = await pdf.embedFont(regularBytes, { subset: false })
  const boldFont = await pdf.embedFont(boldBytes, { subset: false })
  const margin = 42
  const width = 595 - margin * 2
  const lineHeight = 13
  let page = pdf.addPage([595, 842])
  let cursor = 48

  const ensureSpace = (height = lineHeight) => {
    if (cursor + height > 800) {
      page = pdf.addPage([595, 842])
      cursor = 48
    }
  }
  const wrap = (text, font, size) => {
    const words = String(text || 'Not available').split(/(\s+)/)
    const lines = []
    let current = ''
    words.forEach((part) => {
      const candidate = current + part
      try {
        if (font.widthOfTextAtSize(candidate, size) > width && current.trim()) {
          lines.push(current.trimEnd())
          current = part.trimStart()
        } else {
          current = candidate
        }
      } catch {
        current += part
      }
    })
    if (current.trim()) lines.push(current.trimEnd())
    return lines
  }
  const heading = (text, size = 14) => {
    ensureSpace(30)
    page.drawText(text, { x: margin, y: 842 - cursor, size, font: boldFont, color: rgb(28 / 255, 42 / 255, 53 / 255) })
    cursor += size + 10
  }
  const lines = (text, size = 9, gap = lineHeight) => {
    wrap(text, regularFont, size).forEach((line) => {
      ensureSpace(gap)
      page.drawText(line, { x: margin, y: 842 - cursor, size, font: regularFont, color: rgb(55 / 255, 65 / 255, 72 / 255) })
      cursor += gap
    })
  }
  const field = (label, value) => lines(`${label}: ${value}`, 9)
  const list = (items) => (items.length ? items : ['None recorded']).forEach((item) => lines(`- ${item}`, 9))

  page.drawRectangle({ x: 0, y: 747, width: 595, height: 95, color: rgb(22 / 255, 33 / 255, 42 / 255) })
  page.drawText('TRACE//AI', { x: margin, y: 796, size: 22, font: boldFont, color: rgb(1, 1, 1) })
  page.drawText('Investigation Report', { x: margin, y: 772, size: 12, font: boldFont, color: rgb(1, 1, 1) })
  cursor = 122

  heading('Case Information')
  ;[
    ['Case ID', caseItem.caseId], ['Project ID', caseItem.projectId], ['Project Name', caseItem.projectName],
    ['Vendor ID', model.vendorId], ['Vendor Name', caseItem.vendor], ['Invoice ID', caseItem.invoiceId],
    ['Invoice Amount', money(caseItem.invoiceAmount)], ['Expected Amount', money(caseItem.expectedAmount)], ['Payment ID', model.paymentId],
    ['Payment Amount', money(caseItem.paymentAmount)], ['Project Progress', `${caseItem.projectProgress}%`], ['Risk Score', `${model.analysis.riskScore}/100`],
    ['Risk Level', model.analysis.riskLevel], ['Status', caseItem.status], ['Priority', caseItem.priority], ['Created Date', caseItem.createdDate], ['Updated Date', caseItem.updatedDate],
  ].forEach(([label, value]) => field(label, value))

  heading('Executive Summary')
  lines(model.analysis.findings.map((finding) => `${finding.title}: ${finding.explanation}`).join(' '))

  heading('Key Findings')
  list(model.analysis.findings.map((finding) => `${finding.title}: ${finding.explanation}`))

  heading('Detailed Anomaly Explanations')
  model.analysis.anomalies.forEach((anomaly) => {
    field('Anomaly type', anomaly.title)
    field('Anomaly score', `${anomaly.score}/100`)
    field('Detected', anomaly.value)
    field('Why suspicious', anomaly.explanation)
    field('Supporting data', anomaly.expected)
    field('Risk contribution', `${anomaly.score} points`)
    cursor += 4
  })

  heading('Risk Contributions')
  list(model.analysis.anomalies.map((anomaly) => `${anomaly.title}: ${anomaly.score} points`))

  heading('Recommendations')
  list(model.analysis.recommendations)

  heading('Evidence / Source Records')
  model.evidence.forEach((item) => lines(`${item.evidence_id} | ${item.type} | ${item.source_id} | ${item.description} | ${item.date} | ${item.value}`))

  heading('Timeline')
  list(model.analysis.timeline.map((item) => `${item.date} | ${item.event} | ${item.detail}`))

  heading('Related Cases / Records')
  list((model.analysis.related || []).map((item) => `${item.id} | ${item.label} | ${item.amount} | ${item.date}`))

  heading('Human Review')
  field('Review status', model.review?.status || caseItem.status)
  field('Reviewer', model.review?.reviewer || 'Not reviewed')
  field('Decision', model.review?.decision || 'Pending Review')
  field('Review timestamp', dateLabel(model.review?.timestamp))
  field('Review comments', model.review?.comments || 'None recorded')

  heading('Investigator Notes')
  list(model.notes.map((note) => `${note.case_id} | ${note.note_id} | ${note.author} | ${dateLabel(note.timestamp)} | ${note.content}`))

  heading('Audit Trail')
  list(audit.map((event) => `${event.audit_id} | ${event.action} | ${event.actor} | ${dateLabel(event.timestamp)} | ${event.details}`))

  heading('Generated Date')
  lines(dateLabel(new Date().toISOString()))
  heading('TRACE//AI Disclaimer')
  lines(disclaimer, 8, 11)

  const bytes = await pdf.save()
  saveBlob(new Blob([bytes], { type: 'application/pdf' }), `${caseItem.caseId}-investigation-report.pdf`)
}
