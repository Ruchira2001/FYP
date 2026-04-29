const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Shop = require('../models/Shop');
const Crop = require('../models/Crop');
const CropGuide = require('../models/CropGuide');
const Tip = require('../models/Tip');
const Meeting = require('../models/Meeting');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const DiagnosisResult = require('../models/DiagnosisResult');
const PredictionResult = require('../models/PredictionResult');
const Notification = require('../models/Notification');
const FarmerRequest = require('../models/FarmerRequest');
const Order = require('../models/Order');
const Product = require('../models/Product');
const UserCropGuide = require('../models/UserCropGuide');

const generateToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ═══════════════ AUTH ═══════════════

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);
    res.json({
      success: true,
      data: {
        token,
        admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ DASHBOARD ═══════════════

exports.getDashboard = async (req, res) => {
  try {
    const [
      farmersCount, expertsCount, shopsCount,
      cropsCount, guidesCount, tipsCount,
      meetingsCount, chatsCount, messagesCount,
      diagnosesCount, predictionsCount, ordersCount,
      productsCount, requestsCount, notificationsCount,
      userGuidesCount,
      activeFarmers, activeExperts, activeShops,
    ] = await Promise.all([
      User.countDocuments(),
      Expert.countDocuments(),
      Shop.countDocuments(),
      Crop.countDocuments(),
      CropGuide.countDocuments(),
      Tip.countDocuments(),
      Meeting.countDocuments(),
      Chat.countDocuments(),
      Message.countDocuments(),
      DiagnosisResult.countDocuments(),
      PredictionResult.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      FarmerRequest.countDocuments(),
      Notification.countDocuments(),
      UserCropGuide.countDocuments(),
      User.countDocuments({ isActive: true }),
      Expert.countDocuments({ isActive: true }),
      Shop.countDocuments({ isActive: true }),
    ]);

    // Recent activity - last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentUsers, recentExperts, recentDiagnoses, recentMeetings] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Expert.countDocuments({ createdAt: { $gte: weekAgo } }),
      DiagnosisResult.countDocuments({ createdAt: { $gte: weekAgo } }),
      Meeting.countDocuments({ createdAt: { $gte: weekAgo } }),
    ]);

    // Monthly registration data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const [farmers, experts, shops] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        Expert.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        Shop.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      ]);

      monthlyData.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        farmers, experts, shops,
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          farmers: farmersCount,
          experts: expertsCount,
          shops: shopsCount,
          crops: cropsCount,
          guides: guidesCount,
          tips: tipsCount,
          meetings: meetingsCount,
          chats: chatsCount,
          messages: messagesCount,
          diagnoses: diagnosesCount,
          predictions: predictionsCount,
          orders: ordersCount,
          products: productsCount,
          requests: requestsCount,
          notifications: notificationsCount,
          userGuides: userGuidesCount,
          activeFarmers,
          activeExperts,
          activeShops,
        },
        recentActivity: { recentUsers, recentExperts, recentDiagnoses, recentMeetings },
        monthlyData,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ USERS (Farmers) ═══════════════

exports.getFarmers = async (req, res) => {
  try {
    const { search, district, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (district) filter.district = district;

    const farmers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);
    res.json({ success: true, data: farmers, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFarmerById = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id).select('-password');
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, data: farmer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFarmer = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'district', 'isActive'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const farmer = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, data: farmer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteFarmer = async (req, res) => {
  try {
    const farmer = await User.findByIdAndDelete(req.params.id);
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, message: 'Farmer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ EXPERTS ═══════════════

exports.getExperts = async (req, res) => {
  try {
    const { search, specialty, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (specialty) filter.specialty = specialty;

    const experts = await Expert.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Expert.countDocuments(filter);
    res.json({ success: true, data: experts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id).select('-password');
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });
    res.json({ success: true, data: expert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateExpert = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'district', 'specialty', 'specialtySi', 'yearsExperience', 'qualifications', 'specializations', 'bio', 'bioSi', 'languages', 'isActive'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const expert = await Expert.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });
    res.json({ success: true, data: expert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteExpert = async (req, res) => {
  try {
    const expert = await Expert.findByIdAndDelete(req.params.id);
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });
    res.json({ success: true, message: 'Expert deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ SHOPS ═══════════════

exports.getShops = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };

    const shops = await Shop.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Shop.countDocuments(filter);
    res.json({ success: true, data: shops, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).select('-password');
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'location', 'type', 'isActive'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const shop = await Shop.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, message: 'Shop deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ CONTENT MANAGEMENT ═══════════════

// --- Crops ---
exports.getCrops = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const crops = await Crop.find()
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Crop.countDocuments();
    res.json({ success: true, data: crops, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCrop = async (req, res) => {
  try {
    const crop = await Crop.create(req.body);
    res.status(201).json({ success: true, data: crop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.json({ success: true, data: crop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCrop = async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Crop deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Guides ---
exports.getGuides = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const guides = await CropGuide.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await CropGuide.countDocuments();
    res.json({ success: true, data: guides, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createGuide = async (req, res) => {
  try {
    const guide = await CropGuide.create(req.body);
    res.status(201).json({ success: true, data: guide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateGuide = async (req, res) => {
  try {
    const guide = await CropGuide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    res.json({ success: true, data: guide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    await CropGuide.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Guide deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Tips ---
exports.getTips = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const tips = await Tip.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Tip.countDocuments();
    res.json({ success: true, data: tips, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTip = async (req, res) => {
  try {
    const tip = await Tip.create(req.body);
    res.status(201).json({ success: true, data: tip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTip = async (req, res) => {
  try {
    const tip = await Tip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });
    res.json({ success: true, data: tip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTip = async (req, res) => {
  try {
    await Tip.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tip deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ MEETINGS ═══════════════

exports.getMeetings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const meetings = await Meeting.find(filter)
      .populate('expertId', 'name email')
      .populate('farmerId', 'name email')
      .sort({ dateTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Meeting.countDocuments(filter);
    res.json({ success: true, data: meetings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    res.json({ success: true, data: meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Meeting deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ AI MONITORING ═══════════════

exports.getDiagnoses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const diagnoses = await DiagnosisResult.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await DiagnosisResult.countDocuments();
    res.json({ success: true, data: diagnoses, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const predictions = await PredictionResult.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await PredictionResult.countDocuments();
    res.json({ success: true, data: predictions, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ NOTIFICATIONS ═══════════════

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const notifications = await Notification.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments();
    res.json({ success: true, data: notifications, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', targetRole } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    let targetUsers = [];
    if (!targetRole || targetRole === 'all') {
      const [farmers, experts, shops] = await Promise.all([
        User.find().select('_id'),
        Expert.find().select('_id'),
        Shop.find().select('_id'),
      ]);
      targetUsers = [
        ...farmers.map(u => ({ userId: u._id, userModel: 'User' })),
        ...experts.map(u => ({ userId: u._id, userModel: 'Expert' })),
        ...shops.map(u => ({ userId: u._id, userModel: 'Shop' })),
      ];
    } else if (targetRole === 'farmer') {
      const farmers = await User.find().select('_id');
      targetUsers = farmers.map(u => ({ userId: u._id, userModel: 'User' }));
    } else if (targetRole === 'expert') {
      const experts = await Expert.find().select('_id');
      targetUsers = experts.map(u => ({ userId: u._id, userModel: 'Expert' }));
    } else if (targetRole === 'shop') {
      const shops = await Shop.find().select('_id');
      targetUsers = shops.map(u => ({ userId: u._id, userModel: 'Shop' }));
    }

    const notifications = targetUsers.map(t => ({
      userId: t.userId,
      userModel: t.userModel,
      title,
      body: message,
      type: 'system',
      read: false,
    }));

    await Notification.insertMany(notifications);
    res.json({ success: true, message: `Broadcast sent to ${targetUsers.length} users`, count: targetUsers.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ PRODUCTS & ORDERS ═══════════════

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const products = await Product.find()
      .populate('shopId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Product.countDocuments();
    res.json({ success: true, data: products, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('shopId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);
    res.json({ success: true, data: orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════ USER SUBMITTED GUIDES ═══════════════

exports.getUserGuides = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const guides = await UserCropGuide.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserCropGuide.countDocuments(filter);
    res.json({ success: true, data: guides, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveUserGuide = async (req, res) => {
  try {
    const guide = await UserCropGuide.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    res.json({ success: true, data: guide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectUserGuide = async (req, res) => {
  try {
    const guide = await UserCropGuide.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: req.body.reason },
      { new: true }
    );
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    res.json({ success: true, data: guide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUserGuidePerm = async (req, res) => {
  try {
    const guide = await UserCropGuide.findByIdAndDelete(req.params.id);
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    res.json({ success: true, message: 'Guide permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
