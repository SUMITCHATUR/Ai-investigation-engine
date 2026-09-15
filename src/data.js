const record = (id, projectId, projectName, department, location, vendor, invoiceId, invoiceAmount, expectedAmount, paymentAmount, projectProgress, contractValue, invoiceDate, paymentDate, vendorRiskScore, status, anomalySignals, relatedRecords, timelineEvents, evidence, possibleLegitimateExplanations, recommendedActions) => ({
  id, caseId: id, projectId, projectName, project: projectName, department, location, vendor, vendorId: evidence.find((item) => item.type === 'Vendor')?.meta.match(/VND-[\w-]+/)?.[0] || '', invoiceId, invoice: invoiceId, invoiceAmount, amount: invoiceAmount, expectedAmount, paymentAmount, payment: evidence.find((item) => item.type === 'Payment')?.label || '', projectProgress, contractValue, invoiceDate, paymentDate, vendorRiskScore, status, anomalySignals, relatedRecords, timelineEvents, evidence, possibleLegitimateExplanations, recommendedActions, date: invoiceDate, category: department,
  priority: 'Medium', createdDate: invoiceDate, updatedDate: invoiceDate, investigationDate: invoiceDate, riskScore: vendorRiskScore, riskLevel: 'MEDIUM', notes: '', assignedTo: 'Analyst Desk'
})

const related = (id, label, amount, date, type = 'Invoice') => ({ id, label, amount, date, type })
const event = (date, name, detail, flag = false) => ({ date, event: name, detail, flag })
const node = (type, label, meta, tone) => ({ type, label, meta, tone })
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

export const BASE_CASES = [
  record('CASE-1042', 'PRJ-2026-184', 'Rural Infrastructure Development Project', 'Infrastructure Development', 'Maharashtra', 'Apex Infrastructure Pvt. Ltd.', 'INV-2026-1042', 850000, 500000, 1008000, 42, 2400000, '08 Mar 2026', '10 Mar 2026', 84, 'Under Investigation', ['Invoice variance', 'Payment-progress mismatch', 'Duplicate pattern', 'Early payment'], [related('INV-2026-0987', 'Similar work description', 420000, '11 Mar 2026'), related('PAY-2026-7741', 'Same vendor payment', 610000, '31 Jan 2026'), related('PRG-2026-184-04', 'Progress report at 42%', '42%', '05 Mar 2026', 'Progress')], [event('10 Jan 2026', 'Contract created', 'Contract PRJ-2026-184 approved'), event('18 Feb 2026', 'Milestone 1 recorded', 'Foundation work accepted'), event('05 Mar 2026', 'Project progress updated', 'Progress recorded at 42%', true), event('08 Mar 2026', 'Invoice submitted', 'INV-2026-1042 submitted'), event('10 Mar 2026', 'Payment initiated', 'PAY-2026-7741 released', true), event('12 Mar 2026', 'Anomaly flagged', 'Connected transaction pattern detected', true)], [node('Project', 'PRJ-2026-184', 'Maharashtra · 42% complete', 'green'), node('Vendor', 'Apex Infrastructure Pvt. Ltd.', 'Vendor · VND-1184', 'blue'), node('Invoice', 'INV-2026-1042', '₹8,50,000 vs ₹5,00,000 expected', 'amber'), node('Payment', 'PAY-2026-7741', '₹10,08,000 released', 'red'), node('Progress', 'PRG-2026-184-04', '42% recorded · 05 Mar 2026', 'green')], ['Approved scope modification', 'Additional work completed but not yet recorded', 'Delayed project-progress update', 'Invoice coding or documentation error'], ['Verify invoice against contract and scope changes', 'Review progress reports and site certification', 'Check related vendor transactions', 'Request supporting documentation']),
  record('CASE-1051', 'PRJ-2026-231', 'District Health Equipment Upgrade', 'Public Health', 'Telangana', 'Medisource Systems', 'INV-2026-1051', 1260000, 900000, 1323000, 36, 3000000, '14 Mar 2026', '15 Mar 2026', 79, 'Under Review', ['Invoice variance', 'Payment-progress mismatch', 'Early payment'], [related('INV-2026-1032', 'Same vendor, adjacent lot', 1180000, '02 Mar 2026'), related('PAY-2026-7790', 'Advance payment', 1323000, '15 Mar 2026', 'Payment')], [event('20 Jan 2026', 'Purchase order issued', 'PO-2026-442 approved'), event('10 Mar 2026', 'Delivery milestone', '36% equipment received'), event('14 Mar 2026', 'Invoice submitted', 'Invoice exceeds expected lot value', true), event('15 Mar 2026', 'Payment released', 'Payment released within 24 hours', true)], [node('Project', 'PRJ-2026-231', 'Telangana · 36% complete', 'green'), node('Vendor', 'Medisource Systems', 'Vendor · VND-2042', 'blue'), node('Invoice', 'INV-2026-1051', '₹12,60,000', 'amber'), node('Payment', 'PAY-2026-7790', '₹13,23,000 released', 'red')], ['Equipment may have been delivered in an unrecorded batch', 'Approved advance may explain payment timing'], ['Validate goods receipt notes', 'Review advance-payment approval', 'Confirm delivered quantities with department']),
  record('CASE-1047', 'PRJ-2026-207', 'Urban Water Resilience Works', 'Water Utilities', 'Karnataka', 'BlueRiver Civil Works', 'INV-2026-1047', 1190000, 980000, 1071000, 58, 1850000, '11 Mar 2026', '20 Mar 2026', 73, 'Under Investigation', ['Invoice variance', 'Vendor concentration'], [related('INV-2026-0991', 'Same vendor, same corridor', 1150000, '19 Feb 2026'), related('PRG-2026-207-03', 'Progress certificate', '58%', '09 Mar 2026', 'Progress')], [event('12 Jan 2026', 'Contract created', 'Flood-control package approved'), event('09 Mar 2026', 'Progress certified', '58% work completed'), event('11 Mar 2026', 'Invoice submitted', 'Invoice above expected range', true), event('20 Mar 2026', 'Payment released', 'Payment matched approved milestone')], [node('Project', 'PRJ-2026-207', 'Karnataka · 58% complete', 'green'), node('Vendor', 'BlueRiver Civil Works', 'Vendor · VND-1658', 'blue'), node('Invoice', 'INV-2026-1047', '₹11,90,000', 'amber'), node('Progress', 'PRG-2026-207-03', '58% certified', 'green')], ['Scope variation may explain the invoice difference'], ['Obtain approved variation order', 'Compare invoice quantities with site certificate']),
  record('CASE-1043', 'PRJ-2026-199', 'School Digital Learning Program', 'Education Technology', 'Rajasthan', 'Northstar Technologies', 'INV-2026-1043', 284000, 260000, 284000, 71, 820000, '06 Mar 2026', '18 Mar 2026', 55, 'Under Review', ['Amount similarity'], [related('INV-2026-1018', 'Similar device batch', 281000, '16 Feb 2026'), related('PRG-2026-199-05', 'Delivery completion', '71%', '04 Mar 2026', 'Progress')], [event('15 Jan 2026', 'Order approved', 'Devices and training package approved'), event('04 Mar 2026', 'Delivery updated', '71% delivery recorded'), event('06 Mar 2026', 'Invoice submitted', 'Invoice within expected range'), event('18 Mar 2026', 'Payment released', 'Payment followed approval window')], [node('Project', 'PRJ-2026-199', 'Rajasthan · 71% complete', 'green'), node('Vendor', 'Northstar Technologies', 'Vendor · VND-3021', 'blue'), node('Invoice', 'INV-2026-1043', '₹2,84,000', 'amber'), node('Progress', 'PRG-2026-199-05', '71% delivered', 'green')], ['Batch pricing may explain similar invoice totals'], ['Compare device serial ranges', 'Confirm duplicate-looking amount is a separate delivery']),
  record('CASE-1039', 'PRJ-2026-176', 'Rural Solar Microgrid Phase II', 'Renewable Energy', 'Odisha', 'SunGrid Energy Co.', 'INV-2026-1039', 640000, 650000, 640000, 68, 1400000, '21 Feb 2026', '02 Mar 2026', 31, 'Reviewed', ['No major anomaly'], [related('PRG-2026-176-06', 'Milestone certificate', '68%', '19 Feb 2026', 'Progress')], [event('05 Jan 2026', 'Contract created', 'Microgrid phase II approved'), event('19 Feb 2026', 'Milestone certified', '68% complete'), event('21 Feb 2026', 'Invoice submitted', 'Invoice within expected range'), event('02 Mar 2026', 'Payment released', 'Payment followed certification')], [node('Project', 'PRJ-2026-176', 'Odisha · 68% complete', 'green'), node('Vendor', 'SunGrid Energy Co.', 'Vendor · VND-2210', 'blue'), node('Invoice', 'INV-2026-1039', '₹6,40,000', 'amber'), node('Progress', 'PRG-2026-176-06', '68% certified', 'green')], ['Routine milestone billing is consistent with project progress'], ['Retain milestone certificate', 'Close after standard document retention review']),
  record('CASE-1034', 'PRJ-2026-163', 'Coastal Road Maintenance Package', 'Roads and Transport', 'Goa', 'Harborline Contractors', 'INV-2026-1034', 518000, 500000, 518000, 52, 1100000, '16 Feb 2026', '28 Feb 2026', 46, 'New', ['Minor invoice variance'], [related('PRG-2026-163-02', 'Maintenance progress', '52%', '14 Feb 2026', 'Progress')], [event('08 Jan 2026', 'Work order issued', 'Maintenance package opened'), event('14 Feb 2026', 'Progress updated', '52% completed'), event('16 Feb 2026', 'Invoice submitted', 'Small variance over expected amount'), event('28 Feb 2026', 'Payment released', 'Payment after approval')], [node('Project', 'PRJ-2026-163', 'Goa · 52% complete', 'green'), node('Vendor', 'Harborline Contractors', 'Vendor · VND-1904', 'blue'), node('Invoice', 'INV-2026-1034', '₹5,18,000', 'amber'), node('Progress', 'PRG-2026-163-02', '52% complete', 'green')], ['Seasonal material price adjustment'], ['Check approved material-rate revision']),
  record('CASE-1028', 'PRJ-2026-152', 'Public Transport Fleet Renewal', 'Urban Mobility', 'Gujarat', 'TransitWorks India', 'INV-2026-1028', 2330000, 1900000, 2330000, 24, 6200000, '09 Feb 2026', '10 Feb 2026', 81, 'Under Review', ['Invoice variance', 'Payment-progress mismatch', 'Early payment'], [related('INV-2026-0966', 'Similar vehicle tranche', 2290000, '28 Jan 2026'), related('PAY-2026-7611', 'Advance release', 2330000, '10 Feb 2026', 'Payment')], [event('03 Jan 2026', 'Contract signed', 'Fleet renewal contract approved'), event('05 Feb 2026', 'First delivery', '24% of fleet received'), event('09 Feb 2026', 'Invoice submitted', 'Full tranche invoiced early', true), event('10 Feb 2026', 'Payment released', 'Payment before delivery milestone', true)], [node('Project', 'PRJ-2026-152', 'Gujarat · 24% complete', 'green'), node('Vendor', 'TransitWorks India', 'Vendor · VND-4120', 'blue'), node('Invoice', 'INV-2026-1028', '₹23,30,000', 'amber'), node('Payment', 'PAY-2026-7611', '₹23,30,000 released', 'red')], ['Approved mobilization advance', 'Delivery records may not be synchronized'], ['Verify vehicle delivery records', 'Review advance approval and contract terms']),
  record('CASE-1021', 'PRJ-2026-141', 'Agricultural Cold Storage Network', 'Agriculture and Food', 'Punjab', 'FreshRoute Logistics', 'INV-2026-1021', 372000, 410000, 372000, 79, 920000, '01 Feb 2026', '12 Feb 2026', 27, 'Reviewed', ['No major anomaly'], [related('PRG-2026-141-07', 'Storage capacity deployed', '79%', '30 Jan 2026', 'Progress')], [event('02 Jan 2026', 'Contract created', 'Cold storage rollout approved'), event('30 Jan 2026', 'Capacity certified', '79% of planned capacity active'), event('01 Feb 2026', 'Invoice submitted', 'Within expected range'), event('12 Feb 2026', 'Payment released', 'Standard approval cycle')], [node('Project', 'PRJ-2026-141', 'Punjab · 79% complete', 'green'), node('Vendor', 'FreshRoute Logistics', 'Vendor · VND-2780', 'blue'), node('Invoice', 'INV-2026-1021', '₹3,72,000', 'amber'), node('Progress', 'PRG-2026-141-07', '79% active', 'green')], ['Routine capacity-based billing'], ['Close after standard reconciliation']),
  record('CASE-1017', 'PRJ-2026-134', 'Municipal Waste Segregation Pilot', 'Municipal Services', 'Kerala', 'GreenLoop Civic Solutions', 'INV-2026-1017', 780000, 620000, 780000, 33, 1500000, '27 Jan 2026', '28 Jan 2026', 68, 'Under Investigation', ['Invoice variance', 'Payment-progress mismatch', 'Early payment'], [related('INV-2026-1016', 'Same amount reference', 780000, '26 Jan 2026'), related('PRG-2026-134-01', 'Pilot progress', '33%', '25 Jan 2026', 'Progress')], [event('04 Jan 2026', 'Pilot contract signed', 'Ward cluster selected'), event('25 Jan 2026', 'Progress updated', '33% pilot coverage'), event('26 Jan 2026', 'Similar invoice submitted', 'Reference invoice same amount', true), event('27 Jan 2026', 'Invoice submitted', 'Amount exceeds expected range', true), event('28 Jan 2026', 'Payment released', 'Released next day', true)], [node('Project', 'PRJ-2026-134', 'Kerala · 33% complete', 'green'), node('Vendor', 'GreenLoop Civic Solutions', 'Vendor · VND-3388', 'blue'), node('Invoice', 'INV-2026-1017', '₹7,80,000', 'amber'), node('Invoice', 'INV-2026-1016', 'Similar amount · 26 Jan', 'red')], ['A mobilization advance may have been approved', 'Two wards may have been billed under separate work orders'], ['Match invoices to ward-level work orders', 'Verify advance approval and pilot coverage']),
  record('CASE-1009', 'PRJ-2026-118', 'Community Water Monitoring Grid', 'Water Utilities', 'Madhya Pradesh', 'AquaMetric Labs', 'INV-2026-1009', 455000, 430000, 455000, 61, 980000, '18 Jan 2026', '02 Feb 2026', 51, 'New', ['Minor invoice variance'], [related('PRG-2026-118-04', 'Sensor installation report', '61%', '16 Jan 2026', 'Progress')], [event('12 Dec 2025', 'Contract created', 'Monitoring grid approved'), event('16 Jan 2026', 'Installation updated', '61% sensors installed'), event('18 Jan 2026', 'Invoice submitted', 'Small variance recorded'), event('02 Feb 2026', 'Payment released', 'Standard review completed')], [node('Project', 'PRJ-2026-118', 'Madhya Pradesh · 61% complete', 'green'), node('Vendor', 'AquaMetric Labs', 'Vendor · VND-2477', 'blue'), node('Invoice', 'INV-2026-1009', '₹4,55,000', 'amber'), node('Progress', 'PRG-2026-118-04', '61% installed', 'green')], ['Additional calibration work may explain variance'], ['Check calibration work order']),
  record('CASE-1004', 'PRJ-2026-109', 'District Nutrition Supply Chain', 'Public Health', 'Bihar', 'NourishLine Supplies', 'INV-2026-1004', 915000, 680000, 915000, 47, 2100000, '12 Jan 2026', '13 Jan 2026', 76, 'Under Review', ['Invoice variance', 'Payment-progress mismatch', 'Vendor concentration'], [related('INV-2026-0998', 'Same vendor, prior district', 890000, '29 Dec 2025'), related('PAY-2026-7420', 'Early release', 915000, '13 Jan 2026', 'Payment')], [event('08 Dec 2025', 'Supply contract signed', 'District supply package approved'), event('08 Jan 2026', 'Delivery updated', '47% delivered'), event('12 Jan 2026', 'Invoice submitted', 'Invoice exceeds planned batch', true), event('13 Jan 2026', 'Payment released', 'Payment released before full delivery', true)], [node('Project', 'PRJ-2026-109', 'Bihar · 47% complete', 'green'), node('Vendor', 'NourishLine Supplies', 'Vendor · VND-3651', 'blue'), node('Invoice', 'INV-2026-1004', '₹9,15,000', 'amber'), node('Payment', 'PAY-2026-7420', 'Early release', 'red')], ['Emergency stock buffer may explain early billing'], ['Verify stock receipt and emergency procurement approval']),
  record('CASE-0996', 'PRJ-2026-097', 'Regional Skills Lab Modernization', 'Skill Development', 'Uttar Pradesh', 'LearnForge Services', 'INV-2026-0996', 560000, 560000, 560000, 82, 1200000, '05 Jan 2026', '19 Jan 2026', 34, 'Reviewed', ['No major anomaly'], [related('PRG-2026-097-08', 'Lab completion certificate', '82%', '03 Jan 2026', 'Progress')], [event('02 Nov 2025', 'Contract created', 'Skills lab package approved'), event('03 Jan 2026', 'Completion certified', '82% modernization complete'), event('05 Jan 2026', 'Invoice submitted', 'Matches expected amount'), event('19 Jan 2026', 'Payment released', 'Standard approval timing')], [node('Project', 'PRJ-2026-097', 'Uttar Pradesh · 82% complete', 'green'), node('Vendor', 'LearnForge Services', 'Vendor · VND-1811', 'blue'), node('Invoice', 'INV-2026-0996', '₹5,60,000', 'amber'), node('Progress', 'PRG-2026-097-08', '82% certified', 'green')], ['Certified milestone billing appears consistent'], ['Close after retaining completion certificate']),
  record('CASE-0988', 'PRJ-2026-088', 'Hill District Connectivity Upgrade', 'Digital Infrastructure', 'Himachal Pradesh', 'SignalPeak Networks', 'INV-2026-0988', 1480000, 1100000, 1480000, 29, 3600000, '28 Dec 2025', '29 Dec 2025', 88, 'Under Investigation', ['Invoice variance', 'Payment-progress mismatch', 'Duplicate pattern', 'Early payment'], [related('INV-2026-0984', 'Similar amount, same vendor', 1475000, '27 Dec 2025'), related('PAY-2026-7312', 'Immediate payment', 1480000, '29 Dec 2025', 'Payment'), related('PRG-2026-088-02', 'Connectivity progress', '29%', '26 Dec 2025', 'Progress')], [event('15 Nov 2025', 'Contract created', 'Connectivity package approved'), event('26 Dec 2025', 'Progress updated', '29% towers connected', true), event('27 Dec 2025', 'Similar invoice detected', 'Reference amount within 0.4%', true), event('28 Dec 2025', 'Invoice submitted', 'Invoice above expected range', true), event('29 Dec 2025', 'Payment released', 'Payment released next day', true)], [node('Project', 'PRJ-2026-088', 'Himachal Pradesh · 29% complete', 'green'), node('Vendor', 'SignalPeak Networks', 'Vendor · VND-4402', 'blue'), node('Invoice', 'INV-2026-0988', '₹14,80,000', 'amber'), node('Invoice', 'INV-2026-0984', '₹14,75,000 similar amount', 'red')], ['Mobilization billing may be allowed by contract', 'Two work packages may have been consolidated'], ['Review work-package mapping', 'Validate tower installation records', 'Check approval chain for mobilization billing']),
]

const STORAGE_KEY = 'trace-ai-case-store-v1'

const now = () => new Date().toISOString()
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const readStore = () => {
  if (typeof window === 'undefined') return { cases: BASE_CASES, notes: [], reviews: [], audit: [] }
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (stored?.cases?.length) {
      const storedById = new Map(stored.cases.map((item) => [item.caseId, item]))
      const importedCases = stored.cases.filter((item) => !BASE_CASES.some((baseCase) => baseCase.caseId === item.caseId))
      return {
        ...stored,
        cases: [
          ...BASE_CASES.map((baseCase) => ({ ...baseCase, ...storedById.get(baseCase.caseId), payment: baseCase.payment, vendorId: baseCase.vendorId })),
          ...importedCases,
        ],
      }
    }
  } catch {
    // Ignore malformed local browser state and restore the canonical demo data.
  }
  return { cases: BASE_CASES, notes: [], reviews: [], audit: [] }
}

const store = readStore()
export const cases = store.cases

export const CASE_STATUS_VALUES = ['New', 'Under Review', 'Under Investigation', 'Reviewed']
export const CASE_RISK_VALUES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

const notifyCaseListeners = () => {
  for (const listener of caseListeners) listener()
}

const caseListeners = new Set()

const persistStore = () => {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  notifyCaseListeners()
}

const addAuditEvent = (caseId, action, details, actor = 'Analyst') => {
  store.audit.push({ audit_id: createId('AUDIT'), case_id: caseId, action, actor, timestamp: now(), details })
}

export function subscribeToCases(listener) {
  caseListeners.add(listener)
  return () => caseListeners.delete(listener)
}

export function getAllCases() {
  return cases
}

export function getCaseById(caseId) {
  return cases.find((candidate) => candidate.caseId === caseId || candidate.id === caseId) || null
}

export function getRiskLevelFromScore(score) {
  const numericScore = Number(score) || 0
  if (numericScore >= 80) return 'CRITICAL'
  if (numericScore >= 60) return 'HIGH'
  if (numericScore >= 30) return 'MEDIUM'
  return 'LOW'
}

// Normalize a raw CSV header for alias lookup:
// trim whitespace, strip BOM, lowercase, strip all non-alphanumeric chars.
// "Case ID", "case_id", "CASE ID", " Case ID " all become "caseid".
const normalizeHeader = (value) => String(value || '').trim().replace(/^\uFEFF/, '').toLowerCase().replaceAll(/[^a-z0-9]+/g, '')

// Canonical alias map: normalized-header-key → canonical-field-name.
// Add any new synonyms here; the lookup is alias-first, so raw CSV headers
// are NEVER required to literally match canonical field names.
const CSV_ALIAS_MAP = {
  // ── caseId ────────────────────────────────────────────────────────────────
  caseid: 'caseId', caseno: 'caseId', casenumber: 'caseId',
  casereference: 'caseId', caseref: 'caseId',
  investigationid: 'caseId', investigationno: 'caseId', investigationnumber: 'caseId',
  ticketid: 'caseId', ticketno: 'caseId', ticketnumber: 'caseId',
  recordid: 'caseId', id: 'caseId', uid: 'caseId', uuid: 'caseId',
  referenceid: 'caseId', refid: 'caseId', ref: 'caseId',
  incidentid: 'caseId', incidentno: 'caseId',
  fileid: 'caseId', fileno: 'caseId', filenumber: 'caseId',
  // ── projectId ─────────────────────────────────────────────────────────────
  projectid: 'projectId', projectno: 'projectId', projectnumber: 'projectId',
  projectcode: 'projectId', projectref: 'projectId', contractid: 'projectId',
  contractno: 'projectId', contractcode: 'projectId', contractnumber: 'projectId',
  schemeid: 'projectId', schemeno: 'projectId',
  // ── projectName ───────────────────────────────────────────────────────────
  projectname: 'projectName', project: 'projectName', projecttitle: 'projectName',
  projectdescription: 'projectName', contractname: 'projectName',
  contracttitle: 'projectName', contractdescription: 'projectName',
  schemename: 'projectName', schemetitle: 'projectName', worksname: 'projectName',
  workstitle: 'projectName', worksdescription: 'projectName',
  // ── vendor ────────────────────────────────────────────────────────────────
  vendor: 'vendor', vendorname: 'vendor', vendortitle: 'vendor',
  supplier: 'vendor', suppliername: 'vendor', suppliertitle: 'vendor',
  contractor: 'vendor', contractorname: 'vendor', contractortitle: 'vendor',
  company: 'vendor', companyname: 'vendor', firm: 'vendor', firmname: 'vendor',
  agency: 'vendor', agencyname: 'vendor', party: 'vendor', partyname: 'vendor',
  businessname: 'vendor', entityname: 'vendor',
  // ── vendorId ──────────────────────────────────────────────────────────────
  vendorid: 'vendorId', vendorcode: 'vendorId', supplierid: 'vendorId',
  suppliercode: 'vendorId', contractorid: 'vendorId', contractorcode: 'vendorId',
  // ── invoiceId ─────────────────────────────────────────────────────────────
  invoiceid: 'invoiceId', invoiceno: 'invoiceId', invoicenumber: 'invoiceId',
  invoiceref: 'invoiceId', invoicereference: 'invoiceId',
  billid: 'invoiceId', billno: 'invoiceId', billnumber: 'invoiceId',
  billreference: 'invoiceId', billref: 'invoiceId',
  voucherno: 'invoiceId', voucherid: 'invoiceId', voucherref: 'invoiceId',
  claimid: 'invoiceId', claimno: 'invoiceId', claimnumber: 'invoiceId',
  receiptno: 'invoiceId', receiptid: 'invoiceId',
  // ── invoiceAmount ─────────────────────────────────────────────────────────
  invoiceamount: 'invoiceAmount', invoicevalue: 'invoiceAmount',
  billedamount: 'invoiceAmount', billamount: 'invoiceAmount',
  claimedamount: 'invoiceAmount', claimamount: 'invoiceAmount',
  amount: 'invoiceAmount', totalamount: 'invoiceAmount', total: 'invoiceAmount',
  value: 'invoiceAmount', cost: 'invoiceAmount',
  // ── expectedAmount ────────────────────────────────────────────────────────
  expectedamount: 'expectedAmount', budgetedamount: 'expectedAmount',
  budgetamount: 'expectedAmount', estimatedamount: 'expectedAmount',
  approvedamount: 'expectedAmount', scheduledamount: 'expectedAmount',
  // ── paymentId ─────────────────────────────────────────────────────────────
  paymentid: 'paymentId', paymentno: 'paymentId', paymentref: 'paymentId',
  paymentvoucherid: 'paymentId', paymentvoucherno: 'paymentId',
  paymentreference: 'paymentId', disbursementid: 'paymentId',
  // ── paymentAmount ─────────────────────────────────────────────────────────
  paymentamount: 'paymentAmount', paidamount: 'paymentAmount',
  paymentvalue: 'paymentAmount', disbursedamount: 'paymentAmount',
  releasedamount: 'paymentAmount', paymentstatus: 'paymentAmount',
  payment: 'paymentAmount',
  // ── projectProgress ───────────────────────────────────────────────────────
  projectprogress: 'projectProgress', progress: 'projectProgress',
  progresspercentage: 'projectProgress', completion: 'projectProgress',
  completionpercentage: 'projectProgress', workdone: 'projectProgress',
  percentagecomplete: 'projectProgress', pctcomplete: 'projectProgress',
  // ── contractValue ─────────────────────────────────────────────────────────
  contractvalue: 'contractValue', contractamount: 'contractValue',
  contracttotalvalue: 'contractValue', totalcontractvalue: 'contractValue',
  approvedcontractvalue: 'contractValue', sanctionedamount: 'contractValue',
  // ── riskScore ─────────────────────────────────────────────────────────────
  riskscore: 'riskScore', risk: 'riskScore', riskrating: 'riskScore',
  anomalyscore: 'riskScore', fraudscore: 'riskScore', suspicionscore: 'riskScore',
  // ── riskLevel ─────────────────────────────────────────────────────────────
  risklevel: 'riskLevel', riskpriority: 'riskLevel', riskclass: 'riskLevel',
  riskclassification: 'riskLevel', alertlevel: 'riskLevel',
  // ── status / priority ─────────────────────────────────────────────────────
  status: 'status', casestatus: 'status', reviewstatus: 'status',
  investigationstatus: 'status', state: 'status',
  priority: 'priority', urgency: 'priority', severity: 'priority',
  // ── invoiceDate ───────────────────────────────────────────────────────────
  invoicedate: 'invoiceDate', billdate: 'invoiceDate', claimdate: 'invoiceDate',
  submissiondate: 'invoiceDate', submitteddate: 'invoiceDate', date: 'invoiceDate',
  transactiondate: 'invoiceDate', recorddate: 'invoiceDate',
  // ── paymentDate ───────────────────────────────────────────────────────────
  paymentdate: 'paymentDate', paiddate: 'paymentDate', releaseddate: 'paymentDate',
  disbursementdate: 'paymentDate', settlementdate: 'paymentDate',
  // ── department / location ─────────────────────────────────────────────────
  department: 'department', dept: 'department', division: 'department',
  ministry: 'department', unit: 'department', section: 'department',
  location: 'location', district: 'location', state: 'location',
  region: 'location', area: 'location', zone: 'location', city: 'location',
  // ── other fields ──────────────────────────────────────────────────────────
  anomalies: 'anomalies', anomalysignals: 'anomalies', flags: 'anomalies',
  redflag: 'anomalies', redflags: 'anomalies', issues: 'anomalies',
  evidence: 'evidence', relatedrecords: 'relatedRecords',
  notes: 'notes', remarks: 'notes', comments: 'notes', observations: 'notes',
  assignedto: 'assignedTo', assignee: 'assignedTo', investigator: 'assignedTo',
  analyst: 'assignedTo', reviewer: 'assignedTo',
}

const numericFields = new Set(['invoiceAmount', 'expectedAmount', 'paymentAmount', 'projectProgress', 'contractValue', 'riskScore'])

// Map a single raw header string to a canonical field name (or null if unknown).
const mapHeader = (rawHeader) => CSV_ALIAS_MAP[normalizeHeader(rawHeader)] || null

function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]
    if (char === '"' && quoted && next === '"') {
      value += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(value)
      value = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(value)
      if (row.some((item) => item.trim())) rows.push(row)
      row = []
      value = ''
    } else {
      value += char
    }
  }
  row.push(value)
  if (row.some((item) => item.trim())) rows.push(row)
  if (quoted) throw new Error('Invalid CSV: unmatched quote found.')
  return rows
}

const splitList = (value) => String(value || '').split(/[;|]/).map((item) => item.trim()).filter(Boolean)
const parseJsonList = (value) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
const normalizeDate = (value) => String(value || '').trim() || new Date().toISOString().slice(0, 10)
const normalizeNumber = (value) => {
  const parsed = Number(String(value || '').replaceAll(/[^0-9.-]+/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function buildEvidence(caseItem, importedEvidence = []) {
  const existing = importedEvidence.length ? importedEvidence.map((item) => ({
    type: item.type || item.recordType || 'Evidence',
    label: item.label || item.source_id || item.id || item.sourceId || 'Imported evidence',
    meta: item.meta || item.description || item.value || 'Imported record',
    tone: item.tone || 'blue',
  })) : []
  const ensure = (type, label, meta, tone) => {
    if (label && !existing.some((item) => item.type === type && item.label === label)) existing.push(node(type, label, meta, tone))
  }
  ensure('Project', caseItem.projectId, `${caseItem.location} · ${caseItem.projectProgress}% complete`, 'green')
  ensure('Vendor', caseItem.vendor, `Vendor · ${caseItem.vendorId || 'VND-UNKNOWN'}`, 'blue')
  ensure('Invoice', caseItem.invoiceId, `${money(caseItem.invoiceAmount)} vs ${money(caseItem.expectedAmount)} expected`, 'amber')
  ensure('Payment', caseItem.payment, `${money(caseItem.paymentAmount)} released`, 'red')
  const progressId = caseItem.relatedRecords.find((item) => item.type === 'Progress')?.id || (caseItem.projectId ? `PRG-${caseItem.projectId.replace(/^PRJ-/, '')}` : '')
  ensure('Progress', progressId, `${caseItem.projectProgress}% recorded`, 'green')
  return existing
}

function normalizeImportedCase(input) {
  const relatedFromJson = parseJsonList(input.relatedRecords).map((item) => related(item.id, item.label || item.description || item.type || 'Related record', item.amount || item.value || '', item.date || input.invoiceDate, item.type || 'Record'))
  const relatedFromText = relatedFromJson.length ? relatedFromJson : splitList(input.relatedRecords).map((id) => related(id, 'Imported related record', '', input.invoiceDate, id.startsWith('PAY') ? 'Payment' : id.startsWith('PRG') ? 'Progress' : 'Invoice'))
  const paymentId = input.paymentId || input.payment || relatedFromText.find((item) => item.type === 'Payment')?.id || ''
  const paymentRecord = paymentId ? [related(paymentId, 'Imported payment', input.paymentAmount, input.paymentDate || input.invoiceDate, 'Payment')] : []
  const anomalySignals = splitList(input.anomalies || input.anomalySignals)
  const caseItem = {
    id: input.caseId,
    caseId: input.caseId,
    projectId: input.projectId || '',
    projectName: input.projectName || input.project || 'Imported project',
    project: input.projectName || input.project || 'Imported project',
    department: input.department || 'Imported Data',
    location: input.location || 'Not specified',
    vendor: input.vendor || 'Unknown vendor',
    vendorId: input.vendorId || '',
    invoiceId: input.invoiceId || '',
    invoice: input.invoiceId || '',
    invoiceAmount: normalizeNumber(input.invoiceAmount),
    amount: normalizeNumber(input.invoiceAmount),
    expectedAmount: normalizeNumber(input.expectedAmount),
    paymentAmount: normalizeNumber(input.paymentAmount || input.invoiceAmount),
    payment: paymentId,
    projectProgress: normalizeNumber(input.projectProgress),
    contractValue: normalizeNumber(input.contractValue || input.expectedAmount || input.invoiceAmount),
    invoiceDate: normalizeDate(input.invoiceDate),
    paymentDate: normalizeDate(input.paymentDate || input.invoiceDate),
    vendorRiskScore: normalizeNumber(input.riskScore),
    status: input.status || 'New',
    anomalySignals,
    relatedRecords: [...relatedFromText, ...paymentRecord].filter((item, index, records) => item.id && records.findIndex((candidate) => candidate.id === item.id) === index),
    timelineEvents: [
      event(normalizeDate(input.invoiceDate), 'Invoice submitted', `${input.invoiceId || 'Invoice'} submitted`, false),
      ...(paymentId ? [event(normalizeDate(input.paymentDate || input.invoiceDate), 'Payment recorded', `${paymentId} recorded`, false)] : []),
    ],
    possibleLegitimateExplanations: ['Imported record requires standard verification'],
    recommendedActions: ['Validate imported source records', 'Review invoice, payment, and progress evidence'],
    date: normalizeDate(input.invoiceDate),
    category: input.department || 'Imported Data',
    priority: input.priority || 'Medium',
    createdDate: normalizeDate(input.createdDate || input.invoiceDate),
    updatedDate: normalizeDate(input.updatedDate || input.invoiceDate),
    investigationDate: normalizeDate(input.investigationDate || input.invoiceDate),
    riskScore: normalizeNumber(input.riskScore),
    riskLevel: input.riskLevel || getRiskLevelFromScore(input.riskScore),
    notes: input.notes || '',
    assignedTo: input.assignedTo || 'Analyst Desk',
  }
  caseItem.evidence = buildEvidence(caseItem, parseJsonList(input.evidence))
  return caseItem
}

export function analyzeCsvForImport(csvText) {
  // ── Step 1: Parse raw CSV ──────────────────────────────────────────────────
  const cleanText = String(csvText || '').replace(/^\uFEFF/, '')
  let rows = []
  try {
    rows = parseCsv(cleanText)
  } catch (error) {
    return { headerError: error.message || 'CSV file could not be parsed.', totalRecords: 0, newCasesCount: 0, existingCasesCount: 0, duplicateRowsCount: 0, invalidRecordsCount: 0, newRecords: [], detectedColumns: [], mappings: {} }
  }

  if (rows.length < 2) {
    return { headerError: 'CSV file must include a header row and at least one data row.', totalRecords: 0, newCasesCount: 0, existingCasesCount: 0, duplicateRowsCount: 0, invalidRecordsCount: 0, newRecords: [], detectedColumns: [], mappings: {} }
  }

  // ── Step 2: Detect original column names ──────────────────────────────────
  const rawHeaders = rows[0].map((h) => String(h || '').trim())

  // ── Step 3: Map each raw header → canonical field via alias map ───────────
  // IMPORTANT: We NEVER check for literal canonical names in raw headers.
  // Mapping is: rawHeader → normalizeHeader(rawHeader) → CSV_ALIAS_MAP lookup.
  const colIndexByCanonical = new Map()  // canonical field → column index
  const rawByCanonical = new Map()       // canonical field → original raw header
  const unmappedRawHeaders = []          // raw headers with no canonical match

  rawHeaders.forEach((raw, idx) => {
    const canonical = mapHeader(raw)
    if (canonical) {
      // First occurrence wins (handles duplicate-column edge case)
      if (!colIndexByCanonical.has(canonical)) {
        colIndexByCanonical.set(canonical, idx)
        rawByCanonical.set(canonical, raw)
      }
    } else {
      unmappedRawHeaders.push({ raw, idx })
    }
  })

  // Build a mappings summary for the UI preview
  const mappings = {}
  colIndexByCanonical.forEach((idx, canonical) => {
    mappings[canonical] = rawByCanonical.get(canonical)
  })

  // ── Step 4: Build a cell-value accessor using MAPPED columns ─────────────
  // This replaces the old getCellValue that required literal canonical headers.
  const getCellByCanonical = (row, canonical) => {
    const idx = colIndexByCanonical.get(canonical)
    if (idx === undefined) return ''
    const val = row[idx]
    return val !== undefined && val !== null ? String(val).trim().replace(/^["']|["']$/g, '') : ''
  }

  // For unmapped columns: store raw values by the original header name
  const getRawExtras = (row) => {
    const extras = {}
    unmappedRawHeaders.forEach(({ raw, idx }) => {
      const val = row[idx]
      if (val !== undefined && val !== null && String(val).trim()) {
        extras[raw] = String(val).trim()
      }
    })
    return extras
  }

  // ── Step 5: Process data rows ─────────────────────────────────────────────
  const existingDbIds = new Set(cases.map((c) => c.caseId))
  const batchSeenIds = new Set()
  const dataRows = rows.slice(1)

  let totalRecords = 0
  let existingCasesCount = 0
  let duplicateRowsCount = 0
  let invalidRecordsCount = 0
  const newRecords = []
  const missingFields = []

  // Auto-generate a safe case ID when the CSV has no caseId-equivalent column.
  const hasCaseIdColumn = colIndexByCanonical.has('caseId')
  let autoIdCounter = Date.now()

  dataRows.forEach((row, rowIndex) => {
    const isCompletelyEmpty = !row.some((cell) => String(cell || '').trim().length > 0)
    if (isCompletelyEmpty) return

    totalRecords += 1

    // ── 5a: Extract mapped canonical fields ───────────────────────────────
    const rawCaseId = getCellByCanonical(row, 'caseId').trim()
    const projectId = getCellByCanonical(row, 'projectId').trim() || 'PRJ-UNKNOWN'
    const projectName = getCellByCanonical(row, 'projectName').trim() || 'Imported Project'
    const vendor = getCellByCanonical(row, 'vendor').trim() || 'Unknown Vendor'
    const invoiceId = getCellByCanonical(row, 'invoiceId').trim() || ''

    // ── 5b: Resolve caseId ────────────────────────────────────────────────
    // Use mapped value if present; otherwise generate a safe ID.
    // Never reject a row just because the CSV has no caseId column.
    let caseId = rawCaseId
    if (!caseId) {
      autoIdCounter += 1
      caseId = `CASE-IMP-${autoIdCounter}`
      missingFields.push({ row: rowIndex + 2, field: 'caseId', generated: caseId })
    }

    // ── 5c: Duplicate checks ──────────────────────────────────────────────
    if (batchSeenIds.has(caseId)) {
      duplicateRowsCount += 1
      return
    }
    if (existingDbIds.has(caseId)) {
      existingCasesCount += 1
      batchSeenIds.add(caseId)
      return
    }
    batchSeenIds.add(caseId)

    // ── 5d: Build normalized input record ────────────────────────────────
    const rawVendorId = getCellByCanonical(row, 'vendorId')
    const generatedVendorId = rawVendorId || `VND-${vendor.slice(0, 4).toUpperCase().replaceAll(/[^A-Z0-9]/g, '') || 'UNKN'}`
    const extras = getRawExtras(row)

    const input = {
      caseId,
      projectId,
      projectName,
      vendor,
      vendorId: generatedVendorId,
      invoiceId: invoiceId || `INV-${caseId}`,
      department: getCellByCanonical(row, 'department') || 'Procurement',
      location: getCellByCanonical(row, 'location') || 'Central Unit',
      invoiceAmount: getCellByCanonical(row, 'invoiceAmount') || 750000,
      expectedAmount: getCellByCanonical(row, 'expectedAmount') || 750000,
      paymentAmount: getCellByCanonical(row, 'paymentAmount') || 750000,
      paymentId: getCellByCanonical(row, 'paymentId') || `PAY-${(invoiceId || caseId).replace(/^INV-|^CASE-/, '')}`,
      projectProgress: getCellByCanonical(row, 'projectProgress') || 50,
      contractValue: getCellByCanonical(row, 'contractValue') || 1500000,
      invoiceDate: getCellByCanonical(row, 'invoiceDate') || '15 Mar 2026',
      paymentDate: getCellByCanonical(row, 'paymentDate') || '16 Mar 2026',
      riskScore: getCellByCanonical(row, 'riskScore') || 55,
      status: getCellByCanonical(row, 'status') || 'New',
      anomalies: getCellByCanonical(row, 'anomalies') || 'Imported record',
      notes: getCellByCanonical(row, 'notes') || '',
      assignedTo: getCellByCanonical(row, 'assignedTo') || 'Analyst Desk',
      _extras: extras,  // preserve unmapped columns
    }

    // ── 5e: Track rows that had missing optional fields ───────────────────
    if (!rawCaseId && hasCaseIdColumn) {
      invalidRecordsCount += 1
      return  // blank caseId cell in a column that was mapped → skip
    }

    newRecords.push(normalizeImportedCase(input))
  })

  return {
    headerError: null,
    totalRecords,
    newCasesCount: newRecords.length,
    existingCasesCount,
    duplicateRowsCount,
    invalidRecordsCount,
    newRecords,
    // Extra info for the UI preview
    detectedColumns: rawHeaders,
    mappings,
    unmappedColumns: unmappedRawHeaders.map((item) => item.raw),
    missingFields,
  }
}

export function executeCsvImport(newRecords = []) {
  if (!newRecords.length) return { importedCount: 0 }
  newRecords.forEach((item) => {
    cases.push(item)
    addAuditEvent(item.caseId, 'Case imported', 'Structured CSV row imported')
  })
  persistStore()
  return { importedCount: newRecords.length }
}

export function importCasesFromCsv(csvText) {
  const analysis = analyzeCsvForImport(csvText)
  if (analysis.headerError) {
    return { imported: [], errors: [analysis.headerError], duplicates: [] }
  }
  const result = executeCsvImport(analysis.newRecords)
  return {
    imported: analysis.newRecords,
    errors: [],
    duplicates: [],
    summary: {
      total: analysis.totalRecords,
      imported: result.importedCount,
      existingSkipped: analysis.existingCasesCount,
      duplicateRowsSkipped: analysis.duplicateRowsCount,
      invalidRows: analysis.invalidRecordsCount,
    }
  }
}

export function updateCaseStatus(caseId, nextStatus) {
  const caseItem = getCaseById(caseId)
  if (!caseItem) return null
  caseItem.status = nextStatus
  caseItem.updatedDate = now().slice(0, 10)
  caseItem.riskLevel = getRiskLevelFromScore(caseItem.riskScore ?? caseItem.vendorRiskScore)
  store.reviews.push({ case_id: caseId, reviewer: 'Analyst', decision: nextStatus, status: nextStatus, timestamp: now(), comments: '' })
  addAuditEvent(caseId, 'Case reviewed', `Review decision changed to ${nextStatus}`)
  persistStore()
  return caseItem
}

export function setCaseNote(caseId, note) {
  const caseItem = getCaseById(caseId)
  if (!caseItem) return null
  const savedNote = { note_id: createId('NOTE'), case_id: caseId, author: 'Analyst', timestamp: now(), content: note }
  store.notes.push(savedNote)
  caseItem.notes = note
  caseItem.updatedDate = now().slice(0, 10)
  addAuditEvent(caseId, 'Investigator note added', `Note ${savedNote.note_id} added`)
  persistStore()
  return savedNote
}

export function getCaseNotes(caseId) {
  const filtered = store.notes.filter((note) => note.case_id === caseId)
  if (filtered.length) return filtered
  const caseItem = getCaseById(caseId)
  if (caseItem?.notes?.trim()) {
    return [{ note_id: 'NOTE-INITIAL', case_id: caseId, author: 'Analyst', timestamp: caseItem.updatedDate || caseItem.createdDate || now(), content: caseItem.notes }]
  }
  return []
}

export function getCaseReview(caseId) {
  return store.reviews.filter((review) => review.case_id === caseId).at(-1) || null
}

export function getCaseAuditTrail(caseId) {
  return store.audit.filter((event) => event.case_id === caseId)
}

export function recordAuditEvent(caseId, action, details, actor = 'Analyst') {
  addAuditEvent(caseId, action, details, actor)
  persistStore()
}

export function getStructuredEvidence(caseItem) {
  return (caseItem?.evidence || []).map((item, index) => ({
    evidence_id: `${caseItem.caseId}-E${String(index + 1).padStart(2, '0')}`,
    case_id: caseItem.caseId,
    type: item.type,
    source_id: item.label,
    description: item.meta,
    date: caseItem.invoiceDate,
    value: item.meta,
  }))
}

export function searchCases(records = cases, query = '') {
  const term = query.trim().toLowerCase()
  if (!term) return records
  return records.filter((item) => `${item.caseId} ${item.projectId || ''} ${item.projectName || item.project || ''} ${item.vendorId || ''} ${item.vendor || ''} ${item.invoiceId || ''} ${item.payment || ''} ${item.status || ''}`.toLowerCase().includes(term))
}

export function filterCases(records = cases, filterName = 'All') {
  if (!filterName || filterName === 'All') return records

  if (['New', 'Under Review', 'Under Investigation', 'Reviewed'].includes(filterName)) {
    return records.filter((item) => item.status === filterName)
  }

  const normalizedFilter = String(filterName).toUpperCase()
  return records.filter((item) => getRiskLevelFromScore(item.riskScore ?? item.vendorRiskScore ?? 0) === normalizedFilter)
}

export function sortCases(records = cases, sortName = 'Risk score') {
  const sortable = [...records]
  if (sortName === 'Date') return sortable.sort((left, right) => new Date(right.invoiceDate) - new Date(left.invoiceDate))
  if (sortName === 'Vendor') return sortable.sort((left, right) => String(left.vendor).localeCompare(String(right.vendor)))
  if (sortName === 'Status') return sortable.sort((left, right) => String(left.status).localeCompare(String(right.status)))
  if (sortName === 'Priority') return sortable.sort((left, right) => String(left.priority).localeCompare(String(right.priority)))
  return sortable.sort((left, right) => Number(right.riskScore ?? right.vendorRiskScore ?? 0) - Number(left.riskScore ?? left.vendorRiskScore ?? 0))
}

export function getVendorIntelligence(records = cases) {
  const groups = new Map()
  records.forEach((item) => {
    const key = item.vendorId || item.vendor
    if (!groups.has(key)) groups.set(key, { vendorId: item.vendorId, vendor: item.vendor, cases: [], projects: new Set(), invoices: new Set(), payments: new Set(), anomalies: new Map() })
    const group = groups.get(key)
    group.cases.push(item)
    if (item.projectId) group.projects.add(item.projectId)
    if (item.invoiceId) group.invoices.add(item.invoiceId)
    if (item.payment) group.payments.add(item.payment)
    ;(item.anomalySignals || []).forEach((signal) => group.anomalies.set(signal, (group.anomalies.get(signal) || 0) + 1))
  })
  return [...groups.values()].map((group) => {
    const totalInvoiceAmount = group.cases.reduce((total, item) => total + Number(item.invoiceAmount || 0), 0)
    const totalPaymentAmount = group.cases.reduce((total, item) => total + Number(item.paymentAmount || 0), 0)
    const averageRiskScore = Math.round(group.cases.reduce((total, item) => total + Number(item.riskScore ?? item.vendorRiskScore ?? 0), 0) / group.cases.length)
    return {
      vendorId: group.vendorId,
      vendor: group.vendor,
      totalCases: group.cases.length,
      totalInvoiceAmount,
      totalPaymentAmount,
      averageRiskScore,
      highRiskCases: group.cases.filter((item) => ['CRITICAL', 'HIGH'].includes(getRiskLevelFromScore(item.riskScore ?? item.vendorRiskScore))).length,
      relatedProjects: [...group.projects],
      relatedInvoices: [...group.invoices],
      relatedPayments: [...group.payments],
      anomalyFrequency: [...group.anomalies.entries()].map(([name, value]) => ({ name, value })),
      connectedCases: group.cases.map((item) => item.caseId),
    }
  }).sort((left, right) => right.averageRiskScore - left.averageRiskScore)
}

export const demoInvestigation = null
