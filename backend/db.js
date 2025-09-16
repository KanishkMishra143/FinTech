import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Your full DB URL from .env
  ssl: {
    rejectUnauthorized: false // Needed if your DB requires SSL (like Supabase or Heroku)
  }
});

// Test the database connection immediately
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1); // Stop the app if DB connection fails
  });

export default pool;

