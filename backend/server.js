import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

import pool from "./db.js"; // Import the pool configured for Supabase
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const cache = {};

const metricsCache = {
  companies: null,
  lastUpdated: null,
};

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

// Google Signin Route
app.post("/api/auth/google-signin", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();

    let userResult = await pool.query("SELECT * FROM users1 WHERE email = $1", [email]);
    let user = userResult.rows[0];

    if (user) {
      const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
      return res.status(200).json({ message: "Login successful", user, token: jwtToken });
    } else {
      const tempToken = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: "10m" });
      return res.status(200).json({ tempToken, message: "User not found. Please complete registration." });
    }
  } catch (err) {
    console.error("Google signin error:", err);
    res.status(500).json({ message: "Error signing in with Google" });
  }
});

// Google Signup Complete Route
app.post("/api/auth/google-signup-complete", async (req, res) => {
  const { tempToken, phone, password } = req.body;

  if (!tempToken || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const decodedToken = jwt.verify(tempToken, JWT_SECRET);
    const { name, email } = decodedToken;

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
      [name, email, phone, hashedPassword]
    );

    const user = result.rows[0];

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Google signup complete error:", err);
    res.status(500).json({ message: "Error completing registration" });
  }
});

// Request Password Reset
app.post("/api/auth/request-password-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users1 WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query("UPDATE users1 SET otp = $1, otp_expires_at = $2 WHERE email = $3", [
      otp,
      otpExpiresAt,
      email,
    ]);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://i.ibb.co/2Y3BbBDz/logo.png" alt="UptoSkills Logo" style="width: 150px;">
          </div>
          <h2 style="text-align: center; color: #333;">Your Password Reset OTP</h2>
          <p style="font-size: 16px; color: #555;">
            You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed.
          </p>
          <div style="text-align: center; font-size: 24px; font-weight: bold; color: #333; background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 16px; color: #555;">
            This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.
          </p>
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
            <p>&copy; 2025 UptoSkills. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
      res.json({ message: "OTP sent to your email" });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      res.json({ message: "OTP sent to your email" });
    }
  } catch (err) {
    console.error("Request password reset error:", err);
    res.status(500).json({ message: "Error requesting password reset" });
  }
});

// Verify OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users1 WHERE email = $1 AND otp = $2 AND otp_expires_at > NOW()",
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

// Reset Password with OTP
app.post("/api/auth/reset-password-with-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users1 WHERE email = $1 AND otp = $2 AND otp_expires_at > NOW()",
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users1 SET password = $1, otp = NULL, otp_expires_at = NULL WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password with OTP error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// Route to get all companies
app.get("/api/companies", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM companies_data'
    );
    res.json(result.rows);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Search Suggestions
app.get("/api/search-suggestions", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      "SELECT name, symbol FROM companies_data WHERE name ILIKE $1 OR symbol ILIKE $1 LIMIT 10",
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Search suggestions error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// app.get("/api/companies1", async (req, res) => {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM company_metrics LIMIT 500'
//     );
//     res.json(result.rows);
//     console.log(res.rows)
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database error" });
//   }
// });
app.get("/api/companies-with-metrics", async (req, res) => {
  const CACHE_TTL = 3600000; // 1 hour in milliseconds

  if (metricsCache.companies && metricsCache.lastUpdated && (Date.now() - metricsCache.lastUpdated < CACHE_TTL)) {
    return res.json(metricsCache.companies);
  }

  try {
    const result = await pool.query(`
      SELECT c.company_id, c.name, fm.name AS metric_name, mv.value
      FROM companies_data c
      LEFT JOIN metric_values mv ON c.company_id = mv.company_id AND mv.fiscal_year = 2024
      LEFT JOIN financial_metrics fm ON mv.metric_id = fm.metric_id
      WHERE fm.name IN ('Basic EPS (₹)', 'Diluted EPS (₹)', 'Cash EPS (₹)')
      LIMIT 500
    `);

    // Transform data into a nice format
    const companiesMap = {};
    result.rows.forEach(row => {
      if (!companiesMap[row.company_id]) {
        companiesMap[row.company_id] = { company_id: row.company_id, name: row.name };
      }
      if (row.metric_name) {
        if (row.metric_name === "Basic EPS (₹)") companiesMap[row.company_id].Basic_eps = row.value;
        if (row.metric_name === "Diluted EPS (₹)") companiesMap[row.company_id].Diluted_EPS = row.value;
        if (row.metric_name === "Cash EPS (₹)") companiesMap[row.company_id].Cash_EPS = row.value;
      }
    });

    // Filter out companies where any EPS metric is missing
    const filteredCompanies = Object.values(companiesMap).filter(c =>
      c.Basic_eps != null && c.Diluted_EPS != null && c.Cash_EPS != null
    );

    // Store the result in the cache
    metricsCache.companies = filteredCompanies;
    metricsCache.lastUpdated = Date.now();

    res.json(filteredCompanies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


app.get("/api/company/:companyName/metric/:metricName", async (req, res) => {
  const { companyName, metricName } = req.params;
  console.log("Requested:", companyName, metricName);

  try {
    // 1️⃣ Find the company_id from the company name (case-insensitive, partial match)
    const companyRes = await pool.query(
      "SELECT company_id, name FROM companies_data WHERE name ILIKE $1 LIMIT 1",
      [`%${companyName}%`]
    );

    if (companyRes.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const companyId = companyRes.rows[0].company_id;
    const realCompanyName = companyRes.rows[0].name;
    console.log("Found company:", companyId, realCompanyName);

    // 2️⃣ Find the metric_id for the given metricName
    const metricRes = await pool.query(
      "SELECT metric_id FROM financial_metrics WHERE name = $1",
      [metricName]
    );

    if (metricRes.rows.length === 0) {
      return res.status(404).json({ error: "Metric not found" });
    }

    const metricId = metricRes.rows[0].metric_id;
    console.log("Found metric:", metricId);

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

    // ✅ Return both company real name and values
    res.json({
      companyName: realCompanyName,
      values: valuesRes.rows
    });

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

    // Corrected line: Sends the ID as "userId"
    res.json({ userId: result.rows[0].id });
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




// ranked company based on mertrics  code

// --- Metric sets ---
const HIGHER_BETTER = new Set([
  "basic_eps", "diluted_eps", "cash_eps", "book_value_share", "dividend_share",
  "revenue_from_operations_share", "pbdit_share", "pbit_share", "pbt_share", "net_profit_share",
  "gross_profit_margin", "net_profit_margin", "operating_profit_margin",
  "ebit_margin", "ebitda_margin",
  "return_on_investment", "roe", "roa", "roce", "retention_ratio",
  "current_ratio_x", "quick_ratio_x", "cash_ratio_x",
  "interest_coverage_ratio_x", "shareholder_equity_ratio", "altman_z_score",
  "operating_leverage_ratio_x", "asset_turnover_ratio",
  "inventory_turnover_ratio", "receivables_turnover_ratio", "payables_turnover_ratio"
]);

const LOWER_BETTER = new Set([
  "total_debt_equity_x", "debt_ratio", "long_term_debt_equity_x",
  "short_term_debt_equity_x", "net_debt_equity_x",
  "effective_tax_rate", "cost_to_income_ratio",
  "nonperforming_assets_ratio", "gross_npa_ratio", "net_npa_ratio"
]);
const METRIC_MAP = {
  // HIGHER_BETTER
  "basic eps": "basic_eps",
  "diluted eps": "diluted_eps",
  "cash eps": "cash_eps",
  "book value/share": "book_value_share",
  "dividend/share": "dividend_share",
  "revenue from operations/share": "revenue_from_operations_share",
  "pbdit/share": "pbdit_share",
  "pbit/share": "pbit_share",
  "pbt/share": "pbt_share",
  "net profit/share": "net_profit_share",

  "gross profit margin": "gross_profit_margin",
  "net profit margin": "net_profit_margin",
  "operating profit margin": "operating_profit_margin",
  "ebit margin": "ebit_margin",
  "ebitda margin": "ebitda_margin",

  "return on investment": "return_on_investment",
  "roi": "return_on_investment",
  "roe": "roe",
  "roe (%)": "roe",
  "roa": "roa",
  "roa (%)": "roa",
  "roce": "roce",
  "roce (%)": "roce",
  "retention ratio": "retention_ratio",

  "current ratio": "current_ratio_x",
  "quick ratio": "quick_ratio_x",
  "cash ratio": "cash_ratio_x",
  "interest coverage ratio": "interest_coverage_ratio_x",
  "shareholder equity ratio": "shareholder_equity_ratio",
  "altman z score": "altman_z_score",
  "operating leverage ratio": "operating_leverage_ratio_x",
  "asset turnover ratio": "asset_turnover_ratio",
  "inventory turnover ratio": "inventory_turnover_ratio",
  "receivables turnover ratio": "receivables_turnover_ratio",
  "payables turnover ratio": "payables_turnover_ratio",

  // LOWER_BETTER
  "total debt/equity": "total_debt_equity_x",
  "debt ratio": "debt_ratio",
  "long term debt/equity": "long_term_debt_equity_x",
  "short term debt/equity": "short_term_debt_equity_x",
  "net debt/equity": "net_debt_equity_x",

  "effective tax rate": "effective_tax_rate",
  "cost to income ratio": "cost_to_income_ratio",
  "nonperforming assets ratio": "nonperforming_assets_ratio",
  "gross npa ratio": "gross_npa_ratio",
  "net npa ratio": "net_npa_ratio"
};
// --- API endpoint ---
// --- API endpoint ---
app.get("/api/companies1", async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear(); // Default to current year
  const cacheKey = `companies_${year}`;
  const CACHE_TTL = 3600000; // 1 hour in milliseconds

  if (cache[cacheKey] && (Date.now() - cache[cacheKey].lastUpdated < CACHE_TTL)) {
    return res.json(cache[cacheKey].data);
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        c.company_id,
        c.name AS company_name,
        cm.symbol,
        cm.share_price,
        cm.market_cap,
        fm.name AS metric_name,
        mv.value,
        mv.fiscal_year
      FROM companies_data c
      LEFT JOIN company_metrics cm ON c.name = cm.name
      LEFT JOIN metric_values mv ON c.company_id = mv.company_id
      LEFT JOIN financial_metrics fm ON mv.metric_id = fm.metric_id
      WHERE mv.fiscal_year = $1
      `,
      [year]
    );

    // Group values by company
    const companies = {};
    for (const row of result.rows) {
      const raw = (row.metric_name || "").toLowerCase().trim();
      const metric = METRIC_MAP[raw] || raw;
      const val = parseFloat(row.value);

      if (!companies[row.company_id]) {
        companies[row.company_id] = {
          name: row.company_name,
          symbol: row.symbol,
          share_price: row.share_price,
          market_cap: row.market_cap,
          metrics: {},
        };
      }

      if (!isNaN(val) && (HIGHER_BETTER.has(metric) || LOWER_BETTER.has(metric))) {
        companies[row.company_id].metrics[metric] = val;
      }
    }

    // Collect all metric names
    const metricNames = Array.from(
      new Set(Object.values(companies).flatMap(c => Object.keys(c.metrics)))
    );

    // Find min and max for each metric
    const stats = {};
    for (const m of metricNames) {
      const vals = Object.values(companies)
        .map(c => c.metrics[m])
        .filter(v => v !== undefined);
      if (vals.length) {
        stats[m] = { min: Math.min(...vals), max: Math.max(...vals) };
      }
    }

    // Compute scores
    const scored = Object.values(companies).map(c => {
      let total = 0, count = 0;
      for (const m of metricNames) {
        if (c.metrics[m] !== undefined) {
          const { min, max } = stats[m];
          let s = 0.5;
          if (max > min) s = (c.metrics[m] - min) / (max - min);
          if (LOWER_BETTER.has(m)) s = 1 - s;
          total += s;
          count++;
        }
      }
      return {
        name: c.name,
        symbol: c.symbol,
        share_price: c.share_price,
        market_cap: c.market_cap,
        score: count ? total / count : 0
      };
    });

    // Sort and rank
    scored.sort((a, b) => b.score - a.score);
    scored.forEach((c, i) => (c.rank = i + 1));

    // Store the result in the cache
    cache[cacheKey] = {
      data: scored,
      lastUpdated: Date.now(),
    };

    res.json(scored);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});



// A POST route to handle feedback submissions
app.post("/api/feedback", async (req, res) => {
  const { rating, feedback } = req.body;

  try {
    const query =
      "INSERT INTO feedback_entries (rating, feedback) VALUES ($1, $2) RETURNING *";
    const values = [rating, feedback];
    const result = await pool.query(query, values);
    res.status(201).json({ message: "Feedback submitted successfully!", data: result.rows[0] });
  } catch (err) {
    console.error("Error inserting feedback:", err);
    res.status(500).json({ error: "Failed to submit feedback." });
  }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
