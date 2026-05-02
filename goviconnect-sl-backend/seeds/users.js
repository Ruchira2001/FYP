const User = require('../models/User');
const Expert = require('../models/Expert');
const Shop = require('../models/Shop');
const Meeting = require('../models/Meeting');

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    await Expert.deleteMany({});
    await Shop.deleteMany({});
    await Meeting.deleteMany({});

    // --------- Demo Farmer ---------
    const farmer = await User.create({
      name: 'Nimal Perera',
      email: 'farmer@goviconnect.lk',
      phone: '0771234567',
      password: 'farmer123',
      district: 'Kandy',
      crops: ['tea', 'tomato', 'chili'],
      settings: {
        liteMode: false,
        notifications: true,
        language: 'en',
      },
    });

    const farmer2 = await User.create({
      name: 'Kumari Silva',
      email: 'kumari@goviconnect.lk',
      phone: '0779876543',
      password: 'farmer123',
      district: 'Matara',
      crops: ['paddy', 'coconut'],
      settings: {
        liteMode: false,
        notifications: true,
        language: 'si',
      },
    });

    const farmer3 = await User.create({
      name: 'Kamal Fernando',
      email: 'kamal@goviconnect.lk',
      phone: '0712345678',
      password: 'farmer123',
      district: 'Galle',
      crops: ['cinnamon', 'pepper', 'tea'],
      settings: {
        liteMode: true,
        notifications: true,
        language: 'en',
      },
    });

    console.log(`   ✅ Seeded 3 demo farmers`);

    // --------- Demo Experts ---------
    const expert1 = await Expert.create({
      name: 'Dr. Kamal Perera',
      email: 'expert@goviconnect.lk',
      phone: '0771111111',
      password: 'expert123',
      district: 'Colombo',
      specialty: 'Crop Disease Specialist',
      specialtySi: 'බෝග රෝග විශේෂඥ',
      rating: 4.8,
      totalConsultations: 156,
      farmersHelped: 89,
      yearsExperience: 12,
      qualifications: ['PhD Agriculture - University of Peradeniya', 'MSc Plant Pathology'],
      specializations: ['tomato', 'chili', 'paddy'],
      bio: 'Senior agricultural scientist with 12 years of experience in crop disease management.',
      bioSi: 'බෝග රෝග කළමනාකරණයේ වසර 12 ක පළපුරුද්දක් ඇති ජ්‍යෙෂ්ඨ කෘෂිකාර්මික විද්‍යාඥයා.',
      languages: ['English', 'Sinhala'],
      availability: [
        { day: 'Monday', slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
        { day: 'Tuesday', slots: [{ start: '09:00', end: '12:00' }] },
        { day: 'Wednesday', slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
        { day: 'Thursday', slots: [{ start: '10:00', end: '16:00' }] },
        { day: 'Friday', slots: [{ start: '09:00', end: '12:00' }] },
      ],
      isOnline: true,
    });

    const expert2 = await Expert.create({
      name: 'Prof. Anura Bandara',
      email: 'anura@goviconnect.lk',
      phone: '0772222222',
      password: 'expert123',
      district: 'Kandy',
      specialty: 'Tea & Spice Cultivation Expert',
      specialtySi: 'තේ සහ කුළුබඩු වගා විශේෂඥ',
      rating: 4.9,
      totalConsultations: 230,
      farmersHelped: 145,
      yearsExperience: 20,
      qualifications: ['PhD Horticulture - University of Colombo', 'BSc Agriculture'],
      specializations: ['tea', 'cinnamon', 'pepper', 'ginger'],
      bio: 'Professor of agriculture with 20 years specializing in highland crops and spice cultivation.',
      bioSi: 'කඳුකර බෝග සහ කුළුබඩු වගාවේ විශේෂීකරණය කරමින් වසර 20 ක පළපුරුද්දක් ඇති කෘෂිකාර්මික මහාචාර්ය.',
      languages: ['English', 'Sinhala', 'Tamil'],
      availability: [
        { day: 'Monday', slots: [{ start: '08:00', end: '11:00' }] },
        { day: 'Wednesday', slots: [{ start: '13:00', end: '17:00' }] },
        { day: 'Friday', slots: [{ start: '09:00', end: '15:00' }] },
      ],
      isOnline: false,
    });

    const expert3 = await Expert.create({
      name: 'Dr. Samanthi Jayawardena',
      email: 'samanthi@goviconnect.lk',
      phone: '0773333333',
      password: 'expert123',
      district: 'Matara',
      specialty: 'Organic Farming Specialist',
      specialtySi: 'කාබනික ගොවිතැන් විශේෂඥ',
      rating: 4.7,
      totalConsultations: 98,
      farmersHelped: 67,
      yearsExperience: 8,
      qualifications: ['MSc Sustainable Agriculture', 'Certified Organic Inspector'],
      specializations: ['paddy', 'vegetables', 'coconut'],
      bio: 'Passionate about organic and sustainable farming methods for Sri Lankan smallholders.',
      bioSi: 'ශ්‍රී ලංකාවේ කුඩා ගොවීන් සඳහා කාබනික සහ තිරසාර ගොවිතැන් ක්‍රම පිළිබඳ උනන්දුවක් දක්වයි.',
      languages: ['English', 'Sinhala'],
      availability: [
        { day: 'Tuesday', slots: [{ start: '09:00', end: '13:00' }] },
        { day: 'Thursday', slots: [{ start: '09:00', end: '13:00' }] },
        { day: 'Saturday', slots: [{ start: '10:00', end: '14:00' }] },
      ],
      isOnline: false,
    });

    console.log(`   ✅ Seeded 3 demo experts`);

    // --------- Demo Shops ---------
    await Shop.insertMany([
      {
        name: 'Govi Agri Supplies - Colombo',
        email: 'shop@goviconnect.lk',
        phone: '0774444444',
        password: 'shop123',
        location: 'Colombo',
        address: 'No. 45, Main Street, Colombo 07',
        latitude: 6.9147,
        longitude: 79.8737,
        type: 'Business',
        settings: {
          notifications: true,
          language: 'en',
        },
      },
      {
        name: 'Hill Country Agro Mart',
        email: 'shop2@goviconnect.lk',
        phone: '0775555555',
        password: 'shop123',
        location: 'Kandy',
        address: 'No. 18, Peradeniya Road, Kandy',
        latitude: 7.2921,
        longitude: 80.6335,
        type: 'Business',
        settings: {
          notifications: true,
          language: 'en',
        },
      },
      {
        name: 'Southern Agro Chemicals',
        email: 'shop3@goviconnect.lk',
        phone: '0776666666',
        password: 'shop123',
        location: 'Galle',
        address: 'No. 102, Wakwella Road, Galle',
        latitude: 6.0451,
        longitude: 80.217,
        type: 'Business',
        settings: {
          notifications: true,
          language: 'en',
        },
      },
    ]);

    console.log(`   ✅ Seeded 3 demo shops`);

    // --------- Demo Meetings ---------
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await Meeting.insertMany([
      {
        expertId: expert1._id,
        type: 'group',
        topic: 'Organic Farming Techniques for Beginners',
        topicSi: 'ආරම්භකයින් සඳහා කාබනික ගොවිතැන් ක්‍රම',
        dateTime: nextWeek,
        duration: 90,
        status: 'confirmed',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        maxAttendees: 50,
        registeredUsers: [farmer._id],
      },
      {
        expertId: expert2._id,
        type: 'group',
        topic: 'Tea Cultivation: Advanced Pruning Methods',
        topicSi: 'තේ වගාව: උසස් කප්පාදු ක්‍රම',
        dateTime: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
        duration: 60,
        status: 'confirmed',
        meetingLink: 'https://meet.google.com/klm-nopq-rst',
        maxAttendees: 30,
        registeredUsers: [],
      },
      {
        expertId: expert3._id,
        farmerId: farmer._id,
        type: 'personal',
        topic: 'Tomato Disease Consultation',
        topicSi: 'තක්කාලි රෝග උපදේශනය',
        dateTime: new Date(nextWeek.getTime() + 1 * 24 * 60 * 60 * 1000),
        duration: 30,
        status: 'confirmed',
        meetingLink: 'https://meet.google.com/uvw-xyz-123',
      },
      {
        expertId: expert1._id,
        type: 'group',
        topic: 'Pest Management in Vegetable Gardens',
        topicSi: 'එළවළු වත්තවල පළිබෝධ කළමනාකරණය',
        dateTime: nextMonth,
        duration: 120,
        status: 'pending',
        meetingLink: 'https://meet.google.com/456-789-abc',
        maxAttendees: 100,
        registeredUsers: [farmer._id, farmer2._id],
      },
    ]);

    console.log(`   ✅ Seeded 4 demo meetings`);

    // Print credentials summary
    console.log('\n   📋 Demo Login Credentials:');
    console.log('   ─────────────────────────────────────');
    console.log('   👨‍🌾 Farmer:  farmer@goviconnect.lk / farmer123');
    console.log('   👨‍🌾 Farmer2: kumari@goviconnect.lk / farmer123');
    console.log('   👨‍🌾 Farmer3: kamal@goviconnect.lk / farmer123');
    console.log('   🧑‍🔬 Expert:  expert@goviconnect.lk / expert123');
    console.log('   🧑‍🔬 Expert2: anura@goviconnect.lk / expert123');
    console.log('   🧑‍🔬 Expert3: samanthi@goviconnect.lk / expert123');
    console.log('   🏪 Shop1:   shop@goviconnect.lk / shop123');
    console.log('   🏪 Shop2:   shop2@goviconnect.lk / shop123');
    console.log('   🏪 Shop3:   shop3@goviconnect.lk / shop123');
    console.log('   ─────────────────────────────────────');

  } catch (error) {
    console.error('   ❌ Error seeding users:', error.message);
    throw error;
  }
};

module.exports = { seedUsers };
