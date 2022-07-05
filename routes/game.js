const { Router } = require("express");
const gameRouter = new Router();
const Player = require("../models").player;
const Game = require("../models").game;
const Deck = require("../models").deck;
const Money = require("../models").money;
const Score = require("../models").score;
const {
  initialMoney,
  initialScore,
  initalDeck,
} = require("../config/constants");

gameRouter.get("/", async (request, response, next) => {
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

gameRouter.post("/message", (request, response, next) => {
  const { message, roomId } = request.body;
  request.io.to(parseInt(roomId)).emit("some_message", { message });
  console.log("do i have request.io", request.io);
  console.log("message sent", roomId, message);
  response.send("sent");
});

gameRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const getGameById = await Game.findByPk(id, {
      include: [Player, Deck],
    });
    // const state = await buildGameState(req.params.id);

    res.status(200).send(getGameById);
  } catch (e) {
    console.log(e.message);
    next(e);
  }
});

gameRouter.post("/start", async (req, res, next) => {
  try {
    // gameId
    const { gameId } = req.body;

    const players = await Player.findAll({
      where: { gameId },
    });

    // 1. Generate all money rows per player - get all players in game
    const moneyPromises = players.map(
      async (p) =>
        await Money.create({
          ...initialMoney,
          playerId: p.id,
        })
    );

    await Promise.all(moneyPromises);

    // 2. Generate all score rows per player
    const scorePromises = players.map(
      async (p) =>
        await Score.create({
          ...initialScore,
          playerId: p.id,
        })
    );

    await Promise.all(scorePromises);

    // 3. Generate a clean deck for this gameId
    const deck = await Deck.create({
      ...initalDeck,
      gameId,
    });

    // 4. build game state
    const gameState = await buildGameState(gameId);

    console.log(moneyPromises, scorePromises, deck);

    req.io.to(parseInt(gameId)).emit("gamestate", gameState);

    res.send({
      message: "Data sent through socket",
      gameState,
    });
  } catch (e) {
    next(e);
  }
});

const buildGameState = async (gameId) => {
  try {
    console.log("--------- new game ------------");
    const game = await Game.findByPk(gameId, {
      include: [{ model: Player, include: [Score, Money] }],
    });

    const formattedPlayers = game.players.reduce((acc, p) => {
      return { ...acc, [p.id]: p };
    }, {});

    const deck = await Deck.findOne({ where: { gameId } });

    const gameState = {
      name: game.name,
      players: formattedPlayers,
      deck,
    };

    return gameState;
  } catch (e) {
    console.log("some error building state", e.message);
  }
};

module.exports = gameRouter;
