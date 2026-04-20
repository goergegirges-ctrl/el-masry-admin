import React, { useEffect, useState } from 'react'
import './Analytics.css'
import api from '../../utility/api'
import { toast } from 'react-toastify'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, ShoppingBag, DollarSign, Heart, AlertTriangle, Users, RefreshCw } from 'lucide-react'
import CategorySalesChart from '../../components/Charts/CategorySalesChart'
import NetworkDiagnostics from '../../components/Analytics/Diagnostics/NetworkDiagnostics'

const Analytics = ({ url, token, setToken }) => {
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        lowStockCount: 0,
        recentSales: 0,
        previousSales: 0,
        growthRate: "0.00"
    });
    const [wishlistPopular, setWishlistPopular] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [salesByCategory, setSalesByCategory] = useState([]);
    const [inventoryAlerts, setInventoryAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sectionErrors, setSectionErrors] = useState({
        summary: false,
        wishlist: false,
        bestSellers: false,
        categories: false,
        inventory: false
    });

    const handleAuthError = (err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            toast.error("Session expired — please log in again.");
            if (setToken) {
                setToken("");
                localStorage.removeItem("admin_token");
            }
            return true;
        }
        return false;
    }

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            setSectionErrors({
                summary: false,
                wishlist: false,
                bestSellers: false,
                categories: false,
                inventory: false
            });

            // individual fetch functions to handle sectional errors
            const fetchSummary = async () => {
                try {
                    const res = await api.get(`/api/admin/analytics/summary`);
                    if (res.data.success) setSummary(res.data.data);
                } catch (err) {
                    if (handleAuthError(err)) return;
                    setSectionErrors(prev => ({ ...prev, summary: true }));
                    console.error("Summary fetch error:", err);
                }
            }

            const fetchWishlist = async () => {
                try {
                    const res = await api.get(`/api/admin/analytics/wishlist-popular`);
                    if (res.data.success) setWishlistPopular(res.data.data);
                } catch (err) {
                    if (handleAuthError(err)) return;
                    setSectionErrors(prev => ({ ...prev, wishlist: true }));
                }
            }

            const fetchBestSellers = async () => {
                try {
                    const res = await api.get(`/api/admin/analytics/best-sellers`);
                    if (res.data.success) setBestSellers(res.data.data);
                } catch (err) {
                    if (handleAuthError(err)) return;
                    setSectionErrors(prev => ({ ...prev, bestSellers: true }));
                }
            }

            const fetchCategories = async () => {
                try {
                    const res = await api.get(`/api/admin/analytics/by-category`);
                    if (res.data.success) setSalesByCategory(res.data.data);
                } catch (err) {
                    if (handleAuthError(err)) return;
                    setSectionErrors(prev => ({ ...prev, categories: true }));
                }
            }

            const fetchInventory = async () => {
                try {
                    const res = await api.get(`/api/admin/analytics/inventory-alerts`);
                    if (res.data.success) setInventoryAlerts(res.data.data);
                } catch (err) {
                    if (handleAuthError(err)) return;
                    setSectionErrors(prev => ({ ...prev, inventory: true }));
                }
            }

            await Promise.all([
                fetchSummary(),
                fetchWishlist(),
                fetchBestSellers(),
                fetchCategories(),
                fetchInventory()
            ]);

            // If ALL failed, it's likely a network error
            if (Object.values(sectionErrors).every(v => v === true)) {
                 setError("Critical Network Failure: Unable to connect to analytics services.");
            }

        } catch (err) {
            console.error("Critical analytics fetch error:", err);
            setError(err.message);
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchAnalytics();
        }
    }, [token]);

    const maxVal = Math.max(summary.recentSales, summary.previousSales, 1);

    const SectionError = ({ msg }) => (
        <div className="section-error-msg">
            <AlertTriangle size={16} />
            <span>{msg || "Failed to load this section."}</span>
        </div>
    )

    return (
        <div className='analytics-page'>
            <div className="analytics-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Revenue, inventory, and sales data.</p>
                </div>
                <button onClick={fetchAnalytics} className="refresh-btn" disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="skeleton-analytics">
                    <div className="skeleton-chart"></div>
                    <div className="skeleton-cards">
                        {[1, 2, 3].map(n => <div key={n} className="skeleton-card"></div>)}
                    </div>
                </div>
            ) : error ? (
                <div className="error-analytics">
                    <div className="error-card-main">
                        <AlertTriangle size={48} className="icon-error" />
                        <h3>Analytics Unavailable</h3>
                        <p>{error}</p>
                        <NetworkDiagnostics backendUrl={url || "http://localhost:4000"} />
                        <button onClick={fetchAnalytics} className="btn-retry">
                            <RefreshCw size={16} />
                            Retry Connectivity
                        </button>
                    </div>
                </div>
            ) : (
                <div className="analytics-container">
                    <div className="performance-overview">
                        <div className="chart-card">
                            <div className="card-header">
                                <BarChart3 size={20} />
                                <h3>Revenue Comparison (30-Day Periods)</h3>
                            </div>
                            {sectionErrors.summary ? <SectionError /> : (
                                <>
                                    <div className="bar-chart">
                                        <div className="bar-item">
                                            <div className="bar-wrapper">
                                                <div className="bar-fill prev" style={{ height: `${(summary.previousSales / maxVal) * 100}%` }}>
                                                    <span className="tooltip">{summary.previousSales.toLocaleString()} EGP</span>
                                                </div>
                                            </div>
                                            <span>Previous Month</span>
                                        </div>
                                        <div className="bar-item">
                                            <div className="bar-wrapper">
                                                <div className="bar-fill current" style={{ height: `${(summary.recentSales / maxVal) * 100}%` }}>
                                                    <span className="tooltip">{summary.recentSales.toLocaleString()} EGP</span>
                                                </div>
                                            </div>
                                            <span>Current Month</span>
                                        </div>
                                    </div>
                                    <div className="chart-info">
                                        <p>Monthly Revenue Trend</p>
                                        <div className={`growth-tag ${parseFloat(summary.growthRate) >= 0 ? 'up' : 'down'}`}>
                                            <TrendingUp size={16} />
                                            {summary.growthRate}% Growth
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="stats-side">
                            {sectionErrors.summary ? <SectionError msg="Summary unavailable" /> : (
                                <>
                                    <div className="stat-small-card">
                                        <DollarSign className='icon-rev' size={24} />
                                        <div>
                                            <p>Total Revenue</p>
                                            <h3>{summary.totalRevenue.toLocaleString()} <small>EGP</small></h3>
                                        </div>
                                    </div>
                                    <div className="stat-small-card">
                                        <ShoppingBag className='icon-ord' size={24} />
                                        <div>
                                            <p>Total Orders</p>
                                            <h3>{summary.totalOrders} <small>Processed</small></h3>
                                        </div>
                                    </div>
                                    <div className="stat-small-card">
                                        <PieChartIcon className='icon-pen' size={24} />
                                        <div>
                                            <p>Low Stock</p>
                                            <h3>{summary.lowStockCount} <small>Items</small></h3>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="analytics-extra-grid">
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
                                                <th>Rank</th>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Wishlists</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wishlistPopular.map((item, index) => (
                                                <tr key={item.product?._id || index}>
                                                    <td>#{index + 1}</td>
                                                    <td>{item.product?.name || 'Unknown'}</td>
                                                    <td>{item.product?.category || 'N/A'}</td>
                                                    <td><b>{item.wishlistCount}</b></td>
                                                </tr>
                                            ))}
                                            {wishlistPopular.length === 0 && (
                                                <tr><td colSpan="4" className="no-data">No wishlist data found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="extra-card">
                            <div className="card-header">
                                <ShoppingBag size={20} className="icon-best" />
                                <h3>Best Sellers</h3>
                            </div>
                            {sectionErrors.bestSellers ? <SectionError /> : (
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Units Sold</th>
                                                <th>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bestSellers.map((item, index) => (
                                                <tr key={item._id || index}>
                                                    <td>{item.name}</td>
                                                    <td><b>{item.unitsSold}</b></td>
                                                    <td>{item.revenueGenerated.toLocaleString()} EGP</td>
                                                </tr>
                                            ))}
                                            {bestSellers.length === 0 && (
                                                <tr><td colSpan="3" className="no-data">No sales data found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="extra-card">
                            <div className="card-header">
                                <PieChartIcon size={20} className="icon-cat" />
                                <h3>Sales by Category</h3>
                            </div>
                            {sectionErrors.categories ? <SectionError /> : (
                                <CategorySalesChart data={salesByCategory} />
                            )}
                        </div>

                        <div className="extra-card">
                            <div className="card-header">
                                <Users size={20} className="icon-ins" />
                                <h3>Customer Insights <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-light)' }}>(sample data)</span></h3>
                            </div>
                            <div className="insights-list">
                                <div className="insight-entry">
                                    <p>Repeat Customer Rate</p>
                                    <div className="p-bar"><div className="p-fill" style={{ width: '42%' }}></div></div>
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

                        <div className="extra-card inventory-card">
                            <div className="card-header">
                                <AlertTriangle size={20} className="icon-alert" />
                                <h3>Inventory Alerts (Stock &lt; 5)</h3>
                            </div>
                            {sectionErrors.inventory ? <SectionError /> : (
                                <div className="alerts-list">
                                    {inventoryAlerts.length > 0 ? inventoryAlerts.map(item => (
                                        <div key={item._id} className="alert-item">
                                            <span>{item.name}</span>
                                            <b className={item.stock === 0 ? 'out-of-stock' : 'low-stock'}>
                                                {item.stock === 0 ? 'OUT OF STOCK' : `${item.stock} left`}
                                            </b>
                                        </div>
                                    )) : <p className="no-alerts">All inventory levels are healthy.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Analytics
