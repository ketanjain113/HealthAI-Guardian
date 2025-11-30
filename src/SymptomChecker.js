import React, { useState, useEffect, useRef } from "react";
import "./SymptomChecker.css";
import RobotImg from "./assets/robot.png";

// Enhanced 3D Robot Avatar with float and glow effects
const ChatbotAvatar = ({ image }) => {
  return (
    <div className="avatar-3d-robot" aria-hidden="false" role="img" aria-label="Doctor chatbot avatar">
      <div className="robot-3d-wrapper">
        <img src={RobotImg} alt="Health AI Robot" className="robot-avatar-img" />
        <div className="robot-avatar-glow" />
      </div>

      {/* small image card the robot can show */}
      {image && (
        <div className="robot-image-frame" aria-hidden>
          <img src={image} alt="preview" />
        </div>
      )}

      <div className="doctor-badge">Dr. Health</div>
    </div>
  );
};

export default function SymptomChecker() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I am your AI health assistant. Describe your symptoms and I’ll help you understand possible causes.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const avatarRef = useRef(null);

  // avatar tilt: set CSS vars --rx and --ry on avatarRef
  const handleAvatarMove = (e) => {
    const el = avatarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // small sensitivity
    const ry = (dx / rect.width) * 12; // rotateY
    const rx = (-dy / rect.height) * 8; // rotateX
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
  };

  const handleAvatarLeave = () => {
    const el = avatarRef.current;
    if (!el) return;
    el.style.setProperty('--rx', `0deg`);
    el.style.setProperty('--ry', `0deg`);
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponses = [
        `I understand you're experiencing: "${input}". Based on your symptoms, here are some possible causes:\n\n• Common cold or flu\n• Allergies\n• Stress-related symptoms\n\nPlease consider consulting a healthcare professional for accurate diagnosis.`,
        `Your symptoms of "${input}" may indicate:\n\n• Dehydration\n• Fatigue\n• Environmental factors\n\nI recommend staying hydrated and getting adequate rest. If symptoms persist, please visit a doctor.`,
        `Analyzing "${input}"... This could be related to:\n\n• Nutritional deficiency\n• Sleep deprivation\n• Viral or bacterial infection\n\nMonitor your symptoms and seek medical attention if they worsen.`,
      ];

      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: randomResponse,
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image upload state & handlers
  const [uploadedImage, setUploadedImage] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage({ name: file.name, data: reader.result });
    };
    reader.readAsDataURL(file);
    // clear input value to allow re-upload of same file
    e.target.value = null;
  };

  const handleAnalyzeImage = () => {
    if (!uploadedImage) return;
    // Add user message with image
    setMessages((prev) => [...prev, { sender: "user", text: uploadedImage.name, image: uploadedImage.data }]);
    setUploadedImage(null);
    setIsLoading(true);

    // Simulate analysis result
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `I analyzed the uploaded image ("${uploadedImage.name}") — possible observations: slight redness, discoloration in the area, and patterns that may indicate an infection or inflammation. This is only a rough check; please consult a medical professional for confirmation.`,
        },
      ]);
      setIsLoading(false);
    }, 2200);
  };

  return (
    <div className="symptom-page">
      <h1 className="symptom-title">Symptom Checker</h1>
      <p className="symptom-subtitle">
        Describe your symptoms and receive AI-powered health insights.
      </p>

      <div className="symptom-main-container">
        {/* Chatbot Avatar Section */}
        <div className="chatbot-section">
          <div className="phone-frame" ref={avatarRef} onMouseMove={handleAvatarMove} onMouseLeave={handleAvatarLeave}>
            <div className="avatar-3d">
              <div className="robot-wrap">
                <ChatbotAvatar image={uploadedImage && uploadedImage.data} />
              </div>
            </div>
          </div>
          <div className="feature-badges">
            <div className="badge">🎯 AI Powered</div>
            <div className="badge">⚡ Fast</div>
            <div className="badge">🔒 Secure</div>
          </div>
        </div>

        {/* Floating card (info) */}
          {/* quick tips removed per request */}

        {/* Chat Section */}
        <div className="chatbox-section">
          <div className="symptom-chat-container">
            <div className="symptom-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`symptom-message ${
                    msg.sender === "user" ? "user-msg" : "bot-msg"
                  }`}
                >
                    {msg.image && (
                      <img src={msg.image} alt="uploaded" className="msg-image" />
                    )}
                    <div>{msg.text}</div>
                    {msg.image && <div className="message-meta">Uploaded image: {msg.text}</div>}
                </div>
              ))}
              {isLoading && (
                <div className="symptom-message bot-msg">
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#00cfe8",
                        animation: "bounce 1.4s infinite",
                        animationDelay: "0s",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#00cfe8",
                        animation: "bounce 1.4s infinite",
                        animationDelay: "0.2s",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#00cfe8",
                        animation: "bounce 1.4s infinite",
                        animationDelay: "0.4s",
                      }}
                    ></div>
                  </div>
                  <style>{`
                    @keyframes bounce {
                      0%, 60%, 100% { transform: translateY(0); }
                      30% { transform: translateY(-10px); }
                    }
                  `}</style>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="symptom-input-row">
              <div className="upload-area">
                <label className="upload-btn">
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
                </label>
                {uploadedImage && (
                  <div className="upload-preview">
                    <img src={uploadedImage.data} alt="preview" />
                    <button className="qa-btn" onClick={handleAnalyzeImage}>Analyze Image</button>
                    <button className="qa-btn" onClick={() => setUploadedImage(null)} style={{background:'#e6f7f9', color:'#007a85'}}>Remove</button>
                  </div>
                )}
              </div>
              <input
                type="text"
                className="symptom-input"
                placeholder="Describe your symptoms..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="symptom-send-btn"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
