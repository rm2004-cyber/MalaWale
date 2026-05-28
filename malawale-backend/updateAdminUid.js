const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User'); // Apne User schema model ka sahi path verify kar lena

const TARGET_PHONE = "+919999999999"; 
const LIVE_FIREBASE_UID = "ywEBiIqxpQUgPKbNKl4voK8kcFS2"; // 🔥 Live context key from console payload

async function syncAdminCredentials() {
  try {
    console.log('Connecting to Sanwariya Cloud Cluster...');
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('📿 MongoDB Connected!');

    // Find the current admin entry
    const adminUser = await User.findOne({ phone: TARGET_PHONE });

    if (!adminUser) {
      console.log('❌ Error: Admin entry with +919999999999 not found in DB.');
      console.log('Creating a brand new synchronized admin document...');
      
      const newAdmin = new User({
        name: "Sanwariya Admin",
        email: "admin@sanwariya.com",
        phone: TARGET_PHONE,
        dob: "1995-01-01",
        role: "admin",
        firebaseUid: LIVE_FIREBASE_UID // Safe sync directly on create
      });
      
      await newAdmin.save();
      console.log('🔥 Success: Synchronized Admin registered directly into nodes!');
    } else {
      console.log('📦 Existing Admin found. Syncing live parameters...');
      adminUser.role = 'admin';
      adminUser.firebaseUid = LIVE_FIREBASE_UID; // Update old placeholder string with actual real uid
      
      await adminUser.save();
      console.log('✅ Success: Admin document fully synchronized with live Firebase instance!');
    }

  } catch (error) {
    console.error('❌ Sync script failure execution loop:', error.message || error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from DB.');
    process.exit(0);
  }
}

syncAdminCredentials();