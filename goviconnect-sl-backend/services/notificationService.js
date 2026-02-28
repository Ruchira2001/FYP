const Notification = require('../models/Notification');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Shop = require('../models/Shop');

let Expo;
try {
  Expo = require('expo-server-sdk').Expo;
} catch (e) {
  // expo-server-sdk not available
}

const expo = Expo ? new Expo() : null;

/**
 * Create a notification and optionally send push notification
 */
const createNotification = async ({ userId, userModel, type, title, titleSi, body, bodySi, data }) => {
  try {
    // Save to database
    const notification = await Notification.create({
      userId,
      userModel,
      type,
      title,
      titleSi: titleSi || title,
      body,
      bodySi: bodySi || body,
      data,
    });

    // Try to send push notification
    await sendPushNotification(userId, userModel, title, body, data);

    // Emit via Socket.io if available
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      io.to(`user_${userId}`).emit('notification', notification.toObject());
    } catch (e) {
      // Socket not initialized
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Send push notification via Expo
 */
const sendPushNotification = async (userId, userModel, title, body, data) => {
  if (!expo) return;

  try {
    const Model = userModel === 'User' ? User : userModel === 'Expert' ? Expert : Shop;
    const user = await Model.findById(userId).select('expoPushToken');

    if (!user?.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) {
      return;
    }

    const messages = [
      {
        to: user.expoPushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

module.exports = { createNotification, sendPushNotification };
