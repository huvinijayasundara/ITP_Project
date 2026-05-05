const UserC = require("../models/Register");
const bcrypt = require("bcryptjs");

// ==================== ADMIN CRUD FUNCTIONS ====================

// Get all users (admin function)
const getAllUserC = async (req, res) => {
  try {
    const users = await UserC.find().select("-password -conPassword");
    
    if (!users || users.length === 0) {
      return res.status(404).json({ 
        status: "Error",
        message: "No users found" 
      });
    }

    return res.status(200).json({ 
      status: "Ok",
      count: users.length,
      userc: users 
    });
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ 
      status: "Error",
      message: "Server error",
      error: err.message 
    });
  }
};

// Get user by ID (admin function)
const getById = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ 
      status: "Error",
      message: "User ID is required" 
    });
  }

  try {
    const user = await UserC.findById(id).select("-password -conPassword");
    
    if (!user) {
      return res.status(404).json({ 
        status: "Error",
        message: "User not found" 
      });
    }

    return res.status(200).json({ 
      status: "Ok",
      userc: user 
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

// Add new user (admin function)
const addUserC = async (req, res) => {
  const { name, gmail, phoneNumber, password, conPassword, role = "user" } = req.body;

  try {
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

    // Check if user exists
    const existingUser = await UserC.findOne({ gmail: gmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        status: "Error", 
        message: "User already exists with this email" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new UserC({
      name,
      gmail: gmail.toLowerCase(),
      phoneNumber: phoneNumber.toString(),
      password: hashedPassword,
      conPassword: hashedPassword,
      role: role
    });

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.conPassword;

    res.status(201).json({ 
      status: "Ok", 
      message: "User added successfully",
      user: userResponse 
    });
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ 
      status: "Error", 
      message: "Failed to add user",
      error: err.message 
    });
  }
};

// Update user (admin function)
const updateUserC = async (req, res) => {
  const id = req.params.id;
  const { name, gmail, phoneNumber, password, conPassword } = req.body;

  if (!id) {
    return res.status(400).json({ 
      status: "Error",
      message: "User ID is required" 
    });
  }

  try {
    const existingUser = await UserC.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        status: "Error",
        message: "User not found" 
      });
    }

    let updateData = {};
    
    if (name) updateData.name = name;
    if (gmail) updateData.gmail = gmail.toLowerCase();
    if (phoneNumber) updateData.phoneNumber = phoneNumber.toString();

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

    const user = await UserC.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select("-password -conPassword");

    if (!user) {
      return res.status(404).json({ 
        status: "Error",
        message: "Unable to update user" 
      });
    }

    return res.status(200).json({ 
      status: "Ok",
      message: "User updated successfully",
      userc: user 
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

// Delete user (admin function)
const deleteUserC = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ 
      status: "Error",
      message: "User ID is required" 
    });
  }

  try {
    const user = await UserC.findByIdAndDelete(id);

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

// Change password (admin function)
const changePassword = async (req, res) => {
  const id = req.params.id;
  const { password, conPassword } = req.body;

  if (!id) {
    return res.status(400).json({ 
      status: "Error",
      message: "User ID is required" 
    });
  }

  try {
    if (!password || !conPassword) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Password and confirm password are required" 
      });
    }

    if (password !== conPassword) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Passwords do not match" 
      });
    }

    if (password.length < 6 || password.length > 12) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Password must be 6-12 characters long" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserC.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
        conPassword: hashedPassword
      },
      { new: true }
    ).select("-password -conPassword");

    if (!user) {
      return res.status(404).json({ 
        status: "Error", 
        message: "User not found" 
      });
    }

    return res.status(200).json({ 
      status: "Ok", 
      message: "Password changed successfully",
      user 
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ 
      status: "Error", 
      message: "Failed to change password",
      error: err.message 
    });
  }
};

// Get users by role (admin function)
const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const users = await UserC.find({ role: role.toLowerCase() }).select("-password -conPassword");
    
    if (!users || users.length === 0) {
      return res.status(404).json({ 
        status: "Error",
        message: `No users found with role: ${role}` 
      });
    }

    return res.status(200).json({ 
      status: "Ok",
      count: users.length,
      users 
    });
  } catch (err) {
    console.error("Get users by role error:", err);
    return res.status(500).json({ 
      status: "Error",
      message: "Server error",
      error: err.message 
    });
  }
};

// ==================== PROFILE MANAGEMENT FUNCTIONS ====================

// Get current logged-in user profile
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await UserC.findById(userId).select("-password -conPassword");
    
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
    console.error("Get profile error:", err);
    return res.status(500).json({ 
      status: "Error", 
      message: "Server error",
      error: err.message 
    });
  }
};

// Update current logged-in user profile
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, gmail, phoneNumber } = req.body;

    // Validation
    if (!name || !gmail || !phoneNumber) {
      return res.status(400).json({ 
        status: "Error", 
        message: "All fields are required" 
      });
    }

    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Name can only contain letters and spaces" 
      });
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(gmail)) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Invalid email format. Use lowercase letters only" 
      });
    }

    if (!/^\d{10}$/.test(phoneNumber.toString())) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Phone number must be exactly 10 digits" 
      });
    }

    // Check if email is already used by another user
    const emailExists = await UserC.findOne({ 
      gmail: gmail.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (emailExists) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Email already in use by another user" 
      });
    }

    const updateData = { 
      name, 
      gmail: gmail.toLowerCase(), 
      phoneNumber: phoneNumber.toString() 
    };

    const user = await UserC.findByIdAndUpdate(userId, updateData, { 
      new: true, 
      runValidators: true 
    }).select("-password -conPassword");

    if (!user) {
      return res.status(404).json({ 
        status: "Error", 
        message: "Unable to update profile" 
      });
    }

    console.log("✅ Profile updated:", user.name);

    return res.status(200).json({ 
      status: "Ok", 
      message: "Profile updated successfully",
      user 
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ 
      status: "Error", 
      message: "Server error",
      error: err.message 
    });
  }
};

// Change current logged-in user password
const changeMyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6 || newPassword.length > 12) {
      return res.status(400).json({ 
        status: "Error", 
        message: "New password must be 6-12 characters long" 
      });
    }

    const user = await UserC.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        status: "Error", 
        message: "User not found" 
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: "Error", 
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserC.findByIdAndUpdate(userId, {
      password: hashedPassword,
      conPassword: hashedPassword
    });

    console.log("✅ Password changed for:", user.name);

    return res.status(200).json({ 
      status: "Ok", 
      message: "Password changed successfully" 
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ 
      status: "Error", 
      message: "Failed to change password",
      error: err.message 
    });
  }
};

// Delete current logged-in user profile
const deleteMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserC.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ 
        status: "Error", 
        message: "User not found or unable to delete" 
      });
    }

    console.log("✅ Profile deleted:", user.name);

    return res.status(200).json({ 
      status: "Ok", 
      message: "Profile deleted successfully"
    });
  } catch (err) {
    console.error("Delete profile error:", err);
    return res.status(500).json({ 
      status: "Error", 
      message: "Server error",
      error: err.message 
    });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  // Admin CRUD functions
  getAllUserC,
  getById,
  updateUserC,
  deleteUserC,
  addUserC,
  changePassword,
  getUsersByRole,
  // Profile management functions
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  deleteMyProfile
};

console.log("✅ UserCController loaded (Users & Admin Control)");