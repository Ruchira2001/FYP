const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { translate } = require('../controllers/translateController');

// POST /api/translate
router.post('/', protect, translate);

module.exports = router;
