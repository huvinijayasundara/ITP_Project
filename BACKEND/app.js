const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// ==================== CONFIGURATION ====================
const SECRET = process.env.JWT_SECRET || "mysecretkey";
const PORT = process.env.PORT || 5000;

const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'gayashagimhani12@gmail.com',
    pass: 'izadfgzwrnhnogpc'
  }
};
// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ STATIC FILE SERVING - Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== IMPORT MODELS ====================
let registers, usermodels;

try {
  registers = require('./models/Register');
  console.log("✅ Auth models loaded successfully");
} catch (err) {
  console.error("⚠️ Error importing auth models:", err.message);
}

// ==================== AUTHENTICATION MIDDLEWARE ====================
const { authenticatedUser, adminOnly } = require("./Middleware/auth");

// ==================== ROUTES ====================
console.log("📋 Loading routes...");

// ==================== USER MANAGEMENT ROUTES ====================
const userRoutes = require("./routes/UserRoutes");
app.use("/api/users", userRoutes);
console.log("  ✓ Artisan routes loaded at /api/users");

const userCRoutes = require("./routes/UserCRoutes");
app.use("/api/userc", userCRoutes);
console.log("  ✓ User management routes loaded at /api/userc");

// ==================== PAYMENT & TRANSACTION ROUTES (PRIORITY) ====================
try {
  const paymentRoutes = require("./routes/PaymentRoute");
  app.use("/payments", paymentRoutes);
  app.use("/api/payments", paymentRoutes);
  console.log("  ✓ Payment routes loaded (/payments & /api/payments)");
} catch (err) {
  console.error("  ✗ CRITICAL: Payment routes not found:", err.message);
}

try {
  const transactionRoutes = require("./routes/TransactionRoute");
  app.use("/transactions", transactionRoutes);
  app.use("/api/transactions", transactionRoutes);
  console.log("  ✓ Transaction routes loaded");
} catch (err) {
  console.warn("  ⚠️ Transaction routes not found");
}

try {
  const billRoutes = require("./routes/BillGeneratorRoute");
  app.use("/bills", billRoutes);
  app.use("/api/bills", billRoutes);
  console.log("  ✓ Bill routes loaded");
} catch (err) {
  console.warn("  ⚠️ Bill routes not found");
}

try {
  const refundRoutes = require("./routes/RefundRoute");
  app.use("/refund-requests", refundRoutes);
  app.use("/api/refund-requests", refundRoutes);
  console.log("  ✓ Refund routes loaded");
} catch (err) {
  console.warn("  ⚠️ Refund routes not found");
}

// ==================== ORDER ROUTES ====================
try {
  const orderRoutes = require("./routes/OrderRoute");
  app.use("/orders", orderRoutes);
  app.use("/api/orders", orderRoutes);
  console.log("  ✓ Order routes loaded at /orders and /api/orders");
} catch (err) {
  console.error("  ✗ CRITICAL: Order routes failed to load:", err.message);
}

// ==================== CART ROUTES ====================
try {
  const cartRoutes = require("./routes/cart_route");
  app.use("/cart", authenticatedUser, cartRoutes);
  app.use("/api/cart", authenticatedUser, cartRoutes);
  console.log("  ✓ Cart routes loaded at /cart and /api/cart");
} catch (err) {
  console.error("  ✗ CRITICAL: Cart routes not found:", err.message);
}

// ==================== DELIVERY ROUTES ====================
try {
  const deliveryRoutes = require("./routes/deliveryRoutes");
  app.use("/api/deliveries", authenticatedUser, deliveryRoutes);
  console.log("  ✓ Delivery routes loaded at /api/deliveries");
} catch (err) {
  console.warn("  ⚠️ Delivery routes not found:", err.message);
}

// ==================== PRODUCT ROUTES ====================
try {
  app.use("/products", require("./routes/route_model"));
  app.use("/api/products", require("./routes/route_model"));
  console.log("  ✓ Product routes loaded");
} catch (err) {
  console.warn("  ⚠️ Product routes not found");
}

// ==================== CUSTOMER SERVICE ROUTES ====================
try {
  app.use("/api/complaints", require("./routes/complaintRoutes"));
  console.log("  ✓ Complaint routes loaded");
} catch (err) {
  console.warn("  ⚠️ Complaint routes not found");
}

// ✅ CRITICAL FIX: Load DISCOUNT routes (was missing!)
try {
  const discountRoutes = require("./routes/discountRoutes");
  app.use("/api/discounts", discountRoutes);
  console.log("  ✓ Discount routes loaded at /api/discounts");
} catch (err) {
  console.error("  ✗ CRITICAL: Discount routes not found:", err.message);
}

try {
  app.use("/api/feedbacks", require("./routes/feedbackRoutes"));
  console.log("  ✓ Feedback routes loaded");
} catch (err) {
  console.warn("  ⚠️ Feedback routes not found");
}

try {
  const promotionRoutes = require("./routes/promotionRoutes");
  app.use("/api/promotions", promotionRoutes);
  console.log("  ✓ Promotion routes loaded at /api/promotions");
} catch (err) {
  console.warn("  ⚠️ Promotion routes not found");
}

try {
  app.use("/api/ratings", require("./routes/ratingRoutes"));
  console.log("  ✓ Rating routes loaded");
} catch (err) {
  console.warn("  ⚠️ Rating routes not found");
}

try {
  app.use("/api/chat", require("./routes/chatRouter"));
  console.log("  ✓ Chat routes loaded");
} catch (err) {
  console.warn("  ⚠️ Chat routes not found");
}

console.log("✅ All routes loaded\n");

// ==================== TEST & DEBUG ENDPOINTS ====================
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "Ok", 
    message: "Server is running healthy",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server works!",
    timestamp: new Date().toISOString(),
    mongoStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

app.post("/test-order", (req, res) => {
  console.log("🧪 Test order endpoint hit");
  console.log("Body:", req.body);
  res.json({ 
    status: "OK", 
    message: "Test endpoint works",
    receivedBody: req.body 
  });
});

// ==================== AUTHENTICATION ROUTES ====================
// Register Route
app.post("/register", async (req, res) => {
  const { name, gmail, phoneNumber, password, conPassword, role = "user" } = req.body;
  
  console.log("Registration attempt:", { name, gmail, role });
  
  try {
    if (!name || !gmail || !phoneNumber || !password || !conPassword) {
      return res.status(400).json({ 
        status: "Error", 
        message: "All fields are required" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gmail)) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Invalid email format" 
      });
    }

    if (password !== conPassword) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Passwords do not match" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Password must be at least 6 characters long" 
      });
    }

    const emailRegexExact = new RegExp(`^${gmail}$`, 'i');
    let existingUser = await registers.findOne({ gmail: emailRegexExact });
    if (!existingUser && usermodels) {
      existingUser = await usermodels.findOne({ gmail: emailRegexExact });
    }
    
    if (existingUser) {
      return res.status(400).json({ 
        status: "Error", 
        message: "User already exists with this email" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "artisan" && usermodels) {
      const newArtisan = await usermodels.create({
        name,
        gmail: gmail.toLowerCase(),
        phoneNumber: Number(phoneNumber),
        password: hashedPassword,
        conPassword: hashedPassword,
        role: "artisan",
      });
      console.log("Artisan registered:", newArtisan.name);
      return res.status(201).json({ 
        status: "Ok", 
        message: "Artisan registered successfully",
        user: {
          id: newArtisan._id,
          name: newArtisan.name,
          gmail: newArtisan.gmail,
          role: newArtisan.role
        }
      });
    } else {
      const newUser = await registers.create({
        name,
        gmail: gmail.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        conPassword: hashedPassword,
        role: role,
      });
      console.log("User registered:", newUser.name);
      return res.status(201).json({ 
        status: "Ok", 
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          gmail: newUser.gmail,
          role: newUser.role
        }
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      status: "Error", 
      message: "Registration failed",
      error: err.message 
    });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { gmail, password } = req.body;

  try {
    if (!gmail || !password) {
      return res.status(400).json({ 
        status: "Error",
        message: "Email and password are required" 
      });
    }

    console.log("Login attempt for:", gmail);

    let user = await registers.findOne({ gmail: gmail.toLowerCase() });
    console.log("Found in registers:", user ? "Yes" : "No");
    
    if (!user && usermodels) {
      user = await usermodels.findOne({ gmail: gmail.toLowerCase() });
      console.log("Found in usermodels:", user ? "Yes" : "No");
    }

    if (!user) {
      console.log("No user found with email:", gmail);
      return res.status(404).json({ 
        status: "Error",
        message: "No account found with this email" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: "Error",
        message: "Incorrect password" 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name, 
        gmail: user.gmail, 
        role: user.role 
      },
      SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful for:", user.name);

    res.status(200).json({ 
      status: "Ok", 
      message: "Login successful",
      token, 
      user: {
        id: user._id,
        name: user.name,
        gmail: user.gmail,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      status: "Error",
      message: "Server error during login",
      error: err.message 
    });
  }
});

// Forgot Password Route
app.post("/forgot-password", async (req, res) => {
  const { gmail } = req.body;

  try {
    if (!gmail) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Email is required" 
      });
    }

    console.log("Forgot password request for:", gmail);

    let user = await registers.findOne({ gmail: gmail.toLowerCase() });
    let collection = "user";
  
    if (!user && usermodels) {
      user = await usermodels.findOne({ gmail: gmail.toLowerCase() });
      collection = "artisan";
    }
    
    if (!user) {
      console.log("No account found for email:", gmail);
      return res.status(404).json({ 
        status: "Error", 
        message: "No account found with this email" 
      });
    }
    
    const token = jwt.sign(
      { id: user._id, collection }, 
      "jwt_secret_key1", 
      { expiresIn: "1d" }
    );

    let transporter = nodemailer.createTransport(EMAIL_CONFIG);

    let mailOptions = {
      from: EMAIL_CONFIG.auth.user,
      to: gmail,
      subject: 'Reset Your Password - Handicraft Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password for your Handicraft Store account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/reset-password/${user._id}/${token}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log("Email error:", error);
        return res.status(500).json({ 
          status: "Error", 
          message: "Failed to send reset email" 
        });
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).json({ 
          status: "Ok",
          message: "Password reset link sent to your email" 
        });
      }
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ 
      status: "Error", 
      message: "Server error",
      error: err.message 
    });
  }
});

// ==================== DATABASE CONNECTION ====================
const MONGO_URI = "mongodb+srv://umesharashmi2001_db_user:aqA2TGWwimSSAitG@cluster0.q21w4gh.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0";

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 5
    });
    
    console.log("\n✅ MongoDB Connected Successfully");
    console.log("📊 Database:", mongoose.connection.name);
    console.log("🌐 Host:", mongoose.connection.host);
    return true;
  } catch (err) {
    console.log("\n❌ MongoDB Connection Error:", err.message);
    setTimeout(connectToMongoDB, 5000);
    return false;
  }
}

// ==================== START SERVER ====================
connectToMongoDB().then((connected) => {
  app.listen(PORT, () => {
    console.log(`\n🎉 Server running on port ${PORT}`);
    console.log(`\n💥 User Management Endpoints:`);
    console.log(`   GET  /api/users - Get all artisans`);
    console.log(`   POST /api/users - Add artisan (admin only)`);
    console.log(`   GET  /api/users/:id - Get artisan by ID`);
    console.log(`   PUT  /api/users/:id - Update artisan`);
    console.log(`   DELETE /api/users/:id - Delete artisan (admin only)`);
    console.log(`\n👤 Profile Management Endpoints:`);
    console.log(`   GET  /api/userc/me/profile - Get my profile`);
    console.log(`   PUT  /api/userc/me/profile - Update my profile`);
    console.log(`   PATCH /api/userc/me/change-password - Change my password`);
    console.log(`   DELETE /api/userc/me/profile - Delete my profile`);
    console.log(`   GET  /api/userc - Get all users (admin)`);
    console.log(`   GET  /api/userc/:id - Get user by ID`);
    console.log(`   PUT  /api/userc/:id - Update user`);
    console.log(`   DELETE /api/userc/:id - Delete user (admin)`);
    console.log(`\n💳 Payment Endpoints:`);
    console.log(`   POST /payments - Process payment (with receipt)`);
    console.log(`   GET  /payments/user/:userId - Get user payments`);
    console.log(`\n📦 Order Endpoints:`);
    console.log(`   POST /orders - Create order`);
    console.log(`   GET  /orders/:id - Get order details`);
    console.log(`   GET  /pages/orders/user/:userId - Get user orders`);
    console.log(`\n🛒 Cart Endpoints:`);
    console.log(`   GET  /cart/my-cart - Get cart`);
    console.log(`   POST /cart/clear - Clear cart`);
    console.log(`\n🎫 Discount Endpoints:`);
    console.log(`   GET  /api/discounts - Get all discounts`);
    console.log(`   POST /api/discounts/validate - Validate discount code`);
    console.log(`   POST /api/discounts - Create discount (admin)`);
    console.log(`\n📢 Promotion Endpoints:`);
    console.log(`   GET  /api/promotions - Get all promotions`);
    console.log(`   POST /api/promotions - Create promotion (admin)`);
    console.log(`\n🚚 Delivery Endpoints:`);
    console.log(`   POST /deliveries - Create delivery`);
    console.log(`   GET  /track/:orderId - Track order`);
    console.log(`\n🚀 Server ready!\n`);
  });
});

// ==================== ERROR HANDLING ====================
process.on('SIGINT', () => {
  console.log('\n⚠️ Shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    status: 'Error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({
    status: 'Error',
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});