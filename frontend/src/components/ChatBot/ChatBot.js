// ✅ Modern chatbot UI with Handicraft color scheme
import React, { useState, useRef, useEffect } from "react";
import { sendMessageToBot } from "../../api/chatApi";

const ChatBotComponent = () => {
  const [messages, setMessages] = useState([
    {
      text: "👋 Hi! I'm your Handcraft Assistant! I can help you with promotions, discounts, feedback, and complaints. How can I assist you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const botReply = await sendMessageToBot(inputValue);
      
      const botMessage = {
        text: botReply,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: "Sorry, I'm having trouble connecting. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    "Show discounts",
    "Any promotions?",
    "Customer feedback",
    "Help",
  ];

  const handleQuickReply = (text) => {
    setInputValue(text);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      {/* ✅ Chat Window */}
      {isOpen && (
        <div
          style={{
            width: "380px",
            height: "550px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginBottom: "10px",
            animation: "slideUp 0.3s ease-out",
            border: "2px solid #E8D4C0"
          }}
        >
          {/* ✅ Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #B8764F 0%, #8B4513 100%)",
              padding: "20px",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  background: "linear-gradient(135deg, #fff, #f0f0f0)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
              >
                🎨
              </div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                  Handcraft Bot
                </div>
                <div style={{ fontSize: "12px", opacity: 0.9 }}>
                  <span style={{ 
                    display: "inline-block", 
                    width: "8px", 
                    height: "8px", 
                    background: "#4ade80", 
                    borderRadius: "50%", 
                    marginRight: "6px",
                    animation: "pulse 2s infinite"
                  }}></span>
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "white",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.3)";
                e.target.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
                e.target.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>
          </div>

          {/* ✅ Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              background: "#F5F5F5",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.isBot ? "flex-start" : "flex-end",
                  animation: "fadeIn 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: msg.isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
                    background: msg.isBot
                      ? "white"
                      : "linear-gradient(135deg, #B8764F 0%, #8B4513 100%)",
                    color: msg.isBot ? "#333" : "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    border: msg.isBot ? "1px solid #E8D4C0" : "none"
                  }}
                >
                  {msg.text}
                  <div
                    style={{
                      fontSize: "10px",
                      opacity: 0.6,
                      marginTop: "6px",
                      textAlign: msg.isBot ? "left" : "right",
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* ✅ Loading indicator */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    gap: "6px",
                    border: "1px solid #E8D4C0"
                  }}
                >
                  <span style={{ 
                    width: "8px", 
                    height: "8px", 
                    background: "#B8764F", 
                    borderRadius: "50%",
                    animation: "bounce 1s infinite"
                  }}></span>
                  <span style={{ 
                    width: "8px", 
                    height: "8px", 
                    background: "#B8764F", 
                    borderRadius: "50%",
                    animation: "bounce 1s infinite 0.2s"
                  }}></span>
                  <span style={{ 
                    width: "8px", 
                    height: "8px", 
                    background: "#B8764F", 
                    borderRadius: "50%",
                    animation: "bounce 1s infinite 0.4s"
                  }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ✅ Quick Reply Buttons */}
          {messages.length <= 1 && (
            <div
              style={{
                padding: "12px 20px",
                background: "white",
                borderTop: "1px solid #E8D4C0",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  style={{
                    padding: "8px 14px",
                    background: "#F5DEB3",
                    border: "1px solid #E8D4C0",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#8B4513",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#E8D4C0";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#F5DEB3";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* ✅ Input Area */}
          <div
            style={{
              padding: "16px 20px",
              background: "white",
              borderTop: "1px solid #E8D4C0",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "2px solid #E8D4C0",
                borderRadius: "25px",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#B8764F"}
              onBlur={(e) => e.target.style.borderColor = "#E8D4C0"}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              style={{
                padding: "12px",
                background: inputValue.trim() && !isLoading 
                  ? "linear-gradient(135deg, #B8764F 0%, #8B4513 100%)" 
                  : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                cursor: inputValue.trim() && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                transition: "all 0.2s",
                boxShadow: inputValue.trim() && !isLoading ? "0 4px 12px rgba(184, 118, 79, 0.3)" : "none"
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim() && !isLoading) {
                  e.target.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ✅ Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #B8764F 0%, #8B4513 100%)",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(184, 118, 79, 0.4)",
          transition: "all 0.3s",
          animation: isOpen ? "none" : "float 3s ease-in-out infinite",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 25px rgba(184, 118, 79, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 20px rgba(184, 118, 79, 0.4)";
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* ✅ Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBotComponent;