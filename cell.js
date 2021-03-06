class Cell {
    constructor() {
        this.left = true;
        this.right = true;
        this.up = true;
        this.down = true;
    }

    get leftWall() {return this.left;}
    get rightWall() {return this.right;}
    get upWall() {return this.up;}
    get downWall() {return this.down;}

    makeLeftWall() {this.left = false;}
    makeRightWall() {this.right = false;}
    makeUpWall() {this.up = false;}
    makeDownWall() {this.down = false;}
}

export {Cell}