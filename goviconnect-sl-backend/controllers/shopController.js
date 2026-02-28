const Product = require('../models/Product');
const Order = require('../models/Order');
const { uploadAvatar } = require('../middleware/upload');
const { updateShopProfile, updateShopAvatar } = require('./userController');

// @desc    Get shop dashboard
// @route   GET /api/shop/dashboard
exports.getShopDashboard = async (req, res, next) => {
  try {
    const shopId = req.user._id;

    const [totalProducts, inStock, lowStock, outOfStock, pendingOrders, processingOrders, totalRevenue] =
      await Promise.all([
        Product.countDocuments({ shopId }),
        Product.countDocuments({ shopId, availability: 'In Stock' }),
        Product.countDocuments({ shopId, availability: 'Low Stock' }),
        Product.countDocuments({ shopId, availability: 'Out of Stock' }),
        Order.countDocuments({ shopId, status: 'Pending' }),
        Order.countDocuments({ shopId, status: 'Processing' }),
        Order.aggregate([
          { $match: { shopId: req.user._id, status: 'Delivered' } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]).then((r) => r[0]?.total || 0),
      ]);

    res.json({
      success: true,
      data: {
        products: { total: totalProducts, inStock, lowStock, outOfStock },
        orders: { pending: pendingOrders, processing: processingOrders },
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
    const product = await Product.create({
      ...req.body,
      shopId: req.user._id,
      imageUrl: req.file?.path || null,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/shop/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.imageUrl = req.file.path;

    // Auto-update availability based on stock
    if (updates.stock !== undefined) {
      if (updates.stock === 0) updates.availability = 'Out of Stock';
      else if (updates.stock <= 10) updates.availability = 'Low Stock';
      else updates.availability = 'In Stock';
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user._id },
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
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
