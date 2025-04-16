const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");
const path = require("path");


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

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save images in 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });


// Upload main image of business
router.post("/upload-main-image/:id", upload.single("image"), (req, res) => {
    const imagePath = `/uploads/${req.file.filename}`;
    const sql = "UPDATE businesses SET main_image = ? WHERE id = ?";
    db.query(sql, [imagePath, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ imageUrl: imagePath });
    });
});

  

// Upload Business Image 
router.post("/upload/:id", upload.single("image"), (req, res) => {
    const businessId = req.params.id;
    const imagePath = `/uploads/${req.file.filename}`;

    // Fetch existing images (if any)
    const getSql = "SELECT images FROM businesses WHERE id = ?";
    db.query(getSql, [businessId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        let currentImages = result[0]?.images || '';
        let updatedImages = currentImages ? `${currentImages},${imagePath}` : imagePath;

        const updateSql = "UPDATE businesses SET images = ? WHERE id = ?";
        db.query(updateSql, [updatedImages, businessId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({ message: "Image uploaded successfully", imageUrl: imagePath });
        });
    });
});

// DELETE Business Image
router.delete("/delete-image/:id", authenticateToken, (req, res) => {
    const { imagePath } = req.body;
    const businessId = req.params.id;

    if (!imagePath) {
        return res.status(400).json({ error: "Image path is required" });
    }

    const fullPath = path.join(__dirname, "../uploads", path.basename(imagePath));

    // Delete the file from disk
    fs.unlink(fullPath, (err) => {
        if (err) {
            console.error("File deletion error:", err.message);
            return res.status(500).json({ error: "Failed to delete image from server" });
        }

        // Remove image reference from DB
        const getSql = "SELECT images FROM businesses WHERE id = ? AND owner_id = ?";
        db.query(getSql, [businessId, req.user.id], (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ error: "Failed to find business" });
            }

            const updatedImages = results[0].images
                .split(",")
                .filter(img => img !== imagePath)
                .join(",");

            const updateSql = "UPDATE businesses SET images = ? WHERE id = ? AND owner_id = ?";
            db.query(updateSql, [updatedImages, businessId, req.user.id], (err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to update image list" });
                }

                res.json({ message: "Image deleted successfully", updatedImages });
            });
        });
    });
});


// **Create a New Business (Requires Authentication)**
router.post("/", authenticateToken, (req, res) => {
    if (req.user.role !== "owner") return res.status(403).json({ error: "Unauthorized" });

    const { name, description, location, address, contact, category, hours_operation, price_range } = req.body;

if (!name || !description || !location || !address || !contact || !category) {
    return res.status(400).json({ error: "All fields are required" });
}

const sql = `
  INSERT INTO businesses (owner_id, name, description, location, address, contact, category, hours_operation, price_range, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

db.query(sql, [req.user.id, name, description, location, address, contact, category, hours_operation, price_range], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Business registered, pending admin approval" });
});

});


// **Get All Approved Businesses**
router.get("/", (req, res) => {
    let { search, category, location } = req.query;
    let sql = "SELECT * FROM businesses WHERE status = 'approved'";
    let values = [];

    if (search) {
        sql += " AND name LIKE ?";
        values.push(`%${search}%`);
    }
    if (category) {
        sql += " AND category = ?";
        values.push(category);
    }
    if (location) {
        sql += " AND location = ?";
        values.push(location);
    }

    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get business locatin only
router.get("/locations", (req, res) => {
    const sql = "SELECT DISTINCT location FROM businesses";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const locations = results.map(row => row.location);
        res.json(locations);
    });
});



// **Get Business by ID**
router.get("/:id", (req, res) => {
    const sql = `SELECT id, name, description, location, address, contact, images, main_image, category, status, hours_operation, price_range 
    FROM businesses WHERE id = ?`;
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Business not found" });
        res.json(result[0]);
    });
});

    // **Update Business (Only Owner)**
    router.put("/:id", authenticateToken, (req, res) => {
    const { name, description, location, address, contact, images, main_image = '', category, hours_operation, price_range } = req.body;

        const sql = `
        UPDATE businesses 
        SET name = ?, description = ?, location = ?, address = ?, contact = ?, images = ?, main_image = ?, category = ?, hours_operation = ?, price_range = ?
        WHERE id = ? AND owner_id = ?`;

        db.query(sql, [name, description, location, address, contact, images, main_image, category, hours_operation, price_range, req.params.id, req.user.id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(403).json({ error: "Unauthorized or business not found" });
            res.json({ message: "Business updated successfully" });
        });

    });
  




// **Delete Business (Only Admin)**
router.delete("/admin/delete/:id", authenticateToken, (req, res) => {
    const sql = "DELETE FROM businesses WHERE id = ? AND owner_id = ?";
    db.query(sql, [req.params.id, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(403).json({ error: "Unauthorized or business not found" });
        res.json({ message: "Business deleted successfully" });
    });
});

// **Approve or Reject Business (Admin Only)**
router.put("/admin/approve/:id", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    const { status } = req.body;
    const sql = "UPDATE businesses SET status = ? WHERE id = ?";
    
    db.query(sql, [status, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Business ${status} successfully` });
    });
});


// **Get business by owner ID**
router.get("/owner/:ownerId", async (req, res) => {
    try {
        const sql = `SELECT id, name, description, location, address, contact, images, main_image, category, status, hours_operation, price_range 
             FROM businesses WHERE owner_id = ?`;
        db.query(sql, [req.params.ownerId], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ message: "No business found" });
            res.json(results);
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Get Feedback for a Business
router.get("/:business_id", (req, res) => {
    const sql = "SELECT users.name, feedback.feedback, feedback.created_at FROM feedback JOIN users ON feedback.user_id = users.id WHERE business_id = ?";
    db.query(sql, [req.params.business_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
