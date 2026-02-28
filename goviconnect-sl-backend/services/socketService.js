const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Expert = require('../models/Expert');
const { createNotification } = require('./notificationService');

// Track online users: { socketId: { userId, role } }
const onlineUsers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const { id: userId, role, name } = socket.user;
    console.log(`Socket connected: ${name} (${role}) - ${socket.id}`);

    // Track online status
    onlineUsers.set(socket.id, { userId, role });

    // Update expert online status in DB
    if (role === 'expert') {
      Expert.findByIdAndUpdate(userId, { isOnline: true }).exec();
    }

    // Broadcast online status to relevant chats
    broadcastOnlineStatus(io, userId, true);

    // Join user's chat rooms
    socket.on('join_chats', async () => {
      try {
        const chats = await Chat.find({ 'participants.userId': userId });
        chats.forEach((chat) => {
          socket.join(`chat_${chat._id}`);
        });
        socket.emit('chats_joined', { count: chats.length });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chats' });
      }
    });

    // Join a specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      socket.emit('chat_joined', { chatId });
    });

    // Leave a specific chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Send message via socket
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type, attachmentData } = data;

        // Verify user is participant
        const chat = await Chat.findOne({
          _id: chatId,
          'participants.userId': userId,
        });

        if (!chat) {
          return socket.emit('error', { message: 'Chat not found' });
        }

        const senderType = role === 'farmer' ? 'user' : 'expert';

        const message = await Message.create({
          chatId,
          senderId: userId,
          senderType,
          content,
          type: type || 'text',
          attachmentData,
          readBy: [userId],
          synced: true,
        });

        const lastMsgPreview = type === 'image' ? '📷 Image' :
          type === 'diagnosis' ? '🔬 Diagnosis Result' :
          type === 'prediction' ? '📊 Price Prediction' :
          content.substring(0, 100);

        // Update unread counts
        const unreadUpdate = {};
        chat.participants.forEach((p) => {
          if (p.userId.toString() !== userId) {
            const currentCount = chat.unreadCount.get(p.userId.toString()) || 0;
            unreadUpdate[`unreadCount.${p.userId.toString()}`] = currentCount + 1;
          }
        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: lastMsgPreview,
          lastMessageTime: new Date(),
          lastMessageType: type || 'text',
          ...unreadUpdate,
        });

        // Broadcast to chat room
        io.to(`chat_${chatId}`).emit('new_message', {
          message: message.toObject(),
          chatId,
        });

        // Notify the sender of success
        socket.emit('message_sent', { messageId: message._id, chatId });

        // Send push notification to other participant if offline
        const otherParticipant = chat.participants.find(
          (p) => p.userId.toString() !== userId
        );
        if (otherParticipant) {
          const isOtherOnline = Array.from(onlineUsers.values()).some(
            (u) => u.userId === otherParticipant.userId.toString()
          );
          if (!isOtherOnline) {
            await createNotification({
              userId: otherParticipant.userId,
              userModel: otherParticipant.userModel,
              type: 'chat',
              title: `New message from ${name}`,
              titleSi: `${name} ගෙන් නව පණිවිඩයක්`,
              body: lastMsgPreview,
              bodySi: lastMsgPreview,
              data: { chatId, messageId: message._id },
            });
          }
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        userId,
        name,
      });
    });

    socket.on('stop_typing', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_stop_typing', {
        chatId,
        userId,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (chatId) => {
      try {
        await Chat.findByIdAndUpdate(chatId, {
          [`unreadCount.${userId}`]: 0,
        });

        await Message.updateMany(
          { chatId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );

        // Notify other participants about read status
        io.to(`chat_${chatId}`).emit('messages_read', {
          chatId,
          userId,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark as read' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${name} - ${socket.id}`);
      onlineUsers.delete(socket.id);

      // Update expert online status
      if (role === 'expert') {
        // Check if expert has any other active sockets
        const hasOtherSocket = Array.from(onlineUsers.values()).some(
          (u) => u.userId === userId
        );
        if (!hasOtherSocket) {
          Expert.findByIdAndUpdate(userId, { isOnline: false }).exec();
        }
      }

      broadcastOnlineStatus(io, userId, false);
    });
  });
};

// Broadcast online/offline status to chats the user participates in
const broadcastOnlineStatus = async (io, userId, isOnline) => {
  try {
    const chats = await Chat.find({ 'participants.userId': userId });
    chats.forEach((chat) => {
      io.to(`chat_${chat._id}`).emit('online_status', {
        userId,
        isOnline,
      });
    });
  } catch (error) {
    console.error('Error broadcasting online status:', error);
  }
};

module.exports = { setupSocketHandlers, onlineUsers };
