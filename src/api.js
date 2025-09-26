const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const MOCK_MODE = process.env.REACT_APP_MOCK_API === 'true' || true; // Enable mock mode for demo

class ApiService {
  constructor() {
    this.authToken = localStorage.getItem('authToken');
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createOrder(orderData) {
    if (MOCK_MODE) {
      return this.mockCreateOrder(orderData);
    }

    return this.makeRequest(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  mockCreateOrder(orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = 'ORD-' + Date.now();
        const trackingId = 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        resolve({
          success: true,
          data: {
            orderId,
            trackingId,
            customerName: orderData.customerName,
            status: 'created',
            estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            pickupAddress: orderData.pickupAddress,
            deliveryAddress: orderData.deliveryAddress,
            packageType: orderData.packageType,
            priority: orderData.priority,
            createdAt: new Date().toISOString(),
          }
        });
      }, 1000);
    });
  }

  async getOrderStatus(orderId) {
    if (MOCK_MODE) {
      return this.mockGetOrderStatus(orderId);
    }

    return this.makeRequest(`${API_BASE_URL}/orders/${orderId}`);
  }

  async trackOrder(trackingId) {
    if (MOCK_MODE) {
      return this.mockTrackOrder(trackingId);
    }

    return this.makeRequest(`${API_BASE_URL}/tracking/${trackingId}`);
  }

  mockGetOrderStatus(orderId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            orderId,
            status: 'in_transit',
            currentLocation: 'Distribution Center - Manhattan',
            estimatedDelivery: '2025-09-27T14:30:00Z',
            driver: {
              name: 'John Driver',
              phone: '+1-555-0123',
              vehicle: 'VAN-001'
            },
            timeline: [
              { status: 'Order Placed', timestamp: '2025-09-26T09:00:00Z', location: 'Online Platform' },
              { status: 'Order Confirmed', timestamp: '2025-09-26T09:15:00Z', location: 'Processing Center' },
              { status: 'Picked Up', timestamp: '2025-09-26T11:00:00Z', location: 'Pickup Location' },
              { status: 'In Transit', timestamp: '2025-09-26T15:00:00Z', location: 'Distribution Center - Manhattan' },
            ]
          }
        });
      }, 1500);
    });
  }

  mockTrackOrder(trackingId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            trackingId,
            orderId: 'ORD-' + trackingId.replace('TRK', ''),
            status: 'in_transit',
            currentLocation: {
              address: 'Distribution Center - Manhattan',
              coordinates: { lat: 40.7128, lng: -74.0060 }
            },
            estimatedDelivery: '2025-09-27T14:30:00Z',
            timeline: [
              { status: 'Order Placed', timestamp: '2025-09-26T09:00:00Z', location: 'Online Platform' },
              { status: 'Picked Up', timestamp: '2025-09-26T11:00:00Z', location: 'Pickup Location' },
              { status: 'In Transit', timestamp: '2025-09-26T15:00:00Z', location: 'Distribution Center - Manhattan' },
            ]
          }
        });
      }, 1500);
    });
  }

  async optimizeRoute(orders) {
    if (MOCK_MODE) {
      return this.mockOptimizeRoute(orders);
    }

    return this.makeRequest(`${API_BASE_URL}/optimize-route`, {
      method: 'POST',
      body: JSON.stringify({ orders }),
    });
  }

  async getOrders(filters = {}) {
    if (MOCK_MODE) {
      return this.mockGetOrders(filters);
    }

    const params = new URLSearchParams(filters);
    return this.makeRequest(`${API_BASE_URL}/orders?${params}`);
  }

  async updateOrderStatus(orderId, status, location = null) {
    if (MOCK_MODE) {
      return this.mockUpdateOrderStatus(orderId, status, location);
    }

    return this.makeRequest(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, location }),
    });
  }

  async getAnalytics(dateRange = '7d') {
    if (MOCK_MODE) {
      return this.mockGetAnalytics(dateRange);
    }

    return this.makeRequest(`${API_BASE_URL}/analytics?range=${dateRange}`);
  }

  async sendNotification(orderId, type, message) {
    if (MOCK_MODE) {
      return this.mockSendNotification(orderId, type, message);
    }

    return this.makeRequest(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      body: JSON.stringify({ orderId, type, message }),
    });
  }

  async login(credentials) {
    if (MOCK_MODE) {
      return this.mockLogin(credentials);
    }

    const response = await this.makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      this.authToken = response.token;
      localStorage.setItem('authToken', response.token);
    }

    return response;
  }

  async logout() {
    this.authToken = null;
    localStorage.removeItem('authToken');
    
    if (!MOCK_MODE) {
      return this.makeRequest(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    }
    
    return Promise.resolve({ success: true });
  }

  mockOptimizeRoute(orders) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            optimizedRoute: orders.map((order, index) => ({
              ...order,
              sequenceNumber: index + 1,
              estimatedTime: `${10 + index * 15} minutes`,
              distance: `${2.5 + index * 1.2} miles`
            })),
            totalDistance: '15.3 miles',
            totalTime: '2 hours 45 minutes',
            fuelCost: '$12.50',
            efficiency: '87%'
          }
        });
      }, 2000);
    });
  }

  mockGetOrders(filters) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            {
              orderId: 'ORD-001',
              customerName: 'John Doe',
              status: 'delivered',
              createdAt: '2025-09-25T10:00:00Z',
              deliveryAddress: '123 Main St, New York, NY'
            },
            {
              orderId: 'ORD-002',
              customerName: 'Jane Smith',
              status: 'in_transit',
              createdAt: '2025-09-26T08:30:00Z',
              deliveryAddress: '456 Oak Ave, Brooklyn, NY'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2
          }
        });
      }, 1000);
    });
  }

  mockUpdateOrderStatus(orderId, status, location) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            orderId,
            status,
            location,
            updatedAt: new Date().toISOString()
          }
        });
      }, 500);
    });
  }

  mockGetAnalytics(dateRange) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            totalOrders: 150,
            deliveredOrders: 142,
            inTransitOrders: 6,
            pendingOrders: 2,
            averageDeliveryTime: '4.2 hours',
            onTimeDeliveryRate: '94.7%',
            customerSatisfaction: 4.6,
            costPerDelivery: '$8.50'
          }
        });
      }, 1000);
    });
  }

  mockSendNotification(orderId, type, message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            notificationId: 'NOT-' + Date.now(),
            orderId,
            type,
            message,
            sentAt: new Date().toISOString()
          }
        });
      }, 500);
    });
  }

  mockLogin(credentials) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.email === 'demo@smartlogistics.com' && credentials.password === 'demo123') {
          const token = 'mock-jwt-token-' + Date.now();
          this.authToken = token;
          localStorage.setItem('authToken', token);
          
          resolve({
            success: true,
            data: {
              user: {
                id: 1,
                email: credentials.email,
                name: 'Demo User',
                role: 'admin'
              },
              token
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Invalid credentials'
          });
        }
      }, 1000);
    });
  }
}

export default new ApiService();