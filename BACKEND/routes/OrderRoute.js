// Route/OrderRoute.js
const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  addOrder,
  updateOrder,
  deleteOrder,
  getOrdersByUser
} = require("../Controllers/OrderControler");

console.log("✅ Order routes module loaded");

// ✅ CRITICAL: POST route MUST be FIRST (before any /:id routes)
router.post("/", addOrder);

// Get all orders
router.get("/", getAllOrders);

// ✅ NEW: Get recent paid orders (for delivery assignment) - MUST be before /:id
router.get("/recent", async (req, res) => {
  try {
    const Order = require('../models/OrderModel');
    const Delivery = require('../models/Delivery');
    
    console.log('📦 Fetching recent paid orders for delivery assignment');
    
    // Find paid orders
    const paidOrders = await Order.find({ 
      status: 'paid',
      isPaid: true 
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
    
    console.log(`Found ${paidOrders.length} paid orders`);
    
    // Filter out orders that already have delivery assigned
    const orderIds = paidOrders.map(o => o._id);
    const existingDeliveries = await Delivery.find({ 
      order: { $in: orderIds } 
    }).select('order');
    
    const assignedOrderIds = new Set(
      existingDeliveries.map(d => d.order.toString())
    );
    
    const availableOrders = paidOrders.filter(
      o => !assignedOrderIds.has(o._id.toString())
    );
    
    console.log(`${availableOrders.length} orders available for delivery assignment`);
    
    res.json(availableOrders);
  } catch (error) {
    console.error('❌ Error fetching recent orders:', error);
    res.status(500).json({ 
      message: 'Failed to fetch recent orders', 
      error: error.message 
    });
  }
});

// Get orders by user ID - MUST be before /:id route
router.get("/user/:userId", getOrdersByUser);

// Get order by ID - AFTER all specific routes
router.get("/:id", getOrderById);

// Update order
router.put("/:id", updateOrder);

// Delete order
router.delete("/:id", deleteOrder);

module.exports = router;