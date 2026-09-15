import { useState } from 'react'

export default function AgenticTracePanel() {
  const [isScanning, setIsScanning] = useState(false)
  const [traceLogs, setTraceLogs] = useState([
    { step: 1, text: 'Ingested 13 project spending records & vendor telemetry.', status: 'COMPLETED' },
    { step: 2, text: 'Anomaly Detector Agent: Flagged 25% price variance in CASE-1042.', status: 'COMPLETED' },
    { step: 3, text: 'Correlation Agent: Linked Invoice (INV-1042) to Payment (PAY-7741).', status: 'COMPLETED' },
    { step: 4, text: 'Explainer Agent: Generated risk assessment matrix & milestone mismatch summary.', status: 'ACTIVE' }
  ])

  const uniqueIntelligenceSteps = [
    { text: 'Cross-referencing vendor PAN/GST data with corporate registry database...', status: 'COMPLETED' },
    { text: 'Executing graph neural network to check for hidden shell-company linkages...', status: 'COMPLETED' },
    { text: 'NLP Worker: Analyzing contract scope text against actual invoice deliverables...', status: 'COMPLETED' },
    { text: 'Synthesizing final investigator briefing and risk score recalculation...', status: 'COMPLETED' }
  ]

  const [scanIndex, setScanIndex] = useState(0)

  const handleRunLiveScan = () => {
    if (isScanning) return

    setIsScanning(true)

    const nextStepNum = traceLogs.length + 1
    const currentAction = uniqueIntelligenceSteps[scanIndex % uniqueIntelligenceSteps.length]

    window.setTimeout(() => {
      setTraceLogs((prev) => [
        ...prev,
        {
          step: nextStepNum,
          text: currentAction.text,
          status: currentAction.status
        }
      ])
      setScanIndex((prev) => prev + 1)
      setIsScanning(false)
    }, 1200)
  }

  const handleReset = () => {
    setTraceLogs([
      { step: 1, text: 'Ingested 13 project spending records & vendor telemetry.', status: 'COMPLETED' },
      { step: 2, text: 'Anomaly Detector Agent: Flagged 25% price variance in CASE-1042.', status: 'COMPLETED' },
      { step: 3, text: 'Correlation Agent: Linked Invoice (INV-1042) to Payment (PAY-7741).', status: 'COMPLETED' },
      { step: 4, text: 'Explainer Agent: Generated risk assessment matrix & milestone mismatch summary.', status: 'ACTIVE' }
    ])
    setScanIndex(0)
  }

  return (
    <div className="agentic-trace-panel">
      <div className="agentic-trace-header">
        <div>
          <h3 className="agentic-trace-title">🤖 Autonomous Agentic Trace</h3>
          <p className="agentic-trace-copy">Real-time reasoning logs from background AI intelligence workers.</p>
        </div>
        <div className="agentic-trace-actions">
          <button
            type="button"
            onClick={handleReset}
            className="agentic-trace-reset"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleRunLiveScan}
            disabled={isScanning}
            className="agentic-trace-button"
          >
            {isScanning ? 'AI Agents Working...' : 'Run Live Intelligence Scan'}
          </button>
        </div>
      </div>

      <div className="agentic-trace-list">
        {traceLogs.map((log, index) => (
          <div key={`trace-${log.step}-${index}`} className="agentic-trace-item">
            <div className="agentic-trace-main">
              <span className="agentic-trace-step">0{log.step}</span>
              <span className="agentic-trace-text">{log.text}</span>
            </div>
            <span className={`agentic-trace-status ${log.status.toLowerCase()}`}>
              {log.status}
            </span>
          </div>
        ))}

        {isScanning && (
          <div className="agentic-trace-live">
            <span>⚡</span> Multi-agent pipeline actively querying records and processing graph nodes...
          </div>
        )}
      </div>
    </div>
  )
}
