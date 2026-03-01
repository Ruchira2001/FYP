const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('⚠️  If IP whitelist error: Add your current IP at https://cloud.mongodb.com → Network Access');
    // Retry once after 5 seconds
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(async () => {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 45000,
          tls: true,
          tlsAllowInvalidCertificates: false,
        });
        console.log(`MongoDB Atlas Connected (retry): ${conn.connection.host}`);
      } catch (retryError) {
        console.error(`MongoDB retry failed: ${retryError.message}`);
        process.exit(1);
      }
    }, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;
