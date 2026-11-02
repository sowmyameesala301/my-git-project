
const User = require("../models/User");
const bcrypt = require("bcrypt");

// USER REGISTRATION
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // Validate name
    const cleanName = name.trim();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty"
      });
    }

    // Normalize email
    const cleanEmail = email.trim().toLowerCase();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Password validation
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8 to 72 characters"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (role always customer)
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: "customer"
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = { registerUser };
