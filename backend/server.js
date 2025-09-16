import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import pool from "./db.js"; // Import the pool configured for Supabase
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
// Auth middleware to protect routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // uses your existing JWT_SECRET
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Signup Route
app.post("/api/auth/signup", async (req, res) => {
  const { fullname, email, phone, password } = req.body;

  if (!fullname || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users1 WHERE email=$1 OR phone=$2",
      [email, phone]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User with this email or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users1 (fullname, email, phone, password) VALUES ($1,$2,$3,$4) RETURNING id, fullname, email",
      [fullname, email, phone, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", user, token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

// Signin Route
app.post("/api/auth/signin", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Identifier and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users1 WHERE email=$1 OR phone=$1 LIMIT 1",
      [identifier]
    );
    if (result.rows.length === 0) return res.status(401).json({ message: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", user: { id: user.id, fullname: user.fullname, email: user.email }, token });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Error signing in", error: err.message });
  }
});
// Route to get all companies
app.get("/api/companies", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM companies ;'
    );
    res.json(result.rows);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/company/:id/metrics", async (req, res) => {
  const companyId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT fm.name, mv.value
       FROM metric_values mv
       JOIN financial_metrics fm ON mv.metric_id = fm.metric_id
       WHERE mv.company_id = $1
       AND fm.name IN ('ROE', 'Debt/Equity', 'Current Ratio')`,
      [companyId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.get("/api/company/:companyName/metric/:metricName", async (req, res) => {
  const { companyName, metricName } = req.params;
  console.log(companyName,metricName)
  try {
    // 1️⃣ Find the company_id from the company name
    const companyRes = await pool.query(
      "SELECT company_id FROM companies WHERE name = $1",
      [companyName]
    );
   console.log(companyRes)
    if (companyRes.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const companyId = companyRes.rows[0].company_id;
    console.log(companyId)
    // 2️⃣ Find the metric_id for the given metricName
    const metricRes = await pool.query(
      "SELECT metric_id FROM financial_metrics WHERE name = $1",
      [metricName]
    );

    if (metricRes.rows.length === 0) {
      return res.status(404).json({ error: "Metric not found" });
    }

    const metricId = metricRes.rows[0].metric_id;
    console.log(metricId)
    // 3️⃣ Get the last 5 years of values for this company + metric
    const valuesRes = await pool.query(
      `SELECT fiscal_year, value
       FROM metric_values
       WHERE company_id = $1 AND metric_id = $2
       ORDER BY fiscal_year DESC
       LIMIT 5`,
      [companyId, metricId]
    );
if (valuesRes.rows.length === 0) {
  return res.status(404).json({ error: "No data found for this metric" });
}
    res.json(valuesRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});




// Step 1: Verify user exists
app.post("/api/auth/verify-user", async (req, res) => {
  const { identifier } = req.body;
  try {
    const result = await pool.query(
      "SELECT id FROM users1 WHERE email=$1 OR phone=$1 LIMIT 1",
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Step 2: Reset password
app.post("/api/auth/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users1 SET password=$1 WHERE id=$2",
      [hashedPassword, userId]
    );
    
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
