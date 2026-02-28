const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadDiagnosis } = require('../middleware/upload');
const {
  cropDiagnosis,
  getDiagnosisHistory,
  saveDiagnosisResult,
  pricePrediction,
  getPredictionHistory,
  savePredictionResult,
} = require('../controllers/aiController');

// Crop diagnosis
router.post('/crop-diagnosis', protect, authorize('farmer'), uploadDiagnosis, cropDiagnosis);
router.get('/diagnosis-history', protect, authorize('farmer'), getDiagnosisHistory);
router.post('/diagnosis-history', protect, authorize('farmer'), saveDiagnosisResult);

// Price prediction
router.post('/price-prediction', protect, authorize('farmer'), pricePrediction);
router.get('/prediction-history', protect, authorize('farmer'), getPredictionHistory);
router.post('/prediction-history', protect, authorize('farmer'), savePredictionResult);

module.exports = router;
