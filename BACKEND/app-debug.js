// app-debug.js - FIND THE CONFLICT
const express = require("express");
const app = express();

app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Debug server working!" });
});

// Load routes ONE BY ONE and test after each
const routesToLoad = [
  { name: "promotionRoutes", path: "./routes/promotionRoutes", mount: "/api/promotions" },
  { name: "productRoutes", path: "./routes/productRoutes", mount: "/api/products" },
  { name: "feedbackRoutes", path: "./routes/feedbackRoutes", mount: "/api/feedbacks" },
  { name: "discountRoutes", path: "./routes/discountRoutes", mount: "/api/discounts" },
  { name: "ratingRoutes", path: "./routes/ratingRoutes", mount: "/api/ratings" },
  { name: "complaintRoutes", path: "./routes/complaintRoutes", mount: "/api/complaints" }
];

console.log("🔍 Testing route combinations...");

let loadedRoutes = [];

routesToLoad.forEach((route, index) => {
  try {
    const router = require(route.path);
    app.use(route.mount, router);
    loadedRoutes.push(route.name);
    console.log(`✅ ${index + 1}. ${route.name} added successfully`);
    
    // Test if server still works
    console.log(`   Testing server with ${loadedRoutes.length} routes...`);
    
  } catch (error) {
    console.log(`❌ FAILED at ${route.name}:`, error.message);
    console.log(`💥 The conflict is with: ${route.name}`);
    process.exit(1);
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🎉 All routes loaded successfully!`);
  console.log(`📍 Server running on port ${PORT}`);
});