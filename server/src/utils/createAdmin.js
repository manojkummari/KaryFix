const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/karyfix');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);

      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        readline.question('\nDo you want to create another admin? (y/n): ', async (answer) => {
          readline.close();
          if (answer.toLowerCase() !== 'y') {
            console.log('\n❌ Admin creation cancelled.');
            await mongoose.connection.close();
            process.exit(0);
          }
          await promptAndCreateAdmin();
          resolve();
        });
      });
    }

    await promptAndCreateAdmin();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const promptAndCreateAdmin = async () => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => readline.question(query, resolve));

  try {
    console.log('\n📝 Enter admin user details:\n');

    const name = await question('Name: ');
    const email = await question('Email: ');
    const password = await question('Password (min 6 characters): ');
    const phone = await question('Phone (optional): ');

    // Validation
    if (!name || !email || !password) {
      console.log('\n❌ Name, email, and password are required!');
      readline.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters long!');
      readline.close();
      await mongoose.connection.close();
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n❌ User with this email already exists!');
      console.log('   Current role:', existingUser.role);

      const updateRole = await question('\nDo you want to update this user to admin role? (y/n): ');
      if (updateRole.toLowerCase() === 'y') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('\n✅ User role updated to admin successfully!');
        console.log('\n👤 Admin User Details:');
        console.log('   Name:', existingUser.name);
        console.log('   Email:', existingUser.email);
        console.log('   Role:', existingUser.role);
      } else {
        console.log('\n❌ Admin creation cancelled.');
      }
      readline.close();
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      role: 'admin',
      isVerified: true,
      wallet: {
        balance: 0,
        walletId: `WALLET-${Date.now()}`,
      },
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n👤 Admin User Details:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Phone:', adminUser.phone || 'Not provided');
    console.log('   Role:', adminUser.role);
    console.log('\n🔑 Login Credentials:');
    console.log('   Email:', adminUser.email);
    console.log('   Password: [hidden for security]');
    console.log('\n💡 You can now login at: http://localhost:5173/login');

    readline.close();
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    readline.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createAdminUser();
