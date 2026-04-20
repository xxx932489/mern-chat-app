// frontend/src/Chat.jsx
import "./Chat.css";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

// 🌐 UPDATED: Pointing to the live Render URL
const socket = io("https://mern-chat-backend-8wf3.onrender.com");

function Chat({ username, setIsLoggedIn }) {
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  
  // STATES & REFS
  const [typingUser, setTypingUser] = useState(""); 
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  useEffect(() => {
    if (showChat) {
      const fetchHistory = async () => {
        try {
          // 🌐 UPDATED: Pointing to the live Render URL
          const response = await axios.get(`https://mern-chat-backend-8wf3.onrender.com/api/messages/${room}`);
          setMessageList(response.data);
        } catch (error) {
          console.error("Failed to fetch history:", error);
        }
      };
      fetchHistory();
    }
  }, [showChat, room]);

  useEffect(() => {
    const handleReceive = (savedMessage) => {
      setMessageList((prevList) => [...prevList, savedMessage]);
    };
    
    // Typing Event Listeners
    const handleTyping = (user) => setTypingUser(user);
    const handleStopTyping = () => setTypingUser("");

    socket.on("receive_message", handleReceive);
    socket.on("user_typing", handleTyping);
    socket.on("user_stopped_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("user_typing", handleTyping);
      socket.off("user_stopped_typing", handleStopTyping);
    };
  }, []);

  // Scroll to bottom automatically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, typingUser]);

  // Handle Typing Logic
  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
    
    socket.emit("typing", { room, author: username });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", room);
    }, 1500);
  };

  const sendMessage = () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room, 
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      socket.emit("send_message", messageData);
      socket.emit("stop_typing", room); // Stop typing immediately on send
      setCurrentMessage("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_username");
    setIsLoggedIn(false);
  };

  return (
    <div className="app-container" style={{ background: "transparent" }}>
      {!showChat ? (
        <div className="auth-box">
          <h2>Join a Room</h2>
          <p style={{ marginBottom: "15px", color: "#555" }}>
            Logged in as: <strong>{username}</strong>
          </p>
          <input
            type="text"
            placeholder="Room ID (e.g., coding, gaming)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button onClick={joinRoom} style={{ flex: 1 }}>Join</button>
            <button onClick={handleLogout} style={{ flex: 1, background: "#d9534f" }}>Logout</button>
          </div>
        </div>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <h2>Room: {room}</h2>
            <div className="header-info">
              <p>User: <strong>{username}</strong></p>
              <div>
                <button onClick={() => setShowChat(false)} className="logout-btn" style={{ background: "#f0ad4e", marginRight: "5px" }}>Leave</button>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </div>
          </div>
          
          <div className="chat-body">
            {messageList.map((msg) => {
              const isMe = username === msg.author;
              return (
                <div key={msg._id || Math.random()} className={`message ${isMe ? "me" : "other"}`}>
                  <div className="message-content">
                    <p className="text">{msg.message}</p>
                    <div className="meta">
                      <span className="author">{isMe ? "You" : msg.author}</span>
                      <span className="time">{msg.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {typingUser && (
              <div className="message other">
                <div className="message-content typing-indicator">
                  <p><em>{typingUser} is typing...</em></p>
                </div>
              </div>
            )}
            
            {/* Auto-scroll target */}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <input
              type="text"
              value={currentMessage}
              placeholder="Type a message..."
              onChange={handleMessageChange} 
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;