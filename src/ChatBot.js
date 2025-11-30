import React, { useState, useRef, useEffect } from "react";
import "./ChatBot.css";
import RobotImg from "./assets/robot.png"; // Place the provided robot image at src/assets/robot.png

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your HealthAI assistant. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { role: "user", text: input.trim() }, { role: "bot", text: "Got it! I will process that." }]);
    setInput("");
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
