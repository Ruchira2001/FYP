const Crop = require('../models/Crop');

const cropsData = [
  { cropId: 'tea', name: 'Tea', nameSi: 'තේ', scientificName: 'Camellia sinensis', category: 'tea', icon: '🍵', color: '#15803d' },
  { cropId: 'paddy', name: 'Paddy', nameSi: 'වී', scientificName: 'Oryza sativa', category: 'paddy', icon: '🌾', color: '#ca8a04' },
  { cropId: 'tomato', name: 'Tomato', nameSi: 'තක්කාලි', scientificName: 'Solanum lycopersicum', category: 'vegetables', icon: '🍅', color: '#dc2626' },
  { cropId: 'chili', name: 'Chili', nameSi: 'මිරිස්', scientificName: 'Capsicum annuum', category: 'vegetables', icon: '🌶️', color: '#ea580c' },
  { cropId: 'potato', name: 'Potato', nameSi: 'අර්තාපල්', scientificName: 'Solanum tuberosum', category: 'vegetables', icon: '🥔', color: '#a16207' },
  { cropId: 'carrot', name: 'Carrot', nameSi: 'කැරට්', scientificName: 'Daucus carota', category: 'vegetables', icon: '🥕', color: '#ea580c' },
  { cropId: 'cabbage', name: 'Cabbage', nameSi: 'ගෝවා', scientificName: 'Brassica oleracea var. capitata', category: 'vegetables', icon: '🥬', color: '#16a34a' },
  { cropId: 'beans', name: 'Beans', nameSi: 'බෝංචි', scientificName: 'Phaseolus vulgaris', category: 'vegetables', icon: '🫘', color: '#65a30d' },
  { cropId: 'mango', name: 'Mango', nameSi: 'අඹ', scientificName: 'Mangifera indica', category: 'fruits', icon: '🥭', color: '#f59e0b' },
  { cropId: 'banana', name: 'Banana', nameSi: 'කෙසෙල්', scientificName: 'Musa acuminata', category: 'fruits', icon: '🍌', color: '#eab308' },
  { cropId: 'coconut', name: 'Coconut', nameSi: 'පොල්', scientificName: 'Cocos nucifera', category: 'fruits', icon: '🥥', color: '#78716c' },
  { cropId: 'cinnamon', name: 'Cinnamon', nameSi: 'කුරුඳු', scientificName: 'Cinnamomum verum', category: 'spices', icon: '🪵', color: '#92400e' },
  { cropId: 'pepper', name: 'Black Pepper', nameSi: 'ගම්මිරිස්', scientificName: 'Piper nigrum', category: 'spices', icon: '🫑', color: '#1c1917' },
  { cropId: 'ginger', name: 'Ginger', nameSi: 'ඉඟුරු', scientificName: 'Zingiber officinale', category: 'spices', icon: '🫚', color: '#d97706' },
  { cropId: 'turmeric', name: 'Turmeric', nameSi: 'කහ', scientificName: 'Curcuma longa', category: 'spices', icon: '🟡', color: '#ca8a04' },
];

const seedCrops = async () => {
  try {
    await Crop.deleteMany({});
    const crops = await Crop.insertMany(cropsData);
    console.log(`   ✅ Seeded ${crops.length} crops`);
    return crops;
  } catch (error) {
    console.error('   ❌ Error seeding crops:', error.message);
    throw error;
  }
};

module.exports = { seedCrops, cropsData };
