import "./App.css";
import { useState, useEffect } from "react";
import Auth from "./Auth";
import Chat from "./Chat";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

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
    <div className="app-container">
      {/* Conditional Rendering: If logged in, show Chat. If not, show Auth. */}
      {isLoggedIn ? (
        <Chat username={username} setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <Auth setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />
      )}
    </div>
  );
}

export default App;