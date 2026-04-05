import { useState, useEffect } from 'react'
import { showToast } from '../ui/Toast'

export default function ProductPanel({ open, onClose, product, onSave }) {
  const [tab, setTab] = useState('general')
  const [form, setForm] = useState({
    name: '', category: 'Food', price: '', unit: 'piece', tax: '5%', desc: '', active: true, variants: []
  })
  
  // Local state for adding a variant
  const [varAttr, setVarAttr] = useState('')
  const [varVal, setVarVal] = useState('')
  const [varPrice, setVarPrice] = useState('')

  useEffect(() => {
    if (open) {
      if (product) setForm(JSON.parse(JSON.stringify(product)))
      else setForm({ name: '', category: 'Food', price: '', unit: 'piece', tax: '5%', desc: '', active: true, variants: [] })
      setTab('general')
      setVarAttr(product?.variants?.[0]?.attribute || '')
      setVarVal('')
      setVarPrice('')
    }
  }, [open, product])

  const handleSave = () => {
    if (!form.name.trim()) return showToast('Product name is required', 'error')
    if (form.price === '' || isNaN(form.price)) return showToast('Valid price is required', 'error')
    
    onSave({ ...form, price: Number(form.price) })
    showToast(product ? 'Product updated successfully' : 'Product created successfully', 'success')
    onClose()
  }

  const addVariantValue = () => {
    if (!varAttr.trim()) return showToast('Attribute name is required first', 'error')
    if (!varVal.trim()) return showToast('Variant value is required', 'error')
    
    const priceNum = Number(varPrice) || 0
    const currentVariants = [...form.variants]
    let attrIndex = currentVariants.findIndex(v => v.attribute.toLowerCase() === varAttr.toLowerCase())
    
    if (attrIndex === -1) {
      currentVariants.push({ attribute: varAttr, values: [] })
      attrIndex = currentVariants.length - 1
    }
    
    // Check duplicate
    if (currentVariants[attrIndex].values.some(v => v.name.toLowerCase() === varVal.toLowerCase())) {
      return showToast('Variant value already exists', 'warning')
    }
    
    currentVariants[attrIndex].values.push({ name: varVal, price: priceNum })
    setForm({ ...form, variants: currentVariants })
    setVarVal('')
    setVarPrice('')
  }

  const removeVariantValue = (attrIdx, valIdx) => {
    const currentVariants = [...form.variants]
    currentVariants[attrIdx].values.splice(valIdx, 1)
    if (currentVariants[attrIdx].values.length === 0) {
      currentVariants.splice(attrIdx, 1) // Remove attribute if empty
      setVarAttr('')
    }
    setForm({ ...form, variants: currentVariants })
  }

  if (!open) return null

  return (
    <>
      <div 
        className="animate-fade-in"
        style={{
          position: 'fixed', inset: 0, background: 'rgba(13,13,20,0.6)', 
          backdropFilter: 'blur(4px)', zIndex: 40
        }}
        onClick={onClose}
      />
      <div 
        className="animate-slide-left"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '480px',
          background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.1)', zIndex: 50,
          display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(226,232,240,0.8)'
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', color: '#1E293B', margin: 0 }}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94A3B8', cursor: 'pointer' }}>&times;</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <button
            onClick={() => setTab('general')}
            style={{
              flex: 1, padding: '0.875rem', background: 'none', border: 'none', 
              borderBottom: tab === 'general' ? '2px solid #6B21A8' : '2px solid transparent',
              color: tab === 'general' ? '#6B21A8' : '#64748B', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: 'pointer'
            }}
          >
            General Info
          </button>
          <button
            onClick={() => setTab('variants')}
            style={{
              flex: 1, padding: '0.875rem', background: 'none', border: 'none', 
              borderBottom: tab === 'variants' ? '2px solid #6B21A8' : '2px solid transparent',
              color: tab === 'variants' ? '#6B21A8' : '#64748B', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: 'pointer'
            }}
          >
            Variants
          </button>
        </div>

        {/* Content */}
        <div className="main-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {tab === 'general' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Product Name</label>
                <input 
                  type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="pos-input" style={{ background: '#fff', color: '#1E293B' }} placeholder="e.g. Mocha Frappuccino" 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="pos-input" style={{ background: '#fff', color: '#1E293B' }}>
                    <option>Food</option>
                    <option>Beverage</option>
                    <option>Dessert</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Price (₹)</label>
                  <input 
                    type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="pos-input" style={{ background: '#fff', color: '#1E293B' }} placeholder="0.00" 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="pos-input" style={{ background: '#fff', color: '#1E293B' }}>
                    <option>piece</option>
                    <option>kg</option>
                    <option>litre</option>
                    <option>plate</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Tax %</label>
                  <select value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} className="pos-input" style={{ background: '#fff', color: '#1E293B' }}>
                    <option>0%</option>
                    <option>5%</option>
                    <option>12%</option>
                    <option>18%</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Description</label>
                <textarea 
                  value={form.desc} onChange={e => setForm({...form, desc: e.target.value})}
                  className="pos-input" style={{ background: '#fff', color: '#1E293B', minHeight: '80px', resize: 'vertical' }} placeholder="Short product description..." 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div 
                  onClick={() => setForm({...form, active: !form.active})}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', background: form.active ? '#10B981' : '#CBD5E1',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '3px', left: form.active ? '23px' : '3px', transition: 'left 0.2s'
                  }} />
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                  {form.active ? 'Active (Ready to sell)' : 'Inactive (Hidden in POS)'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Attribute Name</label>
                <input 
                  type="text" value={varAttr} onChange={e => setVarAttr(e.target.value)}
                  className="pos-input" style={{ background: '#fff', color: '#1E293B' }} placeholder="e.g. Size, Add-on, Pack" 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Add Value</h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input 
                    type="text" value={varVal} onChange={e => setVarVal(e.target.value)}
                    className="pos-input" style={{ flex: 2, background: '#fff', color: '#1E293B' }} placeholder="e.g. Large" 
                  />
                  <input 
                    type="number" value={varPrice} onChange={e => setVarPrice(e.target.value)}
                    className="pos-input" style={{ flex: 1, background: '#fff', color: '#1E293B' }} placeholder="+ ₹0" 
                  />
                  <button 
                    onClick={addVariantValue}
                    style={{
                      background: 'rgba(107,33,168,0.1)', color: '#6B21A8', border: 'none', borderRadius: '0.625rem',
                      padding: '0 1rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(107,33,168,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(107,33,168,0.1)'}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Variant Chips */}
              {form.variants.map((variant, aIdx) => (
                <div key={aIdx} style={{ marginTop: '1rem' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
                    {variant.attribute}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {variant.values.map((v, vIdx) => (
                      <div key={vIdx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', border: '1px solid #CBD5E1', 
                        padding: '0.25rem 0.5rem 0.25rem 0.75rem', borderRadius: '1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem'
                      }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>{v.name}</span>
                        <span style={{ color: '#6B21A8', fontWeight: 700 }}>{v.price > 0 ? `+₹${v.price}` : '₹0'}</span>
                        <button 
                          onClick={() => removeVariantValue(aIdx, vIdx)}
                          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1, padding: '0.875rem', border: '1px solid #CBD5E1', borderRadius: '0.625rem', background: '#fff',
              color: '#475569', fontFamily: "'Sora', sans-serif", fontWeight: 600, cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary"
            style={{ flex: 1, margin: 0 }}
          >
            <span>{product ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </div>
    </>
  )
}
