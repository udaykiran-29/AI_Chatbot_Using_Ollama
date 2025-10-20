import React from "react";
import "../styles/MessageBubble.css";

const MessageBubble = ({ message, sender, isTyping }) => (
  <div className={`message-wrapper ${sender}`}>
    {sender === "bot" && (
      <span
        className="bot-icon material-symbols-outlined"
        style={{ color: "#6D4C41" }}
      >
        support_agent
      </span>
    )}
    <div className={`message-bubble ${sender}`}>
      <span className={`message-text ${sender}`}>
        {isTyping ? <i>Typing...</i> : message}
      </span>
    </div>
  </div>
);

export default MessageBubble;
