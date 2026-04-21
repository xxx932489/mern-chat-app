// frontend/src/App.jsx
import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Chat from "./Chat";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showLogin, setShowLogin] = useState(true);

  // When the app loads, check local storage
  useEffect(() => {
    const token = localStorage.getItem("chat_token");
    const savedUsername = localStorage.getItem("chat_username");

    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  // --- 100% TERNARY-FREE LOGIC ---

  // Condition 1: If logged in, show the chat room and stop.
  if (isLoggedIn) {
    return <Chat username={username} setIsLoggedIn={setIsLoggedIn} />;
  }

  // Condition 2: If NOT logged in, but they want to see the Login page.
  if (showLogin) {
    return (
      <Login
        setIsLoggedIn={setIsLoggedIn}
        setUsername={setUsername}
        showRegisterPage={() => setShowLogin(false)}
      />
    );
  }

  // Condition 3: If not logged in and not on the login page, 
  // show the Register page!
  return (
    <Register 
      showLoginPage={() => setShowLogin(true)} 
    />
  );
}

export default App;