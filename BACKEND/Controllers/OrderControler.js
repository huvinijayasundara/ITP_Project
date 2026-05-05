const Order = require("../models/OrderModel");
const mongoose = require('mongoose');

// Get all orders with populated user info
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email");
    
    console.log(`📋 Fetching all orders - Found: ${orders.length}`);
    
    if (!orders || orders.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: "No orders found",
        orders: [] 
      });
    }
    
    return res.status(200).json({ 
      success: true,
      orders: orders 
    });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders",
      error: err.message 
    });
  }
};

// Get order by ID with populated user info
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    console.log("📦 Fetching order with ID:", orderId);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error("❌ Invalid order ID format:", orderId);
      return res.status(400).json({ 
        success: false,
        message: "Invalid order ID format" 
      });
    }
    
    const order = await Order.findById(orderId).populate("userId", "name gmail phoneNumber");
    
    if (!order) {
      console.error("❌ Order not found:", orderId);
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }
    
    console.log("✅ Order found:", order._id);
    console.log("Order details:", {
      id: order._id,
      total: order.totalAmount,
      discount: order.discountAmount,
      code: order.discountCode
    });
    
    return res.status(200).json({ 
      success: true,
      order: order 
    });
  } catch (err) {
    console.error(`❌ Error fetching order ${req.params.id}:`, err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch order", 
      error: err.message 
    });
  }
};

// Add a new order - UPDATED for Cart compatibility
const addOrder = async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      subtotal, 
      discountAmount, 
      discountCode, 
      tax, 
      shippingFee, 
      totalAmount,
      status 
    } = req.body;

    console.log("\n🛍️ ========== CREATE ORDER ==========");
    console.log("📝 Request body:", JSON.stringify(req.body, null, 2));

    // Validation - User ID
    if (!userId) {
      console.error("❌ User ID is required");
      return res.status(400).json({ 
        success: false,
        message: "User ID is required" 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid user ID format:", userId);
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format" 
      });
    }

    // Validation - Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ Items are required");
      return res.status(400).json({ 
        success: false,
        message: "Items are required and must be a non-empty array" 
      });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.name) {
        console.error(`❌ Item ${i} missing name`);
        return res.status(400).json({ 
          success: false,
          message: `Item ${i + 1} must have a name` 
        });
      }
      
      if (typeof item.price !== "number" || item.price < 0) {
        console.error(`❌ Item ${i} has invalid price:`, item.price);
        return res.status(400).json({ 
          success: false,
          message: `Item ${i + 1} must have a valid price` 
        });
      }
      
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        console.error(`❌ Item ${i} has invalid quantity:`, item.quantity);
        return res.status(400).json({ 
          success: false,
          message: `Item ${i + 1} must have a valid quantity` 
        });
      }

      // Validate productId if provided
      if (item.productId && !mongoose.Types.ObjectId.isValid(item.productId)) {
        console.error(`❌ Item ${i} has invalid productId:`, item.productId);
        return res.status(400).json({ 
          success: false,
          message: `Item ${i + 1} has invalid product ID` 
        });
      }
    }

    // Validation - Total Amount
    if (typeof totalAmount !== "number" || totalAmount < 0) {
      console.error("❌ Invalid total amount:", totalAmount);
      return res.status(400).json({ 
        success: false,
        message: "Total amount must be a valid positive number" 
      });
    }

    // Create order object with all fields
    const orderData = {
      userId: new mongoose.Types.ObjectId(userId),
      items: items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        productId: item.productId ? new mongoose.Types.ObjectId(item.productId) : undefined
      })),
      subtotal: subtotal || 0,
      discountAmount: discountAmount || 0,
      discountCode: discountCode || null,
      tax: tax || 0,
      shippingFee: shippingFee || 300,
      totalAmount: totalAmount,
      status: status || "Pending"
    };

    console.log("📦 Creating order with data:");
    console.log("   User ID:", orderData.userId);
    console.log("   Items count:", orderData.items.length);
    console.log("   Subtotal:", orderData.subtotal);
    console.log("   Discount:", orderData.discountAmount);
    console.log("   Discount Code:", orderData.discountCode);
    console.log("   Tax:", orderData.tax);
    console.log("   Shipping:", orderData.shippingFee);
    console.log("   Total:", orderData.totalAmount);

    // Verify calculation (with tolerance for rounding)
    const calculatedTotal = orderData.subtotal - orderData.discountAmount + orderData.tax + orderData.shippingFee;
    const difference = Math.abs(calculatedTotal - orderData.totalAmount);
    
    if (difference > 0.02) {
      console.warn("⚠️ Total mismatch!");
      console.warn(`   Calculated: ${calculatedTotal.toFixed(2)}`);
      console.warn(`   Provided: ${orderData.totalAmount.toFixed(2)}`);
      console.warn(`   Difference: ${difference.toFixed(2)}`);
      
      // Auto-correct the total
      orderData.totalAmount = calculatedTotal;
      console.log("✅ Auto-corrected total to:", orderData.totalAmount);
    }

    // Create and save order
    const order = new Order(orderData);
    await order.save();

    console.log("✅ Order created successfully!");
    console.log("   Order ID:", order._id);
    console.log("   Total Amount:", order.totalAmount);

    return res.status(201).json({ 
      success: true,
      message: "Order created successfully", 
      order: order 
    });
    
  } catch (err) {
    console.error("❌ Error creating order:", err);
    console.error("Stack trace:", err.stack);
    
    return res.status(500).json({ 
      success: false,
      message: "Failed to create order", 
      error: err.message 
    });
  }
};

// Update an existing order
const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;

    console.log("📝 Updating order:", orderId);
    console.log("Update data:", updateData);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid order ID format" 
      });
    }

    // If items are being updated, validate them
    if (updateData.items) {
      if (!Array.isArray(updateData.items) || updateData.items.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Items must be a non-empty array" 
        });
      }

      // Validate each item
      for (let item of updateData.items) {
        if (typeof item.price !== "number" || item.price < 0 ||
            typeof item.quantity !== "number" || item.quantity <= 0) {
          return res.status(400).json({ 
            success: false,
            message: "Each item must have valid price and quantity" 
          });
        }
      }

      // Recalculate totals if items changed
      const subtotal = updateData.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      const discountAmount = updateData.discountAmount || 0;
      const tax = (subtotal - discountAmount) * 0.1;
      const shippingFee = updateData.shippingFee || 300;
      
      updateData.subtotal = subtotal;
      updateData.tax = tax;
      updateData.totalAmount = subtotal - discountAmount + tax + shippingFee;
      
      console.log("Recalculated totals:", {
        subtotal,
        discountAmount,
        tax,
        shippingFee,
        totalAmount: updateData.totalAmount
      });
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      console.error("❌ Order not found:", orderId);
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    console.log("✅ Order updated successfully:", updatedOrder._id);

    return res.status(200).json({ 
      success: true,
      message: "Order updated successfully", 
      order: updatedOrder 
    });
    
  } catch (err) {
    console.error(`❌ Error updating order ${req.params.id}:`, err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to update order", 
      error: err.message 
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log("🗑️ Deleting order:", orderId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid order ID format" 
      });
    }

    const deleted = await Order.findByIdAndDelete(orderId);

    if (!deleted) {
      console.error("❌ Order not found:", orderId);
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    console.log("✅ Order deleted successfully:", orderId);

    return res.status(200).json({ 
      success: true,
      message: "Order deleted successfully", 
      order: deleted 
    });
    
  } catch (err) {
    console.error(`❌ Error deleting order ${req.params.id}:`, err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to delete order", 
      error: err.message 
    });
  }
};

// Get orders by user ID
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    console.log("👤 Fetching orders for user:", userId);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format" 
      });
    }
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders for user ${userId}`);
    
    return res.status(200).json({ 
      success: true,
      count: orders.length,
      orders: orders 
    });
    
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch user orders",
      error: err.message 
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  addOrder,
  updateOrder,
  deleteOrder,
  getOrdersByUser
};