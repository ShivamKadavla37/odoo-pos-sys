import { useState, useCallback } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'

/* ─── status config ─────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  free: {
    label:      'Free',
    dot:        '#22C55E',
    card:       '#FFFFFF',
    cardHover:  '#F0FDF4',
    border:     'rgba(34,197,94,0.25)',
    borderHover:'rgba(34,197,94,0.6)',
    shadow:     'rgba(34,197,94,0.12)',
    number:     '#1E293B',
    icon:       '🟢',
  },
  occupied: {
    label:      'Occupied',
    dot:        '#EF4444',
    card:       '#FFF5F5',
    cardHover:  '#FEE2E2',
    border:     'rgba(239,68,68,0.25)',
    borderHover:'rgba(239,68,68,0.55)',
    shadow:     'rgba(239,68,68,0.12)',
    number:     '#7F1D1D',
    icon:       '🔴',
  },
  reserved: {
    label:      'Reserved',
    dot:        '#F59E0B',
    card:       '#FFFBEB',
    cardHover:  '#FEF3C7',
    border:     'rgba(245,158,11,0.3)',
    borderHover:'rgba(245,158,11,0.6)',
    shadow:     'rgba(245,158,11,0.12)',
    number:     '#78350F',
    icon:       '🟡',
  },
}

/* ─── single table card ─────────────────────────────────────────────── */
function TableCard({ table, activeOrder, onClick }) {
  const [hovered, setHovered] = useState(false)
  const cfg = STATUS_CONFIG[table.status] ?? STATUS_CONFIG.free

  const itemCount = activeOrder?.items?.reduce((s, i) => s + i.qty, 0) ?? 0

  return (
    <button
      id={`table-card-${table.number}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Table ${table.number} · ${table.seats} seats · ${cfg.label}`}
      style={{
        /* size */
        width: 108, height: 108,
        /* shape */
        borderRadius: '1rem',
        border: `2px solid ${hovered ? cfg.borderHover : cfg.border}`,
        /* colors */
        background: hovered ? cfg.cardHover : cfg.card,
        /* shadow */
        boxShadow: hovered
          ? `0 8px 28px ${cfg.shadow}, 0 2px 8px rgba(0,0,0,0.08)`
          : `0 2px 8px ${cfg.shadow}`,
        /* transform */
        transform: hovered ? 'scale(1.07)' : 'scale(1)',
        /* misc */
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.2rem',
        padding: '0.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Status dot — top-right */}
      <span style={{
        position: 'absolute', top: 8, right: 8,
        width: 9, height: 9,
        borderRadius: '50%',
        background: cfg.dot,
        boxShadow: `0 0 0 2px ${cfg.card}`,
        transition: 'background 0.18s',
      }} />

      {/* Table icon */}
      <span style={{ fontSize: '1.35rem', lineHeight: 1, marginBottom: '0.1rem' }}>
        🪑
      </span>

      {/* Table number */}
      <p style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '1.375rem',
        fontWeight: 800,
        color: cfg.number,
        margin: 0,
        lineHeight: 1,
      }}>
        {table.number}
      </p>

      {/* Seats */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.7rem',
        color: '#94A3B8',
        margin: 0,
        fontWeight: 500,
      }}>
        {table.seats} seats
      </p>

      {/* Active order badge */}
      {table.status === 'occupied' && itemCount > 0 && (
        <span style={{
          position: 'absolute', bottom: 6, left: '50%',
          transform: 'translateX(-50%)',
          background: '#EF4444',
          color: '#fff',
          borderRadius: '2rem',
          padding: '0.1rem 0.45rem',
          fontSize: '0.65rem',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
      )}
    </button>
  )
}

/* ─── legend pill ───────────────────────────────────────────────────── */
function LegendPill({ status }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.3rem 0.75rem',
      background: '#fff',
      border: `1px solid ${cfg.border}`,
      borderRadius: '2rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: cfg.dot, flexShrink: 0,
        boxShadow: `0 0 6px ${cfg.dot}80`,
      }} />
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.775rem', fontWeight: 600,
        color: '#475569',
      }}>
        {cfg.label}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function TableFloorView({ onSelectTable }) {
  const { floors, tables, setTables, orders } = usePOS()

  /* default to first floor */
  const [activeFloorId, setActiveFloorId] = useState(
    () => floors[0]?.id ?? 'root-floor'
  )

  /* tables on current floor, sorted by number */
  const floorTables = tables
    .filter(t => t.floorId === activeFloorId && t.active !== false)
    .sort((a, b) => a.number - b.number)

  /* counts for the stats bar */
  const counts = {
    free:     floorTables.filter(t => t.status === 'free').length,
    occupied: floorTables.filter(t => t.status === 'occupied').length,
    reserved: floorTables.filter(t => t.status === 'reserved').length,
  }

  /* find active order (not paid) for a given table */
  const getActiveOrder = useCallback(
    (tableId) => orders.find(o => o.tableId === tableId && o.status !== 'paid'),
    [orders]
  )

  /* click handler */
  const handleTableClick = useCallback((table) => {
    if (table.status === 'reserved') {
      showToast(`Table ${table.number} is reserved — cannot start order.`, 'warning')
      return
    }

    if (table.status === 'free') {
      /* mark occupied */
      setTables(prev =>
        prev.map(t => t.id === table.id ? { ...t, status: 'occupied' } : t)
      )
      showToast(`Table ${table.number} selected. Opening order screen…`, 'success')
    } else {
      /* already occupied — just open register */
      showToast(`Resuming order for Table ${table.number}.`, 'info')
    }

    onSelectTable(table.id)
  }, [setTables, onSelectTable])

  /* ── header stat counts ── */
  const StatChip = ({ count, label, color, bg }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.3rem 0.75rem',
      background: bg,
      borderRadius: '0.5rem',
    }}>
      <span style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.9rem', fontWeight: 800, color,
      }}>
        {count}
      </span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.75rem', fontWeight: 500, color: '#64748B',
      }}>
        {label}
      </span>
    </div>
  )

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      background: '#F8FAFC',
    }}>

      {/* ── Floor Tabs + Stats bar ──────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        minHeight: 50,
      }}>

        {/* Floor tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
        }}>
          {floors.length === 0 ? (
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem', color: '#94A3B8',
            }}>
              No floors configured.
            </p>
          ) : (
            floors.map(floor => (
              <button
                key={floor.id}
                id={`floor-tab-${floor.id}`}
                onClick={() => setActiveFloorId(floor.id)}
                style={{
                  padding: '0.5rem 1.125rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '0.845rem',
                  fontWeight: 700,
                  transition: 'all 0.18s ease',
                  background: activeFloorId === floor.id
                    ? 'linear-gradient(135deg, #6B21A8, #7C3AED)'
                    : 'transparent',
                  color: activeFloorId === floor.id
                    ? '#fff'
                    : '#64748B',
                  boxShadow: activeFloorId === floor.id
                    ? '0 2px 10px rgba(107,33,168,0.35)'
                    : 'none',
                }}
                onMouseEnter={e => {
                  if (activeFloorId !== floor.id) {
                    e.currentTarget.style.background = 'rgba(107,33,168,0.08)'
                    e.currentTarget.style.color = '#6B21A8'
                  }
                }}
                onMouseLeave={e => {
                  if (activeFloorId !== floor.id) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#64748B'
                  }
                }}
              >
                🏢 {floor.name}
              </button>
            ))
          )}
        </div>

        {/* Stat chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatChip count={counts.free}     label="Free"     color="#16A34A" bg="rgba(22,163,74,0.08)"  />
          <StatChip count={counts.occupied} label="Occupied" color="#DC2626" bg="rgba(220,38,38,0.08)"  />
          <StatChip count={counts.reserved} label="Reserved" color="#D97706" bg="rgba(217,119,6,0.08)"  />
        </div>
      </div>

      {/* ── Table Grid ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.75rem 2rem',
      }}>

        {/* Legend row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          marginBottom: '1.5rem', flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8',
            marginRight: '0.25rem',
          }}>
            Status:
          </span>
          <LegendPill status="free"     />
          <LegendPill status="occupied" />
          <LegendPill status="reserved" />
        </div>

        {/* No tables empty state */}
        {floorTables.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '5rem 2rem', gap: '1rem',
          }}>
            <span style={{ fontSize: '4rem' }}>🪑</span>
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '1.125rem', fontWeight: 700,
              color: '#1E293B', margin: 0,
            }}>
              No tables on this floor
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem', color: '#94A3B8', margin: 0,
            }}>
              Add tables in the backend Floor Plan manager.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            alignContent: 'flex-start',
          }}>
            {floorTables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                activeOrder={getActiveOrder(table.id)}
                onClick={() => handleTableClick(table)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom hints bar ───────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderTop: '1px solid #E2E8F0',
        padding: '0.5rem 2rem',
        display: 'flex', alignItems: 'center', gap: '2rem',
        flexWrap: 'wrap',
      }}>
        {[
          { icon: '👆', text: 'Tap a free table to start a new order' },
          { icon: '📋', text: 'Tap an occupied table to view its order' },
          { icon: '🚫', text: 'Reserved tables cannot be opened' },
        ].map(hint => (
          <div key={hint.text} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <span style={{ fontSize: '0.9rem' }}>{hint.icon}</span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.775rem', color: '#94A3B8', fontWeight: 500,
            }}>
              {hint.text}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}
