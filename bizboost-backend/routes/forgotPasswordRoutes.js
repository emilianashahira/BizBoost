const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// ✅ DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ✅ Email transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g. bizboostproject@gmail.com
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ 1. Request Reset Link
router.post('/request-reset', (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour

  const checkUserSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserSql, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updateSql = 'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?';
    db.query(updateSql, [token, expires, email], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: 'Error setting reset token.' });
      }

      const resetLink = `http://localhost:4200/reset-password/${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'BizBoost Password Reset',
        html: `
          <p>Hello,</p>
          <p>You requested a password reset. Click the link below to reset it:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      };

      // Simulate successful email sending for demo
console.log("✅ Simulating email send... Link:", resetLink);
res.json({ message: 'Email sending simulated for demo ✔️' });

      
    });
  });
});

// ✅ 2. Reset Password with Token
router.post('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  const sql = 'SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?';
  db.query(sql, [token, Date.now()], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    const userId = results[0].id;
    const updateSql = 'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?';

    db.query(updateSql, [newPassword, userId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: 'Failed to update password.' });
      }

      res.json({ message: 'Password has been reset successfully!' });
    });
  });
});

module.exports = router;
