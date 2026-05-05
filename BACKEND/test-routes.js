// test-routes.js - FIND THE PROBLEMATIC ROUTE
const express = require("express");

console.log("🔍 Testing individual route files...");

const routeFiles = [
  { name: "productRoutes", path: "./routes/productRoutes" },
  { name: "complaintRoutes", path: "./routes/complaintRoutes" },
  { name: "discountRoutes", path: "./routes/discountRoutes" },
  { name: "feedbackRoutes", path: "./routes/feedbackRoutes" },
  { name: "promotionRoutes", path: "./routes/promotionRoutes" },
  { name: "ratingRoutes", path: "./routes/ratingRoutes" },
  {name:"UserCRoutes",path:"./routes/UserCRoutes"},
  {name:"UserRoutes",path:"./routes/UserRoutes"},
  {name:"cart_route",path:"./routes/cart_route"}
];

routeFiles.forEach(route => {
  try {
    console.log(`\n📁 Testing ${route.name}...`);
    const router = require(route.path);
    console.log(`✅ ${route.name} - SUCCESS`);
  } catch (error) {
    console.log(`❌ ${route.name} - ERROR: ${error.message}`);
  }
});

console.log("\n🎯 Debugging complete!");