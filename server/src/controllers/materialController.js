const ConstructionMaterial = require('../models/ConstructionMaterial');
const MaterialOrder = require('../models/MaterialOrder');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Public
exports.getMaterials = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = { active: true };

    if (category) filter.category = category;
    if (featured) filter.featured = true;

    const materials = await ConstructionMaterial.find(filter).sort({ featured: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching materials',
      error: error.message,
    });
  }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Public
exports.getMaterialById = async (req, res) => {
  try {
    const material = await ConstructionMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching material',
      error: error.message,
    });
  }
};

// @desc    Create a material (Admin)
// @route   POST /api/materials
// @access  Private (Admin)
exports.createMaterial = async (req, res) => {
  try {
    const material = await ConstructionMaterial.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating material',
      error: error.message,
    });
  }
};

// @desc    Update a material (Admin)
// @route   PUT /api/materials/:id
// @access  Private (Admin)
exports.updateMaterial = async (req, res) => {
  try {
    const material = await ConstructionMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating material',
      error: error.message,
    });
  }
};

// @desc    Place an order
// @route   POST /api/materials/order
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, deliveryNotes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one item to your order',
      });
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const material = await ConstructionMaterial.findById(item.materialId);
      if (!material) {
        return res.status(400).json({
          success: false,
          message: `Material with ID ${item.materialId} not found`,
        });
      }

      if (material.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${material.name}. Available: ${material.stock}`,
        });
      }

      const itemTotal = material.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        materialId: material._id,
        name: material.name,
        quantity: item.quantity,
        price: material.price,
        unit: material.unit,
      });

      // Reduce stock
      material.stock -= item.quantity;
      await material.save();
    }

    const order = await MaterialOrder.create({
      customerId: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cash',
      deliveryNotes: deliveryNotes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message,
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/materials/orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await MaterialOrder.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.materialId', 'name image');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/materials/order/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await MaterialOrder.findById(req.params.id)
      .populate('customerId', 'name phone email')
      .populate('items.materialId', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/materials/order/:id
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryDate, note } = req.body;
    const order = await MaterialOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    if (deliveryDate) order.deliveryDate = deliveryDate;

    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || '',
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message,
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/materials/orders/all
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await MaterialOrder.find(filter)
      .sort({ createdAt: -1 })
      .populate('customerId', 'name phone email');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};
