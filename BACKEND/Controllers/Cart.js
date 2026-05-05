// Controllers/Cart.js - FIXED VERSION (CLEAN CONTROLLER - NO ROUTES)
const Cart = require("../models/Cart_models");
const Product = require("../models/product_model");
const mongoose = require("mongoose");

// ========== ADD TO CART ==========
const addToCart = async (req, res) => {
  try {
    // Get userId from JWT token (authenticated route)
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
      console.log("✅ User ID from JWT token:", userId);
    } else {
      return res.status(400).json({ 
        status: "Error",
        message: "User authentication required" 
      });
    }

    const { productId, quantity = 1 } = req.body;

    console.log("\n🛒 ========== ADD TO CART ==========");
    console.log("👤 User ID:", userId);
    console.log("📦 Product ID:", productId);
    console.log("🔢 Quantity:", quantity);

    // Validate inputs
    if (!productId) {
      return res.status(400).json({ 
        status: "Error",
        message: "Product ID is required" 
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        status: "Error",
        message: "Quantity must be at least 1" 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        status: "Error",
        message: "Invalid product ID format" 
      });
    }

    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: "Error",
        message: "Product not found" 
      });
    }

    console.log("📦 Product found:", product.product_name);
    console.log("📊 Available stock:", product.Quantity);

    if (product.Quantity < quantity) {
      return res.status(400).json({ 
        status: "Error",
        message: `Only ${product.Quantity} units available` 
      });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
        total: product.Price * quantity
      });
      console.log("✅ Created new cart");
    } else {
      console.log("📋 Existing cart found with", cart.items.length, "items");
      
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId.toString()
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const currentQuantity = cart.items[existingItemIndex].quantity;
        const newQuantity = currentQuantity + quantity;
        
        console.log("🔄 Product already in cart. Current qty:", currentQuantity);
        
        if (newQuantity > product.Quantity) {
          return res.status(400).json({ 
            status: "Error",
            message: `Cannot add ${quantity} more. Only ${product.Quantity - currentQuantity} units available` 
          });
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        console.log("✅ Updated quantity to:", newQuantity);
      } else {
        // Add new item
        cart.items.push({ productId, quantity });
        console.log("✅ Added new item to cart");
      }
    }

    // Recalculate total
    let total = 0;
    for (let item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        total += prod.Price * item.quantity;
      }
    }
    cart.total = total;

    await cart.save();

    // Populate and return
    await cart.populate('items.productId');

    console.log("✅ Cart saved successfully");
    console.log("📊 Total items:", cart.items.length);
    console.log("💰 Total amount:", cart.total);

    res.status(200).json({ 
      status: "Ok",
      message: "Product added to cart",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        items: cart.items,
        total: cart.total
      }
    });

  } catch (err) {
    console.error("❌ Add to cart error:", err);
    res.status(500).json({ 
      status: "Error",
      message: "Failed to add to cart",
      error: err.message 
    });
  }
};

// ========== GET CART ==========
const getCart = async (req, res) => {
  try {
    let userId;

    // Priority: JWT token > params
    if (req.user && req.user.id) {
      userId = req.user.id;
      console.log("✅ User ID from JWT token:", userId);
    } else if (req.params.userId) {
      userId = req.params.userId;
      console.log("⚠️ User ID from params (legacy):", userId);
    } else {
      return res.status(400).json({ 
        status: "Error",
        message: "User authentication required" 
      });
    }

    console.log("\n📋 ========== GET CART ==========");
    console.log("👤 User ID:", userId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        status: "Error",
        message: "Invalid user ID format" 
      });
    }

    let cart = await Cart.findOne({ userId })
      .populate('items.productId')
      .populate('userId', 'name gmail');

    if (!cart) {
      console.log("ℹ️ No cart found - returning empty cart");
      return res.status(200).json({ 
        status: "Ok",
        message: "Cart is empty",
        cart: {
          userId: userId,
          items: [],
          total: 0
        }
      });
    }

    // Recalculate total and validate items
    let total = 0;
    const validItems = [];

    for (let item of cart.items) {
      if (item.productId && item.productId._id) {
        // Product exists and is populated
        total += item.productId.Price * item.quantity;
        validItems.push(item);
      } else {
        // Product might be deleted, try to fetch
        const product = await Product.findById(item.productId);
        if (product) {
          total += product.Price * item.quantity;
          validItems.push(item);
        } else {
          console.log("⚠️ Product not found, removing from cart:", item.productId);
        }
      }
    }

    // Update cart if items were removed
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
    }

    cart.total = total;
    await cart.save();

    console.log("✅ Cart found with", cart.items.length, "items");
    console.log("💰 Total:", cart.total);

    res.status(200).json({ 
      status: "Ok",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        items: cart.items,
        total: cart.total
      }
    });

  } catch (err) {
    console.error("❌ Get cart error:", err);
    res.status(500).json({ 
      status: "Error",
      message: "Failed to get cart",
      error: err.message 
    });
  }
};

// ========== UPDATE CART ITEM ==========
const updateCartItem = async (req, res) => {
  try {
    // Get userId from JWT
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else {
      return res.status(400).json({ 
        status: "Error",
        message: "User authentication required" 
      });
    }

    const { productId, quantity } = req.body;

    console.log("\n🔄 ========== UPDATE CART ==========");
    console.log("👤 User ID:", userId);
    console.log("📦 Product ID:", productId);
    console.log("🔢 New Quantity:", quantity);

    if (!productId || quantity === undefined || quantity === null) {
      return res.status(400).json({ 
        status: "Error",
        message: "Product ID and quantity are required" 
      });
    }

    if (quantity < 0) {
      return res.status(400).json({ 
        status: "Error",
        message: "Quantity cannot be negative" 
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        status: "Error",
        message: "Invalid product ID format" 
      });
    }

    // Check product availability
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        status: "Error",
        message: "Product not found" 
      });
    }

    if (quantity > product.Quantity) {
      return res.status(400).json({ 
        status: "Error",
        message: `Only ${product.Quantity} units available` 
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ 
        status: "Error",
        message: "Cart not found" 
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ 
        status: "Error",
        message: "Product not in cart" 
      });
    }

    // Update or remove item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
      console.log("✅ Item removed from cart");
    } else {
      cart.items[itemIndex].quantity = quantity;
      console.log("✅ Item quantity updated to:", quantity);
    }

    // Recalculate total
    let total = 0;
    for (let item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        total += prod.Price * item.quantity;
      }
    }
    cart.total = total;

    await cart.save();
    await cart.populate('items.productId');

    console.log("📊 Cart updated - Total items:", cart.items.length);
    console.log("💰 New total:", cart.total);

    res.status(200).json({ 
      status: "Ok",
      message: "Cart updated",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        items: cart.items,
        total: cart.total
      }
    });

  } catch (err) {
    console.error("❌ Update cart error:", err);
    res.status(500).json({ 
      status: "Error",
      message: "Failed to update cart",
      error: err.message 
    });
  }
};

// ========== REMOVE FROM CART ==========
const removeFromCart = async (req, res) => {
  try {
    // Get userId from JWT
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else {
      return res.status(400).json({ 
        status: "Error",
        message: "User authentication required" 
      });
    }

    const { productId } = req.body;

    console.log("\n🗑️ ========== REMOVE FROM CART ==========");
    console.log("👤 User ID:", userId);
    console.log("📦 Product ID:", productId);

    if (!productId) {
      return res.status(400).json({ 
        status: "Error",
        message: "Product ID is required" 
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        status: "Error",
        message: "Invalid product ID format" 
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ 
        status: "Error",
        message: "Cart not found" 
      });
    }

    // Remove item
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId.toString()
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ 
        status: "Error",
        message: "Product not found in cart" 
      });
    }

    // Recalculate total
    let total = 0;
    for (let item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        total += prod.Price * item.quantity;
      }
    }
    cart.total = total;

    await cart.save();
    await cart.populate('items.productId');

    console.log("✅ Item removed successfully");
    console.log("📊 Remaining items:", cart.items.length);

    res.status(200).json({ 
      status: "Ok",
      message: "Item removed from cart",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        items: cart.items,
        total: cart.total
      }
    });

  } catch (err) {
    console.error("❌ Remove from cart error:", err);
    res.status(500).json({ 
      status: "Error",
      message: "Failed to remove from cart",
      error: err.message 
    });
  }
};

// ========== CLEAR CART ==========
const clearCart = async (req, res) => {
  try {
    // Get userId from JWT
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else {
      return res.status(400).json({ 
        status: "Error",
        message: "User authentication required" 
      });
    }

    console.log("\n🧹 ========== CLEAR CART ==========");
    console.log("👤 User ID:", userId);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({
        userId,
        items: [],
        total: 0
      });
      await cart.save();
    } else {
      cart.items = [];
      cart.total = 0;
      await cart.save();
    }

    console.log("✅ Cart cleared successfully");

    res.status(200).json({ 
      status: "Ok",
      message: "Cart cleared",
      cart: {
        _id: cart._id,
        userId: cart.userId,
        items: [],
        total: 0
      }
    });

  } catch (err) {
    console.error("❌ Clear cart error:", err);
    res.status(500).json({ 
      status: "Error",
      message: "Failed to clear cart",
      error: err.message 
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};