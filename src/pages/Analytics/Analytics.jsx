import React, { useEffect, useState } from 'react'
import './Analytics.css'
import api from '../../utility/api'
import { toast } from 'react-toastify'
import {
    TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon,
    ShoppingBag, DollarSign, Heart, AlertTriangle, Users, RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CategorySalesChart from '../../components/Charts/CategorySalesChart'
import NetworkDiagnostics from '../../components/Analytics/Diagnostics/NetworkDiagnostics'
import { useChartColors } from '../../hooks/useChartColors'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar,
} from 'recharts'

const STATUS_COLORS = {
    pending:            '#F59E0B',
    confirmed:          '#2E86AB',
    'out for delivery': '#0077A6',
    delivered:          '#16A34A',
    cancelled:          '#DC2626',
}

const STATUS_LABELS = {
    pending:            'Pending',
    confirmed:          'Confirmed',
    'out for delivery': 'Out for Delivery',
    delivered:          'Delivered',
    cancelled:          'Cancelled',
}

const fmtDate = (iso) => {
    const d = new Date(iso)
    return `${d.getDate()}/${d.getMonth() + 1}`
}

const Analytics = ({ url, token, setToken }) => {
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        lowStockCount: 0,
        recentSales: 0,
        previousSales: 0,
        growthRate: '0.00',
    })
    const [wishlistPopular, setWishlistPopular] = useState([])
    const [bestSellers, setBestSellers] = useState([])
    const [salesByCategory, setSalesByCategory] = useState([])
    const [inventoryAlerts, setInventoryAlerts] = useState([])
    const [charts, setCharts] = useState(null)
    const [topCustomers, setTopCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sectionErrors, setSectionErrors] = useState({
        summary: false, wishlist: false, bestSellers: false,
        categories: false, inventory: false,
    })
    const chartColors = useChartColors()

    const handleAuthError = (err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            toast.error('Session expired — please log in again.')
            if (setToken) { setToken(''); localStorage.removeItem('admin_token') }
            return true
        }
        return false
    }

    const fetchAnalytics = async () => {
        setLoading(true)
        setError(null)
        setSectionErrors({ summary: false, wishlist: false, bestSellers: false, categories: false, inventory: false })

        const fetchSummary = async () => {
            try {
                const res = await api.get('/api/admin/analytics/summary')
                if (res.data.success) setSummary(res.data.data)
            } catch (err) {
                if (handleAuthError(err)) return
                setSectionErrors(p => ({ ...p, summary: true }))
            }
        }

        const fetchWishlist = async () => {
            try {
                const res = await api.get('/api/admin/analytics/wishlist-popular')
                if (res.data.success) setWishlistPopular(res.data.data)
            } catch (err) {
                if (handleAuthError(err)) return
                setSectionErrors(p => ({ ...p, wishlist: true }))
            }
        }

        const fetchBestSellers = async () => {
            try {
                const res = await api.get('/api/admin/analytics/best-sellers')
                if (res.data.success) setBestSellers(res.data.data)
            } catch (err) {
                if (handleAuthError(err)) return
                setSectionErrors(p => ({ ...p, bestSellers: true }))
            }
        }

        const fetchCategories = async () => {
            try {
                const res = await api.get('/api/admin/analytics/by-category')
                if (res.data.success) setSalesByCategory(res.data.data)
            } catch (err) {
                if (handleAuthError(err)) return
                setSectionErrors(p => ({ ...p, categories: true }))
            }
        }

        const fetchInventory = async () => {
            try {
                const res = await api.get('/api/admin/analytics/inventory-alerts')
                if (res.data.success) setInventoryAlerts(res.data.data)
            } catch (err) {
                if (handleAuthError(err)) return
                setSectionErrors(p => ({ ...p, inventory: true }))
            }
        }

        const fetchCharts = async () => {
            try {
                const res = await api.get('/api/admin/dashboard/charts')
                if (res.data.success) setCharts(res.data.data)
            } catch { /* non-critical */ }
        }

        const fetchTopCustomers = async () => {
            try {
                const res = await api.get('/api/admin/customers')
                if (res.data.success) {
                    const sorted = (res.data.customers || [])
                        .filter(c => (c.totalSpent || 0) > 0)
                        .sort((a, b) => b.totalSpent - a.totalSpent)
                        .slice(0, 5)
                    setTopCustomers(sorted)
                }
            } catch { /* non-critical */ }
        }

        try {
            await Promise.all([
                fetchSummary(), fetchWishlist(), fetchBestSellers(),
                fetchCategories(), fetchInventory(), fetchCharts(), fetchTopCustomers(),
            ])
        } catch (err) {
            setError(err.message)
            handleAuthError(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) fetchAnalytics()
    }, [token])

    const growthPositive = parseFloat(summary.growthRate) >= 0

    const SectionError = ({ msg }) => (
        <div className="section-error-msg">
            <AlertTriangle size={16} />
            <span>{msg || 'Failed to load this section.'}</span>
        </div>
    )

    const barData = bestSellers.slice(0, 10).map(p => ({
        name: p.name ? (p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name) : '—',
        revenue: p.revenueGenerated || 0,
    }))

    const tooltipStyle = {
        background: chartColors.surface,
        border: `1px solid ${chartColors.border}`,
        borderRadius: 8,
        fontSize: 12,
        color: chartColors.text,
    }

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Revenue, inventory, and sales data.</p>
                </div>
                <button onClick={fetchAnalytics} className="refresh-btn" disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="analytics-skeleton">
                    <div className="skel-kpi-strip">
                        {[1, 2, 3, 4].map(n => <div key={n} className="skel-kpi" />)}
                    </div>
                    <div className="skel-chart-row">
                        <div className="skel-chart-wide" />
                        <div className="skel-chart-narrow" />
                    </div>
                    <div className="skel-grid">
                        {[1, 2, 3, 4].map(n => <div key={n} className="skel-card" />)}
                    </div>
                </div>
            ) : error ? (
                <div className="analytics-error">
                    <div className="error-card">
                        <AlertTriangle size={48} className="error-icon" />
                        <h3>Analytics Unavailable</h3>
                        <p>{error}</p>
                        <NetworkDiagnostics backendUrl={url || 'http://localhost:4000'} />
                        <button onClick={fetchAnalytics} className="btn-retry">
                            <RefreshCw size={16} />
                            Retry
                        </button>
                    </div>
                </div>
            ) : (
                <div className="analytics-container">

                    {/* ── KPI Strip ─────────────────────────────────── */}
                    <div className="kpi-strip">
                        {sectionErrors.summary ? (
                            <SectionError msg="Summary unavailable" />
                        ) : (<>
                            <div className="kpi-card">
                                <DollarSign size={22} className="kpi-icon kpi-icon--revenue" />
                                <div>
                                    <p className="kpi-label">Total Revenue</p>
                                    <p className="kpi-value">
                                        {summary.totalRevenue.toLocaleString()}
                                        <small> EGP</small>
                                    </p>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <ShoppingBag size={22} className="kpi-icon kpi-icon--orders" />
                                <div>
                                    <p className="kpi-label">Total Orders</p>
                                    <p className="kpi-value">
                                        {summary.totalOrders}
                                        <small> Processed</small>
                                    </p>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <AlertTriangle size={22} className="kpi-icon kpi-icon--lowstock" />
                                <div>
                                    <p className="kpi-label">Low Stock Items</p>
                                    <p className="kpi-value">
                                        {summary.lowStockCount}
                                        <small> Items</small>
                                    </p>
                                </div>
                            </div>
                            <div className="kpi-card">
                                {growthPositive
                                    ? <TrendingUp size={22} className="kpi-icon kpi-icon--growth-pos" />
                                    : <TrendingDown size={22} className="kpi-icon kpi-icon--growth-neg" />
                                }
                                <div>
                                    <p className="kpi-label">Monthly Growth</p>
                                    <p className={`kpi-value ${growthPositive ? 'kpi-val--up' : 'kpi-val--down'}`}>
                                        {summary.growthRate}%
                                    </p>
                                </div>
                            </div>
                        </>)}
                    </div>

                    {/* ── Revenue over time + Orders by status ──────── */}
                    <div className="main-charts-grid">
                        <div className="extra-card extra-card--wide">
                            <div className="card-header">
                                <TrendingUp size={20} />
                                <h3>Revenue Over Time — Last 30 Days</h3>
                            </div>
                            {charts?.dailyRevenue?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart
                                        data={charts.dailyRevenue}
                                        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            stroke={chartColors.border}
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={fmtDate}
                                            tick={{ fill: chartColors.textLight, fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={4}
                                        />
                                        <YAxis
                                            tick={{ fill: chartColors.textLight, fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                            width={40}
                                        />
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            formatter={v => [`${Number(v).toLocaleString()} EGP`, 'Revenue']}
                                            labelFormatter={l => `Date: ${l}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke={chartColors.accent}
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4, fill: chartColors.accent }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty-msg">No revenue data for this period</div>
                            )}
                        </div>

                        <div className="extra-card">
                            <div className="card-header">
                                <PieChartIcon size={20} className="icon-cat" />
                                <h3>Orders by Status</h3>
                            </div>
                            {charts?.ordersByStatus?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={charts.ordersByStatus}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={72}
                                            paddingAngle={2}
                                        >
                                            {charts.ordersByStatus.map(entry => (
                                                <Cell
                                                    key={entry.status}
                                                    fill={STATUS_COLORS[entry.status] || '#8A9BA8'}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            formatter={(v, n) => [v, STATUS_LABELS[n] || n]}
                                        />
                                        <Legend
                                            formatter={value => (
                                                <span style={{ color: chartColors.textLight, fontSize: 11 }}>
                                                    {STATUS_LABELS[value] || value}
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty-msg">No order data available</div>
                            )}
                        </div>
                    </div>

                    {/* ── Product + Category + Customer grid ────────── */}
                    <div className="analytics-extra-grid">
                        {/* Top 10 Products horizontal bar */}
                        <div className="extra-card">
                            <div className="card-header">
                                <BarChart3 size={20} className="icon-best" />
                                <h3>Top 10 Products by Revenue</h3>
                            </div>
                            {sectionErrors.bestSellers ? <SectionError /> : barData.length > 0 ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height={Math.min(barData.length * 30 + 24, 320)}
                                >
                                    <BarChart
                                        data={barData}
                                        layout="vertical"
                                        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            stroke={chartColors.border}
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />
                                        <XAxis
                                            type="number"
                                            tick={{ fill: chartColors.textLight, fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fill: chartColors.text, fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={130}
                                        />
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            formatter={v => [`${Number(v).toLocaleString()} EGP`, 'Revenue']}
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill={chartColors.accent}
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty-msg">No sales data found</div>
                            )}
                        </div>

                        {/* Sales by Category */}
                        <div className="extra-card">
                            <div className="card-header">
                                <PieChartIcon size={20} className="icon-cat" />
                                <h3>Sales by Category</h3>
                            </div>
                            {sectionErrors.categories ? <SectionError /> : (
                                <CategorySalesChart data={salesByCategory} />
                            )}
                        </div>

                        {/* Top 5 Customers by spend */}
                        <div className="extra-card">
                            <div className="card-header">
                                <Users size={20} className="icon-ins" />
                                <h3>Top 5 Customers by Spend</h3>
                            </div>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Customer</th>
                                            <th>Orders</th>
                                            <th>Total Spent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topCustomers.map((c, i) => (
                                            <tr key={c.id}>
                                                <td>#{i + 1}</td>
                                                <td>
                                                    <Link to={`/customers/${c.id}`} className="customer-link">
                                                        {c.firstName} {c.lastName}
                                                    </Link>
                                                </td>
                                                <td>{c.totalOrders}</td>
                                                <td><b>{(c.totalSpent || 0).toLocaleString()} EGP</b></td>
                                            </tr>
                                        ))}
                                        {topCustomers.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="no-data">
                                                    No customer spend data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Most Wishlisted */}
                        <div className="extra-card">
                            <div className="card-header">
                                <Heart size={20} className="icon-wish" />
                                <h3>Most Wishlisted Products</h3>
                            </div>
                            {sectionErrors.wishlist ? <SectionError /> : (
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wishlistPopular.map((item, index) => (
                                                <tr key={item.product?.id || index}>
                                                    <td>#{index + 1}</td>
                                                    <td>{item.product?.name || 'Unknown'}</td>
                                                    <td>{item.product?.category || 'N/A'}</td>
                                                    <td><b>{item.wishlistCount}</b></td>
                                                </tr>
                                            ))}
                                            {wishlistPopular.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="no-data">
                                                        No wishlist data found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Customer Insights */}
                        <div className="extra-card">
                            <div className="card-header">
                                <Users size={20} className="icon-ins" />
                                <h3>
                                    Customer Insights
                                    <span className="card-header-note">(sample data)</span>
                                </h3>
                            </div>
                            <div className="insights-list">
                                <div className="insight-entry">
                                    <p>Repeat Customer Rate</p>
                                    <div className="p-bar">
                                        <div className="p-fill" style={{ width: '42%' }} />
                                    </div>
                                    <span>42% of customers order again</span>
                                </div>
                                <div className="insight-entry">
                                    <p>Peak Ordering Hours</p>
                                    <h3>8 PM – 11 PM</h3>
                                </div>
                                <div className="insight-entry">
                                    <p>Top City</p>
                                    <h3>Cairo</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Inventory Alerts ──────────────────────────── */}
                    <div className="extra-card inventory-card">
                        <div className="card-header">
                            <AlertTriangle size={20} className="icon-alert" />
                            <h3>Inventory Alerts (Stock &lt; 5)</h3>
                        </div>
                        {sectionErrors.inventory ? <SectionError /> : (
                            <div className="alerts-list">
                                {inventoryAlerts.length > 0 ? (
                                    inventoryAlerts.map(item => (
                                        <div key={item.id || item._id} className="alert-item">
                                            <Link
                                                to={`/products/edit/${item.id || item._id}`}
                                                className="alert-item-link"
                                            >
                                                {item.name}
                                            </Link>
                                            <b className={item.stock === 0 ? 'badge-out-of-stock' : 'badge-low-stock'}>
                                                {item.stock === 0 ? 'OUT OF STOCK' : `${item.stock} left`}
                                            </b>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-alerts">All inventory levels are healthy.</p>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}

export default Analytics
