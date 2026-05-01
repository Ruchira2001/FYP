const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Download image from a URL and return it as a base64 string.
 */
const fetchAsBase64 = async (imageUrl) => {
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 15000,
  });
  return Buffer.from(response.data).toString('base64');
};

/**
 * Call the Python ML microservice with the image from Cloudinary.
 * Sends the image as base64 to /predict/base64.
 * Returns an object matching the shape expected by aiController.js.
 */
const predictDisease = async (imageUrl) => {
  try {
    // Download the image already uploaded to Cloudinary
    const base64Image = await fetchAsBase64(imageUrl);

    const response = await axios.post(
      `${ML_URL}/predict/base64`,
      { image: base64Image },
      { timeout: 60000 }
    );

    const data = response.data;
    if (!data.success) throw new Error(data.error || 'ML service returned an error');

    // Attach unrecognized flag onto the prediction object so aiController can check it
    return { ...data.prediction, unrecognized: !!data.unrecognized };
  } catch (error) {
    console.error('ML Service error:', error.message);
    // Fallback when ML service is unavailable
    return getFallbackPrediction();
  }
};

// Fallback when ML service is unreachable — do NOT fabricate a disease name.
// Return an unrecognized marker so the controller surfaces a clear
// "service unavailable" message to the user instead of a random wrong diagnosis.
const getFallbackPrediction = () => {
  return {
    unrecognized: true,
    class: 'ServiceUnavailable',
    diseaseName: 'Analysis Unavailable',
    diseaseNameSi: 'විශ්ලේෂණය නොලැබේ',
    crop: 'Unknown',
    confidence: 0,
    isHealthy: false,
    treatments: ['The disease analysis service is temporarily unavailable. Please try again in a few minutes or consult an agricultural expert.'],
    treatmentsSi: ['රෝග විශ්ලේෂණ සේවාව තාවකාලිකව නොලැබේ. කරුණාකර මිනිත්තු කිහිපයකින් නැවත උත්සාහ කරන්න හෝ කෘෂිකාර්මික විශේෂඥයෙකු හමුවන්න.'],
    preventionTips: [],
    preventionTipsSi: [],
  };
};

module.exports = { predictDisease };
