const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Shop = require('../models/Shop');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Format user response (remove sensitive fields)
const formatUserResponse = (user, role) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.__v;
  return { ...obj, role };
};

// @desc    Register farmer
// @route   POST /api/auth/farmer/register
exports.registerFarmer = async (req, res, next) => {
  try {
    const { name, email, phone, password, district, crops } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      district,
      crops: crops || [],
      hasCompletedOnboarding: true,
    });

    const token = generateToken(user._id, 'farmer');

    res.status(201).json({
      success: true,
      token,
      user: formatUserResponse(user, 'farmer'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login farmer
// @route   POST /api/auth/farmer/login
exports.loginFarmer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update push token if provided
    if (req.body.expoPushToken) {
      user.expoPushToken = req.body.expoPushToken;
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user._id, 'farmer');

    res.json({
      success: true,
      token,
      user: formatUserResponse(user, 'farmer'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/farmer/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In production, send email with reset link
    // For now, return the token for testing
    res.json({
      success: true,
      message: 'Password reset email sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
exports.resetPassword = async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id, 'farmer');

    res.json({
      success: true,
      token,
      user: formatUserResponse(user, 'farmer'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login expert
// @route   POST /api/auth/expert/login
exports.loginExpert = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const expert = await Expert.findOne({ email }).select('+password');
    if (!expert) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await expert.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (req.body.expoPushToken) {
      expert.expoPushToken = req.body.expoPushToken;
      await expert.save({ validateBeforeSave: false });
    }

    const token = generateToken(expert._id, 'expert');

    res.json({
      success: true,
      token,
      user: formatUserResponse(expert, 'expert'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register expert (admin or self)
// @route   POST /api/auth/expert/register
exports.registerExpert = async (req, res, next) => {
  try {
    const { name, email, phone, password, district, specialty, specialtySi, qualifications, specializations, bio, bioSi } = req.body;

    const existing = await Expert.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const expert = await Expert.create({
      name,
      email,
      phone,
      password,
      district,
      specialty,
      specialtySi,
      qualifications: qualifications || [],
      specializations: specializations || [],
      bio,
      bioSi,
    });

    const token = generateToken(expert._id, 'expert');

    res.status(201).json({
      success: true,
      token,
      user: formatUserResponse(expert, 'expert'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login shop
// @route   POST /api/auth/shop/login
exports.loginShop = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const shop = await Shop.findOne({ email }).select('+password');
    if (!shop) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await shop.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (req.body.expoPushToken) {
      shop.expoPushToken = req.body.expoPushToken;
      await shop.save({ validateBeforeSave: false });
    }

    const token = generateToken(shop._id, 'shop');

    res.json({
      success: true,
      token,
      user: formatUserResponse(shop, 'shop'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register shop
// @route   POST /api/auth/shop/register
exports.registerShop = async (req, res, next) => {
  try {
    const { name, email, phone, password, location, type } = req.body;

    const existing = await Shop.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const shop = await Shop.create({
      name,
      email,
      phone,
      password,
      location,
      type,
    });

    const token = generateToken(shop._id, 'shop');

    res.status(201).json({
      success: true,
      token,
      user: formatUserResponse(shop, 'shop'),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: formatUserResponse(req.user, req.userRole),
    });
  } catch (error) {
    next(error);
  }
};
