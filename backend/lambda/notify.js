const AWS = require('aws-sdk');

// Initialize AWS services
const sns = new AWS.SNS();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Notification service triggered:', JSON.stringify(event, null, 2));
    
    try {
        // Parse the incoming event
        const { orderId, customerId, notificationType, messageData } = event;
        
        // Get customer contact information from DynamoDB
        const customer = await getCustomerInfo(customerId);
        
        if (!customer) {
            throw new Error(`Customer not found: ${customerId}`);
        }
        
        // Generate notification message based on type
        const message = generateNotificationMessage(notificationType, messageData, orderId);
        
        // Send SMS notification
        if (customer.phoneNumber) {
            await sendSMSNotification(customer.phoneNumber, message);
            console.log(`SMS sent to ${customer.phoneNumber}`);
        }
        
        // Send email notification (if email topic ARN is configured)
        if (customer.email) {
            await sendEmailNotification(customer.email, message, notificationType);
            console.log(`Email sent to ${customer.email}`);
        }
        
        // Log the notification in DynamoDB
        await logNotification(orderId, customerId, notificationType, 'sent');
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Notification sent successfully',
                orderId: orderId,
                notificationType: notificationType
            })
        };
        
    } catch (error) {
        console.error('Error sending notification:', error);
        
        // Log the failed notification
        if (event.orderId && event.customerId) {
            await logNotification(event.orderId, event.customerId, event.notificationType, 'failed', error.message);
        }
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to send notification',
                error: error.message
            })
        };
    }
};

async function getCustomerInfo(customerId) {
    const params = {
        TableName: process.env.CUSTOMERS_TABLE || 'Customers',
        Key: { customerId: customerId }
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item;
}

async function sendSMSNotification(phoneNumber, message) {
    const params = {
        Message: message,
        PhoneNumber: phoneNumber,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Transactional'
            }
        }
    };
    
    return await sns.publish(params).promise();
}

async function sendEmailNotification(email, message, notificationType) {
    const subject = getEmailSubject(notificationType);
    
    const params = {
        TopicArn: process.env.EMAIL_TOPIC_ARN,
        Message: JSON.stringify({
            default: message,
            email: {
                subject: subject,
                body: message,
                recipientEmail: email
            }
        }),
        MessageStructure: 'json'
    };
    
    return await sns.publish(params).promise();
}

function generateNotificationMessage(notificationType, messageData, orderId) {
    const messages = {
        'order_created': `Your order ${orderId} has been created and is being processed. Estimated delivery: ${messageData.estimatedDelivery}`,
        'order_picked_up': `Your order ${orderId} has been picked up and is on its way. Track your package: ${messageData.trackingUrl}`,
        'in_transit': `Your order ${orderId} is in transit. Current location: ${messageData.currentLocation}. Expected delivery: ${messageData.estimatedDelivery}`,
        'out_for_delivery': `Your order ${orderId} is out for delivery. It will arrive within the next 2 hours.`,
        'delivered': `Your order ${orderId} has been successfully delivered. Thank you for choosing our service!`,
        'delivery_delayed': `Your order ${orderId} delivery has been delayed due to ${messageData.reason}. New estimated delivery: ${messageData.newEstimatedDelivery}`,
        'delivery_failed': `We were unable to deliver your order ${orderId}. Reason: ${messageData.reason}. We will attempt redelivery tomorrow.`
    };
    
    return messages[notificationType] || `Update for order ${orderId}: ${messageData.message || 'Status updated'}`;
}

function getEmailSubject(notificationType) {
    const subjects = {
        'order_created': 'Order Confirmation - Smart Logistics',
        'order_picked_up': 'Order Picked Up - Smart Logistics',
        'in_transit': 'Order In Transit - Smart Logistics',
        'out_for_delivery': 'Order Out for Delivery - Smart Logistics',
        'delivered': 'Order Delivered - Smart Logistics',
        'delivery_delayed': 'Delivery Delayed - Smart Logistics',
        'delivery_failed': 'Delivery Failed - Smart Logistics'
    };
    
    return subjects[notificationType] || 'Order Update - Smart Logistics';
}

async function logNotification(orderId, customerId, notificationType, status, errorMessage = null) {
    const params = {
        TableName: process.env.NOTIFICATIONS_LOG_TABLE || 'NotificationsLog',
        Item: {
            notificationId: `${orderId}-${Date.now()}`,
            orderId: orderId,
            customerId: customerId,
            notificationType: notificationType,
            status: status,
            timestamp: new Date().toISOString(),
            errorMessage: errorMessage
        }
    };
    
    try {
        await dynamodb.put(params).promise();
    } catch (error) {
        console.error('Error logging notification:', error);
        // Don't throw error here to avoid failing the main notification
    }
}