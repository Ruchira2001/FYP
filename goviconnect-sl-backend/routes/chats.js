const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadChatImage } = require('../middleware/upload');
const {
  getChats,
  getMessages,
  sendMessage,
  createChat,
  markChatRead,
  sendImageMessage,
} = require('../controllers/chatController');

router.get('/', protect, getChats);
router.post('/', protect, createChat);
router.get('/:chatId/messages', protect, getMessages);
router.post('/:chatId/messages', protect, sendMessage);
router.put('/:chatId/read', protect, markChatRead);
router.post('/:chatId/image', protect, uploadChatImage, sendImageMessage);

module.exports = router;
