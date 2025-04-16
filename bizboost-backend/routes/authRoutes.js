const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// ✅ USER REGISTRATION (Default role: visitor)
router.post("/register", async (req, res) => {
    console.log("Received request at /api/auth/register"); // Debugging
    try {
        const { name, email, password } = req.body;
        console.log("Received data:", req.body); // Debugging

        // Check if email is already registered
        const checkUserSQL = "SELECT email FROM users WHERE email = ?";
        db.query(checkUserSQL, [email], async (err, results) => {
            if (err) return res.status(500).json({ error: "Database error: " + err.message });

            if (results.length > 0) {
                return res.status(400).json({ error: "Email already registered" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user (Default role: visitor)
            const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
            db.query(sql, [name, email, hashedPassword, "visitor"], (err, result) => {
                if (err) return res.status(500).json({ error: "Database error: " + err.message });

                res.status(201).json({ message: "User registered successfully" });
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
});

// ✅ BUSINESS REGISTRATION (Role: owner & Status: pending)
router.post("/register-business", async (req, res) => {
    console.log("Received request at /api/auth/register-business");

    try {
        const { name, category, location, address, description, contact, hours_operation, price_range, ownerId } = req.body;
        console.log("Received data:", req.body);

        // Check if the owner exists
        const checkUserSQL = "SELECT id FROM users WHERE id = ?";
        db.query(checkUserSQL, [ownerId], async (err, results) => {
            if (err) return res.status(500).json({ error: "Database error: " + err.message });
            if (results.length === 0) {
                return res.status(400).json({ error: "Owner does not exist" });
            }

            const insertBusinessSQL = `
                INSERT INTO businesses (name, category, location, address, description, contact, hours_operation, price_range, owner_id, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

            db.query(insertBusinessSQL, [name, category, location, address, description, contact, hours_operation, price_range, ownerId], (err) => {
                if (err) return res.status(500).json({ error: "Database error: " + err.message });

                res.status(201).json({ message: "Business registered and pending approval." });
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
});




// ✅ LOGIN (Prevent login for pending businesses)
router.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }
  
      const user = results[0];
  
      // ❌ Block if user status is 'Deactive'
      if (user.status === "Deactive") {
        return res.status(403).json({ error: "Your account has been blocked" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
  
      // 🟡 If role is owner, check business status
      if (user.role === "owner") {
        const businessCheckSQL = "SELECT status FROM businesses WHERE owner_id = ?";
        db.query(businessCheckSQL, [user.id], (err, businessResults) => {
          if (err) return res.status(500).json({ error: "Database error: " + err.message });
  
          if (businessResults.length > 0 && businessResults[0].status === "pending") {
            return res.status(403).json({
              error: "Your business is still pending approval. You cannot log in yet."
            });
          }
  
          // ✅ Generate token for approved owner
          const tokenPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_photo: user.profile_photo
          };
  
          const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
          res.json({ message: "Login successful", token, role: user.role });
        });
      } else {
        // ✅ Generate token for admin or visitor
        const tokenPayload = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile_photo: user.profile_photo
        };
  
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token, role: user.role });
      }
    });
  });
  


// Get User by ID
router.get("/user/:id", (req, res) => {
    const sql = "SELECT id, name, email, role, profile_photo FROM users WHERE id = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(results[0]);
    });
});

// Update User Info
router.put("/user/:id", (req, res) => {
    const { name, email, password } = req.body;
    const sql = password
        ? "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?"
        : "UPDATE users SET name = ?, email = ? WHERE id = ?";

    const values = password
        ? [name, email, password, req.params.id]
        : [name, email, req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User profile updated successfully" });
    });
});

// Upload profile photo
const upload = multer({ dest: "uploads/" });
router.post("/upload-profile/:id", upload.single("image"), (req, res) => {
    const filePath = `/uploads/${req.file.filename}`;
    const sql = "UPDATE users SET profile_photo = ? WHERE id = ?";
    db.query(sql, [filePath, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ imageUrl: filePath });
    });
});


// 🔐 Route: Request Password Reset
// router.post('/forgot-password', (req, res) => {
//     const { email } = req.body;
  
//     // 1. Check if user exists
//     const query = 'SELECT * FROM users WHERE email = ?';
//     db.query(query, [email], (err, results) => {
//       if (err) return res.status(500).json({ error: 'Database error' });
//       if (results.length === 0) {
//         return res.status(404).json({ error: 'No user with that email' });
//       }
  
//       const user = results[0];
  
//       // 2. Create token valid for 15 minutes
//       const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  
//       // 3. Generate reset link
//       const resetLink = `http://localhost:4200/reset-password/${token}`;
  
//       // 4. Send email (configure your SMTP settings in .env)
//       const transporter = nodemailer.createTransport({
//         service: 'gmail', // Or use any SMTP
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS
//         }
//       });
  
//       const mailOptions = {
//         from: `"BizBoost Support" <${process.env.EMAIL_USER}>`,
//         to: user.email,
//         subject: 'Password Reset Request - BizBoost',
//         html: `
//           <p>Hello ${user.name},</p>
//           <p>You requested to reset your password. Click the link below to continue:</p>
//           <a href="${resetLink}">${resetLink}</a>
//           <p>This link will expire in 15 minutes.</p>
//         `
//       };
  
//       transporter.sendMail(mailOptions, (mailErr, info) => {
//         if (mailErr) {
//           console.error('Email error:', mailErr);
//           return res.status(500).json({ error: 'Failed to send reset email' });
//         }
//         return res.json({ message: 'Reset link sent to your email' });
//       });
//     });
//   });


  // 🔐 Route: Reset Password with Token
// router.post('/reset-password/:token', async (req, res) => {
//     const token = req.params.token;
//     const { newPassword } = req.body;
  
//     if (!newPassword) {
//       return res.status(400).json({ error: 'New password is required' });
//     }
  
//     // 1. Verify the token
//     jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
//       if (err) {
//         return res.status(401).json({ error: 'Invalid or expired token' });
//       }
  
//       const userId = decoded.id;
  
//       // 2. Hash the new password
//       try {
//         const hashedPassword = await bcrypt.hash(newPassword, 10);
  
//         // 3. Update password in DB
//         const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
//         db.query(updateQuery, [hashedPassword, userId], (updateErr) => {
//           if (updateErr) {
//             return res.status(500).json({ error: 'Failed to update password' });
//           }
  
//           return res.json({ message: 'Password has been reset successfully' });
//         });
//       } catch (hashErr) {
//         return res.status(500).json({ error: 'Error hashing password' });
//       }
//     });
//   });


module.exports = router;
