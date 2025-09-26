import React, { useState } from 'react';
import ApiService from '../api';

const OrderForm = () => {
  const [order, setOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    packageType: '',
    priority: 'standard',
    specialInstructions: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await ApiService.createOrder(order);
      
      if (response.success) {
        setSuccess({
          message: 'Order created successfully!',
          orderId: response.data.orderId,
          trackingId: response.data.trackingId,
          estimatedDelivery: response.data.estimatedDelivery
        });
        
        // Reset form
        setOrder({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          pickupAddress: '',
          deliveryAddress: '',
          packageType: '',
          priority: 'standard',
          specialInstructions: ''
        });
      }
    } catch (err) {
      setError('Failed to create order. Please try again.');
      console.error('Order creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setOrder({
      ...order,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="order-form">
      <h2>Create New Order</h2>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success">
          <p><strong>{success.message}</strong></p>
          <p>Order ID: <strong>{success.orderId}</strong></p>
          <p>Tracking ID: <strong>{success.trackingId}</strong></p>
          <p>Estimated Delivery: <strong>{new Date(success.estimatedDelivery).toLocaleString()}</strong></p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerName">Customer Name:</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={order.customerName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="customerEmail">Customer Email:</label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={order.customerEmail}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="customerPhone">Customer Phone:</label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={order.customerPhone}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pickupAddress">Pickup Address:</label>
          <input
            type="text"
            id="pickupAddress"
            name="pickupAddress"
            value={order.pickupAddress}
            onChange={handleChange}
            placeholder="123 Main St, New York, NY 10001"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="deliveryAddress">Delivery Address:</label>
          <input
            type="text"
            id="deliveryAddress"
            name="deliveryAddress"
            value={order.deliveryAddress}
            onChange={handleChange}
            placeholder="456 Oak Ave, Brooklyn, NY 11201"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="packageType">Package Type:</label>
          <select
            id="packageType"
            name="packageType"
            value={order.packageType}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Package Type</option>
            <option value="document">Document</option>
            <option value="fragile">Fragile</option>
            <option value="standard">Standard</option>
            <option value="heavy">Heavy</option>
            <option value="electronics">Electronics</option>
            <option value="food">Food & Beverages</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={order.priority}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="standard">Standard (2-3 days)</option>
            <option value="express">Express (1-2 days)</option>
            <option value="urgent">Urgent (Same day)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="specialInstructions">Special Instructions:</label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            value={order.specialInstructions}
            onChange={handleChange}
            placeholder="Any special delivery instructions..."
            rows="3"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;