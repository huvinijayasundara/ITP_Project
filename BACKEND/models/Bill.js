const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const BillSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },

  items: [itemSchema], // Array of purchased handicraft items

  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Cash on Delivery", "Bank Slip Upload"], required: true },

  billDate: { type: String, required: true },
  billTime: { type: String, required: true },
  storeName: { type: String, default: "Online Handicraft Store" },
  logo: { type: String }, // optional
});

module.exports = mongoose.model("Bill", BillSchema);
