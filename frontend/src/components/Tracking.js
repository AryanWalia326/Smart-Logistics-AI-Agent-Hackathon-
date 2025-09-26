import React, { useState } from 'react';
import ApiService from '../api';

const Tracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const response = await ApiService.trackOrder(trackingId);
      
      if (response.success) {
        setTrackingData(response.data);
      } else {
        setError('Order not found. Please check your tracking ID.');
      }
    } catch (err) {
      setError('Failed to fetch tracking information. Please try again.');
      console.error('Tracking failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracking">
      <h2>Track Your Order</h2>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleTrackingSubmit}>
        <div className="form-group">
          <label htmlFor="trackingId">Tracking ID:</label>
          <input
            type="text"
            id="trackingId"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            placeholder="Enter your tracking ID (e.g., TRK123456789)"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading || !trackingId.trim()}>
          {loading ? 'Tracking...' : 'Track Order'}
        </button>
      </form>

      {trackingData && (
        <div className="tracking-results">
          <h3>Order Status</h3>
          <div className="status-overview">
            <p><strong>Tracking ID:</strong> {trackingData.trackingId}</p>
            <p><strong>Order ID:</strong> {trackingData.orderId}</p>
            <p><strong>Current Status:</strong> <span className={`status-badge status-${trackingData.status.replace('_', '-')}`}>{trackingData.status.replace('_', ' ').toUpperCase()}</span></p>
            <p><strong>Current Location:</strong> {trackingData.currentLocation.address}</p>
            <p><strong>Estimated Delivery:</strong> {new Date(trackingData.estimatedDelivery).toLocaleString()}</p>
            {trackingData.currentLocation.coordinates && (
              <p><strong>GPS Coordinates:</strong> {trackingData.currentLocation.coordinates.lat}, {trackingData.currentLocation.coordinates.lng}</p>
            )}
          </div>

          <div className="timeline">
            <h4>Tracking Timeline</h4>
            {trackingData.timeline.map((event, index) => (
              <div key={index} className="timeline-event">
                <div className="event-status">{event.status}</div>
                <div className="event-details">
                  <p><strong>{event.location}</strong></p>
                  <p>{new Date(event.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="tracking-actions">
            <button 
              onClick={() => window.open(`https://maps.google.com/?q=${trackingData.currentLocation.coordinates?.lat},${trackingData.currentLocation.coordinates?.lng}`, '_blank')}
              className="btn-secondary"
              disabled={!trackingData.currentLocation.coordinates}
            >
              View on Map
            </button>
            <button 
              onClick={() => setTrackingData(null)}
              className="btn-secondary"
            >
              Track Another Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;