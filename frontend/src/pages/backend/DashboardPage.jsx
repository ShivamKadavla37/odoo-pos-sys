import { usePOS } from '../../context/POSContext'

const STAT_CARDS = [
  { label: 'Total Sales Today',   value: '₹0',  sub: '0 orders',      color: '#6B21A8', bg: 'rgba(107,33,168,0.08)', icon: '💰' },
  { label: 'Tables Occupied',     value: '0/0', sub: 'Floor plan empty', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  icon: '🪑' },
  { label: 'Pending Kitchen',     value: '0',   sub: 'Items to prepare', color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  icon: '🍳' },
  { label: 'Session Status',      value: 'Closed', sub: 'Open a session to start', color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: '🖥️' },
]

const QUICK_ACTIONS = [
  { id: 'pos-terminal', label: 'Open POS Terminal',  emoji: '🖥️', desc: 'Start or resume a session' },
  { id: 'floor-plan',   label: 'Manage Floor Plan',  emoji: '🗺️', desc: 'Add tables and zones' },
  { id: 'products',     label: 'Add Products',       emoji: '📦', desc: 'Build your menu catalog' },
  { id: 'reports',      label: 'View Reports',       emoji: '📊', desc: 'Analyse sales & trends' },
]

import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { currentSession, tables, orders, kitchenOrders } = usePOS()
  const navigate = useNavigate()

  const occupiedCount = tables.filter(t => t.status === 'occupied').length
  const pendingKitchen = kitchenOrders.filter(k => k.stage !== 'completed').length
  const todaySales = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.total ?? 0), 0)

  const stats = [
    { ...STAT_CARDS[0], value: `₹${todaySales.toLocaleString('en-IN')}`, sub: `${orders.filter(o=>o.status==='paid').length} orders` },
    { ...STAT_CARDS[1], value: `${occupiedCount}/${tables.length}`, sub: tables.length === 0 ? 'No tables yet' : `${occupiedCount} occupied` },
    { ...STAT_CARDS[2], value: `${pendingKitchen}`, sub: pendingKitchen === 0 ? 'All clear!' : 'Items to prepare' },
    { ...STAT_CARDS[3], value: currentSession?.status === 'open' ? 'Open' : 'Closed', sub: currentSession?.status === 'open' ? `Since ${new Date(currentSession.openedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Open a session to start' },
  ]

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Welcome banner */}
      <div style={{
        borderRadius: '1rem', padding: '1.75rem 2rem', marginBottom: '2rem',
        background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 60%, #9333EA 100%)',
        boxShadow: '0 8px 32px rgba(107,33,168,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.375rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} ☕
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9375rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Your POS Cafe dashboard is ready.{' '}
            {currentSession?.status !== 'open' && 'Open a session to begin taking orders.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/backend/terminal')}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '0.625rem',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          🖥️ Open Terminal
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '0.875rem', padding: '1.5rem',
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '0.625rem',
                background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
              }}>
                {s.icon}
              </div>
            </div>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.625rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.25rem' }}>
              {s.value}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: '#64748B', margin: '0 0 0.125rem', fontWeight: 600 }}>
              {s.label}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.id}
              id={`quick-${a.id}`}
              onClick={() => navigate(a.id === 'pos-terminal' ? '/backend/terminal' : `/backend/${a.id}`)}
              style={{
                background: '#fff', borderRadius: '0.875rem', padding: '1.25rem',
                border: '1px solid rgba(226,232,240,0.8)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(107,33,168,0.35)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(107,33,168,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
            >
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.625rem' }}>{a.emoji}</span>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.25rem' }}>{a.label}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>
          Recent Orders
        </h3>
        <div style={{
          background: '#fff', borderRadius: '0.875rem', border: '1px solid rgba(226,232,240,0.8)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
          {orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🧾</p>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>No orders yet</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#94A3B8' }}>Orders will appear here once you open a session.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Order ID', 'Table', 'Items', 'Total', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(-5).reverse().map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.875rem 1.25rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#6B21A8', fontWeight: 600 }}>#{o.id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#475569' }}>
                      {o.tableId ? `Table ${tables.find(t => t.id === o.tableId)?.number ?? '?'}` : 'Takeaway'}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#475569' }}>{o.items?.length ?? 0}</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontFamily: "'Sora', sans-serif", fontSize: '0.875rem', color: '#1E293B', fontWeight: 700 }}>₹{o.total ?? 0}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        background: o.status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: o.status === 'paid' ? '#10B981' : '#F59E0B',
                      }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
