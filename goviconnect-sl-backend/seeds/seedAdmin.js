/**
 * Seed an admin account for the GoviConnect admin dashboard
 * Run: node seeds/seedAdmin.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Admin = require('../models/Admin');

const ADMIN_DATA = {
  name: 'GoviConnect Admin',
  email: 'admin@goviconnect.lk',
  password: 'admin123',
  role: 'superadmin',
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ email: ADMIN_DATA.email });
    if (existing) {
      console.log('Admin already exists, updating password...');
      existing.password = ADMIN_DATA.password;
      await existing.save();
      console.log('Admin password updated.');
    } else {
      await Admin.create(ADMIN_DATA);
      console.log('Admin account created.');
    }

    console.log(`  Email: ${ADMIN_DATA.email}`);
    console.log(`  Password: ${ADMIN_DATA.password}`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
