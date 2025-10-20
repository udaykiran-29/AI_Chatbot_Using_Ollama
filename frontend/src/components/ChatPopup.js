import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

import MessageBubble from "./MessageBubble";
import ChatIcon from "./ChatIcon";
import "../styles/ChatPopup.css";
const API_BASE = "http://localhost:5000/api"; 

const ChatPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visibleSuggestions, setVisibleSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    contact: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [awaitingYes, setAwaitingYes] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // --- New states for automation ---
  const [awaitingCredentials, setAwaitingCredentials] = useState(false);
  const [currentIssue, setCurrentIssue] = useState("");

  const botNames = ["Tiya", "Taniya", "Riya", "Tanzy"];
  const [botName, setBotName] = useState("Tanzy");

  const chatBodyRef = useRef(null);
  const popupRef = useRef(null);

  const initialSuggestions = [
    "What are the best things of Nova?",
    "contact Support?",
    "Location",
    "Services",
  ];

  const basicSuggestions = [
    "What are the features of Nova?",
    "How to contact Support?",
    "Where is Nova located?",
    "What services do you offer?",
    "Founders",
  ];

  const casualResponses = ["ok", "okay", "cool", "k", "thanks", "thank you"];

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, visibleSuggestions]);

  // Reset chat when opening
  useEffect(() => {
    if (isOpen) resetChat();
  }, [isOpen]);

  // ✅ Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const resetChat = () => {
    const randomName = botNames[Math.floor(Math.random() * botNames.length)];
    setBotName(randomName);

    setMessages([]);
    setVisibleSuggestions([]);
    setShowSuggestions(false);
    setShowFeedback(false);
    setShowContactForm(false);
    setShowRating(false);
    setAwaitingYes(false);
    setAwaitingCredentials(false);
    setCurrentIssue("");

    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        { text: "Your 24/7 Personal Chat Assistance", sender: "bot" },
        { text: "Ready to Spark Up a Conversation?", sender: "bot" },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: `Hi!! I'm ${randomName}. How can I make your day easier?`,
            sender: "bot",
          },
        ]);
        setIsTyping(false);
      }, 1500);
    }, 500);
  };

const fetchReply = async (message) => {
  setIsTyping(true);
  try {
    let userId = localStorage.getItem("chatUserId");
    if (!userId) {
      userId = "user-" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("chatUserId", userId);
    }
      const API_BASE = process.env.REACT_APP_API_BASE_URL || "";
      const res = await fetch(`${API_BASE}/api/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message }),
    });

    // 🔎 Instead of generic error, log actual response
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    const reply = data?.answer || "Sorry, I didn’t get that.";

    setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);

    if (data?.suggestions?.length) {
      setVisibleSuggestions(data.suggestions);
      setShowSuggestions(true);
    } else {
      setVisibleSuggestions([]);
      setShowSuggestions(false);
      setAwaitingYes(true);
    }
  } catch (err) {
    console.error("Fetch Reply Error:", err);
    setMessages((prev) => [
      ...prev,
      { text: "Oops! Something went wrong.", sender: "bot" },
    ]);
  } finally {
    setIsTyping(false);
  }
};
  const handleSend = (msg = null) => {
    const finalMessage = msg || input.trim();
    if (!finalMessage) return;

    setMessages((prev) => [...prev, { text: finalMessage, sender: "user" }]);
    setShowFeedback(false);
    setShowContactForm(false);

    const lower = finalMessage.toLowerCase();

    // --- Step 1: Detect issue ---
    if (
      lower.includes("login issue") ||
      lower.includes("network issue") ||
      lower.includes("issue")
    ) {
      setCurrentIssue(finalMessage);
      setAwaitingCredentials(true);
      setMessages((prev) => [
        ...prev,
        { text: "Please provide your login credentials (username & password).", sender: "bot" },
      ]);
    }

    // --- Step 2: Awaiting credentials ---
    else if (awaitingCredentials) {
      const templateParams = {
        issue: currentIssue,
        credentials: finalMessage,
      };

      emailjs
        .send(
          "service_uubeddl",    // replace with your EmailJS service ID
          "template_9lpjfen",   // replace with your EmailJS template ID
          templateParams,
          "h07_2kAgof5lX18Eo"     // replace with your EmailJS public key
        )
        .then(
          () => {
            setMessages((prev) => [
              ...prev,
              { text: "Your issue has been reported to the support team. They will contact you soon.", sender: "bot" },
            ]);
          },
          (error) => {
            console.error("EmailJS Error:", error);
            setMessages((prev) => [
              ...prev,
              { text: "Failed to send your issue. Please try again later.", sender: "bot" },
            ]);
          }
        );

      setAwaitingCredentials(false);
      setCurrentIssue("");
    }

    // --- Regular flow (hi, casual, etc.) ---
    else {
      const nameMatch = finalMessage.match(/(?:i am|my name is)\s+([a-zA-Z]+)/i);
      const userName = nameMatch ? nameMatch[1] : null;

      if (awaitingYes && lower === "yes") {
        setMessages((prev) => [
          ...prev,
          { text: "Great! Here are some things you can ask me:", sender: "bot" },
        ]);
        setVisibleSuggestions(basicSuggestions);
        setShowSuggestions(true);
        setAwaitingYes(false);
      } else if (awaitingYes && lower === "no") {
        setMessages((prev) => [
          ...prev,
          { text: "Thank you! Please reach out whenever you need info.", sender: "bot" },
        ]);
        setAwaitingYes(false);
        setTimeout(() => setShowFeedback(true), 1500);
      } else if (casualResponses.includes(lower)) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { text: "You're welcome! Do you need more information?", sender: "bot" },
          ]);
          setAwaitingYes(true);
        }, 500);
      } else if (["hi", "hello", "hey", "hii"].includes(lower) || userName) {
        setIsTyping(true);
        setTimeout(() => {
          if (userName) {
            setMessages((prev) => [
              ...prev,
              { text: `Hey ${userName}! How can I help you today?`, sender: "bot" },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              { text: `Hey! How can I help you today?`, sender: "bot" },
            ]);
          }
          setVisibleSuggestions(basicSuggestions);
          setShowSuggestions(true);
          setIsTyping(false);
        }, 1000);
      } else {
        setShowSuggestions(false);
        setVisibleSuggestions([]);
        setAwaitingYes(false);
        fetchReply(finalMessage);
      }
    }

    if (!msg) setInput("");
  };

  const handleSuggestionClick = (question) => {
    setShowSuggestions(false);
    setVisibleSuggestions([]);
    handleSend(question);
  };

  useEffect(() => {
    if (showSuggestions) {
      setVisibleSuggestions([]);
      const currentSuggestions = awaitingYes ? basicSuggestions : initialSuggestions;
      currentSuggestions.forEach((q, i) => {
        setTimeout(() => {
          setVisibleSuggestions((prev) => [...prev, q]);
        }, i * 800);
      });
    }
  }, [showSuggestions, awaitingYes]);

  const handleFeedback = (response) => {
    setShowFeedback(false);
    if (response === "yes") {
      setMessages((prev) => [...prev, { text: "Thanks!", sender: "bot" }]);
      setTimeout(() => setShowRating(true), 1200);
    } else {
      setShowContactForm(true);
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async () => {
    const newErrors = {};
    if (!contactDetails.name.trim()) newErrors.name = "Name is required.";
    if (!contactDetails.contact.trim())
      newErrors.contact = "Contact number is required.";
    else if (!/^\d{10}$/.test(contactDetails.contact.trim()))
      newErrors.contact = "Please enter a valid 10-digit number.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(`${API_BASE}/api/save-feedback`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactDetails.name.trim(),
          contact: contactDetails.contact.trim(),
          description: contactDetails.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      const templateParams = {
        user_name: contactDetails.name.trim(),
        user_contact: contactDetails.contact.trim(),
        message: contactDetails.message.trim(),
      };

      await emailjs.send(
        "service_eq32whj",
        "template_5ngbwa4",
        templateParams,
        "JerBF4xC8AXSeKsFH"
      );

      setMessages((prev) => [
        ...prev,
        { text: "Thanks for your feedback. We'll reach out soon!", sender: "bot" },
      ]);
      setShowContactForm(false);
      setContactDetails({ name: "", contact: "", message: "" });
      setErrors({});

      setTimeout(() => setShowRating(true), 1500);
    } catch (error) {
      console.error("Contact Submit Error:", error);
    }
  };

  return (
    <div>
      <ChatIcon onClick={() => setIsOpen(!isOpen)} />

      {isOpen && (
        <div className="chat-popup" ref={popupRef}>
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          <div className="chat-header">Step into Nova's World</div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg.text} sender={msg.sender} />
            ))}

            {isTyping && (
              <MessageBubble message="Typing..." sender="bot" isTyping />
            )}

            {visibleSuggestions.length > 0 && (
              <div className="suggestions">
                {visibleSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="suggestion-btn"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {showFeedback && (
              <div className="feedback-section">
                <p className="feedback-question">Was this conversation helpful?</p>
                <button
                  onClick={() => handleFeedback("yes")}
                  className="feedback-btn yes"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleFeedback("no")}
                  className="feedback-btn no"
                >
                  No
                </button>
              </div>
            )}

            {showContactForm && (
              <div className="contact-form">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={contactDetails.name}
                  onChange={handleContactChange}
                />
                {errors.name && <p className="input-error">{errors.name}</p>}

                <input
                  type="tel"
                  name="contact"
                  placeholder="Contact Number"
                  value={contactDetails.contact}
                  onChange={handleContactChange}
                />
                {errors.contact && <p className="input-error">{errors.contact}</p>}

                <textarea
                  name="message"
                  placeholder="Describe your issue..."
                  value={contactDetails.message}
                  onChange={handleContactChange}
                />
                <button onClick={handleContactSubmit}>Submit</button>
              </div>
            )}

            {showRating && (
              <div className="rating-section">
                <p className="feedback-question">
                  Rate me if this conversation was helpful
                </p>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => {
                        setMessages((prev) => [
                          ...prev,
                          { text: `You rated me ${star} ⭐`, sender: "bot" },
                        ]);
                        setShowRating(false);
                      }}
                      style={{
                        cursor: "pointer",
                        fontSize: "20px",
                        margin: "0 5px",
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={() => handleSend()}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
