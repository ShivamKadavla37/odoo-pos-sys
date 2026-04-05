import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'

/* ─── Placeholder tab panels (B2 / B3 will replace these) ──────────── */
import TableFloorView  from './TableFloorView'
import RegisterView    from './RegisterView'
import PaymentView     from './PaymentView'

/* ══════════════════════════════════════════════════════════════════════
   CLOSE REGISTER MODAL
══════════════════════════════════════════════════════════════════════ */
function CloseRegisterModal({ session, orders, onClose, onConfirm }) {
  const [closingCash, setClosingCash]   = useState('')
  const [confirming, setConfirming]     = useState(false)

  const sessionOrders = orders.filter(
    (o) => o.status === 'paid'
  )
  const totalSales = sessionOrders.reduce((s, o) => s + (o.total ?? 0), 0)

  const handleConfirm = () => {
    if (closingCash === '') {
      showToast('Please enter the closing cash amount.', 'warning')
      return
    }
    setConfirming(true)
    setTimeout(() => {
      onConfirm(Number(closingCash))
    }, 700)
  }

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }) : '—'

  /* ── Modal overlay ── */
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out both',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#fff', borderRadius: '1.25rem',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
          width: '100%', maxWidth: '480px',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out both',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7C3AED, #6B21A8)',
          padding: '1.5rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontSize: '1.125rem',
              fontWeight: 800, color: '#fff', margin: '0 0 0.2rem',
            }}>
              🔒 Close Register
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.7)', margin: 0,
            }}>
              This will end the current session
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '0.5rem', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', fontSize: '1.1rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            ✕
          </button>
        </div>

        {/* Session summary */}
        <div style={{ padding: '1.5rem 1.75rem 0' }}>
          <p style={{
            fontFamily: "'Sora', sans-serif", fontSize: '0.8rem',
            fontWeight: 700, color: '#64748B', textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: '0.875rem',
          }}>
            Session Summary
          </p>

          {[
            { label: 'Session ID',    value: `#${(session?.id ?? '').slice(-8).toUpperCase()}` },
            { label: 'Cashier',       value: session?.cashier ?? '—' },
            { label: 'Opened At',     value: fmt(session?.openedAt) },
            { label: 'Total Orders',  value: `${sessionOrders.length} orders` },
            { label: 'Total Sales',   value: `₹${totalSales.toLocaleString('en-IN')}`, accent: true },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.6rem 0', borderBottom: '1px solid #F1F5F9',
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
                color: '#64748B', fontWeight: 500,
              }}>{row.label}</span>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontSize: '0.9rem',
                fontWeight: 700,
                color: row.accent ? '#16A34A' : '#1E293B',
              }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Closing cash input */}
        <div style={{ padding: '1.25rem 1.75rem' }}>
          <label style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
            fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem',
          }}>
            Closing Cash Amount (₹)
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '0.875rem', top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: "'Sora', sans-serif", fontWeight: 700,
              color: '#6B21A8', fontSize: '1rem', pointerEvents: 'none',
            }}>₹</span>
            <input
              id="closing-cash-input"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={closingCash}
              onChange={e => setClosingCash(e.target.value)}
              style={{
                width: '100%', padding: '0.8rem 1rem 0.8rem 2rem',
                border: '2px solid #E2E8F0', borderRadius: '0.625rem',
                fontFamily: "'Sora', sans-serif", fontSize: '1.1rem',
                fontWeight: 700, color: '#1E293B',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#6B21A8'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            />
          </div>
          {closingCash !== '' && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
              color: '#64748B', marginTop: '0.4rem',
            }}>
              Expected:&nbsp;
              <strong style={{ color: '#1E293B' }}>
                ₹{totalSales.toLocaleString('en-IN')}
              </strong>
              &nbsp;·&nbsp;
              Difference:&nbsp;
              <strong style={{
                color: Number(closingCash) >= totalSales ? '#16A34A' : '#EF4444',
              }}>
                {Number(closingCash) >= totalSales ? '+' : ''}
                ₹{(Number(closingCash) - totalSales).toLocaleString('en-IN')}
              </strong>
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{
          padding: '0 1.75rem 1.75rem',
          display: 'flex', gap: '0.75rem',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.8rem',
              border: '2px solid #E2E8F0', borderRadius: '0.625rem',
              background: '#fff', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif", fontSize: '0.9rem',
              fontWeight: 600, color: '#64748B',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1E293B' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
          >
            Cancel
          </button>
          <button
            id="btn-confirm-close"
            onClick={handleConfirm}
            disabled={confirming}
            style={{
              flex: 2, padding: '0.8rem',
              background: confirming
                ? 'rgba(107,33,168,0.5)'
                : 'linear-gradient(135deg, #6B21A8, #7C3AED)',
              border: 'none', borderRadius: '0.625rem',
              cursor: confirming ? 'wait' : 'pointer',
              fontFamily: "'Sora', sans-serif", fontSize: '0.9rem',
              fontWeight: 700, color: '#fff',
              boxShadow: '0 4px 16px rgba(107,33,168,0.4)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { if (!confirming) e.currentTarget.style.boxShadow = '0 6px 24px rgba(107,33,168,0.55)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,33,168,0.4)' }}
          >
            {confirming ? (
              <>
                <svg className="animate-spin-smooth" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Closing…
              </>
            ) : (
              '🔒 Confirm Close'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── NavBtn: hoisted to module scope to avoid 'component defined during render' ── */
function NavBtn({ id, icon, label, onClick, variant = 'ghost' }) {
  const isDanger  = variant === 'danger'
  const isSuccess = variant === 'success'

  const base = {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.875rem',
    borderRadius: '0.5rem', border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.8375rem', fontWeight: 600,
    transition: 'all 0.18s ease',
    whiteSpace: 'nowrap',
  }

  const styles = isDanger
    ? { ...base, background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' }
    : isSuccess
    ? { ...base, background: 'rgba(16,185,129,0.15)', color: '#6EE7B7' }
    : { ...base, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }

  return (
    <button
      id={id}
      onClick={onClick}
      style={styles}
      onMouseEnter={e => {
        e.currentTarget.style.background = isDanger
          ? 'rgba(239,68,68,0.28)' : isSuccess
          ? 'rgba(16,185,129,0.28)'
          : 'rgba(255,255,255,0.16)'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isDanger
          ? 'rgba(239,68,68,0.15)' : isSuccess
          ? 'rgba(16,185,129,0.15)'
          : 'rgba(255,255,255,0.08)'
        e.currentTarget.style.color = isDanger
          ? '#FCA5A5' : isSuccess
          ? '#6EE7B7'
          : 'rgba(255,255,255,0.75)'
      }}
    >
      <span style={{ fontSize: '0.95rem' }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   TOP NAV BAR
══════════════════════════════════════════════════════════════════════ */
function TopNavBar({ activeTab, onTabChange, onGoBackend, onGoKitchen, onGoCustomer, onCloseRegister, session }) {

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
      height: 56,
      background: 'linear-gradient(90deg, #3B0764 0%, #4C1D95 40%, #5B21B6 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 2px 24px rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center',
      padding: '0 1.25rem',
      gap: '1rem',
    }}>

      {/* ── Left: Logo ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '0.5rem',
          background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
        }}>
          ☕
        </div>
        <div>
          <p style={{
            fontFamily: "'Sora', sans-serif", fontSize: '0.9rem',
            fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1,
          }}>
            POS Cafe
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1,
          }}>
            {session?.cashier ?? 'Cashier'}&nbsp;·&nbsp;
            {session?.status === 'open' ? '🟢 Session Open' : '⚫ No Session'}
          </p>
        </div>
      </div>

      {/* ── Center: Tabs ── */}
      <div style={{
        flex: 1, display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '0.625rem',
          padding: '0.25rem',
          gap: '0.25rem',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {[
            { id: 'table',    icon: '🗺️', label: 'Table View'  },
            { id: 'register', icon: '🧾', label: 'Register'    },
          ].map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 1.25rem',
                borderRadius: '0.45rem', border: 'none',
                cursor: 'pointer',
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.845rem', fontWeight: 700,
                transition: 'all 0.18s ease',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #7C3AED, #6B21A8)'
                  : 'transparent',
                color: activeTab === tab.id
                  ? '#fff'
                  : 'rgba(255,255,255,0.55)',
                boxShadow: activeTab === tab.id
                  ? '0 2px 12px rgba(107,33,168,0.5)'
                  : 'none',
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                }
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        flexShrink: 0,
      }}>
        <NavBtn
          id="btn-go-kitchen"
          icon="🍳"
          label="Kitchen"
          onClick={onGoKitchen}
        />
        <NavBtn
          id="btn-go-customer"
          icon="📺"
          label="Customer UI"
          onClick={onGoCustomer}
        />
        <NavBtn
          id="btn-reload-data"
          icon="🔄"
          label="Reload"
          onClick={() => {
            window.location.reload()
          }}
        />
        <NavBtn
          id="btn-go-backend"
          icon="⚙️"
          label="Backend"
          variant="success"
          onClick={onGoBackend}
        />
        {/* Divider */}
        <div style={{
          width: 1, height: 24,
          background: 'rgba(255,255,255,0.12)',
          margin: '0 0.25rem',
        }} />
        <NavBtn
          id="btn-close-register"
          icon="🔒"
          label="Close Register"
          variant="danger"
          onClick={onCloseRegister}
        />
      </div>
    </header>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function POSFrontend({ defaultTab }) {
  const navigate = useNavigate()
  const { currentSession, orders, closeSession } = usePOS()
  const [activeTab,      setActiveTab]      = useState(defaultTab || 'table')
  const [showCloseModal, setShowCloseModal] = useState(false)

  /* ── currently selected table & order for Register view ── */
  const [selectedTableId, setSelectedTableId] = useState(null)

  const handleGoBackend = useCallback(() => {
    showToast('Returning to backend dashboard.', 'info')
    navigate('/backend')
  }, [navigate])

  const handleConfirmClose = useCallback((closingCash) => {
    closeSession()
    showToast(
      `Session closed. Closing cash: ₹${Number(closingCash).toLocaleString('en-IN')} 🎉`,
      'success'
    )
    setShowCloseModal(false)
    navigate('/backend/terminal')
  }, [closeSession, navigate])

  /* ── tab change: switching to register resets if no table picked ── */
  const handleTableSelect = useCallback((tableId) => {
    setSelectedTableId(tableId)
    setActiveTab('register')
  }, [])

  return (
    <>
      {/* Full-screen wrapper */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column',
        background: '#F1F5F9',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Top Nav */}
        <TopNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onGoBackend={handleGoBackend}
          onGoKitchen={() => navigate('/kitchen')}
          onGoCustomer={() => navigate('/customer')}
          onCloseRegister={() => setShowCloseModal(true)}
          session={currentSession}
        />

        {/* Content — starts below 56px top bar */}
        <div style={{
          flex: 1,
          marginTop: 56,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {activeTab === 'table' ? (
            <TableFloorView
              key="table-view"
              onSelectTable={handleTableSelect}
            />
          ) : activeTab === 'register' ? (
            <RegisterView
              key={`register-${selectedTableId}`}
              selectedTableId={selectedTableId}
              onClearTable={() => {
                setSelectedTableId(null)
                setActiveTab('table')
              }}
              onNavigatePay={() => {
                setActiveTab('payment')
              }}
            />
          ) : (
            <PaymentView
              key={`payment-${selectedTableId}`}
              selectedTableId={selectedTableId}
              onCancel={() => setActiveTab('register')}
              onSuccess={() => {
                setSelectedTableId(null)
                setActiveTab('table')
              }}
            />
          )}
        </div>
      </div>

      {/* Close Register Modal */}
      {showCloseModal && (
        <CloseRegisterModal
          session={currentSession}
          orders={orders}
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleConfirmClose}
        />
      )}
    </>
  )
}
