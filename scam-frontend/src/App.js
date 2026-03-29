
import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("text");
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("scanHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save to localStorage history
  const saveToHistory = useCallback((content, risk) => {
    const newEntry = { content, risk, date: new Date().toLocaleString() };
    setHistory((prevHistory) => {
      const updatedHistory = [newEntry, ...prevHistory].slice(0, 5); // Keep last 5
      localStorage.setItem("scanHistory", JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  // Clear previous results when input changes
  const handleTextChange = useCallback((e) => {
    setText(e.target.value);
    setResult(null);
    setError(null);
  }, []);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return;
      }
      setImage(file);
      setResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const clearImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Text Analysis
  const handleTextAnalyze = useCallback(async () => {
    if (!text.trim()) {
      setError("Please enter text to analyze");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const API = "http://localhost:5000/api";
      const response = await axios.post(
        `${API}/analyze-text`,
        { text: text.trim() },
        { timeout: 30000 }
      );
      setResult(response.data);
      saveToHistory(text.trim(), response.data.risk);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to analyze text. Please try again."
      );
      console.error("Text analysis error:", err);
    } finally {
      setLoading(false);
    }
  }, [text, saveToHistory]);

  // Image Analysis
  const handleImageAnalyze = useCallback(async () => {
    if (!image) {
      setError("Please select an image to analyze");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const API = "http://localhost:5000/api";
      const response = await axios.post(`${API}/analyze-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      setResult(response.data);
      saveToHistory(response.data.extractedText || "Image Analysis", response.data.risk);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to analyze image. Please try again."
      );
      console.error("Image analysis error:", err);
    } finally {
      setLoading(false);
    }
  }, [image, saveToHistory]);

  // Risk helpers
  const getRiskClass = useCallback((risk) => {
    const riskClasses = {
      HIGH: "risk-high",
      MEDIUM: "risk-medium",
      LOW: "risk-low",
    };
    return riskClasses[risk] || "risk-low";
  }, []);

  const getRiskIcon = useCallback((risk) => {
    const icons = { HIGH: "🔴", MEDIUM: "🟡", LOW: "🟢" };
    return icons[risk] || "🟢";
  }, []);

  const getScorePercentage = useCallback((score) => {
    return Math.min(Math.max(score * 20, 0), 100);
  }, []);

  const getConfidenceColor = useCallback((confidence) => {
    if (!confidence) return "confidence-unknown";
    if (confidence >= 0.8) return "confidence-high";
    if (confidence >= 0.5) return "confidence-medium";
    return "confidence-low";
  }, []);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>
            <span className="icon">🛡️</span> Scam Detector
          </h1>
          <p className="subtitle">
            AI-powered analysis to detect scams in messages and images
          </p>
        </header>

        <div className="main-card">
          {/* Tabs */}
          <div className="tabs" role="tablist">
            <button
              className={`tab ${activeTab === "text" ? "active" : ""}`}
              onClick={() => setActiveTab("text")}
              role="tab"
              aria-selected={activeTab === "text"}
              disabled={loading}
            >
              📝 Text Analysis
            </button>
            <button
              className={`tab ${activeTab === "image" ? "active" : ""}`}
              onClick={() => setActiveTab("image")}
              role="tab"
              aria-selected={activeTab === "image"}
              disabled={loading}
            >
              🖼️ Image Analysis
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              {error}
              <button
                className="error-close"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Text Section */}
          {activeTab === "text" && (
            <div className="section">
              <label htmlFor="text-input" className="section-label">
                Enter suspicious message
              </label>
              <textarea
                id="text-input"
                className="text-input"
                placeholder="Paste the message you want to analyze..."
                value={text}
                onChange={handleTextChange}
                rows={6}
                disabled={loading}
              />
              <button
                className="analyze-button"
                onClick={handleTextAnalyze}
                disabled={loading || !text.trim()}
              >
                {loading ? "Analyzing..." : "Analyze Text"}
              </button>
            </div>
          )}

          {/* Image Section */}
          {activeTab === "image" && (
            <div className="section">
              <label className="section-label">Upload image for analysis</label>
              <div className="image-upload-area">
                {!imagePreview ? (
                  <div className="upload-placeholder">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="file-input"
                      id="image-input"
                      disabled={loading}
                    />
                    <label htmlFor="image-input" className="upload-label">
                      <span className="upload-icon">📸</span>
                      <span>Click or drag to upload</span>
                      <span className="upload-hint">PNG, JPG, JPEG up to 5MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button
                      className="clear-image"
                      onClick={clearImage}
                      disabled={loading}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <button
                className="analyze-button"
                onClick={handleImageAnalyze}
                disabled={loading || !image}
              >
                {loading ? "Analyzing..." : "Analyze Image"}
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading-container">
              <div className="spinner" aria-label="Loading" />
              <p>Analyzing content...</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="results-container">
              <h2 className="results-title">Analysis Results</h2>

              {result.extractedText && (
                <div className="result-section">
                  <h3 className="section-title">Extracted Text</h3>
                  <textarea
                    className="extracted-text"
                    value={result.extractedText}
                    onChange={(e) =>
                      setResult((prev) => ({ ...prev, extractedText: e.target.value }))
                    }
                  />
                </div>
              )}

              <div className="result-section">
                <h3 className="section-title">Risk Assessment</h3>
                <div className={`risk-badge ${getRiskClass(result.risk)}`}>
                  <span className="risk-icon">{getRiskIcon(result.risk)}</span>
                  <span className="risk-text">{result.risk} RISK</span>
                </div>

                {result.confidence && (
                  <div className="confidence-score">
                    <span className="confidence-label">Confidence:</span>
                    <span className={`confidence-value ${getConfidenceColor(result.confidence)}`}>
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                )}

                <div className="score-section">
                  <div className="score-header">
                    <span>Scam Likelihood Score</span>
                    <span className="score-value">{result.score}/5</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar ${getRiskClass(result.risk)}`}
                      style={{ width: `${getScorePercentage(result.score)}%` }}
                      role="progressbar"
                      aria-valuenow={getScorePercentage(result.score)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              </div>

              {result.reasons && (
                <div className="result-section">
                  <h3 className="section-title">Detection Reasons</h3>
                  <ul className="reasons-list">
                    {result.reasons.map((reason, i) => (
                      <li key={i} className="reason-item">
                        <span className="reason-bullet">⚠️</span> {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestion && (
                <div className="result-section suggestion-section">
                  <h3 className="section-title">Recommendation</h3>
                  <p className="suggestion-text">{result.suggestion}</p>
                </div>
              )}

              <div className="disclaimer">
                <span className="disclaimer-icon">ℹ️</span>
                This is an AI-powered analysis and should not be considered as
                definitive proof. Always verify independently.
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="history-section">
              <h3>Recent Scans</h3>
              <ul className="history-list">
                {history.map((h, i) => (
                  <li key={i}>
                    <strong>{h.risk}</strong> | {h.content.substring(0, 50)}... |{" "}
                    <em>{h.date}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Powered by Advanced AI Models | Protecting users from digital scams</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
// import TipVerifierChatbot from "./components/TipVerifierChatbot";
// import React, { useState, useCallback, useRef, useEffect } from "react";
// import axios from "axios";
// import "./App.css";

// function App() {
//   // ✅ ALL your states and functions here
//   const [text, setText] = useState("");

//   // (keep all your existing logic here...)

//   // ✅ ONLY ONE return inside function
//   return (
//     <div className="app">
//       <div className="container">
//         <h1>Scam Detector</h1>

//         {/* your UI */}
//       </div>

//       {/* ✅ chatbot OUTSIDE container but INSIDE App */}
//       <TipVerifierChatbot />
//     </div>
//   );
// }

// // ✅ export AFTER function ends
// export default App;