import { useState, useEffect } from 'react'
import { usePOS } from '../../context/POSContext'
import { useNavigate } from 'react-router-dom'

/* ── Status definitions ── */
const STAGES = [
  { id: 'to_cook',   label: 'TO COOK',   color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  { id: 'preparing', label: 'PREPARING', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { id: 'completed', label: 'COMPLETED', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
]

export default function KitchenDisplay() {
  const navigate = useNavigate()
  const { kitchenOrders, setKitchenOrders } = usePOS()
  const [now, setNow] = useState(new Date())

  // Update clock every second
  useEffect(() => {
    const int = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(int)
  }, [])

  // Auto-remove completed orders after 5s
  useEffect(() => {
    const completedOrders = kitchenOrders.filter(k => k.stage === 'completed' && k.completedAt)
    const toRemove = completedOrders.filter(k => (now.getTime() - new Date(k.completedAt).getTime()) > 5000)

    if (toRemove.length > 0) {
      setKitchenOrders(prev => prev.filter(p => !toRemove.find(r => r.id === p.id)))
    }
  }, [kitchenOrders, now, setKitchenOrders])

  const handleNextStage = (ticket) => {
    setKitchenOrders(prev => prev.map(k => {
      if (k.id !== ticket.id) return k
      
      let nextStage = k.stage
      let completedAt = k.completedAt
      
      if (k.stage === 'to_cook') nextStage = 'preparing'
      else if (k.stage === 'preparing') {
        nextStage = 'completed'
        completedAt = new Date().toISOString()
      }

      return { ...k, stage: nextStage, completedAt }
    }))
  }

  const handleToggleItem = (ticketId, itemIdx) => {
    setKitchenOrders(prev => prev.map(k => {
      if (k.id !== ticketId) return k
      const nextItems = [...k.items]
      nextItems[itemIdx] = { ...nextItems[itemIdx], struckOut: !nextItems[itemIdx].struckOut }
      return { ...k, items: nextItems }
    }))
  }

  const formatTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const timeDiffStr = (iso) => {
    if (!iso) return ''
    const diff = Math.floor((now.getTime() - new Date(iso).getTime()) / 60000)
    if (diff === 0) return 'Just now'
    return `${diff} min${diff !== 1 ? 's' : ''} ago`
  }

  const TicketCard = ({ ticket, color }) => (
    <div
      className="animate-fade-in"
      style={{
        background: '#1E293B', borderRadius: '0.75rem', border: `1px solid ${color}40`,
        overflow: 'hidden', boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
        opacity: ticket.stage === 'completed' ? 0.8 : 1,
        transition: 'opacity 1s ease',
      }}
    >
      {/* Header — Clickable */}
      <div
        onClick={() => ticket.stage !== 'completed' && handleNextStage(ticket)}
        style={{
          background: `${color}20`, borderBottom: `1px solid ${color}40`,
          padding: '0.75rem 1rem', cursor: ticket.stage === 'completed' ? 'default' : 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { if(ticket.stage !== 'completed') e.currentTarget.style.background = `${color}35` }}
        onMouseLeave={e => { if(ticket.stage !== 'completed') e.currentTarget.style.background = `${color}20` }}
        title={ticket.stage !== 'completed' ? "Click to move to next stage" : ""}
      >
        <div>
          <h3 style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800,
            color: '#F8FAFC', margin: '0 0 0.15rem',
          }}>
            #{ticket.id.slice(-4).toUpperCase()}
          </h3>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem',
            color: '#94A3B8', margin: 0, fontWeight: 500,
          }}>
            {formatTime(ticket.sentAt)} ({timeDiffStr(ticket.sentAt)})
          </p>
        </div>
        <div style={{
          background: color, color: '#fff', padding: '0.25rem 0.625rem',
          borderRadius: '0.5rem', fontFamily: "'Sora', sans-serif", fontSize: '0.85rem', fontWeight: 800,
          boxShadow: `0 2px 8px ${color}80`,
        }}>
          {ticket.tableNumber ? `Table ${ticket.tableNumber}` : 'Takeaway'}
        </div>
      </div>

      {/* Items */}
      <div style={{ padding: '0.75rem 1rem' }}>
        {ticket.items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleToggleItem(ticket.id, idx)}
            style={{
              display: 'flex', gap: '0.75rem', padding: '0.5rem 0',
              borderBottom: idx < ticket.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              cursor: 'pointer', transition: 'opacity 0.2s',
              opacity: item.struckOut ? 0.4 : 1,
            }}
          >
            <span style={{
              fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 800,
              color: color, minWidth: '1.5rem',
              textDecoration: item.struckOut ? 'line-through' : 'none',
            }}>
              {item.qty}x
            </span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', fontWeight: 600,
                color: '#F1F5F9', margin: 0,
                textDecoration: item.struckOut ? 'line-through' : 'none',
              }}>
                {item.name}
              </p>
              {item.variantName && (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#94A3B8', margin: 0,
                  textDecoration: item.struckOut ? 'line-through' : 'none',
                }}>
                  {item.variantName}
                </p>
              )}
            </div>
          </div>
        ))}
        {ticket.note && (
          <div style={{
            marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(245,158,11,0.1)',
            borderLeft: '2px solid #F59E0B', borderRadius: '0 0.25rem 0.25rem 0',
          }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#FCD34D', margin: 0, fontStyle: 'italic' }}>
              " {ticket.note} "
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
      background: '#04040A', color: '#F8FAFC',
      position: 'fixed', top: 0, left: 0, zIndex: 9999,
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem 1.5rem', background: '#0A0A14', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🍳</span>
          <h1 style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 800, margin: 0,
            textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F1F5F9'
          }}>
            Kitchen Display
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 800,
            color: '#F59E0B', textShadow: '0 0 12px rgba(245,158,11,0.4)',
          }}>
            {now.toLocaleTimeString('en-IN')}
          </div>
          <button
            onClick={() => navigate('/backend')}
            style={{
              padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: '#F8FAFC',
              border: 'none', borderRadius: '0.5rem', fontFamily: "'Sora', sans-serif",
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            Exit Kitchen
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden', padding: '1rem', gap: '1rem',
      }}>
        {STAGES.map(stage => {
          const tickets = kitchenOrders.filter(k => k.stage === stage.id).sort((a,b) => new Date(a.sentAt) - new Date(b.sentAt))
          return (
            <div key={stage.id} style={{
              flex: 1, display: 'flex', flexDirection: 'column', background: '#0A0A14',
              borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden',
            }}>
              {/* Column Header */}
              <div style={{
                padding: '1rem', background: stage.bg, borderBottom: `2px solid ${stage.color}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <h2 style={{
                  fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 800,
                  color: stage.color, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  {stage.label}
                </h2>
                <span style={{
                  background: stage.color, color: '#fff', borderRadius: '1rem', padding: '0.1rem 0.6rem',
                  fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', fontWeight: 800,
                }}>
                  {tickets.length}
                </span>
              </div>

              {/* Column Body / Tickets */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem',
              }} className="main-scroll">
                {tickets.length === 0 ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    height: '100%', opacity: 0.3,
                  }}>
                    <span style={{ fontSize: '3rem', filter: 'grayscale(1)' }}>🍽️</span>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#FFF', marginTop: '1rem' }}>
                      No orders {stage.label.toLowerCase()}
                    </p>
                  </div>
                ) : (
                  tickets.map(t => <TicketCard key={t.id} ticket={t} color={stage.color} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
