const Expert = require('../models/Expert');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const DiagnosisResult = require('../models/DiagnosisResult');
const FarmerRequest = require('../models/FarmerRequest');
const CropGuide = require('../models/CropGuide');
const Notification = require('../models/Notification');
const { createNotification } = require('../services/notificationService');

// @desc    Get expert dashboard stats
// @route   GET /api/expert/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const expertId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayConsultations,
      pendingReviews,
      upcomingMeetings,
      unreadMessages,
      totalFarmersHelped,
      totalConsultations,
      recentActivity,
    ] = await Promise.all([
      // Today's consultations
      Meeting.countDocuments({
        expertId,
        dateTime: { $gte: today, $lt: tomorrow },
        status: { $in: ['confirmed', 'completed'] },
      }),
      // Pending diagnosis reviews
      DiagnosisResult.countDocuments({
        reviewStatus: 'pending_review',
      }),
      // Upcoming meetings
      Meeting.countDocuments({
        expertId,
        dateTime: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] },
      }),
      // Unread messages
      Chat.aggregate([
        { $match: { 'participants.userId': expertId } },
        {
          $project: {
            unread: {
              $ifNull: [{ $arrayElemAt: [{ $objectToArray: '$unreadCount' }, 0] }, { v: 0 }],
            },
          },
        },
      ]).then((chats) => {
        return chats.reduce((sum, chat) => {
          const count = chat.unread?.v || 0;
          return sum + count;
        }, 0);
      }),
      // Total farmers helped
      Meeting.distinct('farmerId', { expertId, status: 'completed' }).then((ids) => ids.length),
      // Total consultations
      Meeting.countDocuments({ expertId, status: 'completed' }),
      // Recent activity feed
      Promise.all([
        FarmerRequest.find({ expertId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('type title farmerName status createdAt'),
        Meeting.find({ expertId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('topic farmerName type status dateTime'),
      ]).then(([requests, meetings]) => {
        const items = [
          ...requests.map((r) => ({
            id: r._id,
            type: 'request',
            title: r.title,
            subtitle: `from ${r.farmerName}`,
            status: r.status,
            time: r.createdAt,
          })),
          ...meetings.map((m) => ({
            id: m._id,
            type: 'meeting',
            title: m.topic,
            subtitle: m.type === 'group' ? 'Group session' : `with ${m.farmerName}`,
            status: m.status,
            time: m.dateTime,
          })),
        ];
        items.sort((a, b) => new Date(b.time) - new Date(a.time));
        return items.slice(0, 10);
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          todayConsultations,
          pendingReviews,
          upcomingMeetings,
          unreadMessages,
        },
        overview: {
          totalFarmersHelped,
          totalConsultations,
          rating: req.user.rating,
          yearsExperience: req.user.yearsExperience,
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer requests
// @route   GET /api/expert/requests
exports.getFarmerRequests = async (req, res, next) => {
  try {
    const filter = { expertId: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const requests = await FarmerRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('farmerId', 'name district crops avatar');

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to farmer request
// @route   PUT /api/expert/requests/:id/respond
exports.respondToRequest = async (req, res, next) => {
  try {
    const { status, response } = req.body;

    const request = await FarmerRequest.findOneAndUpdate(
      { _id: req.params.id, expertId: req.user._id },
      { status, expertResponse: response },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Notify farmer
    await createNotification({
      userId: request.farmerId,
      userModel: 'User',
      type: 'system',
      title: `Expert responded to your request`,
      titleSi: `විශේෂඥයා ඔබේ ඉල්ලීමට ප්‍රතිචාර දැක්වීය`,
      body: response || `Your request "${request.title}" has been updated to ${status}`,
      bodySi: `ඔබේ ඉල්ලීම "${request.title}" ${status} ලෙස යාවත්කාලීන කර ඇත`,
      data: { requestId: request._id },
    });

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get diagnosis reviews
// @route   GET /api/expert/diagnosis-reviews
exports.getDiagnosisReviews = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.reviewStatus = req.query.status;
    } else {
      filter.reviewStatus = 'pending_review';
    }

    const reviews = await DiagnosisResult.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name district');

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit diagnosis review
// @route   PUT /api/expert/diagnosis-reviews/:id
exports.submitDiagnosisReview = async (req, res, next) => {
  try {
    const { expertDiagnosis, expertNotes, reviewStatus } = req.body;

    const diagnosis = await DiagnosisResult.findByIdAndUpdate(
      req.params.id,
      {
        expertReviewed: true,
        expertId: req.user._id,
        expertDiagnosis,
        expertNotes,
        reviewStatus: reviewStatus || 'verified',
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }

    // Notify farmer about review
    await createNotification({
      userId: diagnosis.userId,
      userModel: 'User',
      type: 'diagnosis',
      title: 'Expert reviewed your diagnosis',
      titleSi: 'විශේෂඥයා ඔබේ රෝග විනිශ්චය සමාලෝචනය කළේය',
      body: `${req.user.name} has ${reviewStatus === 'verified' ? 'verified' : 'corrected'} your crop diagnosis.`,
      bodySi: `${req.user.name} ඔබේ බෝග රෝග විනිශ්චය ${reviewStatus === 'verified' ? 'තහවුරු' : 'නිවැරදි'} කළේය.`,
      data: { diagnosisId: diagnosis._id },
    });

    res.json({ success: true, data: diagnosis });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer directory
// @route   GET /api/expert/farmers
exports.getFarmerDirectory = async (req, res, next) => {
  try {
    const { search, district, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (district) filter.district = district;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [farmers, total] = await Promise.all([
      User.find(filter)
        .select('name email phone district crops avatar createdAt')
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: farmers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get knowledge base articles
// @route   GET /api/expert/knowledge-base
exports.getKnowledgeBase = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleSi: { $regex: search, $options: 'i' } },
      ];
    }

    const articles = await CropGuide.find(filter)
      .sort({ createdAt: -1 });

    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
};

// @desc    Create knowledge base article
// @route   POST /api/expert/knowledge-base
exports.createKnowledgeArticle = async (req, res, next) => {
  try {
    const article = await CropGuide.create({
      ...req.body,
      isExpertContributed: true,
      expertId: req.user._id,
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

// @desc    Update knowledge base article
// @route   PUT /api/expert/knowledge-base/:id
exports.updateKnowledgeArticle = async (req, res, next) => {
  try {
    const article = await CropGuide.findOneAndUpdate(
      { _id: req.params.id, expertId: req.user._id },
      req.body,
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found or not authorized' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

// @desc    Expert's meetings (group + personal)
// @route   GET /api/expert/meetings
exports.getExpertMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ expertId: req.user._id })
      .sort({ dateTime: -1 })
      .populate('farmerId', 'name district avatar');

    res.json({ success: true, data: meetings });
  } catch (error) {
    next(error);
  }
};

// @desc    Expert creates a meeting session
// @route   POST /api/expert/meetings
exports.createMeeting = async (req, res, next) => {
  try {
    const { type, topic, topicSi, description, descriptionSi, sessionTitle, sessionTitleSi, dateTime, duration, maxAttendees, meetingLink } = req.body;

    const meeting = await Meeting.create({
      expertId: req.user._id,
      expertName: req.user.name,
      expertAvatar: req.user.avatar,
      type: type || 'group',
      topic,
      topicSi: topicSi || topic,
      description,
      descriptionSi,
      sessionTitle,
      sessionTitleSi,
      dateTime: new Date(dateTime),
      duration: duration || 60,
      status: 'confirmed',
      maxAttendees: maxAttendees || 50,
      meetingLink: meetingLink || `https://meet.goviconnect.lk/session_${Date.now()}`,
    });

    // Emit real-time event so farmer clients can refresh
    const io = req.app.get('io');
    if (io) {
      io.emit('meeting_created', { meeting });
    }

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meeting status
// @route   PUT /api/expert/meetings/:id
exports.updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, expertId: req.user._id },
      req.body,
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    // Notify farmer if status changed
    if (req.body.status && meeting.farmerId) {
      await createNotification({
        userId: meeting.farmerId,
        userModel: 'User',
        type: 'meeting',
        title: `Meeting ${req.body.status}`,
        titleSi: `රැස්වීම ${req.body.status}`,
        body: `Your meeting "${meeting.topic}" has been ${req.body.status}`,
        bodySi: `ඔබේ රැස්වීම "${meeting.topicSi || meeting.topic}" ${req.body.status} කර ඇත`,
        data: { meetingId: meeting._id },
      });
    }

    // Emit real-time event so farmer apps refresh
    const io = req.app.get('io');
    if (io) {
      io.emit('meeting_updated', { meetingId: meeting._id.toString() });
    }

    res.json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

// @desc    List experts (public / farmer view)
// @route   GET /api/experts
exports.listExperts = async (req, res, next) => {
  try {
    const { search, specialty, district } = req.query;
    const filter = {};
    if (specialty) filter.specialty = specialty;
    if (district) filter.district = district;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
      ];
    }

    const experts = await Expert.find(filter)
      .select('name specialty specialtySi district avatar rating totalConsultations farmersHelped yearsExperience bio bioSi languages isOnline')
      .sort({ rating: -1 });

    res.json({ success: true, data: experts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expert
// @route   GET /api/experts/:id
exports.getExpertById = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id)
      .select('-password -expoPushToken');

    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    res.json({ success: true, data: expert });
  } catch (error) {
    next(error);
  }
};
// @desc    Register a farmer as an expert
// @route   POST /api/experts/register
exports.registerAsExpert = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if already an expert
    const user = await User.findById(userId);
    if (user.expertId) {
      const expert = await Expert.findById(user.expertId);
      return res.status(200).json({ success: true, message: 'User is already registered as an expert', data: expert });
    }

    const { specialty, specialtySi, yearsExperience, qualifications, qualificationImages, specializations, bio, bioSi, availability } = req.body;

    if (!specialty) {
      return res.status(400).json({ success: false, message: 'Specialty is required' });
    }

    // Create expert profile linked to this user
    // We generate a dummy password because the Expert model requires it, 
    // but the user will likely log in via their main account or role switch
    const crypto = require('crypto');
    const tempPassword = crypto.randomBytes(16).toString('hex');

    const expert = await Expert.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: tempPassword,
      district: user.district,
      specialty,
      specialtySi,
      yearsExperience: parseInt(yearsExperience) || 0,
      qualifications: qualifications || [],
      qualificationImages: qualificationImages || [],
      specializations: specializations || [],
      bio,
      bioSi,
      availability: availability || [],
      avatar: user.avatar,
    });

    // Update user record with expert link
    user.expertId = expert._id;
    await user.save();

    res.status(201).json({ success: true, data: expert });
  } catch (error) {
    next(error);
  }
};
