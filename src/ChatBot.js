import React, { useState, useRef, useEffect } from "react";
import "./ChatBot.css";
import RobotImg from "./assets/robot.png";
import { config } from './config';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your HealthAI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setMessages(m => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/ai/symptom-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom: userMessage })
      });

      const data = await response.json();
      setMessages(m => [...m, { role: "bot", text: data.reply || "I couldn't process that. Please try again." }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(m => [...m, { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-root" aria-live="polite">
      {/* Floating Robot Button */}
      <button
        className={`chatbot-fab ${open ? "hide" : ""}`}
        title="Chat with HealthAI"
        onClick={() => setOpen(true)}
      >
        <div className="robot-3d">
          <img src={RobotImg} alt="Chatbot" className="robot-img" />
          <div className="robot-glow" />
        </div>
      </button>

      {/* Chat Panel */}
      <div className={`chatbot-panel ${open ? "open" : ""}`}
           role="dialog" aria-modal="true" aria-label="HealthAI Chat">
        <div className="chat-header">
          <div className="chat-title">HealthAI Assistant</div>
          <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>{m.text}</div>
          ))}
          {loading && <div className="msg bot">Thinking...</div>}
        </div>
        <div className="chat-input-row">
          <input
            ref={panelRef}
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" ? sendMessage() : null}
          />
          <button className="chat-send" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
