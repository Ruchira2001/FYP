const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
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
} = require('../controllers/learnhubController');

// Crop guides
router.get('/guides', protect, getGuides);
router.get('/guides/:id', protect, getGuideById);

// Saved guides
router.get('/saved', protect, authorize('farmer'), getSavedGuides);
router.post('/saved/:id', protect, authorize('farmer'), saveGuide);
router.delete('/saved/:id', protect, authorize('farmer'), unsaveGuide);

// User-submitted guides
router.get('/user-guides', protect, authorize('farmer'), getUserGuides);
router.post('/user-guides', protect, authorize('farmer'), submitUserGuide);
router.put('/user-guides/:id', protect, authorize('farmer'), updateUserGuide);
router.delete('/user-guides/:id', protect, authorize('farmer'), deleteUserGuide);

module.exports = router;
