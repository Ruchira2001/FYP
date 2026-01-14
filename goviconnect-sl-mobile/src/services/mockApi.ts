// Mock API service for simulating backend responses

import { DiagnosisResult, PredictionResult, Meeting } from './storage';

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock crop disease analysis
export const analyzeCropImage = async (imageUri: string): Promise<{
    diseaseName: string;
    diseaseNameSi: string;
    confidence: number;
    treatments: string[];
    treatmentsSi: string[];
    preventionTips: string[];
    preventionTipsSi: string[];
}> => {
    await delay(2000 + Math.random() * 1000);

    const diseases = [
        {
            diseaseName: 'Leaf Blight',
            diseaseNameSi: 'පත්‍ර දාහය',
            confidence: 0.87,
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
                'ජලය දීම් අතර පස වියලීමට ඉඩ දෙන්න',
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
    ];

    return diseases[Math.floor(Math.random() * diseases.length)];
};

// Mock price prediction
export const predictCropPrice = async (
    crop: string,
    landSize: number,
    landUnit: string,
    district?: string,
    season?: string,
): Promise<{
    priceLow: number;
    priceHigh: number;
    summary: string;
    summarySi: string;
}> => {
    await delay(1500 + Math.random() * 1000);

    // Base prices per kg for different crops (in LKR)
    const basePrices: Record<string, { low: number; high: number }> = {
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

    const cropKey = crop.toLowerCase();
    const base = basePrices[cropKey] || { low: 100, high: 200 };

    // Add some randomness
    const variance = 0.1;
    const priceLow = Math.round(base.low * (1 - variance + Math.random() * variance * 2));
    const priceHigh = Math.round(base.high * (1 - variance + Math.random() * variance * 2));

    const summary = `Based on current market trends and your ${landSize} ${landUnit} of ${crop} in ${district || 'your area'}, the estimated price range is Rs. ${priceLow} - ${priceHigh} per kg. ${season ? `The ${season} season typically shows moderate demand.` : ''} Consider monitoring local market prices for optimal selling time.`;

    const summarySi = `වත්මන් වෙළඳපොළ ප්‍රවණතා සහ ${district || 'ඔබේ ප්‍රදේශයේ'} ඔබේ ${landSize} ${landUnit} ${crop} මත පදනම්ව, ඇස්තමේන්තුගත මිල පරාසය කිලෝ ග්‍රෑම් එකකට රු. ${priceLow} - ${priceHigh} වේ. ${season ? `${season} කන්නය සාමාන්‍යයෙන් මධ්‍යස්ථ ඉල්ලුමක් දක්වයි.` : ''} ප්‍රශස්ත විකුණුම් වේලාව සඳහා ප්‍රාදේශීය වෙළඳපොළ මිල නිරීක්ෂණය කිරීම සලකා බලන්න.`;

    return { priceLow, priceHigh, summary, summarySi };
};

// Mock expert availability
export const getExpertAvailability = async (expertId: string): Promise<{
    available: boolean;
    nextSlots: string[];
}> => {
    await delay(500);

    const now = new Date();
    const slots = [];

    for (let i = 1; i <= 5; i++) {
        const slotDate = new Date(now);
        slotDate.setDate(slotDate.getDate() + i);
        slotDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
        slots.push(slotDate.toISOString());
    }

    return {
        available: Math.random() > 0.3,
        nextSlots: slots,
    };
};

// Mock meeting booking
export const bookMeeting = async (
    expertId: string,
    dateTime: string,
    topic: string,
    notes?: string,
): Promise<Meeting> => {
    await delay(1000);

    const meeting: Meeting = {
        id: `meeting_${Date.now()}`,
        expertId,
        expertName: 'Dr. Kamal Perera', // Mock name
        topic,
        topicSi: topic, // In real app, would translate
        dateTime,
        duration: 30,
        status: 'pending',
        notes,
        reminderSet: false,
        source: 'chat_booking',
    };

    return meeting;
};

// Mock send message
export const sendMessage = async (
    chatId: string,
    content: string,
    type: 'text' | 'image' | 'diagnosis' | 'prediction',
): Promise<boolean> => {
    await delay(300 + Math.random() * 500);
    return true;
};
