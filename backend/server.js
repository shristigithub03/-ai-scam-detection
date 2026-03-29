const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyze");

const app = express();

// CORS
app.use(cors());

// CRITICAL FIX: Increase payload limits - MUST be before routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging to see what's coming in
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.headers['content-length']) {
        const sizeMB = (parseInt(req.headers['content-length']) / 1024 / 1024).toFixed(2);
        console.log(`  Size: ${sizeMB} MB`);
    }
    next();
});

// Routes
app.use("/api", analyzeRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Scam Detector API Running" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    if (err.message === 'request entity too large') {
        res.status(413).json({ 
            error: "Request too large", 
            maxSize: "50MB",
            fix: "Use /api/analyze-image endpoint for images with multipart/form-data"
        });
    } else {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Max payload size: 50MB`);
});