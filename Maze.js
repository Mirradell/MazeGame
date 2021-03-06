import {Cell} from "./cell.js"

class Maze {
    constructor(width, height) {
        if (width < 2 || height < 2)
            throw new Error("Wrong size of maze!");

        this.width = width;
        this.height = height;

        this.#FillWeights();
        this.#FillMaze();
        this.#BuildMaze();
        this.#FillChests();
        this.#FillEnemies();
    }

    #FillWeights(){
        this.horizontalWeights = new Map();
        this.verticalWeights = new Map();
        this.sets = new Map();

        for (let y = 0; y < this.height - 1; y++)
            for(let x = 0; x < this.width; x++)
                this.horizontalWeights.set([y, x], GetRandomInt(0, 11));

        for (let y = 0; y < this.height; y++)
            for(let x = 0; x < this.width - 1; x++)
                this.verticalWeights.set([y, x], GetRandomInt(0, 11));

        let i = 0;
        for (let y = 0; y < this.height; y++)
            for(let x = 0; x < this.width; x++) {
                this.sets.set([y, x], i);
                i++;
            }
    }

    #FillMaze(){
        this.maze = [];

        for(let y = 0; y < this.height; y++){
            const row = [];
            for (let x = 0; x < this.width; x++)
                row.push(new Cell());
            this.maze.push(row);
        }
    }

    #GetMinHorizontalWeight(){
        let min = 100;
        this.horizontalWeights.forEach(x => min = Math.min(min, x));
        return min;
    }

    #GetMinVerticalWeight(){
        let min = 100;
        this.verticalWeights.forEach(x => min = Math.min(min, x));
        return min;
    }

    #FindValueInSet(kkey){
        for (let [key, value] of this.sets)
            if (key[0] === kkey[0] && key[1] === kkey[1]) {
                return value;
            }
        return undefined;
    }

    #BuildMaze() {
        let minWeightHorizontal = this.#GetMinHorizontalWeight();
        let minWeightVertical = this.#GetMinVerticalWeight();
        let minWeight = Math.min(minWeightHorizontal, minWeightVertical);

        while (minWeight < 15) {
            let first = new Array(-1, -1);
            let second = new Array(-1, -1);

            if (minWeight === minWeightHorizontal){
               for (let [key, value] of this.horizontalWeights)
                   if (value === minWeight){
                        first = key;
                        break;
                   }
               second[0] = first[0] + 1;
               second[1] = first[1];
               this.horizontalWeights.delete(first);
               this.horizontalWeights.set(first, 20);

               if (this.#FindValueInSet(first) !== this.#FindValueInSet(second)){
                   this.maze[first[0]][first[1]].makeDownWall();
                   this.maze[second[0]][second[1]].makeUpWall();
               }

               minWeightHorizontal = this.#GetMinHorizontalWeight();
            }
            else if (minWeight === minWeightVertical) {
                for (let [key, value] of this.verticalWeights)
                    if (value === minWeight){
                        first = key;
                        break;
                    }
                second[0] = first[0];
                second[1] = first[1] + 1;
                this.verticalWeights.delete(first);
                this.verticalWeights.set(first, 20);

                if (this.#FindValueInSet(first) !== this.#FindValueInSet(second)){
                    this.maze[first[0]][first[1]].makeRightWall();
                    this.maze[second[0]][second[1]].makeLeftWall();
                }

                minWeightVertical = this.#GetMinVerticalWeight();
            }

            const prev = this.#FindValueInSet(second);
            const next = this.#FindValueInSet(first);
            if (prev !== next)
                this.sets.forEach((value, key, map) => {
                    if (value === prev) {
                        this.sets.delete(key);
                        this.sets.set(key, this.#FindValueInSet(first));
                    }
                });
            minWeight = Math.min(minWeightVertical, minWeightHorizontal);
        }
    }

    #FillChests() {
        this.chests = [];
        for (let i = 0; i < 10; i++)
            this.chests.push({x: GetRandomInt(0, this.width), y: GetRandomInt(0, this.height)});
    }

    getChests() {
        return this.chests;
    }

    printMaze(){
        let str = "\t+";
        this.maze[0].forEach(cell => str += cell.upWall ? "---+" : "   +");
        this.maze.forEach(column => {
            str += "\n\t|";
            column.forEach(cell => str += cell.rightWall ? "   |" : "    ");
            str += "\n\t+";
            column.forEach(cell => str += cell.downWall ? "---+" : "   +");
        });
        return str;
    }

    mazeToBytes(){
        let res = "";
        this.maze.forEach(column =>
            column.forEach(cell => {
                res += cell.upWall ? "1" : "0";
                res += cell.rightWall ? "1" : "0";
                res += cell.downWall ? "1" : "0";
                res += cell.leftWall ? "1" : "0";
            })
        );
        return res;
    }

    #FillEnemies() {
        this.enemies = [];
        for (let i = 0; i < 10; i++)
            this.enemies.push({x: GetRandomInt(0, this.width), y: GetRandomInt(0, this.height)});
    }

    getEnemies() {return this.enemies;}
}

export {Maze};

export function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //???????????????? ???? ????????????????????, ?????????????? ????????????????????
}