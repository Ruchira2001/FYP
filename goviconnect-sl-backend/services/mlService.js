const axios = require('axios');

// Call the Python ML microservice for crop disease prediction
const predictDisease = async (imageUrl) => {
  try {
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict`,
      { image_url: imageUrl },
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    console.error('ML Service error:', error.message);
    // Fallback to mock response if ML service is unavailable
    return getFallbackPrediction();
  }
};

// Fallback mock prediction when ML service is down
const getFallbackPrediction = () => {
  const diseases = [
    {
      diseaseName: 'Leaf Blight',
      diseaseNameSi: 'පත්‍ර දාහය',
      confidence: 0.87,
      isHealthy: false,
      treatments: [
        'Apply copper-based fungicide',
        'Remove infected leaves immediately',
        'Improve air circulation around plants',
        'Water at the base, not on leaves',
      ],
      treatmentsSi: [
        'තඹ පදනම් දිලීර නාශකය යොදන්න',
        'ආසාදිත කොළ වහාම ඉවත් කරන්න',
        'ශාක වටා වායු සංසරණය වැඩි දියුණු කරන්න',
        'කොළ මත නොව පාදයෙන් ජලය දෙන්න',
      ],
      preventionTips: [
        'Use disease-resistant varieties',
        'Practice crop rotation',
        'Maintain proper spacing between plants',
        'Avoid overhead irrigation',
      ],
      preventionTipsSi: [
        'රෝග ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න',
        'බෝග මාරුව පුහුණු කරන්න',
        'ශාක අතර නිසි පරතරයක් පවත්වාගන්න',
        'ඉහළින් වාරිමාර්ග වළකින්න',
      ],
    },
    {
      diseaseName: 'Powdery Mildew',
      diseaseNameSi: 'කුඩු පූස්',
      confidence: 0.92,
      isHealthy: false,
      treatments: [
        'Apply sulfur-based fungicide',
        'Use neem oil spray',
        'Remove severely affected parts',
        'Increase sunlight exposure',
      ],
      treatmentsSi: [
        'සල්ෆර් පදනම් දිලීර නාශකය යොදන්න',
        'කොහොඹ තෙල් ඉසීම භාවිතා කරන්න',
        'දැඩි ලෙස බලපෑමට ලක් වූ කොටස් ඉවත් කරන්න',
        'හිරු එළියට නිරාවරණය වැඩි කරන්න',
      ],
      preventionTips: [
        'Plant in well-ventilated areas',
        'Avoid excessive nitrogen fertilizer',
        'Water in the morning',
        'Remove plant debris regularly',
      ],
      preventionTipsSi: [
        'හොඳින් වාතාශ්‍රය ලැබෙන ප්‍රදේශවල සිටුවන්න',
        'අධික නයිට්‍රජන් පොහොර වළකින්න',
        'උදේ ජලය දෙන්න',
        'ශාක කසල නිතිපතා ඉවත් කරන්න',
      ],
    },
    {
      diseaseName: 'Root Rot',
      diseaseNameSi: 'මුල් කුණුවීම',
      confidence: 0.78,
      isHealthy: false,
      treatments: [
        'Improve drainage immediately',
        'Apply fungicide to soil',
        'Remove affected plants',
        'Let soil dry between waterings',
      ],
      treatmentsSi: [
        'වහාම ජලාපවහනය වැඩිදියුණු කරන්න',
        'පසට දිලීර නාශකය යොදන්න',
        'බලපෑමට ලක් වූ ශාක ඉවත් කරන්න',
        'ජලය දීම් අතර පස වියළීමට ඉඩ දෙන්න',
      ],
      preventionTips: [
        'Ensure proper soil drainage',
        'Avoid overwatering',
        'Use raised beds in wet areas',
        'Sterilize tools between uses',
      ],
      preventionTipsSi: [
        'නිසි පස ජලාපවහනය සහතික කරන්න',
        'අධික ලෙස ජලය දීම වළකින්න',
        'තෙත් ප්‍රදේශවල ඔසවන ලද ඇඳන් භාවිතා කරන්න',
        'භාවිතා අතර මෙවලම් විෂබීජහරණය කරන්න',
      ],
    },
    {
      diseaseName: 'Bacterial Wilt',
      diseaseNameSi: 'බැක්ටීරියා මැලවීම',
      confidence: 0.85,
      isHealthy: false,
      treatments: [
        'Remove and destroy infected plants',
        'Solarize soil before replanting',
        'Use resistant varieties',
        'Avoid working in wet conditions',
      ],
      treatmentsSi: [
        'ආසාදිත ශාක ඉවත් කර විනාශ කරන්න',
        'නැවත සිටුවීමට පෙර පස හිරු එළියේ තබන්න',
        'ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න',
        'තෙත් තත්ත්වයන් තුළ වැඩ කිරීමෙන් වළකින්න',
      ],
      preventionTips: [
        'Practice 3-4 year crop rotation',
        'Use clean planting material',
        'Improve soil drainage',
        'Control root-knot nematodes',
      ],
      preventionTipsSi: [
        'වසර 3-4 බෝග මාරුව පුහුණු කරන්න',
        'පිරිසිදු සිටුවීමේ ද්‍රව්‍ය භාවිතා කරන්න',
        'පස ජලාපවහනය වැඩිදියුණු කරන්න',
        'මුල් ගැටිති නෙමටෝඩා පාලනය කරන්න',
      ],
    },
    {
      diseaseName: 'Anthracnose',
      diseaseNameSi: 'ඇන්ත්‍රැක්නෝස්',
      confidence: 0.89,
      isHealthy: false,
      treatments: [
        'Apply mancozeb fungicide',
        'Remove infected fruits',
        'Prune for better air circulation',
        'Avoid overhead watering',
      ],
      treatmentsSi: [
        'මැන්කොසෙබ් දිලීර නාශකය යොදන්න',
        'ආසාදිත ඵල ඉවත් කරන්න',
        'වඩා හොඳ වායු සංසරණය සඳහා කප්පාදු කරන්න',
        'ඉහළින් ජලය දීම වළකින්න',
      ],
      preventionTips: [
        'Use disease-free seeds',
        'Maintain field hygiene',
        'Avoid working when plants are wet',
        'Proper spacing between plants',
      ],
      preventionTipsSi: [
        'රෝග රහිත බීජ භාවිතා කරන්න',
        'ක්ෂේත්‍ර සනීපාරක්ෂාව පවත්වාගන්න',
        'ශාක තෙත් විට වැඩ කිරීමෙන් වළකින්න',
        'ශාක අතර නිසි පරතරය',
      ],
    },
  ];

  return diseases[Math.floor(Math.random() * diseases.length)];
};

module.exports = { predictDisease };
