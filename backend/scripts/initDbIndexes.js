const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const User = require('../src/models/User');
const DoctorProfile = require('../src/models/DoctorProfile');
const Appointment = require('../src/models/Appointment');
const Prescription = require('../src/models/Prescription');
const ChatMessage = require('../src/models/ChatMessage');
const Review = require('../src/models/Review');

const initIndexes = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI missing in .env');
    process.exit(1);
  }

  try {
    console.log('[Index Init] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[Index Init] Connected. Synchronizing indexes across models...');

    await User.syncIndexes();
    console.log('  ✔ User indexes built.');

    await DoctorProfile.syncIndexes();
    console.log('  ✔ DoctorProfile indexes built.');

    await Appointment.syncIndexes();
    console.log('  ✔ Appointment compound indexes built.');

    await Prescription.syncIndexes();
    console.log('  ✔ Prescription indexes built.');

    await ChatMessage.syncIndexes();
    console.log('  ✔ ChatMessage indexes built.');

    await Review.syncIndexes();
    console.log('  ✔ Review indexes built.');

    console.log('✅ All production database indexes synchronized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Index Init Error:', err.message);
    process.exit(1);
  }
};

initIndexes();
