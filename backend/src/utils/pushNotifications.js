const { Expo } = require('expo-server-sdk');
const logger = require('./logger');

// Create a new Expo SDK client
let expo = new Expo();

/**
 * Send a push notification to a specific user
 * @param {string} pushToken - The target user's Expo Push Token
 * @param {string} title - Title of the notification
 * @param {string} body - Body text of the notification
 * @param {Object} data - Optional data payload
 */
const sendPushNotification = async (pushToken, title, body, data = {}) => {
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
    }

    const messages = [];
    messages.push({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'default',
    });

    try {
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];
        
        for (const chunk of chunks) {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        }
        
        logger.info('Push notification sent successfully', { tickets });
        return tickets;
    } catch (error) {
        logger.error('Error sending push notification:', error);
    }
};

/**
 * Send notifications to multiple users
 * @param {Array<string>} pushTokens - Array of Expo Push Tokens
 * @param {string} title - Title of the notification
 * @param {string} body - Body text of the notification
 * @param {Object} data - Optional data payload
 */
const sendMultiplePushNotifications = async (pushTokens, title, body, data = {}) => {
    const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) return;

    const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
    }));

    try {
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }
    } catch (error) {
        logger.error('Error sending multiple push notifications:', error);
    }
};

module.exports = {
    sendPushNotification,
    sendMultiplePushNotifications,
};
