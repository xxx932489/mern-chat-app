// backend/server.js
require("dotenv").config(); 
const express = require("express");
const http = require("http"); 
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken"); 
const Message = require("./models/Message"); 
const User = require("./models/User"); 

const app = express();
app.use(cors());
app.use(express.json()); 

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.log("Database Error: ", err));

// ==========================================
// 🔐 AUTHENTICATION APIs
// ==========================================

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error during registration." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect password." });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET
    );
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Server error during login." });
  }
});

// ==========================================
// 💬 CHAT & REAL-TIME APIs
// ==========================================

app.get("/api/messages/:room", async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room }).sort({ createdAt: 1 }); 
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to load history" });
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ID: ${socket.id} joined room: ${room}`);
  });

  // NEW: Typing Indicators
  socket.on("typing", (data) => {
    socket.to(data.room).emit("user_typing", data.author);
  });

  socket.on("stop_typing", (room) => {
    socket.to(room).emit("user_stopped_typing");
  });

  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message({
        room: data.room, 
        author: data.author,
        message: data.message,
        time: data.time,
      });
      await newMessage.save();
      
      io.to(data.room).emit("receive_message", newMessage);
    } catch (error) {
      console.log("Error handling message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});