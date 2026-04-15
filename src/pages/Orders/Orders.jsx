import React, { useEffect, useState } from 'react'
import '../../css/AdminOrders.css'
import api from '../../utility/api';
import { toast } from 'react-toastify'
import { 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Truck, 
  Clock,
  ExternalLink 
} from 'lucide-react'
import OrderStatusBadge from '../../components/Order/OrderStatusBadge'
import { useNavigate } from 'react-router-dom'

const Orders = ({ url, token, setToken }) => {
    const [orders, setOrders] = useState([]);
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
                toast.success("Status Updated");
                await fetchAllOrders();
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    }

    useEffect(() => {
        if (token) fetchAllOrders();
    }, [token])

    return (
        <div className='admin-order-container'>
            <h2>Order Management</h2>
            <div className="order-grid">
                {orders.map((order, index) => (
                    <div key={index} className='order-card-redesign'>
                        {/* Row 1: Header */}
                        <div className="card-header-row">
                            <span className="order-id-label">Order #{order.id.slice(-8).toUpperCase()}</span>
                            <div className="order-date-label">
                                <Calendar size={14} />
                                {new Date(order.createdAt).toLocaleDateString('en-GB')}
                            </div>
                            <div className="status-dropdown-wrapper">
                                <select 
                                    className="status-dropdown-minimal"
                                    onChange={(e) => statusHandler(e, order.id)} 
                                    value={order.status.toLowerCase()}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="out for delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Customer Info */}
                        <div className="card-customer-row">
                            <div className="customer-detail-item">
                                <User size={16} className="text-cyan-600" />
                                <span className="font-semibold">{order.customer.firstName} {order.customer.lastName}</span>
                            </div>
                            <div className="customer-detail-item">
                                <Phone size={16} className="text-cyan-600" />
                                <span>{order.customer.phone}</span>
                            </div>
                            <div className="customer-detail-item">
                                <MapPin size={16} className="text-cyan-600" />
                                <span className="text-sm">{order.customer.city}، {order.customer.address}</span>
                            </div>
                        </div>

                        {/* Row 3: Summary Block */}
                        <div className="card-summary-row">
                            <div className="summary-grid">
                                <div className="summary-group">
                                    <span className="summary-label"><ShoppingBag size={12} inline /> Items: {order.items.length}</span>
                                    <span className="summary-value">Subtotal: {order.subtotal} EGP</span>
                                </div>
                                <div className="summary-group">
                                    <span className="summary-label"><Truck size={12} inline /> Delivery: {order.deliveryFee} EGP</span>
                                    <span className="summary-value text-cyan-700">Total: {order.subtotal + (order.deliveryFee || 0)} EGP</span>
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Actions */}
                        <div className="card-footer-row">
                            <button 
                                className="view-details-btn"
                                onClick={() => navigate(`/orders/${order.id}`)}
                            >
                                View Details
                            </button>
                            <div className="timestamp-label">
                                <Clock size={12} inline /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Orders

