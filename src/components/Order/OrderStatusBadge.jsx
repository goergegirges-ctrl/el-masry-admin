import React from 'react';
import '../../css/AdminOrders.css';

const OrderStatusBadge = ({ status }) => {
  // Normalize status for CSS class mapping
  const getStatusClass = (statusStr) => {
    const s = statusStr.toLowerCase();
    if (s.includes('pending') || s.includes('processing')) return 'pending';
    if (s.includes('confirmed')) return 'confirmed';
    if (s.includes('out') || s.includes('shipped')) return 'out';
    if (s.includes('delivered')) return 'delivered';
    if (s.includes('cancelled')) return 'cancelled';
    return 'cancelled'; // Default fallback
  };

  const displayStatus = (statusStr) => {
    if (statusStr.toLowerCase().includes('out')) return 'Out for Delivery';
    return statusStr;
  };

  return (
    <span className={`status-badge-redesign ${getStatusClass(status)}`}>
      {displayStatus(status)}
    </span>
  );
};

export default OrderStatusBadge;
