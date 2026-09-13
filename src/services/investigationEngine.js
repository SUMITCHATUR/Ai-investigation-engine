import { cases } from '../data.js'

const money = (value) => `₹${value.toLocaleString('en-IN')}`
const dateValue = (value) => new Date(value.replace(/(\d{2}) (\w{3}) (\d{4})/, '$2 $1, $3'))
const daysBetween = (left, right) => Math.round((dateValue(right) - dateValue(left)) / 86400000)
const riskLevel = (score) => score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW'

export function runInvestigation(caseId) {
  const item = cases.find((candidate) => candidate.caseId === caseId || candidate.id === caseId)
  if (!item) throw new Error('Investigation could not be completed. Please retry.')

  const signals = []
  if (item.invoiceAmount > item.expectedAmount * 1.25) signals.push({ title: 'Invoice variance', value: money(item.invoiceAmount), expected: `Up to ${money(item.expectedAmount)}`, score: 25, explanation: `${money(item.invoiceAmount)} is more than 25% above the expected project-level amount.` })
  const paidRatio = item.paymentAmount / item.contractValue
  if (paidRatio > item.projectProgress / 100 + 0.12 || item.anomalySignals.includes('Payment-progress mismatch')) signals.push({ title: 'Payment-progress mismatch', value: `${Math.round(paidRatio * 100)}% paid / ${item.projectProgress}% complete`, expected: 'Payment within 12% of progress', score: 20, explanation: 'Released value is ahead of the latest recorded project progress.' })
  if (item.relatedRecords.some((record) => record.type === 'Invoice' && typeof record.amount === 'number' && Math.abs(record.amount - item.invoiceAmount) / item.invoiceAmount < 0.05) || item.anomalySignals.includes('Duplicate pattern')) signals.push({ title: 'Duplicate pattern', value: 'Similar invoice detected', expected: 'No close amount match', score: 20, explanation: 'A related invoice has a highly similar amount and transaction context.' })
  if (daysBetween(item.invoiceDate, item.paymentDate) <= 1 && item.projectProgress < 60) signals.push({ title: 'Early payment', value: `${daysBetween(item.invoiceDate, item.paymentDate)} day approval cycle`, expected: '3–7 day review cycle', score: 15, explanation: 'Payment was released unusually soon relative to the project stage.' })
  if (item.vendorRiskScore >= 70) signals.push({ title: 'Vendor relationship anomaly', value: `Vendor risk ${item.vendorRiskScore}`, expected: 'Below 70', score: 15, explanation: 'The vendor appears across related records with elevated concentration or risk indicators.' })

  const score = Math.min(100, signals.reduce((total, signal) => total + signal.score, 0) + (signals.length ? 5 : 0))
  const findings = signals.length ? signals.map((signal) => `${signal.title}: ${signal.explanation}`) : ['Invoice amount and payment timing align with the recorded project progress.', 'No major connected transaction anomaly was detected.']
  return {
    ...item,
    riskScore: score,
    anomalyScore: score,
    riskLevel: riskLevel(score),
    anomalies: signals.length ? signals : [{ title: 'Routine project billing', value: money(item.invoiceAmount), expected: `Within expected range of ${money(item.expectedAmount)}`, score: 12, explanation: 'The selected record is consistent with its contract and progress data.' }],
    evidence: item.evidence,
    related: item.relatedRecords,
    timeline: item.timelineEvents,
    findings,
    explanations: item.possibleLegitimateExplanations,
    recommendations: item.recommendedActions,
    finalDecision: score >= 60 ? 'Prioritize for human review.' : 'Retain standard verification controls.',
  }
}

export function getAnalytics() {
  const investigations = cases.map((item) => runInvestigation(item.caseId))
  const categoryCounts = investigations.flatMap((item) => item.anomalies).reduce((counts, anomaly) => ({ ...counts, [anomaly.title]: (counts[anomaly.title] || 0) + 1 }), {})
  return {
    riskLevels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((name) => ({ name, value: investigations.filter((item) => item.riskLevel === name).length })),
    anomalies: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
    vendors: investigations.map((item) => ({ name: item.vendor, score: item.vendorRiskScore })),
    trend: investigations.map((item) => ({ month: item.invoiceDate.slice(3, 6), cases: item.anomalyScore })),
    total: investigations.length,
    critical: investigations.filter((item) => item.riskLevel === 'CRITICAL').length,
    high: investigations.filter((item) => item.riskLevel === 'HIGH').length,
    underInvestigation: cases.filter((item) => item.status === 'Under Investigation').length,
    totalAnomalies: investigations.reduce((total, item) => total + item.anomalies.length, 0),
    averageScore: Math.round(investigations.reduce((total, item) => total + item.anomalyScore, 0) / investigations.length),
  }
}
