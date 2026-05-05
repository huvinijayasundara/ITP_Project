const Rating = require("../models/Rating");
const Product = require("../models/product_model"); // Import Product model

// Create Rating
exports.createRating = async (req, res) => {
  try {
    const { productId, customerName, rating, comment, customerEmail } = req.body;
    
    console.log("📝 Rating submission received:", { productId, customerName, rating });
    
    if (!productId || !customerName || !rating) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["productId", "customerName", "rating"] 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // ✅ FIX: Fetch product from database instead of global.products
    let product;
    try {
      product = await Product.findById(productId);
      console.log("🔍 Product lookup result:", product ? `Found: ${product.product_name}` : "Not found");
    } catch (err) {
      console.error("❌ Error finding product:", err.message);
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    if (!product) {
      console.log("❌ Product not found in database:", productId);
      return res.status(404).json({ 
        error: "Product not found",
        productId: productId 
      });
    }

    const newRating = new Rating({
      productId,
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : undefined,
      rating: parseInt(rating),
      comment: comment ? comment.trim() : ""
    });
    
    const savedRating = await newRating.save();
    console.log("✅ Created new rating for product:", product.product_name, "- Rating:", rating);
    
    res.status(201).json({
      success: true,
      message: "Rating created successfully",
      data: savedRating
    });
  } catch (err) {
    console.error("❌ Error creating rating:", err);
    res.status(400).json({ 
      error: err.message || "Failed to create rating",
      details: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
};

// Get All Ratings (with filters)
exports.getRatings = async (req, res) => {
  try {
    const { productId, rating: ratingFilter } = req.query;
    let filter = {};

    if (productId) filter.productId = productId;
    if (ratingFilter) filter.rating = parseInt(ratingFilter);

    const ratings = await Rating.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // ✅ FIX: Fetch products from database for each rating
    const ratingsWithProduct = await Promise.all(
      ratings.map(async (rating) => {
        try {
          const product = await Product.findById(rating.productId);
          return {
            ...rating,
            product: product ? { 
              name: product.product_name, 
              price: product.Price, 
              category: product.Category 
            } : null
          };
        } catch (err) {
          return {
            ...rating,
            product: null
          };
        }
      })
    );

    console.log(`⭐ Retrieved ${ratings.length} ratings`);
    
    res.json({
      success: true,
      count: ratings.length,
      data: ratingsWithProduct
    });
  } catch (err) {
    console.error("❌ Error getting ratings:", err);
    res.status(500).json({ 
      error: "Failed to fetch ratings",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update Rating (Admin only)
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, status } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (comment !== undefined) updateData.comment = comment ? comment.trim() : "";
    if (status !== undefined) updateData.status = status;

    const updatedRating = await Rating.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    console.log("✅ Updated rating:", id);
    
    res.json({
      success: true,
      message: "Rating updated successfully",
      data: updatedRating
    });
  } catch (err) {
    console.error("❌ Error updating rating:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid rating ID format" });
    }
    
    res.status(500).json({ 
      error: "Failed to update rating",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete Rating (Admin only)
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRating = await Rating.findByIdAndDelete(id);

    if (!deletedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    console.log("🗑️ Deleted rating:", deletedRating._id);
    
    res.json({
      success: true,
      message: "Rating deleted successfully"
    });
  } catch (err) {
    console.error("❌ Error deleting rating:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid rating ID format" });
    }
    
    res.status(500).json({ 
      error: "Failed to delete rating",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get product statistics
exports.getProductStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ FIX: Fetch product from database
    let product;
    try {
      product = await Product.findById(id);
    } catch (err) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const productRatings = await Rating.find({ productId: id });
    const totalRatings = productRatings.length;
    const averageRating = totalRatings > 0 
      ? productRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;
    
    const ratingBreakdown = {
      5: productRatings.filter(r => r.rating === 5).length,
      4: productRatings.filter(r => r.rating === 4).length,
      3: productRatings.filter(r => r.rating === 3).length,
      2: productRatings.filter(r => r.rating === 2).length,
      1: productRatings.filter(r => r.rating === 1).length
    };
    
    res.json({
      success: true,
      data: {
        productId: id,
        productName: product.product_name,
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingBreakdown
      }
    });
  } catch (err) {
    console.error("❌ Error getting product stats:", err);
    res.status(500).json({ 
      error: "Failed to get product statistics",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};