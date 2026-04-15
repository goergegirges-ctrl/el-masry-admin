import React, { useEffect, useState } from 'react'
import './Dashboard.css'
import api from '../../utility/api';
import { toast } from 'react-toastify'
import { Package, ListOrdered, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
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

    const fetchStats = async () => {
        try {
            console.log("Fetching Dashboard Stats...");
            const response = await api.get(`/api/order/dashboard`);
            console.log("Dashboard API response:", response.data);

            if (response.data.success) {
                setStats(response.data.stats);
            } else {
                toast.error(response.data.message || "Error fetching stats");
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            if (error.response) {
                const status = error.response.status;
                if (status === 401 || status === 403) {
                    toast.error("Session expired. Please login again.");
                    if (setToken) {
                        localStorage.removeItem("admin_token");
                        setToken("");
                    }
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
        if (token) {
            fetchStats();
        }
    }, [token]);

    return (
        <div className='dashboard'>
            <h1>Admin Dashboard</h1>

            <div className="dashboard-stats">
                {/* Revenue Card */}
                <div className="stat-card revenue">
                    <div className="stat-icon-bg"><DollarSign size={24} color="#16a34a" /></div>
                    <div className="stat-info">
                        <p className="stat-label">Total Revenue</p>
                        {loading ? <div className="skeleton-text short"></div> : (
                            <>
                                <h3>{stats.totalRevenue.toLocaleString()} <span className="currency">EGP</span></h3>
                                <div className={`growth-indicator ${parseFloat(stats.growthRate) >= 0 ? 'positive' : 'negative'}`}>
                                    <TrendingUp size={14} />
                                    <span>{stats.growthRate}% monthly</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Orders Card */}
                <div className="stat-card orders">
                    <div className="stat-icon-bg"><ListOrdered size={24} color="#0B3C5D" /></div>
                    <div className="stat-info">
                        <p className="stat-label">Total Orders</p>
                        {loading ? <div className="skeleton-text short"></div> : <h3>{stats.totalOrders}</h3>}
                        <p className="sub-stat">{stats.pendingOrders} pending</p>
                    </div>
                </div>

                {/* Products Card */}
                <div className="stat-card products">
                    <div className="stat-icon-bg"><Package size={24} color="#1F7A8C" /></div>
                    <div className="stat-info">
                        <p className="stat-label">Total Products</p>
                        {loading ? <div className="skeleton-text short"></div> : <h3>{stats.totalProducts}</h3>}
                    </div>
                </div>

                {/* Low Stock Card */}
                <div className="stat-card alert">
                    <div className="stat-icon-bg"><AlertCircle size={24} color="#DC2626" /></div>
                    <div className="stat-info">
                        <p className="stat-label">Low Stock Alerts</p>
                        {loading ? <div className="skeleton-text short"></div> : <h3 className={stats.lowStockCount > 0 ? 'text-danger' : ''}>{stats.lowStockCount}</h3>}
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="analytics-section">
                    <h2>Sales Performance</h2>
                    {loading ? (
                        <div className="skeleton-table"></div>
                    ) : (
                        <div className="sales-chart-container">
                            <div className="chart-bars">
                                <div className="chart-bar-group">
                                    <div className="bar previous" style={{ height: `${(stats.recentSales === 0 && stats.previousSales === 0) ? 20 : (stats.previousSales / (Math.max(stats.recentSales, stats.previousSales) || 1) * 100)}%` }}></div>
                                    <span>Prev. 30 Days</span>
                                </div>
                                <div className="chart-bar-group">
                                    <div className="bar current" style={{ height: `${(stats.recentSales === 0 && stats.previousSales === 0) ? 20 : (stats.recentSales / (Math.max(stats.recentSales, stats.previousSales) || 1) * 100)}%` }}></div>
                                    <span>Last 30 Days</span>
                                </div>
                            </div>
                            <div className="chart-legend">
                                <p>Monthly comparison showing revenue movement.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="low-stock-section">
                    <h2>Low Stock Items (Stock &lt; 5)</h2>
                    {loading ? (
                        <div className="skeleton-table"></div>
                    ) : stats.lowStockCount > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Stock</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.lowStockItems.map((item, index) => {
                                        const productImg = (item.images && item.images.length > 0)
                                            ? item.images[0]
                                            : assets.upload_area;

                                        return (
                                            <tr key={index}>
                                                <td><img src={productImg} alt="" className='list-img' onError={(e) => e.target.src = assets.upload_area} /></td>
                                                <td>{item.name}</td>
                                                <td><span className='stock-badge low'>{item.stock}</span></td>
                                                <td><a href={`/products/edit/${item.id}`} className="edit-link">Edit</a></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>All items are well stocked!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
