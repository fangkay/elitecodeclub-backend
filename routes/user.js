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
  } catch (e) {
    console.log(e.message);
    next();
  }
});

module.exports = userRouter;
