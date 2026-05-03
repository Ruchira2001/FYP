const Meeting = require('../models/Meeting');
const Expert = require('../models/Expert');
const { createNotification } = require('../services/notificationService');

// @desc    Get upcoming group sessions
// @route   GET /api/meetings/sessions
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Meeting.find({
      type: 'group',
      dateTime: { $gte: new Date() },
      status: 'confirmed',
    })
      .sort({ dateTime: 1 })
      .populate('expertId', 'name avatar specialty');

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session details
// @route   GET /api/meetings/sessions/:id
exports.getSessionById = async (req, res, next) => {
  try {
    const session = await Meeting.findById(req.params.id)
      .populate('expertId', 'name avatar specialty specialtySi bio');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if current user is registered
    const isRegistered = session.registeredUsers.includes(req.user._id);

    res.json({
      success: true,
      data: { ...session.toObject(), isRegistered },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer's personal meetings
// @route   GET /api/meetings/my
exports.getMyMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { farmerId: req.user._id },
        { registeredUsers: req.user._id },
      ],
    })
      .sort({ dateTime: -1 })
      .populate('expertId', 'name avatar specialty');

    res.json({ success: true, data: meetings });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a meeting
// @route   POST /api/meetings
exports.bookMeeting = async (req, res, next) => {
  try {
    const { expertId, dateTime, topic, topicSi, notes, source, duration } = req.body;

    // Validate expert exists
    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Check for conflicting meetings at the same time
    const meetingTime = new Date(dateTime);
    const meetingEnd = new Date(meetingTime.getTime() + (duration || 30) * 60000);

    const conflicting = await Meeting.findOne({
      expertId,
      status: { $in: ['pending', 'confirmed'] },
      dateTime: {
        $gte: new Date(meetingTime.getTime() - 30 * 60000),
        $lte: meetingEnd,
      },
    });

    if (conflicting) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.',
      });
    }

    const meeting = await Meeting.create({
      expertId,
      farmerId: req.user._id,
      expertName: expert.name,
      expertAvatar: expert.avatar,
      farmerName: req.user.name,
      farmerDistrict: req.user.district,
      type: 'personal',
      topic,
      topicSi: topicSi || topic,
      dateTime: meetingTime,
      duration: duration || 30,
      status: 'pending',
      notes,
      source: source || 'scheduled',
      meetingLink: `https://meet.goviconnect.lk/meeting_${Date.now()}`,
    });

    // Notify expert
    await createNotification({
      userId: expert._id,
      userModel: 'Expert',
      type: 'meeting',
      title: `New meeting request from ${req.user.name}`,
      titleSi: `${req.user.name} ගෙන් නව රැස්වීම් ඉල්ලීමක්`,
      body: `Topic: ${topic} on ${meetingTime.toLocaleDateString()}`,
      bodySi: `මාතෘකාව: ${topicSi || topic}`,
      data: { meetingId: meeting._id },
    });

    // Emit real-time socket event to expert
    const io = req.app.get('io');
    if (io) {
      io.emit('meeting_booked', { meeting, expertId: expert._id.toString() });
    }

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle meeting reminder
// @route   PUT /api/meetings/:id/reminder
exports.toggleReminder = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    meeting.reminderSet = !meeting.reminderSet;
    await meeting.save();

    res.json({
      success: true,
      data: meeting,
      message: meeting.reminderSet ? 'Reminder set' : 'Reminder removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meeting join link
// @route   GET /api/meetings/:id/join
exports.joinMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.json({
      success: true,
      meetingLink: meeting.meetingLink || `https://meet.goviconnect.lk/${meeting._id}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expert availability
// @route   GET /api/experts/:id/availability
exports.getExpertAvailability = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id).select('availability name');
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Get existing booked meetings for next 7 days
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const bookedMeetings = await Meeting.find({
      expertId: req.params.id,
      dateTime: { $gte: now, $lte: weekLater },
      status: { $in: ['pending', 'confirmed'] },
    }).select('dateTime duration');

    // Generate available slots from expert's availability schedule
    const availableSlots = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dayName = dayNames[date.getDay()];

      const daySchedule = expert.availability.find((a) => a.day === dayName);
      if (!daySchedule) continue;

      for (const slot of daySchedule.slots) {
        const [startH, startM] = slot.start.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(startH, startM, 0, 0);

        // Check if slot is booked
        const isBooked = bookedMeetings.some((m) => {
          const meetingStart = new Date(m.dateTime);
          const meetingEnd = new Date(meetingStart.getTime() + m.duration * 60000);
          return slotDate >= meetingStart && slotDate < meetingEnd;
        });

        if (!isBooked && slotDate > now) {
          availableSlots.push(slotDate.toISOString());
        }
      }
    }

    res.json({
      success: true,
      available: availableSlots.length > 0,
      nextSlots: availableSlots,
      schedule: expert.availability,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for a group session
// @route   POST /api/meetings/sessions/:id/register
exports.registerForSession = async (req, res, next) => {
  try {
    const session = await Meeting.findById(req.params.id);
    if (!session || session.type !== 'group') {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    if (session.attendees >= session.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Session is full' });
    }

    session.registeredUsers.push(req.user._id);
    session.attendees += 1;
    await session.save();

    // Notify expert of new registration in real time
    const io = req.app.get('io');
    if (io) {
      io.emit('meeting_registered', { sessionId: session._id.toString(), expertId: session.expertId.toString(), attendees: session.attendees });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};
