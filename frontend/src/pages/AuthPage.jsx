import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'

export default function AuthPage({ onLoginSuccess }) {
  const [tab, setTab] = useState('login') // 'login' | 'signup'

  return (
    <div
      className="mesh-bg noise-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Decorative orbs */}
      <div style={{
        position: 'fixed', top: '15%', left: '10%',
        width: '420px', height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,33,168,0.18) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '8%',
        width: '320px', height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '1.25rem',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Amber circle icon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #6B21A8, #7C3AED)',
            boxShadow: '0 8px 32px rgba(107,33,168,0.45)',
            marginBottom: '1rem',
            fontSize: '1.75rem',
          }}>
            ☕
          </div>

          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '1.625rem',
              fontWeight: 700,
              color: '#F1F5F9',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            POS Cafe
          </h1>
          <p style={{
            marginTop: '0.25rem',
            fontSize: '0.875rem',
            color: 'rgba(148,163,184,0.65)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {tab === 'login' ? 'Welcome back — sign in to continue' : 'Create your cashier account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.375rem',
            background: 'rgba(10,10,20,0.6)',
            borderRadius: '0.75rem',
            padding: '0.25rem',
            marginBottom: '2rem',
            border: '1px solid rgba(107,33,168,0.15)',
          }}
        >
          <button
            id="tab-login"
            type="button"
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            type="button"
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Forms — keyed so they remount on switch for clean state */}
        {tab === 'login'
          ? <LoginForm
              key="login"
              onSwitch={() => setTab('signup')}
              onLoginSuccess={onLoginSuccess}
            />
          : <SignupForm
              key="signup"
              onSwitch={() => setTab('login')}
            />
        }

        {/* Footer */}
        <p style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'rgba(100,116,139,0.6)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          © {new Date().getFullYear()} Odoo POS Cafe · Hackathon Edition
        </p>
      </div>
    </div>
  )
}
