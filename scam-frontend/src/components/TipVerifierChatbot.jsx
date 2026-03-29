import React, { useState } from "react";
import "./TipVerifierChatbot.css";

function TipVerifierChatbot() {
  const [open, setOpen] = useState(true); // auto open
  const [messages, setMessages] = useState([
    { text: "Hi! Ask me about scam safety tips.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/google/flan-t5-base",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_HF_API_KEY}`, // 🔥 ADD THIS
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: input }),
        }
      );

      const data = await response.json();

      const botReply =
        data?.generated_text || "Sorry, I couldn't understand.";

      setMessages((prev) => [
        ...prev,
        { text: botReply, sender: "bot" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to API.", sender: "bot" },
      ]);
    }

    setInput("");
  };

  return (
    <div className="chatbot-container">
      {open && (
        <div className="chatbox">
          <div className="chat-header" onClick={() => setOpen(false)}>
            Tip Verifier ✨
          </div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {!open && (
        <button className="chat-toggle" onClick={() => setOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
}

export default TipVerifierChatbot;