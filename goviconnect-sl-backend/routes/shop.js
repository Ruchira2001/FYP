const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImage, uploadAvatar } = require('../middleware/upload');
const { updateShopProfile, updateShopAvatar } = require('../controllers/userController');
const {
  getShopDashboard,
  getProducts,
  getProductById,
  getNearbyShops,
  getNearbyShopDetails,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  createOrder,
} = require('../controllers/shopController');

// Farmer-facing shop discovery
router.get('/nearby', protect, authorize('farmer'), getNearbyShops);
router.get('/nearby/:id', protect, authorize('farmer'), getNearbyShopDetails);

// All shop routes require authentication and shop role
router.use(protect, authorize('shop'));

// Dashboard
router.get('/dashboard', getShopDashboard);

// Profile
router.put('/profile', updateShopProfile);
router.put('/avatar', uploadAvatar, updateShopAvatar);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', uploadProductImage, addProduct);
router.put('/products/:id', uploadProductImage, updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.put('/orders/:id', updateOrderStatus);

module.exports = router;
