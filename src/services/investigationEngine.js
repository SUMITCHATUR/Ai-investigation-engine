import { cases } from '../data.js'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
const dateValue = (value) => new Date(String(value || '').replace(/(\d{2}) (\w{3}) (\d{4})/, '$2 $1, $3'))
const daysBetween = (left, right) => {
  const d1 = dateValue(left)
  const d2 = dateValue(right)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 999
  return Math.round((d2 - d1) / 86400000)
}
const riskLevel = (score) => score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW'
const evidenceId = (caseItem, type) => {
  const index = (caseItem.evidence || []).findIndex((item) => item.type === type)
  return index < 0 ? null : `${caseItem.caseId}-E${String(index + 1).padStart(2, '0')}`
}

function createFinding(caseItem, values) {
  return {
    finding_id: `${caseItem.caseId}-${values.anomalyType.toUpperCase().replaceAll(/[^A-Z0-9]+/g, '-')}`,
    case_id: caseItem.caseId, anomaly_type: values.anomalyType, anomaly_score: values.score, title: values.title,
    detected_value: values.value, expected_value: values.expected, explanation: values.explanation, supporting_data: values.supportingData,
    risk_contribution: values.score, evidence_ids: values.evidenceIds.filter(Boolean), severity: values.score >= 20 ? 'High' : 'Medium',
    status: values.status || 'Detected', value: values.value, expected: values.expected, score: values.score,
  }
}

export function runInvestigation(caseId) {
  const item = cases.find((candidate) => candidate.caseId === caseId || candidate.id === caseId)
  if (!item) throw new Error('Investigation could not be completed. Please retry.')

  const findings = []
  const invoiceVariance = item.expectedAmount ? ((item.invoiceAmount - item.expectedAmount) / item.expectedAmount) * 100 : null
  if (invoiceVariance !== null && invoiceVariance > 25) findings.push(createFinding(item, {
    anomalyType: 'invoice-variance', title: 'Invoice variance', value: money(item.invoiceAmount), expected: money(item.expectedAmount), score: 25,
    explanation: `The invoice amount is ${Math.round(invoiceVariance)}% above the expected amount.`,
    supportingData: `${money(item.invoiceAmount)} compared with ${money(item.expectedAmount)} expected`, evidenceIds: [evidenceId(item, 'Invoice')],
  }))

  const paymentToContract = item.contractValue ? (item.paymentAmount / item.contractValue) * 100 : null
  const progressDelta = paymentToContract === null ? null : paymentToContract - item.projectProgress
  const paymentSupported = paymentToContract !== null && item.projectProgress !== null && Math.abs(progressDelta) > 12
  findings.push(createFinding(item, {
    anomalyType: 'payment-progress-mismatch', title: 'Payment-progress mismatch',
    value: paymentToContract === null ? 'Payment progress unavailable' : `${Math.round(paymentToContract)}% paid / ${item.projectProgress}% complete`,
    expected: 'Payment within 12% of recorded progress', score: 20,
    explanation: paymentSupported ? `Payment represents ${Math.round(paymentToContract)}% of contract value against ${item.projectProgress}% recorded progress.` : 'Insufficient data to establish a payment-progress mismatch',
    supportingData: paymentToContract === null ? 'Contract value or payment amount is unavailable.' : `${money(item.paymentAmount)} / ${money(item.contractValue)} = ${Math.round(paymentToContract)}%; progress delta ${Math.round(progressDelta)} points`,
    evidenceIds: [evidenceId(item, 'Payment'), evidenceId(item, 'Progress')], status: paymentSupported ? 'Detected' : 'Needs verification',
  }))

  const relatedInvoice = item.relatedRecords.find((record) => record.type === 'Invoice' && typeof record.amount === 'number')
  const similarity = relatedInvoice ? Math.abs(relatedInvoice.amount - item.invoiceAmount) / item.invoiceAmount : null
  const duplicateSupported = relatedInvoice && similarity < 0.05
  findings.push(createFinding(item, {
    anomalyType: 'duplicate-pattern', title: 'Duplicate pattern', value: relatedInvoice ? `Compared with ${relatedInvoice.id}` : 'No related invoice available', expected: 'No close amount match', score: 20,
    explanation: duplicateSupported ? `${relatedInvoice.id} is within ${Math.round(similarity * 100)}% of the selected invoice amount.` : 'No duplicate was confirmed from the available related invoice records.',
    supportingData: relatedInvoice ? `${relatedInvoice.id}: ${money(relatedInvoice.amount)}; selected invoice: ${money(item.invoiceAmount)}` : 'No related invoice record is available.',
    evidenceIds: [evidenceId(item, 'Invoice')], status: duplicateSupported ? 'Detected' : 'Not confirmed',
  }))

  const paymentDays = daysBetween(item.invoiceDate, item.paymentDate)
  if (paymentDays <= 1 && item.projectProgress < 60) findings.push(createFinding(item, {
    anomalyType: 'early-payment', title: 'Early payment', value: `${paymentDays} day approval cycle`, expected: '3–7 day review cycle', score: 15,
    explanation: `Payment was released ${paymentDays} day${paymentDays === 1 ? '' : 's'} after invoice submission while the project was ${item.projectProgress}% complete.`,
    supportingData: `${item.invoiceDate} invoice to ${item.paymentDate} payment`, evidenceIds: [evidenceId(item, 'Payment')],
  }))

  if (item.vendorRiskScore >= 70) findings.push(createFinding(item, {
    anomalyType: 'vendor-relationship', title: 'Vendor relationship anomaly', value: `Vendor risk ${item.vendorRiskScore}`, expected: 'Below 70', score: 15,
    explanation: `Vendor risk is ${item.vendorRiskScore}, above the configured 70-point review threshold.`,
    supportingData: `${item.vendor} · ${item.vendorId || 'Vendor ID unavailable'} · ${item.relatedRecords.length} related records`, evidenceIds: [evidenceId(item, 'Vendor')],
  }))

  // Existing deterministic formula: signal contributions plus 5 points when any signal exists.
  const score = Math.min(100, findings.reduce((total, finding) => total + finding.risk_contribution, 0) + (findings.length ? 5 : 0))
  const finalFindings = findings.length ? findings : [createFinding(item, {
    anomalyType: 'routine-billing', title: 'Routine project billing', value: money(item.invoiceAmount), expected: `Within expected range of ${money(item.expectedAmount)}`, score: 12,
    explanation: 'The selected record is consistent with its contract and progress data.', supportingData: 'No configured anomaly signal was detected.', evidenceIds: [evidenceId(item, 'Invoice')], status: 'No anomaly detected',
  })]
  const timeline = (item.timelineEvents || []).map((event, index) => {
    const evtName = String(event?.event || event?.title || 'Event')
    const evtLower = evtName.toLowerCase()
    return {
      ...event,
      event_id: `${item.caseId}-T${String(index + 1).padStart(2, '0')}`,
      case_id: item.caseId,
      event_type: evtName,
      title: evtName,
      description: event.detail || event.description || '',
      source_id: evtLower.includes('payment') ? item.payment : evtLower.includes('invoice') ? item.invoiceId : null,
    }
  })
  return {
    ...item, riskScore: score, anomalyScore: score, riskLevel: riskLevel(score), anomalies: finalFindings, findings: finalFindings,
    findingSummaries: finalFindings.map((finding) => `${finding.title}: ${finding.explanation}`), evidence: item.evidence, related: item.relatedRecords,
    timeline, explanations: item.possibleLegitimateExplanations, recommendations: item.recommendedActions,
    finalDecision: score >= 60 ? 'Prioritize for human review.' : 'Retain standard verification controls.',
  }
}

export function getAnalytics() {
  const investigations = cases.map((item) => runInvestigation(item.caseId))
  const categoryCounts = investigations.flatMap((item) => item.anomalies).reduce((counts, anomaly) => ({ ...counts, [anomaly.title]: (counts[anomaly.title] || 0) + 1 }), {})
  return {
    riskLevels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((name) => ({ name, value: investigations.filter((item) => item.riskLevel === name).length })),
    anomalies: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })), vendors: investigations.map((item) => ({ name: item.vendor, score: item.vendorRiskScore })), trend: investigations.map((item) => ({ month: item.invoiceDate.slice(3, 6), cases: item.anomalyScore })),
    total: investigations.length, critical: investigations.filter((item) => item.riskLevel === 'CRITICAL').length, high: investigations.filter((item) => item.riskLevel === 'HIGH').length,
    underInvestigation: cases.filter((item) => item.status === 'Under Investigation').length, totalAnomalies: investigations.reduce((total, item) => total + item.anomalies.length, 0), averageScore: Math.round(investigations.reduce((total, item) => total + item.anomalyScore, 0) / (investigations.length || 1)),
  }
}
