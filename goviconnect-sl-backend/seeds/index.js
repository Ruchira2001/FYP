const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const { seedCrops } = require('./crops');
const { seedTips } = require('./tips');
const { seedLearnHub } = require('./learnhub');
const { seedUsers } = require('./users');

const runSeeds = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seeding...\n');

    // Seed in order (users first, then reference data)
    await seedCrops();
    await seedTips();
    await seedLearnHub();
    await seedUsers();

    console.log('\n✅ All seeds completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

runSeeds();
