const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Middleware for Admin Auth
const authenticateAdmin = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
    if (err || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    req.user = user;
    next();
  });
};


// ✅ NEW ROUTE — Get ALL businesses with owner info
router.get('/businesses/status/:status', authenticateAdmin, (req, res) => {
    const status = req.params.status;
  
    const sql = `
      SELECT b.*, u.name AS owner_name, u.email AS owner_email, u.id AS owner_id
      FROM businesses b
      JOIN users u ON b.owner_id = u.id
      WHERE b.status = ?
    `;
  
    db.query(sql, [status], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
  
      const businesses = results.map(b => ({
        ...b,
        owner: {
          id: b.owner_id,
          name: b.owner_name,
          email: b.owner_email
        }
      }));
  
      res.json(businesses);
    });
  });
  
// 🟢 GET: Business + Owner Info by Business ID
router.get('/business-details/:id', authenticateAdmin, (req, res) => {
  const businessId = req.params.id;
  const sql = `
    SELECT b.*, u.name as owner_name, u.email as owner_email, u.role
    FROM businesses b
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `;
  db.query(sql, [businessId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

// ✅ POST: Approve Business (Update Role + Business Status)
router.post('/approve/:id', authenticateAdmin, (req, res) => {
    const businessId = req.params.id;
  
    const getUserIdSql = "SELECT owner_id FROM businesses WHERE id = ?";
    db.query(getUserIdSql, [businessId], (err, result) => {
      if (err || result.length === 0) return res.status(500).json({ error: "User not found" });
  
      const userId = result[0].owner_id;
  
      // First update user role
      const updateUserRoleSql = "UPDATE users SET role = 'owner' WHERE id = ?";
      db.query(updateUserRoleSql, [userId], (err1) => {
        if (err1) return res.status(500).json({ error: err1.message });
  
        // Then update business status
        const updateBusinessStatusSql = "UPDATE businesses SET status = 'approved' WHERE id = ?";
        db.query(updateBusinessStatusSql, [businessId], (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
  
          res.json({ message: "Business approved and user upgraded to owner" });
        });
      });
    });
  });
  

// 🔼 PUT: Activate Business (Set status = 'approved')
router.put('/business/activate/:id', authenticateAdmin, (req, res) => {
    const sql = "UPDATE businesses SET status = 'approved' WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Business activated successfully" });
    });
  });
  

// 🔻 PUT: Deactivate Business
router.put('/business/deactivate/:id', authenticateAdmin, (req, res) => {
  db.query("UPDATE businesses SET status = 'deactivated' WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Business deactivated" });
  });
});

// ❌ DELETE Business and Update Owner Role
router.delete('/business/:id', authenticateAdmin, (req, res) => {
    const businessId = req.params.id;

    // First, get the owner ID of the business
    const getOwnerSql = "SELECT owner_id FROM businesses WHERE id = ?";
    db.query(getOwnerSql, [businessId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) return res.status(404).json({ error: "Business not found" });

        const ownerId = result[0].owner_id;

        // Delete the business
        const deleteBusinessSql = "DELETE FROM businesses WHERE id = ?";
        db.query(deleteBusinessSql, [businessId], (err1) => {
            if (err1) return res.status(500).json({ error: err1.message });

            // Update the owner's role to 'visitor'
            const updateRoleSql = "UPDATE users SET role = 'visitor' WHERE id = ?";
            db.query(updateRoleSql, [ownerId], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });

                res.json({ message: "Business deleted and owner downgraded to visitor." });
            });
        });
    });
});


// 👥 GET: All Visitors
router.get('/users', authenticateAdmin, (req, res) => {
  db.query(`
    SELECT id, name, email, role, profile_photo, created_at, status
    FROM users
    WHERE role != 'admin'
  `, (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
});

router.put('/user/status/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id;
  const newStatus = req.body.status;

  const sql = "UPDATE users SET status = ? WHERE id = ?";
  db.query(sql, [newStatus, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `User status updated to ${newStatus}` });
  });
});




// ❌ DELETE: User
router.delete('/user/:id', authenticateAdmin, (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully" });
  });
});

// 🌟 GET: Feedback 
router.get('/feedback', authenticateAdmin, (req, res) => {
  const sql = `
    SELECT f.id, f.feedback, f.created_at, u.name AS user_name, b.name AS business_name
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    JOIN businesses b ON f.business_id = b.id
    ORDER BY f.created_at DESC
  `;
  db.query(sql, (err, feedbacks) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(feedbacks);
  });
});

// ❌ DELETE Feedback
router.delete('/feedback/:id', authenticateAdmin, (req, res) => {
  db.query("DELETE FROM feedback WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Feedback deleted successfully" });
  });
}); 

// ⭐ GET: All Ratings
router.get('/ratings', authenticateAdmin, (req, res) => {
  const sql = `
    SELECT r.id, r.rating, r.created_at, u.name AS user_name, b.name AS business_name
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    JOIN businesses b ON r.business_id = b.id
    ORDER BY r.created_at DESC
  `;

  db.query(sql, (err, ratings) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(ratings);
  });
});

// ❌ DELETE: Rating
router.delete('/ratings/:id', authenticateAdmin, (req, res) => {
  const ratingId = req.params.id;

  db.query('DELETE FROM ratings WHERE id = ?', [ratingId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Rating deleted successfully' });
  });
});

module.exports = router;
