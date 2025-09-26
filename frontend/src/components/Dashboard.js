import React, { useState, useEffect } from 'react';
import ApiService from '../api';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersResponse, analyticsResponse] = await Promise.all([
        ApiService.getOrders({ limit: 20 }),
        ApiService.getAnalytics()
      ]);

      if (ordersResponse.success) {
        setOrders(ordersResponse.data);
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await ApiService.updateOrderStatus(orderId, newStatus, 'Manual Update');
      
      if (response.success) {
        // Refresh orders list
        loadDashboardData();
        alert(`Order ${orderId} status updated to ${newStatus}`);
      }
    } catch (err) {
      alert('Failed to update order status');
      console.error('Status update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
        <button onClick={loadDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Logistics Dashboard</h2>

      {/* Analytics Overview */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Total Orders</h3>
            <div className="metric">{analytics.totalOrders}</div>
          </div>
          <div className="analytics-card">
            <h3>Delivered</h3>
            <div className="metric">{analytics.deliveredOrders}</div>
          </div>
          <div className="analytics-card">
            <h3>In Transit</h3>
            <div className="metric">{analytics.inTransitOrders}</div>
          </div>
          <div className="analytics-card">
            <h3>On-Time Rate</h3>
            <div className="metric">{analytics.onTimeDeliveryRate}</div>
          </div>
          <div className="analytics-card">
            <h3>Avg Delivery Time</h3>
            <div className="metric">{analytics.averageDeliveryTime}</div>
          </div>
          <div className="analytics-card">
            <h3>Cost per Delivery</h3>
            <div className="metric">{analytics.costPerDelivery}</div>
          </div>
        </div>
      )}

      {/* Orders Management */}
      <div className="orders-section">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <button onClick={loadDashboardData} className="btn-secondary">
            Refresh
          </button>
        </div>

        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.customerName}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge priority-${order.priority}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          updateOrderStatus(order.orderId, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="status-select"
                    >
                      <option value="">Update Status</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route Optimization Demo */}
      <div className="route-section">
        <h3>Route Optimization</h3>
        <button 
          onClick={async () => {
            try {
              const activeOrders = orders.filter(o => ['created', 'picked_up'].includes(o.status));
              if (activeOrders.length === 0) {
                alert('No active orders to optimize');
                return;
              }

              const response = await ApiService.optimizeRoute(activeOrders);
              if (response.success) {
                alert(`Route optimized!\nTotal Distance: ${response.data.totalDistance}\nTotal Time: ${response.data.totalTime}\nEfficiency: ${response.data.efficiency}`);
              }
            } catch (err) {
              alert('Route optimization failed');
              console.error('Route optimization error:', err);
            }
          }}
          className="btn-primary"
        >
          Optimize Active Routes
        </button>
      </div>
    </div>
  );
};

export default Dashboard;