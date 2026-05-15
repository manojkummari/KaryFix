const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/materialController');

// Public routes
router.get('/', getMaterials);
router.get('/:id', getMaterialById);

// Admin routes for materials
router.post('/', requireAuth, requireRole('admin'), createMaterial);
router.put('/:id', requireAuth, requireRole('admin'), updateMaterial);

// Customer order routes
router.post('/order', requireAuth, createOrder);
router.get('/orders', requireAuth, getMyOrders);
router.get('/order/:id', requireAuth, getOrderById);

// Admin order routes
router.get('/orders/all', requireAuth, requireRole('admin'), getAllOrders);
router.patch('/order/:id', requireAuth, requireRole('admin'), updateOrderStatus);

module.exports = router;
