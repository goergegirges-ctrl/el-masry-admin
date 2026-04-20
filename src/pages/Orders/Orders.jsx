import React, { useEffect, useState, useMemo } from 'react'
import '../../css/AdminOrders.css'
import api from '../../utility/api';
import { toast } from 'react-toastify'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const STATUS_OPTS = [
    { value: 'all',              label: 'All Statuses' },
    { value: 'pending',          label: 'Pending' },
    { value: 'confirmed',        label: 'Confirmed' },
    { value: 'out for delivery', label: 'Out for Delivery' },
    { value: 'delivered',        label: 'Delivered' },
    { value: 'cancelled',        label: 'Cancelled' },
]

const statusSlug = (s) => s.toLowerCase().replace(/\s+/g, '-')

const Orders = ({ url, token, setToken }) => {
    const [orders, setOrders]           = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    const fetchAllOrders = async () => {
        try {
            const response = await api.get(`/api/order/list`);
            if (response.data.success) {
                setOrders(response.data.data.reverse());
            } else {
                toast.error(response.data.message || "Error fetching orders");
            }
        } catch (error) {
            console.error("Orders fetch error:", error);
            if (error.response?.status === 401) {
                setToken("");
                localStorage.removeItem("admin_token");
            }
            toast.error("Error fetching orders");
        }
    }

    const statusHandler = async (event, orderId) => {
        try {
            const response = await api.put(`/api/order/update`, { id: orderId, status: event.target.value });
            if (response.data.success) {
                toast.success("Status updated");
                await fetchAllOrders();
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    }

    useEffect(() => {
        if (token) fetchAllOrders();
    }, [token])

    const filteredOrders = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return orders.filter(order => {
            const matchesSearch = !q || [
                order.id,
                order.customer?.firstName,
                order.customer?.lastName,
                order.customer?.phone,
                order.customer?.city,
            ].some(v => v?.toString().toLowerCase().includes(q));

            const matchesStatus = statusFilter === 'all'
                || order.status.toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    return (
        <div className='admin-order-container'>
            <div className="order-page-header">
                <div>
                    <h2>Orders</h2>
                    <span className="order-total-count">{filteredOrders.length} of {orders.length}</span>
                </div>
            </div>

            <div className="order-filters">
                <div className="order-search-wrap">
                    <Search size={16} className="order-search-icon" />
                    <input
                        type="text"
                        className="order-search-input"
                        placeholder="Search by name, phone, or order ID…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="order-search-clear" onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <select
                    className="order-status-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    {STATUS_OPTS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            <div className="order-table-wrapper">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>City</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="order-row">
                                <td className="order-id-cell">
                                    #{order.id.slice(-8).toUpperCase()}
                                </td>
                                <td className="order-date-cell" title={new Date(order.createdAt).toLocaleString()}>
                                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </td>
                                <td className="order-customer-cell">
                                    <div className="oc-name">
                                        {order.customer.firstName} {order.customer.lastName}
                                    </div>
                                    <div className="oc-phone">{order.customer.phone}</div>
                                </td>
                                <td className="order-city-cell">{order.customer.city}</td>
                                <td className="order-items-cell">{order.items.length}</td>
                                <td className="order-total-cell">
                                    {(order.subtotal + (order.deliveryFee || 0)).toLocaleString()} EGP
                                </td>
                                <td className="order-status-cell">
                                    <select
                                        className={`order-status-sel ss-${statusSlug(order.status)}`}
                                        onChange={(e) => statusHandler(e, order.id)}
                                        value={order.status.toLowerCase()}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="out for delivery">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="order-action-cell">
                                    <button
                                        className="order-view-btn"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        View →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className="order-empty">
                        {orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders
