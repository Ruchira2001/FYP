const DiagnosisResult = require('../models/DiagnosisResult');
const PredictionResult = require('../models/PredictionResult');
const Meeting = require('../models/Meeting');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { predictDisease } = require('../services/mlService');

// @desc    Bulk sync queued offline actions
// @route   POST /api/sync
exports.syncActions = async (req, res, next) => {
  try {
    const { actions } = req.body;
    if (!actions || !Array.isArray(actions)) {
      return res.status(400).json({ success: false, message: 'Actions array is required' });
    }

    const results = [];

    for (const action of actions) {
      try {
        let result;

        switch (action.type) {
          case 'analyze_crop': {
            // The image was already uploaded. Call ML service with saved image URL
            const prediction = await predictDisease(action.data.imageUrl || action.data.imageUri);
            result = await DiagnosisResult.create({
              userId: req.user._id,
              imageUrl: action.data.imageUrl || action.data.imageUri,
              diseaseName: prediction.diseaseName,
              diseaseNameSi: prediction.diseaseNameSi,
              confidence: prediction.confidence,
              treatments: prediction.treatments || [],
              treatmentsSi: prediction.treatmentsSi || [],
              preventionTips: prediction.preventionTips || [],
              preventionTipsSi: prediction.preventionTipsSi || [],
              isHealthy: prediction.isHealthy || false,
              synced: true,
            });
            break;
          }

          case 'predict_price': {
            const { crop, landSize, landUnit, district, season } = action.data;
            // Reuse price prediction logic
            const basePrices = {
              tea: { low: 120, high: 180 }, paddy: { low: 85, high: 110 },
              tomato: { low: 150, high: 280 }, chili: { low: 350, high: 550 },
              potato: { low: 180, high: 250 }, carrot: { low: 200, high: 320 },
              cabbage: { low: 80, high: 150 }, beans: { low: 280, high: 420 },
              mango: { low: 200, high: 400 }, banana: { low: 120, high: 200 },
              coconut: { low: 80, high: 120 }, cinnamon: { low: 1800, high: 2500 },
              pepper: { low: 1200, high: 1800 }, ginger: { low: 450, high: 700 },
              turmeric: { low: 380, high: 550 },
            };
            const base = basePrices[crop.toLowerCase()] || { low: 100, high: 200 };
            const variance = 0.1;
            const priceLow = Math.round(base.low * (1 + (Math.random() - 0.5) * variance * 2));
            const priceHigh = Math.round(base.high * (1 + (Math.random() - 0.5) * variance * 2));

            result = await PredictionResult.create({
              userId: req.user._id,
              crop, landSize, landUnit, district, season,
              priceLow, priceHigh,
              summary: `Estimated price: Rs. ${priceLow} - ${priceHigh}/kg`,
              summarySi: `ඇස්තමේන්තුගත මිල: රු. ${priceLow} - ${priceHigh}/kg`,
              synced: true,
            });
            break;
          }

          case 'book_meeting': {
            const Expert = require('../models/Expert');
            const expert = await Expert.findById(action.data.expertId);
            if (expert) {
              result = await Meeting.create({
                expertId: action.data.expertId,
                farmerId: req.user._id,
                expertName: expert.name,
                farmerName: req.user.name,
                topic: action.data.topic,
                topicSi: action.data.topicSi || action.data.topic,
                dateTime: new Date(action.data.dateTime),
                duration: action.data.duration || 30,
                status: 'pending',
                source: action.data.source || 'scheduled',
                meetingLink: `https://meet.goviconnect.lk/meeting_${Date.now()}`,
              });
            }
            break;
          }

          case 'send_message': {
            const { chatId, content, type, attachmentData } = action.data;
            const senderType = req.userRole === 'farmer' ? 'user' : 'expert';

            result = await Message.create({
              chatId,
              senderId: req.user._id,
              senderType,
              content,
              type: type || 'text',
              attachmentData,
              readBy: [req.user._id],
              synced: true,
            });

            // Update chat
            await Chat.findByIdAndUpdate(chatId, {
              lastMessage: content.substring(0, 100),
              lastMessageTime: new Date(),
            });
            break;
          }

          case 'save_item': {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user._id, {
              $addToSet: { savedGuides: action.data.guideId },
            });
            result = { saved: true };
            break;
          }

          default:
            result = { error: `Unknown action type: ${action.type}` };
        }

        results.push({
          type: action.type,
          success: true,
          data: result,
          localId: action.localId,
        });
      } catch (actionError) {
        results.push({
          type: action.type,
          success: false,
          error: actionError.message,
          localId: action.localId,
        });
      }
    }

    res.json({
      success: true,
      data: results,
      synced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    next(error);
  }
};
