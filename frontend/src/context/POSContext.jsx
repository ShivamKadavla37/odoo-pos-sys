import { createContext, useContext, useState, useEffect } from 'react'

const POSContext = createContext(null)

export function POSProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_current_user')) ?? null }
    catch { return null }
  })

  // ── Session ───────────────────────────────────────────────────────────────
  const [currentSession, setCurrentSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_session')) ?? null }
    catch { return null }
  })

  // ── Session History ───────────────────────────────────────────────────────
  const [sessionHistory, setSessionHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_session_history')) ?? [] }
    catch { return [] }
  })

  // ── Floors ────────────────────────────────────────────────────────────────
  const [floors, setFloors] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pos_floors'))
      if (saved && saved.length > 0) return saved
      return [{ id: 'root-floor', name: 'Ground Floor' }]
    } catch { return [{ id: 'root-floor', name: 'Ground Floor' }] }
  })

  // ── Tables ────────────────────────────────────────────────────────────────
  const [tables, setTables] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pos_tables'))
      if (saved && saved.length > 0) return saved
      return [
        { id: crypto.randomUUID(), number: 1, seats: 4, status: 'free', floorId: 'root-floor', active: true },
        { id: crypto.randomUUID(), number: 2, seats: 4, status: 'free', floorId: 'root-floor', active: true },
        { id: crypto.randomUUID(), number: 3, seats: 4, status: 'free', floorId: 'root-floor', active: true },
        { id: crypto.randomUUID(), number: 4, seats: 4, status: 'free', floorId: 'root-floor', active: true },
        { id: crypto.randomUUID(), number: 5, seats: 4, status: 'free', floorId: 'root-floor', active: true },
        { id: crypto.randomUUID(), number: 6, seats: 4, status: 'free', floorId: 'root-floor', active: true },
      ]
    } catch { return [] }
  })

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_orders')) ?? [] }
    catch { return [] }
  })

  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pos_products'))
      if (saved && saved.length > 0) return saved
      const seeded = [
        { id: crypto.randomUUID(), name: 'Pizza', category: 'Food', price: 280, tax: '5%', unit: 'plate', active: true, desc: '', variants: [] },
        { id: crypto.randomUUID(), name: 'Pasta', category: 'Food', price: 220, tax: '5%', unit: 'plate', active: true, desc: '', variants: [] },
        { id: crypto.randomUUID(), name: 'Burger', category: 'Food', price: 180, tax: '5%', unit: 'piece', active: true, desc: '', variants: [] },
        { id: crypto.randomUUID(), name: 'Coffee', category: 'Beverage', price: 80, tax: '5%', unit: 'piece', active: true, desc: '', variants: [] },
        { id: crypto.randomUUID(), name: 'Water', category: 'Beverage', price: 30, tax: '0%', unit: 'litre', active: true, desc: '', variants: [] },
      ]
      return seeded
    } catch { return [] }
  })

  // ── Kitchen Orders ────────────────────────────────────────────────────────
  const [kitchenOrders, setKitchenOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_kitchen_orders')) ?? [] }
    catch { return [] }
  })

  // ── Payment Methods ───────────────────────────────────────────────────────
  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pos_payment_methods')) ?? {
        cash: true, digital: true, upi: true, upiId: ''
      }
    } catch { return { cash: true, digital: true, upi: true, upiId: '' } }
  })

  // ── Self Ordering Tokens ──────────────────────────────────────────────────
  const [selfOrderTokens, setSelfOrderTokens] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_self_order_tokens')) ?? [] }
    catch { return [] }
  })

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    if (currentUser) localStorage.setItem('pos_current_user', JSON.stringify(currentUser))
    else localStorage.removeItem('pos_current_user')
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem('pos_session', JSON.stringify(currentSession))
  }, [currentSession])

  useEffect(() => {
    localStorage.setItem('pos_floors', JSON.stringify(floors))
  }, [floors])

  useEffect(() => {
    localStorage.setItem('pos_tables', JSON.stringify(tables))
  }, [tables])

  useEffect(() => {
    localStorage.setItem('pos_orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('pos_kitchen_orders', JSON.stringify(kitchenOrders))
  }, [kitchenOrders])

  useEffect(() => {
    localStorage.setItem('pos_payment_methods', JSON.stringify(paymentMethods))
  }, [paymentMethods])

  useEffect(() => {
    localStorage.setItem('pos_self_order_tokens', JSON.stringify(selfOrderTokens))
  }, [selfOrderTokens])

  useEffect(() => {
    localStorage.setItem('pos_session_history', JSON.stringify(sessionHistory))
  }, [sessionHistory])

  // ── Sync across tabs (Crucial for Customer & Kitchen Displays) ────────────
  useEffect(() => {
    const handleStorage = (e) => {
      try {
        if (!e.newValue) return
        switch (e.key) {
          case 'pos_orders': return setOrders(JSON.parse(e.newValue))
          case 'pos_kitchen_orders': return setKitchenOrders(JSON.parse(e.newValue))
          case 'pos_session': return setCurrentSession(JSON.parse(e.newValue))
          case 'pos_tables': return setTables(JSON.parse(e.newValue))
          case 'pos_floors': return setFloors(JSON.parse(e.newValue))
        }
      } catch {}
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // ── Auth helpers ──────────────────────────────────────────────────────────
  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem('pos_users')) ?? [] }
    catch { return [] }
  }

  const registerUser = (userData) => {
    const users = getUsers()
    const exists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())
    if (exists) throw new Error('An account with this email already exists.')
    const newUser = { id: crypto.randomUUID(), ...userData, createdAt: new Date().toISOString() }
    localStorage.setItem('pos_users', JSON.stringify([...users, newUser]))
    return newUser
  }

  const loginUser = (email, password) => {
    const users = getUsers()
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) throw new Error('Invalid email or password.')
    const { password: _p, ...safeUser } = user
    setCurrentUser(safeUser)
    return safeUser
  }

  const logoutUser = () => {
    setCurrentUser(null)
    setCurrentSession(null)
  }

  // ── Session helpers ───────────────────────────────────────────────────────
  const openSession = (cashierName) => {
    const session = {
      id: crypto.randomUUID(),
      cashier: cashierName,
      openedAt: new Date().toISOString(),
      status: 'open',
      totalSales: 0,
    }
    setCurrentSession(session)
    return session
  }

  const closeSession = () => {
    if (!currentSession) return
    const totalSales = orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + (o.total ?? 0), 0)
    const closed = {
      ...currentSession,
      status: 'closed',
      closedAt: new Date().toISOString(),
      totalSales,
    }
    setSessionHistory(prev => [closed, ...prev])
    setCurrentSession(null)
    return closed
  }

  const value = {
    currentUser, setCurrentUser,
    currentSession, setCurrentSession,
    sessionHistory, setSessionHistory,
    floors, setFloors,
    tables, setTables,
    orders, setOrders,
    products, setProducts,
    kitchenOrders, setKitchenOrders,
    paymentMethods, setPaymentMethods,
    selfOrderTokens, setSelfOrderTokens,
    registerUser, loginUser, logoutUser,
    openSession, closeSession,
  }

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

export const usePOS = () => {
  const ctx = useContext(POSContext)
  if (!ctx) throw new Error('usePOS must be used inside <POSProvider>')
  return ctx
}
