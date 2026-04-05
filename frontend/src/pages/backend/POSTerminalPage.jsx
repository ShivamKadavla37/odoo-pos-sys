
import { useState } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'

/* ─── tiny helpers ──────────────────────────────────────────────────── */
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : '—'

const fmtINR = (n) =>
  n != null && !isNaN(n)
    ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
    : '—'

/* ─── status badge ──────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const isOpen = status === 'open'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.3rem 0.875rem',
        borderRadius: '2rem',
        fontSize: '0.78rem',
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: isOpen
          ? 'rgba(16,185,129,0.12)'
          : 'rgba(148,163,184,0.1)',
        color: isOpen ? '#10B981' : '#94A3B8',
        border: `1px solid ${isOpen ? 'rgba(16,185,129,0.35)' : 'rgba(148,163,184,0.2)'}`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: isOpen ? '#10B981' : '#94A3B8',
          display: 'inline-block',
          animation: isOpen ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
      />
      {isOpen ? 'Open' : 'Closed'}
    </span>
  )
}

/* ─── info row inside terminal card ─────────────────────────────────── */
function InfoRow({ label, value, valueColor }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 0',
        borderBottom: '1px solid rgba(226,232,240,0.7)',
      }}
    >
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.875rem',
          color: '#64748B',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 600,
          color: valueColor ?? '#1E293B',
        }}
      >
        {value}
      </span>
    </div>
  )
}

/* ─── session history table ──────────────────────────────────────────── */
function SessionHistoryTable({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🕰️</p>
        <p
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '0.35rem',
          }}
        >
          No session history yet
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
            color: '#94A3B8',
          }}
        >
          Once you open and close a session, it will appear here.
        </p>
      </div>
    )
  }

  const TH = ({ children, align = 'left' }) => (
    <th
      style={{
        padding: '0.875rem 1.25rem',
        textAlign: align,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </th>
  )

  const TD = ({ children, align = 'left', style: s }) => (
    <td
      style={{
        padding: '0.875rem 1.25rem',
        textAlign: align,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.875rem',
        color: '#475569',
        verticalAlign: 'middle',
        ...s,
      }}
    >
      {children}
    </td>
  )

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
            <TH>Session ID</TH>
            <TH>Cashier</TH>
            <TH>Opened At</TH>
            <TH>Closed At</TH>
            <TH align="right">Total Sales</TH>
            <TH align="center">Status</TH>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr
              key={s.id}
              style={{
                borderBottom: '1px solid #F1F5F9',
                background: i % 2 === 0 ? '#fff' : '#FAFAFA',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(107,33,168,0.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFAFA')}
            >
              <TD>
                <span
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#6B21A8',
                    background: 'rgba(107,33,168,0.07)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '0.375rem',
                  }}
                >
                  #{s.id.slice(-8).toUpperCase()}
                </span>
              </TD>
              <TD>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6B21A8, #7C3AED)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: '#fff',
                      fontWeight: 700,
                      fontFamily: "'Sora', sans-serif",
                      flexShrink: 0,
                    }}
                  >
                    {(s.cashier ?? 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 500, color: '#1E293B' }}>{s.cashier ?? '—'}</span>
                </div>
              </TD>
              <TD style={{ color: '#64748B' }}>{fmt(s.openedAt)}</TD>
              <TD style={{ color: s.closedAt ? '#64748B' : '#94A3B8' }}>
                {s.closedAt ? fmt(s.closedAt) : <em style={{ color: '#F59E0B' }}>Still open</em>}
              </TD>
              <TD align="right">
                <span
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    color: '#1E293B',
                    fontSize: '0.9rem',
                  }}
                >
                  {fmtINR(s.totalSales)}
                </span>
              </TD>
              <TD align="center">
                <StatusBadge status={s.status} />
              </TD>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════ */
import { useNavigate } from 'react-router-dom'

export default function POSTerminalPage() {
  const navigate = useNavigate()
  const {
    currentUser,
    currentSession,
    sessionHistory,
    orders,
    openSession,
  } = usePOS()

  const [showHistory, setShowHistory] = useState(false)
  const [opening, setOpening] = useState(false)

  /* last closed session */
  const lastClosed = sessionHistory.find((s) => s.status === 'closed')

  /* last closing sale total */
  const lastSaleTotal = lastClosed?.totalSales

  /* handle open / resume */
  const handleOpenSession = () => {
    if (currentSession?.status === 'open') {
      showToast('Resuming existing session…', 'info')
      navigate('/pos/floor')
      return
    }
    setOpening(true)
    setTimeout(() => {
      const cashierName = currentUser?.name ?? currentUser?.email ?? 'Cashier'
      openSession(cashierName)
      showToast(`Session opened — Welcome, ${cashierName}! 🎉`, 'success')
      setOpening(false)
      navigate('/pos/floor')
    }, 600)
  }

  const isOpen = currentSession?.status === 'open'

  /* ── layout tokens ── */
  const card = {
    background: '#fff',
    borderRadius: '1rem',
    border: '1px solid rgba(226,232,240,0.8)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  }

  const sectionTitle = {
    fontFamily: "'Sora', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#1E293B',
    marginBottom: '1rem',
  }

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#1E293B',
            margin: '0 0 0.35rem',
          }}
        >
          🖥️ POS Terminal
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.9375rem',
            color: '#64748B',
            margin: 0,
          }}
        >
          Open or resume a selling session to start taking orders at the counter.
        </p>
      </div>

      {/* ── Terminal Card ─────────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>

        {/* Gradient header strip */}
        <div
          style={{
            background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 60%, #9333EA 100%)',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* terminal icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '0.875rem',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              🖥️
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 0 0.2rem',
                }}
              >
                Main Terminal
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8125rem',
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                }}
              >
                Odoo POS Cafe · Counter #1
              </p>
            </div>
          </div>
          <StatusBadge status={isOpen ? 'open' : 'closed'} />
        </div>

        {/* Info rows */}
        <div style={{ padding: '0.5rem 2rem 1rem' }}>
          <InfoRow
            label="Terminal Name"
            value="Main Terminal"
          />
          <InfoRow
            label="Last Session"
            value={
              lastClosed
                ? fmt(lastClosed.openedAt)
                : currentSession
                ? fmt(currentSession.openedAt)
                : 'No session yet'
            }
            valueColor={lastClosed || currentSession ? '#6B21A8' : '#94A3B8'}
          />
          <InfoRow
            label="Last Closing Sale"
            value={lastSaleTotal != null ? fmtINR(lastSaleTotal) : '—'}
            valueColor={lastSaleTotal > 0 ? '#16A34A' : '#94A3B8'}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.75rem',
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
                color: '#64748B',
                fontWeight: 500,
              }}
            >
              Current Cashier
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6B21A8, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: '#fff',
                  fontWeight: 700,
                  fontFamily: "'Sora', sans-serif",
                  flexShrink: 0,
                }}
              >
                {(currentUser?.name ?? currentUser?.email ?? 'U')[0].toUpperCase()}
              </div>
              <span
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1E293B',
                }}
              >
                {currentUser?.name ?? currentUser?.email ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* CTA area */}
        <div style={{ padding: '1rem 2rem 1.75rem' }}>
          {/* Active session info banner */}
          {isOpen && (
            <div
              className="animate-fade-in"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '0.75rem',
                padding: '0.875rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.25rem', marginTop: '0.05rem' }}>🟢</span>
              <div>
                <p
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#065F46',
                    margin: '0 0 0.2rem',
                  }}
                >
                  Session is active
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#047857',
                    margin: 0,
                  }}
                >
                  Opened{' '}
                  {currentSession?.openedAt
                    ? fmt(currentSession.openedAt)
                    : ''}
                  {' · '}
                  Cashier: <strong>{currentSession?.cashier}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Big CTA button */}
          <button
            id="btn-open-session"
            onClick={handleOpenSession}
            disabled={opening}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: opening ? 'wait' : 'pointer',
              fontFamily: "'Sora', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: '#fff',
              background: isOpen
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)',
              boxShadow: isOpen
                ? '0 6px 24px rgba(16,185,129,0.4)'
                : '0 6px 24px rgba(107,33,168,0.45)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!opening) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = isOpen
                  ? '0 10px 32px rgba(16,185,129,0.55)'
                  : '0 10px 32px rgba(107,33,168,0.6)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = isOpen
                ? '0 6px 24px rgba(16,185,129,0.4)'
                : '0 6px 24px rgba(107,33,168,0.45)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
          >
            {opening ? (
              <>
                <svg
                  className="animate-spin-smooth"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Opening session…</span>
              </>
            ) : isOpen ? (
              <>
                <span style={{ fontSize: '1.1rem' }}>▶</span>
                <span>Resume Session</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.1rem' }}>🚀</span>
                <span>Open Session</span>
              </>
            )}
          </button>

          {/* View history link */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              id="btn-view-history"
              onClick={() => setShowHistory((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#6B21A8',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '3px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {showHistory ? '▲ Hide Session History' : '▼ View Session History'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Session History ─────────────────────────────────────────────── */}
      {showHistory && (
        <div className="animate-fade-in" style={{ ...card, marginBottom: '1.5rem' }}>
          <div
            style={{
              padding: '1.25rem 2rem',
              borderBottom: '1px solid rgba(226,232,240,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2 style={{ ...sectionTitle, margin: 0 }}>
              📋 Session History
            </h2>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8125rem',
                color: '#94A3B8',
              }}
            >
              {sessionHistory.length} session{sessionHistory.length !== 1 ? 's' : ''}
            </span>
          </div>
          <SessionHistoryTable sessions={sessionHistory} />
        </div>
      )}

      {/* ── Quick Stats Row ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          {
            icon: '📅',
            label: 'Total Sessions',
            value: sessionHistory.length + (isOpen ? 1 : 0),
            color: '#6B21A8',
            bg: 'rgba(107,33,168,0.07)',
          },
          {
            icon: '💰',
            label: 'All-time Sales',
            value: fmtINR(sessionHistory.reduce((a, s) => a + (s.totalSales ?? 0), 0)),
            color: '#16A34A',
            bg: 'rgba(22,163,74,0.07)',
          },
          {
            icon: '🧾',
            label: 'Total Orders',
            value: orders.filter((o) => o.status === 'paid').length,
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.07)',
          },
          {
            icon: '🕒',
            label: 'Last Session',
            value: lastClosed ? fmt(lastClosed.closedAt).split(',')[0] : '—',
            color: '#64748B',
            bg: 'rgba(100,116,139,0.07)',
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              ...card,
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'default',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '0.75rem',
                background: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: s.color,
                  margin: '0 0 0.15rem',
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.8rem',
                  color: '#94A3B8',
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Help Tips ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(107,33,168,0.04)',
          border: '1px solid rgba(107,33,168,0.15)',
          borderRadius: '0.875rem',
          padding: '1.25rem 1.5rem',
        }}
      >
        <p
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#6B21A8',
            marginBottom: '0.625rem',
          }}
        >
          💡 How sessions work
        </p>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          {[
            'Open a session to start accepting orders at the table or counter.',
            'All orders placed during a session are linked to it for reporting.',
            'Closing a session tallies the total sales and saves it to history.',
            'Only one session can be active at a time per terminal.',
          ].map((tip) => (
            <li
              key={tip}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.84rem',
                color: '#64748B',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: '#A78BFA', marginTop: '0.05rem' }}>›</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
