const { Router } = require("express");
const userRouter = new Router();
const Player = require("../models").player;

userRouter.post("/create", async (request, response, next) => {
  try {
    const { username, gameId } = request.body;
    const createPlayer = await Player.create({
      username,
      gameId,
    });
    request.io.to(parseInt(gameId)).emit("new-player", createPlayer);
    response.send(createPlayer);
    // socket.emit.toRoom new-player
  } catch (e) {
    console.log(e.message);
    next();
  }
});

module.exports = userRouter;
