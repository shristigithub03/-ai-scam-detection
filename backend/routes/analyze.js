const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  analyzeText,
  analyzeImage
} = require("../controllers/analyzeController");

// Configure multer for file uploads
const upload = multer({ 
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.post("/analyze-text", analyzeText);
router.post("/analyze-image", upload.single("image"), analyzeImage);

// Handle multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: "File too large. Max 10MB" });
        }
    }
    next(err);
});

module.exports = router;