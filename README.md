# Smart Logistics AI Agent

A comprehensive AI-powered logistics management system built with AWS Bedrock, React, and modern cloud technologies. This system optimizes delivery routes, manages orders, and provides real-time tracking through intelligent automation.

## 🚀 Features

### AI-Powered Capabilities
- **Intelligent Route Optimization**: ML algorithms optimize delivery routes considering traffic, weather, and constraints
- **Natural Language Processing**: Bedrock Agent handles customer inquiries and automates logistics decisions
- **Predictive Analytics**: Forecast delivery times and demand patterns
- **Real-time Decision Making**: Automated handling of exceptions and route adjustments

### Customer Experience
- **Web-based Order Management**: Intuitive React interface for order creation and tracking
- **Real-time Tracking**: GPS-based location updates with accurate ETAs
- **Multi-channel Notifications**: SMS and email alerts for order status updates
- **Self-service Portal**: Customers can manage orders and track deliveries independently

### Operational Excellence
- **Automated Workflows**: Strands-powered workflow management for order processing
- **Scalable Architecture**: Serverless AWS infrastructure that scales automatically
- **Real-time Monitoring**: Comprehensive observability and performance tracking
- **Exception Handling**: Intelligent error recovery and escalation procedures

## 🏗️ Architecture

```
Frontend (React)
    ↓
API Gateway
    ↓
Bedrock AI Agent ←→ Strands Workflows
    ↓
Lambda Functions ←→ DynamoDB
    ↓
SNS Notifications ←→ S3 Storage
```

### Components
- **Frontend**: React application with order forms and tracking interface
- **Backend**: AWS Bedrock Agent with custom action groups
- **Workflows**: AWS Strands for automated order processing
- **Data Storage**: DynamoDB for orders, S3 for package metadata
- **Notifications**: AWS SNS for SMS and email communications
- **Monitoring**: CloudWatch for system observability

## 📁 Project Structure

```
smart-logistics-ai-agent/
├── frontend/                 # React customer interface
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderForm.js
│   │   │   └── Tracking.js
│   │   ├── App.js
│   │   ├── api.js
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── agentcore/agent.json          # Bedrock Agent definition
│   ├── strands/workflow.json         # Workflow configuration
│   ├── lambda/notify.js              # SNS notification service
│   ├── dynamodb/schema.json          # Database schema
│   └── s3/README.md                  # Storage documentation
├── architecture/architecture-diagram.png
├── demo/README.md
├── README.md
└── package.json
```

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI framework
- **JavaScript ES6+**: Core programming language
- **CSS3**: Responsive styling
- **REST APIs**: Backend communication

### Backend & AI
- **AWS Bedrock**: Foundation models and AI agents
- **AWS Strands**: Workflow orchestration
- **AWS Lambda**: Serverless compute
- **Node.js**: Runtime environment

### Data & Storage
- **Amazon DynamoDB**: NoSQL database for orders and tracking
- **Amazon S3**: Object storage for packages and AI models
- **DynamoDB Streams**: Real-time data processing

### Communication & Monitoring
- **Amazon SNS**: Multi-channel notifications
- **Amazon CloudWatch**: Logging and monitoring
- **AWS X-Ray**: Distributed tracing

## 🚀 Getting Started

### Prerequisites
- AWS Account with appropriate permissions
- Node.js 18+ 
- Git
- AWS CLI configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/smart-logistics-ai-agent.git
   cd smart-logistics-ai-agent
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Deploy AWS Infrastructure**
   ```bash
   # Deploy DynamoDB tables
   aws dynamodb create-table --cli-input-json file://backend/dynamodb/schema.json

   # Deploy Lambda functions
   cd backend/lambda
   zip -r notify.zip notify.js
   aws lambda create-function --function-name smart-logistics-notify --runtime nodejs18.x --zip-file fileb://notify.zip

   # Configure Bedrock Agent (follow AWS documentation)
   # Set up Strands workflows
   ```

4. **Configure Environment Variables**
   ```bash
   # Frontend (.env)
   REACT_APP_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/api

   # Lambda Environment Variables
   CUSTOMERS_TABLE=Customers
   NOTIFICATIONS_LOG_TABLE=NotificationsLog
   EMAIL_TOPIC_ARN=arn:aws:sns:region:account:email-notifications
   ```

5. **Start the Development Server**
   ```bash
   cd frontend
   npm start
   ```

### Quick Test

1. Open http://localhost:3000 in your browser
2. Create a test order using the order form
3. Use the tracking interface to monitor order status
4. Check AWS CloudWatch logs for system activity

## 📊 System Capabilities

### Order Management
- Create orders with pickup/delivery addresses
- Validate addresses and calculate estimates
- Assign tracking IDs automatically
- Support multiple package types and priorities

### Route Optimization
- AI-powered route planning for multiple deliveries
- Real-time traffic consideration
- Driver and vehicle assignment
- Cost and time optimization

### Real-time Tracking
- GPS-based location updates
- Status timeline with timestamps
- Delivery confirmation with photos
- Exception handling and notifications

### Customer Communications
- Automated SMS notifications for status changes
- Email confirmations and updates
- Real-time delivery estimates
- Proactive delay notifications

## 🔧 Configuration

### Bedrock Agent Configuration
The AI agent is configured in `backend/agentcore/agent.json` with:
- Foundation model selection
- Action groups for route optimization and notifications
- Knowledge bases for logistics best practices
- Prompt configurations for optimal responses

### Workflow Management
Strands workflows in `backend/strands/workflow.json` define:
- Order validation and processing steps
- Route optimization triggers
- Driver assignment logic
- Customer notification sequences

### Database Schema
DynamoDB table structure supports:
- Order management with global secondary indexes
- Customer information and preferences
- Real-time tracking data
- Notification logs and audit trails

## 📈 Performance & Scaling

### Scalability Features
- Serverless architecture scales automatically
- DynamoDB on-demand scaling
- Lambda concurrency management
- CloudFront CDN for global performance

### Monitoring & Observability
- CloudWatch metrics and alarms
- Custom dashboards for business KPIs
- X-Ray tracing for performance optimization
- Automated error detection and alerting

## 🔐 Security

### Data Protection
- End-to-end encryption for sensitive data
- IAM roles with least privilege access
- VPC isolation for backend services
- Regular security audits and compliance

### API Security
- JWT-based authentication
- Rate limiting and throttling
- Input validation and sanitization
- CORS configuration for web security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [demo documentation](demo/README.md) for examples
- Review AWS documentation for service-specific guidance

## 🏆 Acknowledgments

- AWS Bedrock team for AI capabilities
- AWS Strands for workflow orchestration
- Open source React community
- Logistics industry best practices and standards

---

Built with ❤️ using AWS AI services and modern web technologies.