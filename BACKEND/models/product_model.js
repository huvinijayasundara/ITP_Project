const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  product_name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    minlength: [2, "Product name must be at least 2 characters long"],
  }, // validate

  Description: {
    type: String,
    required: [true, "Description is required"],
    minlength: [5, "Description must be at least 5 characters long"],
  }, // validate

  Category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  }, // validate

  Quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be greater than 0"], // ✅ validation
  }, // validate

  Price: {
    type: Number,
    required: [true, "Price is required"],
    min: [1, "Price must be greater than 0"], // ✅ validation
  }, // validate

  imageUrl: {
    type: String,
    required: false,
  },

   discountId: {                 
    type: mongoose.Schema.Types.ObjectId,
    ref: "discount_model",       // reference discount collection
    required: false
  }
});

module.exports = mongoose.model(
  "product_model", // collection name
  productSchema   // schema
);
