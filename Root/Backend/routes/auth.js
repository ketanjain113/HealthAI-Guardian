import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// -------------------- SIGNUP --------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    if (!name || !email || !password || !age || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
    });

    await newUser.save();

    // Send userId, name and redirect
    return res.status(200).json({ 
      userId: newUser._id.toString(),
      name: newUser.name,
      redirect: "/" 
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN request body:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("Login failed - user not found:", email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Login failed - wrong password for:", email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // success — send userId, name and redirect
    console.log("Login success:", user.email);
    return res.status(200).json({
      success: true,
      userId: user._id.toString(),
      name: user.name,
      redirect: "/"
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
