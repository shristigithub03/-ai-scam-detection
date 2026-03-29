# 🚀 InvestorShield AI

### 🧠 AI Intelligence Layer for Indian Retail Investors

---

## 📌 Problem Statement

India has 14+ crore demat accounts, but most retail investors rely on unverified tips, miss critical filings, and make decisions based on incomplete information.

This leads to:

* ❌ Losses due to fake or misleading tips
* ❌ Poor understanding of market signals
* ❌ Delayed reaction to important financial data

---

## 💡 Our Solution

**InvestorShield AI** is an intelligent system that transforms raw financial tips and messages into **actionable insights** using AI.

It acts as a:

* 🔍 **Risk Detection Engine**
* 📊 **Opportunity Radar**
* 🤖 **Market ChatGPT for Investors**

---

## 🚀 Key Features

### 🔴 Risk Signal Engine (Scam Detection)

* Detects fraudulent and misleading financial messages
* Identifies pump-and-dump patterns
* Provides **Risk Levels (Low / Medium / High)**

---

### 🟢 Opportunity & Tip Verifier

* Analyzes stock tips from:

  * WhatsApp
  * Telegram
  * YouTube
* Extracts:

  * Stock names
  * Price targets
  * Timeframes
* Validates claims using AI

---

### 🤖 Market Intelligence Chatbot

* AI chatbot powered by Hugging Face
* Acts like **Market ChatGPT**
* Provides:

  * Tip verification
  * Risk analysis
  * Investment insights

---

### 🖼️ Image-Based Analysis

* Upload screenshots of messages
* Extract text using OCR (Tesseract.js)
* Analyze using NLP models

---

## 💡 Example

**User Input:**

```
Reliance will hit ₹3500 by March!
```

**AI Output:**

```
⚠️ No supporting regulatory filings  
📉 Analyst average target: ₹2750  
🚨 Pattern match: Pump-and-dump scheme  

👉 Verdict: HIGH RISK (Avoid)
```

---

## 🧠 Alignment with Problem Statement 6

This project acts as an **AI Intelligence Layer** by:

* Converting unverified tips into structured insights
* Detecting risk signals in real-time
* Simulating cross-verification with financial data
* Providing actionable outputs (Risk vs Opportunity)

---

## 🏗️ System Architecture

```
User Input (Text / Image / Chat)
        ↓
React Frontend (UI + Chatbot)
        ↓
Node.js Backend
        ↓
AI Processing Layer
 ├── NLP Model (Tip Analysis)
 ├── OCR (Image Processing)
 ├── Risk Classifier
 └── Hugging Face LLM
        ↓
Decision Engine
 ├── Risk Detection
 ├── Opportunity Signal
        ↓
User Interface (Results + Chatbot)
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* CSS

### Backend

* Node.js
* Express.js

### AI / ML

* Hugging Face Transformers
* Python NLP Models
* Named Entity Recognition (NER)

### OCR

* Tesseract.js

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/ai-scam-detection.git
cd ai-scam-detection
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
node server.js
```

---

### 3️⃣ Frontend Setup

```bash
cd scam-frontend
npm install
npm start
```

---

### 4️⃣ Environment Variables

Create a `.env` file inside `scam-frontend`:

```
REACT_APP_HF_API_KEY=your_huggingface_api_key
```

---

## 🌐 Deployment

* Frontend: Vercel
* Backend: Render

---

## 📊 Impact Model

### Assumptions:

* 1000 users/day
* 20% scam-related messages

### Impact:

* ~200 scams detected daily
* ~6 hours saved per day
* Reduced financial fraud risk significantly

---

## 🎯 Use Cases

* Retail investors
* Financial awareness platforms
* Fraud detection systems
* Investment advisory tools

---

## 🎥 Demo Video

(Add your demo link here)

---

## 👩‍💻 Author

Shristi Singh

---

## 📜 License

For educational and hackathon purposes only.
