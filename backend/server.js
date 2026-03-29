const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyze");
const { spawn } = require('child_process');
const path = require('path');
const { exec } = require('child_process');

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

// Serve static files from scam-frontend
const frontendPath = path.join(__dirname, '..', 'scam-frontend');
app.use(express.static(frontendPath));

// API endpoint for Tip Verifier (calls Python agent)
app.post("/api/verify-tip", (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: "No tip text provided" });
    }
    
    console.log(`\n🔍 Verifying tip: "${text.substring(0, 100)}..."`);
    
    // Call Python Tip Verifier Agent
    const pythonScript = path.join(__dirname, 'nlp', 'tip_verifier_cli.py');
    const pythonProcess = spawn('python', [pythonScript, text]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Python Error: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
        if (code === 0 && output) {
            try {
                // Try to parse as JSON
                const result = JSON.parse(output);
                res.json(result);
            } catch (e) {
                // If not JSON, send as text
                res.json({ 
                    original_tip: text,
                    analysis: {
                        final_verdict: output,
                        risk_level: "MEDIUM"
                    }
                });
            }
        } else {
            res.status(500).json({ 
                error: "Tip verification failed", 
                details: errorOutput 
            });
        }
    });
});

// Serve the Tip Verifier Chatbot page
app.get("/chatbot", (req, res) => {
    res.sendFile(path.join(frontendPath, 'tip-chatbot.html'));
});

// Test route
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, 'tip-chatbot.html'));
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({ 
        message: "Scam Detector API Running",
        tip_verifier: "active",
        endpoints: {
            "POST /api/verify-tip": "Verify stock tips",
            "GET /chatbot": "Tip Verifier Chatbot Interface",
            "GET /": "Home page"
        }
    });
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

// Function to open browser
function openBrowser() {
    const url = `http://localhost:${PORT}`;
    console.log(`\n🌐 Opening browser at: ${url}`);
    
    let command;
    switch (process.platform) {
        case 'win32': // Windows
            command = `start ${url}`;
            break;
        case 'darwin': // macOS
            command = `open ${url}`;
            break;
        default: // Linux
            command = `xdg-open ${url}`;
            break;
    }
    
    exec(command, (err) => {
        if (err) {
            console.log(`\n📱 Please open your browser and go to: ${url}`);
        }
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Scam Detector Server Running`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🤖 Tip Verifier Chatbot: http://localhost:${PORT}/chatbot`);
    console.log(`📊 Max payload size: 50MB`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Open browser automatically after 1 second
    setTimeout(() => {
        openBrowser();
    }, 1000);
});