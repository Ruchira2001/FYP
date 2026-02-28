const Tip = require('../models/Tip');
const Meeting = require('../models/Meeting');
const CropGuide = require('../models/CropGuide');
const DiagnosisResult = require('../models/DiagnosisResult');
const User = require('../models/User');

// @desc    Get home feed
// @route   GET /api/feed
exports.getFeed = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch different types of feed items in parallel
    const [tips, upcomingMeetings, recentDiagnoses, savedGuides, latestGuides] = await Promise.all([
      // Random tip of the day
      Tip.aggregate([{ $sample: { size: 2 } }]),

      // Upcoming meetings for user
      Meeting.find({
        $or: [
          { farmerId: userId },
          { registeredUsers: userId },
          { type: 'group', dateTime: { $gte: new Date() } },
        ],
        dateTime: { $gte: new Date() },
        status: { $ne: 'cancelled' },
      })
        .sort({ dateTime: 1 })
        .limit(3)
        .select('topic topicSi dateTime expertName type sessionTitle'),

      // Recently received diagnosis results
      DiagnosisResult.find({ userId })
        .sort({ createdAt: -1 })
        .limit(2)
        .select('diseaseName diseaseNameSi confidence createdAt imageUrl'),

      // User's saved guides (continue reading)
      User.findById(userId)
        .select('savedGuides')
        .populate({
          path: 'savedGuides',
          select: 'title titleSi category cropId',
          options: { limit: 2 },
        }),

      // Latest crop guides
      CropGuide.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title titleSi category cropId'),
    ]);

    // Build feed items
    const feedItems = [];

    // Add tips
    tips.forEach((tip) => {
      feedItems.push({
        id: `tip-${tip._id}`,
        type: 'tip',
        title: `Today's Tip: ${tip.title}`,
        titleSi: `අද ඉඟිය: ${tip.titleSi || tip.title}`,
        content: tip.content,
        contentSi: tip.contentSi || tip.content,
        timestamp: new Date().toISOString(),
      });
    });

    // Add upcoming meetings
    upcomingMeetings.forEach((meeting) => {
      feedItems.push({
        id: `meeting-${meeting._id}`,
        type: 'meeting',
        title: `Upcoming: ${meeting.sessionTitle || meeting.topic}`,
        titleSi: `ඉදිරි: ${meeting.topicSi || meeting.topic}`,
        content: `${meeting.type === 'group' ? 'Group session' : 'Meeting'} with ${meeting.expertName} on ${new Date(meeting.dateTime).toLocaleDateString()}`,
        contentSi: `${meeting.expertName} සමඟ ${new Date(meeting.dateTime).toLocaleDateString()} දින`,
        timestamp: meeting.dateTime,
        meetingId: meeting._id,
      });
    });

    // Add saved guides (continue reading)
    if (savedGuides?.savedGuides) {
      savedGuides.savedGuides.forEach((guide) => {
        feedItems.push({
          id: `saved-${guide._id}`,
          type: 'saved',
          title: `Continue: ${guide.title}`,
          titleSi: `දිගටම: ${guide.titleSi || guide.title}`,
          content: `Pick up where you left off in the ${guide.title} guide.`,
          contentSi: `${guide.titleSi || guide.title} මාර්ගෝපදේශයේ ඔබ නතර කළ තැනින් ආරම්භ කරන්න.`,
          timestamp: new Date().toISOString(),
          guideId: guide._id,
        });
      });
    }

    // Add latest guides
    latestGuides.forEach((guide) => {
      feedItems.push({
        id: `guide-${guide._id}`,
        type: 'guide',
        title: `New Guide: ${guide.title}`,
        titleSi: `නව මාර්ගෝපදේශය: ${guide.titleSi || guide.title}`,
        content: `New crop guide available for ${guide.cropId}.`,
        contentSi: `${guide.cropId} සඳහා නව බෝග මාර්ගෝපදේශයක් ලබා ගත හැක.`,
        timestamp: guide.createdAt,
        guideId: guide._id,
      });
    });

    // Sort by timestamp (newest first)
    feedItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ success: true, data: feedItems });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all crops
// @route   GET /api/crops
exports.getCrops = async (req, res, next) => {
  try {
    const Crop = require('../models/Crop');
    const crops = await Crop.find().sort({ name: 1 });
    res.json({ success: true, data: crops });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tips
// @route   GET /api/tips
exports.getTips = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.crop) filter.crop = req.query.crop;

    const tips = await Tip.find(filter);
    res.json({ success: true, data: tips });
  } catch (error) {
    next(error);
  }
};
