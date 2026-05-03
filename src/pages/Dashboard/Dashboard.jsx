import React, { useEffect, useState } from 'react'
import './Dashboard.css'
import api from '../../utility/api';
import { toast } from 'react-toastify'
import { TrendingUp, TrendingDown } from 'lucide-react';
import { assets } from '../../assets/assets'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useChartColors } from '../../hooks/useChartColors';
import ExportButton from '../../components/ExportButton/ExportButton';

const STATUS_COLORS = {
    pending:          '#F59E0B',
    confirmed:        '#2E86AB',
    'out for delivery': '#0077A6',
    delivered:        '#16A34A',
    cancelled:        '#DC2626',
};

const STATUS_LABELS = {
    pending:            'Pending',
    confirmed:          'Confirmed',
    'out for delivery': 'Out for Delivery',
    delivered:          'Delivered',
    cancelled:          'Cancelled',
};

const fmtDate = (iso) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
};

const fmtEGP = (n) => Number(n).toLocaleString('en-EG');

const Dashboard = ({ url, token, setToken }) => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        growthRate: 0,
        recentSales: 0,
        previousSales: 0,
        lowStockCount: 0,
        lowStockItems: []
    });
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartsLoading, setChartsLoading] = useState(true);
    const [gaugeActive, setGaugeActive] = useState(false);
    const chartColors = useChartColors();

    const fetchStats = async () => {
        try {
            const response = await api.get(`/api/order/dashboard`);
            if (response.data.success) {
                setStats(response.data.stats);
            } else {
                toast.error(response.data.message || "Error fetching stats");
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    toast.error("Session expired — please log in again.");
                    if (setToken) {
                        localStorage.removeItem("admin_token");
                        localStorage.removeItem("admin_user");
                        setToken("");
                    }
                } else if (status === 403) {
                    toast.error(error.response.data?.message || "Access denied.");
                } else {
                    toast.error(`Server error (${status})`);
                }
            } else {
                toast.error("Cannot reach server.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCharts = async () => {
        try {
            const res = await api.get('/api/admin/dashboard/charts');
            if (res.data.success) setCharts(res.data.data);
        } catch {
            // non-critical — charts just won't render
        } finally {
            setChartsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchStats();
            fetchCharts();
        }
    }, [token]);

    useEffect(() => {
        if (!loading) {
            const id = requestAnimationFrame(() => setGaugeActive(true));
            return () => cancelAnimationFrame(id);
        }
    }, [loading]);

    const maxSales = Math.max(stats.recentSales, stats.previousSales, 1);
    const recentPct   = (stats.recentSales  / maxSales) * 100;
    const previousPct = (stats.previousSales / maxSales) * 100;
    const growthPositive = parseFloat(stats.growthRate) >= 0;

    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    const dashboardExportData = charts ? [
        { Metric: 'Total Revenue (EGP)', Value: stats.totalRevenue },
        { Metric: 'Total Orders', Value: stats.totalOrders },
        { Metric: 'Pending Orders', Value: stats.pendingOrders },
        { Metric: 'Total Products', Value: stats.totalProducts },
        { Metric: 'Avg Order Value (EGP)', Value: charts.avgOrderValue },
        { Metric: 'New Customers This Month', Value: charts.customerStats.thisMonth },
        { Metric: 'New Customers Last Month', Value: charts.customerStats.lastMonth },
    ] : [];

    return (
        <div className='dashboard'>
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="dashboard-header-right">
                    <span className="dashboard-date">{today}</span>
                    <ExportButton data={dashboardExportData} filename="dashboard-summary" sheetName="Dashboard" />
                </div>
            </div>

            <div className="metric-rail">
                <div className="metric-cell">
                    <span className="metric-label accent">Total Revenue</span>
                    {loading
                        ? <div className="skeleton metric-skel-lg" />
                        : <div className="metric-value-lg accent">
                            {stats.totalRevenue.toLocaleString()}
                            <span className="metric-currency">EGP</span>
                          </div>
                    }
                    {!loading && (
                        <div className={`metric-growth ${growthPositive ? 'pos' : 'neg'}`}>
                            {growthPositive
                                ? <TrendingUp size={12} strokeWidth={2.5} />
                                : <TrendingDown size={12} strokeWidth={2.5} />
                            }
                            <span>{Math.abs(parseFloat(stats.growthRate))}% this month</span>
                        </div>
                    )}
                </div>

                <div className="metric-cell">
                    <span className="metric-label">Total Orders</span>
                    {loading
                        ? <div className="skeleton metric-skel-md" />
                        : <div className="metric-value-md">{stats.totalOrders.toLocaleString()}</div>
                    }
                    {!loading && (
                        <span className="metric-sub">{stats.pendingOrders} pending</span>
                    )}
                </div>

                <div className="metric-cell">
                    <span className="metric-label">Avg Order Value</span>
                    {loading || chartsLoading
                        ? <div className="skeleton metric-skel-md" />
                        : <div className="metric-value-md">{charts ? fmtEGP(charts.avgOrderValue) : '—'}</div>
                    }
                    {!chartsLoading && <span className="metric-sub">EGP</span>}
                </div>

                <div className="metric-cell">
                    <span className="metric-label">New Customers</span>
                    {loading || chartsLoading
                        ? <div className="skeleton metric-skel-md" />
                        : <div className="metric-value-md">
                            {charts ? charts.customerStats.thisMonth : '—'}
                          </div>
                    }
                    {!chartsLoading && charts && (
                        <span className="metric-sub">
                            {charts.customerStats.lastMonth} last month
                        </span>
                    )}
                </div>
            </div>

            <div className="section-divider"><span>Sales Comparison</span></div>

            <div className="sales-comparison">
                <div className="gauge-row">
                    <span className="gauge-period">Prev. 30 Days</span>
                    {loading
                        ? <div className="skeleton gauge-amount-skel" />
                        : <span className="gauge-amount">{stats.previousSales.toLocaleString()} EGP</span>
                    }
                    <div className="gauge-track">
                        <div className="gauge-fill prev" style={{ width: gaugeActive ? `${previousPct}%` : '0%' }} />
                    </div>
                </div>
                <div className="gauge-row">
                    <span className="gauge-period">Last 30 Days</span>
                    {loading
                        ? <div className="skeleton gauge-amount-skel" />
                        : <span className="gauge-amount accent">{stats.recentSales.toLocaleString()} EGP</span>
                    }
                    <div className="gauge-track">
                        <div className="gauge-fill current" style={{ width: gaugeActive ? `${recentPct}%` : '0%' }} />
                    </div>
                </div>
            </div>

            {/* ── Chart grid ──────────────────────────────────────────── */}
            <div className="section-divider"><span>Analytics</span></div>

            <div className="chart-grid">
                {/* Daily Revenue Line Chart */}
                <div className="chart-card chart-card--wide">
                    <h3 className="chart-title">Daily Revenue — Last 30 Days</h3>
                    {chartsLoading ? (
                        <div className="skeleton chart-skel" />
                    ) : charts?.dailyRevenue?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={charts.dailyRevenue} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" vertical={false} />
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
                                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                                    width={40}
                                />
                                <Tooltip
                                    contentStyle={{ background: chartColors.surface, border: `1px solid ${chartColors.border}`, borderRadius: 8, fontSize: 12, color: chartColors.text }}
                                    formatter={v => [`${fmtEGP(v)} EGP`, 'Revenue']}
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
                        <div className="chart-empty">No revenue data for this period</div>
                    )}
                </div>

                {/* Orders by Status Donut */}
                <div className="chart-card">
                    <h3 className="chart-title">Orders by Status</h3>
                    {chartsLoading ? (
                        <div className="skeleton chart-skel" />
                    ) : charts?.ordersByStatus?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={charts.ordersByStatus}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={2}
                                >
                                    {charts.ordersByStatus.map((entry) => (
                                        <Cell
                                            key={entry.status}
                                            fill={STATUS_COLORS[entry.status] || '#8A9BA8'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: chartColors.surface, border: `1px solid ${chartColors.border}`, borderRadius: 8, fontSize: 12, color: chartColors.text }}
                                    formatter={(v, n) => [v, STATUS_LABELS[n] || n]}
                                />
                                <Legend
                                    formatter={(value) => <span style={{ color: chartColors.textLight, fontSize: 11 }}>{STATUS_LABELS[value] || value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="chart-empty">No order data</div>
                    )}
                </div>
            </div>

            {/* ── Top products + Recent orders ───────────────────────── */}
            <div className="chart-grid">
                {/* Top 5 Products */}
                <div className="chart-card">
                    <h3 className="chart-title">Top 5 Selling Products</h3>
                    {chartsLoading ? (
                        <div className="skeleton chart-skel" />
                    ) : charts?.topProducts?.length > 0 ? (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Units</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {charts.topProducts.map((p, i) => (
                                    <tr key={p.id}>
                                        <td className="dash-table-rank">{i + 1}</td>
                                        <td className="dash-table-name">{p.name || '—'}</td>
                                        <td>{p.unitsSold}</td>
                                        <td>{fmtEGP(p.revenue)} EGP</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="chart-empty">No sales data</div>
                    )}
                </div>

                {/* Recent 5 Orders */}
                <div className="chart-card">
                    <h3 className="chart-title">Recent Orders</h3>
                    {chartsLoading ? (
                        <div className="skeleton chart-skel" />
                    ) : charts?.recentOrders?.length > 0 ? (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {charts.recentOrders.map(o => (
                                    <tr key={o.id}>
                                        <td className="dash-table-name">{o.customerName}</td>
                                        <td>
                                            <span
                                                className="dash-status-chip"
                                                style={{
                                                    background: `${STATUS_COLORS[o.status] || '#8A9BA8'}18`,
                                                    color: STATUS_COLORS[o.status] || '#8A9BA8',
                                                }}
                                            >
                                                {STATUS_LABELS[o.status] || o.status}
                                            </span>
                                        </td>
                                        <td>{fmtEGP(o.subtotal)} EGP</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="chart-empty">No recent orders</div>
                    )}
                </div>
            </div>

            {/* ── Low stock ──────────────────────────────────────────── */}
            <div className="section-divider"><span>Low Stock Alerts</span></div>

            {loading ? (
                <div className="skeleton alert-skel" />
            ) : stats.lowStockCount > 0 ? (
                <div className="alert-list">
                    {stats.lowStockItems.map((item, index) => {
                        const productImg = (item.images && item.images.length > 0)
                            ? item.images[0]
                            : assets.upload_area;
                        return (
                            <div key={index} className="alert-row">
                                <img
                                    src={productImg}
                                    alt=""
                                    className="alert-avatar"
                                    onError={(e) => e.target.src = assets.upload_area}
                                />
                                <span className="alert-name">{item.name}</span>
                                <span className="stock-chip">{item.stock} left</span>
                                <a href={`/products/edit/${item.id}`} className="alert-edit">Edit →</a>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="alert-empty">All items are well stocked</div>
            )}
        </div>
    );
};

export default Dashboard;
