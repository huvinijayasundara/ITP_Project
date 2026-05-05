const User = require("../models/Register"); // ✅ FIXED: Use Register model
const bcrypt = require("bcryptjs");

// Display all users (artisans only)
const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find({ role: "artisan" }).select("-password -conPassword");
    
    if (!users || users.length === 0) {
      return res.status(404).json({ 
        status: "Error",
        message: "No artisans found" 
      });
    }

    return res.status(200).json({ 
      status: "Ok",
      count: users.length,
      users 
    });
  } catch (err) {
    console.error("Get all artisans error:", err);
    return res.status(500).json({ 
      status: "Error",
      message: "Server error",
      error: err.message 
    });
  }
};

// Add new user (artisan)
const addUsers = async (req, res) => {
  const { name, gmail, phoneNumber, password, conPassword } = req.body;

  // Validation
  if (!name || !gmail || !phoneNumber || !password || !conPassword) {
    return res.status(400).json({ 
      status: "Error", 
      message: "All fields are required" 
    });
  }

  if (password !== conPassword) {
    return res.status(400).json({ 
      status: "Error", 
      message: "Passwords do not match" 
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ gmail: gmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        status: "Error", 
        message: "User already exists with this email" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new artisan
    const user = new User({
      name,
      gmail: gmail.toLowerCase(),
      phoneNumber: phoneNumber.toString(),
      password: hashedPassword,
      conPassword: hashedPassword,
      role: "artisan"
    });

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.conPassword;

    res.status(201).json({ 
      status: "Ok", 
      message: "Artisan added successfully",
      user: userResponse 
    });
  } catch (err) {
    console.error("Add artisan error:", err);
    res.status(500).json({ 
      status: "Error", 
      message: "Failed to add artisan",
      error: err.message 
    });
  }
};

// Get user by ID
const getById = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ 
      status: "Error",
      message: "User ID is required" 
    });
  }

  try {
    const user = await User.findById(id).select("-password -conPassword");
    
    if (!user) {
      return res.status(404).json({ 
        status: "Error",
        message: "User not found" 
      });
    }

    return res.status(200).json({ 
      status: "Ok",
      user 
    });
  } catch (err) {
    console.error("Get user by ID error:", err);
    return res.status(500).json({ 
      status: "Error",
      message: "Server error",
      error: err.message 
    });
  }
};

// Update user details
const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const { name, gmail, phoneNumber, password, conPassword } = req.body;

  if (!id) {
    return res.status(400).json({ 
      status: "Error",
      message: "User ID is required" 
    });
  }

  try {
    // Find existing user
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        status: "Error",
        message: "User not found" 
      });
    }

    // Prepare update data
    let updateData = {};
    
    if (name) updateData.name = name;
    if (gmail) updateData.gmail = gmail.toLowerCase();
    if (phoneNumber) updateData.phoneNumber = phoneNumber.toString();

    // Handle password update if provided
    if (password && conPassword) {
      if (password !== conPassword) {
        return res.status(400).json({ 
          status: "Error",
          message: "Passwords do not match" 
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
      updateData.conPassword = hashedPassword;
    }

    // Update user
    const users = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select("-password -conPassword");

    if (!users) {
      return res.status(404).json({ 
        status: "Error",
        message: "Unable to update user details" 
      });
    }

    return res.status(200).json({ 
      status: "Ok",
      message: "User updated successfully",
      users 
    });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ 
      status: "Error",
      message: "Server error",
      error: err.message 
    });
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ 
      status: "Error",
      message: "User ID is required" 
    });
  }

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ 
        status: "Error",
        message: "User not found or unable to delete" 
      });
    }

    return res.status(200).json({ 
      status: "Ok",
      message: "User deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        gmail: user.gmail
      }
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ 
      status: "Error",
      message: "Server error",
      error: err.message 
    });
  }
};

exports.getAllUser = getAllUser;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;

console.log("✅ UserController loaded (Artisan Management)");