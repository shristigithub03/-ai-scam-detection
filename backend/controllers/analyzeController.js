const Tesseract = require("tesseract.js");
const sharp = require("sharp");

// 🔴 SCAM KEYWORDS WITH WEIGHTS
const scamKeywords = [
  { word: "click here", weight: 2 },
  { word: "urgent", weight: 2 },
  { word: "act now", weight: 2 },
  { word: "limited time", weight: 2 },
  { word: "offer expires", weight: 2 },

  { word: "winner", weight: 3 },
  { word: "congratulations", weight: 2 },
  { word: "you won", weight: 3 },
  { word: "free money", weight: 3 },
  { word: "claim now", weight: 2 },

  { word: "verify account", weight: 3 },
  { word: "update account", weight: 3 },
  { word: "bank alert", weight: 3 },
  { word: "otp", weight: 4 },
  { word: "password", weight: 4 },
  { word: "login now", weight: 3 },
  { word: "suspend account", weight: 3 },

  { word: "lottery", weight: 3 },
  { word: "prize", weight: 2 },
  { word: "gift card", weight: 2 },

  { word: "bitcoin", weight: 3 },
  { word: "crypto", weight: 3 },
  { word: "investment", weight: 2 },
  { word: "double your money", weight: 4 },
  { word: "guaranteed return", weight: 4 },

  { word: "earn money fast", weight: 3 },
  { word: "work from home", weight: 2 },
  { word: "job offer", weight: 2 },
  { word: "selected candidate", weight: 2 },
  { word: "pay registration fee", weight: 4 },
  { word: "processing fee", weight: 3 },

  { word: "refund pending", weight: 2 },
  { word: "click link below", weight: 2 },
  { word: "download now", weight: 2 },
  { word: "apk file", weight: 3 },
  { word: "unknown sender", weight: 2 }
];

// 🔥 CORE ANALYSIS FUNCTION
const analyzeScam = (text) => {
  const lower = text.toLowerCase();
  let score = 0;
  let reasons = [];

  // 🚨 1. URGENCY & PRESSURE (20)
  const urgencyRegex = /\b(urgent|immediately|asap|within \d+ hours|act now|final warning|last chance)\b/i;
  if (urgencyRegex.test(text)) {
    score += 20;
    reasons.push("Urgency / pressure tactic detected");
  }

  // 🔗 2. SUSPICIOUS LINKS (25)
  const suspiciousURL =
    /(bit\.ly|tinyurl|shorturl|\.xyz|\.top|\.club|\.online|\.tk|\d{1,3}(\.\d{1,3}){3})/i;
  if (suspiciousURL.test(text)) {
    score += 25;
    reasons.push("Suspicious or shortened URL detected");
  }

  // 🔥 Long or complex URLs
  if (text.length > 100 && text.includes("http")) {
    score += 10;
    reasons.push("Unusually long URL");
  }

  // 💰 3. PAYMENT REQUEST (30)
  const moneyRegex =
    /\b(send|transfer|pay|bitcoin|crypto|gift card|western union|moneygram|\$\d+|\d+\s?rs|\d+\s?inr)\b/i;
  if (moneyRegex.test(text)) {
    score += 30;
    reasons.push("Financial/payment request detected");
  }

  // 🔐 4. PERSONAL INFO REQUEST (25)
  const personalInfoRegex =
    /\b(password|otp|pin|cvv|credit card|debit card|verify account|bank details)\b/i;
  if (personalInfoRegex.test(text)) {
    score += 25;
    reasons.push("Sensitive information request detected");
  }

  // 👤 5. IMPERSONATION (15)
  const impersonationRegex =
    /\b(amazon|paypal|bank|microsoft|netflix|irs|fbi|upi|phonepe|gpay)\b/i;
  if (impersonationRegex.test(text)) {
    score += 15;
    reasons.push("Possible impersonation of trusted entity");
  }

  // 🎭 6. EMOTIONAL MANIPULATION (10)
  if (
    lower.includes("you won") ||
    lower.includes("congratulations") ||
    lower.includes("double your money")
  ) {
    score += 10;
    reasons.push("Too-good-to-be-true / reward bait");
  }

  // 🔠 7. LANGUAGE PATTERNS (10)
  if (text.includes("!!!") || text.includes("???")) {
    score += 5;
    reasons.push("Excessive punctuation");
  }

  if (text === text.toUpperCase() && text.length > 20) {
    score += 10;
    reasons.push("ALL CAPS message (aggressive tone)");
  }

  // 📛 8. DOMAIN / TYPOSQUATTING (10)
  if (
    lower.includes("paypa1") ||
    lower.includes("g00gle") ||
    lower.includes("faceb00k")
  ) {
    score += 10;
    reasons.push("Possible fake domain (typosquatting)");
  }

  // 📱 9. APK / DOWNLOAD (10)
  if (lower.includes("apk") || lower.includes("download app")) {
    score += 10;
    reasons.push("Suspicious app download request");
  }

  // 🔢 FINAL SCORE NORMALIZATION
  score = Math.min(score, 100);

  // 🎯 RISK LEVEL
  let risk = "LOW";
  if (score >= 70) risk = "HIGH";
  else if (score >= 40) risk = "MEDIUM";

  // 💡 SUGGESTION
  let suggestion =
    risk === "HIGH"
      ? "🚨 High risk scam! Do NOT click links or share personal info."
      : risk === "MEDIUM"
      ? "⚠️ Suspicious message. Verify before acting."
      : "✅ Looks safe, but stay cautious.";

  return { score, risk, reasons, suggestion };
};

// 🔹 TEXT ANALYSIS
exports.analyzeText = (req, res) => {
  const text = req.body?.text;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const result = analyzeScam(text);

  res.json(result);
};

// 🔹 IMAGE ANALYSIS (OCR + preprocessing)
exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = req.file.path;
    const processedPath = "uploads/processed.png";

    // 🔥 Image preprocessing
    await sharp(imagePath)
      .grayscale()
      .normalize()
      .sharpen()
      .toFile(processedPath);

    // 🔥 OCR
    const result = await Tesseract.recognize(processedPath, "eng");

    const extractedText = result.data.text.trim();

    console.log("OCR Output:", extractedText);

    if (!extractedText) {
      return res.json({
        extractedText: "",
        risk: "LOW",
        score: 0,
        reasons: ["No text detected"],
        suggestion: "Upload a clearer image"
      });
    }

    // 🔥 Use same logic
    const analysis = analyzeScam(extractedText);

    res.json({
      extractedText,
      ...analysis
    });

  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ error: "OCR failed" });
  }
};