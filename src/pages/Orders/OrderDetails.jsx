import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../../css/AdminOrders.css';
import api from '../../utility/api';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import OrderTimeline from '../../components/Order/OrderTimeline';
import OrderStatusBadge from '../../components/Order/OrderStatusBadge';
import AdminActionPanel from '../../components/Order/AdminActionPanel';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/order/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        toast.error("Order not found");
        navigate('/orders');
      }
    } catch (error) {
      console.error("Fetch order error:", error);
      toast.error("Error loading order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (loading) return <div className="admin-order-container">Loading details...</div>;
  if (!order) return <div className="admin-order-container">Order not found.</div>;

  return (
    <div className="admin-order-container">
      <div className="detail-header-nav">
        <button onClick={() => navigate('/orders')} className="back-link">
          <ArrowLeft size={18} /> Back to Orders
        </button>
        <div className="header-meta">
          <h2>Order #{order.id.slice(-8).toUpperCase()}</h2>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="admin-order-detail-container">
        {/* Row 1: Timeline (Visual Progress) */}
        <div className="detail-card">
          <div className="detail-card-body">
            <OrderTimeline status={order.status} />
          </div>
        </div>

        {/* Row 2: Customer & Summary Grid */}
        <div className="admin-actions-grid" style={{ marginBottom: '2rem' }}>
          {/* Customer Info Card */}
          <div className="detail-card" style={{ marginBottom: 0 }}>
            <div className="detail-card-header">
              <h3>Customer Information</h3>
            </div>
            <div className="detail-card-body">
              <div className="card-customer-row" style={{ border: 'none', padding: 0 }}>
                <div className="customer-detail-item">
                  <User size={18} color="#00B4D8" />
                  <span className="font-bold">{order.customer.firstName} {order.customer.lastName}</span>
                </div>
                <div className="customer-detail-item">
                  <Phone size={18} color="#00B4D8" />
                  <span>{order.customer.phone}</span>
                </div>
                <div className="customer-detail-item">
                  <MapPin size={18} color="#00B4D8" />
                  <span>{order.customer.city}، {order.customer.address}</span>
                </div>
                {order.customer.email && (
                  <Link 
                    to={`/customers/${order.customer.email}`}
                    className="view-details-btn"
                    style={{ marginTop: '1rem', textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  >
                    View Customer Profile <ExternalLink size={14} />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Finance Overview Card */}
          <div className="detail-card" style={{ marginBottom: 0 }}>
            <div className="detail-card-header">
              <h3>Financial Summary</h3>
            </div>
            <div className="detail-card-body">
              <div className="summary-group" style={{ gap: '12px' }}>
                <div className="finance-row" style={{ fontSize: '1rem' }}>
                  <span>Subtotal</span>
                  <span className="font-semibold">{order.subtotal} EGP</span>
                </div>
                <div className="finance-row" style={{ fontSize: '1rem' }}>
                  <span>Delivery Fee</span>
                  <span className="font-semibold">{order.deliveryFee || 0} EGP</span>
                </div>
                <div className="finance-row" style={{ fontSize: '1.25rem', borderTop: '2px dashed #e2e8f0', paddingTop: '12px', marginTop: '4px', color: '#0A1628' }}>
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold text-cyan-600">{order.subtotal + (order.deliveryFee || 0)} EGP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Admin Controls */}
        <AdminActionPanel 
          orderId={order.id} 
          currentStatus={order.status} 
          currentDeliveryFee={order.deliveryFee} 
          onUpdate={fetchOrderDetails} 
        />

        {/* Row 4: Products Table */}
        <div className="detail-card">
          <div className="detail-card-header">
            <h3>Products ({order.items.length})</h3>
          </div>
          <div className="detail-card-body" style={{ padding: 0 }}>
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td data-label="Product" className="font-semibold">{item.name}</td>
                    <td data-label="Quantity">x{item.quantity}</td>
                    <td data-label="Price">{item.price} EGP</td>
                    <td data-label="Total" className="font-bold">{item.price * item.quantity} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
