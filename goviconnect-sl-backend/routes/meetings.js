const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSessions,
  getSessionById,
  getMyMeetings,
  bookMeeting,
  toggleReminder,
  joinMeeting,
  getExpertAvailability,
  registerForSession,
} = require('../controllers/meetingController');

// Group sessions
router.get('/sessions', protect, getSessions);
router.get('/sessions/:id', protect, getSessionById);
router.post('/sessions/:id/register', protect, authorize('farmer'), registerForSession);

// Personal meetings
router.get('/my', protect, getMyMeetings);
router.post('/', protect, authorize('farmer'), bookMeeting);
router.put('/:id/reminder', protect, toggleReminder);
router.get('/:id/join', protect, joinMeeting);

module.exports = router;
