const COMING_SOON_STYLE = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center',
  background: '#fff', borderRadius: '1rem',
  border: '1px solid rgba(226,232,240,0.8)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
}

export function ComingSoonPlaceholder({ emoji, title, sub }) {
  return (
    <div style={COMING_SOON_STYLE}>
      <span style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>{emoji}</span>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.5rem' }}>
        {title}
      </h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9375rem', color: '#64748B', maxWidth: '380px', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
        {sub}
      </p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1.25rem', borderRadius: '2rem',
        background: 'rgba(107,33,168,0.08)', border: '1px solid rgba(107,33,168,0.2)',
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6B21A8', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: '#6B21A8', fontWeight: 600 }}>
          Coming in next module
        </span>
      </div>
    </div>
  )
}
