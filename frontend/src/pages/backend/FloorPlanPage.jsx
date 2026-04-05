import { useState } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'

function TableModal({ open, onClose, table, onSave, floors, currentFloorId }) {
  const [form, setForm] = useState({
    number: '', seats: 4, floorId: currentFloorId, active: true
  })

  // Sync state when modal opens
  if (open && !form._synced) {
    if (table) {
      setForm({ ...table, _synced: true })
    } else {
      setForm({ number: '', seats: 4, floorId: currentFloorId, active: true, _synced: true })
    }
  }

  // Reset sync on close
  const handleClose = () => {
    setForm(f => ({ ...f, _synced: false }))
    onClose()
  }

  const handleSave = () => {
    if (form.number === '' || isNaN(form.number)) {
       return showToast('Please enter a valid table number', 'error')
    }
    if (form.seats < 1 || form.seats > 20) {
       return showToast('Seats must be between 1 and 20', 'error')
    }
    
    // Cleanup internal state before saving
    const { _synced, ...cleanForm } = form
    onSave({ ...cleanForm, number: Number(cleanForm.number), seats: Number(cleanForm.seats) })
    handleClose()
  }

  if (!open) return null

  return (
    <>
      <div 
        className="animate-fade-in"
        style={{ position: 'fixed', inset: 0, background: 'rgba(13,13,20,0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }}
        onClick={handleClose}
      />
      <div 
        className="animate-slide-left"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px',
          background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.1)', zIndex: 50,
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', color: '#1E293B', margin: 0 }}>
            {table ? 'Edit Table' : 'Add New Table'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94A3B8' }}>&times;</button>
        </div>

        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Table Number</label>
            <input 
              type="number" min="1" value={form.number} onChange={e => setForm({...form, number: e.target.value})}
              className="pos-input" style={{ background: '#fff', color: '#1E293B' }} placeholder="e.g. 12"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Seats Capacity</label>
            <input 
              type="number" min="1" max="20" value={form.seats} onChange={e => setForm({...form, seats: e.target.value})}
              className="pos-input" style={{ background: '#fff', color: '#1E293B' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>Floor Assigned</label>
            <select 
              value={form.floorId} onChange={e => setForm({...form, floorId: e.target.value})}
              className="pos-input" style={{ background: '#fff', color: '#1E293B' }}
            >
              {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
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
              {form.active ? 'Active' : 'Hidden'}
            </span>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '1rem' }}>
          <button onClick={handleClose} style={{ flex: 1, padding: '0.875rem', border: '1px solid #CBD5E1', borderRadius: '0.625rem', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 1, margin: 0 }}>Save</button>
        </div>
      </div>
    </>
  )
}

export default function FloorPlanPage() {
  const { floors, setFloors, tables, setTables } = usePOS()
  
  const [activeFloorId, setActiveFloorId] = useState(floors[0]?.id || '')
  
  // Floor Add logic
  const [newFloorName, setNewFloorName] = useState('')
  const [addingFloor, setAddingFloor] = useState(false)

  // Table Modal logic
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)

  const activeFloorTables = tables.filter(t => t.floorId === activeFloorId).sort((a, b) => a.number - b.number)

  const handleAddFloor = () => {
    if (!newFloorName.trim()) return showToast('Floor name is required', 'error')
    const id = crypto.randomUUID()
    setFloors([...floors, { id, name: newFloorName.trim() }])
    setActiveFloorId(id)
    setNewFloorName('')
    setAddingFloor(false)
    showToast('New floor added', 'success')
  }

  const handleSaveTable = (tableData) => {
    if (editingTable) {
      setTables(tables.map(t => (t.id === tableData.id ? { ...t, ...tableData } : t)))
      showToast('Table updated', 'success')
    } else {
      // Create new table, defaulting its semantic status to 'free'
      setTables([...tables, { ...tableData, id: crypto.randomUUID(), status: 'free' }])
      showToast('Table created', 'success')
    }
  }

  const openAddTable = () => {
    setEditingTable(null)
    setModalOpen(true)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'occupied': return { border: '#EF4444', bg: 'rgba(239,68,68,0.05)', pill: '#EF4444', pillBg: 'rgba(239,68,68,0.1)' }
      case 'reserved': return { border: '#F59E0B', bg: 'rgba(245,158,11,0.05)', pill: '#F59E0B', pillBg: 'rgba(245,158,11,0.1)' }
      default:         return { border: '#10B981', bg: 'rgba(16,185,129,0.05)', pill: '#10B981', pillBg: 'rgba(16,185,129,0.1)' } // free
    }
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%' }}>
      
      {/* Left panel: Floors */}
      <div style={{ 
        width: '280px', background: '#fff', borderRadius: '1rem', border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.125rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Floors</h3>
          {!addingFloor && (
            <button 
              onClick={() => setAddingFloor(true)}
              style={{ background: 'none', border: 'none', color: '#6B21A8', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              + Add
            </button>
          )}
        </div>
        
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {addingFloor && (
            <div className="animate-fade-in" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                autoFocus
                type="text" value={newFloorName} onChange={e => setNewFloorName(e.target.value)}
                placeholder="Name..." className="pos-input" style={{ background: '#fff', color: '#1E293B', padding: '0.5rem', fontSize: '0.8125rem' }}
                onKeyDown={e => e.key === 'Enter' && handleAddFloor()}
              />
              <button 
                onClick={handleAddFloor}
                style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0 0.75rem', cursor: 'pointer' }}
              >✓</button>
              <button 
                onClick={() => setAddingFloor(false)}
                style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0 0.75rem', cursor: 'pointer' }}
              >&times;</button>
            </div>
          )}

          {floors.map(floor => {
            const isActive = activeFloorId === floor.id
            const floorTableCount = tables.filter(t => t.floorId === floor.id).length
            return (
              <button
                key={floor.id}
                onClick={() => setActiveFloorId(floor.id)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.875rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, #6B21A8, #7C3AED)' : '#F8FAFC',
                  color: isActive ? '#fff' : '#475569',
                  boxShadow: isActive ? '0 4px 12px rgba(107,33,168,0.25)' : 'none',
                  transition: 'all 0.2s', textAlign: 'left'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F1F5F9' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#F8FAFC' }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9375rem', fontWeight: isActive ? 600 : 500 }}>
                  {floor.name}
                </span>
                <span style={{ 
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#E2E8F0', padding: '0.125rem 0.5rem', borderRadius: '1rem',
                  fontSize: '0.6875rem', fontWeight: 700 
                }}>
                  {floorTableCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right panel: Tables Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.375rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.25rem' }}>
              {floors.find(f => f.id === activeFloorId)?.name || 'Select Floor'}
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
              Manage seating layout and configuration
            </p>
          </div>
          {activeFloorId && (
            <button onClick={openAddTable} className="btn-primary" style={{ width: 'auto' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Add Table</span>
            </button>
          )}
        </div>

        {activeFloorTables.length === 0 ? (
          <div style={{ flex: 1, background: '#fff', borderRadius: '1rem', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>🪑</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.125rem', fontWeight: 600, color: '#475569', margin: '0 0 0.5rem' }}>No tables on this floor</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#94A3B8', margin: '0 0 1.5rem' }}>Start by adding a new table configuration.</p>
            <button onClick={openAddTable} className="btn-primary" style={{ width: 'auto', padding: '0.625rem 1.25rem' }}>Add First Table</button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' 
          }}>
            {activeFloorTables.map(table => {
              const colors = getStatusColor(table.status)
              return (
                <div 
                  key={table.id}
                  onClick={() => { setEditingTable(table); setModalOpen(true); }}
                  style={{
                    background: colors.bg, borderRadius: '1rem', border: `2px solid ${colors.border}`,
                    padding: '1.5rem', cursor: 'pointer', position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${colors.pillBg}` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Subtle active/inactive indicator */}
                  {!table.active && (
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '8px', height: '8px', borderRadius: '50%', background: '#94A3B8' }} title="Inactive" />
                  )}

                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem', lineHeight: 1 }}>
                    {table.number}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#64748B', marginBottom: '1rem' }}>
                    {table.seats} Seats
                  </div>

                  <div style={{ 
                    background: colors.pillBg, color: colors.pill, padding: '0.25rem 0.75rem', borderRadius: '1rem',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    {table.status}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <TableModal 
        open={modalOpen} onClose={() => setModalOpen(false)}
        table={editingTable} onSave={handleSaveTable}
        floors={floors} currentFloorId={activeFloorId}
      />
    </div>
  )
}
