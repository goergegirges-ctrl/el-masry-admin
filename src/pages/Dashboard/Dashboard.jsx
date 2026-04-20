import React, { useEffect, useState } from 'react'
import './Dashboard.css'
import api from '../../utility/api';
import { toast } from 'react-toastify'
import { TrendingUp, TrendingDown } from 'lucide-react';
import { assets } from '../../assets/assets'

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
    const [loading, setLoading] = useState(true);
    const [gaugeActive, setGaugeActive] = useState(false);

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
                } else if (status === 404) {
                    toast.error("Dashboard endpoint not found (404).");
                } else {
                    toast.error(`Server error (${status}): ${error.response.data?.message || "Unknown error"}`);
                }
            } else if (error.request) {
                toast.error("Cannot reach server. Is the backend running on port 4000?");
            } else {
                toast.error("Request error: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) fetchStats();
    }, [token]);

    useEffect(() => {
        if (!loading) {
            const id = requestAnimationFrame(() => setGaugeActive(true));
            return () => cancelAnimationFrame(id);
        }
    }, [loading]);

    const maxSales = Math.max(stats.recentSales, stats.previousSales, 1);
    const recentPct  = (stats.recentSales  / maxSales) * 100;
    const previousPct = (stats.previousSales / maxSales) * 100;
    const growthPositive = parseFloat(stats.growthRate) >= 0;

    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <div className='dashboard'>
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <span className="dashboard-date">{today}</span>
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
                    <span className="metric-label">Products</span>
                    {loading
                        ? <div className="skeleton metric-skel-md" />
                        : <div className="metric-value-md">{stats.totalProducts.toLocaleString()}</div>
                    }
                </div>

                <div className="metric-cell">
                    <span className="metric-label">Low Stock</span>
                    {loading
                        ? <div className="skeleton metric-skel-md" />
                        : <div className={`metric-value-md ${stats.lowStockCount > 0 ? 'alert' : ''}`}>
                            {stats.lowStockCount}
                          </div>
                    }
                    {!loading && stats.lowStockCount > 0 && (
                        <span className="metric-sub alert">needs attention</span>
                    )}
                </div>
            </div>

            <div className="section-divider">
                <span>Sales Comparison</span>
            </div>

            <div className="sales-comparison">
                <div className="gauge-row">
                    <span className="gauge-period">Prev. 30 Days</span>
                    {loading
                        ? <div className="skeleton gauge-amount-skel" />
                        : <span className="gauge-amount">{stats.previousSales.toLocaleString()} EGP</span>
                    }
                    <div className="gauge-track">
                        <div
                            className="gauge-fill prev"
                            style={{ width: gaugeActive ? `${previousPct}%` : '0%' }}
                        />
                    </div>
                </div>
                <div className="gauge-row">
                    <span className="gauge-period">Last 30 Days</span>
                    {loading
                        ? <div className="skeleton gauge-amount-skel" />
                        : <span className="gauge-amount accent">{stats.recentSales.toLocaleString()} EGP</span>
                    }
                    <div className="gauge-track">
                        <div
                            className="gauge-fill current"
                            style={{ width: gaugeActive ? `${recentPct}%` : '0%' }}
                        />
                    </div>
                </div>
            </div>

            <div className="section-divider">
                <span>Low Stock Alerts</span>
            </div>

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
    )
}

export default Dashboard
