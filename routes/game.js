const { Router } = require("express");
const gameRouter = new Router();
const Player = require("../models").player;
const Game = require("../models").game;

gameRouter.get("", async (request, response, next) => {
  try {
    // response.send("test");
    const getPlayers = await Player.findAll();
    response.status(200).send(getPlayers);
  } catch (e) {
    console.log(e.message);
    next(e);
  }
});

gameRouter.post("", async (request, response, next) => {
  try {
    const { id, name } = request.body;
    const createGame = await Game.create({
      id,
      name,
      turn: 0,
    });
    response.send(createGame);
  } catch (e) {
    console.log(e.message);
    next(e);
  }
});

module.exports = gameRouter;
