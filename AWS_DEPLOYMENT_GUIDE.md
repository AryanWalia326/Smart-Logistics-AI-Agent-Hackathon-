# AWS Deployment Guide for Smart Logistics AI Agent

## 🚀 **Production Deployment for Hackathon Requirements**

This guide shows how to deploy the Smart Logistics AI Agent to AWS with all required services to meet hackathon compliance.

## 📋 **Prerequisites**

- AWS CLI installed and configured
- AWS CDK or Terraform (optional for IaC)
- Node.js 18+ and npm
- Valid AWS account with appropriate permissions

## 🏗️ **Step-by-Step Deployment**

### **1. Deploy DynamoDB Tables**

```bash
# Create Orders table with GSI
aws dynamodb create-table \
  --table-name SmartLogisticsOrders \
  --attribute-definitions \
    AttributeName=orderId,AttributeType=S \
    AttributeName=customerId,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=orderId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=CustomerIndex,KeySchema=[{AttributeName=customerId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL} \
    IndexName=StatusIndex,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES
```

### **2. Deploy Lambda Functions**

#### **Package and Deploy Notification Service**
```bash
cd backend/lambda
zip -r notify.zip notify.js node_modules/
aws lambda create-function \
  --function-name smart-logistics-notify \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler notify.handler \
  --zip-file fileb://notify.zip \
  --environment Variables="{ORDERS_TABLE=SmartLogisticsOrders,EMAIL_TOPIC_ARN=arn:aws:sns:us-east-1:YOUR_ACCOUNT:logistics-notifications}"
```

#### **Deploy External Data Processor**
```bash
zip -r external-data-processor.zip external-data-processor.js node_modules/
aws lambda create-function \
  --function-name smart-logistics-external-data \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler external-data-processor.handler \
  --zip-file fileb://external-data-processor.zip \
  --environment Variables="{ORDERS_TABLE=SmartLogisticsOrders,WEATHER_API_KEY=your_weather_key,TRAFFIC_API_KEY=your_traffic_key}"
```

### **3. Deploy Bedrock AgentCore**

#### **Create IAM Role for Bedrock Agent**
```bash
aws iam create-role \
  --role-name BedrockAgentRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "bedrock.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

aws iam attach-role-policy \
  --role-name BedrockAgentRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

aws iam attach-role-policy \
  --role-name BedrockAgentRole \
  --policy-arn arn:aws:iam::aws:policy/AWSLambdaRole
```

#### **Create Bedrock Agent**
```bash
aws bedrock-agent create-agent \
  --agent-name smart-logistics-agent \
  --foundation-model anthropic.claude-3-5-sonnet-20241022-v2:0 \
  --instruction "$(cat backend/agentcore/agent.json | jq -r .instruction)" \
  --agent-resource-role-arn arn:aws:iam::YOUR_ACCOUNT:role/BedrockAgentRole
```

#### **Create Action Groups**
```bash
# Route Optimization Action Group
aws bedrock-agent create-agent-action-group \
  --agent-id YOUR_AGENT_ID \
  --agent-version DRAFT \
  --action-group-name RouteOptimization \
  --action-group-executor lambda=arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:smart-logistics-route-optimizer \
  --function-schema file://backend/agentcore/route-optimization-schema.json

# Order Management Action Group
aws bedrock-agent create-agent-action-group \
  --agent-id YOUR_AGENT_ID \
  --agent-version DRAFT \
  --action-group-name OrderManagement \
  --action-group-executor lambda=arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:smart-logistics-order-manager \
  --function-schema file://backend/agentcore/order-management-schema.json

# Notification Service Action Group
aws bedrock-agent create-agent-action-group \
  --agent-id YOUR_AGENT_ID \
  --agent-version DRAFT \
  --action-group-name NotificationService \
  --action-group-executor lambda=arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:smart-logistics-notify \
  --function-schema file://backend/agentcore/notification-schema.json

# External Data Integration Action Group
aws bedrock-agent create-agent-action-group \
  --agent-id YOUR_AGENT_ID \
  --agent-version DRAFT \
  --action-group-name ExternalDataIntegration \
  --action-group-executor lambda=arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:smart-logistics-external-data \
  --function-schema file://backend/agentcore/external-data-schema.json
```

### **4. Deploy API Gateway**

#### **Create API Gateway**
```bash
aws apigateway create-rest-api \
  --name smart-logistics-api \
  --description "Smart Logistics AI Agent API"

# Get the API ID from the response and use it in subsequent commands
export API_ID=your_api_id
```

#### **Create Resources and Methods**
```bash
# Create /orders resource
aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_RESOURCE_ID \
  --path-part orders

# Create POST method for orders
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $ORDERS_RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE

# Configure Lambda integration
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $ORDERS_RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:smart-logistics-api/invocations
```

### **5. Deploy S3 and CloudFront**

#### **Create S3 Bucket for Frontend**
```bash
aws s3 mb s3://smart-logistics-frontend-YOUR_ACCOUNT
aws s3 website s3://smart-logistics-frontend-YOUR_ACCOUNT \
  --index-document index.html \
  --error-document error.html
```

#### **Build and Deploy Frontend**
```bash
cd frontend
npm run build
aws s3 sync build/ s3://smart-logistics-frontend-YOUR_ACCOUNT --delete
```

#### **Create CloudFront Distribution**
```bash
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "smart-logistics-'$(date +%s)'",
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "S3-smart-logistics-frontend",
          "DomainName": "smart-logistics-frontend-YOUR_ACCOUNT.s3.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-smart-logistics-frontend",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        }
      }
    },
    "Comment": "Smart Logistics AI Agent Frontend",
    "Enabled": true
  }'
```

### **6. Configure SNS for Notifications**

```bash
aws sns create-topic --name logistics-notifications
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT:logistics-notifications \
  --protocol email \
  --notification-endpoint admin@yourcompany.com
```

## 🔧 **Environment Configuration**

### **Frontend Environment Variables**
```bash
# frontend/.env.production
REACT_APP_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
REACT_APP_BEDROCK_AGENT_ID=your_agent_id
REACT_APP_BEDROCK_AGENT_ALIAS_ID=your_alias_id
REACT_APP_MOCK_API=false
```

### **Lambda Environment Variables**
Set these for all Lambda functions:
```bash
ORDERS_TABLE=SmartLogisticsOrders
CUSTOMERS_TABLE=SmartLogisticsCustomers
NOTIFICATIONS_LOG_TABLE=SmartLogisticsNotificationLogs
EMAIL_TOPIC_ARN=arn:aws:sns:us-east-1:YOUR_ACCOUNT:logistics-notifications
BEDROCK_AGENT_ID=your_agent_id
BEDROCK_AGENT_ALIAS_ID=your_alias_id
```

## 🧪 **Testing the Deployment**

### **1. Test Bedrock Agent**
```bash
aws bedrock-agent-runtime invoke-agent \
  --agent-id YOUR_AGENT_ID \
  --agent-alias-id YOUR_ALIAS_ID \
  --session-id test-session-1 \
  --input-text "Create a new delivery order for John Doe from 123 Main St to 456 Oak Ave"
```

### **2. Test API Gateway**
```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "pickupAddress": "123 Test St",
    "deliveryAddress": "456 Test Ave",
    "packageType": "standard"
  }'
```

### **3. Test Frontend**
Access your CloudFront distribution URL and test:
- Order creation
- Order tracking
- Dashboard functionality

## 📊 **Monitoring and Logging**

### **CloudWatch Dashboards**
```bash
aws cloudwatch put-dashboard \
  --dashboard-name SmartLogisticsDashboard \
  --dashboard-body file://monitoring/dashboard-config.json
```

### **CloudWatch Alarms**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "HighOrderProcessingErrors" \
  --alarm-description "Alert when order processing errors exceed threshold" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=smart-logistics-order-manager
```

## 🔒 **Security Configuration**

### **IAM Policies**
Create restrictive IAM policies for each service:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT:table/SmartLogisticsOrders"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent"
      ],
      "Resource": "arn:aws:bedrock:us-east-1:YOUR_ACCOUNT:agent/YOUR_AGENT_ID"
    }
  ]
}
```

## 🎯 **Hackathon Validation Checklist**

After deployment, verify:

- ✅ **Bedrock Agent**: Agent responds to queries and calls appropriate action groups
- ✅ **DynamoDB**: Orders are stored and retrieved correctly
- ✅ **Lambda Functions**: All functions execute without errors
- ✅ **API Gateway**: REST endpoints return proper responses
- ✅ **S3/CloudFront**: Frontend loads and functions correctly
- ✅ **Autonomous Decisions**: Agent makes independent tool selections
- ✅ **External APIs**: Weather/traffic integration works
- ✅ **Real-time Updates**: Status changes propagate correctly

## 🚀 **Scaling for Production**

For production deployment, consider:
- Multi-region deployment
- Auto-scaling groups
- Database read replicas
- CDN optimization
- Advanced monitoring
- Security hardening
- Cost optimization

This deployment demonstrates a fully functional, hackathon-compliant AI logistics system leveraging all required AWS services with autonomous decision-making capabilities.