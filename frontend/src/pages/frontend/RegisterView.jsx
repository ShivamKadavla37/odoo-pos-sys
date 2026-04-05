import React, { useState, useMemo, useCallback } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'

/* ─── category color map ────────────────────────────────────────────── */
const CAT_COLORS = {
  Food:     { bg: 'rgba(239,68,68,0.1)',   text: '#DC2626',  border: 'rgba(239,68,68,0.25)'   },
  Beverage: { bg: 'rgba(59,130,246,0.1)',  text: '#2563EB',  border: 'rgba(59,130,246,0.25)'  },
  Dessert:  { bg: 'rgba(168,85,247,0.1)',  text: '#7C3AED',  border: 'rgba(168,85,247,0.25)'  },
  Other:    { bg: 'rgba(100,116,139,0.1)', text: '#475569',  border: 'rgba(100,116,139,0.25)' },
}
const catStyle = (cat) => CAT_COLORS[cat] ?? CAT_COLORS.Other

/* ─── tax % as number ───────────────────────────────────────────────── */
const parseTax = (t) => parseFloat(String(t ?? '0').replace('%', '')) || 0

/* ══════════════════════════════════════════════════════════════════════
   VARIANT PICKER MODAL
══════════════════════════════════════════════════════════════════════ */
function VariantModal({ product, onSelect, onClose }) {
  const [chosen, setChosen] = useState(null)

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.18s ease-out both',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '1.25rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        width: '100%', maxWidth: 400, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6B21A8, #7C3AED)',
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Sora', sans-serif", fontSize: '1rem',
              fontWeight: 800, color: '#fff', margin: 0,
            }}>
              Choose Variant
            </h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.7)', margin: 0,
            }}>
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '0.5rem', width: 30, height: 30,
              cursor: 'pointer', color: '#fff', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >✕</button>
        </div>

        {/* Variants */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {product.variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setChosen(v)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${chosen === v ? '#6B21A8' : '#E2E8F0'}`,
                  borderRadius: '0.75rem', background: chosen === v ? 'rgba(107,33,168,0.06)' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (chosen !== v) e.currentTarget.style.borderColor = '#C4B5FD' }}
                onMouseLeave={e => { if (chosen !== v) e.currentTarget.style.borderColor = '#E2E8F0' }}
              >
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
                  fontWeight: 600, color: '#1E293B',
                }}>{v.name}</span>
                <span style={{
                  fontFamily: "'Sora', sans-serif", fontSize: '0.9rem',
                  fontWeight: 700, color: '#6B21A8',
                }}>
                  ₹{(v.price ?? product.price).toLocaleString('en-IN')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Add button */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <button
            onClick={() => chosen && onSelect(chosen)}
            disabled={!chosen}
            style={{
              width: '100%', padding: '0.85rem',
              background: chosen ? 'linear-gradient(135deg, #6B21A8, #7C3AED)' : '#E2E8F0',
              border: 'none', borderRadius: '0.75rem',
              color: chosen ? '#fff' : '#94A3B8',
              fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 700,
              cursor: chosen ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: chosen ? '0 4px 16px rgba(107,33,168,0.35)' : 'none',
            }}
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   CANCEL ORDER MODAL
══════════════════════════════════════════════════════════════════════ */
function CancelOrderModal({ tableNumber, onConfirm, onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', animation: 'fadeIn 0.18s ease-out both',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '1.25rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        width: '100%', maxWidth: 380, padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗑️</div>
        <h3 style={{
          fontFamily: "'Sora', sans-serif", fontSize: '1.1rem',
          fontWeight: 800, color: '#1E293B', margin: '0 0 0.5rem',
        }}>
          Cancel Order?
        </h3>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
          color: '#64748B', margin: '0 0 1.5rem',
        }}>
          This will cancel the order for{' '}
          <strong style={{ color: '#1E293B' }}>
            {tableNumber ? `Table ${tableNumber}` : 'Takeaway'}
          </strong>{' '}
          and free up the table. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.75rem',
              border: '2px solid #E2E8F0', borderRadius: '0.625rem',
              background: '#fff', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif", fontSize: '0.875rem',
              fontWeight: 600, color: '#64748B', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1E293B' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.75rem',
              background: 'linear-gradient(135deg, #DC2626, #EF4444)',
              border: 'none', borderRadius: '0.625rem',
              color: '#fff', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif", fontSize: '0.875rem',
              fontWeight: 700, transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.55)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.4)'}
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LEFT PANEL — Product Catalog
══════════════════════════════════════════════════════════════════════ */
function ProductCatalog({ products, onAddProduct }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
    return ['All', ...cats]
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (!p.active) return false
      const matchCat = activeCategory === 'All' || p.category === activeCategory
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, activeCategory, search])

  const ProductCard = ({ product }) => {
    const [hovered, setHovered] = useState(false)
    const cs = catStyle(product.category)

    return (
      <button
        id={`product-${product.id}`}
        onClick={() => onAddProduct(product)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'rgba(107,33,168,0.04)' : '#fff',
          border: `1.5px solid ${hovered ? 'rgba(107,33,168,0.4)' : '#E2E8F0'}`,
          borderRadius: '0.875rem',
          padding: '1rem',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.18s ease',
          transform: hovered ? 'translateY(-2px)' : 'none',
          boxShadow: hovered
            ? '0 8px 24px rgba(107,33,168,0.12)'
            : '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
        }}
      >
        {/* Category tag */}
        <span style={{
          display: 'inline-block',
          padding: '0.15rem 0.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.68rem', fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          background: cs.bg, color: cs.text, border: `1px solid ${cs.border}`,
          alignSelf: 'flex-start',
        }}>
          {product.category ?? 'Other'}
        </span>

        {/* Name */}
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.9rem', fontWeight: 700,
          color: '#1E293B', margin: 0,
          lineHeight: 1.25,
        }}>
          {product.name}
        </p>

        {/* Price row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto',
        }}>
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '1rem', fontWeight: 800,
            color: '#6B21A8',
          }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.variants?.length > 0 && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              color: '#F59E0B', background: 'rgba(245,158,11,0.1)',
              padding: '0.1rem 0.4rem', borderRadius: '0.375rem',
              border: '1px solid rgba(245,158,11,0.3)',
            }}>
              {product.variants.length} variants
            </span>
          )}
        </div>
      </button>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#F8FAFC', borderRight: '1px solid #E2E8F0',
      overflow: 'hidden',
    }}>
      {/* Search + Category bar */}
      <div style={{
        padding: '0.875rem 1rem 0',
        background: '#fff',
        borderBottom: '1px solid #F1F5F9',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <span style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', fontSize: '0.9rem',
            pointerEvents: 'none', color: '#94A3B8',
          }}>🔍</span>
          <input
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.1rem',
              border: '1.5px solid #E2E8F0', borderRadius: '0.625rem',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
              color: '#1E293B', outline: 'none', transition: 'border-color 0.2s',
              background: '#F8FAFC',
            }}
            onFocus={e => e.target.style.borderColor = '#6B21A8'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: '0.25rem',
          overflowX: 'auto', paddingBottom: '0.75rem',
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              id={`cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.35rem 0.875rem',
                border: 'none', borderRadius: '2rem',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                background: activeCategory === cat
                  ? 'linear-gradient(135deg, #6B21A8, #7C3AED)'
                  : '#F1F5F9',
                color: activeCategory === cat ? '#fff' : '#64748B',
                boxShadow: activeCategory === cat
                  ? '0 2px 8px rgba(107,33,168,0.3)'
                  : 'none',
              }}
            >
              {cat === 'All' ? '✨ All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '1rem',
      }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '3rem' }}>📦</span>
            <p style={{
              fontFamily: "'Sora', sans-serif", fontSize: '0.975rem',
              fontWeight: 700, color: '#1E293B', margin: 0,
            }}>
              No products found
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8375rem',
              color: '#94A3B8', margin: 0,
            }}>
              Try a different category or search term.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
            gap: '0.75rem',
          }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   RIGHT PANEL — Cart / Order Summary
══════════════════════════════════════════════════════════════════════ */
function OrderCart({
  table, order, onQtyChange, onRemoveLine,
  onSendKitchen, onPay, onCancelOrder,
  note, onNoteChange,
  products,
}) {
  const tableLabel = table ? `Table ${table.number}` : 'Takeaway'

  /* ── financial totals ── */
  const { subtotal, taxTotal, grandTotal } = useMemo(() => {
    let sub = 0, tax = 0
    ;(order?.items ?? []).forEach(item => {
      const lineTotal = item.price * item.qty
      sub += lineTotal
      const product = products.find(p => p.id === item.productId)
      const rate = parseTax(product?.tax ?? item.tax ?? '0')
      tax += lineTotal * rate / 100
    })
    return {
      subtotal: sub,
      taxTotal: tax,
      grandTotal: sub + tax,
    }
  }, [order?.items, products])

  const isEmpty = !order?.items?.length

  /* ── qty control button ── */
  const QtyBtn = ({ icon, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 26, height: 26,
        borderRadius: '0.375rem',
        border: '1.5px solid #E2E8F0',
        background: disabled ? '#F8FAFC' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.875rem', fontWeight: 700,
        color: disabled ? '#CBD5E1' : '#6B21A8',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'rgba(107,33,168,0.08)'; e.currentTarget.style.borderColor = '#6B21A8' } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0' } }}
    >
      {icon}
    </button>
  )

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: '#fff',
      overflow: 'hidden',
    }}>

      {/* ── Cart Header ── */}
      <div style={{
        padding: '1rem 1.25rem',
        background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '0.625rem',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>
            {table ? '🪑' : '🛍️'}
          </div>
          <div>
            <p style={{
              fontFamily: "'Sora', sans-serif", fontSize: '1rem',
              fontWeight: 800, color: '#fff', margin: 0,
            }}>
              {tableLabel}
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.65)', margin: 0,
            }}>
              {isEmpty
                ? 'No items yet'
                : `${order.items.reduce((s, i) => s + i.qty, 0)} item${order.items.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        {order?.id && (
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem',
            fontWeight: 700, color: 'rgba(255,255,255,0.6)',
            background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem',
            borderRadius: '0.375rem',
          }}>
            #{order.id.slice(-6).toUpperCase()}
          </span>
        )}
      </div>

      {/* ── Order Lines ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem' }}>
        {isEmpty ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: '0.75rem', opacity: 0.6,
          }}>
            <span style={{ fontSize: '3rem' }}>🛒</span>
            <p style={{
              fontFamily: "'Sora', sans-serif", fontSize: '0.95rem',
              fontWeight: 700, color: '#475569', margin: 0,
            }}>
              Cart is empty
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
              color: '#94A3B8', margin: 0, textAlign: 'center',
            }}>
              Click a product from the catalog to add it here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {order.items.map((item, idx) => {
              const lineTotal = item.price * item.qty
              return (
                <div
                  key={`${item.productId}-${item.variantName ?? ''}-${idx}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.625rem 0.75rem',
                    background: '#F8FAFC', borderRadius: '0.625rem',
                    border: '1px solid #F1F5F9',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(107,33,168,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                >
                  {/* Remove btn */}
                  <button
                    onClick={() => onRemoveLine(idx)}
                    style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: 'none', background: 'rgba(239,68,68,0.12)',
                      color: '#EF4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                  >
                    ×
                  </button>

                  {/* Name + variant */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem',
                      fontWeight: 700, color: '#1E293B', margin: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {item.name}
                    </p>
                    {item.variantName && (
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem',
                        color: '#94A3B8', margin: 0,
                      }}>
                        {item.variantName}
                      </p>
                    )}
                  </div>

                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <QtyBtn icon="−" onClick={() => onQtyChange(idx, item.qty - 1)} disabled={item.qty <= 1} />
                    <span style={{
                      fontFamily: "'Sora', sans-serif", fontSize: '0.875rem',
                      fontWeight: 800, color: '#1E293B', minWidth: 20, textAlign: 'center',
                    }}>
                      {item.qty}
                    </span>
                    <QtyBtn icon="+" onClick={() => onQtyChange(idx, item.qty + 1)} />
                  </div>

                  {/* Line total */}
                  <span style={{
                    fontFamily: "'Sora', sans-serif", fontSize: '0.85rem',
                    fontWeight: 800, color: '#6B21A8', flexShrink: 0, minWidth: 52, textAlign: 'right',
                  }}>
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Note area ── */}
      {!isEmpty && (
        <div style={{
          padding: '0.5rem 1.25rem 0',
          borderTop: '1px solid #F1F5F9',
          flexShrink: 0,
        }}>
          <textarea
            placeholder="📝 Add order note (optional)…"
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            rows={2}
            style={{
              width: '100%', padding: '0.55rem 0.75rem',
              border: '1.5px solid #E2E8F0', borderRadius: '0.625rem',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
              color: '#374151', resize: 'none', outline: 'none',
              transition: 'border-color 0.2s', background: '#F8FAFC',
            }}
            onFocus={e => e.target.style.borderColor = '#6B21A8'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>
      )}

      {/* ── Totals ── */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid #E2E8F0',
        background: '#FAFAFA',
        flexShrink: 0,
      }}>
        {[
          { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-IN')}`, muted: true },
          { label: 'Tax',      value: `₹${taxTotal.toFixed(2)}`,              muted: true },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: '0.35rem',
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8375rem',
              color: '#94A3B8', fontWeight: 500,
            }}>{row.label}</span>
            <span style={{
              fontFamily: "'Sora', sans-serif", fontSize: '0.8375rem',
              fontWeight: 600, color: '#64748B',
            }}>{row.value}</span>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          paddingTop: '0.5rem', marginTop: '0.25rem',
          borderTop: '1.5px solid #E2E8F0',
        }}>
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1rem',
            fontWeight: 800, color: '#1E293B',
          }}>Total</span>
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1.125rem',
            fontWeight: 800, color: '#6B21A8',
          }}>
            ₹{grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{
        padding: '0.75rem 1.25rem 1rem',
        background: '#fff',
        borderTop: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        flexShrink: 0,
      }}>
        {/* Send to Kitchen */}
        <button
          id="btn-send-kitchen"
          onClick={onSendKitchen}
          disabled={isEmpty}
          style={{
            width: '100%', padding: '0.75rem',
            background: isEmpty
              ? '#F1F5F9'
              : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            border: 'none', borderRadius: '0.625rem',
            color: isEmpty ? '#CBD5E1' : '#78350F',
            fontFamily: "'Sora', sans-serif", fontSize: '0.875rem', fontWeight: 700,
            cursor: isEmpty ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isEmpty ? 'none' : '0 4px 14px rgba(245,158,11,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}
          onMouseEnter={e => { if (!isEmpty) e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.55)' }}
          onMouseLeave={e => { if (!isEmpty) e.currentTarget.style.boxShadow = '0 4px 14px rgba(245,158,11,0.4)' }}
        >
          🍳 Send to Kitchen
        </button>

        {/* Pay */}
        <button
          id="btn-pay"
          onClick={onPay}
          disabled={isEmpty}
          style={{
            width: '100%', padding: '0.75rem',
            background: isEmpty
              ? '#F1F5F9'
              : 'linear-gradient(135deg, #6B21A8, #7C3AED)',
            border: 'none', borderRadius: '0.625rem',
            color: isEmpty ? '#CBD5E1' : '#fff',
            fontFamily: "'Sora', sans-serif", fontSize: '0.875rem', fontWeight: 700,
            cursor: isEmpty ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isEmpty ? 'none' : '0 4px 14px rgba(107,33,168,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}
          onMouseEnter={e => { if (!isEmpty) e.currentTarget.style.boxShadow = '0 6px 20px rgba(107,33,168,0.55)' }}
          onMouseLeave={e => { if (!isEmpty) e.currentTarget.style.boxShadow = '0 4px 14px rgba(107,33,168,0.4)' }}
        >
          💳 Pay  ·  ₹{grandTotal.toFixed(2)}
        </button>

        {/* Cancel */}
        <button
          id="btn-cancel-order"
          onClick={onCancelOrder}
          disabled={isEmpty}
          style={{
            width: '100%', padding: '0.6rem',
            background: 'none',
            border: `1.5px solid ${isEmpty ? '#F1F5F9' : 'rgba(239,68,68,0.4)'}`,
            borderRadius: '0.625rem',
            color: isEmpty ? '#CBD5E1' : '#EF4444',
            fontFamily: "'Sora', sans-serif", fontSize: '0.8375rem', fontWeight: 700,
            cursor: isEmpty ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}
          onMouseEnter={e => { if (!isEmpty) { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = '#EF4444' } }}
          onMouseLeave={e => { if (!isEmpty) { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' } }}
        >
          🗑️ Cancel Order
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN REGISTER VIEW
══════════════════════════════════════════════════════════════════════ */
export default function RegisterView({ selectedTableId, onClearTable, onNavigatePay }) {
  const {
    tables, setTables,
    orders, setOrders,
    products,
    kitchenOrders, setKitchenOrders,
    currentSession,
  } = usePOS()

  /* ── find/prepare the active order for this table ── */
  const table = tables.find(t => t.id === selectedTableId) ?? null

  const activeOrder = useMemo(
    () => orders.find(o => o.tableId === selectedTableId && o.status === 'pending'),
    [orders, selectedTableId]
  )

  /* ── local order state (mirrors context) ── */
  const [localItems, setLocalItems] = useState(() => activeOrder?.items ?? [])
  const [note, setNote]             = useState(() => activeOrder?.note ?? '')
  const [variantProduct, setVariantProduct] = useState(null)   // product with variants pending
  const [showCancel, setShowCancel] = useState(false)

  /* keep local items in sync if active order changes from outside */
  // (handled by key on POSFrontend)

  /* ── helper: upsert order in global state ── */
  const syncOrder = useCallback((items, noteVal) => {
    const taxedTotal = items.reduce((acc, item) => {
      const lineTotal = item.price * item.qty
      const product = products.find(p => p.id === item.productId)
      const rate = parseTax(product?.tax ?? item.tax ?? '0')
      return acc + lineTotal + (lineTotal * rate / 100)
    }, 0)

    if (activeOrder) {
      setOrders(prev => prev.map(o =>
        o.id === activeOrder.id
          ? { ...o, items, note: noteVal, total: taxedTotal }
          : o
      ))
    } else if (items.length > 0) {
      const newOrder = {
        id: crypto.randomUUID(),
        tableId: selectedTableId,
        sessionId: currentSession?.id,
        items,
        note: noteVal,
        status: 'pending',
        paymentMethod: null,
        total: taxedTotal,
        createdAt: new Date().toISOString(),
      }
      setOrders(prev => [...prev, newOrder])
    }
  }, [activeOrder, products, selectedTableId, currentSession, setOrders])

  /* ── ADD PRODUCT ── */
  const handleAddProduct = useCallback((product) => {
    if (product.variants?.length > 0) {
      setVariantProduct(product)   // open variant picker
      return
    }
    addItem(product, null, product.price)
  }, []) // eslint-disable-line

  const addItem = useCallback((product, variant, price) => {
    setLocalItems(prev => {
      const key = `${product.id}::${variant?.name ?? ''}`
      const existing = prev.findIndex(
        i => i.productId === product.id && (i.variantName ?? '') === (variant?.name ?? '')
      )
      let next
      if (existing >= 0) {
        next = prev.map((item, idx) =>
          idx === existing ? { ...item, qty: item.qty + 1 } : item
        )
      } else {
        next = [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            variantName: variant?.name ?? null,
            price,
            tax: product.tax,
            qty: 1,
          },
        ]
      }
      syncOrder(next, note)
      return next
    })
    showToast(`${product.name}${variant ? ` (${variant.name})` : ''} added!`, 'success')
  }, [syncOrder, note])

  const handleVariantSelect = useCallback((variant) => {
    addItem(variantProduct, variant, variant.price ?? variantProduct.price)
    setVariantProduct(null)
  }, [variantProduct, addItem])

  /* ── QTY CHANGE ── */
  const handleQtyChange = useCallback((idx, newQty) => {
    if (newQty < 1) return
    setLocalItems(prev => {
      const next = prev.map((item, i) =>
        i === idx ? { ...item, qty: newQty } : item
      )
      syncOrder(next, note)
      return next
    })
  }, [syncOrder, note])

  /* ── REMOVE LINE ── */
  const handleRemoveLine = useCallback((idx) => {
    setLocalItems(prev => {
      const next = prev.filter((_, i) => i !== idx)
      syncOrder(next, note)
      return next
    })
    showToast('Item removed.', 'info')
  }, [syncOrder, note])

  /* ── NOTE CHANGE ── */
  const handleNoteChange = (val) => {
    setNote(val)
    syncOrder(localItems, val)
  }

  /* ── SEND TO KITCHEN ── */
  const handleSendKitchen = () => {
    if (!localItems.length) return
    syncOrder(localItems, note)

    const orderId = activeOrder?.id ?? null
    if (!orderId) {
      showToast('Save the order first (add items).', 'warning')
      return
    }

    // check if already sent
    const alreadySent = kitchenOrders.find(k => k.orderId === orderId)
    if (alreadySent) {
      // update existing kitchen ticket
      setKitchenOrders(prev => prev.map(k =>
        k.orderId === orderId
          ? { ...k, items: localItems, stage: 'to_cook', updatedAt: new Date().toISOString() }
          : k
      ))
      showToast('Kitchen ticket updated! 🍳', 'success')
    } else {
      // create new kitchen ticket
      const ticket = {
        id: crypto.randomUUID(),
        orderId,
        tableId: selectedTableId,
        tableNumber: table?.number,
        items: localItems,
        note,
        stage: 'to_cook',
        sentAt: new Date().toISOString(),
      }
      setKitchenOrders(prev => [...prev, ticket])
      showToast('Order sent to Kitchen! 🍳', 'success')
    }
  }

  /* ── CANCEL ORDER ── */
  const handleCancelConfirm = () => {
    if (activeOrder) {
      setOrders(prev => prev.map(o =>
        o.id === activeOrder.id ? { ...o, status: 'cancelled' } : o
      ))
    }
    // free up table
    if (selectedTableId) {
      setTables(prev => prev.map(t =>
        t.id === selectedTableId ? { ...t, status: 'free' } : t
      ))
    }
    setLocalItems([])
    setNote('')
    setShowCancel(false)
    showToast('Order cancelled. Table is now free.', 'warning')
    onClearTable?.()
  }

  /* ── PAY ── */
  const handlePay = () => {
    if (!localItems.length) return
    syncOrder(localItems, note)
    // pass order id via state or navigate to payment screen
    // (PaymentScreen will be built next; for now toast + navigate)
    showToast('Opening payment screen…', 'info')
    onNavigatePay?.('payment')
  }

  /* ── mock order object for the cart ── */
  const displayOrder = useMemo(() => (
    activeOrder
      ? { ...activeOrder, items: localItems }
      : { id: null, items: localItems }
  ), [activeOrder, localItems])

  // broadcast the currently active view to the customer display
  React.useEffect(() => {
    if (selectedTableId) {
      localStorage.setItem('pos_active_cart', JSON.stringify({
        tableNumber: table?.number,
        order: displayOrder
      }))
    } else {
      localStorage.removeItem('pos_active_cart')
    }
  }, [displayOrder, table?.number, selectedTableId])

  /* ── no table selected ── */
  if (!selectedTableId) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', flexDirection: 'column', gap: '1rem',
      }}>
        <span style={{ fontSize: '3.5rem' }}>🧾</span>
        <p style={{
          fontFamily: "'Sora', sans-serif", fontSize: '1.125rem',
          fontWeight: 700, color: '#1E293B', margin: 0,
        }}>
          No table selected
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
          color: '#94A3B8', margin: 0,
        }}>
          Go to Table View and tap a table to start an order.
        </p>
      </div>
    )
  }



  return (
    <>
      {/* 2-column layout */}
      <div style={{
        display: 'flex', height: '100%', overflow: 'hidden',
      }}>
        {/* ── LEFT: Product catalog (60%) ── */}
        <div style={{ flex: '0 0 60%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ProductCatalog
            products={products}
            onAddProduct={handleAddProduct}
          />
        </div>

        {/* ── RIGHT: Cart (40%) ── */}
        <div style={{ flex: '0 0 40%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <OrderCart
            table={table}
            order={displayOrder}
            products={products}
            note={note}
            onNoteChange={handleNoteChange}
            onQtyChange={handleQtyChange}
            onRemoveLine={handleRemoveLine}
            onSendKitchen={handleSendKitchen}
            onPay={handlePay}
            onCancelOrder={() => setShowCancel(true)}
          />
        </div>
      </div>

      {/* ── Variant Picker Modal ── */}
      {variantProduct && (
        <VariantModal
          product={variantProduct}
          onSelect={handleVariantSelect}
          onClose={() => setVariantProduct(null)}
        />
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {showCancel && (
        <CancelOrderModal
          tableNumber={table?.number}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancel(false)}
        />
      )}
    </>
  )
}
