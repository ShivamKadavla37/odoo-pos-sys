import { useState, useCallback } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../ui/Toast'
import PasswordInput from '../ui/PasswordInput'

const Field = ({ id, label, children }) => (
  <div style={{ marginBottom: '1.125rem' }}>
    <label
      htmlFor={id}
      style={{
        display: 'block', marginBottom: '0.5rem',
        fontSize: '0.8125rem', fontWeight: 600,
        color: 'rgba(226,232,240,0.75)',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}
    >
      {label}
    </label>
    {children}
  </div>
)

export default function SignupForm({ onSwitch }) {
  const { registerUser } = usePOS()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // ✅ FIX: useCallback ensures stable handler references — no re-creation on every render
  const handleName     = useCallback((e) => setForm(prev => ({ ...prev, name:     e.target.value })), [])
  const handleEmail    = useCallback((e) => setForm(prev => ({ ...prev, email:    e.target.value })), [])
  const handlePassword = useCallback((e) => setForm(prev => ({ ...prev, password: e.target.value })), [])
  const handleConfirm  = useCallback((e) => setForm(prev => ({ ...prev, confirm:  e.target.value })), [])

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Full name is required'
    if (!form.email.trim())   e.email   = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                               e.email   = 'Enter a valid email address'
    if (!form.password)       e.password = 'Password is required'
    else if (form.password.length < 6)
                               e.password = 'Password must be at least 6 characters'
    if (!form.confirm)        e.confirm  = 'Please confirm your password'
    else if (form.confirm !== form.password)
                               e.confirm  = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    try {
      registerUser({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      showToast('Account created! Please sign in. 🎉', 'success')
      onSwitch()   // redirect to login tab
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Full Name */}
      <Field id="signup-name" label="Full Name">
        <input
          id="signup-name"
          type="text"
          value={form.name}
          onChange={handleName}
          placeholder="Jane Smith"
          className={`pos-input ${errors.name ? 'error' : ''}`}
          autoComplete="name"
        />
        {errors.name && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#EF4444' }}>{errors.name}</p>}
      </Field>

      {/* Email */}
      <Field id="signup-email" label="Email Address">
        <input
          id="signup-email"
          type="email"
          value={form.email}
          onChange={handleEmail}
          placeholder="you@restaurant.com"
          className={`pos-input ${errors.email ? 'error' : ''}`}
          autoComplete="email"
        />
        {errors.email && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#EF4444' }}>{errors.email}</p>}
      </Field>

      {/* Password */}
      <Field id="signup-password" label="Password">
        <PasswordInput
          id="signup-password"
          value={form.password}
          onChange={handlePassword}
          placeholder="Min. 6 characters"
          error={!!errors.password}
        />
        {errors.password && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#EF4444' }}>{errors.password}</p>}
      </Field>

      {/* Confirm Password */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label
          htmlFor="signup-confirm"
          style={{
            display: 'block', marginBottom: '0.5rem',
            fontSize: '0.8125rem', fontWeight: 600,
            color: 'rgba(226,232,240,0.75)',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}
        >
          Confirm Password
        </label>
        <PasswordInput
          id="signup-confirm"
          value={form.confirm}
          onChange={handleConfirm}
          placeholder="Repeat your password"
          error={!!errors.confirm}
        />
        {errors.confirm && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#EF4444' }}>{errors.confirm}</p>}
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading
          ? <>
              <svg className="animate-spin-smooth" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Creating account…</span>
            </>
          : <span>Create Account</span>
        }
      </button>

      {/* Switch to login */}
      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'rgba(148,163,184,0.75)' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#F59E0B', fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem', fontWeight: 600,
          }}
        >
          Sign in →
        </button>
      </p>
    </form>
  )
}
