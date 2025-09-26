# S3 Storage for Smart Logistics AI Agent

This directory contains configuration and documentation for Amazon S3 storage used in the Smart Logistics AI Agent system.

## Purpose

The S3 buckets in this system are used for:

### 1. Package Metadata Storage
- **Bucket**: `smart-logistics-package-metadata`
- **Purpose**: Store package images, delivery confirmations, signatures, and related metadata
- **Structure**:
  ```
  smart-logistics-package-metadata/
  ├── orders/
  │   ├── {orderId}/
  │   │   ├── package-photos/
  │   │   │   ├── pickup-photo.jpg
  │   │   │   └── delivery-photo.jpg
  │   │   ├── signatures/
  │   │   │   └── delivery-signature.png
  │   │   └── documents/
  │   │       └── shipping-label.pdf
  ```

### 2. AI Model Assets
- **Bucket**: `smart-logistics-ai-models`
- **Purpose**: Store trained ML models for route optimization, demand prediction, and delivery time estimation
- **Structure**:
  ```
  smart-logistics-ai-models/
  ├── route-optimization/
  │   ├── model-v1.0.pkl
  │   └── model-v1.1.pkl
  ├── demand-prediction/
  │   └── demand-model-v2.0.pkl
  └── delivery-estimation/
      └── time-estimation-model.pkl
  ```

### 3. Configuration and Templates
- **Bucket**: `smart-logistics-config`
- **Purpose**: Store configuration files, email templates, and system settings
- **Structure**:
  ```
  smart-logistics-config/
  ├── templates/
  │   ├── email/
  │   │   ├── order-confirmation.html
  │   │   ├── delivery-notification.html
  │   │   └── delay-notification.html
  │   └── sms/
  │       ├── pickup-confirmation.txt
  │       └── delivery-notification.txt
  ├── maps/
  │   └── delivery-zones.geojson
  └── settings/
      └── system-config.json
  ```

## Bucket Policies

### Package Metadata Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLogisticsServiceAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-ID:role/LogisticsServiceRole"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::smart-logistics-package-metadata/*"
    }
  ]
}
```

### AI Models Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowMLServiceAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-ID:role/MLServiceRole"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::smart-logistics-ai-models/*"
    }
  ]
}
```

## Lifecycle Policies

- **Package Photos**: Transition to IA after 30 days, delete after 2 years
- **Delivery Confirmations**: Keep for 7 years for compliance
- **AI Model Versions**: Keep latest 3 versions, archive older versions

## Security

- All buckets use AES-256 encryption
- Access logged via CloudTrail
- Cross-region replication enabled for critical data
- Versioning enabled for model files and templates

## Integration

The S3 buckets integrate with:
- **Lambda Functions**: For image processing and metadata extraction
- **Bedrock Agent**: For accessing templates and configuration
- **DynamoDB**: Store S3 object references and metadata
- **API Gateway**: Provide secure access to stored assets

## Monitoring

CloudWatch metrics monitored:
- Storage usage and costs
- Request patterns and performance
- Error rates and access patterns
- Data transfer and bandwidth usage