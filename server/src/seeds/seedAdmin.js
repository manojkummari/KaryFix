require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('\n💡 To reset admin password, delete the existing admin user first.');
      process.exit(0);
    }

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@karyfix.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📝 Admin credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
