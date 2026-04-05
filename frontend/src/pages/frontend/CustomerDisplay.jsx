import { useMemo, useState, useEffect } from 'react'
import { usePOS } from '../../context/POSContext'
import { useNavigate } from 'react-router-dom'

const parseTax = (t) => parseFloat(String(t ?? '0').replace('%', '')) || 0

export default function CustomerDisplay() {
  const { products } = usePOS()
  const navigate = useNavigate()

  // Track the cart actively being edited by the cashier
  const [activeCart, setActiveCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_active_cart')) }
    catch { return null }
  })

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'pos_active_cart') {
        try { setActiveCart(e.newValue ? JSON.parse(e.newValue) : null) }
        catch { setActiveCart(null) }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const activeOrder = activeCart?.order ?? null
  const tableNumber = activeCart?.tableNumber ?? null

  // Is it empty or fully paid and old? 
  // Let's just show the last order. If it's paid, it will say "Paid - Thank You".
  // If there are no items, it's just created.

  // Calculate totals manually or use order.total.
  // The prompt asks to show Subtotal + Tax + Total.
  const { subtotal, taxTotal, grandTotal } = useMemo(() => {
    let sub = 0, tax = 0
    ;(activeOrder?.items ?? []).forEach(item => {
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
  }, [activeOrder, products])

  // If no order or order has no items, show idle screen.
  const isIdle = !activeOrder || activeOrder.items.length === 0

  if (isIdle) {
    return (
      <div className="animate-fade-in" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', width: '100vw', background: '#F8FAFC',
        position: 'fixed', inset: 0, zIndex: 9999,
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: '1.5rem',
          background: 'linear-gradient(135deg, #6B21A8, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', boxShadow: '0 8px 32px rgba(107,33,168,0.3)',
          marginBottom: '2rem',
        }}>
          ☕
        </div>
        <h1 style={{
          fontFamily: "'Sora', sans-serif", fontSize: '3.5rem', fontWeight: 800,
          color: '#1E293B', margin: '0 0 1rem', textAlign: 'center',
        }}>
          Welcome to POS Cafe
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '1.5rem', color: '#64748B',
          margin: 0, fontWeight: 500,
        }}>
          Please place your order at the counter.
        </p>

        {/* Exit Button for idle state */}
        <button
          onClick={() => navigate('/backend')}
          style={{
            marginTop: '3rem', padding: '0.75rem 1.5rem', background: '#fff', border: '2px solid #E2E8F0',
            borderRadius: '2rem', fontFamily: "'Sora', sans-serif", fontSize: '1rem',
            fontWeight: 700, color: '#64748B', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1E293B' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
        >
          Exit Display
        </button>
      </div>
    )
  }

  const isPaid = activeOrder?.status === 'paid'

  return (
    <div className="animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
      background: '#F8FAFC', position: 'fixed', inset: 0, zIndex: 9999,
    }}>
      {/* Header */}
      <header style={{
        padding: '2rem 3rem', background: '#fff', borderBottom: '1px solid #E2E8F0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '1rem',
            background: 'linear-gradient(135deg, #6B21A8, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', boxShadow: '0 4px 16px rgba(107,33,168,0.3)',
          }}>
            ☕
          </div>
          <h1 style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1.75rem', fontWeight: 800,
            color: '#1E293B', margin: 0,
          }}>
            Welcome to POS Cafe
          </h1>
        </div>
        
        {/* Status Badge & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            padding: '0.75rem 1.5rem', borderRadius: '2rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${isPaid ? '#10B981' : '#F59E0B'}`,
          }}>
            <span style={{ fontSize: '1.25rem' }}>{isPaid ? '✅' : '⏳'}</span>
            <span style={{
              fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700,
              color: isPaid ? '#059669' : '#D97706',
            }}>
              {isPaid ? 'Paid — Thank You!' : 'Pending Payment'}
            </span>
          </div>
          
          <button
            onClick={() => navigate('/backend')}
            style={{
              padding: '0.75rem 1.25rem', background: '#F8FAFC',
              border: '2px solid #E2E8F0', borderRadius: '2rem',
              fontFamily: "'Sora', sans-serif", fontSize: '0.95rem', fontWeight: 700,
              color: '#64748B', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1E293B'; e.currentTarget.style.background = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = '#F8FAFC' }}
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1, display: 'flex', padding: '3rem', gap: '3rem',
        maxWidth: '1400px', margin: '0 auto', width: '100%',
      }}>
        {/* Left: Item List */}
        <div style={{
          flex: 2, background: '#fff', borderRadius: '1.5rem',
          border: '1px solid #E2E8F0', boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{
            padding: '1.5rem 2rem', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center',
          }}>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 800,
              color: '#334155', margin: 0, flex: 1,
            }}>Your Order</h2>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 600,
              color: '#64748B', background: '#E2E8F0', padding: '0.25rem 0.75rem', borderRadius: '1rem',
            }}>
              {tableNumber ? `Table ${tableNumber}` : 'Takeaway'}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }} className="main-scroll animate-fade-in">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem 0', fontFamily: "'DM Sans', sans-serif", color: '#94A3B8', fontWeight: 600, borderBottom: '2px solid #F1F5F9' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '1rem 0', fontFamily: "'DM Sans', sans-serif", color: '#94A3B8', fontWeight: 600, borderBottom: '2px solid #F1F5F9' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '1rem 0', fontFamily: "'DM Sans', sans-serif", color: '#94A3B8', fontWeight: 600, borderBottom: '2px solid #F1F5F9' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {activeOrder.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '1.25rem 0' }}>
                      <p style={{
                        fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700,
                        color: '#1E293B', margin: 0,
                      }}>{item.name}</p>
                      {item.variantName && (
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                          {item.variantName}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 0', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800,
                        color: '#6B21A8', background: 'rgba(107,33,168,0.08)', padding: '0.25rem 0.75rem', borderRadius: '0.5rem',
                      }}>
                        {item.qty}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 0', textAlign: 'right' }}>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Totals */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{
            background: '#fff', borderRadius: '1.5rem', padding: '2rem',
            border: '1px solid #E2E8F0', boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 800,
              color: '#1E293B', margin: '0 0 2rem',
            }}>Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.25rem', color: '#64748B', fontWeight: 500 }}>Subtotal</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', color: '#334155', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.25rem', color: '#64748B', fontWeight: 500 }}>Tax</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', color: '#334155', fontWeight: 600 }}>₹{taxTotal.toFixed(2)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem',
              borderTop: '2px dashed #E2E8F0', alignItems: 'flex-end',
            }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.5rem', color: '#1E293B', fontWeight: 700 }}>Total</span>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontSize: '3.5rem', color: '#6B21A8', fontWeight: 800, lineHeight: 1,
              }}>
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Marketing / Advertisement area (Optional) */}
          <div style={{
            flex: 1, background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', color: '#fff', textAlign: 'center',
            boxShadow: '0 12px 40px rgba(245,158,11,0.3)',
          }}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</span>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Join our Rewards!
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 500, margin: 0, opacity: 0.9 }}>
              Ask the cashier about our Cafe Loyalty Program.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
