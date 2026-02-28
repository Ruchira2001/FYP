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
router.put('/farmer/profile', protect, authorize('farmer'), updateFarmerProfile);
router.put('/farmer/avatar', protect, authorize('farmer'), uploadAvatar, updateFarmerAvatar);

// Expert profile
router.put('/expert/profile', protect, authorize('expert'), updateExpertProfile);
router.put('/expert/avatar', protect, authorize('expert'), uploadAvatar, updateExpertAvatar);

// Shop profile
router.put('/shop/profile', protect, authorize('shop'), updateShopProfile);
router.put('/shop/avatar', protect, authorize('shop'), uploadAvatar, updateShopAvatar);

// Push token (all roles)
router.put('/push-token', protect, updatePushToken);

module.exports = router;
