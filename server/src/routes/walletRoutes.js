const express = require('express');
const router = express.Router();
const {
  createAddMoneyOrder,
  verifyAddMoney,
  updateBankDetails,
  withdrawFunds,
} = require('../controllers/walletController');
const { requireAuth } = require('../middleware/auth');

router.post('/add-money', requireAuth, createAddMoneyOrder);
router.post('/verify', requireAuth, verifyAddMoney);
router.put('/bank-details', requireAuth, updateBankDetails);
router.post('/withdraw', requireAuth, withdrawFunds);

module.exports = router;
