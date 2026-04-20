import "./Auth.css";
import { useState } from "react";
import axios from "axios";

function Auth({ setIsLoggedIn, setUsername }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError(""); // Clear old errors

    const endpoint = isLoginMode ? "/api/login" : "/api/register";

    try {
      const response = await axios.post(`http://localhost:3001${endpoint}`, {
        username: inputUsername,
        password: inputPassword,
      });

      if (isLoginMode) {
        // LOGIN SUCCESS: Save the token and username to the browser
        localStorage.setItem("chat_token", response.data.token);
        localStorage.setItem("chat_username", response.data.username);
        
        // Tell App.jsx that we are officially logged in
        setUsername(response.data.username);
        setIsLoggedIn(true);
      } else {
        // REGISTER SUCCESS: Switch to login mode so they can log in
        alert("Account created successfully! Please log in.");
        setIsLoginMode(true);
        setInputPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLoginMode ? "Welcome Back" : "Create an Account"}</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
          <button type="submit">{isLoginMode ? "Login" : "Register"}</button>
        </form>

        <p className="toggle-text" onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode 
            ? "Don't have an account? Register here." 
            : "Already have an account? Login here."}
        </p>
      </div>
    </div>
  );
}

export default Auth;