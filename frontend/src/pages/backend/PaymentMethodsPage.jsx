import { useState } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'
import { QRCodeSVG } from 'qrcode.react'

function ToggleSwitch({ checked, onChange }) {
  return (
    <div 
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', background: checked ? '#10B981' : '#CBD5E1',
        position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
        boxShadow: checked ? '0 2px 8px rgba(16,185,129,0.3)' : 'none'
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'absolute', top: '3px', left: checked ? '23px' : '3px', transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
    </div>
  )
}

export default function PaymentMethodsPage() {
  const { paymentMethods, setPaymentMethods } = usePOS()
  const [localUpiId, setLocalUpiId] = useState(paymentMethods.upiId || '')

  const toggleMethod = (method, name) => {
    const newValue = !paymentMethods[method]
    setPaymentMethods(prev => ({ ...prev, [method]: newValue }))
    showToast(`${name} payments ${newValue ? 'enabled' : 'disabled'}`, newValue ? 'success' : 'info')
  }

  const handleUpiSave = () => {
    if (!localUpiId.trim()) {
      showToast('UPI ID cannot be left empty', 'warning')
      return
    }
    if (!localUpiId.includes('@')) {
      showToast('Validation failed: UPI ID must contain an "@" symbol', 'error')
      return
    }
    setPaymentMethods(prev => ({ ...prev, upiId: localUpiId.trim() }))
    showToast('UPI ID verified and saved successfully', 'success')
  }

  const CARDS = [
    {
      id: 'cash',
      title: 'Cash',
      icon: '💵',
      desc: 'Accept traditional paper cash and coins at the checkout counter.',
    },
    {
      id: 'digital',
      title: 'Digital / Card',
      icon: '💳',
      desc: 'Process standard credit, debit cards, and external bank transfers.',
    },
    {
      id: 'upi',
      title: 'UPI QR Code',
      icon: '📱',
      desc: 'Enable instant unified payments by displaying a verifiable QR code to customers.',
    }
  ]

  return (
    <div style={{ maxWidth: '1000px', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.375rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.5rem' }}>
          Payment Methods
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          Configure which payment options are exposed to the cashier terminal during checkout. Disable unused gateways.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {CARDS.map(card => {
          const isActive = paymentMethods[card.id]
          
          return (
            <div 
              key={card.id}
              style={{
                background: '#fff', borderRadius: '1rem', border: `1px solid ${isActive ? 'rgba(107,33,168,0.3)' : 'rgba(226,232,240,0.8)'}`,
                padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                boxShadow: isActive ? '0 4px 20px rgba(107,33,168,0.06)' : '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
              }}
            >
              {isActive && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #6B21A8, #F59E0B)' }} />
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '0.75rem', background: isActive ? 'rgba(107,33,168,0.1)' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                  color: isActive ? '#6B21A8' : '#94A3B8'
                }}>
                  {card.icon}
                </div>
                <ToggleSwitch checked={isActive} onChange={() => toggleMethod(card.id, card.title)} />
              </div>

              <div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.125rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.25rem' }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  {card.desc}
                </p>
              </div>

              {/* Special panel just for UPI */}
              {card.id === 'upi' && isActive && (
                <div 
                  className="animate-fade-in"
                  style={{ 
                    marginTop: '0.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '0.75rem', 
                    border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem' 
                  }}
                >
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.375rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
                      Merchant UPI ID
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={localUpiId} 
                        onChange={e => setLocalUpiId(e.target.value)}
                        placeholder="yourbusiness@bank"
                        className="pos-input"
                        style={{ background: '#fff', color: '#1E293B', flex: 1, padding: '0.625rem 0.875rem' }}
                      />
                      <button 
                        onClick={handleUpiSave}
                        style={{ 
                          background: '#6B21A8', color: '#fff', border: 'none', borderRadius: '0.625rem',
                          padding: '0 1rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#7C3AED'}
                        onMouseLeave={e => e.currentTarget.style.background = '#6B21A8'}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {paymentMethods.upiId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '0.75rem', borderRadius: '0.5rem', border: '1px dashed #CBD5E1' }}>
                      <div style={{ padding: '0.25rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}>
                        <QRCodeSVG 
                          value={`upi://pay?pa=${paymentMethods.upiId}&pn=Odoo%20POS%20Cafe&am=0`} 
                          size={64} 
                          level="M" 
                          includeMargin={false}
                        />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B', margin: '0 0 0.125rem' }}>Active QR Gateway</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#10B981', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}/> Verified Link
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
