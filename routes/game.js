const { Router } = require("express");
const gameRouter = new Router();
const Player = require("../models").player;
const Game = require("../models").game;

gameRouter.get("", async (request, response, next) => {
  try {
    const getGames = await Game.findAll({ include: Player });
    response.status(200).send(getGames);
  } catch (e) {
    console.log(e.message);
    next(e);
  }
});

gameRouter.post("", async (request, response, next) => {
  try {
    const { name } = request.body;
    const createGame = await Game.create({
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
