const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// ── Auth (public) ──
router.post('/login', admin.login);

// ── All routes below require admin auth ──
// We use protect + check role manually since Admin model is separate
const adminProtect = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const Admin = require('../models/Admin');

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not an admin' });
    }
    const adminUser = await Admin.findById(decoded.id).select('-password');
    if (!adminUser) return res.status(401).json({ success: false, message: 'Admin not found' });
    req.user = adminUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

router.use(adminProtect);

// ── Dashboard ──
router.get('/dashboard', admin.getDashboard);
router.get('/me', admin.getMe);

// ── Farmers ──
router.get('/farmers', admin.getFarmers);
router.get('/farmers/:id', admin.getFarmerById);
router.put('/farmers/:id', admin.updateFarmer);
router.delete('/farmers/:id', admin.deleteFarmer);

// ── Experts ──
router.get('/experts', admin.getExperts);
router.get('/experts/:id', admin.getExpertById);
router.put('/experts/:id', admin.updateExpert);
router.delete('/experts/:id', admin.deleteExpert);

// ── Shops ──
router.get('/shops', admin.getShops);
router.get('/shops/:id', admin.getShopById);
router.put('/shops/:id', admin.updateShop);
router.delete('/shops/:id', admin.deleteShop);

// ── Content: Crops ──
router.get('/crops', admin.getCrops);
router.post('/crops', admin.createCrop);
router.put('/crops/:id', admin.updateCrop);
router.delete('/crops/:id', admin.deleteCrop);

// ── Content: Guides ──
router.get('/guides', admin.getGuides);
router.post('/guides', admin.createGuide);
router.put('/guides/:id', admin.updateGuide);
router.delete('/guides/:id', admin.deleteGuide);

// ── Content: Tips ──
router.get('/tips', admin.getTips);
router.post('/tips', admin.createTip);
router.put('/tips/:id', admin.updateTip);
router.delete('/tips/:id', admin.deleteTip);

// ── Meetings ──
router.get('/meetings', admin.getMeetings);
router.post('/meetings', admin.createMeeting);
router.put('/meetings/:id', admin.updateMeeting);
router.delete('/meetings/:id', admin.deleteMeeting);

// ── AI Monitoring ──
router.get('/diagnoses', admin.getDiagnoses);
router.get('/predictions', admin.getPredictions);

// ── Notifications ──
router.get('/notifications', admin.getNotifications);
router.post('/notifications/broadcast', admin.broadcastNotification);

// ── Products & Orders ──
router.get('/products', admin.getProducts);
router.get('/orders', admin.getOrders);

// ── User Submitted Guides ──
router.get('/user-guides', admin.getUserGuides);
router.put('/user-guides/:id/approve', admin.approveUserGuide);
router.put('/user-guides/:id/reject', admin.rejectUserGuide);
router.delete('/user-guides/:id', admin.deleteUserGuidePerm);

module.exports = router;
