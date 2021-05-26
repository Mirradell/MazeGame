import {GetRandomInt, Maze} from "./Maze.js";
import * as DB from "./dbWork.js";


const randomColor = require('randomcolor');
let lastRoomTime = -1;
const roomDelta = 5;
let roomsInfoMap = new Map();
const mazeWidth = 14;
const mazeHeight = 14;

const secondsDiff = (time) => {
    return Math.round((Date.now() - time)  / 1000);
}

export const qToken = (socket) => (token) => {
    DB.CreateDB();

    let newToken = token;
    if (newToken === null || newToken === -1) {
        newToken = Date.now().toString();
        while (newToken === null)
            newToken = Date.now().toString();

        DB.AddTokenToDB(newToken);
    }

    let dbRes = [];
    setTimeout(() => {
        dbRes = DB.ShowRowInDB(newToken);
    }, 10);
    setTimeout(() => {
        aStatistics(socket)(dbRes[0], dbRes[1], dbRes[2], dbRes[3]);
    }, 20);
}

export const qStart = (socket) => (token) => {
    let maze = new Maze(mazeWidth, mazeHeight);

    if (lastRoomTime === -1 || secondsDiff(lastRoomTime) > roomDelta)
    {
         //create new room
         lastRoomTime = Date.now();
         roomsInfoMap.set(lastRoomTime, new Map([["maze", maze], ["players", new Map()]]));
    }
    maze = roomsInfoMap.get(lastRoomTime).get("maze");
    const playerPlace = {x: GetRandomInt(0, mazeWidth), y: GetRandomInt(0, mazeHeight)};
    const playerColor = randomColor();

    socket.emit('time', roomDelta - secondsDiff(lastRoomTime));
    socket.emit('maze', maze.mazeToBytes());
    socket.emit('player', playerPlace, playerColor);
    socket.emit('chests', maze.getChests());
    socket.emit('enemies', maze.getEnemies());
    socket.join(lastRoomTime.toString());
    socket.to(lastRoomTime.toString()).emit('enemy', token, playerPlace, playerColor);

    // посылаем все местоположения уже созданных игроков
    for (let player of roomsInfoMap.get(lastRoomTime).get("players")){
        socket.emit('enemy', player[0], player[1].get("place"), player[1].get("color"))
    }

    //добавляем себя в map созданных игроков
    roomsInfoMap.get(lastRoomTime).get("players").set(token, new Map([["place", playerPlace], ["color", playerColor]]));
}

export const qTurn = (socket) => (token, finalPoint) => {
    for (let room of roomsInfoMap) {
        if (room[1].get("players").get(token) !== undefined) {
            socket.to(room[0].toString()).emit('turn', token, finalPoint);
            return;
        }
    }
}

export const qFinish = (socket) => (token, chests, enemies) => {
   // if (token !== null)
        DB.UpdateDBByToken(token, chests, enemies);
}

export const qDisconnect = (socket) => (token) => {
    DB.DropRowInDB(token);
}

export const aStatistics = (socket) => (token, games, chests, enemies) => {
    socket.emit('statistics', token, games, chests, enemies);
}