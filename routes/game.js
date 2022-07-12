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
  initialDeck,
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

gameRouter.get("/deck", async (req, res, next) => {
  const deck = await Game.findByPk(7, {
    include: [{ model: Player, include: [Score, Money] }],
  });

  console.log("is this plain???", deck.get({ plain: true }).players[0].money);
  res.send(deck);
});

gameRouter.post("", async (request, response, next) => {
  try {
    const { name } = request.body;
    const createGame = await Game.create({
      name,
    });
    const fullGame = { ...createGame.dataValues, players: [] };
    response.send(fullGame);
  } catch (e) {
    console.log(e.message);
    next(e);
  }
});

gameRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const getGameById = await Game.findByPk(id, {
      include: [Player],
    });

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
      ...initialDeck,
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
    console.log(e.message);
    next(e);
  }
});

const buildGameState = async (gameId, currentTurns, pass) => {
  try {
    console.log("--------- new game ------------");
    const sequelizeGame = await Game.findByPk(gameId, {
      include: [{ model: Player, include: [Score, Money] }],
    });

    const game = sequelizeGame.get({ plain: true });

    const formattedPlayers2 = game.players.reduce((acc, p) => {
      return {
        ...acc,
        [p.username]: {
          ...p,
          money: Object.keys(p.money).filter(
            (m) => p.money[m] && m !== "id" && m !== "playerId"
          ), // money: [10, 40, 100]
          score: Object.keys(p.score).filter(
            (m) => p.score[m] && m !== "id" && m !== "playerId"
          ), // money: [10, 40, 100]
        },
      };
    }, {});

    console.log("NEW GAMESTATE VERSION!", formattedPlayers2["p2"].money);

    const formattedPlayers = game.players.reduce((acc, p) => {
      return { ...acc, [p.username]: p }; // { money: { 10: true, }, score: { 1: false, 2: true }}
    }, {}); // { money: [10, 40, 100], score: [4] }

    const bidsPerPlayer = game.players.reduce((acc, p) => {
      return { ...acc, [p.username]: [] };
    }, {});

    // ---- get players, shuffle them and build new turns ---- //
    const players = game.players;
    const turnArray = players.map((p) => ({
      username: p.username,
      passed: false,
    }));

    const turns = [...turnArray].sort((a, b) => Math.random() - 0.5);

    // Pick next VALID card from deck
    const deck = await Deck.findOne({ where: { gameId }, raw: true });
    const cardTypes = Object.keys(deck);
    const validCards = cardTypes.filter((t) => deck[t] && t !== "id");

    const randomCard =
      validCards[Math.floor(Math.random() * validCards.length)];

    const gameState = {
      gameId,
      name: game.name,
      players: formattedPlayers2,
      bids: bidsPerPlayer,
      deck,
      turns: turns,
      currentCard: randomCard, // currentCard
    };

    console.log("in build function", gameState);

    return gameState;
  } catch (e) {
    console.log("some error building state", e.message);
  }
};

gameRouter.patch("/bid", async (request, response, next) => {
  try {
    const { bidState } = request.body;
    console.log("what is in the bidState?", bidState);

    // I get:
    /*
    {
      bids: {
        'username1': [10, 100, 200],
        'username2': [50, 100, 200],
        'username3': [],
      },
      currentCard: '8',
      turns: [{ username: 'username1', passed: false }, { username: 'username1', passed: false }, { username: 'username1', passed: false }],
      activeTurn: {
        username: 'username2',
        passed: false,
      }
    }
    */

    // ---- shift and update passed -------------- //
    const currentTurns = bidState.turns; // [{username: "name", passed: false}, {username: "name", passed: false}, ...]

    const activeTurn = bidState.activeTurn; // {passed: true, username: "name", }

    const currentPlayer = currentTurns.shift(); // Gets the first object of the currentTurns array

    const updated = { ...currentPlayer, passed: activeTurn.passed }; // Set first player passed value to 'true'

    const updatedTurns = [...currentTurns, updated]; // Return new array with the updated passed value
    // ------------------------------------------------ //

    const turnsCheck = [...updatedTurns];
    const nextPlayer = turnsCheck.shift();

    // end of round condition: TO-DO, NOT FINISHED
    const gameId = bidState.gameId;
    if (!nextPlayer.passed && turnsCheck.every((p) => p.passed)) {
      // next player hasn't passed, all the rest did => round finished, he gets the card.
      // request.io.to(roomId).send("new-round", {})

      // 1. remove card from the deck.
      const currentCard = bidState.currentCard;

      const disableCard = await Deck.update(
        {
          [currentCard]: false,
        },
        { where: { gameId } }
      );

      // ----- CARD REMOVED ------ //

      // ----  2. take money away from player ---- //

      // who is he
      const winnerName = nextPlayer.username;

      const winner = await Player.findOne({
        where: {
          username: winnerName,
          gameId,
        },
      });
      const winnerId = winner.id;

      console.log("what playerId is this?", winnerId);

      const winnerMoney = await Money.findOne({
        where: { playerId: winnerId },
      });

      const winnerBid = bidState.bids[winnerName]; // [10, 200]

      console.log("what is playerBid", winnerBid);

      const valuesToUpdate = winnerBid.reduce(
        (acc, m) => ({ ...acc, [m]: false }), // { 10: false, 200: false }
        {}
      );

      const updatePlayerMoney = await winnerMoney.update(valuesToUpdate);

      console.log("what is this players Money?", updatePlayerMoney);

      // ----  Money removed ---- //

      // 3. give card to player (score table)
      const addCardToPlayer = await Score.update(
        {
          [currentCard]: true,
        },
        {
          where: { playerId: winnerId },
        }
      );

      // 5. build new game state and start again
      const nextRoundState = await buildGameState(gameId);
      request.io.to(parseInt(gameId)).emit("gamestate", nextRoundState);
    } else {
      const toUpdate = {
        bids: bidState.bids,
        turns: updatedTurns,
      };

      request.io.to(parseInt(gameId)).emit("new-bid", toUpdate);
    }

    response.send("bid accepted");
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = gameRouter;
