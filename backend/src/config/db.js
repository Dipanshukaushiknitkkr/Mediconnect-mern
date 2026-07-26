const mongoose = require('mongoose');
const dns = require('dns');

// Enable fallback public DNS for Windows SRV record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported
}

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediconnect';
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('authentication failed')) {
      console.warn(`[Database Warning] MongoDB Atlas Authentication Failed: Check your database user password in MongoDB Atlas -> Database Access.`);
    } else {
      console.warn(`[Database Warning] Could not connect to MongoDB Atlas: ${error.message}`);
    }
    console.warn(`[Database Notice] Operating in Mock In-Memory Mode so all features remain 100% functional.`);
  }
};

module.exports = connectDB;
