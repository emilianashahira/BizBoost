const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// ✅ DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ✅ Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// ✅ Get Average Rating + Total Ratings
router.get("/:businessId", (req, res) => {
  const businessId = req.params.businessId;

  const sql = `
    SELECT 
      AVG(rating) AS averageRating,
      COUNT(*) AS totalRatings 
    FROM ratings 
    WHERE business_id = ?
  `;

  db.query(sql, [businessId], (err, results) => {
    if (err) {
      console.error("Error fetching ratings:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    const averageRating = results[0].averageRating || 0;
    const totalRatings = results[0].totalRatings || 0;

    res.json({ averageRating, totalRatings });
  });
});

// ✅ Get All Ratings for a Business (with user name)
router.get("/all/:businessId", (req, res) => {
  const businessId = req.params.businessId;

  const sql = `
    SELECT r.id, r.rating, r.created_at, u.name AS user_name, r.user_id
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE r.business_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(sql, [businessId], (err, results) => {
    if (err) {
      console.error("Error fetching individual ratings:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// ✅ Submit or Update Rating
router.post("/", authenticateToken, (req, res) => {
  const { business_id, rating } = req.body;
  const user_id = req.user.id;

  if (!business_id || !rating || !user_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO ratings (user_id, business_id, rating)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE rating = VALUES(rating)
  `;

  db.query(sql, [user_id, business_id, rating], (err) => {
    if (err) {
      console.error("Failed to insert/update rating:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ message: "Rating saved successfully" });
  });
});

// ✅ Delete Rating (only by the user who submitted it)
router.delete("/delete/:id", authenticateToken, (req, res) => {
  const ratingId = req.params.id;
  const userId = req.user.id;

  const sql = "DELETE FROM ratings WHERE id = ? AND user_id = ?";

  db.query(sql, [ratingId, userId], (err, result) => {
    if (err) {
      console.error("Failed to delete rating:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "You are not authorized to delete this rating" });
    }

    res.json({ message: "Rating deleted successfully" });
  });
});

module.exports = router;
