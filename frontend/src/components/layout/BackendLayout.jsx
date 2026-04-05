import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function BackendLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="backend-root" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar />

        {/* Page body */}
        <main
          className="main-scroll"
          style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
