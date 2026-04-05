import { useState } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../ui/Toast'
import PasswordInput from '../ui/PasswordInput'

export default function LoginForm({ onSwitch, onLoginSuccess }) {
  const { loginUser } = usePOS()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    // Fake async delay (500 ms)
    await new Promise(r => setTimeout(r, 500))
    try {
      const user = loginUser(email.trim(), password)
      showToast(`Welcome back, ${user.name}! 👋`, 'success')
      onLoginSuccess?.()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="animate-slide-right">
      {/* Email */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="login-email"
          style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(226,232,240,0.75)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@restaurant.com"
          className={`pos-input ${errors.email ? 'error' : ''}`}
          autoComplete="email"
        />
        {errors.email && (
          <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#EF4444' }}>{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div style={{ marginBottom: '0.625rem' }}>
        <label
          htmlFor="login-password"
          style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(226,232,240,0.75)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          Password
        </label>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={!!errors.password}
        />
        {errors.password && (
          <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#EF4444' }}>{errors.password}</p>
        )}
      </div>

      {/* Forgot password */}
      <div style={{ textAlign: 'right', marginBottom: '1.75rem' }}>
        <button
          type="button"
          onClick={() => showToast('Feature coming soon 🚀', 'info')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            color: '#A855F7',
            fontFamily: "'DM Sans', sans-serif",
            textDecoration: 'underline',
            textDecorationColor: 'transparent',
            transition: 'text-decoration-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.textDecorationColor = '#A855F7'}
          onMouseLeave={e => e.currentTarget.style.textDecorationColor = 'transparent'}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading
          ? <>
              <svg className="animate-spin-smooth" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span>Signing in…</span>
            </>
          : <span>Sign In to POS</span>
        }
      </button>

      {/* Switch to signup */}
      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'rgba(148,163,184,0.75)' }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#F59E0B', fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem', fontWeight: 600,
          }}
        >
          Create one →
        </button>
      </p>
    </form>
  )
}
