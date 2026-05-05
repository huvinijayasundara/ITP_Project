// app-minimal.js - ULTIMATE FIX
const express = require("express");
const app = express();

// Only basic middleware
app.use(express.json());

// Only ONE simple route to test
app.get("/api/test", (req, res) => {
  res.json({ message: "Minimal server works!" });
});

// NO other routes for now

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
});