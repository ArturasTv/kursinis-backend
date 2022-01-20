const { nanoid } = require("nanoid");
const express = require("express");

const cors = require("cors");
const app = express();
const { initialPieces } = require("./functions.js");
const authJwt = require("./middlewares/authJwt");

const WebSocket = require("ws");

const server = require("http").createServer(app);

const wss = new WebSocket.Server({ server });

const url = require("url");

let game = {
  id: 1,
  white: null,
  black: null,
  gameStarted: false,
  searching: true,
};

let currentTurn;
let currentPieces;

let opposite = {
  WHITE: "BLACK",
  BLACK: "WHITE",
};

const database = require("./database");
let Users = database.Users;
let Tables = database.Tables;
let Games = database.Games;

app.use(cors());

app.use(express.json());

const authRouter = require("./routes/auth");
app.use("/", authRouter);

const statsRouter = require("./routes/stats");
app.use("/", statsRouter);

app.post("/start", [authJwt], (req, res) => {
  if (!game.white) {
    game.white = req.body.username;
    game.gameStarted = false;
    game.searching = true;
    res.json({
      username: req.body.username,
      gameId: 1,
      searching: true,
      start: true,
      startedGame: +new Date(),
      whiteTime: 100,
      blackTime: 100,
    });
  } else {
    game.black = req.body.username;
    game.gameStarted = true;
    game.searching = false;
    res.json({
      username: req.body.username,
      gameId: 1,
      start: false,
      startedGame: +new Date(),
      whiteTime: 100,
      blackTime: 100,
    });
  }

  if (game.white !== null && game.black !== null) return;
});

let counter = 0;
wss.on("connection", (ws, req, res) => {
  const url_parts = url.parse(req.url, true);
  let user = Users.find((item) => item.name == url_parts.query.username);
  ws.id = user.id;

  if (counter === 0) {
    ws.WHITE = true;
  }
  if (counter === 1) {
    ws.BLACK = true;
  }
  counter++;

  if (false) {
    console.log("labas");
    wss.clients.forEach(function (client) {
      if (client.BLACK) {
        client.send(
          JSON.stringify({
            white: game.white,
            black: game.black,
            gameStarted: true,
            pieces: initialPieces(),
            searching: false,
            start: false,
            startedGame: +new Date(),
            clockTicking: "WHITE",
          })
        );
      } else {
        client.send(
          JSON.stringify({
            white: game.white,
            black: game.black,
            gameStarted: true,
            pieces: initialPieces(),
            searching: false,
            start: true,
            startedGame: +new Date(),
            clockTicking: "WHITE",
          })
        );
      }
    });

    game.playing = true;
    game.gameStarted = false;
  }
  wss.clients.forEach(function (client) {
    client.send(
      JSON.stringify({
        tables: Tables.filter((table) => table.createdById !== client.id),
      })
    );
  });
  ws.on("message", (message) => {
    const type = JSON.parse(message).type;
    const data = JSON.parse(message).data;
    let user = Users.find((item) => item.id === ws.id);
    if (type === "CREATE_GAME") {
      Tables.push({
        name: user.name,
        rating: user.rating,
        createdById: user.id,
        tableId: nanoid(),
        timeControl: `${data.minutes} + ${data.plus}`,
      });
    }

    if (type === "START_GAME") {
      console.log(data.tabke);
      let table = Tables.find((table) => table.tableId == data.tableId);
      let whiteId = Users.find((_user) => _user.name === table.name).id;
      let blackId = Users.find((_user) => _user.name === user.name).id;

      let whiteClient = [...wss.clients].find((client) => client.id == whiteId);
      let blackClient = [...wss.clients].find((client) => client.id == blackId);

      let game = {
        white: table.name,
        black: user.name,
        gameStarted: true,
        pieces: initialPieces(),
        searching: false,
        start: true,
        startedGame: +new Date(),
        clockTicking: "WHITE",
        gameId: nanoid(),
        tableId: table.tableId,
        whiteTime: +table.timeControl.split(" + ")[0] * 60,
        blackTime: +table.timeControl.split(" + ")[0] * 60,
      };

      Games.push(game);

      whiteClient.send(
        JSON.stringify({ ...game, start: true, username: table.name })
      );
      blackClient.send(
        JSON.stringify({ ...game, start: false, username: user.name })
      );

      Tables = Tables.filter(
        (table) => table.createdById != whiteId || table.createdById != blackId
      );

      wss.clients.forEach(function (client) {
        client.send(
          JSON.stringify({
            tables: Tables.filter((table) => table.createdById !== client.id),
          })
        );
      });
    }

    if (type === "MAKE_MOVE") {
      let game = Games.find((game) => game.gameId == data.gameId);

      let whiteId = Users.find((_user) => _user.name === game.white).id;
      let blackId = Users.find((_user) => _user.name === game.black).id;

      let whiteClient = [...wss.clients].find((client) => client.id == whiteId);
      let blackClient = [...wss.clients].find((client) => client.id == blackId);

      let currentPieces = data.currentPieces;
      let currentTurn = data.turn;

      let client = opposite[currentTurn] == "WHITE" ? whiteClient : blackClient;

      client.send(
        JSON.stringify({
          pieces: currentPieces,
          key: nanoid(),
          start: true,
          clockTicking: opposite[currentTurn],
        })
      );
    }
    /*
    currentPieces = JSON.parse(message).pieces;
    currentTurn = JSON.parse(message).turn;

     if (game.playing) {
      wss.clients.forEach(function (client) {
        if (client[opposite[currentTurn]]) {
          client.send(
            JSON.stringify({
              pieces: currentPieces,
              key: "asdfasdfas" + counter,
              start: true,
              clockTicking: opposite[currentTurn],
            })
          );
          counter++;
        }
      });
    }*/

    wss.clients.forEach(function (client) {
      client.send(
        JSON.stringify({
          tables: Tables.filter((table) => table.createdById !== client.id),
        })
      );
    });
  });
});

wss.broadcast = function broadcast(msg) {
  wss.clients.forEach(function each(client) {
    client.send(msg);
  });
};

server.listen(3333, () => console.log("Na ka startuojam"));
