import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileDown, FileSpreadsheet } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { getCaseById } from '../data'
import { exportCaseCsv, exportCasePdf } from '../services/reportExport'

export default function CaseExportBar() {
  const { caseId } = useParams()
  const caseItem = getCaseById(caseId)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!caseItem) return null

  const runExport = async (exporter) => {
    try {
      await exporter(caseItem)
    } catch {
      window.alert('The export could not be generated. Please retry.')
    }
  }

  const chooseExport = (exporter) => {
    setOpen(false)
    runExport(exporter)
  }

  return <div className="case-export-bar"><span>Reports and structured exports</span><div className="export-menu" ref={menuRef}><button className="primary-button export-trigger" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((current) => !current)}><FileDown size={15} /> Export Report <ChevronDown size={14} className={open ? 'is-open' : ''} /></button>{open && <div className="export-dropdown" role="menu"><button role="menuitem" onClick={() => chooseExport(exportCaseCsv)}><FileSpreadsheet size={15} /> Export as CSV</button><button role="menuitem" onClick={() => chooseExport(exportCasePdf)}><FileDown size={15} /> Export as PDF</button></div>}</div></div>
}
