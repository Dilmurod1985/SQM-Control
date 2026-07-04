import React from 'react'
import NcExportPanel from './components/NcExportPanel'

export default function NcLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">{children}</div>
      <aside className="w-64">
        <NcExportPanel />
      </aside>
    </div>
  )
}
