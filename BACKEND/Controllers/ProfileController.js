// Controllers/ProfileController.js
const Register = require("../models/Register");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");

// ==================== PROFILE CONTROLLER ====================

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Try to find in Register model first (user, admin, delivery)
    let user = await Register.findById(userId).select("-password -conPassword");
    
    // If not found, try UserModel (artisan)
    if (!user) {
      user = await UserModel.findById(userId).select("-password -conPassword");
    }
    
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

// Update user profile
const updateProfile = async (req, res) => {
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

    // Name validation
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Name can only contain letters and spaces" 
      });
    }

    // Email validation
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(gmail)) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Invalid email format (use lowercase)" 
      });
    }

    // Phone validation
    if (!/^\d{10}$/.test(phoneNumber.toString())) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Phone number must be exactly 10 digits" 
      });
    }

    // Check if email is already used by another user
    let emailExists = await Register.findOne({ 
      gmail: gmail.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (!emailExists) {
      emailExists = await UserModel.findOne({ 
        gmail: gmail.toLowerCase(), 
        _id: { $ne: userId } 
      });
    }
    
    if (emailExists) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Email already in use by another user" 
      });
    }

    // Update data
    const updateData = {
      name,
      gmail: gmail.toLowerCase(),
      phoneNumber: phoneNumber.toString()
    };

    // Try to update in Register model first
    let user = await Register.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -conPassword");

    // If not found, try UserModel (artisan)
    if (!user) {
      user = await UserModel.findByIdAndUpdate(
        userId,
        { ...updateData, phoneNumber: Number(phoneNumber) }, // UserModel uses Number for phone
        { new: true, runValidators: true }
      ).select("-password -conPassword");
    }

    if (!user) {
      return res.status(404).json({ 
        status: "Error", 
        message: "User not found" 
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

// Change password
const changePassword = async (req, res) => {
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

    // Find user
    let user = await Register.findById(userId);
    let isArtisan = false;
    
    if (!user) {
      user = await UserModel.findById(userId);
      isArtisan = true;
    }

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

    // Update password in appropriate model
    if (isArtisan) {
      await UserModel.findByIdAndUpdate(userId, {
        password: hashedPassword,
        conPassword: hashedPassword
      });
    } else {
      await Register.findByIdAndUpdate(userId, {
        password: hashedPassword,
        conPassword: hashedPassword
      });
    }

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

// Delete profile
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Try to delete from Register model first
    let user = await Register.findByIdAndDelete(userId);
    
    // If not found, try UserModel (artisan)
    if (!user) {
      user = await UserModel.findByIdAndDelete(userId);
    }

    if (!user) {
      return res.status(404).json({ 
        status: "Error", 
        message: "User not found" 
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

// Export all functions
module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteProfile
};

console.log("✅ ProfileController loaded");