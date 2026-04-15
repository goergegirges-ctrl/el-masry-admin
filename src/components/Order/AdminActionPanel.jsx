import React, { useState } from 'react';
import '../../css/AdminOrders.css';
import { toast } from 'react-toastify';
import api from '../../utility/api';

const AdminActionPanel = ({ orderId, currentStatus, currentDeliveryFee, onUpdate }) => {
  const [status, setStatus] = useState(currentStatus);
  const [deliveryFee, setDeliveryFee] = useState(currentDeliveryFee || 0);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await api.put(`/api/order/update`, {
        id: orderId,
        status: status,
        deliveryFee: Number(deliveryFee)
      });

      if (response.data.success) {
        toast.success("Order Updated Successfully");
        if (onUpdate) onUpdate();
      } else {
        toast.error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Order update error:", error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detail-card">
      <div className="detail-card-header">
        <h3>Admin Controls</h3>
      </div>
      <div className="detail-card-body">
        <div className="admin-actions-grid">
          <div className="action-input-group">
            <label>Order Status</label>
            <select 
              className="admin-input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="action-input-group">
            <label>Delivery Fee (EGP)</label>
            <input 
              type="number"
              className="admin-input-field"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>
        </div>
        
        <button 
          className="admin-save-btn"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AdminActionPanel;
