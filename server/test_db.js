const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const { createAddMoneyOrder } = require('./src/controllers/walletController');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({});
  console.log("Found user:", user ? user._id : "No user");

  // Mock req, res
  const req = {
    body: { amount: 500 },
    user: { _id: user._id }
  };
  const res = {
    status: function(s) {
      this.statusCode = s;
      return this;
    },
    json: function(data) {
      console.log("Response Status:", this.statusCode);
      console.log("Response Data:", data);
    }
  };

  await createAddMoneyOrder(req, res);
  process.exit(0);
}
test();
