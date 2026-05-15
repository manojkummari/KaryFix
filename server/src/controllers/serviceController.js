const ServiceCategory = require('../models/ServiceCategory');
const SubService = require('../models/SubService');

// @desc    Get all service categories
// @route   GET /api/services/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const { featured, active } = req.query;

    let query = {};
    if (featured !== undefined) query.featured = featured === 'true';
    if (active !== undefined) query.active = active === 'true';

    const categories = await ServiceCategory.find(query)
      .populate('subservices')
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch categories',
      },
    });
  }
};

// @desc    Get category by ID or slug
// @route   GET /api/services/categories/:identifier
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const { identifier } = req.params;

    let category;
    // Check if identifier is a valid ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      category = await ServiceCategory.findById(identifier).populate('subservices');
    } else {
      // Treat as slug
      category = await ServiceCategory.findOne({ slug: identifier }).populate('subservices');
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch category',
      },
    });
  }
};

// @desc    Get subservices by category
// @route   GET /api/services/categories/:categoryId/subservices
// @access  Public
exports.getSubServicesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { active, popular } = req.query;

    let query = { categoryId };
    if (active !== undefined) query.active = active === 'true';
    if (popular !== undefined) query.popular = popular === 'true';

    const subservices = await SubService.find(query)
      .populate('categoryId', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subservices.length,
      data: subservices,
    });
  } catch (error) {
    console.error('Get subservices error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch subservices',
      },
    });
  }
};

// @desc    Get subservice by ID or slug
// @route   GET /api/services/subservices/:identifier
// @access  Public
exports.getSubServiceById = async (req, res) => {
  try {
    const { identifier } = req.params;

    let subservice;
    // Check if identifier is a valid ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      subservice = await SubService.findById(identifier).populate('categoryId');
    } else {
      // Treat as slug
      subservice = await SubService.findOne({ slug: identifier }).populate('categoryId');
    }

    if (!subservice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBSERVICE_NOT_FOUND',
          message: 'Subservice not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: subservice,
    });
  } catch (error) {
    console.error('Get subservice error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch subservice',
      },
    });
  }
};

// ============ ADMIN ROUTES ============

// @desc    Create new category
// @route   POST /api/services/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, image, active, featured, displayOrder } = req.body;

    // Check if category already exists
    const existingCategory = await ServiceCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CATEGORY_EXISTS',
          message: 'Category with this name already exists',
        },
      });
    }

    const category = await ServiceCategory.create({
      name,
      description,
      icon,
      image,
      active,
      featured,
      displayOrder,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create category',
      },
    });
  }
};

// @desc    Update category
// @route   PUT /api/services/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, image, active, featured, displayOrder } = req.body;

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await ServiceCategory.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_EXISTS',
            message: 'Category with this name already exists',
          },
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (active !== undefined) category.active = active;
    if (featured !== undefined) category.featured = featured;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update category',
      },
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/services/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    // Check if category has subservices
    const subservicesCount = await SubService.countDocuments({ categoryId: id });
    if (subservicesCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CATEGORY_HAS_SUBSERVICES',
          message: `Cannot delete category with ${subservicesCount} subservices. Delete subservices first.`,
        },
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete category',
      },
    });
  }
};

// @desc    Create new subservice
// @route   POST /api/services/admin/subservices
// @access  Private/Admin
exports.createSubService = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      priceRange,
      priceType,
      estimatedDuration,
      features,
      requirements,
      active,
      popular,
      displayOrder,
      images,
    } = req.body;

    // Verify category exists
    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    const subservice = await SubService.create({
      categoryId,
      name,
      description,
      priceRange,
      priceType,
      estimatedDuration,
      features,
      requirements,
      active,
      popular,
      displayOrder,
      images,
    });

    res.status(201).json({
      success: true,
      data: subservice,
    });
  } catch (error) {
    console.error('Create subservice error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create subservice',
      },
    });
  }
};

// @desc    Update subservice
// @route   PUT /api/services/admin/subservices/:id
// @access  Private/Admin
exports.updateSubService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subservice = await SubService.findById(id);

    if (!subservice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBSERVICE_NOT_FOUND',
          message: 'Subservice not found',
        },
      });
    }

    // If categoryId is being changed, verify new category exists
    if (updateData.categoryId && updateData.categoryId !== subservice.categoryId.toString()) {
      const category = await ServiceCategory.findById(updateData.categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
      }
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      subservice[key] = updateData[key];
    });

    await subservice.save();

    res.status(200).json({
      success: true,
      data: subservice,
    });
  } catch (error) {
    console.error('Update subservice error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update subservice',
      },
    });
  }
};

// @desc    Delete subservice
// @route   DELETE /api/services/admin/subservices/:id
// @access  Private/Admin
exports.deleteSubService = async (req, res) => {
  try {
    const { id } = req.params;

    const subservice = await SubService.findById(id);

    if (!subservice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBSERVICE_NOT_FOUND',
          message: 'Subservice not found',
        },
      });
    }

    await subservice.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Subservice deleted successfully',
    });
  } catch (error) {
    console.error('Delete subservice error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete subservice',
      },
    });
  }
};

// @desc    Get all subservices (admin view with all fields)
// @route   GET /api/services/admin/subservices
// @access  Private/Admin
exports.getAllSubServices = async (req, res) => {
  try {
    const { categoryId, active, popular } = req.query;

    let query = {};
    if (categoryId) query.categoryId = categoryId;
    if (active !== undefined) query.active = active === 'true';
    if (popular !== undefined) query.popular = popular === 'true';

    const subservices = await SubService.find(query)
      .populate('categoryId', 'name slug')
      .sort({ categoryId: 1, displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subservices.length,
      data: subservices,
    });
  } catch (error) {
    console.error('Get all subservices error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch subservices',
      },
    });
  }
};
