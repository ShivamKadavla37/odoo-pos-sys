import { useState, useMemo } from 'react'
import { usePOS } from '../../context/POSContext'
import { showToast } from '../../components/ui/Toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export default function ReportsPage() {
  const { orders, tables, products } = usePOS()

  // --- Filter State ---
  const [period, setPeriod] = useState('today') // today, week, month, all
  const [sessionFilter, setSessionFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')

  // --- Data Transformation ---
  const filteredOrders = useMemo(() => {
    const now = new Date()
    return orders.filter(o => {
      const d = new Date(o.createdAt || o.openedAt || now.getTime())
      
      // Period filter
      if (period === 'today') {
        if (d.toDateString() !== now.toDateString()) return false
      } else if (period === 'week') {
        const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24)
        if (diff > 7) return false
      } else if (period === 'month') {
        const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24)
        if (diff > 30) return false
      }

      // Session filter
      if (sessionFilter !== 'all' && o.sessionId !== sessionFilter) return false

      // Product filter
      if (productFilter !== 'all') {
        const hasProduct = o.items?.some(i => 
          i.productId === productFilter || 
          i.product?.id === productFilter || 
          i.id === productFilter
        )
        if (!hasProduct) return false
      }

      return true
    }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [orders, period, sessionFilter, productFilter])

  // --- KPIs ---
  const paidOrders = filteredOrders.filter(o => o.status === 'paid')
  const totalSales = paidOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)
  const ordersCount = paidOrders.length
  const avgOrderValue = ordersCount > 0 ? (totalSales / ordersCount).toFixed(2) : 0
  const activeTablesCount = tables.filter(t => t.status === 'occupied').length

  // --- Chart Data ---
  // Sales by hour
  const salesByHour = useMemo(() => {
    const now = new Date()
    const hours = Array(24).fill(0).map((_, i) => ({ name: `${i}:00`, sales: 0 }))
    paidOrders.forEach(o => {
      const d = new Date(o.createdAt || now.getTime())
      hours[d.getHours()].sales += (o.total ?? 0)
    })
    return hours.filter(h => h.sales > 0) // only show active hours
  }, [paidOrders])

  // Sales by category
  const salesByCategory = useMemo(() => {
    const cats = {}
    paidOrders.forEach(o => {
      o.items?.forEach(i => {
        const p = products.find(prod => prod.id === i.productId)
        const cat = p?.category || 'Uncategorized'
        cats[cat] = (cats[cat] || 0) + (i.price * i.qty)
      })
    })
    return Object.keys(cats).map(cat => ({ name: cat, value: cats[cat] }))
  }, [paidOrders, products])

  const COLORS = ['#6B21A8', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6']

  // --- Unique filter options ---
  const uniqueSessions = [...new Set(orders.map(o => o.sessionId).filter(Boolean))]

  const handleExport = (type) => {
    showToast(`Preparing ${type} export...`, 'info')
    
    setTimeout(() => {
      if (type === 'XLS') {
        const headers = ['Order ID', 'Table', 'Items Sold', 'Revenue', 'Payment Method', 'Status', 'Timestamp']
        const rows = filteredOrders.map(o => [
          `#${o.id.slice(-6).toUpperCase()}`,
          o.tableNumber ? `Table ${o.tableNumber}` : 'Takeaway',
          o.items?.reduce((acc, i) => acc + i.qty, 0) || 0,
          o.total ?? 0,
          o.paymentMethod || '-',
          o.status,
          formatTime(o.createdAt)
        ])
        
        const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n"
          + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `POS_Export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        showToast(`XLS/CSV downloaded successfully!`, 'success')
      } else if (type === 'PDF') {
        window.print()
        showToast(`PDF generation complete!`, 'success')
      }
    }, 400)
  }

  const formatTime = (iso) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          Reports & Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleExport('PDF')}
            style={{
              padding: '0.625rem 1rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.5rem',
              color: '#334155', fontFamily: "'Sora', sans-serif", fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s',
            }}
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => handleExport('XLS')}
            style={{
              padding: '0.625rem 1rem', background: '#10B981', border: 'none', borderRadius: '0.5rem',
              color: '#fff', fontFamily: "'Sora', sans-serif", fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'all 0.2s',
            }}
          >
            📊 Export XLS
          </button>
        </div>
      </div>

      {/* ── Dashboard Section ── */}
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#334155', margin: '0 0 -1rem' }}>KPI Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Total Sales Today',   value: `₹${totalSales.toLocaleString('en-IN')}`, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: '💰' },
          { label: 'Orders Today',        value: ordersCount.toString(),                 color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: '🛒' },
          { label: 'Active Tables',       value: activeTablesCount.toString(),           color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '🪑' },
          { label: 'Average Order Value', value: `₹${avgOrderValue}`,                    color: '#6B21A8', bg: 'rgba(107,33,168,0.1)', icon: '📈' },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: '0.75rem', background: kpi.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
            }}>
              {kpi.icon}
            </div>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#64748B', fontWeight: 600, margin: '0 0 0.25rem' }}>
                {kpi.label}
              </p>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                {kpi.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 1rem' }}>
            Sales by Hour
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            {salesByHour.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByHour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="sales" fill="#6B21A8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                No sales data yet
              </div>
            )}
          </div>
        </div>
        
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 1rem' }}>
            Sales by Category
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                No sales data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Reports Section ── */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        {/* Filter Bar */}
        <div style={{ padding: '1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>PERIOD</label>
            <select
              value={period} onChange={e => setPeriod(e.target.value)}
              style={{
                padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#1E293B'
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>SESSION</label>
            <select
              value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}
              style={{
                padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#1E293B'
              }}
            >
              <option value="all">All Sessions</option>
              {uniqueSessions.map(sid => (
                <option key={sid} value={sid}>{sid}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>PRODUCT</label>
            <select
              value={productFilter} onChange={e => setProductFilter(e.target.value)}
              style={{
                padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#1E293B'
              }}
            >
              <option value="all">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fff', borderBottom: '2px solid #F1F5F9' }}>
                {['Order ID', 'Table', 'Items', 'Total', 'Payment', 'Status', 'Time'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#6B21A8', fontWeight: 600 }}>#{o.id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#475569' }}>{o.tableNumber ? `Table ${o.tableNumber}` : 'Takeaway'}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#475569' }}>{o.items?.reduce((acc, i) => acc + i.qty, 0) || 0} items</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'Sora', sans-serif", fontSize: '0.875rem', color: '#1E293B', fontWeight: 700 }}>₹{o.total?.toLocaleString('en-IN') || 0}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#64748B', textTransform: 'capitalize' }}>{o.paymentMethod || '-'}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                        background: o.status === 'paid' ? 'rgba(16,185,129,0.1)' : o.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: o.status === 'paid' ? '#10B981' : o.status === 'cancelled' ? '#EF4444' : '#F59E0B',
                        textTransform: 'capitalize'
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#64748B' }}>{formatTime(o.createdAt)}</td>
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
