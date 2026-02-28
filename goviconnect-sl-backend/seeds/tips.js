const Tip = require('../models/Tip');

const tipsData = [
  {
    tipId: 'tip-1',
    title: 'Water efficiently',
    titleSi: 'කාර්යක්ෂමව ජලය දෙන්න',
    content: 'Water your crops early morning (6-8 AM) to reduce evaporation and allow leaves to dry before evening.',
    contentSi: 'වාෂ්පීකරණය අඩු කිරීමට සහ සවස් වරුවට පෙර කොළ වියළීමට ඉඩ දීමට ඔබේ බෝගවලට උදේ (උ.ව. 6-8) ජලය දෙන්න.',
    category: 'watering',
    crop: null,
  },
  {
    tipId: 'tip-2',
    title: 'Mulching benefits',
    titleSi: 'වසු ව්‍යාප්තියේ ප්‍රයෝජන',
    content: 'Apply organic mulch around plants to retain moisture, suppress weeds, and regulate soil temperature.',
    contentSi: 'තෙතමනය රඳවා ගැනීමට, වල් මර්දනය කිරීමට, සහ පස් උෂ්ණත්වය නියාමනය කිරීමට ශාක වටා කාබනික වසු තට්ටුවක් යොදන්න.',
    category: 'general',
    crop: null,
  },
  {
    tipId: 'tip-3',
    title: 'Rotate your crops',
    titleSi: 'ඔබේ බෝග මාරු කරන්න',
    content: 'Rotate crops each season to prevent soil-borne diseases and maintain soil fertility.',
    contentSi: 'පසෙන් පැතිරෙන රෝග වැළැක්වීමට සහ පසෙහි සාරවත් බව පවත්වා ගැනීමට සෑම කන්නයකම බෝග මාරු කරන්න.',
    category: 'planting',
    crop: null,
  },
  {
    tipId: 'tip-4',
    title: 'Natural pest control',
    titleSi: 'ස්වභාවික පළිබෝධ පාලනය',
    content: 'Plant marigolds near vegetables to naturally repel aphids and other pests.',
    contentSi: 'ඇෆිඩ් සහ අනෙකුත් පළිබෝධකයන් ස්වභාවිකව පලවා හැරීමට එළවළු අසල මැරිගෝල්ඩ් සිටුවන්න.',
    category: 'pest_control',
    crop: 'vegetables',
  },
  {
    tipId: 'tip-5',
    title: 'Tea fertilization',
    titleSi: 'තේ පොහොර යෙදීම',
    content: 'Apply NPK fertilizer in splits - 40% in March/April and 60% in September/October for tea.',
    contentSi: 'තේ සඳහා NPK පොහොර කොටස් වශයෙන් යොදන්න - 40% මාර්තු/අප්‍රේල් මාසයේදී සහ 60% සැප්තැම්බර්/ඔක්තෝබර් මාසයේදී.',
    category: 'fertilizing',
    crop: 'tea',
  },
  {
    tipId: 'tip-6',
    title: 'Companion planting',
    titleSi: 'සහකාර රෝපණය',
    content: 'Plant basil near tomatoes to improve flavor and repel harmful insects.',
    contentSi: 'රසය වැඩි දියුණු කිරීමට සහ හානිකර කෘමීන් පලවා හැරීමට තක්කාලි අසල සැවැන්දර සිටුවන්න.',
    category: 'planting',
    crop: 'tomato',
  },
  {
    tipId: 'tip-7',
    title: 'Rainy season preparation',
    titleSi: 'වැසි කාලය සඳහා සූදානම',
    content: 'Improve drainage channels before monsoon. Raised beds help prevent waterlogging.',
    contentSi: 'මෝසම් සමයට පෙර ජලාපවහන ඇළ වැඩි දියුණු කරන්න. ඔසවන ලද ඇඳන් ජලය රැඳීම වැළැක්වීමට උපකාරී වේ.',
    category: 'general',
    crop: null,
  },
  {
    tipId: 'tip-8',
    title: 'Paddy water management',
    titleSi: 'වී ජල කළමනාකරණය',
    content: 'Maintain 5cm water level during tillering stage. Drain 2 weeks before harvest.',
    contentSi: 'අතු බෙදීමේ අදියරේදී 5cm ජල මට්ටම පවත්වාගන්න. අස්වැන්නට සති 2කට පෙර ජලය බැස යන්න.',
    category: 'watering',
    crop: 'paddy',
  },
];

const seedTips = async () => {
  try {
    await Tip.deleteMany({});
    const tips = await Tip.insertMany(tipsData);
    console.log(`   ✅ Seeded ${tips.length} tips`);
    return tips;
  } catch (error) {
    console.error('   ❌ Error seeding tips:', error.message);
    throw error;
  }
};

module.exports = { seedTips, tipsData };
