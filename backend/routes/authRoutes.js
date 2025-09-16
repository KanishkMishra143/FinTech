import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js"; // PostgreSQL connection pool

const router = express.Router();

// Helper function to create JWT
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Signup Route
router.post("/signup", async (req, res) => {
  const { email, phone, password } = req.body;

  if (!email || !phone || !password) {
    return res.status(400).json({ message: "Email, phone, and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users1 WHERE email=$1 OR phone=$2",
      [email, phone]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User with email or phone already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users1 (email, phone, password) VALUES ($1, $2, $3) RETURNING id, email, phone, created_at",
      [email, phone, hashedPassword]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = createToken(user);

    res.status(201).json({ message: "User registered successfully", token, user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});

// Signin Route
router.post("/signin", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Identifier and password are required" });
  }

  try {
    // Search by email OR phone
    const result = await pool.query(
      "SELECT * FROM users1 WHERE email=$1 OR phone=$1",
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = createToken(user);

    res.json({ message: "Login successful", token, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
