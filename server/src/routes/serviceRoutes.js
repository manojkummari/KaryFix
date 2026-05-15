const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  getSubServicesByCategory,
  getSubServiceById,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubService,
  updateSubService,
  deleteSubService,
  getAllSubServices,
} = require('../controllers/serviceController');
const { requireAuth, requireRole } = require('../middleware/auth');

// ============ PUBLIC ROUTES ============

// Category routes
router.get('/categories', getAllCategories);
router.get('/categories/:identifier', getCategoryById);
router.get('/categories/:categoryId/subservices', getSubServicesByCategory);

// Subservice routes
router.get('/subservices/:identifier', getSubServiceById);

// ============ ADMIN ROUTES ============

// Category management
router.post('/admin/categories', requireAuth, requireRole('admin'), createCategory);
router.put('/admin/categories/:id', requireAuth, requireRole('admin'), updateCategory);
router.delete('/admin/categories/:id', requireAuth, requireRole('admin'), deleteCategory);

// Subservice management
router.get('/admin/subservices', requireAuth, requireRole('admin'), getAllSubServices);
router.post('/admin/subservices', requireAuth, requireRole('admin'), createSubService);
router.put('/admin/subservices/:id', requireAuth, requireRole('admin'), updateSubService);
router.delete('/admin/subservices/:id', requireAuth, requireRole('admin'), deleteSubService);

module.exports = router;
