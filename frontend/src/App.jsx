// frontend/src/App.jsx
import "./App.css";
import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Chat from "./Chat";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  
  // NEW: State to track which auth screen to show
  const [showLogin, setShowLogin] = useState(true); 

  // When the app loads, check if the user already has a token saved in their browser
  useEffect(() => {
    const token = localStorage.getItem("chat_token");
    const savedUsername = localStorage.getItem("chat_username");

    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  return (
    <> 
      {/* 1. If logged in, show the Chat room */}
      {isLoggedIn ? (
        <Chat username={username} setIsLoggedIn={setIsLoggedIn} />
      ) : (
        /* 2. If NOT logged in, check which Auth page to show */
        showLogin ? (
          <Login 
            setIsLoggedIn={setIsLoggedIn} 
            setUsername={setUsername} 
            showRegisterPage={() => setShowLogin(false)} 
          />
        ) : (
          <Register 
            showLoginPage={() => setShowLogin(true)} 
          />
        )
      )}
    </>
  );
}

export default App;