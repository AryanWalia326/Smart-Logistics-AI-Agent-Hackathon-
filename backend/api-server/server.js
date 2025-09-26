const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data store (replace with actual database in production)
let orders = [];
let tracking = [];

// Helper functions
const generateTrackingId = () => 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
const generateOrderId = () => 'ORD-' + Date.now();

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create Order
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    const orderId = generateOrderId();
    const trackingId = generateTrackingId();
    
    const order = {
      orderId,
      trackingId,
      ...orderData,
      status: 'created',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          location: 'Online Platform'
        }
      ]
    };

    orders.push(order);
    
    // Create tracking entry
    tracking.push({
      trackingId,
      orderId,
      currentLocation: {
        address: 'Processing Center',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      status: 'created',
      timeline: order.timeline
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.orderId,
        trackingId: order.trackingId,
        customerName: order.customerName,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        packageType: order.packageType,
        priority: order.priority,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get Order by ID
app.get('/api/orders/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.find(o => o.orderId === orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Track Order
app.get('/api/tracking/:trackingId', (req, res) => {
  try {
    const { trackingId } = req.params;
    let trackingInfo = tracking.find(t => t.trackingId === trackingId);

    if (!trackingInfo) {
      return res.status(404).json({
        success: false,
        error: 'Tracking ID not found'
      });
    }

    // Simulate progress updates based on time
    const order = orders.find(o => o.trackingId === trackingId);
    if (order) {
      const hoursElapsed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
      
      if (hoursElapsed > 0.1) { // 6 minutes for demo
        trackingInfo.status = 'picked_up';
        trackingInfo.currentLocation = {
          address: 'Pickup Location',
          coordinates: { lat: 40.7589, lng: -73.9851 }
        };
        
        if (!trackingInfo.timeline.find(t => t.status === 'Picked Up')) {
          trackingInfo.timeline.push({
            status: 'Picked Up',
            timestamp: new Date(new Date(order.createdAt).getTime() + 6 * 60 * 1000).toISOString(),
            location: 'Pickup Location'
          });
        }
      }
      
      if (hoursElapsed > 0.2) { // 12 minutes for demo
        trackingInfo.status = 'in_transit';
        trackingInfo.currentLocation = {
          address: 'Distribution Center - Manhattan',
          coordinates: { lat: 40.7282, lng: -73.7949 }
        };
        
        if (!trackingInfo.timeline.find(t => t.status === 'In Transit')) {
          trackingInfo.timeline.push({
            status: 'In Transit',
            timestamp: new Date(new Date(order.createdAt).getTime() + 12 * 60 * 1000).toISOString(),
            location: 'Distribution Center - Manhattan'
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        trackingId: trackingInfo.trackingId,
        orderId: trackingInfo.orderId,
        status: trackingInfo.status,
        currentLocation: trackingInfo.currentLocation,
        estimatedDelivery: order ? order.estimatedDelivery : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeline: trackingInfo.timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      }
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get All Orders
app.get('/api/orders', (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    let filteredOrders = orders;

    if (status) {
      filteredOrders = orders.filter(o => o.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedOrders.map(order => ({
        orderId: order.orderId,
        customerName: order.customerName,
        status: order.status,
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
        priority: order.priority
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update Order Status
app.patch('/api/orders/:orderId/status', (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location } = req.body;

    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    // Update timeline
    orders[orderIndex].timeline.push({
      status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      timestamp: new Date().toISOString(),
      location: location || 'System Update'
    });

    // Update tracking info
    const trackingIndex = tracking.findIndex(t => t.orderId === orderId);
    if (trackingIndex !== -1) {
      tracking[trackingIndex].status = status;
      if (location) {
        tracking[trackingIndex].currentLocation.address = location;
      }
      tracking[trackingIndex].timeline = orders[orderIndex].timeline;
    }

    res.json({
      success: true,
      data: {
        orderId,
        status,
        location,
        updatedAt: orders[orderIndex].updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Route Optimization
app.post('/api/optimize-route', (req, res) => {
  try {
    const { orders: orderList } = req.body;

    // Simple route optimization simulation
    const optimizedRoute = orderList.map((order, index) => ({
      ...order,
      sequenceNumber: index + 1,
      estimatedTime: `${10 + index * 15} minutes`,
      distance: `${2.5 + index * 1.2} miles`
    }));

    const totalDistance = orderList.length * 3.2;
    const totalTime = orderList.length * 25;

    res.json({
      success: true,
      data: {
        optimizedRoute,
        totalDistance: `${totalDistance.toFixed(1)} miles`,
        totalTime: `${Math.floor(totalTime / 60)} hours ${totalTime % 60} minutes`,
        fuelCost: `$${(totalDistance * 0.8).toFixed(2)}`,
        efficiency: `${Math.min(95, 70 + orderList.length * 3)}%`
      }
    });
  } catch (error) {
    console.error('Error optimizing route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Analytics
app.get('/api/analytics', (req, res) => {
  try {
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const inTransitOrders = orders.filter(o => o.status === 'in_transit').length;
    const pendingOrders = orders.filter(o => o.status === 'created').length;

    res.json({
      success: true,
      data: {
        totalOrders,
        deliveredOrders,
        inTransitOrders,
        pendingOrders,
        averageDeliveryTime: '4.2 hours',
        onTimeDeliveryRate: '94.7%',
        customerSatisfaction: 4.6,
        costPerDelivery: '$8.50'
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Logistics API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});