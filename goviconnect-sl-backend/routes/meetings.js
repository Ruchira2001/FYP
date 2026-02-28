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
router.get('/my-meetings', protect, getMyMeetings);
router.post('/book', protect, authorize('farmer'), bookMeeting);
router.put('/:id/reminder', protect, toggleReminder);
router.post('/:id/join', protect, joinMeeting);

// Expert availability
router.get('/availability/:expertId', protect, getExpertAvailability);

module.exports = router;
