import { useState } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'

export default function SelfOrderingPage() {
  const { tables, selfOrderTokens, setSelfOrderTokens } = usePOS()
  const [selectedTableId, setSelectedTableId] = useState('')

  const handleGenerateToken = () => {
    if (!selectedTableId) {
      showToast('Please select a table to link the token to.', 'error')
      return
    }

    // Generate random 6 character token
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let token = ''
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const table = tables.find(t => t.id === selectedTableId)

    const newToken = {
      id: crypto.randomUUID(),
      token,
      tableId: selectedTableId,
      tableNumber: table?.number,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    setSelfOrderTokens(prev => [newToken, ...prev])
    showToast(`Token ${token} generated for Table ${table?.number}`, 'success')
  }

  const handleCopyLink = (token) => {
    const url = `${window.location.origin}/order/${token}`
    navigator.clipboard.writeText(url)
    showToast('Link copied to clipboard!', 'success')
  }

  const handleRevoke = (id) => {
    setSelfOrderTokens(prev => prev.map(t => t.id === id ? { ...t, status: 'revoked' } : t))
    showToast('Token revoked successfully.', 'info')
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
        Self Ordering
      </h1>

      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#334155', margin: '0 0 1rem' }}>
          Generate New Token
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#64748B', margin: '0 0 1.5rem' }}>
          Create a unique token for a table. Customers can use this token URL to place orders directly from their mobile device.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value)}
            style={{
              padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1px solid #CBD5E1', outline: 'none',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: '#1E293B', minWidth: '200px'
            }}
          >
            <option value="" disabled>Select a table...</option>
            {tables.map(t => (
              <option key={t.id} value={t.id}>Table {t.number} ({t.seats} seats)</option>
            ))}
          </select>
          <button
            onClick={handleGenerateToken}
            style={{
              padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #6B21A8, #7C3AED)', border: 'none', borderRadius: '0.625rem',
              color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: '0.95rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(107,33,168,0.3)', transition: 'all 0.2s',
            }}
          >
            + Generate Token
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#334155', margin: 0 }}>
            Active & Past Tokens
          </h2>
        </div>
        
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fff', borderBottom: '2px solid #F1F5F9' }}>
                {['Token', 'Linked Table', 'Created At', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selfOrderTokens.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
                    No tokens generated yet.
                  </td>
                </tr>
              ) : (
                selfOrderTokens.map(token => (
                  <tr key={token.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', background: '#F1F5F9', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', letterSpacing: '2px' }}>
                        {token.token}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                      Table {token.tableNumber}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#64748B' }}>
                      {new Date(token.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase',
                        background: token.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: token.status === 'active' ? '#10B981' : '#EF4444',
                      }}>
                        {token.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleCopyLink(token.token)}
                          style={{
                            padding: '0.5rem 0.75rem', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '0.5rem',
                            color: '#334155', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                        >
                          🔗 Copy Link
                        </button>
                        {token.status === 'active' && (
                          <button
                            onClick={() => handleRevoke(token.id)}
                            style={{
                              padding: '0.5rem 0.75rem', background: '#fff', border: '1px solid #EF4444', borderRadius: '0.5rem',
                              color: '#EF4444', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600,
                              cursor: 'pointer', transition: 'all 0.2s',
                            }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
