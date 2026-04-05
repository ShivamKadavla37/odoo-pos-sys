import { usePOS } from '../../context/POSContext'
import { showToast } from '../ui/Toast'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/backend',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'products',
    label: 'Products',
    path: '/backend/products',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    id: 'payment-methods',
    label: 'Payment Methods',
    path: '/backend/payments',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'floor-plan',
    label: 'Floor Plan',
    path: '/backend/floors',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    ),
  },
  {
    id: 'pos-terminal',
    label: 'POS Terminal',
    path: '/backend/terminal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    id: 'kitchen',
    label: 'Kitchen Display',
    path: '/kitchen',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: 'customer-display',
    label: 'Customer Display',
    path: '/customer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    id: 'self-ordering',
    label: 'Self Ordering',
    path: '/backend/self-ordering',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/backend/reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
]

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const { logoutUser } = usePOS()
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const handleLogout = () => {
    logoutUser()
    showToast('Signed out successfully. See you soon! 👋', 'info')
  }

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '240px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0F0F1A 0%, #0A0A14 100%)',
        borderRight: '1px solid rgba(107,33,168,0.18)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo / Brand */}
      <div style={{
        padding: collapsed ? '1.5rem 0 1rem 0' : '1.5rem 1.25rem',
        display: 'flex',
        flexDirection: collapsed ? 'column' : 'row',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(107,33,168,0.12)',
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: '72px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6B21A8, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', boxShadow: '0 4px 16px rgba(107,33,168,0.5)',
        }}>
          ☕
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: '#F1F5F9', margin: 0, whiteSpace: 'nowrap' }}>
              POS Cafe
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6875rem', color: 'rgba(148,163,184,0.5)', margin: 0, whiteSpace: 'nowrap' }}>
              Odoo Hackathon
            </p>
          </div>
        )}
        
        {/* Collapse button moved to the top header */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px',
            borderRadius: '0.375rem', border: 'none', cursor: 'pointer',
            background: 'rgba(107,33,168,0.15)', color: '#E2E8F0',
            transition: 'all 0.2s ease', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(107,33,168,0.25)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(107,33,168,0.15)'; e.currentTarget.style.color = '#E2E8F0' }}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}
          >
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      {/* Nav section label */}
      {!collapsed && (
        <p style={{
          padding: '1.125rem 1.25rem 0.5rem',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'rgba(100,116,139,0.6)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Navigation
        </p>
      )}

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: collapsed ? '1rem 0.5rem' : '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = currentPath === item.path
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.75rem' : '0.75rem 1rem',
                borderRadius: '0.625rem',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(107,33,168,0.9), rgba(124,58,237,0.85))'
                  : 'transparent',
                color: isActive ? '#fff' : 'rgba(148,163,184,0.75)',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 16px rgba(107,33,168,0.35)' : 'none',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(107,33,168,0.15)'
                  e.currentTarget.style.color = '#E2E8F0'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(148,163,184,0.75)'
                }
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', height: '60%',
                  width: '3px', borderRadius: '0 3px 3px 0',
                  background: '#F59E0B',
                }} />
              )}
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {!collapsed && (
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}>
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom: logout */}
      <div style={{
        padding: collapsed ? '1rem 0.5rem' : '1rem 0.75rem',
        borderTop: '1px solid rgba(107,33,168,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>

        {/* Logout */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: collapsed ? '0.75rem' : '0.75rem 1rem',
            borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
            width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent', color: 'rgba(239,68,68,0.7)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500 }}>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
