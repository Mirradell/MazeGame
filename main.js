import * as QA from './QuestionsAnswers.js';

const http = require('http');
const express = require('express');
const socketIO  = require('socket.io');

const app = express();
app.use(express.static(`${__dirname}/client`));

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
    socket.on('token',  QA.qToken(socket));
    socket.on('start',  QA.qStart(socket));
    socket.on('turn',   QA.qTurn(socket));
    socket.on('finish', QA.qFinish(socket));
    socket.on('disconnect', QA.qDisconnect(socket));
});

server.on('error', (error) => {
    console.error(error);
});

server.listen(80, () => {
   console.log('server is listening...');
});
