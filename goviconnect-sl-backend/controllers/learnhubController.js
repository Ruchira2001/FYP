const CropGuide = require('../models/CropGuide');
const UserCropGuide = require('../models/UserCropGuide');
const User = require('../models/User');

// @desc    Get all crop guides
// @route   GET /api/learnhub/guides
exports.getGuides = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleSi: { $regex: search, $options: 'i' } },
        { cropId: { $regex: search, $options: 'i' } },
      ];
    }

    const [guides, total] = await Promise.all([
      CropGuide.find(filter)
        .select('cropId title titleSi category thumbnail overview.content overview.contentSi likes views')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CropGuide.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: guides,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single guide
// @route   GET /api/learnhub/guides/:id
exports.getGuideById = async (req, res, next) => {
  try {
    const guide = await CropGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    // Increment views
    guide.views += 1;
    await guide.save();

    // Check if saved/liked by current user
    const isSaved = req.user.savedGuides?.includes(guide._id) || false;
    const isLiked = guide.likedBy?.some((id) => id.toString() === req.user._id.toString()) || false;

    res.json({ success: true, data: { ...guide.toObject(), isSaved, isLiked } });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a guide
// @route   POST /api/learnhub/saved/:id
exports.saveGuide = async (req, res, next) => {
  try {
    const guideId = req.params.id;

    // Verify guide exists
    const guide = await CropGuide.findById(guideId);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedGuides: guideId },
    });

    guide.likes += 1;
    await guide.save();

    res.json({ success: true, message: 'Guide saved' });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave a guide
// @route   DELETE /api/learnhub/saved/:id
exports.unsaveGuide = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedGuides: req.params.id },
    });

    await CropGuide.findByIdAndUpdate(req.params.id, { $inc: { likes: -1 } });

    res.json({ success: true, message: 'Guide removed from saved' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved guides
// @route   GET /api/learnhub/saved
exports.getSavedGuides = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedGuides',
      select: 'cropId title titleSi category thumbnail overview.content overview.contentSi',
    });

    res.json({ success: true, data: user.savedGuides || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a user crop guide
// @route   POST /api/learnhub/user-guides
exports.submitUserGuide = async (req, res, next) => {
  try {
    const guide = await UserCropGuide.create({
      ...req.body,
      userId: req.user._id,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: guide });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's submitted guides
// @route   GET /api/learnhub/user-guides
exports.getUserGuides = async (req, res, next) => {
  try {
    const guides = await UserCropGuide.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: guides });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user guide
// @route   PUT /api/learnhub/user-guides/:id
exports.updateUserGuide = async (req, res, next) => {
  try {
    const guide = await UserCropGuide.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    if (guide.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot edit an approved guide' });
    }

    Object.assign(guide, req.body);
    guide.status = 'pending'; // Reset to pending after edit
    await guide.save();

    res.json({ success: true, data: guide });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user guide
// @route   DELETE /api/learnhub/user-guides/:id
exports.deleteUserGuide = async (req, res, next) => {
  try {
    const guide = await UserCropGuide.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    res.json({ success: true, message: 'Guide deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload images for a user guide (Cloudinary)
// @route   POST /api/learnhub/user-guides/upload-images
exports.uploadGuideImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }
    const urls = req.files.map((f) => f.path);
    res.json({ success: true, urls });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload videos for a user guide (Cloudinary)
// @route   POST /api/learnhub/user-guides/upload-videos
exports.uploadGuideVideos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No videos uploaded' });
    }
    const urls = req.files.map((f) => f.path);
    res.json({ success: true, urls });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved community user guides (from all users)
// @route   GET /api/learnhub/community
exports.getCommunityGuides = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user._id;

    const [guides, total] = await Promise.all([
      UserCropGuide.find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name avatar'),
      UserCropGuide.countDocuments({ status: 'approved' }),
    ]);

    const result = guides.map((g) => ({
      ...g.toObject(),
      likeCount: (g.reactions?.likes || []).length,
      isLiked: (g.reactions?.likes || []).some(
        (id) => id.toString() === userId.toString()
      ),
    }));

    res.json({
      success: true,
      data: result,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on an official CropGuide
// @route   POST /api/learnhub/guides/:id/react
exports.reactToGuide = async (req, res, next) => {
  try {
    const guide = await CropGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    const userId = req.user._id;
    const alreadyLiked = guide.likedBy.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      guide.likedBy.pull(userId);
      guide.likes = Math.max(0, guide.likes - 1);
    } else {
      guide.likedBy.push(userId);
      guide.likes += 1;
    }
    await guide.save();

    res.json({
      success: true,
      isLiked: !alreadyLiked,
      likeCount: guide.likes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a community user guide
// @route   POST /api/learnhub/community/:id/react
exports.reactToUserGuide = async (req, res, next) => {
  try {
    const guide = await UserCropGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    const userId = req.user._id;
    if (!guide.reactions) guide.reactions = { likes: [] };

    const alreadyLiked = guide.reactions.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      guide.reactions.likes.pull(userId);
    } else {
      guide.reactions.likes.push(userId);
    }
    await guide.save();

    res.json({
      success: true,
      isLiked: !alreadyLiked,
      likeCount: guide.reactions.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get approved community guides for a specific crop (by cropId or name)
// @route   GET /api/learnhub/community/by-crop/:cropId
exports.getCommunityGuidesByCrop = async (req, res, next) => {
  try {
    const { cropId } = req.params;
    const userId = req.user._id;

    // Match by cropId field OR by name matching the cropId string (case-insensitive)
    const guides = await UserCropGuide.find({
      status: 'approved',
      $or: [
        { cropId: cropId },
        { name: { $regex: new RegExp(`^${cropId}$`, 'i') } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name avatar');

    const result = guides.map((g) => ({
      ...g.toObject(),
      likeCount: (g.reactions?.likes || []).length,
      isLiked: (g.reactions?.likes || []).some(
        (id) => id.toString() === userId.toString()
      ),
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
