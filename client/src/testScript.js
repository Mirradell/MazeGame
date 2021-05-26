let _token = -1;
const enemies = new Map();
const timerMinutes = 10;//3 * 60; //минуты

const timerText = document.getElementById('timer');
const moneyText = document.getElementById('money');
const enemyText = document.getElementById('enemy');

let _color;
let minutes = -1;
const tips = [
    "Запутываем лабиринты как можно сильнее",
    "Разбрасываем монеты по лабиринту",
    "Сдуваем пылинки с мозгов разработчиков",
    "Искреене надеемся на автоматы по экзаменам"
]
let collectedMoney = 0;
let killedEnemies = 0;

const onStartPress = (sock) => () => {
    //e.preventDefault();
    sock.emit('start', _token);
    //console.log(_token);
    collectedMoney = 0;
    killedEnemies = 0;
    enemyText.innerText = `Убито врагов: ${killedEnemies}`;
    moneyText.innerText = `Собрано монет: ${collectedMoney}`;

    document.getElementById('startBtn').hidden = true;
    document.getElementById('loading').hidden = false;
    document.getElementById('games').hidden = true;
    moneyText.hidden = true;
    enemyText.hidden = true;
    const timerTemp = document.getElementById('timerText').children;
    timerTemp[0].hidden = false;
    timerTemp[1].hidden = false;

    const funnyTips = document.getElementById('tips');
    funnyTips.innerText = tips[GetRandomInt(0, tips.length)];
    funnyTips.hidden = false;

    const timer = setInterval(() => {
        if (minutes < 0){
            clearInterval(timer);
        }

        timerText.innerText = `${minutes > 0 ? minutes%60 : 10} секунд`;
        if (minutes === 0){
            //clearInterval(timer);
           // minutes = timerMinutes;
            if (document.getElementById('mazeCanvas').hidden === true) // прошло время ожидания соперников
            {
                document.getElementById('mazeCanvas').hidden = false;
                document.getElementById('loading').hidden = true;
                document.getElementById('tips').hidden = true;
                moneyText.hidden = false;
                enemyText.hidden = false;
                minutes = 30; //30 sec
            }
            else if (document.getElementById('mazeCanvas').hidden === false)// прошло время хождения в лабиринте
            {
                context.clearRect(0, 0, canvas.width, canvas.height);
                document.getElementById('mazeCanvas').hidden = true;
                document.getElementById('startBtn').hidden = false;
                document.getElementById('games').hidden = false;
                const timerTemp = document.getElementById('timerText').children;
                timerTemp[0].hidden = true;
                timerTemp[1].hidden = true;
               //    minutes = 10;

                sock.emit('finish', _token, collectedMoney, killedEnemies);
                sock.emit('token', _token);
            }
        }
        minutes--;
    }, 1000);
}

const onMazeGet = (sock) => (maze) => {
    buildMaze(maze);
    drawGrid();
    console.log(_token);
}

const onPlayerPosition = (sock) => (position, color) => {
    //console.log(`color = ${color}, position = ${position.x}, ${position.y}`);
    _color = color;
    redrawPlayer(color, position);
}

const onEnemyPosition = (sock) => (token, position, color) => {
    enemies.set(token, new Map([["color", color], ["prevPos", position]]));
    redrawEnemy(color, position, position);
}

const onMyTurn = (sock) => (newPos) => {
    const possibleChestInd = chestsPositions.findIndex(chest => chest.x === newPos.x && chest.y === newPos.y);
    if (possibleChestInd !== -1){
        collectedMoney++;
        moneyText.innerText = `Собрано монет: ${collectedMoney}`;
        chestsPositions.splice(possibleChestInd, 1);
    }

    const possibleEnemyInd = enemiesPositions.findIndex(enemy => enemy.x === newPos.x && enemy.y === newPos.y);
    if (possibleEnemyInd !== -1){
        killedEnemies++;
        enemyText.innerText = `Убито врагов: ${killedEnemies}`;
        enemiesPositions.splice(possibleEnemyInd, 1);
    }

    redrawPlayer(_color, newPos);
    sock.emit('turn', _token, newPos);
}

const onEnemyTurn = (sock) => (token, newPos) => {
    const possibleChestInd = chestsPositions.findIndex(chest => chest.x === newPos.x && chest.y === newPos.y);
    if (possibleChestInd !== -1){
        chestsPositions.splice(possibleChestInd, 1);
    }

    const possibleEnemyInd = enemiesPositions.findIndex(enemy => enemy.x === newPos.x && enemy.y === newPos.y);
    if (possibleEnemyInd !== -1){
        enemiesPositions.splice(possibleEnemyInd, 1);
    }

    const enemyColor = enemies.get(token).get("color");
    redrawEnemy(enemies.get(token).get("color"), enemies.get(token).get("prevPos"), newPos);
    enemies.get(token).delete("prevPos");
    enemies.get(token).set("prevPos", newPos);
}

const onChestsPosition = (positions) => {
    drawChests(positions);
}

const onEnemiesPosition = (positions) => {
    drawEnemies(positions);
}

const onStatisticsGet = (sock) => (token, games, chests, enemies) => {
    moneyText.innerText = `Собрано монет: ${chests === null ? collectedMoney : chests}`;
    enemyText.innerText = `Убито врагов: ${enemies === null ? killedEnemies : chests}`;
    document.getElementById('games').innerText = `Сыграно игр: ${games === null ? 0 : games}`;
    if (_token === -1 || _token === null) _token = token;
    if (_token === null) sock.emit('token', -1);
}

(() => {
    const sock = io();
    sock.emit('token', _token);

    sock.on('statistics', onStatisticsGet(sock));
    sock.on('time', (min) => {minutes = min});
    sock.on('maze', onMazeGet(sock));
    sock.on('player', onPlayerPosition(sock));
    sock.on('chests', onChestsPosition);
    sock.on('enemies', onEnemiesPosition);
    sock.on('enemy', onEnemyPosition(sock));
    sock.on('turn', onEnemyTurn(sock));

    document.
    getElementById('startBtn').
    addEventListener('click', onStartPress(sock));

    document.onkeydown = function (e) {
        if (document.getElementById('mazeCanvas').hidden)
            return;

        let keyCode = e.code;
        if (keyCode === "ArrowRight") {
            if (!maze[playerCoord.y][playerCoord.x].rightWall)
                onMyTurn(sock)({x: playerCoord.x + 1, y: playerCoord.y});
        }
        else if (keyCode === "ArrowLeft") {
            if (!maze[playerCoord.y][playerCoord.x].leftWall)
                onMyTurn(sock)({x: playerCoord.x - 1, y: playerCoord.y});
        }
        else if (keyCode === "ArrowUp") {
            if (!maze[playerCoord.y][playerCoord.x].upWall)
                onMyTurn(sock)({x: playerCoord.x, y: playerCoord.y - 1});
        }
        else if (keyCode === "ArrowDown") {
            if (!maze[playerCoord.y][playerCoord.x].downWall)
                onMyTurn(sock)({x: playerCoord.x, y: playerCoord.y + 1});
        }
    }
})();