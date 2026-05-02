const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Expert = require('../models/Expert');
const { getIO } = require('../config/socket');
const { createNotification } = require('../services/notificationService');

// @desc    Get user's chats
// @route   GET /api/chats
exports.getChats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      'participants.userId': userId,
    }).sort({ lastMessageTime: -1 });

    // Add online status for each chat participant
    const chatsWithStatus = await Promise.all(
      chats.map(async (chat) => {
        const chatObj = chat.toObject();
        const otherParticipant = chatObj.participants.find(
          (p) => p.userId.toString() !== userId.toString()
        );

        if (otherParticipant) {
          if (otherParticipant.userModel === 'Expert') {
            const expert = await Expert.findById(otherParticipant.userId).select('isOnline');
            otherParticipant.isOnline = expert?.isOnline || false;
          } else {
            otherParticipant.isOnline = false;
          }
        }

        // Get unread count for current user
        chatObj.unreadCount = chat.unreadCount.get(userId.toString()) || 0;

        return chatObj;
      })
    );

    res.json({ success: true, data: chatsWithStatus });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a chat
// @route   GET /api/chats/:chatId/messages
exports.getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.userId': req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const [messages, total] = await Promise.all([
      Message.find({ chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ chatId }),
    ]);

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message (REST fallback / offline sync)
// @route   POST /api/chats/:chatId/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content, type, attachmentData } = req.body;
    const userId = req.user._id;

    // Verify user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.userId': userId,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const senderType = req.userRole === 'farmer' ? 'user' : 'expert';

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

    // Update chat's last message
    const lastMsgPreview = type === 'image' ? '📷 Image' :
      type === 'diagnosis' ? '🔬 Diagnosis Result' :
      type === 'prediction' ? '📊 Price Prediction' :
      content.substring(0, 100);

    // Increment unread for other participants
    const unreadUpdate = {};
    chat.participants.forEach((p) => {
      if (p.userId.toString() !== userId.toString()) {
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

    // Emit via Socket.io
    try {
      const io = getIO();
      io.to(`chat_${chatId}`).emit('new_message', {
        message: message.toObject(),
        chatId,
      });
    } catch (socketErr) {
      // Socket not initialized, skip real-time
    }

    // Send notification to other participants
    const otherParticipant = chat.participants.find(
      (p) => p.userId.toString() !== userId.toString()
    );
    if (otherParticipant) {
      await createNotification({
        userId: otherParticipant.userId,
        userModel: otherParticipant.userModel,
        type: 'chat',
        title: `New message from ${req.user.name}`,
        titleSi: `${req.user.name} ගෙන් නව පණිවිඩයක්`,
        body: lastMsgPreview,
        bodySi: lastMsgPreview,
        data: { chatId, messageId: message._id },
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or get existing chat
// @route   POST /api/chats
exports.createChat = async (req, res, next) => {
  try {
    const { expertId } = req.body;
    const userId = req.user._id;

    if (!expertId) {
      return res.status(400).json({ success: false, message: 'Expert ID is required' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      'participants.userId': { $all: [userId, expertId] },
    });

    if (existingChat) {
      return res.json({ success: true, data: existingChat });
    }

    // Get expert info
    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    const chat = await Chat.create({
      participants: [
        {
          userId,
          userModel: 'User',
          userType: 'farmer',
          name: req.user.name,
          avatar: req.user.avatar,
        },
        {
          userId: expert._id,
          userModel: 'Expert',
          userType: 'expert',
          name: expert.name,
          avatar: expert.avatar,
        },
      ],
      unreadCount: new Map([
        [userId.toString(), 0],
        [expert._id.toString(), 0],
      ]),
    });

    // Notify expert in real-time so their chat list updates immediately
    try {
      const io = getIO();
      io.emit('new_chat', {
        chat: chat.toObject(),
        expertId: expert._id.toString(),
        farmerName: req.user.name,
      });
    } catch (socketErr) {
      // Socket not initialized, skip real-time
    }

    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark chat as read
// @route   PUT /api/chats/:chatId/read
exports.markChatRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    await Chat.findByIdAndUpdate(chatId, {
      [`unreadCount.${userId.toString()}`]: 0,
    });

    // Mark all messages as read by this user
    await Message.updateMany(
      { chatId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    // Emit read receipt via Socket.io
    try {
      const io = getIO();
      io.to(`chat_${chatId}`).emit('messages_read', {
        chatId,
        userId: userId.toString(),
      });
    } catch (socketErr) {
      // Socket not initialized, skip
    }

    res.json({ success: true, message: 'Chat marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send image message
// @route   POST /api/chats/:chatId/image
exports.sendImageMessage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    req.body.content = req.file.path; // Cloudinary URL
    req.body.type = 'image';
    return exports.sendMessage(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chat and its messages
// @route   DELETE /api/chats/:chatId
exports.deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      'participants.userId': userId,
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    await Promise.all([
      Message.deleteMany({ chatId }),
      Chat.findByIdAndDelete(chatId),
    ]);

    try {
      const io = getIO();
      io.emit('chat_deleted', {
        chatId,
        deletedBy: userId.toString(),
      });
    } catch (socketErr) {
      // Socket not initialized, skip real-time
    }

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    next(error);
  }
};
