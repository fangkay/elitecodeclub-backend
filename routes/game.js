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
const score = require("../models/score");

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
    request.io.emit("new-game", fullGame);
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

const buildGameState = async (gameId, winner = null) => {
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

    // console.log("NEW GAMESTATE VERSION!", formattedPlayers2["p2"].money);

    const bidsPerPlayer = game.players.reduce((acc, p) => {
      return { ...acc, [p.username]: [] };
    }, {});

    // ---- get players, shuffle them and build new turns ---- //
    const players = game.players;
    const turnArray = players.map((p) => ({
      username: p.username,
      passed: false,
    }));

    // assuming I know who won lastWinner = 'p1'
    let turns = [...turnArray].sort((a, b) => Math.random() - 0.5);

    if (winner) {
      const filtered = turns.filter((p) => p.username !== winner);
      turns = [{ username: winner, passed: false }, ...filtered];
    }

    // Pick next VALID card from deck
    const deck = await Deck.findOne({ where: { gameId }, raw: true });
    const cardTypes = Object.keys(deck);
    const validCards = cardTypes.filter(
      (t) => deck[t] && t !== "id" && t !== "gameId"
    );

    const randomCard =
      validCards[Math.floor(Math.random() * validCards.length)];

    // IS GAME ENDING??
    if (randomCard === "divide" || randomCard.includes("multiply")) {
      // I have to check if it's the last one

      const cardTypes = Object.keys(deck);
      const alreadyPlayed = cardTypes.filter(
        (t) => (t === "divide" || t.includes("multiply")) && deck[t] === false
      );

      if (alreadyPlayed.length === 3) {
        // GAME END
        const playerScores = calculateScores(formattedPlayers2);
        console.log("what is playerScores?", playerScores);

        const winner = chooseWinner(playerScores);

        const results = {
          playerScores,
          winner,
          status: "finished",
        };

        console.log("end state", results);

        return results;
      }
    }

    const gameState = {
      gameId,
      name: game.name,
      players: formattedPlayers2,
      bids: bidsPerPlayer,
      deck,
      turns: turns,
      currentCard: randomCard,
      status: "playing",
    };

    console.log("in build function", gameState);

    return gameState;
  } catch (e) {
    console.log("some error building state", e.message);
  }
};

const chooseWinner = (playerScores) => {
  // Determine the poorest player
  const allPlayerTotalMoney = playerScores.map((player) => {
    return player.totalMoney;
  });

  const checkLowestMoney = Math.min(...allPlayerTotalMoney);

  const poorestPlayer = playerScores.find(
    (p) => p.totalMoney === checkLowestMoney
  );
  console.log("this is the poorestPlayer", poorestPlayer);

  const sorted = [...playerScores].sort((a, b) => b.endScore - a.endScore);

  console.log("sorted by score", sorted);
  // is [0] the winner?
  const winner =
    poorestPlayer.name !== sorted[0].name ? sorted[0].name : sorted[1].name;

  return winner;
};

const calculateScores = (fullPlayers) => {
  // { "matias": { money: [], score: [] }, fang: { money: [], score: [] }}
  const toFilter = [
    "divide",
    "multiplyFirst",
    "multiplySecond",
    "multiplyThird",
    "minusFive",
    "discardPoints",
  ];

  const names = Object.keys(fullPlayers); // ["matias", "fang"]

  const playerScores = names.map((n) => {
    const money = fullPlayers[n].money;

    const totalMoney = money.reduce((acc, m) => parseInt(acc) + parseInt(m), 0);
    console.log("what is totalMoney?", totalMoney);

    const score = fullPlayers[n].score;
    console.log("what is score?", score);

    // Checking special cards
    // Calculating the amount of multiplyCards
    const getMultiplyCards = score.filter((card) => card.includes("multiply"));
    const multiplyCards = getMultiplyCards.length;
    console.log("how many multiplyCards do I have", multiplyCards);

    // Checking minusFive card
    const hasMinusFive = score.includes("minusFive");

    // Checking divide card
    const hasDivide = score.includes("divide");

    const basicPoints = score
      .filter((s) => !toFilter.includes(s))
      .reduce((acc, s) => parseInt(acc) + parseInt(s), 0); // this works

    // Calculate the total score
    let endScore = basicPoints;
    if (hasMinusFive === true) {
      endScore = endScore - 5;
    }
    if (multiplyCards !== 0) {
      endScore = endScore * (multiplyCards * 2);
    }
    if (hasDivide === true) {
      endScore = endScore / 2;
    }

    return {
      name: n,
      totalMoney,
      basicPoints,
      endScore,
      hasMinusFive,
      multiplyCards,
      hasDivide,
    };
  });

  console.log("what is the updated playerScores?", playerScores);
  return playerScores;
  // [{ name: 'matias', totalMoney: 0, basicPoints: 12 }, { name: 'matias', totalMoney: 0, basicPoints: 12 }
};

gameRouter.patch("/bid", async (request, response, next) => {
  try {
    const { bidState } = request.body;
    // console.log("what is in the bidState?", bidState);

    // ---- shift and update passed -------------- //
    const currentTurns = bidState.turns; // [{username: "name", passed: false}, {username: "name", passed: false}, ...]

    const activeTurn = bidState.activeTurn; // {passed: true, username: "name", }

    const currentPlayer = currentTurns.shift(); // Gets the first object of the currentTurns array

    const updated = { ...currentPlayer, passed: activeTurn.passed }; // Set first player passed value to 'true'

    // If the currentCard is a negative card the first player that passes gets it
    // if (
    //   (bidState.currentCard === "divide" || "minusFive" || "discardPoints") &&
    //   currentPlayer.passed === true
    // ) {
    // }

    let updatedTurns = [...currentTurns, updated]; // Return new array with the updated passed value
    // ------------------------------------------------ //

    let turnsCheck = [...updatedTurns];
    let nextPlayer = turnsCheck.shift();

    const gameId = bidState.gameId;

    const badCards = ["divide", "minusFive"];

    // console.log("what is in turnsCheck", turnsCheck);

    const onePlayerStillPlaying = updatedTurns.filter((p) => !p.passed);

    if (onePlayerStillPlaying.length === 1) {
      // next player hasn't passed, all the rest did => round finished, he gets the card.
      // request.io.to(roomId).send("new-round", {})

      const winnerName = onePlayerStillPlaying[0].username;

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
      const nextRoundState = await buildGameState(gameId, winner.username);

      if (nextRoundState.status === "finished") {
        request.io.to(parseInt(gameId)).emit("finish-game", nextRoundState);

        response.send("bid accepted");
      } else {
        request.io.to(parseInt(gameId)).emit("gamestate", nextRoundState);
      }
    } else {
      while (nextPlayer.passed && turnsCheck.some((p) => !p.passed)) {
        turnsCheck = [...turnsCheck, nextPlayer];
        nextPlayer = turnsCheck.shift();

        // keep an updated version to return.
        updatedTurns = [nextPlayer, ...turnsCheck];
      }

      const toUpdate = {
        bids: bidState.bids,
        turns: updatedTurns,
      };

      console.log("UPDATED TURNS", toUpdate);

      request.io.to(parseInt(gameId)).emit("new-bid", toUpdate);
    }

    response.send("bid accepted");
  } catch (e) {
    console.log(e.message);
  }
});

gameRouter.post("/result", async (request, response, next) => {
  try {
    const { finalGameState } = request.body;
    const gameId = finalGameState.gameId;
    const players = finalGameState.players;
    console.log("what is the finalGameState?", finalGameState);

    // Check the money of each player

    const playerNames = Object.values(players);
    const playerName = playerNames.map((player) => {
      return player;
    });
    const playerMoney = players[playerName].money;

    console.log("what is playerMoney?", playerMoney);

    console.log("what is playerName?", playerNames);

    request.io.to(parseInt(gameId)).emit("game-results", results);
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = gameRouter;
