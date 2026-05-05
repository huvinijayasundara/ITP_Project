// Middleware/auth.js - UNIFIED AUTHENTICATION MIDDLEWARE
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "mysecretkey";

// Extract and verify token
function extractToken(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  
  return parts[1];
}

// Base authentication - any logged-in user
function auth(req, res, next) {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required. Please login." 
      });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        console.log("Token verification failed:", err.message);
        return res.status(401).json({ 
          success: false,
          message: "Invalid or expired token. Please login again." 
        });
      }

      // Attach user info to request
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.gmail || decoded.email,
        role: decoded.role
      };
      
      console.log(`✅ User authenticated: ${req.user.name} (${req.user.role})`);
      next();
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Authentication error" 
    });
  }
}

// Role-based access control
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // First authenticate
    auth(req, res, () => {
      const userRole = req.user.role.toLowerCase();
      const allowed = allowedRoles.map(r => r.toLowerCase());
      
      if (!allowed.includes(userRole)) {
        console.log(`❌ Access denied for ${req.user.name} - Required: ${allowedRoles.join(', ')}, Has: ${userRole}`);
        return res.status(403).json({ 
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          userRole: userRole,
          requiredRoles: allowedRoles
        });
      }
      
      console.log(`✅ Role check passed: ${req.user.name} (${userRole})`);
      next();
    });
  };
}

// Specific role shortcuts
const adminOnly = requireRole('admin');
const customerOnly = requireRole('user', 'customer');
const deliveryOnly = requireRole('delivery');
const adminOrDelivery = requireRole('admin', 'delivery');
const authenticatedUser = auth;

// Check if user owns resource
function checkOwnership(getUserId) {
  return (req, res, next) => {
    auth(req, res, () => {
      const resourceUserId = getUserId(req);
      
      // Admin can access anything
      if (req.user.role.toLowerCase() === 'admin') {
        return next();
      }
      
      // User can only access their own resources
      if (req.user.id !== resourceUserId.toString()) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied. You can only access your own resources." 
        });
      }
      
      next();
    });
  };
}

module.exports = { 
  auth,
  requireRole,
  adminOnly, 
  customerOnly,
  deliveryOnly,
  adminOrDelivery,
  authenticatedUser,
  checkOwnership
};