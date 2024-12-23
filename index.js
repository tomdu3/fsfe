const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, function () {
  console.log("Server started on PORT 3000");
});

process.on("SIGINT", () => {
  console.log("sigint");
  wss.clients.forEach(function each(client) {
    client.close();
  }); // closing all websocket connections
  server.close(() => shutdownDB());
}); // process listener

/** Begin websocket */

const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ server: server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected", numClients);

  wss.broadcast(`Current visitors: ${numClients}`); // sends message to everybody connected

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server"); // message to the client
  }

  db.run(`INSERT INTO visitors (count, time)
    VALUES(${numClients}, datetime('now'))
    `); // insert data into database

  ws.on("close", function close() {
    console.log("Client has disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

/** End websocket */

/** Begin database */
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(":memory:");  // in-memory database, instead of a file

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `)
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log("Shutting down database");
  db.close();
}
/** End database */