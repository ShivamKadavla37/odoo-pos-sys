import { usePOS } from '../../context/POSContext'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  'dashboard':       { label: 'Dashboard',        sub: 'Overview of your POS system' },
  'products':        { label: 'Products',          sub: 'Manage your menu & catalog' },
  'payment-methods': { label: 'Payment Methods',   sub: 'Configure how you accept payments' },
  'floor-plan':      { label: 'Floor Plan',        sub: 'Arrange tables and zones' },
  'pos-terminal':    { label: 'POS Terminal',      sub: 'Manage sessions & open the register' },
  'reports':         { label: 'Reports',           sub: 'Sales analytics & insights' },
}

function AvatarInitials({ name }) {
  const initials = (name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #6B21A8, #9333EA)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora', sans-serif", fontSize: '0.8125rem', fontWeight: 700,
      color: '#fff', userSelect: 'none',
      boxShadow: '0 2px 12px rgba(107,33,168,0.45)',
    }}>
      {initials}
    </div>
  )
}

export default function TopBar() {
  const { currentUser, currentSession } = usePOS()
  const location = useLocation()
  const activeRoute = location.pathname.split('/').pop() || 'dashboard'
  const title = PAGE_TITLES[activeRoute] ?? (PAGE_TITLES['dashboard'] || { label: 'POS Cafe', sub: '' })
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <header style={{
      height: '72px',
      background: 'rgba(255,255,255,0.97)',
      borderBottom: '1px solid rgba(226,232,240,0.8)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      gap: '1rem',
      boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 9,
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '1.1rem', fontWeight: 700,
          color: '#1E293B', margin: 0, lineHeight: 1.2,
        }}>
          {title.label}
        </h1>
        {title.sub && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.8125rem', color: '#94A3B8', margin: 0,
          }}>
            {title.sub}
          </p>
        )}
      </div>

      {/* Right side group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

        {/* Date/time */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          padding: '0.375rem 0.75rem',
          background: 'rgba(107,33,168,0.05)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(107,33,168,0.1)',
        }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#6B21A8' }}>
            {timeStr}
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: '#94A3B8' }}>
            {dateStr}
          </span>
        </div>

        {/* Session status badge */}
        {currentSession?.status === 'open' ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '2rem',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>
              Session Open
            </span>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '2rem',
            background: 'rgba(100,116,139,0.08)',
            border: '1px solid rgba(100,116,139,0.2)',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#64748B' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              No Session
            </span>
          </div>
        )}

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: 'rgba(226,232,240,0.8)' }} />

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <AvatarInitials name={currentUser?.name} />
          <div>
            <p style={{
              fontFamily: "'Sora', sans-serif", fontSize: '0.875rem',
              fontWeight: 600, color: '#1E293B', margin: 0, whiteSpace: 'nowrap',
            }}>
              {currentUser?.name ?? 'Cashier'}
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem',
              color: '#94A3B8', margin: 0, whiteSpace: 'nowrap',
            }}>
              {currentUser?.email ?? ''}
            </p>
          </div>
        </div>

      </div>
    </header>
  )
}
