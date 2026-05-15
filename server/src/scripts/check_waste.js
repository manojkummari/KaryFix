const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WasteSale = require('../models/WasteSale');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkWaste = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const latest = await WasteSale.findOne().sort({ createdAt: -1 });
    console.log('Latest Waste Sale:', latest);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkWaste();
