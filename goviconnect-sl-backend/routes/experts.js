const router = require('express').Router();
console.log('--- Experts Routes Initializing ---');
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { updateExpertProfile, updateExpertAvatar } = require('../controllers/userController');
const {
  getDashboard,
  getFarmerRequests,
  respondToRequest,
  getDiagnosisReviews,
  submitDiagnosisReview,
  getFarmerDirectory,
  getKnowledgeBase,
  createKnowledgeArticle,
  updateKnowledgeArticle,
  getExpertMeetings,
  createMeeting,
  updateMeeting,
  listExperts,
  getExpertById,
  registerAsExpert,
} = require('../controllers/expertController');

// Expert-only routes (must come BEFORE /:id to avoid matching "me" as an ID)
router.get('/me/dashboard', protect, authorize('expert'), getDashboard);
router.put('/me/profile', protect, authorize('expert'), updateExpertProfile);
router.put('/me/avatar', protect, authorize('expert'), uploadAvatar, updateExpertAvatar);

// Register as expert (from farmer side)
router.post('/apply', protect, registerAsExpert);

// Farmer requests
router.get('/me/requests', protect, authorize('expert'), getFarmerRequests);
router.put('/me/requests/:id', protect, authorize('expert'), respondToRequest);

// Diagnosis reviews
router.get('/me/diagnosis-reviews', protect, authorize('expert'), getDiagnosisReviews);
router.put('/me/diagnosis-reviews/:id', protect, authorize('expert'), submitDiagnosisReview);

// Farmer directory
router.get('/me/farmers', protect, authorize('expert'), getFarmerDirectory);

// Knowledge base
router.get('/me/knowledge', protect, authorize('expert'), getKnowledgeBase);
router.post('/me/knowledge', protect, authorize('expert'), createKnowledgeArticle);
router.put('/me/knowledge/:id', protect, authorize('expert'), updateKnowledgeArticle);

// Expert meetings
router.get('/me/meetings', protect, authorize('expert'), getExpertMeetings);
router.post('/me/meetings', protect, authorize('expert'), createMeeting);
router.put('/me/meetings/:id', protect, authorize('expert'), updateMeeting);

// Public expert listing (for farmers to browse) — must be AFTER /me/* routes
router.get('/', protect, listExperts);
router.get('/:id', protect, getExpertById);

module.exports = router;
