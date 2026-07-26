const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Enable fallback DNS for Windows SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const User = require('../src/models/User');

const createAdmin = async () => {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const name = args[2] || 'System Admin';

  if (!email || !password) {
    console.error('❌ Usage: node scripts/createAdmin.js <email> <password> [name]');
    console.error('   Example: node scripts/createAdmin.js admin@domain.com "SuperSecret123!" "Chief Admin"');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is missing in backend/.env file.');
    process.exit(1);
  }

  try {
    console.log(`[Admin CLI] Connecting to MongoDB Atlas...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Admin CLI] MongoDB Connected.`);

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.role = 'ADMIN';
      user.password = password; // pre-save hook will hash password
      if (name) user.name = name;
      await user.save();
      console.log(`✅ Existing user '${email}' promoted to ADMIN role successfully!`);
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password, // pre-save hook will hash password
        role: 'ADMIN',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      });
      console.log(`✅ New Admin account '${email}' created successfully!`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`❌ Admin Creation Failed: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
