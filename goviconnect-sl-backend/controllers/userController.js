const User = require('../models/User');
const Expert = require('../models/Expert');
const Shop = require('../models/Shop');

// @desc    Update farmer profile
// @route   PUT /api/users/me
exports.updateFarmerProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'district', 'crops', 'settings', 'hasCompletedOnboarding'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload/update farmer avatar
// @route   PUT /api/users/me/avatar
exports.updateFarmerAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );

    res.json({ success: true, avatar: user.avatar, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expert profile
// @route   PUT /api/experts/me
exports.updateExpertProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'district', 'specialty', 'specialtySi',
      'qualifications', 'specializations', 'bio', 'bioSi',
      'languages', 'availability', 'settings', 'yearsExperience',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const expert = await Expert.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: expert });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload/update expert avatar
// @route   PUT /api/experts/me/avatar
exports.updateExpertAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const expert = await Expert.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );

    res.json({ success: true, avatar: expert.avatar, user: expert });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shop profile
// @route   PUT /api/shops/me
exports.updateShopProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'location', 'type', 'settings'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const shop = await Shop.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: shop });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload/update shop avatar
// @route   PUT /api/shops/me/avatar
exports.updateShopAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const shop = await Shop.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );

    res.json({ success: true, avatar: shop.avatar, user: shop });
  } catch (error) {
    next(error);
  }
};

// @desc    Update push token
// @route   PUT /api/users/push-token
exports.updatePushToken = async (req, res, next) => {
  try {
    const { expoPushToken } = req.body;
    const Model = req.userRole === 'farmer' ? User : req.userRole === 'expert' ? Expert : Shop;

    await Model.findByIdAndUpdate(req.user._id, { expoPushToken });

    res.json({ success: true, message: 'Push token updated' });
  } catch (error) {
    next(error);
  }
};
