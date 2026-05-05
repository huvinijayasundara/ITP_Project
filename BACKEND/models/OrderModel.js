const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Register",  // Reference to your user model
    required: true 
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "product_model",
        required: false 
      }
    },
  ],
  subtotal: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  discountCode: {
    type: String,
    default: null
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingFee: {
    type: Number,
    default: 300,
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);