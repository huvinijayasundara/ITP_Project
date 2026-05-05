const product = require("../models/product_model");

// Get all products
var getAllProducts = async (req, res, next) => {
  let products;

  try {
    products = await product.find();
  } catch (err) {
    console.log(err);
  }

  if (!products) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Display all products
  return res.status(200).json({ products });
};

//  Add new product
const add_products = async (req, res, next) => {
  const { product_name, Description, Category, Quantity, Price,discountId } = req.body;

  // Validation
  if (!product_name || !Description || !Category) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (Quantity <= 0 || Price <= 0) {
    return res
      .status(400)
      .json({ message: "Quantity and Price must be greater than 0" });
  }

  let products;
  try {
    products = new product({
      product_name,
      Description,
      Category,
      Quantity,
      Price,
      imageUrl: req.file ? req.file.filename : null,
       discountId: discountId || null,
    });

    await products.save();
  } catch (err) {
    console.log(err);
  }

  // not inserted
  if (!products) {
    return res.status(500).send({ message: "Unable to add products" });
  }

  return res.status(201).json({ products });
};

//  Get product by ID
const getByID = async (req, res, next) => {
  const id = req.params.id;

  let products;
  try {
    products = await product.findById(id);
  } catch (err) {
    console.log(err);
  }

  if (!products) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json({ products });
};

// ✅Update product (with validation + optional image)
const update_product = async (req, res, next) => {
  const id = req.params.id;
  const { product_name, Description, Category, Quantity, Price,discountId } = req.body;

  // Validation
  if (!product_name || !Description || !Category) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (Quantity <= 0 || Price <= 0) {
    return res
      .status(400)
      .json({ message: "Quantity and Price must be greater than 0" });
  }

  let products;
  const updateData = { product_name, Description, Category, Quantity, Price ,discountId};

  // If user uploads new image, save filename
  if (req.file) updateData.imageUrl = req.file.filename;

  try {
    // Find product by ID and update
    products = await product.findByIdAndUpdate(id, updateData, { new: true });
  } catch (err) {
    console.log(err);
  }

  if (!products) {
    return res.status(404).json({ message: "Unable to update product" });
  }

  return res.status(200).json({ products });
};

// ✅ Delete product
const delete_product = async (req, res, next) => {
  const id = req.params.id;
  let products;

  try {
    products = await product.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }
  if (!products) {
    return res.status(404).json({ message: "Unable to Delete" });
  }

  return res.status(200).json({ products });
};

exports.getAllProducts = getAllProducts;
exports.add_products = add_products;
exports.getByID = getByID;
exports.update_product = update_product;
exports.delete_product = delete_product;
