// import React from "react";
// import { FaComments } from "react-icons/fa";
// import "../styles/ChatPopup.css";

// const ChatIcon = ({ onClick }) => (
//   <div className="chat-icon" onClick={onClick}>
//     <FaComments size={24} />
//   </div>
// );

// export default ChatIcon;
import React from "react";
// 1. Import the new icon from the 'react-icons/bs' library
import { BsFillChatFill } from "react-icons/bs";
import "../styles/ChatPopup.css";

const ChatIcon = ({ onClick }) => (
  <div className="chat-icon" onClick={onClick}>
    {/* 2. Replace the old FaComments icon with the new one */}
    <BsFillChatFill size={24} />
  </div>
);

export default ChatIcon;