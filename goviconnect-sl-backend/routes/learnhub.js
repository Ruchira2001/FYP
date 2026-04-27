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
  reactToGuide,
  reactToUserGuide,
} = require('../controllers/learnhubController');

// Crop guides
router.get('/guides', protect, getGuides);
router.get('/guides/:id', protect, getGuideById);
router.post('/guides/:id/react', protect, authorize('farmer'), reactToGuide);

// Saved guides
router.get('/saved', protect, authorize('farmer'), getSavedGuides);
router.post('/guides/:id/save', protect, authorize('farmer'), saveGuide);
router.delete('/guides/:id/save', protect, authorize('farmer'), unsaveGuide);

// Community (all approved user guides)
router.get('/community', protect, getCommunityGuides);
router.post('/community/:id/react', protect, authorize('farmer'), reactToUserGuide);

// User-submitted guides
router.post('/user-guides/upload-images', protect, authorize('farmer'), (req, res, next) => {
  uploadGuideImages(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadGuideImagesHandler);

router.post('/user-guides/upload-videos', protect, authorize('farmer'), (req, res, next) => {
  uploadGuideVideos(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadGuideVideosHandler);

router.get('/user-guides', protect, authorize('farmer'), getUserGuides);
router.post('/user-guides', protect, authorize('farmer'), submitUserGuide);
router.put('/user-guides/:id', protect, authorize('farmer'), updateUserGuide);
router.delete('/user-guides/:id', protect, authorize('farmer'), deleteUserGuide);

module.exports = router;
