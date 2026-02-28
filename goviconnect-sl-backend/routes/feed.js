const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getFeed, getCrops, getTips } = require('../controllers/feedController');

router.get('/', protect, getFeed);
router.get('/crops', getCrops); // Public
router.get('/tips', protect, getTips);

module.exports = router;
