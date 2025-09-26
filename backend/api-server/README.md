# Smart Logistics API Integration

This document describes the API integration for the Smart Logistics AI Agent project.

## 🚀 Quick Start

### 1. Start the Backend API Server

```bash
# Navigate to the API server directory
cd backend/api-server

# Install dependencies
npm install

# Start the development server
npm run dev
```

The API server will be available at `http://localhost:3001`

### 2. Configure Frontend

The frontend is configured to use the API server through environment variables:

- **Development**: Uses `http://localhost:3001/api` by default
- **Production**: Set `REACT_APP_API_BASE_URL` to your production API URL

### 3. Test the Integration

1. Start both frontend (`npm start` in `/frontend`) and backend (`npm run dev` in `/backend/api-server`)
2. Create a new order through the frontend
3. Track the order using the generated tracking ID
4. Watch real-time status updates

## 📡 API Endpoints

### Orders Management

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "pickupAddress": "123 Main St, New York, NY",
  "deliveryAddress": "456 Oak Ave, Brooklyn, NY",
  "packageType": "standard",
  "priority": "express",
  "specialInstructions": "Handle with care"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1695734400000",
    "trackingId": "TRKAB123XY789",
    "status": "created",
    "estimatedDelivery": "2025-09-27T14:30:00Z",
    "createdAt": "2025-09-26T10:00:00Z"
  }
}
```

#### Get Order Details
```http
GET /api/orders/{orderId}
```

#### Get All Orders
```http
GET /api/orders?status=in_transit&limit=10&page=1
```

### Tracking

#### Track Order
```http
GET /api/tracking/{trackingId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trackingId": "TRKAB123XY789",
    "orderId": "ORD-1695734400000",
    "status": "in_transit",
    "currentLocation": {
      "address": "Distribution Center - Manhattan",
      "coordinates": { "lat": 40.7128, "lng": -74.0060 }
    },
    "estimatedDelivery": "2025-09-27T14:30:00Z",
    "timeline": [
      {
        "status": "Order Placed",
        "timestamp": "2025-09-26T10:00:00Z",
        "location": "Online Platform"
      },
      {
        "status": "In Transit",
        "timestamp": "2025-09-26T15:00:00Z",
        "location": "Distribution Center - Manhattan"
      }
    ]
  }
}
```

### Operations

#### Update Order Status
```http
PATCH /api/orders/{orderId}/status
Content-Type: application/json

{
  "status": "delivered",
  "location": "Customer Address"
}
```

#### Route Optimization
```http
POST /api/optimize-route
Content-Type: application/json

{
  "orders": [
    {
      "orderId": "ORD-001",
      "deliveryAddress": "123 Main St, New York, NY"
    }
  ]
}
```

#### Analytics
```http
GET /api/analytics?range=7d
```

## 🔧 API Features

### Real-time Updates
- Orders automatically progress through statuses based on time elapsed
- Tracking information updates dynamically
- GPS coordinates simulate real delivery progress

### Error Handling
- Comprehensive error responses with meaningful messages
- Proper HTTP status codes
- Request validation and sanitization

### Data Persistence
- In-memory storage for development (replace with database for production)
- Consistent data relationships between orders and tracking
- Timeline history for all status changes

### CORS Support
- Configured for cross-origin requests from the frontend
- Supports all necessary HTTP methods
- Proper headers handling

## 🔄 Integration Flow

1. **Order Creation**
   - Frontend sends order data to API
   - API generates unique order and tracking IDs
   - Initial tracking entry created
   - Success response with IDs returned

2. **Order Tracking**
   - Frontend queries tracking endpoint
   - API simulates real-time progress updates
   - Location and status information returned
   - Timeline history included

3. **Status Updates**
   - Automatic progression based on time
   - Manual updates via PATCH endpoint
   - Timeline history maintained
   - Notifications triggered (future feature)

## 🚀 Production Deployment

### Backend Deployment
- Deploy to AWS Lambda, Google Cloud Functions, or similar
- Use AWS DynamoDB, MongoDB, or PostgreSQL for data persistence
- Implement proper authentication and authorization
- Add rate limiting and request validation
- Set up monitoring and logging

### Frontend Configuration
```bash
# Production environment variables
REACT_APP_API_BASE_URL=https://api.smartlogistics.com/v1
REACT_APP_MOCK_API=false
```

### Security Considerations
- Implement JWT authentication
- Add API key validation
- Use HTTPS in production
- Validate and sanitize all inputs
- Implement rate limiting
- Add CORS restrictions for production domains

## 📊 Monitoring

### Health Check
```http
GET /health
```

Returns server status and timestamp for monitoring tools.

### Logging
- All API requests and responses logged
- Error tracking with stack traces
- Performance metrics collection

## 🔮 Future Enhancements

1. **Database Integration**
   - Replace in-memory storage with persistent database
   - Add data migrations and backup strategies

2. **Real-time Notifications**
   - WebSocket support for live updates
   - SMS and email notifications via AWS SNS
   - Push notifications for mobile apps

3. **Advanced Features**
   - Machine learning for delivery time predictions
   - Integration with mapping services for real GPS tracking
   - Multi-tenant support for different logistics companies

4. **Scalability**
   - Microservices architecture
   - Load balancing and auto-scaling
   - Caching layer with Redis
   - Event-driven architecture with message queues

The API is designed to be production-ready with proper error handling, validation, and scalability considerations. It provides a solid foundation for the Smart Logistics AI Agent application.