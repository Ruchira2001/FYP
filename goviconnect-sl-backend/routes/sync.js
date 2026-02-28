const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { syncActions } = require('../controllers/syncController');

router.post('/', protect, syncActions);

module.exports = router;
