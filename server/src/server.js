require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const PORT = process.env.PORT || 3000;

const connectDB = require("./config/db");

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);



io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);

    console.log(`${socket.id} joined room ${roomCode}`);
    console.log("Current rooms:", [...socket.rooms]);
  });

  socket.on("leave-room", (roomCode) => {
    socket.leave(roomCode);

    console.log(`${socket.id} left room ${roomCode}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
