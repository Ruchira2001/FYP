const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  updateFarmerProfile,
  updateFarmerAvatar,
  updateExpertProfile,
  updateExpertAvatar,
  updateShopProfile,
  updateShopAvatar,
  updatePushToken,
} = require('../controllers/userController');

// Farmer profile
router.put('/me', protect, authorize('farmer'), updateFarmerProfile);
router.put('/me/avatar', protect, authorize('farmer'), uploadAvatar, updateFarmerAvatar);

// Push token (all roles)
router.put('/push-token', protect, updatePushToken);

module.exports = router;
