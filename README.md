# TRACE//AI

**AI-Powered Investigation & Anomaly Intelligence Platform** is a demo MVP for procurement and project-spending investigation. It detects suspicious patterns, connects related evidence, reconstructs timelines, and recommends human review. It does not determine fraud, guilt, or intent.

## Run locally

```bash
npm install
npm run dev
```

Run `npm run dev`, choose **Enter workspace**, open `CASE-1042`, and run the investigation. The deployed MVP uses a deterministic local investigation engine and requires no backend, n8n instance, Ollama server, environment variables, or paid API keys.

## Product flow

Landing page -> Case overview -> CASE-1042 -> Run AI investigation -> staged analysis -> anomaly signals -> evidence relationships -> timeline -> report -> recommended actions -> human review.

The prototype includes 13 realistic fictional synthetic cases, linked evidence, timelines, responsive dashboard and case views, an analytics page with Recharts, and interactive investigation checklists and review status.

## Architecture

- `src/data.js` contains 13 fictional synthetic investigation cases with linked records and timelines.
- `src/services/investigationEngine.js` calculates deterministic anomaly signals, risk levels, findings, evidence, timelines, and recommendations.
- The legacy `src/services/investigationService.js` is not imported by the deployed MVP and is retained only for future backend integration.
- `src/App.jsx` contains the MVP views and interaction state: landing, dashboard, case investigation, and analytics.
- `src/App.css` contains the enterprise investigation visual system.

Planned production flow:

```text
React frontend
  -> API endpoint (POST /api/investigate)
  -> n8n investigation workflow
  -> Python anomaly detection
  -> database / evidence store
  -> optional LLM reasoning agent
  -> investigation result
  -> frontend
```

Expected API contract:

```json
{
  "caseId": "CASE-1042",
  "riskScore": 91,
  "riskLevel": "HIGH",
  "findings": [],
  "evidence": [],
  "timeline": [],
  "recommendations": []
}
```

The production MVP has no live connection or production secrets. All results are generated locally from the synthetic dataset.

## Validation

```bash
npm run build
```

The frontend has zero live external dependencies. All investigation results are deterministic and generated from the synthetic demo dataset.
