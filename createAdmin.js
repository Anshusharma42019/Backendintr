require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    console.log('\nExisting users:', users.length);
    users.forEach(u => console.log(`- ${u.email} (${u.username})`));

    const adminData = {
      username: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@invertry.com',
      password: 'admin123',
      role: 'admin',
      department: 'admin',
      phone: '1234567890',
      isActive: true
    };

    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('\nSuperadmin already exists');
      console.log('Email:', adminData.email);
      console.log('Password: admin123');
      process.exit(0);
    }

    const admin = new User(adminData);
    await admin.save();
    console.log('\nSuperadmin created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
