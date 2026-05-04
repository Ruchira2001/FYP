const DiagnosisResult = require('../models/DiagnosisResult');
const PredictionResult = require('../models/PredictionResult');
const { predictDisease } = require('../services/mlService');
const { getCurrentPrices } = require('../services/priceService');

const CHEMICAL_KEYWORDS = [
  'fungicide',
  'insecticide',
  'herbicide',
  'copper',
  'mancozeb',
  'chlorothalonil',
  'carbendazim',
  'tricyclazole',
  'isoprothiolane',
  'imidacloprid',
  'propineb',
  'hexaconazole',
  'copper hydroxide',
  'copper oxychloride',
  'neem oil',
];

const extractRecommendedChemicals = (treatments = []) => {
  const unique = new Set();

  for (const tip of treatments) {
    const text = (tip || '').toLowerCase();
    for (const keyword of CHEMICAL_KEYWORDS) {
      if (text.includes(keyword)) {
        unique.add(keyword.replace(/\b\w/g, (c) => c.toUpperCase()));
      }
    }
  }

  return Array.from(unique);
};

// Crop Sinhala names mapping
const CROP_SI_NAMES = {
  tea: 'තේ', paddy: 'වී', tomato: 'තක්කාලි', chili: 'මිරිස්',
  potato: 'අර්තාපල්', carrot: 'කැරට්', cabbage: 'ගෝවා', beans: 'බෝංචි',
  mango: 'අඹ', banana: 'කෙසෙල්', coconut: 'පොල්', cinnamon: 'කුරුඳු',
  pepper: 'ගම්මිරිස්', ginger: 'ඉඟුරු', turmeric: 'කහ',
};

// @desc    Analyze crop image for disease
// @route   POST /api/ai/crop-diagnosis
exports.cropDiagnosis = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a crop image' });
    }

    const imageUrl = req.file.path; // Cloudinary URL

    // Call ML service
    const prediction = await predictDisease(imageUrl);

    // Image did not match any supported crop disease
    if (prediction.unrecognized) {
      return res.status(200).json({
        success: true,
        unrecognized: true,
        data: prediction,
      });
    }

    // Save result to database
    const recommendedChemicals =
      prediction.recommendedChemicals?.length > 0
        ? prediction.recommendedChemicals
        : extractRecommendedChemicals(prediction.treatments || []);

    const recommendedChemicalsSi =
      prediction.recommendedChemicalsSi?.length > 0
        ? prediction.recommendedChemicalsSi
        : [];

    const diagnosis = await DiagnosisResult.create({
      userId: req.user._id,
      imageUrl,
      diseaseName: prediction.diseaseName,
      diseaseNameSi: prediction.diseaseNameSi,
      confidence: prediction.confidence,
      treatments: prediction.treatments || [],
      treatmentsSi: prediction.treatmentsSi || [],
      preventionTips: prediction.preventionTips || [],
      preventionTipsSi: prediction.preventionTipsSi || [],
      recommendedChemicals,
      recommendedChemicalsSi,
      isHealthy: prediction.isHealthy || false,
      healthMessage: prediction.healthMessage,
      healthMessageSi: prediction.healthMessageSi,
      synced: true,
    });

    res.status(201).json({
      success: true,
      data: diagnosis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get diagnosis history
// @route   GET /api/ai/diagnosis-history
exports.getDiagnosisHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      DiagnosisResult.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DiagnosisResult.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request expert review for a diagnosis
// @route   POST /api/ai/diagnosis/:id/ask-expert
exports.requestDiagnosisExpertReview = async (req, res, next) => {
  try {
    const diagnosis = await DiagnosisResult.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        expertReviewRequested: true,
        expertReviewRequestedAt: new Date(),
        reviewStatus: 'pending_review',
      },
      { new: true }
    );

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }

    try {
      const io = req.app.get('io') || require('../config/socket').getIO();
      io.to('role_expert').emit('diagnosis_review_requested', {
        diagnosisId: diagnosis._id.toString(),
        farmerId: req.user._id.toString(),
      });
    } catch (socketErr) {
      console.warn('Failed to emit diagnosis review request:', socketErr.message);
    }

    res.json({
      success: true,
      data: diagnosis,
      message: 'Diagnosis sent to experts for review',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save diagnosis result (for offline sync)
// @route   POST /api/ai/diagnosis-history
exports.saveDiagnosisResult = async (req, res, next) => {
  try {
    const result = await DiagnosisResult.create({
      ...req.body,
      userId: req.user._id,
      synced: true,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Predict crop price
// @route   POST /api/ai/price-prediction
exports.pricePrediction = async (req, res, next) => {
  try {
    const { crop, landSize, landUnit, district, season, variety } = req.body;

    if (!crop || !landSize || !landUnit) {
      return res.status(400).json({
        success: false,
        message: 'Crop, land size, and land unit are required',
      });
    }

    const cropKey     = crop.toLowerCase();
    const cropName    = crop.charAt(0).toUpperCase() + crop.slice(1);
    const cropSi      = CROP_SI_NAMES[cropKey] || crop;
    // Sanitize optional fields — empty strings must become undefined to pass Mongoose enum validation
    const cleanSeason   = season   && ['Maha', 'Yala'].includes(season)   ? season   : undefined;
    const cleanDistrict = district && district.trim() ? district.trim() : undefined;

    // Fetch live SL market prices (WFP API) or fall back to HARTI/DOA averages
    const { priceLow, priceHigh, dataSource, fetchedAt } =
      await getCurrentPrices(cropKey, cleanDistrict, cleanSeason);

    const seasonNote = cleanSeason
      ? (cleanSeason === 'Yala'
          ? `The ${cleanSeason} season (Apr–Sep) typically sees lower supply and higher prices.`
          : `The ${cleanSeason} season (Oct–Mar) is peak harvest; supply is higher and prices may be moderate.`)
      : '';

    const districtNote = cleanDistrict ? ` in the ${cleanDistrict} district` : '';

    const summary = `Based on ${dataSource} data (as of ${new Date(fetchedAt).toLocaleDateString('en-LK')}), ` +
      `the estimated farmgate/market price for ${cropName}${districtNote} is Rs. ${priceLow.toLocaleString()} – ${priceHigh.toLocaleString()} per kg. ` +
      `${seasonNote} ` +
      `You have ${landSize} ${landUnit} under cultivation. Monitor local markets (Dambulla, Manning, Narahenpita) for the best selling window.`;

    const summarySi = `${dataSource} දත්ත (${new Date(fetchedAt).toLocaleDateString('si-LK')} දිනට) ` +
      `අනුව${cleanDistrict ? ` ${cleanDistrict} දිස්ත්‍රික්කයේ` : ''} ${cropSi} සඳහා ` +
      `ඇස්තමේන්තුගත වෙළඳපොළ මිල කිලෝ ග්‍රෑම් එකකට රු. ${priceLow.toLocaleString()} – ${priceHigh.toLocaleString()} වේ. ` +
      `${cleanSeason ? (cleanSeason === 'Yala' ? `${cleanSeason} කන්නයේදී සැපයුම අඩු නිසා මිල ඉහළ විය හැක.` : `${cleanSeason} කන්නය ප්‍රධාන අස්වනු කාලය; සැපයුම ඉහළ නිසා මිල මධ්‍යස්ථ විය හැක.`) : ''} ` +
      `ප්‍රශස්ත විකුණුම් අවස්ථාව සඳහා (දඹුල්ල, මැනිං, නාරාහේන්පිට) ප්‍රාදේශීය වෙළඳපොළ නිරීක්ෂණය කරන්න.`;

    // Save prediction
    const prediction = await PredictionResult.create({
      userId: req.user._id,
      crop: cropName,
      cropSi,
      variety,
      landSize,
      landUnit,
      district: cleanDistrict,
      season: cleanSeason,
      priceLow,
      priceHigh,
      summary,
      summarySi,
      synced: true,
    });

    res.status(201).json({
      success: true,
      data: { ...prediction.toObject(), dataSource, priceAsOf: fetchedAt },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prediction history
// @route   GET /api/ai/prediction-history
exports.getPredictionHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      PredictionResult.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PredictionResult.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      success: true,
      data: results,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save prediction result (for offline sync)
// @route   POST /api/ai/prediction-history
exports.savePredictionResult = async (req, res, next) => {
  try {
    const result = await PredictionResult.create({
      ...req.body,
      userId: req.user._id,
      synced: true,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
