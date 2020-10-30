const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const app = express();
//Load env vars
dotenv.config({ path: "./config/config.env" });
//Use for Socket.io
const server = http.createServer(app);
const io = socketio(server);

const Port = process.env.PORT || 5000;
const serverException = server.listen(
  Port,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${Port}`
  )
);
module.exports = { io };
require("./start");