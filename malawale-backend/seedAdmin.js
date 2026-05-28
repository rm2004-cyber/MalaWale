const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User'); 

const ADMIN_NUMBER = "+919999999999"; 

async function insertTestAdmin() {
  try {
    console.log('Connecting to Sanwariya Cloud Cluster...');
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('📿 MongoDB Connected!');

    const existingAdmin = await User.findOne({ phone: ADMIN_NUMBER });
    if (existingAdmin) {
      console.log('⚠️ Test Admin with this number already exists in DB.');
      console.log('Updating role to admin and verifying validation fields...');
      existingAdmin.role = 'admin';
      if (!existingAdmin.firebaseUid) {
        existingAdmin.firebaseUid = 'test-admin-uid-99999';
      }
      await existingAdmin.save();
      console.log('✅ Admin role verified successfully!');
      process.exit(0);
    }

    const testAdmin = new User({
      name: "Sanwariya Admin",
      email: "admin@sanwariya.com",
      phone: ADMIN_NUMBER,
      dob: "1995-01-01",
      role: "admin",
      firebaseUid: "test-admin-uid-99999"
    });

    await testAdmin.save();
    console.log('🔥 Success: Dummy Admin registered directly into cluster nodes!');
    
  } catch (error) {
    console.error('❌ Error caught during script execution:', error.message || error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from DB.');
    process.exit(0);
  }
}

insertTestAdmin();