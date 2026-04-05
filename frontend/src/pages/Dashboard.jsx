import { usePOS } from '../context/POSContext'
import { showToast } from '../components/ui/Toast'

export default function Dashboard() {
  const { currentUser, logoutUser } = usePOS()

  const handleLogout = () => {
    logoutUser()
    showToast('You have been signed out.', 'info')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0D14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      {/* Purple glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(107,33,168,0.2) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{
        textAlign: 'center',
        padding: '3rem 2.5rem',
        borderRadius: '1.25rem',
        background: 'rgba(19,19,31,0.85)',
        border: '1px solid rgba(107,33,168,0.2)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        maxWidth: '480px',
        width: '100%',
        margin: '1.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#F1F5F9',
          margin: '0 0 0.5rem',
        }}>
          POS Dashboard
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          color: 'rgba(148,163,184,0.75)',
          fontSize: '0.9375rem',
          margin: '0 0 0.25rem',
        }}>
          Welcome, <strong style={{ color: '#F59E0B' }}>{currentUser?.name}</strong>
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          color: 'rgba(100,116,139,0.6)',
          fontSize: '0.8125rem',
          marginBottom: '2rem',
        }}>
          {currentUser?.email}
        </p>

        {/* Status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.3)',
          marginBottom: '2rem',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: '#10B981', fontWeight: 600 }}>
            Session Active
          </span>
        </div>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.875rem',
          color: 'rgba(100,116,139,0.8)',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}>
          🚧 The full POS dashboard is being built. Authentication is complete!
        </p>

        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '0.625rem',
            border: '1px solid rgba(239,68,68,0.35)',
            background: 'rgba(239,68,68,0.1)',
            color: '#EF4444',
            fontFamily: "'Sora', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
