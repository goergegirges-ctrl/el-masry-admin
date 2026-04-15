import React from 'react';
import '../../css/AdminOrders.css';

const OrderTimeline = ({ status }) => {
  const steps = [
    { id: 1, label: 'Order Placed', keys: ['pending', 'processing'] },
    { id: 2, label: 'Confirmed', keys: ['confirmed'] },
    { id: 3, label: 'Out for Delivery', keys: ['out for delivery', 'shipped'] },
    { id: 4, label: 'Delivered', keys: ['delivered'] }
  ];

  const getCurrentStep = (currentStatus) => {
    const s = currentStatus.toLowerCase();
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].keys.includes(s)) {
        return steps[i].id;
      }
    }
    return 1; // Default
  };

  const currentStepId = getCurrentStep(status);

  return (
    <div className="admin-timeline">
      {steps.map((step) => (
        <div 
          key={step.id} 
          className={`timeline-step ${step.id <= currentStepId ? 'active' : ''}`}
        >
          <div className="step-dot"></div>
          <span className="step-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
