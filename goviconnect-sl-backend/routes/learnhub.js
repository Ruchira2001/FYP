const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadGuideImages, uploadGuideVideos } = require('../middleware/upload');
const {
  getGuides,
  getGuideById,
  saveGuide,
  unsaveGuide,
  getSavedGuides,
  submitUserGuide,
  getUserGuides,
  updateUserGuide,
  deleteUserGuide,
  uploadGuideImages: uploadGuideImagesHandler,
  uploadGuideVideos: uploadGuideVideosHandler,
  getCommunityGuides,
  getCommunityGuidesByCrop,
  reactToGuide,
  reactToUserGuide,
} = require('../controllers/learnhubController');

// Crop guides
router.get('/guides', protect, getGuides);
router.get('/guides/:id', protect, getGuideById);
router.post('/guides/:id/react', protect, authorize('farmer', 'expert', 'shop'), reactToGuide);

// Saved guides
router.get('/saved', protect, authorize('farmer', 'expert', 'shop'), getSavedGuides);
router.post('/guides/:id/save', protect, authorize('farmer', 'expert', 'shop'), saveGuide);
router.delete('/guides/:id/save', protect, authorize('farmer', 'expert', 'shop'), unsaveGuide);

// Community (all approved user guides)
router.get('/community', protect, getCommunityGuides);
router.get('/community/by-crop/:cropId', protect, getCommunityGuidesByCrop);
router.post('/community/:id/react', protect, authorize('farmer', 'expert', 'shop'), reactToUserGuide);

// User-submitted guides
router.post('/user-guides/upload-images', protect, authorize('farmer', 'expert', 'shop'), (req, res, next) => {
  uploadGuideImages(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadGuideImagesHandler);

router.post('/user-guides/upload-videos', protect, authorize('farmer', 'expert', 'shop'), (req, res, next) => {
  uploadGuideVideos(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadGuideVideosHandler);

router.get('/user-guides', protect, authorize('farmer', 'expert', 'shop'), getUserGuides);
router.post('/user-guides', protect, authorize('farmer', 'expert', 'shop'), submitUserGuide);
router.put('/user-guides/:id', protect, authorize('farmer', 'expert', 'shop'), updateUserGuide);
router.delete('/user-guides/:id', protect, authorize('farmer', 'expert', 'shop'), deleteUserGuide);

module.exports = router;
