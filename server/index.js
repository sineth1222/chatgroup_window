require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const uploadRoute = require("./routes/uploadRoute");
const Message = require("./models/Message");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/", uploadRoute);

app.get("/", (req, res) => {
  res.send("K&D Group Chat Server is Running!");
});

const server = http.createServer(app);
/*const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }
});*/
const io = new Server(server, {
  cors: { 
    origin: "*", // දැනට සියලුම origins වලට ඉඩ දෙන්න
    methods: ["GET", "POST"]
  }
});

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB Connected"));

io.on("connection", async (socket) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  socket.emit("load_messages", messages);

  socket.on("send_message", async (data) => {
    const newMessage = new Message(data);
    await newMessage.save();
    io.emit("receive_message", data);
  });
});

server.listen(process.env.PORT, () => console.log("Server on 3001"));