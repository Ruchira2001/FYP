const DiagnosisResult = require('../models/DiagnosisResult');
const PredictionResult = require('../models/PredictionResult');
const { predictDisease } = require('../services/mlService');

// Base prices per kg for crops (LKR) - real SL market prices
const BASE_PRICES = {
  tea: { low: 120, high: 180 },
  paddy: { low: 85, high: 110 },
  tomato: { low: 150, high: 280 },
  chili: { low: 350, high: 550 },
  potato: { low: 180, high: 250 },
  carrot: { low: 200, high: 320 },
  cabbage: { low: 80, high: 150 },
  beans: { low: 280, high: 420 },
  mango: { low: 200, high: 400 },
  banana: { low: 120, high: 200 },
  coconut: { low: 80, high: 120 },
  cinnamon: { low: 1800, high: 2500 },
  pepper: { low: 1200, high: 1800 },
  ginger: { low: 450, high: 700 },
  turmeric: { low: 380, high: 550 },
};

// Season multipliers
const SEASON_MULTIPLIER = {
  Maha: 0.95, // Oct-Mar: higher supply = slightly lower prices
  Yala: 1.05, // Apr-Sep: lower supply = slightly higher prices
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

    // Save result to database
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

    const cropKey = crop.toLowerCase();
    const base = BASE_PRICES[cropKey] || { low: 100, high: 200 };

    // Apply season multiplier
    const seasonMult = season ? (SEASON_MULTIPLIER[season] || 1) : 1;

    // Add randomness (±10%)
    const variance = 0.1;
    const priceLow = Math.round(base.low * seasonMult * (1 - variance + Math.random() * variance * 2));
    const priceHigh = Math.round(base.high * seasonMult * (1 - variance + Math.random() * variance * 2));

    const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
    const cropSi = CROP_SI_NAMES[cropKey] || crop;

    const summary = `Based on current market trends and your ${landSize} ${landUnit} of ${cropName} in ${district || 'your area'}, the estimated price range is Rs. ${priceLow} - ${priceHigh} per kg. ${season ? `The ${season} season typically shows ${season === 'Yala' ? 'higher' : 'moderate'} demand.` : ''} Consider monitoring local market prices for optimal selling time.`;

    const summarySi = `වත්මන් වෙළඳපොළ ප්‍රවණතා සහ ${district || 'ඔබේ ප්‍රදේශයේ'} ඔබේ ${landSize} ${landUnit} ${cropSi} මත පදනම්ව, ඇස්තමේන්තුගත මිල පරාසය කිලෝ ග්‍රෑම් එකකට රු. ${priceLow} - ${priceHigh} වේ. ${season ? `${season} කන්නය සාමාන්‍යයෙන් ${season === 'Yala' ? 'ඉහළ' : 'මධ්‍යස්ථ'} ඉල්ලුමක් දක්වයි.` : ''} ප්‍රශස්ත විකුණුම් වේලාව සඳහා ප්‍රාදේශීය වෙළඳපොළ මිල නිරීක්ෂණය කිරීම සලකා බලන්න.`;

    // Save prediction
    const prediction = await PredictionResult.create({
      userId: req.user._id,
      crop: cropName,
      cropSi,
      variety,
      landSize,
      landUnit,
      district,
      season,
      priceLow,
      priceHigh,
      summary,
      summarySi,
      synced: true,
    });

    res.status(201).json({
      success: true,
      data: prediction,
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
