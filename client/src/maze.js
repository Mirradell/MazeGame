class Cell {
    constructor() {
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
    }

    get leftWall() {return this.left;}
    get rightWall() {return this.right;}
    get upWall() {return this.up;}
    get downWall() {return this.down;}

    makeLeftWall() {this.left = true;}
    makeRightWall() {this.right = true;}
    makeUpWall() {this.up = true;}
    makeDownWall() {this.down = true;}
}

const canvas = document.getElementById("mazeCanvas");
const context = canvas.getContext("2d");
const chest = document.createElement("img");
chest.src = `./images/chest.png`;
const human = document.createElement("img");
human.src = `./images/player.png`;
const enemy = document.createElement("img");
enemy.src = `./images/enemy.png`;

const xShift = 80;
const cellSize = 10;
const cellAmount = 14;
const gridWidth = cellAmount * cellSize;
const gridHeight = cellAmount * cellSize;
const maze = [];
const playerSize = {
    width: 8,
    height: 8
}
let playerCoord = {
    x: 0,
    y: 0
}
const difference = {
    x: (cellSize - playerSize.width) / 2,
    y: (cellSize - playerSize.height) / 2
}
let chestsPositions = [];
let enemiesPositions = [];

const drawGrid = () => {
    context.beginPath();
    context.fillStyle = "black";
    // рамка сверху и слева
    context.fillRect(xShift, 0, 1, gridHeight);
    context.fillRect(xShift, 0, gridWidth, 1);

    //заполнение лабиринта
    for (let y = 0; y < cellAmount; y++)
        for (let x = 0; x < cellAmount; x++) {
            if (maze[y][x].rightWall)
                context.fillRect(xShift + (1 + x) * cellSize, y * cellSize, 1, cellSize + 1);
            if (maze[y][x].downWall)
                context.fillRect(xShift + x * cellSize, (1 + y) * cellSize, cellSize + 1, 1);
        }
}

const drawPlayer = (color, coordinates) => {
    context.fillStyle = color;
    context.fillRect(xShift + coordinates.x * cellSize + difference.x,
                     coordinates.y * cellSize + difference.y,
                        playerSize.width + 1,
                        playerSize.height + 1);
}

const drawChests = (positions) => {
    positions.forEach(position =>
        context.drawImage(chest,
            xShift + position.x * cellSize + 1,
            position.y * cellSize + 1,
            cellSize - 1,
            cellSize - 1
        ));

    chestsPositions = positions;
}

const drawEnemies = (positions) => {
    positions.forEach(position =>
        context.drawImage(enemy,
            xShift + position.x * cellSize + 1,
            position.y * cellSize + 1,
            cellSize - 1,
            cellSize - 1
        ));
    enemiesPositions = positions;
}

const redrawPlayer = (color, newCoordinates) => {
    drawPlayer("white", playerCoord);
    drawPlayer(color, newCoordinates);
    context.drawImage(human,
        xShift + newCoordinates.x * cellSize + difference.x,
        newCoordinates.y * cellSize + difference.y,
        playerSize.width + 1,
        playerSize.height + 1);
    playerCoord = newCoordinates;
}

const redrawEnemy = (color, oldCoord, newCoord) => {
    drawPlayer("white", oldCoord);
    drawPlayer(color, newCoord);
}

const buildMaze = (str) => {
    let counter = 0;
    for (let y = 0; y < cellAmount; y++) {
        let row = [];
        for (let x = 0; x < cellAmount; x++) {
            let cell = new Cell();
            for (let k = 0; k < 4; k++) {
                if (str[counter] === "1") {
                    if (k === 0) // up wall
                        cell.makeUpWall();
                    else if (k === 1) // right wall
                        cell.makeRightWall();
                    else if (k === 2) //down wall
                        cell.makeDownWall();
                    else if (k === 3) // left wall
                        cell.makeLeftWall();
                }
                counter++;
            }
            row.push(cell);
        }
        maze.push(row);
    }
}

function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}