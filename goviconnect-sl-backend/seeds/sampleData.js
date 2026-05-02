const Product = require('../models/Product');
const Order = require('../models/Order');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const DiagnosisResult = require('../models/DiagnosisResult');
const PredictionResult = require('../models/PredictionResult');
const FarmerRequest = require('../models/FarmerRequest');
const UserCropGuide = require('../models/UserCropGuide');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Shop = require('../models/Shop');

const seedSampleData = async () => {
  try {
    // ── Fetch existing users ──────────────────────────────────
    const farmer = await User.findOne({ email: 'farmer@goviconnect.lk' });
    const farmer2 = await User.findOne({ email: 'kumari@goviconnect.lk' });
    const farmer3 = await User.findOne({ email: 'kamal@goviconnect.lk' });
    const expert1 = await Expert.findOne({ email: 'expert@goviconnect.lk' });
    const expert2 = await Expert.findOne({ email: 'anura@goviconnect.lk' });
    const expert3 = await Expert.findOne({ email: 'samanthi@goviconnect.lk' });
    const shop = await Shop.findOne({ email: 'shop@goviconnect.lk' });
    const shop2 = await Shop.findOne({ email: 'shop2@goviconnect.lk' });
    const shop3 = await Shop.findOne({ email: 'shop3@goviconnect.lk' });

    if (!farmer || !expert1 || !shop || !shop2 || !shop3) {
      throw new Error('Run base seeds first (npm run seed). Missing users/experts/shop.');
    }

    // ── Clear collections ─────────────────────────────────────
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await DiagnosisResult.deleteMany({});
    await PredictionResult.deleteMany({});
    await FarmerRequest.deleteMany({});
    await UserCropGuide.deleteMany({});

    // ══════════════════════════════════════════════════════════
    //  1. PRODUCTS (for the shop)
    // ══════════════════════════════════════════════════════════
    const products = await Product.insertMany([
      {
        shopId: shop._id,
        name: 'Karate 2.5 EC Insecticide',
        nameSi: 'කරාටේ 2.5 EC කෘමිනාශකය',
        category: 'Pesticides',
        description: 'Broad-spectrum insecticide effective against caterpillars, aphids, and thrips on vegetables and rice.',
        targetDisease: 'Caterpillar Attack',
        targetCrops: ['tomato', 'chili', 'paddy', 'cabbage'],
        dosage: '20ml per 16L water tank',
        price: 1250,
        unit: 'bottle (250ml)',
        emoji: '🧴',
        stock: 45,
        availability: 'In Stock',
        manufacturer: 'Syngenta',
        activeIngredient: 'Lambda-Cyhalothrin',
      },
      {
        shopId: shop._id,
        name: 'Mancozeb 80% WP Fungicide',
        nameSi: 'මැන්කොසෙබ් 80% WP දිලීර නාශකය',
        category: 'Fungicides',
        description: 'Contact fungicide for controlling blight, leaf spot, and downy mildew in vegetables.',
        targetDisease: 'Late Blight',
        targetCrops: ['tomato', 'potato', 'chili'],
        dosage: '30g per 16L water tank',
        price: 850,
        unit: 'pack (500g)',
        emoji: '🧪',
        stock: 32,
        availability: 'In Stock',
        manufacturer: 'UPL Limited',
        activeIngredient: 'Mancozeb',
      },
      {
        shopId: shop._id,
        name: 'Albert Fertilizer NPK 15-15-15',
        nameSi: 'ඇල්බට් පොහොර NPK 15-15-15',
        category: 'Fertilizers',
        description: 'Balanced NPK fertilizer suitable for all crops. Promotes healthy growth and higher yield.',
        targetCrops: ['tomato', 'chili', 'paddy', 'beans', 'potato'],
        dosage: '200g per plant, apply monthly',
        price: 3200,
        unit: 'bag (25kg)',
        emoji: '🌿',
        stock: 18,
        availability: 'In Stock',
        manufacturer: 'CIC Agri',
        activeIngredient: 'NPK 15-15-15',
      },
      {
        shopId: shop._id,
        name: 'Glyphosate 360 SL Herbicide',
        nameSi: 'ග්ලයිෆොසේට් 360 SL වල් නාශකය',
        category: 'Herbicides',
        description: 'Non-selective systemic herbicide for weed control before planting.',
        targetCrops: ['tea', 'coconut', 'paddy'],
        dosage: '60ml per 16L water tank',
        price: 1800,
        unit: 'bottle (1L)',
        emoji: '🌾',
        stock: 8,
        availability: 'Low Stock',
        manufacturer: 'Lankem Ceylon',
        activeIngredient: 'Glyphosate',
      },
      {
        shopId: shop._id,
        name: 'Sevin 85 SP Carbaryl',
        nameSi: 'සෙවින් 85 SP කාබරිල්',
        category: 'Pesticides',
        description: 'Effective insecticide against beetles, stem borers, and sucking pests in paddy and vegetables.',
        targetDisease: 'Stem Borer',
        targetCrops: ['paddy', 'cabbage', 'beans'],
        dosage: '25g per 16L water tank',
        price: 950,
        unit: 'pack (250g)',
        emoji: '🐛',
        stock: 25,
        availability: 'In Stock',
        manufacturer: 'Bayer CropScience',
        activeIngredient: 'Carbaryl',
      },
      {
        shopId: shop._id,
        name: 'Organic Compost Super Growth',
        nameSi: 'කාබනික කොම්පෝස්ට් සුපිරි වර්ධනය',
        category: 'Organic',
        description: 'Premium organic compost made from plant residues. Improves soil health and water retention.',
        targetCrops: ['tomato', 'chili', 'carrot', 'beans', 'potato'],
        dosage: '2-3kg per square meter',
        price: 1500,
        unit: 'bag (10kg)',
        emoji: '🥬',
        stock: 40,
        availability: 'In Stock',
        manufacturer: 'Lanka Organic',
      },
      {
        shopId: shop._id,
        name: 'Chlorpyrifos 20 EC',
        nameSi: 'ක්ලෝර්පයිරිෆොස් 20 EC',
        category: 'Pesticides',
        description: 'Broad-spectrum organophosphate insecticide. Controls soil-dwelling and foliar pests.',
        targetDisease: 'White Grub',
        targetCrops: ['tea', 'paddy', 'potato'],
        dosage: '40ml per 16L water tank',
        price: 1100,
        unit: 'bottle (500ml)',
        emoji: '💊',
        stock: 0,
        availability: 'Out of Stock',
        manufacturer: 'Hayleys Agriculture',
        activeIngredient: 'Chlorpyrifos',
      },
      {
        shopId: shop._id,
        name: 'Micro Nutrient Mixture',
        nameSi: 'ක්ෂුද්‍ර පෝෂක මිශ්‍රණය',
        category: 'Fertilizers',
        description: 'Essential micro nutrients including Zinc, Boron, Iron, and Manganese for crop health.',
        targetCrops: ['paddy', 'tea', 'coconut', 'vegetables'],
        dosage: '5g per 1L water - foliar spray',
        price: 680,
        unit: 'pack (200g)',
        emoji: '✨',
        stock: 55,
        availability: 'In Stock',
        manufacturer: 'CIC Agri',
        activeIngredient: 'Zn, B, Fe, Mn',
      },
      {
        shopId: shop._id,
        name: 'Neem Oil Organic Spray',
        nameSi: 'කොහොඹ තෙල් කාබනික ඉසීම',
        category: 'Organic',
        description: 'Cold-pressed neem oil. Natural pest repellent effective against aphids, mealybugs, and mites.',
        targetDisease: 'Aphid Infestation',
        targetCrops: ['tomato', 'chili', 'beans', 'mango'],
        dosage: '5ml per 1L water',
        price: 750,
        unit: 'bottle (500ml)',
        emoji: '🌱',
        stock: 30,
        availability: 'In Stock',
        manufacturer: 'Lanka Organic',
        activeIngredient: 'Azadirachtin',
      },
      {
        shopId: shop._id,
        name: 'Sprayer Pump 16L Manual',
        nameSi: 'ඉසින පොම්පය 16L අත්පොත',
        category: 'Equipment',
        description: 'Heavy-duty manual backpack sprayer with brass nozzle. 16L tank capacity.',
        targetCrops: [],
        price: 4500,
        unit: 'piece',
        emoji: '🔧',
        stock: 12,
        availability: 'In Stock',
        manufacturer: 'Kelani Tools',
      },
      {
        shopId: shop2._id,
        name: 'Tricyclazole 75% WP',
        nameSi: 'ට්‍රයිසයික්ලසෝල් 75% WP',
        category: 'Fungicides',
        description: 'Systemic fungicide recommended for rice leaf blast control.',
        targetDisease: 'Rice Leaf Blast',
        targetCrops: ['paddy'],
        dosage: '6g per 16L water tank',
        price: 980,
        unit: 'pack (120g)',
        emoji: '🌾',
        stock: 38,
        availability: 'In Stock',
        manufacturer: 'Lankem Ceylon',
        activeIngredient: 'Tricyclazole',
      },
      {
        shopId: shop2._id,
        name: 'Carbendazim 50% WP',
        nameSi: 'කාබෙන්ඩසිම් 50% WP',
        category: 'Fungicides',
        description: 'Curative fungicide for brown spot and leaf spot diseases.',
        targetDisease: 'Brown Spot',
        targetCrops: ['paddy', 'chili', 'vegetables'],
        dosage: '10g per 16L water tank',
        price: 760,
        unit: 'pack (100g)',
        emoji: '🧪',
        stock: 44,
        availability: 'In Stock',
        manufacturer: 'Bayer CropScience',
        activeIngredient: 'Carbendazim',
      },
      {
        shopId: shop2._id,
        name: 'Copper Hydroxide 77% WP',
        nameSi: 'කොපර් හයිඩ්‍රොක්සයිඩ් 77% WP',
        category: 'Fungicides',
        description: 'Protective fungicide for bacterial spot and leaf diseases.',
        targetDisease: 'Bacterial Spot',
        targetCrops: ['tomato', 'chili'],
        dosage: '20g per 16L water tank',
        price: 1120,
        unit: 'pack (500g)',
        emoji: '🧫',
        stock: 22,
        availability: 'In Stock',
        manufacturer: 'UPL Limited',
        activeIngredient: 'Copper Hydroxide',
      },
      {
        shopId: shop3._id,
        name: 'Chlorothalonil 720 SC',
        nameSi: 'ක්ලෝරෝතලෝනිල් 720 SC',
        category: 'Fungicides',
        description: 'Broad-spectrum contact fungicide for blights and leaf spots.',
        targetDisease: 'Late Blight',
        targetCrops: ['tomato', 'potato'],
        dosage: '15ml per 16L water tank',
        price: 1450,
        unit: 'bottle (500ml)',
        emoji: '🧴',
        stock: 27,
        availability: 'In Stock',
        manufacturer: 'Syngenta',
        activeIngredient: 'Chlorothalonil',
      },
      {
        shopId: shop3._id,
        name: 'Imidacloprid 200 SL',
        nameSi: 'ඉමිඩැක්ලොප්‍රිඩ් 200 SL',
        category: 'Insecticides',
        description: 'Systemic insecticide for whitefly and sucking pests.',
        targetDisease: 'Leaf Curl Vector Control',
        targetCrops: ['chili', 'tomato', 'beans'],
        dosage: '8ml per 16L water tank',
        price: 980,
        unit: 'bottle (250ml)',
        emoji: '🐞',
        stock: 36,
        availability: 'In Stock',
        manufacturer: 'Hayleys Agriculture',
        activeIngredient: 'Imidacloprid',
      },
      {
        shopId: shop3._id,
        name: 'Propineb 70% WP',
        nameSi: 'ප්‍රොපිනෙබ් 70% WP',
        category: 'Fungicides',
        description: 'Protective fungicide for anthracnose and fruit rots.',
        targetDisease: 'Anthracnose',
        targetCrops: ['chili', 'mango'],
        dosage: '25g per 16L water tank',
        price: 870,
        unit: 'pack (250g)',
        emoji: '🍃',
        stock: 30,
        availability: 'In Stock',
        manufacturer: 'Lankem Ceylon',
        activeIngredient: 'Propineb',
      },
    ]);

    console.log(`   ✅ Seeded ${products.length} products`);

    // ══════════════════════════════════════════════════════════
    //  2. ORDERS (for the shop)
    // ══════════════════════════════════════════════════════════
    const now = new Date();
    const orders = await Order.insertMany([
      {
        shopId: shop._id,
        supplier: 'CIC Agri Holdings',
        items: [
          { name: 'Albert Fertilizer NPK 15-15-15', quantity: 50, price: 3200 },
          { name: 'Micro Nutrient Mixture', quantity: 100, price: 680 },
        ],
        total: 228000,
        status: 'Delivered',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        shopId: shop._id,
        supplier: 'Syngenta Lanka',
        items: [
          { name: 'Karate 2.5 EC Insecticide', quantity: 30, price: 1250 },
        ],
        total: 37500,
        status: 'Delivered',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        shopId: shop._id,
        supplier: 'Lanka Organic Pvt Ltd',
        items: [
          { name: 'Organic Compost Super Growth', quantity: 80, price: 1500 },
          { name: 'Neem Oil Organic Spray', quantity: 40, price: 750 },
        ],
        total: 150000,
        status: 'Processing',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        shopId: shop._id,
        supplier: 'Hayleys Agriculture',
        items: [
          { name: 'Chlorpyrifos 20 EC', quantity: 25, price: 1100 },
          { name: 'Sevin 85 SP Carbaryl', quantity: 20, price: 950 },
        ],
        total: 46500,
        status: 'Pending',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        shopId: shop._id,
        supplier: 'Bayer CropScience',
        items: [
          { name: 'Mancozeb 80% WP Fungicide', quantity: 60, price: 850 },
        ],
        total: 51000,
        status: 'Pending',
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        shopId: shop._id,
        supplier: 'Kelani Tools',
        items: [
          { name: 'Sprayer Pump 16L Manual', quantity: 10, price: 4500 },
        ],
        total: 45000,
        status: 'Cancelled',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`   ✅ Seeded ${orders.length} orders`);

    // ══════════════════════════════════════════════════════════
    //  3. CHATS & MESSAGES
    // ══════════════════════════════════════════════════════════
    // Chat 1: Farmer <-> Expert1 (active, about tomato disease)
    const chat1 = await Chat.create({
      participants: [
        { userId: farmer._id, userModel: 'User', userType: 'farmer', name: farmer.name },
        { userId: expert1._id, userModel: 'Expert', userType: 'expert', name: expert1.name },
      ],
      lastMessage: 'Apply Mancozeb fungicide 30g per 16L tank every 7 days. Also remove infected leaves.',
      lastMessageTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      lastMessageType: 'text',
      hasActiveDiagnosis: true,
      cropTags: ['tomato'],
    });

    // Chat 2: Farmer2 <-> Expert2 (about tea cultivation)
    const chat2 = await Chat.create({
      participants: [
        { userId: farmer2._id, userModel: 'User', userType: 'farmer', name: farmer2.name },
        { userId: expert2._id, userModel: 'Expert', userType: 'expert', name: expert2.name },
      ],
      lastMessage: 'Thank you professor, I will try the new pruning technique this week.',
      lastMessageTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      lastMessageType: 'text',
      cropTags: ['tea'],
    });

    // Chat 3: Farmer3 <-> Expert3 (about organic cinnamon)
    const chat3 = await Chat.create({
      participants: [
        { userId: farmer3._id, userModel: 'User', userType: 'farmer', name: farmer3.name },
        { userId: expert3._id, userModel: 'Expert', userType: 'expert', name: expert3.name },
      ],
      lastMessage: 'We can schedule a field visit next week to check the organic conversion progress.',
      lastMessageTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      lastMessageType: 'text',
      cropTags: ['cinnamon', 'pepper'],
    });

    // Chat 4: Farmer <-> Expert2 (about tea)
    const chat4 = await Chat.create({
      participants: [
        { userId: farmer._id, userModel: 'User', userType: 'farmer', name: farmer.name },
        { userId: expert2._id, userModel: 'Expert', userType: 'expert', name: expert2.name },
      ],
      lastMessage: 'Your tea bushes need VPB fertilizer at this stage. Apply 20g per bush.',
      lastMessageTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      lastMessageType: 'text',
      cropTags: ['tea'],
    });

    console.log(`   ✅ Seeded 4 chats`);

    // Messages for Chat 1 (Farmer <-> Expert1, tomato disease)
    const chat1Messages = await Message.insertMany([
      {
        chatId: chat1._id,
        senderId: farmer._id,
        senderType: 'user',
        content: 'Good morning doctor, my tomato leaves are turning yellow with dark spots. Please help.',
        type: 'text',
        readBy: [farmer._id, expert1._id],
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        chatId: chat1._id,
        senderId: expert1._id,
        senderType: 'expert',
        content: 'Good morning! Can you please send a close-up photo of the affected leaves?',
        type: 'text',
        readBy: [farmer._id, expert1._id],
        createdAt: new Date(now.getTime() - 5.5 * 60 * 60 * 1000),
      },
      {
        chatId: chat1._id,
        senderId: farmer._id,
        senderType: 'user',
        content: 'Here is the photo of the tomato leaf',
        type: 'image',
        readBy: [farmer._id, expert1._id],
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        chatId: chat1._id,
        senderId: expert1._id,
        senderType: 'expert',
        content: 'This looks like Early Blight (Alternaria solani). Very common in humid conditions. Don\'t worry, it is treatable.',
        type: 'text',
        readBy: [farmer._id, expert1._id],
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        chatId: chat1._id,
        senderId: farmer._id,
        senderType: 'user',
        content: 'Oh, what should I do now?',
        type: 'text',
        readBy: [farmer._id, expert1._id],
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        chatId: chat1._id,
        senderId: expert1._id,
        senderType: 'expert',
        content: 'Apply Mancozeb fungicide 30g per 16L tank every 7 days. Also remove infected leaves.',
        type: 'text',
        readBy: [expert1._id],
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    ]);

    // Messages for Chat 2 (Farmer2 <-> Expert2, tea)
    await Message.insertMany([
      {
        chatId: chat2._id,
        senderId: farmer2._id,
        senderType: 'user',
        content: 'Professor, when is the best time to prune tea bushes in Matara?',
        type: 'text',
        readBy: [farmer2._id, expert2._id],
        createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
      },
      {
        chatId: chat2._id,
        senderId: expert2._id,
        senderType: 'expert',
        content: 'For Matara low-country tea, the best pruning time is February-March. Use clean cuts at 45° angle, about 45cm from ground level.',
        type: 'text',
        readBy: [farmer2._id, expert2._id],
        createdAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
      },
      {
        chatId: chat2._id,
        senderId: farmer2._id,
        senderType: 'user',
        content: 'Thank you professor, I will try the new pruning technique this week.',
        type: 'text',
        readBy: [expert2._id],
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    ]);

    // Messages for Chat 3 (Farmer3 <-> Expert3, organic)
    await Message.insertMany([
      {
        chatId: chat3._id,
        senderId: farmer3._id,
        senderType: 'user',
        content: 'I want to convert my cinnamon plantation to fully organic. How long will it take?',
        type: 'text',
        readBy: [farmer3._id, expert3._id],
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        chatId: chat3._id,
        senderId: expert3._id,
        senderType: 'expert',
        content: 'Organic certification typically takes 3 years of transition. During this period, you should start using only approved organic inputs.',
        type: 'text',
        readBy: [farmer3._id, expert3._id],
        createdAt: new Date(now.getTime() - 4.5 * 24 * 60 * 60 * 1000),
      },
      {
        chatId: chat3._id,
        senderId: farmer3._id,
        senderType: 'user',
        content: 'What organic fertilizers do you recommend for cinnamon?',
        type: 'text',
        readBy: [farmer3._id, expert3._id],
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        chatId: chat3._id,
        senderId: expert3._id,
        senderType: 'expert',
        content: 'Use cattle manure (10kg/tree) + compost. Also try neem cake for pest control. I recommend gliricidia as green manure between rows.',
        type: 'text',
        readBy: [farmer3._id, expert3._id],
        createdAt: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000),
      },
      {
        chatId: chat3._id,
        senderId: expert3._id,
        senderType: 'expert',
        content: 'We can schedule a field visit next week to check the organic conversion progress.',
        type: 'text',
        readBy: [expert3._id],
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Messages for Chat 4 (Farmer <-> Expert2, tea fertilizer)
    await Message.insertMany([
      {
        chatId: chat4._id,
        senderId: farmer._id,
        senderType: 'user',
        content: 'Sir, what fertilizer should I apply to my tea bushes after pruning?',
        type: 'text',
        readBy: [farmer._id, expert2._id],
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        chatId: chat4._id,
        senderId: expert2._id,
        senderType: 'expert',
        content: 'Your tea bushes need VPB fertilizer at this stage. Apply 20g per bush.',
        type: 'text',
        readBy: [expert2._id],
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`   ✅ Seeded 16 messages across 4 chats`);

    // ══════════════════════════════════════════════════════════
    //  4. DIAGNOSIS RESULTS
    // ══════════════════════════════════════════════════════════
    const diagnoses = await DiagnosisResult.insertMany([
      {
        userId: farmer._id,
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400',
        diseaseName: 'Early Blight',
        diseaseNameSi: 'මුල්කාලීන පහරවීම',
        confidence: 0.92,
        treatments: [
          'Apply Mancozeb fungicide (30g per 16L tank) every 7 days',
          'Remove and destroy infected leaves',
          'Ensure adequate spacing between plants for air circulation',
          'Avoid overhead irrigation',
        ],
        treatmentsSi: [
          'මැන්කොසෙබ් දිලීර නාශකය (16L ටැංකියකට 30g) දින 7කට වරක් යොදන්න',
          'ආසාදිත කොළ ඉවත් කර විනාශ කරන්න',
          'වාතාශ්‍රය සඳහා ශාක අතර ප්‍රමාණවත් පරතරයක් තබන්න',
          'ඉහළින් ජලය සැපයීම වළක්වන්න',
        ],
        preventionTips: [
          'Practice crop rotation - do not plant tomatoes in the same spot for 2 years',
          'Use disease-resistant varieties like Lanka Cherry or Thilina',
          'Mulch around plants to prevent soil splash',
        ],
        preventionTipsSi: [
          'බෝග මාරුව පුහුණු කරන්න - අවුරුදු 2ක් එකම ස්ථානයේ තක්කාලි සිටුවීම නොකරන්න',
          'ලංකා චෙරි හෝ තිලිණ වැනි රෝග-ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න',
          'පස ඉසිරීම වැළැක්වීමට ශාක වටා ආවරණ යොදන්න',
        ],
        isHealthy: false,
        expertReviewed: true,
        expertId: expert1._id,
        expertDiagnosis: 'Confirmed Early Blight (Alternaria solani). Infection is moderate. Recommend immediate fungicide application.',
        expertNotes: 'Patient should also check neighboring plants. Disease spreads rapidly in humid conditions.',
        reviewStatus: 'verified',
        reviewedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer._id,
        imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
        diseaseName: 'Healthy',
        diseaseNameSi: 'නිරෝගී',
        confidence: 0.97,
        treatments: [],
        treatmentsSi: [],
        preventionTips: [
          'Continue regular watering schedule',
          'Apply fertilizer every 2 weeks',
          'Monitor for any changes in leaf color',
        ],
        preventionTipsSi: [
          'නිතිපතා ජලය සැපයීමේ කාලසටහන දිගටම කරගෙන යන්න',
          'සතිපතා 2 වරක් පොහොර යොදන්න',
          'කොළ වර්ණයේ වෙනස්කම් සඳහා නිරීක්ෂණය කරන්න',
        ],
        isHealthy: true,
        healthMessage: 'Your chili plant looks healthy! No diseases detected.',
        healthMessageSi: 'ඔබේ මිරිස් ශාකය නිරෝගීයි! රෝග හමු නොවීය.',
        expertReviewed: false,
        reviewStatus: 'pending_review',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer2._id,
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        diseaseName: 'Brown Spot',
        diseaseNameSi: 'දුඹුරු පැල්ලම',
        confidence: 0.85,
        treatments: [
          'Apply Carbendazim 50% WP (10g per 16L tank)',
          'Drain excess water from the field',
          'Ensure proper potassium levels in soil',
        ],
        treatmentsSi: [
          'කාබෙන්ඩසිම් 50% WP (16L ටැංකියකට 10g) යොදන්න',
          'ක්ෂේත්‍රයෙන් අතිරික්ත ජලය බැහැර කරන්න',
          'පසෙහි නිසි පොටෑසියම් මට්ටම් සහතික කරන්න',
        ],
        preventionTips: [
          'Use certified disease-free seeds',
          'Maintain proper spacing between paddy rows',
          'Apply silicon-based fertilizers to strengthen cell walls',
        ],
        preventionTipsSi: [
          'සහතිකලත් රෝග-නිදහස් බීජ භාවිතා කරන්න',
          'වී පේළි අතර නිසි පරතරයක් පවත්වන්න',
          'සෛල බිත්ති ශක්තිමත් කිරීමට සිලිකන් පදනම් වූ පොහොර යොදන්න',
        ],
        isHealthy: false,
        expertReviewed: true,
        expertId: expert3._id,
        expertDiagnosis: 'Brown Spot confirmed. Likely caused by nutrient deficiency combined with excessive moisture.',
        expertNotes: 'Recommend soil test to check potassium levels.',
        reviewStatus: 'verified',
        reviewedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer3._id,
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
        diseaseName: 'Leaf Spot',
        diseaseNameSi: 'කොළ පැල්ලම',
        confidence: 0.78,
        treatments: [
          'Apply copper-based fungicide (20ml per 16L tank)',
          'Prune affected branches',
          'Improve drainage around the tree base',
        ],
        treatmentsSi: [
          'තඹ පදනම් වූ දිලීර නාශකය (16L ටැංකියකට 20ml) යොදන්න',
          'බලපෑමට ලක්වූ අතු කප්පාදු කරන්න',
          'ගස් පාමුල වටා ජලනිර්ගමනය වැඩි දියුණු කරන්න',
        ],
        preventionTips: [
          'Maintain proper canopy management',
          'Regular organic fertilizer applications',
        ],
        preventionTipsSi: [
          'නිසි වියන් කළමනාකරණය පවත්වන්න',
          'නිතිපතා කාබනික පොහොර යෙදීම්',
        ],
        isHealthy: false,
        expertReviewed: false,
        reviewStatus: 'pending_review',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`   ✅ Seeded ${diagnoses.length} diagnosis results`);

    // ══════════════════════════════════════════════════════════
    //  5. PREDICTION RESULTS
    // ══════════════════════════════════════════════════════════
    const predictions = await PredictionResult.insertMany([
      {
        userId: farmer._id,
        crop: 'Tomato',
        cropSi: 'තක්කාලි',
        variety: 'Lanka Cherry',
        landSize: 0.5,
        landUnit: 'acres',
        district: 'Kandy',
        season: 'Maha',
        expectedYield: '2,500 - 3,000 kg',
        priceLow: 180,
        priceHigh: 350,
        summary: 'Tomato prices expected to be moderate this Maha season due to steady supply from Kandy district. Peak prices likely in April during off-season transition.',
        summarySi: 'කන්දු දිස්ත්‍රික්කයෙන් ස්ථාවර සැපයුම හේතුවෙන් මෙම මහ කන්නයේ තක්කාලි මිල සාමාන්‍ය මට්ටමක පවතිනු ඇතැයි අපේක්ෂා කෙරේ.',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer._id,
        crop: 'Chili',
        cropSi: 'මිරිස්',
        variety: 'MI Green',
        landSize: 1,
        landUnit: 'acres',
        district: 'Kandy',
        season: 'Yala',
        expectedYield: '1,800 - 2,200 kg',
        priceLow: 450,
        priceHigh: 900,
        summary: 'Chili prices are expected to remain high during Yala season. Strong demand from processing industry. Consider storing harvest for peak price period in August-September.',
        summarySi: 'යල කන්නයේ දී මිරිස් මිල ඉහළ මට්ටමක පවතිනු ඇතැයි අපේක්ෂා කෙරේ. සැකසුම් කර්මාන්තයෙන් ශක්තිමත් ඉල්ලුම.',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer2._id,
        crop: 'Paddy',
        cropSi: 'වී',
        variety: 'BG 360',
        landSize: 2,
        landUnit: 'acres',
        district: 'Matara',
        season: 'Maha',
        expectedYield: '4,000 - 4,800 kg',
        priceLow: 95,
        priceHigh: 120,
        summary: 'Paddy prices should remain stable with government guaranteed price scheme. Expected good yield with adequate rainfall in Southern Province this Maha season.',
        summarySi: 'රජයේ සහතික මිල යෝජනා ක්‍රමය සමඟ වී මිල ස්ථාවරව පවතිනු ඇත.',
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer3._id,
        crop: 'Cinnamon',
        cropSi: 'කුරුඳු',
        variety: 'Sri Vijaya',
        landSize: 3,
        landUnit: 'acres',
        district: 'Galle',
        season: null,
        expectedYield: '800 - 1,000 kg (quills)',
        priceLow: 2800,
        priceHigh: 4500,
        summary: 'Cinnamon export prices continue to rise due to global demand. Premium quality organic cinnamon from Galle can command higher prices. Consider SLS certification.',
        summarySi: 'ගෝලීය ඉල්ලුම හේතුවෙන් කුරුඳු අපනයන මිල ඉහළ යමින් පවතී.',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer._id,
        crop: 'Tea',
        cropSi: 'තේ',
        variety: 'TRI 2025',
        landSize: 1.5,
        landUnit: 'acres',
        district: 'Kandy',
        season: null,
        expectedYield: '1,200 - 1,500 kg (green leaf)',
        priceLow: 120,
        priceHigh: 180,
        summary: 'Tea green leaf prices are expected to maintain current levels. Mid-country tea from Kandy has good demand at Colombo auction.',
        summarySi: 'තේ කොළ මිල වර්තමාන මට්ටම්වල පවතිනු ඇතැයි අපේක්ෂා කෙරේ.',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`   ✅ Seeded ${predictions.length} prediction results`);

    // ══════════════════════════════════════════════════════════
    //  6. FARMER REQUESTS (to experts)
    // ══════════════════════════════════════════════════════════
    const requests = await FarmerRequest.insertMany([
      {
        farmerId: farmer._id,
        expertId: expert1._id,
        farmerName: farmer.name,
        farmerDistrict: farmer.district,
        type: 'diagnosis',
        title: 'Tomato leaves turning yellow',
        description: 'My tomato plants are showing yellow spots on lower leaves. The spots are dark brown in the center. Started seeing this about a week ago.',
        cropName: 'Tomato',
        status: 'completed',
        priority: 'high',
        expertResponse: 'This is Early Blight caused by Alternaria solani. Apply Mancozeb fungicide and remove infected leaves. See our chat for detailed instructions.',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer2._id,
        expertId: expert3._id,
        farmerName: farmer2.name,
        farmerDistrict: farmer2.district,
        type: 'diagnosis',
        title: 'Brown spots on paddy leaves',
        description: 'My BG 360 paddy cultivation is showing brown spots. Some leaves are drying. Happens mostly in the waterlogged area of the field.',
        cropName: 'Paddy',
        status: 'completed',
        priority: 'high',
        expertResponse: 'Confirmed as Brown Spot disease. Drain excess water and apply Carbendazim. Also check your potassium levels with a soil test.',
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer3._id,
        expertId: expert3._id,
        farmerName: farmer3.name,
        farmerDistrict: farmer3.district,
        type: 'consultation',
        title: 'Organic conversion for cinnamon',
        description: 'I want to convert my 3-acre cinnamon plantation in Galle to fully organic. Need guidance on the process, timeline, and recommended organic inputs.',
        cropName: 'Cinnamon',
        status: 'in_review',
        priority: 'medium',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer._id,
        expertId: expert2._id,
        farmerName: farmer.name,
        farmerDistrict: farmer.district,
        type: 'consultation',
        title: 'Tea fertilizer schedule after pruning',
        description: 'Just finished pruning my tea bushes (TRI 2025 variety). What is the recommended fertilizer schedule for the recovery period?',
        cropName: 'Tea',
        status: 'completed',
        priority: 'medium',
        expertResponse: 'Apply VPB fertilizer (20g/bush) immediately after pruning. Follow up with T750 at 6 weeks and T200 at 3 months. See chat for full schedule.',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer2._id,
        expertId: expert1._id,
        farmerName: farmer2.name,
        farmerDistrict: farmer2.district,
        type: 'diagnosis',
        title: 'Coconut beetle attack',
        description: 'Found black beetles boring into my coconut trunks. Several trees affected. Need urgent advice.',
        cropName: 'Coconut',
        status: 'pending',
        priority: 'high',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer3._id,
        expertId: expert2._id,
        farmerName: farmer3.name,
        farmerDistrict: farmer3.district,
        type: 'consultation',
        title: 'Pepper vine support structures',
        description: 'Planning to expand my pepper cultivation. What type of supporting structures work best for black pepper in the lowland wet zone?',
        cropName: 'Pepper',
        status: 'pending',
        priority: 'low',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`   ✅ Seeded ${requests.length} farmer requests`);

    // ══════════════════════════════════════════════════════════
    //  7. NOTIFICATIONS
    // ══════════════════════════════════════════════════════════
    const notifications = await Notification.insertMany([
      // Farmer notifications
      {
        userId: farmer._id,
        userModel: 'User',
        type: 'diagnosis',
        title: 'Diagnosis Review Complete',
        titleSi: 'රෝග විනිශ්චය සමාලෝචනය සම්පූර්ණයි',
        body: 'Dr. Kamal Perera has reviewed your tomato diagnosis. Early Blight confirmed.',
        bodySi: 'ආචාර්ය කමල් පෙරේරා ඔබේ තක්කාලි රෝග විනිශ්චය සමාලෝචනය කර ඇත.',
        read: false,
        data: { diagnosisId: diagnoses[0]._id.toString(), screen: 'DiagnosisDetail' },
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer._id,
        userModel: 'User',
        type: 'meeting',
        title: 'Meeting Reminder',
        titleSi: 'රැස්වීම් මතක් කිරීම',
        body: 'Your group meeting "Organic Farming Techniques" is in 2 days.',
        bodySi: '"කාබනික ගොවිතැන් ක්‍රම" ඔබේ කණ්ඩායම් රැස්වීම දින 2කින්.',
        read: true,
        data: { screen: 'MeetingDetails' },
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer._id,
        userModel: 'User',
        type: 'tip',
        title: 'Daily Farming Tip',
        titleSi: 'දෛනික ගොවිතැන් ඉඟිය',
        body: 'Water your tomato plants early morning to reduce fungal disease risk.',
        bodySi: 'දිලීර රෝග අවදානම අඩු කිරීමට උදෑසන කාලයේ ඔබේ තක්කාලි ශාකවලට ජලය සපයන්න.',
        read: true,
        data: { screen: 'Tips' },
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer._id,
        userModel: 'User',
        type: 'chat',
        title: 'New Message',
        titleSi: 'නව පණිවිඩය',
        body: 'Dr. Kamal Perera sent you treatment instructions.',
        bodySi: 'ආචාර්ය කමල් පෙරේරා ඔබට ප්‍රතිකාර උපදෙස් යැව්වා.',
        read: false,
        data: { chatId: chat1._id.toString(), screen: 'ChatDetail' },
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: farmer._id,
        userModel: 'User',
        type: 'system',
        title: 'Welcome to GoviConnect!',
        titleSi: 'GoviConnect වෙත සාදරයෙන් පිළිගනිමු!',
        body: 'Start by scanning a crop leaf to get instant disease diagnosis.',
        bodySi: 'ක්ෂණික රෝග විනිශ්චයක් ලබා ගැනීමට බෝග කොළයක් ස්කෑන් කිරීමෙන් ආරම්භ කරන්න.',
        read: true,
        data: { screen: 'Home' },
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
      // Farmer2 notifications
      {
        userId: farmer2._id,
        userModel: 'User',
        type: 'diagnosis',
        title: 'Diagnosis Review Complete',
        titleSi: 'රෝග විනිශ්චය සමාලෝචනය සම්පූර්ණයි',
        body: 'Dr. Samanthi has reviewed your paddy diagnosis. Brown Spot confirmed.',
        bodySi: 'ආචාර්ය සමන්ති ඔබේ වී රෝග විනිශ්චය සමාලෝචනය කර ඇත.',
        read: false,
        data: { diagnosisId: diagnoses[2]._id.toString(), screen: 'DiagnosisDetail' },
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer2._id,
        userModel: 'User',
        type: 'guide',
        title: 'New Crop Guide Available',
        titleSi: 'නව බෝග මාර්ගෝපදේශය ලබා ගත හැක',
        body: 'A new guide on "Paddy Cultivation Best Practices" has been published.',
        bodySi: '"වී වගා හොඳම පරිචයන්" පිළිබඳ නව මාර්ගෝපදේශයක් ප්‍රකාශයට පත් කර ඇත.',
        read: true,
        data: { screen: 'LearnHub' },
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      // Expert notifications
      {
        userId: expert1._id,
        userModel: 'Expert',
        type: 'diagnosis',
        title: 'New Diagnosis to Review',
        titleSi: 'සමාලෝචනය කිරීමට නව රෝග විනිශ්චයක්',
        body: 'Kumari Silva submitted a coconut beetle diagnosis for your review.',
        bodySi: 'කුමාරි සිල්වා ඔබේ සමාලෝචනය සඳහා පොල් කුරුමිණි රෝග විනිශ්චයක් ඉදිරිපත් කළාය.',
        read: false,
        data: { screen: 'FarmerRequests' },
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: expert1._id,
        userModel: 'Expert',
        type: 'meeting',
        title: 'Meeting Scheduled',
        titleSi: 'රැස්වීම උපලේඛනගත කරන ලදී',
        body: 'Your group meeting "Organic Farming Techniques" has 1 new registrant.',
        bodySi: '"කාබනික ගොවිතැන් ක්‍රම" ඔබේ කණ්ඩායම් රැස්වීමට නව ලියාපදිංචි කරුවෙකු සිටී.',
        read: true,
        data: { screen: 'Meetings' },
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: expert2._id,
        userModel: 'Expert',
        type: 'chat',
        title: 'New Message from Farmer',
        titleSi: 'ගොවියාගෙන් නව පණිවිඩය',
        body: 'Kamal Fernando asked about pepper vine support structures.',
        bodySi: 'කමල් ප්‍රනාන්දු ගම්මිරිස් වැල් ආධාරක ව්‍යුහ ගැන ඇසුවා.',
        read: false,
        data: { screen: 'ChatsList' },
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      // Shop notifications
      {
        userId: shop._id,
        userModel: 'Shop',
        type: 'system',
        title: 'Low Stock Alert',
        titleSi: 'අඩු තොග ඇඟවීම',
        body: 'Glyphosate 360 SL Herbicide stock is below 10 units. Reorder soon.',
        bodySi: 'Glyphosate 360 SL වල් නාශකයේ තොගය ඒකක 10 ට අඩුයි.',
        read: false,
        data: { screen: 'ShopProducts' },
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        userId: shop._id,
        userModel: 'Shop',
        type: 'system',
        title: 'Order Delivered',
        titleSi: 'ඇණවුම බෙදාහැර ඇත',
        body: 'Your order from CIC Agri Holdings has been delivered successfully.',
        bodySi: 'CIC Agri Holdings වෙතින් ඔබේ ඇණවුම සාර්ථකව බෙදා හර ඇත.',
        read: true,
        data: { screen: 'ShopOrders' },
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        userId: shop._id,
        userModel: 'Shop',
        type: 'system',
        title: 'Out of Stock Warning',
        titleSi: 'තොග අවසන් ඇඟවීම',
        body: 'Chlorpyrifos 20 EC is now out of stock. Update your inventory.',
        bodySi: 'Chlorpyrifos 20 EC දැන් තොගයේ නැත. ඔබේ ඉන්වෙන්ටරි යාවත්කාලීන කරන්න.',
        read: false,
        data: { screen: 'ShopProducts' },
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`   ✅ Seeded ${notifications.length} notifications`);

    // ══════════════════════════════════════════════════════════
    //  8. USER CROP GUIDES (community-submitted)
    // ══════════════════════════════════════════════════════════
    const userGuides = await UserCropGuide.insertMany([
      {
        userId: farmer._id,
        name: 'Kandy Tomato Growing Guide',
        scientificName: 'Solanum lycopersicum',
        category: 'vegetables',
        description: 'My personal guide for growing Lanka Cherry tomatoes in the Kandy hill country. Covers planting to harvest based on 5 years of experience.',
        climate: 'Cool climate (15-25°C). Works best at 500-1000m elevation. Protect from heavy rain during flowering.',
        soil: 'Well-drained loamy soil. pH 6.0-6.8. Add compost and cow dung before planting.',
        season: 'Best planted in October (Maha) or April (Yala). Takes 75-90 days to first harvest.',
        diseases: 'Watch for Early Blight, Late Blight, and leaf curl virus. Spray Mancozeb preventively.',
        treatments: 'For Early Blight: Mancozeb 30g/16L every 7 days. For leaf curl: remove affected plants and control whiteflies.',
        practices: 'Stake plants at 3 weeks. Prune suckers for larger fruits. Mulch heavily. Harvest when 75% red.',
        status: 'approved',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer2._id,
        name: 'Southern Province Paddy Guide',
        scientificName: 'Oryza sativa',
        category: 'paddy',
        description: 'Complete guide for BG 360 paddy cultivation in Matara district wet zone. Includes water management techniques.',
        climate: 'Warm humid zone. Ideal temperature 25-30°C. Needs consistent water supply for first 90 days.',
        soil: 'Heavy clay soil ideal. Maintain 5cm standing water during vegetative stage. Drain 2 weeks before harvest.',
        season: 'Maha season (September-March) gives best yield. Can also grow in Yala (April-August) with irrigation.',
        diseases: 'Common issues: Brown Spot, Blast, Bacterial Leaf Blight. Monitor weekly after tillering stage.',
        treatments: 'Brown Spot: Carbendazim. Blast: Tricyclazole. Prevention is better - use disease-resistant varieties.',
        practices: 'Transplant 21-day seedlings. 20x15cm spacing. Apply fertilizer in 3 splits. Use SRI method for higher yields.',
        status: 'approved',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer3._id,
        name: 'Organic Cinnamon Cultivation',
        scientificName: 'Cinnamomum verum',
        category: 'spices',
        description: 'Guide to organic cinnamon cultivation in Galle district. Focus on natural pest management and organic fertilizers.',
        climate: 'Warm tropical climate (24-28°C). Needs well-distributed rainfall of 2000-2500mm. Grows up to 500m elevation.',
        soil: 'Sandy loam is ideal. Good drainage essential. pH 5.5-6.5. Enrich with compost yearly.',
        season: 'First harvest after 3-4 years. Harvest bark during wet season when peeling is easier (May-June, October-November).',
        diseases: 'Leaf spot, rough bark disease, stripe canker. Use neem oil and copper-based organic sprays.',
        treatments: 'Leaf Spot: Bordeaux mixture (allowed in organic). Rough bark: remove affected bark, apply lime paste.',
        practices: 'Maintain 2x2m spacing. Coppice at 1m height after 3 years. Use gliricidia as shade and green manure.',
        status: 'approved',
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        userId: farmer._id,
        name: 'Hill Country Tea Management',
        scientificName: 'Camellia sinensis',
        category: 'tea',
        description: 'Guide for managing small-scale tea plantations in Kandy area. Focuses on quality green leaf production.',
        climate: 'Cool misty climate ideal. 1000-2000m elevation. Temperature 15-25°C. Annual rainfall 2000-3000mm.',
        soil: 'Acidic soil pH 4.5-5.5. Deep, well-drained. Add dolomite if pH drops below 4.0.',
        season: 'Tea is harvested year-round. Best flush quality during dry spells. Main pruning cycle every 3-4 years.',
        diseases: 'Blister blight, brown blight, root disease. Maintain good drainage and airflow.',
        treatments: 'Blister Blight: Copper fungicide spray. Brown Blight: remove infected shoots. Root disease: improve drainage.',
        practices: 'Pluck two leaves and a bud for quality. Regular plucking every 7-10 days. Apply VPB fertilizer after pruning.',
        status: 'pending',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`   ✅ Seeded ${userGuides.length} user crop guides`);

    console.log('\n   📊 Sample Data Summary:');
    console.log('   ─────────────────────────────────────');
    console.log(`   🛒 Products: ${products.length}`);
    console.log(`   📦 Orders: ${orders.length}`);
    console.log(`   💬 Chats: 4 (with ${chat1Messages.length + 3 + 5 + 2} messages)`);
    console.log(`   🔬 Diagnoses: ${diagnoses.length}`);
    console.log(`   📈 Predictions: ${predictions.length}`);
    console.log(`   📝 Farmer Requests: ${requests.length}`);
    console.log(`   🔔 Notifications: ${notifications.length}`);
    console.log(`   📖 User Guides: ${userGuides.length}`);
    console.log('   ─────────────────────────────────────');

  } catch (error) {
    console.error('   ❌ Error seeding sample data:', error.message);
    throw error;
  }
};

module.exports = { seedSampleData };
