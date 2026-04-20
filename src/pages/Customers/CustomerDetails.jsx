import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utility/api';
import { toast } from 'react-toastify';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, ShoppingBag, CreditCard, Heart, TrendingUp } from 'lucide-react';
import './CustomerDetails.css';

const CustomerDetails = ({ url, token }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCustomerDetails = async () => {
        try {
            const response = await api.get(`/api/admin/customer/${id}`);
            if (response.data.success) {
                setCustomerData(response.data);
            } else {
                toast.error(response.data.message);
                navigate('/customers');
            }
        } catch (error) {
            console.error(error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error("Session expired — please log in again.");
                if (token && localStorage.getItem("admin_token")) {
                    localStorage.removeItem("admin_token");
                    window.location.reload(); // Force App to re-check token
                }
            } else {
                toast.error("Error fetching customer details");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCustomerDetails();
        }
    }, [id, token]);

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!customerData) return <div className="error-state">Customer not found</div>;

    const { customer, orders, stats } = customerData;

    return (
        <div className="customer-details-page">
            <div className="details-header">
                <button onClick={() => navigate('/customers')} className="back-btn">
                    <ArrowLeft size={20} /> Back to Customers
                </button>
                <h1>Customer Profile</h1>
            </div>

            <div className="details-grid">
                {/* Section 1: Customer Info */}
                <div className="details-card profile-card">
                    <h2><User size={20} /> Personal Information</h2>
                    <div className="info-item">
                        <User size={16} />
                        <span>{customer.firstName} {customer.lastName}</span>
                    </div>
                    <div className="info-item">
                        <Mail size={16} />
                        <span>{customer.email}</span>
                    </div>
                    <div className="info-item">
                        <Phone size={16} />
                        <span>{customer.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <Calendar size={16} />
                        <span>Joined: {new Date(customer.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                        <MapPin size={16} />
                        <span>{customer.savedAddresses?.find(a => a.isDefault)?.city || 'N/A'}</span>
                    </div>
                </div>

                {/* Section 2: Quick Stats */}
                <div className="details-card stats-card">
                    <h2><TrendingUp size={20} /> Purchase Behavior</h2>
                    <div className="stats-row">
                        <div className="stat-box">
                            <span className="stat-label">Total Orders</span>
                            <span className="stat-value">{stats.totalOrders}</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Total Spent</span>
                            <span className="stat-value">{stats.totalSpent.toLocaleString()} EGP</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">Avg. Order Value</span>
                            <span className="stat-value">{stats.avgOrderValue} EGP</span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Order History */}
                <div className="details-card full-width">
                    <h2><ShoppingBag size={20} /> Order History</h2>
                    <div className="order-history-list">
                        {orders.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id.slice(-6).toUpperCase()}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                                            </td>
                                            <td>{order.subtotal.toLocaleString()} EGP</td>
                                            <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data">No orders found for this customer.</p>
                        )}
                    </div>
                </div>

                {/* Section 4: Wishlist Products */}
                <div className="details-card full-width">
                    <h2><Heart size={20} /> Wishlist Products</h2>
                    <div className="wishlist-grid">
                        {customer.wishlist?.length > 0 ? (
                            customer.wishlist.map(product => (
                                <div key={product.id} className="wishlist-item">
                                    <img src={product.images[0]} alt={product.name} />
                                    <div className="wishlist-info">
                                        <h4>{product.name}</h4>
                                        <p>{product.price.toLocaleString()} EGP</p>
                                        <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No products in wishlist.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;
