import { useState, useMemo } from 'react'
import { usePOS } from '../../context/POSContext'

const parseTax = (t) => parseFloat(String(t ?? '0').replace('%', '')) || 0

export default function MobileOrderingPage({ token }) {
  const { selfOrderTokens, products, setOrders, setKitchenOrders } = usePOS()

  // --- Validate Token ---
  const activeToken = useMemo(() => {
    return selfOrderTokens.find(t => t.token === token && t.status === 'active')
  }, [selfOrderTokens, token])

  // --- State ---
  const [cart, setCart] = useState([])
  const [placedOrderId, setPlacedOrderId] = useState(null)
  
  // To check if order is ready
  const { kitchenOrders } = usePOS()
  const placedKitchenOrder = useMemo(() => {
    if (!placedOrderId) return null
    return kitchenOrders.find(k => k.orderId === placedOrderId)
  }, [kitchenOrders, placedOrderId])



  // --- Cart Handlers ---
  const handleAdd = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { product, qty: 1 }]
    })
  }

  const handleSub = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing && existing.qty > 1) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty - 1 } : i)
      } else {
        return prev.filter(i => i.product.id !== product.id)
      }
    })
  }

  const getQty = (id) => cart.find(i => i.product.id === id)?.qty || 0

  const { grandTotal } = useMemo(() => {
    let sub = 0, tax = 0
    cart.forEach(item => {
      const lineTotal = item.product.price * item.qty
      sub += lineTotal
      const rate = parseTax(item.product.tax)
      tax += lineTotal * rate / 100
    })
    return { grandTotal: sub + tax }
  }, [cart])

  // --- Place Order ---
  const handlePlaceOrder = () => {
    if (cart.length === 0) return

    const orderId = crypto.randomUUID()
    const mappedItems = cart.map(({ product, qty }) => ({
      productId: product.id,
      name: product.name,
      variantName: null,
      price: product.price,
      tax: product.tax,
      qty: qty
    }))

    // Add to Orders
    const newOrder = {
      id: orderId,
      tableId: activeToken.tableId,
      sessionId: null, // Self orders might not be strictly tied to a session until claimed, but we adapt.
      items: mappedItems,
      note: 'Self-ordered via mobile',
      status: 'pending',
      paymentMethod: null,
      total: grandTotal,
      createdAt: new Date().toISOString(),
    }
    setOrders(prev => [...prev, newOrder])

    // Add to Kitchen
    const newKitchenOrder = {
      id: crypto.randomUUID(),
      orderId: orderId,
      tableId: activeToken.tableId,
      tableNumber: activeToken.tableNumber,
      items: mappedItems.map(m => ({ ...m, struckOut: false })),
      note: 'Self-ordered via mobile',
      stage: 'to_cook',
      sentAt: new Date().toISOString(),
    }
    setKitchenOrders(prev => [...prev, newKitchenOrder])

    setPlacedOrderId(orderId)
  }

  // --- Early Return if Invalid Token ---
  if (!activeToken) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', width: '100vw', background: '#F1F5F9', padding: '2rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.5rem' }}>
          Invalid or Expired Link
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', color: '#64748B', margin: 0 }}>
          Please scan the QR code again or ask a staff member for a new link.
        </p>
      </div>
    )
  }

  // --- Status View ---
  if (placedOrderId) {
    const stage = placedKitchenOrder?.stage || 'to_cook'
    const isReady = stage === 'completed'
    const isPreparing = stage === 'preparing'
    
    let emoji = '⏳'
    let title = 'Order Received'
    let ringColor = 'rgba(59,130,246,0.1)' // faint blue
    
    if (isPreparing) {
      emoji = '🍳'
      title = 'Order Being Prepared'
      ringColor = 'rgba(245,158,11,0.1)' // amber
    } else if (isReady) {
      emoji = '✅'
      title = 'Your order is Ready!'
      ringColor = 'rgba(16,185,129,0.1)' // green
    }

    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1.5rem', background: '#fff', borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            POS Cafe
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#64748B', margin: '0.25rem 0 0' }}>
            Table {activeToken.tableNumber}
          </p>
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <div className="animate-fade-in" style={{
            width: 120, height: 120, borderRadius: '50%', background: ringColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', marginBottom: '1.5rem',
            transition: 'background 0.5s ease'
          }}>
            {emoji}
          </div>
          
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.5rem' }}>
            {title}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', color: '#64748B', margin: '0 0 2rem' }}>
            Order #{placedOrderId.slice(-4).toUpperCase()}
          </p>

          <div style={{ width: '100%', background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', textAlign: 'left' }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#334155', margin: '0 0 1rem' }}>Items Ordered</h3>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#475569' }}>{item.qty}x {item.product.name}</span>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>₹{item.product.price * item.qty}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #E2E8F0' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 600, color: '#334155' }}>Total</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#6B21A8' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#94A3B8', marginTop: '2rem' }}>
            Please wait at your table. {isReady ? 'Your food is being served.' : 'We will notify you when it is ready.'}
          </p>
        </main>
      </div>
    )
  }

  // --- Main Ordering View ---
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <header style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#6B21A8', margin: 0 }}>
            POS Cafe
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
            Ordering for Table {activeToken.tableNumber}
          </p>
        </div>
        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6B21A8, #7C3AED)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
          ☕
        </div>
      </header>

      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto', paddingBottom: cart.length > 0 ? '100px' : '2rem' }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 1rem' }}>Our Menu</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {products.filter(p => p.active).map(product => {
            const qty = getQty(product.id)
            return (
              <div key={product.id} style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#334155', margin: '0 0 0.25rem' }}>{product.name}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 0.5rem' }}>{product.category}</p>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.95rem', fontWeight: 800, color: '#6B21A8', margin: 0 }}>₹{product.price}</p>
                </div>
                
                <div>
                  {qty === 0 ? (
                    <button
                      onClick={() => handleAdd(product)}
                      style={{ padding: '0.5rem 1rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '2rem', color: '#1E293B', fontFamily: "'Sora', sans-serif", fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ADD
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#6B21A8', padding: '0.25rem', borderRadius: '2rem', color: '#fff' }}>
                      <button onClick={() => handleSub(product)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>−</button>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 700, width: '12px', textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => handleAdd(product)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="animate-fade-in" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, #fff 80%, transparent)' }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div style={{ background: '#1E293B', borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(30,41,59,0.3)' }}>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>{cart.reduce((a,c) => a+c.qty, 0)} Items</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>₹{grandTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                style={{ padding: '0.75rem 1.5rem', background: '#10B981', border: 'none', borderRadius: '0.5rem', color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Place Order →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
