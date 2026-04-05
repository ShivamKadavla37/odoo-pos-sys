import { useState, useMemo, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'

// --- Utility to load Razorpay Script ---
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PaymentView({ selectedTableId, onCancel, onSuccess }) {
  const {
    tables, setTables,
    orders, setOrders,
    paymentMethods,
  } = usePOS()

  // ── Find active order ──
  const activeOrder = useMemo(
    () => orders.find(o => o.tableId === selectedTableId && o.status === 'pending'),
    [orders, selectedTableId]
  )

  const table = tables.find(t => t.id === selectedTableId)
  const total = activeOrder?.total ?? 0

  // ── Payment Methods config ──
  const methodsAvailable = []
  if (paymentMethods.cash)    methodsAvailable.push({ id: 'cash',    label: 'Cash' })
  if (paymentMethods.digital) methodsAvailable.push({ id: 'digital', label: 'Card / Digital' })
  if (paymentMethods.upi)     methodsAvailable.push({ id: 'upi',     label: 'UPI QR' })

  // ── State ──
  const [activeMethod, setActiveMethod] = useState(methodsAvailable[0]?.id || '')
  const [tendered, setTendered]         = useState('')
  const [showSummary, setShowSummary]   = useState(true)
  const [successMode, setSuccessMode]   = useState(false)
  const [razorpayLoading, setRazorpayLoading] = useState(false)

  // ── Handlers ──
  const handlePay = () => {
    if (!activeOrder) return

    if (activeMethod === 'cash') {
      const amt = Number(tendered)
      if (amt < total) {
        showToast('Tendered amount is less than total.', 'error')
        return
      }
    }

    setSuccessMode(true)

    // Wait 2 seconds for animation, then update state and return to floor view
    setTimeout(() => {
      // 1. Mark order as paid
      setOrders(prev => prev.map(o =>
        o.id === activeOrder.id
          ? { ...o, status: 'paid', paymentMethod: activeMethod }
          : o
      ))

      // 2. Clear table status
      if (selectedTableId) {
        setTables(prev => prev.map(t =>
          t.id === selectedTableId ? { ...t, status: 'free' } : t
        ))
      }

      showToast(`Payment of ₹${total.toLocaleString('en-IN')} successful!`, 'success')
      onSuccess()
    }, 2000)
  }

  const handleRazorpayCheckout = async () => {
    setRazorpayLoading(true)
    const res = await loadRazorpayScript()
    if (!res) {
      showToast('Razorpay SDK failed to load', 'error')
      setRazorpayLoading(false)
      return
    }

    const options = {
      key: "rzp_test_SZQp3kiJEAQfhm",
      amount: total * 100, // Amount is in currency subunits (paise)
      currency: "INR",
      name: "POS Cafe",
      description: table ? `Payment for Table ${table.number}` : "Takeaway Payment",
      handler: function (response) {
        // Verify payment signature here in production
        handlePay() // Process payment on frontend
      },
      prefill: {
        name: "Cafe Customer",
        email: "customer@poscafe.com",
        contact: "9999999999"
      },
      theme: {
        color: "#6B21A8"
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', function (response){
        showToast(`Payment Failed: ${response.error.description}`, 'error')
    })
    rzp.open()
    setRazorpayLoading(false)
  }

  // ── Sub-components for methods ──
  const renderCash = () => {
    const change = Number(tendered) - total
    return (
      <div className="animate-fade-in" style={{
        padding: '1.5rem', background: '#F8FAFC', borderRadius: '1rem',
        border: '1px solid #E2E8F0', marginTop: '1rem',
      }}>
        <label style={{
          display: 'block', fontFamily: "'Sora', sans-serif", fontSize: '0.9rem',
          fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem',
        }}>
          Amount Tendered (₹)
        </label>
        <input
          type="number"
          placeholder="0.00"
          value={tendered}
          onChange={e => setTendered(e.target.value)}
          style={{
            width: '100%', padding: '1rem', fontSize: '1.25rem', fontFamily: "'Sora', sans-serif",
            fontWeight: 800, borderRadius: '0.625rem', border: '2px solid #CBD5E1',
            outline: 'none', color: '#1E293B', transition: 'border 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#6B21A8'}
          onBlur={e => e.target.style.borderColor = '#CBD5E1'}
        />
        
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0',
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#64748B' }}>
            Change Due:
          </span>
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800,
            color: change >= 0 ? '#10B981' : '#EF4444',
          }}>
            ₹{change >= 0 ? change.toFixed(2) : '0.00'}
          </span>
        </div>

        <button
          onClick={handlePay}
          disabled={!tendered || Number(tendered) < total}
          style={{
            width: '100%', padding: '1rem', marginTop: '1.5rem',
            background: (!tendered || Number(tendered) < total) ? '#CBD5E1' : 'linear-gradient(135deg, #10B981, #059669)',
            color: '#fff', border: 'none', borderRadius: '0.625rem',
            fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700,
            cursor: (!tendered || Number(tendered) < total) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: (!tendered || Number(tendered) < total) ? 'none' : '0 4px 14px rgba(16,185,129,0.4)',
          }}
        >
          Mark as Paid
        </button>
      </div>
    )
  }

  const renderDigital = () => (
    <div className="animate-fade-in" style={{
      padding: '2rem 1.5rem', background: '#F8FAFC', borderRadius: '1rem',
      border: '1px solid #E2E8F0', marginTop: '1rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
      <h3 style={{
        fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700,
        color: '#1E293B', margin: '0 0 0.5rem',
      }}>
        Swipe or insert card
      </h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#64748B',
        margin: '0 0 1.5rem',
      }}>
        Please ask the customer to follow instructions on the terminal.
      </p>

      <button
        onClick={handlePay}
        style={{
          width: '100%', padding: '1rem',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#fff', border: 'none', borderRadius: '0.625rem',
          fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
        }}
      >
        Mark as Paid
      </button>
    </div>
  )

  const renderUPI = () => {
    return (
      <div className="animate-fade-in" style={{
        padding: '2rem 1.5rem', background: '#F8FAFC', borderRadius: '1rem',
        border: '1px solid #E2E8F0', marginTop: '1rem', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        
        <div style={{
          padding: '1.5rem', background: '#fff', borderRadius: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'inline-block', marginBottom: '1rem', width: '100%'
        }}>
          <h3 style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 800,
            color: '#1E293B', margin: '0 0 0.5rem',
          }}>
            Pay Seamlessly via Razorpay
          </h3>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#64748B',
            margin: '0 0 1.5rem',
          }}>
            Generate a dynamic UPI QR code or use other digital payment methods.
          </p>

          <button
            onClick={handleRazorpayCheckout}
            disabled={razorpayLoading}
            style={{
              width: '100%', padding: '1rem',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: '#fff', border: 'none', borderRadius: '0.625rem',
              fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700,
              cursor: razorpayLoading ? 'wait' : 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
            }}
          >
            {razorpayLoading ? 'Loading...' : 'Scan & Pay with Razorpay'}
          </button>
        </div>

        <h3 style={{
          fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 800,
          color: '#6B21A8', margin: '0 0 0.25rem',
        }}>
          ₹{total.toLocaleString('en-IN')}
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
          <button
            onClick={handlePay}
            style={{
              flex: 1, padding: '1rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff', border: 'none', borderRadius: '0.625rem',
              fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
            }}
          >
            Mark as Paid ✓
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '1rem',
              background: '#fff',
              color: '#EF4444', border: '1.5px solid #E2E8F0', borderRadius: '0.625rem',
              fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Success Overlay ──
  if (successMode) {
    return (
      <div className="animate-fade-in" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        color: '#fff',
      }}>
        <div style={{
          fontSize: '5rem', marginBottom: '1rem',
          animation: 'pulse 1s infinite alternate',
        }}>✅</div>
        <h1 style={{
          fontFamily: "'Sora', sans-serif", fontSize: '2.5rem', fontWeight: 800,
          margin: '0 0 0.5rem',
        }}>
          Amount Paid
        </h1>
        <h2 style={{
          fontFamily: "'Sora', sans-serif", fontSize: '3rem', fontWeight: 800,
          margin: 0,
        }}>
          ₹{total.toLocaleString('en-IN')}
        </h2>
      </div>
    )
  }

  // ── Main UI ──
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#F1F5F9', overflow: 'hidden', padding: '1.5rem',
      alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN: Summary */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', color: '#64748B',
              fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem',
            }}
          >
            ← Back to Register
          </button>

          <div style={{
            background: '#fff', borderRadius: '1rem', padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
          }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
              margin: '0 0 1rem',
            }}>
              Order Summary • {table ? `Table ${table.number}` : 'Takeaway'}
            </p>

            {/* Collapsible List */}
            <div>
              <button
                onClick={() => setShowSummary(s => !s)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: "'Sora', sans-serif", fontSize: '0.95rem', fontWeight: 700,
                  color: '#1E293B', cursor: 'pointer', padding: '0.5rem 0',
                  borderBottom: showSummary ? '1px solid #E2E8F0' : 'none',
                }}
              >
                <span>{activeOrder?.items?.length || 0} Items</span>
                <span>{showSummary ? '▼' : '▶'}</span>
              </button>

              {showSummary && (
                <div className="animate-fade-in" style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeOrder?.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#475569' }}>
                        {item.qty}x {item.name} {item.variantName && `(${item.variantName})`}
                      </span>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* BIG TOTAL */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed #E2E8F0', textAlign: 'right' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#64748B', margin: '0 0 0.25rem' }}>
                Total to Pay
              </p>
              <p style={{
                fontFamily: "'Sora', sans-serif", fontSize: '2.5rem', fontWeight: 800,
                color: '#6B21A8', margin: 0, lineHeight: 1,
              }}>
                ₹{total.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Method */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{
            fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 800,
            color: '#1E293B', margin: '0 0 1rem', marginTop: '2.5rem',
          }}>
            Payment Method
          </h2>

          {/* Methods Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {methodsAvailable.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMethod(m.id)}
                style={{
                  flex: 1, padding: '0.875rem 1rem',
                  background: activeMethod === m.id ? '#6B21A8' : '#fff',
                  color: activeMethod === m.id ? '#fff' : '#64748B',
                  border: `1px solid ${activeMethod === m.id ? '#6B21A8' : '#E2E8F0'}`,
                  borderRadius: '0.75rem',
                  fontFamily: "'Sora', sans-serif", fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: activeMethod === m.id ? '0 4px 12px rgba(107,33,168,0.25)' : 'none',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Render Active Method content */}
          {activeMethod === 'cash' && renderCash()}
          {activeMethod === 'digital' && renderDigital()}
          {activeMethod === 'upi' && renderUPI()}

        </div>

      </div>
    </div>
  )
}
