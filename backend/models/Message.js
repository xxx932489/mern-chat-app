const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true }, // NEW: Every message needs a room
    author: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Message", MessageSchema);