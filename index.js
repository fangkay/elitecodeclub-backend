const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const gameRouter = require("./routes/game");

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io/"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("join_room", (data) => {
    console.log("data to join", data);
    socket.join(data);

    // IMPORTANT: updating user table with game id

    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });
});

// attach socket
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/game", gameRouter);

server.listen(3001, () => {
  console.log("Server is running");
});
