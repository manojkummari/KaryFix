const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create Razorpay order to add money to wallet
// @route   POST /api/wallet/add-money
// @access  Private
exports.createAddMoneyOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create Wallet Order Error:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
};

// @desc    Verify payment and add money to wallet
// @route   POST /api/wallet/verify
// @access  Private
exports.verifyAddMoney = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const user = await User.findById(req.user._id);
      
      // Update balance
      user.wallet.balance += Number(amount);
      
      // Add transaction
      user.wallet.transactions.push({
        type: 'credit',
        amount: Number(amount),
        description: 'Added funds to wallet via Razorpay',
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Funds added successfully',
        data: {
          balance: user.wallet.balance,
          transactions: user.wallet.transactions
        }
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify Wallet Payment Error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
};

// @desc    Update user bank details
// @route   PUT /api/wallet/bank-details
// @access  Private
exports.updateBankDetails = async (req, res) => {
  try {
    const { accountName, accountNumber, ifscCode } = req.body;
    
    if (!accountName || !accountNumber || !ifscCode) {
      return res.status(400).json({ success: false, error: 'Please provide all bank details' });
    }

    const user = await User.findById(req.user._id);
    
    user.bankDetails = {
      accountName,
      accountNumber,
      ifscCode,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Bank details updated successfully',
      data: user.bankDetails
    });
  } catch (error) {
    console.error('Update Bank Details Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update bank details' });
  }
};

// @desc    Withdraw funds from wallet (Simulated Payout)
// @route   POST /api/wallet/withdraw
// @access  Private
exports.withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      return res.status(400).json({ success: false, error: 'Please link a bank account first' });
    }

    if (user.wallet.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
    }

    // Deduct balance
    user.wallet.balance -= amount;
    
    // Add transaction
    user.wallet.transactions.push({
      type: 'debit',
      amount: amount,
      description: `Withdrawal to A/C ending in ${user.bankDetails.accountNumber.slice(-4)}`,
    });

    await user.save();

    // In a real production app with RazorpayX, you would trigger the payout API here.
    // e.g. POST to https://api.razorpay.com/v1/payouts

    res.status(200).json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        balance: user.wallet.balance,
        transactions: user.wallet.transactions
      }
    });

  } catch (error) {
    console.error('Withdraw Funds Error:', error);
    res.status(500).json({ success: false, error: 'Failed to withdraw funds' });
  }
};
