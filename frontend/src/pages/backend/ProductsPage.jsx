import { useState } from 'react'
import { usePOS } from '../../context/POSContext'
import ProductPanel from '../../components/backend/ProductPanel'
import { showToast } from '../../components/ui/Toast'

export default function ProductsPage() {
  const { products, setProducts } = usePOS()

  const [search, setSearch] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setPanelOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setPanelOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
      showToast('Product deleted', 'info')
    }
  }

  const handleSaveProduct = (updatedProduct) => {
    if (editingProduct) {
      setProducts(products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)))
    } else {
      setProducts([...products, { ...updatedProduct, id: crypto.randomUUID() }])
    }
  }

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.375rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
          Products
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', top: '50%', left: '0.875rem', transform: 'translateY(-50%)', color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pos-input" 
              style={{ background: '#fff', paddingLeft: '2.5rem', width: '240px' }}
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="btn-primary" 
            style={{ width: 'auto', padding: '0.625rem 1.25rem', margin: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: '0.875rem', border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden', paddingBottom: '0.5rem'
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.125rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>No products found</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#94A3B8' }}>Click "Add Product" to create one.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Name', 'Category', 'Price', 'Tax', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '1rem 1.25rem', textAlign: i === 5 ? 'right' : 'left', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.9375rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.125rem' }}>{product.name}</div>
                    {product.variants?.length > 0 && (
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                        {product.variants.reduce((acc, v) => acc + v.values.length, 0)} variants configured
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#475569' }}>
                    <span style={{ background: 'rgba(100,116,139,0.1)', padding: '0.25rem 0.625rem', borderRadius: '1rem', fontWeight: 500 }}>{product.category}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9375rem', color: '#1E293B', fontWeight: 700 }}>
                    ₹{product.price} <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>/{product.unit}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>{product.tax}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      background: product.active ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                      color: product.active ? '#10B981' : '#64748B',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: product.active ? '#10B981' : '#64748B' }} />
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button onClick={() => handleOpenEdit(product)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.375rem', transition: 'all 0.2s' }} onMouseEnter={e => {e.currentTarget.style.color = '#6B21A8'; e.currentTarget.style.background = 'rgba(107,33,168,0.1)'}} onMouseLeave={e => {e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'none'}} title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.375rem', marginLeft: '0.25rem', transition: 'all 0.2s' }} onMouseEnter={e => {e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}} onMouseLeave={e => {e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'none'}} title="Delete">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProductPanel 
        open={panelOpen} 
        onClose={() => setPanelOpen(false)} 
        product={editingProduct} 
        onSave={handleSaveProduct} 
      />
    </div>
  )
}
