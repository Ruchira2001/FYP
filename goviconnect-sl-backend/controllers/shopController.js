const Product = require('../models/Product');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const { getIO } = require('../config/socket');
const { uploadAvatar } = require('../middleware/upload');
const { updateShopProfile, updateShopAvatar } = require('./userController');

const parseNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const getAvailabilityFromStock = (stock) => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= 10) return 'Low Stock';
  return 'In Stock';
};

const buildProductPayload = (body, file) => {
  const payload = { ...body };

  if (payload.price !== undefined) payload.price = parseNumber(payload.price);
  if (payload.stock !== undefined) {
    payload.stock = parseNumber(payload.stock);
    payload.availability = getAvailabilityFromStock(payload.stock);
  }
  if (payload.targetCrops !== undefined) payload.targetCrops = normalizeList(payload.targetCrops);
  if (file) payload.imageUrl = file.path;

  return payload;
};

const DISTRICT_COORDINATES = {
  colombo: { latitude: 6.9271, longitude: 79.8612 },
  gampaha: { latitude: 7.0873, longitude: 79.9992 },
  kalutara: { latitude: 6.5854, longitude: 79.9607 },
  kandy: { latitude: 7.2906, longitude: 80.6337 },
  matale: { latitude: 7.4675, longitude: 80.6234 },
  'nuwara eliya': { latitude: 6.9497, longitude: 80.7891 },
  galle: { latitude: 6.0535, longitude: 80.221 },
  matara: { latitude: 5.9549, longitude: 80.555 },
  hambantota: { latitude: 6.1429, longitude: 81.1212 },
  jaffna: { latitude: 9.6615, longitude: 80.0255 },
  batticaloa: { latitude: 7.7102, longitude: 81.6924 },
  trincomalee: { latitude: 8.5874, longitude: 81.2152 },
  kurunegala: { latitude: 7.4863, longitude: 80.3623 },
  puttalam: { latitude: 8.0362, longitude: 79.8283 },
  anuradhapura: { latitude: 8.3114, longitude: 80.4037 },
  polonnaruwa: { latitude: 7.9403, longitude: 81.0188 },
  badulla: { latitude: 6.9895, longitude: 81.055 },
  ratnapura: { latitude: 6.6828, longitude: 80.3992 },
  kegalle: { latitude: 7.2513, longitude: 80.3464 },
};

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const resolveShopCoordinates = (shop) => {
  if (typeof shop.latitude === 'number' && typeof shop.longitude === 'number') {
    return { latitude: shop.latitude, longitude: shop.longitude, approximated: false };
  }

  const districtKey = (shop.location || '').trim().toLowerCase();
  const districtCoords = DISTRICT_COORDINATES[districtKey];
  if (districtCoords) {
    return {
      latitude: districtCoords.latitude,
      longitude: districtCoords.longitude,
      approximated: true,
    };
  }

  return null;
};

const buildShopPreview = (shop, products, userLat, userLon, radiusKm) => {
  const coords = resolveShopCoordinates(shop);
  if (!coords) return null;

  const distanceKm = getDistanceKm(userLat, userLon, coords.latitude, coords.longitude);
  if (distanceKm > radiusKm) return null;

  const inStockProducts = products.filter((p) => p.shopId.toString() === shop._id.toString() && p.stock > 0);
  const categories = Array.from(new Set(inStockProducts.map((p) => p.category).filter(Boolean)));

  return {
    id: shop._id,
    name: shop.name,
    phone: shop.phone || '',
    location: shop.location || '',
    address: shop.address || '',
    avatar: shop.avatar || null,
    type: shop.type || 'Business',
    latitude: coords.latitude,
    longitude: coords.longitude,
    distanceKm: Number(distanceKm.toFixed(1)),
    coordinatesApproximated: coords.approximated,
    totalProducts: inStockProducts.length,
    categories,
  };
};

// @desc    Get nearby shops for farmers
// @route   GET /api/shop/nearby
exports.getNearbyShops = async (req, res, next) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLon = parseFloat(req.query.lng);
    const radiusKm = Math.min(parseFloat(req.query.radiusKm) || 40, 600);
    const search = (req.query.search || '').trim().toLowerCase();

    if (Number.isNaN(userLat) || Number.isNaN(userLon)) {
      return res.status(400).json({ success: false, message: 'lat and lng query parameters are required' });
    }

    const [shops, products] = await Promise.all([
      Shop.find({ isActive: { $ne: false } }).select('name phone location address avatar type latitude longitude isActive'),
      Product.find({ stock: { $gt: 0 } }).select('shopId category'),
    ]);

    let data = shops
      .map((shop) => buildShopPreview(shop, products, userLat, userLon, radiusKm))
      .filter(Boolean);

    if (search) {
      data = data.filter((shop) =>
        shop.name.toLowerCase().includes(search) ||
        shop.location.toLowerCase().includes(search) ||
        shop.categories.some((category) => category.toLowerCase().includes(search))
      );
    }

    data.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby shop details with product highlights for farmers
// @route   GET /api/shop/nearby/:id
exports.getNearbyShopDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userLat = parseFloat(req.query.lat);
    const userLon = parseFloat(req.query.lng);

    if (Number.isNaN(userLat) || Number.isNaN(userLon)) {
      return res.status(400).json({ success: false, message: 'lat and lng query parameters are required' });
    }

    const shop = await Shop.findOne({ _id: id, isActive: { $ne: false } })
      .select('name phone location address avatar type latitude longitude isActive');

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const coords = resolveShopCoordinates(shop);
    if (!coords) {
      return res.status(400).json({ success: false, message: 'Shop has no location coordinates' });
    }

    const products = await Product.find({ shopId: id, stock: { $gt: 0 } })
      .select('name category price unit stock targetDisease activeIngredient')
      .sort({ updatedAt: -1 })
      .limit(25);

    const distanceKm = getDistanceKm(userLat, userLon, coords.latitude, coords.longitude);

    res.json({
      success: true,
      data: {
        id: shop._id,
        name: shop.name,
        phone: shop.phone || '',
        location: shop.location || '',
        address: shop.address || '',
        avatar: shop.avatar || null,
        type: shop.type || 'Business',
        latitude: coords.latitude,
        longitude: coords.longitude,
        distanceKm: Number(distanceKm.toFixed(1)),
        coordinatesApproximated: coords.approximated,
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shop dashboard
// @route   GET /api/shop/dashboard
exports.getShopDashboard = async (req, res, next) => {
  try {
    const shopId = req.user._id;

    const [totalProducts, inStock, lowStock, outOfStock, totalOrders, pendingOrders, processingOrders, totalRevenue, popularProducts] =
      await Promise.all([
        Product.countDocuments({ shopId }),
        Product.countDocuments({ shopId, stock: { $gt: 10 } }),
        Product.countDocuments({ shopId, stock: { $gt: 0, $lte: 10 } }),
        Product.countDocuments({ shopId, stock: { $lte: 0 } }),
        Order.countDocuments({ shopId }),
        Order.countDocuments({ shopId, status: 'Pending' }),
        Order.countDocuments({ shopId, status: 'Processing' }),
        Order.aggregate([
          { $match: { shopId: req.user._id, status: 'Delivered' } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]).then((r) => r[0]?.total || 0),
        Product.find({ shopId }).sort({ updatedAt: -1 }).limit(5),
      ]);

    res.json({
      success: true,
      data: {
        products: { total: totalProducts, inStock, lowStock, outOfStock },
        orders: { total: totalOrders, pending: pendingOrders, processing: processingOrders },
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalOrders,
        popularProducts,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shop products
// @route   GET /api/shop/products
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, availability, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { shopId: req.user._id };
    if (category) filter.category = category;
    if (availability) filter.availability = availability;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameSi: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/shop/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shopId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product
// @route   POST /api/shop/products
exports.addProduct = async (req, res, next) => {
  try {
    const payload = buildProductPayload(req.body, req.file);
    const product = await Product.create({
      ...payload,
      shopId: req.user._id,
    });

    try {
      const io = getIO();
      // Notify admin
      io.emit('product_changed', { action: 'created', productId: product._id.toString(), shopId: req.user._id.toString() });
      // Notify shop owner
      io.to(`user_${req.user._id}`).emit('dashboard_updated');
    } catch (e) {
      console.log('Socket not initialized');
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/shop/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const updates = buildProductPayload(req.body, req.file);

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user._id },
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    try {
      const io = getIO();
      io.emit('product_changed', { action: 'updated', productId: product._id.toString(), shopId: req.user._id.toString() });
      io.to(`user_${req.user._id}`).emit('dashboard_updated');
    } catch (e) {
      console.log('Socket not initialized');
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/shop/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      shopId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    try {
      const io = getIO();
      io.emit('product_changed', { action: 'deleted', productId: product._id.toString(), shopId: req.user._id.toString() });
      io.to(`user_${req.user._id}`).emit('dashboard_updated');
    } catch (e) {
      console.log('Socket not initialized');
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders
// @route   GET /api/shop/orders
exports.getOrders = async (req, res, next) => {
  try {
    const filter = { shopId: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/shop/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user._id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/shop/orders
exports.createOrder = async (req, res, next) => {
  try {
    const order = await Order.create({
      ...req.body,
      shopId: req.user._id,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
