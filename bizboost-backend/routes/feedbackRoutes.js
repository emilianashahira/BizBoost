const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Middleware for Authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "No token provided" });

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// Submit Feedback
// Submit or Update Feedback
router.post("/", authenticateToken, (req, res) => {
    const { business_id, feedback } = req.body;
    const user_id = req.user.id;
  
    if (!business_id || !user_id || !feedback) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    const sql = `
      INSERT INTO feedback (user_id, business_id, feedback)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE feedback = VALUES(feedback), created_at = CURRENT_TIMESTAMP
    `;
  
    db.query(sql, [user_id, business_id, feedback], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Feedback submitted successfully" });
    });
  });
  
  // Get Feedbacks (formatted date)
  router.get("/:business_id", (req, res) => {
    const sql = `
      SELECT feedback.id, users.id AS user_id, users.name, feedback.feedback,
             DATE_FORMAT(feedback.created_at, '%d-%m-%Y') AS created_at
      FROM feedback 
      JOIN users ON feedback.user_id = users.id 
      WHERE feedback.business_id = ?
    `;
    db.query(sql, [req.params.business_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  

router.delete("/delete/:id", authenticateToken, (req, res) => {
    const feedbackId = req.params.id;
    const userId = req.user.id;
  
    const sql = "DELETE FROM feedback WHERE id = ? AND user_id = ?";
    db.query(sql, [feedbackId, userId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(403).json({ error: "Unauthorized or feedback not found" });
      res.json({ message: "Feedback deleted successfully" });
    });
  });
  

module.exports = router;
