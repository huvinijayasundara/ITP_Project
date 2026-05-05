// models/Cart_models.js - Updated
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId
    required: true,
    ref: 'Register' // Reference to user model
  },
  items: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId
        required: true,
        ref: 'product_model'
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: 1,
        default: 1
      }
    }
  ],
  total: { 
    type: Number, 
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Cart", cartSchema);