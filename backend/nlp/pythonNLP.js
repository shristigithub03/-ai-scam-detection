// backend/nlp/pythonNLP.js
const { spawn } = require("child_process");

function classifyMessagePython(message, callback) {
    const py = spawn("python", ["nlp/scam_classifier.py", message]);

    py.stdout.on("data", (data) => {
        const [label, risk, guidance] = data.toString().trim().split("|");
        callback({ label, risk, guidance });
    });

    py.stderr.on("data", (data) => {
        console.error(`Python error: ${data}`);
        callback({ label: "error", risk: "error", guidance: "Error running NLP" });
    });
}

module.exports = { classifyMessagePython };