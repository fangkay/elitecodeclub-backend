const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const gameRouter = require("./routes/game");
const userRouter = require("./routes/user");
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://main--bidbybid.netlify.app", "https://admin.socket.io/"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
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
app.use("/user", userRouter);

server.listen(port, () => {
  console.log("Server is running");
});
