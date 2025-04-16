const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // ✅ Required for serving file paths
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const crypto = require('crypto');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); // Allow JSON data

// ✅ Serve static images from 'uploads' folder
app.use('/uploads', express.static('uploads'));


const authRoutes = require("./routes/authRoutes");
const businessRoutes = require("./routes/businessRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use('/api/forgot-password', forgotPasswordRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);


// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.message);
    } else {
        console.log("Connected to MySQL Database");
    }
});

// Test Route
app.get("/", (req, res) => {
    res.send("Bizboost API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
