function unwrapResponse(payload) {
  if (Array.isArray(payload)) return unwrapResponse(payload[0])
  if (payload?.json) return unwrapResponse(payload.json)
  if (payload?.body) return unwrapResponse(payload.body)
  return payload
}

function textFromResponse(payload) {
  if (typeof payload === 'string') return payload
  if (!payload || typeof payload !== 'object') return ''
  return payload.output || payload.text || payload.response || payload.result || payload.message || JSON.stringify(payload)
}

function section(text, labels) {
  const label = labels.join('|')
  const match = text.match(new RegExp(`(?:${label})\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Z\\s-]+:?|$)`, 'i'))
  return match?.[1]?.trim() || ''
}

function listFrom(value) {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value !== 'string') return []
  return value.split(/\n|\r/).map((item) => item.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean)
}

function normalizeInvestigation(payload, caseId) {
  const unwrapped = unwrapResponse(payload)
  if (unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped)) {
    const text = textFromResponse(unwrapped)
    const findings = listFrom(unwrapped.findings || unwrapped.keyFindings || section(text, ['KEY FINDINGS', 'RISK ASSESSMENT']))
    const suspiciousPatterns = listFrom(unwrapped.suspiciousPatterns || unwrapped.patterns || section(text, ['SUSPICIOUS PATTERNS']))
    const explanations = listFrom(unwrapped.explanations || unwrapped.possibleExplanations || section(text, ['POSSIBLE LEGITIMATE EXPLANATIONS']))
    const recommendations = listFrom(unwrapped.recommendations || unwrapped.actions || section(text, ['RECOMMENDED INVESTIGATION ACTIONS']))
    const finalDecision = unwrapped.finalDecision || section(text, ['FINAL DECISION'])
    const parsedScore = text.match(/(?:Anomaly Score|Risk Score)\s*:\s*(\d+)/i)?.[1]
    const parsedRiskLevel = text.match(/Risk Level\s*:\s*([^\n]+)/i)?.[1]?.trim()
    return {
      ...unwrapped,
      caseId,
      riskScore: unwrapped.riskScore ?? unwrapped.anomalyScore ?? (parsedScore ? Number(parsedScore) : undefined),
      riskLevel: unwrapped.riskLevel ?? parsedRiskLevel,
      anomalies: Array.isArray(unwrapped.anomalies) ? unwrapped.anomalies : [],
      evidence: Array.isArray(unwrapped.evidence) ? unwrapped.evidence : [],
      related: Array.isArray(unwrapped.related) ? unwrapped.related : [],
      timeline: Array.isArray(unwrapped.timeline) ? unwrapped.timeline : [],
      findings: [...findings, ...suspiciousPatterns.map((item) => `Suspicious pattern: ${item}`)],
      explanations,
      recommendations: finalDecision ? [...recommendations, `Final investigation priority: ${finalDecision}`] : recommendations,
      rawResponse: text,
    }
  }
  const text = textFromResponse(unwrapped)
  const score = text.match(/(?:Anomaly Score|Risk Score)\s*:\s*(\d+)/i)?.[1]
  return {
    caseId,
    riskScore: score ? Number(score) : undefined,
    riskLevel: text.match(/Risk Level\s*:\s*([^\n]+)/i)?.[1]?.trim(),
    anomalies: [],
    evidence: [],
    related: [],
    timeline: [],
    findings: [...listFrom(section(text, ['KEY FINDINGS', 'RISK ASSESSMENT'])), ...listFrom(section(text, ['SUSPICIOUS PATTERNS'])).map((item) => `Suspicious pattern: ${item}`)],
    explanations: listFrom(section(text, ['POSSIBLE LEGITIMATE EXPLANATIONS'])),
    recommendations: [...listFrom(section(text, ['RECOMMENDED INVESTIGATION ACTIONS'])), ...(section(text, ['FINAL DECISION']) ? [`Final investigation priority: ${section(text, ['FINAL DECISION'])}`] : [])],
    finalDecision: section(text, ['FINAL DECISION']),
    rawResponse: text,
  }
}

export async function runInvestigation(caseId) {
  console.log('[n8n] Sending investigation request', { caseId })
  try {
    const response = await fetch('/api/n8n-investigate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ caseId }),
    })
    console.log('[n8n] Response status:', response.status)
    const responseText = await response.text()
    console.log('[n8n] Response body:', responseText)
    if (!response.ok) throw new Error(`n8n request failed with ${response.status}: ${responseText}`)
    let payload = responseText
    try { payload = JSON.parse(responseText) } catch { /* n8n may return the AI Agent text directly. */ }
    return normalizeInvestigation(payload, caseId)
  } catch (error) {
    console.error('[n8n] Caught error:', error)
    throw error
  }
}
