const express = require("express");
const router = express.Router();
const { classifyMessagePython } = require("../nlp/pythonNLP");

router.post("/detect", (req, res) => {
    console.log("POST /detect hit", req.body); // debug log
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        classifyMessagePython(message, (result) => {
            if (!res.headersSent) res.json(result);
        });
    } catch (err) {
        console.error("Python error:", err);
        if (!res.headersSent) {
            res.status(500).json({
                label: "error",
                risk: "error",
                guidance: "Error running NLP",
            });
        }
    }
});

module.exports = router;