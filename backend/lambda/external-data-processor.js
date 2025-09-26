const AWS = require('aws-sdk');
const https = require('https');

// External API configurations
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'demo_weather_key';
const TRAFFIC_API_KEY = process.env.TRAFFIC_API_KEY || 'demo_traffic_key';

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('External Data Integration triggered:', JSON.stringify(event, null, 2));
    
    const { function: functionName, parameters } = event;
    
    try {
        switch (functionName) {
            case 'getWeatherImpact':
                return await getWeatherImpact(parameters);
            case 'getTrafficConditions':
                return await getTrafficConditions(parameters);
            default:
                throw new Error(`Unknown function: ${functionName}`);
        }
    } catch (error) {
        console.error('External data integration error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
                function: functionName
            })
        };
    }
};

/**
 * AUTONOMOUS WEATHER DECISION MAKING
 * Agent automatically calls this when detecting weather-sensitive deliveries
 */
async function getWeatherImpact(parameters) {
    const { delivery_locations, time_window, package_sensitivity } = parameters;
    
    try {
        // In production, this would call actual weather APIs
        // For demo, we'll simulate weather impact analysis
        const weatherData = await simulateWeatherAPI(delivery_locations);
        
        // AUTONOMOUS DECISION: Analyze weather impact on deliveries
        const impactAnalysis = analyzeWeatherImpact(weatherData, package_sensitivity);
        
        // AUTONOMOUS ACTION: Auto-update affected orders if needed
        if (impactAnalysis.hasHighImpact) {
            await updateAffectedOrders(impactAnalysis.affectedDeliveries, 'weather_delay');
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                weather_conditions: weatherData,
                impact_analysis: impactAnalysis,
                recommended_actions: impactAnalysis.recommendations,
                autonomous_actions_taken: impactAnalysis.hasHighImpact ? ['order_status_updated', 'customers_notified'] : ['monitoring_continued']
            })
        };
        
    } catch (error) {
        console.error('Weather impact analysis failed:', error);
        throw error;
    }
}

/**
 * AUTONOMOUS TRAFFIC DECISION MAKING
 * Agent automatically calls this for route optimization and ETA updates
 */
async function getTrafficConditions(parameters) {
    const { route_waypoints, departure_time, vehicle_type } = parameters;
    
    try {
        // In production, this would call Google Maps API, HERE API, etc.
        const trafficData = await simulateTrafficAPI(route_waypoints);
        
        // AUTONOMOUS DECISION: Analyze traffic impact on delivery routes
        const routeAnalysis = analyzeTrafficImpact(trafficData, departure_time, vehicle_type);
        
        // AUTONOMOUS ACTION: Auto-optimize routes if significant delays detected
        if (routeAnalysis.requiresOptimization) {
            const optimizedRoute = await optimizeRouteForTraffic(route_waypoints, trafficData);
            await updateRouteInDatabase(optimizedRoute);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                traffic_conditions: trafficData,
                route_analysis: routeAnalysis,
                optimized_route: routeAnalysis.requiresOptimization ? routeAnalysis.optimizedRoute : null,
                estimated_delays: routeAnalysis.delays,
                autonomous_actions_taken: routeAnalysis.requiresOptimization ? ['route_optimized', 'eta_updated'] : ['route_confirmed']
            })
        };
        
    } catch (error) {
        console.error('Traffic analysis failed:', error);
        throw error;
    }
}

/**
 * SIMULATE WEATHER API (Replace with actual API in production)
 */
async function simulateWeatherAPI(locations) {
    // Simulate different weather conditions
    const conditions = ['clear', 'rain', 'snow', 'storm', 'fog'];
    const impacts = ['low', 'medium', 'high'];
    
    return locations.map((location, index) => ({
        location: location,
        condition: conditions[index % conditions.length],
        temperature: Math.floor(Math.random() * 40) + 20, // 20-60°F
        precipitation_chance: Math.floor(Math.random() * 100),
        wind_speed: Math.floor(Math.random() * 20),
        visibility: Math.floor(Math.random() * 10) + 1,
        impact_level: impacts[Math.floor(Math.random() * impacts.length)],
        recommendation: getWeatherRecommendation(conditions[index % conditions.length])
    }));
}

/**
 * SIMULATE TRAFFIC API (Replace with actual API in production)
 */
async function simulateTrafficAPI(waypoints) {
    return waypoints.map((waypoint, index) => ({
        waypoint: waypoint,
        congestion_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        average_speed: Math.floor(Math.random() * 40) + 15, // 15-55 mph
        incident_count: Math.floor(Math.random() * 3),
        estimated_delay_minutes: Math.floor(Math.random() * 45),
        alternative_routes_available: Math.random() > 0.5,
        best_departure_time: calculateOptimalTime(index)
    }));
}

/**
 * AUTONOMOUS WEATHER IMPACT ANALYSIS
 */
function analyzeWeatherImpact(weatherData, packageSensitivity) {
    const highImpactConditions = weatherData.filter(w => 
        w.impact_level === 'high' || 
        (w.condition === 'rain' && packageSensitivity === 'electronics') ||
        (w.condition === 'snow' && w.temperature < 32)
    );
    
    return {
        hasHighImpact: highImpactConditions.length > 0,
        affectedDeliveries: highImpactConditions.map(w => w.location),
        overallRisk: highImpactConditions.length > weatherData.length / 2 ? 'high' : 'medium',
        recommendations: generateWeatherRecommendations(highImpactConditions),
        estimated_delay_hours: highImpactConditions.length * 2
    };
}

/**
 * AUTONOMOUS TRAFFIC IMPACT ANALYSIS
 */
function analyzeTrafficImpact(trafficData, departureTime, vehicleType) {
    const totalDelayMinutes = trafficData.reduce((sum, t) => sum + t.estimated_delay_minutes, 0);
    const highCongestionPoints = trafficData.filter(t => t.congestion_level === 'high');
    
    return {
        requiresOptimization: totalDelayMinutes > 30 || highCongestionPoints.length > 1,
        totalDelayMinutes: totalDelayMinutes,
        delays: trafficData.map(t => ({
            location: t.waypoint,
            delay_minutes: t.estimated_delay_minutes,
            severity: t.congestion_level
        })),
        optimizedRoute: totalDelayMinutes > 30 ? generateOptimizedRoute(trafficData) : null,
        recommendations: generateTrafficRecommendations(trafficData, vehicleType)
    };
}

/**
 * AUTONOMOUS ORDER UPDATES
 */
async function updateAffectedOrders(affectedLocations, reasonCode) {
    // In production, this would update DynamoDB orders table
    const updatePromises = affectedLocations.map(async (location) => {
        const params = {
            TableName: process.env.ORDERS_TABLE || 'Orders',
            FilterExpression: 'contains(delivery_address, :location)',
            ExpressionAttributeValues: {
                ':location': location
            }
        };
        
        try {
            const result = await dynamodb.scan(params).promise();
            // Update each affected order
            for (const order of result.Items) {
                await updateOrderStatus(order.orderId, 'delayed', reasonCode);
            }
        } catch (error) {
            console.error(`Failed to update orders for location ${location}:`, error);
        }
    });
    
    await Promise.all(updatePromises);
}

async function updateOrderStatus(orderId, status, reason) {
    const params = {
        TableName: process.env.ORDERS_TABLE || 'Orders',
        Key: { orderId: orderId },
        UpdateExpression: 'SET #status = :status, updated_at = :timestamp, delay_reason = :reason',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':status': status,
            ':timestamp': new Date().toISOString(),
            ':reason': reason
        }
    };
    
    await dynamodb.update(params).promise();
}

// Helper functions
function getWeatherRecommendation(condition) {
    const recommendations = {
        'clear': 'Optimal delivery conditions',
        'rain': 'Use waterproof packaging, allow extra time',
        'snow': 'Consider delays, use appropriate vehicles',
        'storm': 'Delay non-urgent deliveries',
        'fog': 'Reduce speed, use GPS navigation'
    };
    return recommendations[condition] || 'Monitor conditions closely';
}

function calculateOptimalTime(index) {
    const baseTime = new Date();
    baseTime.setHours(9 + (index * 2)); // Stagger delivery times
    return baseTime.toISOString();
}

function generateWeatherRecommendations(highImpactConditions) {
    return [
        'Reschedule non-urgent deliveries',
        'Use weather-appropriate packaging',
        'Notify customers of potential delays',
        'Deploy vehicles with appropriate equipment'
    ];
}

function generateTrafficRecommendations(trafficData, vehicleType) {
    return [
        'Consider alternative routes',
        'Adjust departure times',
        'Group nearby deliveries',
        'Use real-time navigation updates'
    ];
}

function generateOptimizedRoute(trafficData) {
    // Simple optimization: prioritize low-congestion areas first
    return trafficData
        .sort((a, b) => {
            const congestionScore = { 'low': 1, 'medium': 2, 'high': 3 };
            return congestionScore[a.congestion_level] - congestionScore[b.congestion_level];
        })
        .map(t => t.waypoint);
}

async function updateRouteInDatabase(optimizedRoute) {
    // In production, update the route in DynamoDB
    console.log('Updated optimized route:', optimizedRoute);
}