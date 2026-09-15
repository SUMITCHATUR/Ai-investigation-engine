import { useState, useSyncExternalStore } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, AlertTriangle, ArrowLeft, ArrowUpRight, BarChart3, Bell, BrainCircuit, Check, ChevronRight, ClipboardCheck, Clock3, FileSearch, Fingerprint, FolderKanban, GitBranch, LayoutDashboard, Network, Play, Plus, Search, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react'
import { analyzeCsvForImport, executeCsvImport, getAllCases, getCaseById, getVendorIntelligence, importCasesFromCsv, searchCases, filterCases, setCaseNote, sortCases, subscribeToCases, updateCaseStatus } from './data'
import { getAnalytics, runInvestigation } from './services/investigationEngine'
import AgenticTracePanel from './components/AgenticTracePanel'
import CaseExportBar from './components/CaseExportBar'
import './App.css'

const riskClass = (value) => String(value ?? '').toLowerCase().replaceAll(' ', '-')

export default function App() {
  useSyncExternalStore(
    subscribeToCases,
    () => `${getAllCases().length}-${getAllCases().map((item) => `${item.caseId}:${item.status}:${item.notes || ''}:${item.updatedDate || ''}`).join('|')}`,
  )

  return <BrowserRouter><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/dashboard" element={<Workspace><Dashboard /></Workspace>} />
    <Route path="/analytics" element={<Workspace><DynamicAnalyticsPage /></Workspace>} />
    <Route path="/case-files" element={<Workspace><CaseFiles /></Workspace>} />
    <Route path="/evidence-graph" element={<Workspace><DynamicEvidenceGraphPage /></Workspace>} />
    <Route path="/review-queue" element={<Workspace><DynamicReviewQueue /></Workspace>} />
    <Route path="/cases/:caseId" element={<Workspace><CasePage /></Workspace>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></BrowserRouter>
}

function Workspace({ children }) {
  const [quickPanel, setQuickPanel] = useState(null)
  const location = useLocation()
  return <div className="app-shell"><Sidebar onAccount={() => setQuickPanel('account')} /><main className="main-content"><Topbar onNotifications={() => setQuickPanel('notifications')} />{location.pathname.startsWith('/cases/') && <CaseExportBar />}{children}</main>{quickPanel && <QuickPanel type={quickPanel} onClose={() => setQuickPanel(null)} />}</div>
}

function Topbar({ onNotifications }) {
  const location = useLocation()
  const labels = { '/analytics': 'Analytics', '/case-files': 'Case files', '/evidence-graph': 'Evidence graph', '/review-queue': 'Review queue', '/dashboard': 'Overview' }
  const label = location.pathname.startsWith('/cases/') ? 'Case investigation' : labels[location.pathname] || 'Overview'
  return <header className="topbar"><div className="mobile-brand"><Fingerprint size={19} /> TRACE//AI</div><div className="crumb">Workspace / <strong>{label}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={onNotifications}><Bell size={17} /><i /></button><div className="user"><span>AN</span><div><strong>Analyst</strong><small>Investigation Unit</small></div></div></div></header>
}

function Sidebar({ onAccount }) {
  const location = useLocation()
  const overviewActive = location.pathname === '/dashboard' || location.pathname.startsWith('/cases/')
  const links = [
    { to: '/dashboard', label: 'Case overview', icon: LayoutDashboard, active: overviewActive, count: '08' },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/case-files', label: 'Case files', icon: FolderKanban },
    { to: '/evidence-graph', label: 'Evidence graph', icon: Network },
    { to: '/review-queue', label: 'Review queue', icon: ClipboardCheck, count: '3' },
  ]
  const renderLink = ({ to, label, icon: Icon, active, count }) => <NavLink key={to} to={to} className={({ isActive }) => active || isActive ? 'nav-item active' : 'nav-item'}><Icon size={17} /> {label}{count && <span className={to === '/review-queue' ? 'nav-pip' : 'nav-count'}>{count}</span>}</NavLink>
  return <aside className="sidebar"><NavLink to="/dashboard" className="brand"><span className="brand-mark"><Fingerprint size={20} /></span><span>TRACE<span>//AI</span></span></NavLink><div className="sidebar-label">Investigation desk</div><nav>{links.slice(0, 2).map(renderLink)}</nav><div className="sidebar-label lower">Workspace</div><nav>{links.slice(2).map(renderLink)}</nav><div className="sidebar-bottom"><div className="system-state"><span className="live-dot" /><div><strong>All systems nominal</strong><small>Last sync 2 min ago</small></div></div><button className="nav-item" onClick={onAccount}><UserRound size={17} /> Account</button></div></aside>
}

function QuickPanel({ type, onClose }) { const notifications = type === 'notifications'; return <div className="quick-panel-backdrop" onClick={onClose}><section className="quick-panel" onClick={(event) => event.stopPropagation()}><div className="panel-heading"><div><span className="panel-kicker">{notifications ? 'WORKSPACE ALERTS' : 'ANALYST PROFILE'}</span><h2>{notifications ? 'Notifications' : 'Account'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close panel"><X size={16} /></button></div>{notifications ? <div className="quick-item"><span className="live-dot" /><div><strong>Review queue updated</strong><small>4 cases currently require investigation attention.</small></div></div> : <div className="quick-item"><span className="profile-mark">AN</span><div><strong>Analyst</strong><small>Investigation Unit · Demo workspace</small></div></div>}<button className="ghost-button quick-close" onClick={onClose}>Close</button></section></div> }

function Landing() { const navigate = useNavigate(); return <div className="landing"><div className="landing-grid" /><div className="landing-nav"><NavLink to="/dashboard" className="brand"><span className="brand-mark"><Fingerprint size={20} /></span><span>TRACE<span>//AI</span></span></NavLink><div className="landing-status"><span className="live-dot" /> LOCAL DEMO ENVIRONMENT</div></div><div className="landing-content"><div className="eyebrow"><span /> NATIONAL INVESTIGATION INTELLIGENCE PLATFORM</div><h1>See the signal<br /><em>behind the spend.</em></h1><p>AI-assisted anomaly intelligence for procurement and project-spending investigations. Trace patterns, connect evidence, and keep human judgment at the center.</p><button className="primary-button enter-button" onClick={() => navigate('/dashboard')}>Enter workspace <ArrowUpRight size={18} /></button><div className="landing-note"><ShieldCheck size={15} /> Synthetic data · No external APIs required</div></div><div className="landing-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="radar"><div className="radar-line" /><div className="radar-core"><Fingerprint size={30} /></div><span className="radar-label label-a">ANOMALY 91</span><span className="radar-label label-b">EVIDENCE LINKED</span><span className="radar-label label-c">CASE-1042</span></div></div><div className="landing-footer"><span>v0.9.1 · DEMO BUILD</span><span>PROCUREMENT INTELLIGENCE / 2026</span></div></div> }

function Dashboard() { const navigate = useNavigate(); const summary = getAnalytics(); const stats = [{ label: 'Total cases', value: String(summary.total).padStart(2, '0'), delta: 'Synthetic records tracked', icon: FolderKanban }, { label: 'Critical cases', value: String(summary.critical).padStart(2, '0'), delta: 'Requires attention', icon: AlertTriangle, accent: true }, { label: 'Under investigation', value: String(summary.underInvestigation).padStart(2, '0'), delta: 'Priority review queue', icon: Clock3 }, { label: 'Anomalies detected', value: String(summary.totalAnomalies).padStart(2, '0'), delta: `Average score ${summary.averageScore}`, icon: Activity }]; return <div className="page"><PageHeading eyebrow="INVESTIGATION DESK" title="Case overview" copy="Monitor suspicious spending patterns across active investigations." action={<button className="ghost-button" onClick={() => navigate('/case-files')}><Plus size={16} /> New watchlist</button>} /><div className="stats-grid">{stats.map(({ label, value, delta, icon: Icon, accent }) => <div className="stat-card" key={label}><div className={'stat-icon ' + (accent ? 'accent' : '')}><Icon size={18} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-delta">{delta}</div></div>)}</div><div className="section-head"><div><h2>Recent investigation cases</h2><span className="muted">Prioritized by anomaly score and recency</span></div><NavLink className="text-button" to="/analytics">View analytics <ChevronRight size={15} /></NavLink></div><CaseTable onOpen={(item) => navigate(`/cases/${item.caseId}`)} /><Disclaimer /></div> }

function PageHeading({ eyebrow, title, copy, action }) { return <div className="page-heading"><div><div className="eyebrow"><span /> {eyebrow}</div><h1>{title}</h1><p>{copy}</p></div>{action}</div> }

function CaseTable({ onOpen, records = getAllCases() }) {
  return <div className="case-table"><div className="table-head"><span>Case ID</span><span>Project / vendor</span><span>Amount</span><span>Risk score</span><span>Status</span><span>Date</span><span /></div>{records.map((item) => { const result = runInvestigation(item.caseId); return <button className="table-row" key={item.caseId} onClick={() => onOpen(item)}><span className="case-id">{item.caseId}{item.caseId === 'CASE-1042' && <span className="demo-tag">DEMO</span>}</span><span className="project-cell"><strong>{item.projectName}</strong><small>{item.vendor}</small></span><span className="amount">₹{Number(item.invoiceAmount).toLocaleString('en-IN')}</span><span><span className={'risk-score ' + result.riskLevel.toLowerCase()}><i />{result.riskScore}</span></span><span><span className={'status ' + riskClass(item.status)}>{item.status}</span></span><span className="date">{item.invoiceDate}</span><span><ChevronRight size={16} className="row-arrow" /></span></button> })}</div> }

function Disclaimer() { return <div className="disclaimer"><ShieldCheck size={15} /><span>TRACE//AI identifies suspicious patterns for human investigation. It does not determine fraud, guilt, or intent.</span></div> }

function CaseFiles() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [priority, setPriority] = useState('All')
  const [vendor, setVendor] = useState('All')
  const [sortBy, setSortBy] = useState('Risk score')
  const [importState, setImportState] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  const allCases = getAllCases()
  const filters = ['All', 'Critical', 'High', 'Medium', 'Low', 'Under Investigation', 'Reviewed']
  const vendors = ['All', ...new Set(allCases.map((item) => item.vendor).filter(Boolean))]
  const priorities = ['All', ...new Set(allCases.map((item) => item.priority).filter(Boolean))]
  const searched = searchCases(allCases, query)
  const filtered = sortCases(filterCases(searched, filter).filter((item) => (priority === 'All' || item.priority === priority) && (vendor === 'All' || item.vendor === vendor)), sortBy)

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setImportState({ type: 'error', message: 'CSV file size exceeds 5MB limit.' })
      return
    }
    try {
      const fileText = await file.text()
      const analysis = analyzeCsvForImport(fileText)
      if (analysis.headerError) {
        setImportState({ type: 'error', message: analysis.headerError })
        setPreviewData(null)
      } else {
        setImportState(null)
        setPreviewData(analysis)
      }
    } catch (error) {
      setImportState({ type: 'error', message: error.message || 'CSV import failed. Please verify the file structure.' })
      setPreviewData(null)
    }
  }

  const handleConfirmImport = () => {
    if (!previewData || !previewData.newRecords.length) return
    const result = executeCsvImport(previewData.newRecords)
    const summaryMsg = `Imported: ${result.importedCount}` +
      ` | Skipped existing cases: ${previewData.existingCasesCount}` +
      ` | Skipped duplicate rows: ${previewData.duplicateRowsCount}` +
      ` | Invalid rows: ${previewData.invalidRecordsCount}`

    setImportState({ type: 'success', message: summaryMsg })
    setPreviewData(null)
  }

  return (
    <div className="page">
      <PageHeading
        eyebrow="WORKSPACE / CASE FILES"
        title="Case Files"
        copy="Search and inspect every synthetic investigation record."
        action={<span className="muted">{filtered.length} of {allCases.length} cases</span>}
      />
      <div className="files-toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cases, projects, vendors, invoices, payments..."
          />
        </div>
        <div className="filter-row">
          {filters.map((item) => (
            <button
              key={item}
              className={filter === item ? 'filter-button active' : 'filter-button'}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
          <label className="case-select">
            Priority
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              {priorities.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="case-select">
            Vendor
            <select value={vendor} onChange={(event) => setVendor(event.target.value)}>
              {vendors.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="case-select">
            Sort
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {['Risk score', 'Date', 'Vendor', 'Status', 'Priority'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="ghost-button">
            Import CSV
            <input type="file" accept=".csv,text/csv" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
      {importState && (
        <div className={importState.type === 'success' ? 'saved-note' : 'caution'}>
          <FileSearch size={15} />
          <span>{importState.message}</span>
        </div>
      )}
      {previewData && (
        <div className="modal-backdrop">
          <div className="note-modal import-preview-modal">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">DATA IMPORTER</span>
                <h2>CSV Import Preview</h2>
              </div>
              <button className="icon-button" onClick={() => setPreviewData(null)} aria-label="Close preview">
                <X size={16} />
              </button>
            </div>
            <div className="preview-stats">
              <div className="preview-stat">
                <span>Total Records</span>
                <strong>{previewData.totalRecords}</strong>
              </div>
              <div className="preview-stat green">
                <span>New Cases</span>
                <strong>{previewData.newCasesCount}</strong>
              </div>
              <div className="preview-stat amber">
                <span>Existing (skipped)</span>
                <strong>{previewData.existingCasesCount}</strong>
              </div>
              <div className="preview-stat red">
                <span>Invalid Rows</span>
                <strong>{previewData.invalidRecordsCount}</strong>
              </div>
            </div>
            {previewData.mappings && Object.keys(previewData.mappings).length > 0 && (
              <div className="preview-mapping-block">
                <div className="preview-mapping-head">
                  <Check size={13} /> Column mapping detected
                </div>
                <div className="preview-mapping-rows">
                  {Object.entries(previewData.mappings).map(([canonical, raw]) => (
                    <div className="preview-mapping-row" key={canonical}>
                      <span className="mapping-raw">"{raw}"</span>
                      <span className="mapping-arrow">→</span>
                      <span className="mapping-canonical">{canonical}</span>
                    </div>
                  ))}
                </div>
                {previewData.unmappedColumns && previewData.unmappedColumns.length > 0 && (
                  <div className="preview-unmapped">
                    <span>Unrecognized columns (preserved as metadata):</span>
                    <span className="unmapped-list">{previewData.unmappedColumns.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
            <div className="preview-summary-text">
              {previewData.newCasesCount > 0 ? (
                <span>
                  {previewData.existingCasesCount > 0
                    ? `${previewData.existingCasesCount} existing case ID(s) will be skipped. ${previewData.newCasesCount} new case(s) are ready to import.`
                    : `${previewData.newCasesCount} new case(s) ready to import.`}
                </span>
              ) : (
                <span className="caution-text">No new cases to import. All records in the CSV already exist in the database or are invalid.</span>
              )}
            </div>
            <div className="modal-actions">
              <button className="ghost-button" onClick={() => setPreviewData(null)}>Cancel</button>
              <button
                type="button"
                className="primary-button"
                disabled={previewData.newCasesCount === 0}
                onClick={handleConfirmImport}
              >
                Import {previewData.newCasesCount} New Case{previewData.newCasesCount === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
      {filtered.length ? (
        <CaseTable records={filtered} onOpen={(item) => navigate(`/cases/${item.caseId}`)} />
      ) : (
        <div className="empty-state">No cases found for this search or filter.</div>
      )}
      <Disclaimer />
    </div>
  )
}

function buildEvidenceGraph(selected, data, allCases) {
  const nodes = []
  const edges = []
  const addNode = (node) => {
    if (node?.id && !nodes.some((candidate) => candidate.id === node.id)) nodes.push(node)
  }
  const addEdge = (from, to, label) => {
    if (from && to && nodes.some((node) => node.id === from) && nodes.some((node) => node.id === to)) edges.push([from, to, label])
  }
  const evidenceById = new Map((data.evidence || []).map((item, index) => [`${selected.caseId}-E${String(index + 1).padStart(2, '0')}`, item]))
  const evidenceByType = new Map((selected.evidence || []).map((item) => [item.type, item]))
  const vendorId = selected.vendorId || selected.vendor
  const payment = evidenceByType.get('Payment')
  const progress = evidenceByType.get('Progress')

  addNode({ id: selected.caseId, type: 'Case', label: selected.caseId, meta: selected.projectName, tone: 'blue', detail: `${selected.status} · ${selected.department}` })
  if (selected.projectId) addNode({ id: selected.projectId, type: 'Project', label: selected.projectId, meta: `${selected.location} · ${selected.projectProgress}% complete`, tone: 'green', detail: selected.projectName })
  if (selected.vendor) addNode({ id: vendorId, type: 'Vendor', label: selected.vendor, meta: `Vendor · ${selected.vendorId || 'ID unavailable'}`, tone: 'blue', detail: `Vendor risk ${selected.vendorRiskScore}` })
  if (selected.invoiceId) addNode({ id: selected.invoiceId, type: 'Invoice', label: selected.invoiceId, meta: `${money(selected.invoiceAmount)} vs ${money(selected.expectedAmount)} expected`, tone: 'amber', detail: `Submitted ${selected.invoiceDate}` })
  if (payment) addNode({ id: payment.label, type: 'Payment', label: payment.label, meta: payment.meta, tone: 'red', detail: `Payment date ${selected.paymentDate}` })
  if (progress) addNode({ id: progress.label, type: 'Progress', label: progress.label, meta: progress.meta, tone: 'green', detail: `${selected.projectProgress}% recorded progress` })
  data.findings.forEach((finding) => addNode({ id: finding.finding_id, type: 'Finding/Anomaly', label: finding.title, meta: `${finding.risk_contribution} points · ${finding.status}`, tone: 'amber', detail: finding.explanation }))
  evidenceById.forEach((item, evidenceId) => addNode({ id: evidenceId, type: 'Evidence', label: item.label, meta: item.meta, tone: item.tone, detail: item.type }))
  ;(selected.relatedRecords || []).forEach((record) => addNode({ id: record.id, type: 'Related Case/Record', label: record.id, meta: `${record.type || 'Record'} · ${record.label}`, tone: 'blue', detail: `${record.amount ?? 'Amount unavailable'} · ${record.date || 'Date unavailable'}` }))

  addEdge(selected.caseId, selected.projectId, 'Case → Project')
  addEdge(selected.projectId, vendorId, 'Project → Vendor')
  addEdge(selected.projectId, selected.invoiceId, 'Project → Invoice')
  addEdge(vendorId, selected.invoiceId, 'Vendor → Invoice')
  if (payment) addEdge(selected.invoiceId, payment.label, 'Invoice → Payment')
  if (progress) addEdge(payment ? payment.label : selected.invoiceId, progress.label, 'Payment → Progress')
  data.findings.forEach((finding) => finding.evidence_ids.forEach((evidenceId) => {
    if (evidenceById.has(evidenceId)) addEdge(finding.finding_id, evidenceId, 'Finding/Anomaly → Evidence')
  }))
  ;(selected.relatedRecords || []).forEach((record) => addEdge(selected.caseId, record.id, 'Case → Related Case/Record'))

  const selectedRelatedIds = new Set((selected.relatedRecords || []).map((record) => record.id))
  const crossCaseNodes = allCases.filter((candidate) => {
    if (candidate.caseId === selected.caseId) return false
    const candidateRelatedIds = new Set((candidate.relatedRecords || []).map((record) => record.id))
    return candidate.vendor === selected.vendor ||
      (selected.projectId && candidate.projectId === selected.projectId) ||
      candidate.invoiceId === selected.invoiceId ||
      candidate.payment === selected.payment ||
      (candidate.relatedRecords || []).some((record) => selectedRelatedIds.has(record.id)) ||
      (selected.relatedRecords || []).some((record) => candidateRelatedIds.has(record.id) || record.id === candidate.invoiceId || record.id === candidate.payment)
  }).map((candidate) => ({
    id: candidate.caseId,
    type: 'Related Case/Record',
    label: candidate.caseId,
    meta: `${candidate.projectName} · ${candidate.vendor}`,
    tone: 'blue',
    detail: candidate.vendor === selected.vendor ? 'Shared vendor' : candidate.projectId === selected.projectId ? 'Shared project' : 'Shared structured record',
  }))
  crossCaseNodes.forEach(addNode)
  crossCaseNodes.forEach((node) => addEdge(selected.caseId, node.id, 'Case → Related Case/Record'))

  return { nodes, edges }
}

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function DynamicEvidenceGraphPage() {
  const allCases = getAllCases()
  const [selectedId, setSelectedId] = useState(allCases[0]?.caseId || 'CASE-1042')
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [fitView, setFitView] = useState(true)
  const selected = allCases.find((item) => item.caseId === selectedId) || allCases[0]
  if (!selected) return <div className="page"><div className="empty-state">No cases available for evidence graph.</div></div>
  const data = runInvestigation(selected.caseId)
  const graph = buildEvidenceGraph(selected, data, allCases)
  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId)
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]))

  const nodeCount = graph.nodes.length
  const calculatedScale = fitView ? Math.max(0.72, Math.min(1, 8.5 / Math.max(8.5, nodeCount))) : 1

  const handleMouseDown = (e) => {
    const container = e.currentTarget
    container.dataset.isDown = 'true'
    container.dataset.startX = e.pageX - container.offsetLeft
    container.dataset.scrollLeft = container.scrollLeft
  }
  const handleMouseLeave = (e) => { e.currentTarget.dataset.isDown = 'false' }
  const handleMouseUp = (e) => { e.currentTarget.dataset.isDown = 'false' }
  const handleMouseMove = (e) => {
    const container = e.currentTarget
    if (container.dataset.isDown !== 'true') return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - Number(container.dataset.startX)) * 1.4
    container.scrollLeft = Number(container.dataset.scrollLeft) - walk
  }

  return (
    <div className="page">
      <PageHeading
        eyebrow="WORKSPACE / RELATIONSHIPS"
        title="Evidence Graph"
        copy="Trace connected procurement, payment, project, finding, and cross-case records."
        action={
          <label className="case-select">
            Select case
            <select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setSelectedNodeId(null) }}>
              {allCases.map((item) => (
                <option key={item.caseId} value={item.caseId}>
                  {item.caseId} · {item.projectName}
                </option>
              ))}
            </select>
          </label>
        }
      />
      <section className="panel graph-page-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker"><GitBranch size={13} /> CASE RELATIONSHIP MAP</span>
            <h2>{selected.caseId} / {selected.vendor}</h2>
          </div>
          <div className="graph-controls-head">
            <button
              type="button"
              className={'ghost-button fit-button' + (fitView ? ' active' : '')}
              onClick={() => setFitView(!fitView)}
              title="Toggle Fit View"
            >
              <Sparkles size={13} /> {fitView ? 'Fit view' : '100%'}
            </button>
            <span className={'risk-score ' + data.riskLevel.toLowerCase()}><i />Risk {data.riskScore}</span>
          </div>
        </div>
        {graph.nodes.length ? (
          <div
            className="graph-viewport-wrapper"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div
              className="graph-stack"
              style={{
                transform: calculatedScale < 1 ? `scale(${calculatedScale})` : 'none',
                transformOrigin: 'left center',
                width: calculatedScale < 1 ? `${(100 / calculatedScale).toFixed(1)}%` : '100%'
              }}
            >
              {graph.nodes.map((node, index) => (
                <div key={node.id} className="graph-stack-item">
                  <button
                    type="button"
                    className={'evidence-node ' + node.tone + (selectedNodeId === node.id ? ' selected' : '')}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <span>{node.type}</span>
                    <strong>{node.label}</strong>
                    <small>{node.meta}</small>
                  </button>
                  {index < graph.nodes.length - 1 && (
                    <div className="graph-arrow"><ChevronRight size={16} /></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">No supported graph data for this case.</div>
        )}
        {selectedNode && (
          <div className="saved-note">
            <FileSearch size={15} />
            <span>
              <strong>{selectedNode.type}:</strong> {selectedNode.label} · {selectedNode.meta}
              {selectedNode.detail ? ` · ${selectedNode.detail}` : ''}
            </span>
          </div>
        )}
        <div className="related-list">
          <div className="related-head">
            <span>Supported relationships</span>
            <span>{graph.edges.length} linked</span>
          </div>
          {graph.edges.length ? (
            graph.edges.map(([from, to, label]) => (
              <div className="related-row" key={`${from}-${to}`}>
                <span className="record-icon"><GitBranch size={14} /></span>
                <div>
                  <strong>{nodeMap.get(from)?.label || from}</strong>
                  <small>{label} {nodeMap.get(to)?.label || to}</small>
                </div>
                <small>{nodeMap.get(to)?.type || 'Record'}</small>
              </div>
            ))
          ) : (
            <div className="empty-state">No supported relationships for this case.</div>
          )}
        </div>
      </section>
    </div>
  )
}

function DynamicReviewQueue() { const navigate = useNavigate(); const [filter, setFilter] = useState('All'); const [department, setDepartment] = useState('All'); const [vendor, setVendor] = useState('All'); const allCases = getAllCases(); const priorities = allCases.map((item) => ({ item, result: runInvestigation(item.caseId) })).sort((left, right) => right.result.riskScore - left.result.riskScore); const departments = ['All', ...new Set(allCases.map((item) => item.department))]; const vendors = ['All', ...new Set(allCases.map((item) => item.vendor))]; const queued = priorities.filter(({ item, result }) => (filter === 'All' || result.riskLevel === filter) && (department === 'All' || item.department === department) && (vendor === 'All' || item.vendor === vendor)); return <div className="page"><PageHeading eyebrow="HUMAN REVIEW WORKSPACE" title="Review Queue" copy="Cases requiring investigator attention and verification." action={<span className="nav-pip queue-count">{queued.length} pending</span>} /><div className="files-toolbar"><div className="filter-row">{['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((item) => <button key={item} className={filter === item ? 'filter-button active' : 'filter-button'} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="filter-row"><select className="case-select" value={department} onChange={(event) => setDepartment(event.target.value)}><option value="All">All departments</option>{departments.slice(1).map((item) => <option key={item}>{item}</option>)}</select><select className="case-select" value={vendor} onChange={(event) => setVendor(event.target.value)}><option value="All">All vendors</option>{vendors.slice(1).map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="review-table"><div className="review-head"><span>Case ID</span><span>Risk score</span><span>Priority</span><span>Reason</span><span>Assigned to</span><span>Status</span><span>Action</span></div>{queued.map(({ item, result }) => <div className="review-row" key={item.caseId}><span className="case-id">{item.caseId}</span><span className={'risk-score ' + result.riskLevel.toLowerCase()}>{result.riskScore}</span><span className={'status ' + riskClass(item.status)}>{item.status}</span><span className="review-reason">{result.findings[0].explanation}</span><span>Analyst Desk</span><span>{item.status}</span><button className="ghost-button" onClick={() => { updateCaseStatus(item.caseId, 'Reviewed'); navigate(`/cases/${item.caseId}`) }}>Review</button></div>)}</div>{!queued.length && <div className="empty-state">No cases match the current review filters.</div>}</div> }

function CasePage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const sourceCase = getCaseById(caseId)
  const [investigation, setInvestigation] = useState(null)
  const [running, setRunning] = useState(false)
  const [stage, setStage] = useState(0)
  const [noteOpen, setNoteOpen] = useState(false)
  const [draft, setDraft] = useState(sourceCase?.notes || '')
  const [requestError, setRequestError] = useState('')

  if (!sourceCase) return <Navigate to="/dashboard" replace />

  const selectedCase = { ...sourceCase, ...runInvestigation(caseId) }
  const status = sourceCase.status

  const startInvestigation = () => {
    setRunning(true)
    setRequestError('')
    setStage(1)
    setTimeout(() => setStage(2), 350)
    setTimeout(() => setStage(3), 700)
    setTimeout(() => setStage(4), 1050)
    setTimeout(() => setStage(5), 1400)
    setTimeout(() => {
      try {
        const result = runInvestigation(caseId)
        setInvestigation(result)
        setStage(6)
      } catch {
        setRequestError('Investigation could not be completed. Please retry.')
        setStage(-1)
      } finally {
        setRunning(false)
      }
    }, 1750)
  }

  const handleExportReport = () => {
    const reportData = investigation || runInvestigation(caseId)
    const safeText = `Case ID: ${caseId}\nProject: ${selectedCase.project}\nVendor: ${selectedCase.vendor}\nInvoice: ${selectedCase.invoice}\nRisk Score: ${reportData.riskScore}/100\nRisk Level: ${reportData.riskLevel}\n\nKey Findings:\n${reportData.findings.map((finding) => `- ${finding.title}: ${finding.explanation}`).join('\n')}\n\nRecommendations:\n${reportData.recommendations.map((item) => `- ${item}`).join('\n')}\n\nEvidence Links:\n${reportData.evidence.map((item) => `- ${item.type}: ${item.label} (${item.meta})`).join('\n')}`
    const blob = new Blob([safeText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${caseId}-investigation-report.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const stages = ['Anomaly detection', 'Vendor history analysis', 'Related transaction analysis', 'Timeline reconstruction', 'Evidence correlation', 'AI investigation reasoning']

  return <div className="page case-page"><div className="breadcrumbs"><button onClick={() => navigate('/dashboard')}>Investigation Desk</button><ChevronRight size={13} /><button onClick={() => navigate('/dashboard')}>Case Overview</button><ChevronRight size={13} /><strong>{caseId}</strong></div><button className="back-button" onClick={() => navigate('/dashboard')}><ArrowLeft size={15} /> Back to case overview</button><div className="case-heading"><div><div className="eyebrow"><span /> CASE FILE / {caseId}</div><h1>{selectedCase.project}</h1><p>{selectedCase.vendor} <span className="dot-sep">•</span> {selectedCase.invoice}</p></div><div className="case-heading-actions"><span className={'status ' + riskClass(status)}>{status}</span>{!investigation && !running && <button className="primary-button run-button" onClick={startInvestigation}><Sparkles size={17} /> Run AI investigation</button>}{investigation && <button type="button" className="ghost-button" onClick={handleExportReport}><FileSearch size={16} /> Export report</button>}</div></div><div className="case-summary"><div><span>Case ID</span><strong>{caseId}</strong></div><div><span>Invoice amount</span><strong>₹{Number(selectedCase.amount).toLocaleString('en-IN')}</strong></div><div><span>Risk level</span><strong className="high-text">{selectedCase.riskLevel}</strong></div><div><span>Current status</span><strong>{status}</strong></div><div className="score-block"><span>Risk score</span><strong>{selectedCase.riskScore} <small>/ 100</small></strong><div className="score-bar"><i style={{ width: `${selectedCase.riskScore}%` }} /></div></div></div>{(running || !investigation) && <AnalysisPanel running={running} stage={stage} stages={stages} requestError={requestError} onRun={startInvestigation} />}{investigation && <InvestigationResult data={investigation} status={status} updateStatus={() => updateCaseStatus(caseId, 'Reviewed')} onEscalate={() => updateCaseStatus(caseId, 'Under Investigation')} note={sourceCase.notes || 'No investigation note recorded yet.'} onAddNote={() => setNoteOpen(true)} />}{noteOpen && <NoteModal value={draft} setValue={setDraft} onClose={() => setNoteOpen(false)} onSave={() => { setCaseNote(caseId, draft); setNoteOpen(false) }} />}</div>
}

function AnalysisPanel({ running, stage, stages, requestError, onRun }) { const failed = stage < 0; return <div className={'analysis-panel ' + (running ? 'is-running' : '')}><div className="analysis-copy"><div className="analysis-orb"><BrainCircuit size={23} /></div><div><h2>{running ? 'Analyzing connected evidence...' : failed ? 'Investigation error' : 'Ready to investigate'}</h2><p>{running ? 'Analyzing connected evidence...' : failed ? requestError : 'Run the local investigation engine to surface connected anomalies and evidence.'}</p></div></div>{running ? <div className="stage-list">{stages.map((item, index) => <div className={'stage ' + (index + 1 < stage ? 'done' : index + 1 === stage ? 'current' : '')} key={item}><span>{index + 1 < stage ? <Check size={13} /> : index + 1}</span>{item}{index + 1 === stage && <i />}</div>)}</div> : <button className="primary-button run-button" onClick={onRun}><Play size={15} fill="currentColor" /> {failed ? 'Retry analysis' : 'Start analysis'}</button>}</div> }

function InvestigationResult({ data, status, updateStatus, onEscalate, note, onAddNote }) { const [selectedEvidenceId, setSelectedEvidenceId] = useState(null); return <><div className="section-head result-head"><div><h2>Investigation findings</h2><span className="muted">Model-assisted review of linked procurement records</span></div><span className="generated"><span className="live-dot" /> Investigation completed</span></div><div className="anomaly-grid">{data.anomalies.map((item) => <AnomalyCard key={item.finding_id} item={item} onSelect={() => setSelectedEvidenceId(item.evidence_ids[0] || null)} />)}</div><div className="investigation-grid"><EvidenceGraph data={data} selectedEvidenceId={selectedEvidenceId} onSelect={setSelectedEvidenceId} /><Timeline data={data.timeline} /></div><Report data={data} status={status} updateStatus={updateStatus} onEscalate={onEscalate} note={note} onAddNote={onAddNote} /></> }

function AnomalyCard({ item, onSelect }) { return <button className="anomaly-card" onClick={onSelect}><div className="anomaly-top"><span className="anomaly-icon"><AlertTriangle size={15} /></span><span className="severity">SIGNAL {item.score}</span></div><h3>{item.title}</h3><div className="anomaly-metrics"><div><span>Detected value</span><strong>{item.detected_value}</strong></div><div><span>Expected range</span><strong>{item.expected_value}</strong></div></div><div className="anomaly-score"><div><span>Risk contribution</span><strong>{item.risk_contribution} points</strong></div><div className="mini-bar"><i style={{ width: `${item.score}%` }} /></div></div><p>{item.explanation}</p><small className="finding-support">{item.status} · Evidence: {item.evidence_ids.length ? item.evidence_ids.join(', ') : 'None linked'}</small></button> }

function EvidenceGraph({ data, selectedEvidenceId, onSelect }) {
  const nodeCount = data.evidence ? data.evidence.length : 0
  const fitScale = Math.max(0.78, Math.min(1, 5.5 / Math.max(5.5, nodeCount)))

  const handleMouseDown = (e) => {
    const container = e.currentTarget
    container.dataset.isDown = 'true'
    container.dataset.startX = e.pageX - container.offsetLeft
    container.dataset.scrollLeft = container.scrollLeft
  }
  const handleMouseLeave = (e) => { e.currentTarget.dataset.isDown = 'false' }
  const handleMouseUp = (e) => { e.currentTarget.dataset.isDown = 'false' }
  const handleMouseMove = (e) => {
    const container = e.currentTarget
    if (container.dataset.isDown !== 'true') return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - Number(container.dataset.startX)) * 1.4
    container.scrollLeft = Number(container.dataset.scrollLeft) - walk
  }

  return (
    <section className="panel evidence-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker"><GitBranch size={13} /> RELATIONSHIP MAP</span>
          <h2>Connected evidence</h2>
        </div>
      </div>
      <div
        className="graph-viewport-wrapper"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div
          className="evidence-flow"
          style={{
            transform: fitScale < 1 ? `scale(${fitScale})` : 'none',
            transformOrigin: 'left center',
            width: fitScale < 1 ? `${(100 / fitScale).toFixed(1)}%` : '100%'
          }}
        >
          {data.evidence.map((item, index) => {
            const itemEvidenceId = `${data.caseId}-E${String(index + 1).padStart(2, '0')}`
            return (
              <div className="evidence-node-wrap" key={`${item.type}-${item.label || index}`}>
                <button
                  type="button"
                  className={'evidence-node ' + item.tone + (selectedEvidenceId === itemEvidenceId ? ' selected' : '')}
                  onClick={() => onSelect(itemEvidenceId)}
                >
                  <span>{item.type}</span>
                  <strong>{item.label}</strong>
                  <small>{item.meta}</small>
                </button>
                {index < data.evidence.length - 1 && (
                  <div className="flow-line"><ChevronRight size={14} /></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="related-list">
        <div className="related-head">
          <span>Related records</span>
          <span>{data.related.length} linked</span>
        </div>
        {data.related.map((item) => (
          <div className="related-row" key={item.id}>
            <span className="record-icon"><FileSearch size={14} /></span>
            <div>
              <strong>{item.id}</strong>
              <small>{item.label}</small>
            </div>
            <strong>{item.amount}</strong>
            <small>{item.date}</small>
          </div>
        ))}
      </div>
      {selectedEvidenceId && (
        <div className="saved-note">
          <FileSearch size={15} />
          <span>Selected supporting evidence: <strong>{selectedEvidenceId}</strong></span>
        </div>
      )}
    </section>
  )
}

function Timeline({ data }) { return <section className="panel timeline-panel"><div className="panel-heading"><div><span className="panel-kicker"><Clock3 size={13} /> EVENT SEQUENCE</span><h2>Timeline reconstruction</h2></div></div><div className="timeline">{data.map((item, index) => <div className={'timeline-item ' + (item.flag ? 'flagged' : '')} key={item.event_id || `${item.event}-${index}`}><div className="timeline-marker">{item.flag ? <AlertTriangle size={12} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div><div><span className="timeline-date">{item.date}</span><strong>{item.title || item.event}</strong><small>{item.description || item.detail}</small></div></div>)}</div></section> }

function Report({ data, status, updateStatus, onEscalate, note, onAddNote }) { const [checks, setChecks] = useState([]); const toggle = (index) => setChecks((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]); return <section className="report-section"><div className="report-card"><div className="report-header"><div><span className="panel-kicker"><BrainCircuit size={13} /> AI INVESTIGATION SUMMARY</span><h2>Pattern assessment</h2></div><div className="report-score"><span>RISK SCORE</span><strong>{data.riskScore}<small>/100</small></strong><span className="high-text">HIGH PRIORITY</span></div></div><div className="report-columns"><div><h3>Key findings</h3><ol>{data.findings.map((finding) => <li key={finding.finding_id}>{finding.title}: {finding.explanation}</li>)}</ol><div className="caution"><AlertTriangle size={16} /><span><strong>Suspicious pattern detected.</strong> Further human verification is recommended before any determination.</span></div></div><div className="explanations"><h3>Possible explanations</h3>{data.explanations.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div></div></div><div className="actions-card"><div className="panel-heading"><div><span className="panel-kicker"><ClipboardCheck size={13} /> NEXT STEPS</span><h2>Recommended investigation actions</h2></div><span className="progress-count">{checks.length}/{data.recommendations.length}</span></div><div className="checklist">{data.recommendations.map((item, index) => <button key={`${item}-${index}`} className={checks.includes(index) ? 'checked' : ''} onClick={() => toggle(index)}><span>{checks.includes(index) && <Check size={13} />}</span>{item}</button>)}</div></div><AgenticTracePanel /><div className="saved-note"><ClipboardCheck size={15} /><span><strong>Investigation note:</strong> {note || 'No investigation note recorded yet.'}</span></div><div className="decision-bar"><div><span>AI recommendation</span><strong>Prioritize for human review</strong></div><div className="decision-actions"><button className="ghost-button" onClick={updateStatus}>Mark reviewed</button><button className="ghost-button" onClick={onEscalate}>Escalate</button><button className="primary-button" onClick={onAddNote}>Add note</button></div></div></section> }

function NoteModal({ value, setValue, onClose, onSave }) { return <div className="modal-backdrop"><div className="note-modal"><div className="panel-heading"><div><span className="panel-kicker">INVESTIGATION LOG</span><h2>Add investigation note</h2></div><button className="icon-button" onClick={onClose} aria-label="Close note dialog"><X size={16} /></button></div><textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="Record a verification step, observation, or follow-up..." autoFocus /><div className="modal-actions"><button className="ghost-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={onSave}>Save note</button></div></div></div> }

function DynamicAnalyticsPage() {
  const analytics = getAnalytics()
  const vendorIntel = getVendorIntelligence()
  const colors = ['#e77855', '#e9a84e', '#56a987', '#5b8fd1']
  const statusCounts = ['New', 'Under Review', 'Under Investigation', 'Reviewed'].map((label) => ({ label, value: getAllCases().filter((item) => item.status === label).length }))
  return <div className="page analytics-page"><PageHeading eyebrow="SIGNAL INTELLIGENCE" title="Analytics" copy="Portfolio-level signals across the investigation workspace." action={<span className="muted">Centralized Case Store</span>} /><div className="stats-grid"><div className="stat-card"><div className="stat-label">Total cases</div><div className="stat-value">{analytics.total}</div><div className="stat-delta">Calculated from dataset</div></div><div className="stat-card"><div className="stat-label">Average anomaly score</div><div className="stat-value">{analytics.averageScore}</div><div className="stat-delta">Deterministic engine score</div></div><div className="stat-card"><div className="stat-label">Critical cases</div><div className="stat-value">{analytics.critical}</div><div className="stat-delta">Priority review</div></div><div className="stat-card"><div className="stat-label">Under investigation</div><div className="stat-value">{analytics.underInvestigation}</div><div className="stat-delta">Current status</div></div></div><div className="analytics-top"><div className="metric-panel"><span>Average investigation score</span><strong>{analytics.averageScore}</strong><small><ArrowUpRight size={13} /> Calculated from all cases</small><div className="sparkline"><ResponsiveContainer width="100%" height="65"><AreaChart data={analytics.trend}><Area type="monotone" dataKey="cases" stroke="#e77855" fill="#e77855" fillOpacity=".12" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></div><div className="chart-panel"><div className="panel-heading"><div><span className="panel-kicker">DISTRIBUTION</span><h2>Cases by risk level</h2></div></div><div className="donut-chart"><ResponsiveContainer width="130" height="130"><PieChart><Pie data={analytics.riskLevels} dataKey="value" innerRadius={42} outerRadius={59} strokeWidth={0}>{analytics.riskLevels.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie></PieChart></ResponsiveContainer></div><div className="legend">{analytics.riskLevels.map((item, index) => <div key={item.name} className="legend-item"><span style={{ background: colors[index % colors.length] }} /><span>{item.name}</span><strong>{item.value}</strong></div>)}</div></div><div className="chart-panel"><div className="panel-heading"><div><span className="panel-kicker">VENDOR INTELLIGENCE</span><h2>Highest-risk vendors</h2></div></div><div className="vendor-bars">{vendorIntel.slice(0, 5).map((vendor) => <div className="vendor-bar" key={vendor.vendorId || vendor.vendor}><div><span>{vendor.vendor}</span><strong>{vendor.averageRiskScore}</strong></div><div><i className={vendor.averageRiskScore >= 60 ? '' : vendor.averageRiskScore >= 30 ? 'medium' : 'low'} style={{ width: `${Math.min(100, vendor.averageRiskScore)}%` }} /></div><small>{vendor.totalCases} cases · {vendor.highRiskCases} high risk · ₹{Number(vendor.totalInvoiceAmount).toLocaleString('en-IN')} invoiced</small></div>)}</div></div></div><div className="analytics-bottom"><div className="panel"><div className="panel-heading"><div><span className="panel-kicker">ANOMALY PROFILE</span><h2>Most common anomaly signals</h2></div></div><div className="bar-chart"><ResponsiveContainer width="100%" height={180}><BarChart data={analytics.anomalies}><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="value" fill="#e77855" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div><div className="panel"><div className="panel-heading"><div><span className="panel-kicker">WORKSPACE STATUS</span><h2>Investigation lifecycle</h2></div></div><div className="mini-status-list">{statusCounts.map((item) => <div key={item.label} className="mini-status"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></div></div></div>
}
