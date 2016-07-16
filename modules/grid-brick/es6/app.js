// @flow
'use strict';

(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

import assert from 'assert';
import _ from 'lodash';

class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    rotate90RightWithoutPivot(): Point {
        return new Point(-this.y, this.x);
    }
    rotate90Right(_pivot: ?Point): Point {
        const pivot: Point = _pivot || new Point(0,0);
        return this.subtract(pivot).rotate90RightWithoutPivot().add(pivot);
    }
    rotate90LeftWithoutPivot(): Point {
        return new Point(this.y, -this.x);
    }
    rotate90Left(_pivot: ?Point): Point {
        const pivot: Point = _pivot || new Point(0,0);
        return this.subtract(pivot).rotate90LeftWithoutPivot().add(pivot);
    }    
    equals(p2: Point): boolean {
        return this.x===p2.x && this.y===p2.y;
    }
    moveX(i: number): Point {
        return new Point(this.x+i, this.y);
    }
    moveY(i: number): Point {
        return new Point(this.x, this.y+i);
    }    
    lower(): Point {
        return new Point(this.x, this.y+1);
    }
    add(otherPoint: Point): Point {
        assert(otherPoint instanceof Point);
        return new Point(this.x+otherPoint.x, this.y+otherPoint.y);
    }
    subtract(otherPoint: Point): Point {
        return this.add(otherPoint.opposite());
    }
    opposite(): Point {
        return new Point(-this.x, -this.y);
    }
    clone(): Point {
        return new Point(this.x, this.y);
    }
    toString(): String {
        return `(${this.x}, ${this.y})`;
    }
}

class Vector {
    pointA: Point;
    pointB: Point;
    constructor(pointA: Point, pointB: Point) {
        this.pointA = pointA;
        this.pointB = pointB;
    }
    isVertical(): boolean {
        return this.pointA.x === this.pointB.x;
    }
    verticalDrop(): number {
        return this.pointB.y - this.pointA.y;
    }
    toString(): string {
        return `[${this.pointA}->${this.pointB}]`;
    }
    verticalLength(): number {
        return this.pointB.y - this.pointA.y;
    }
}

function between(x: number,a: number,b: number): boolean {
    return (x>=a) && (x<b);
}

function notBetween(x: number, a: number,b: number): boolean {
    return !between(x,a,b);
}


function transpose(arr: Array<Array<number>>): Array<Array<number>> {
    const rv = [];
    for (let j = 0 ; j < arr[0].length ; j++) {
        const row = [];
        for (let i = 0; i < arr.length ; i++) {
            row.push(arr[i][j]);
        }
        rv.push(row);
    }
    return rv;
}


class Grid {
    occupied: Array<Array<number>>;
    x: number;
    y: number;
    constructor(occupied: Array<Array<number>>) {
        assert(arguments.length===1);
        assert(Array.isArray(occupied));
        assert ( Object.keys(_.groupBy(occupied.map(x => x.length))).length == 1 );
        assert (_.every([].concat.apply([], occupied), (x)=>x===null || ((typeof x)===(typeof 0))));
        assert (_.every([].concat.apply([], occupied), (x)=>x===null || Number.isInteger(x)));
        this.x = occupied.length;
        this.y = occupied[0].length;
        this.occupied = occupied;
    }
    horizontalFills(): Array<number> {
        let rv = [];
        for (let j = 0 ; j < this.y ; j++) {
            let allFilled = true;
            for (let i = 0; i < this.x ; i++) {
                if (this.occupied[i][j]===null) {
                    allFilled = false;
                    break;
                }
            }
            if (allFilled)
                rv.push(j);
        }
        return rv;
    }
    removeHorizontalFills(): Grid {
        const horizontalFills = this.horizontalFills();
        const troccupied = transpose(this.occupied);
        const troccupiedCompressed = [];
        for (let i = 0 ; i< troccupied.length ; i++) {
            if (!horizontalFills.includes(i))
                troccupiedCompressed.push(troccupied[i]);
        }
        _.times(horizontalFills.length, ()=>{
            troccupiedCompressed.unshift(Array(this.x).fill(null));
        });
        const newOccupied = transpose(troccupiedCompressed);
        const rv = new Grid(newOccupied);
        assert (rv.x === this.x) && (rv.y === this.y);
        return rv;
    }
    shaftDepths(): Array<number> {
        return this.occupied.map( (shaft) => _.findIndex(shaft, (x)=>x!==null) )
            .map( (d) => d===-1?this.y:d);
    }
    lowestDepth(): number {
        const shaftDepths = this.shaftDepths();
        return Math.min.apply(null, shaftDepths);
    }
    deepestShaftIndex(): number {
        const shaftDepths = this.shaftDepths();
        const maxDepth = Math.max.apply(null, shaftDepths);
        const candidateMaxShaftIndices = [];
        for (let i = 0 ; i < shaftDepths.length ; i++) {
            if (shaftDepths[i]===maxDepth)
                candidateMaxShaftIndices.push(i);
        }
        return  _.sample(candidateMaxShaftIndices);
    }
    inGrid(p: Point) : boolean {
        return between(p.x, 0, this.x) && between(p.y, 0, this.y);
    }
    fits(i: number, j: number, brick: Brick): boolean {
        const rv = [];
        const offendingValues = _.filter(brick.points, ({x,y})=>{
            return notBetween(i+x, 0, this.x) || notBetween(j+y, -Brick.MAX_BRICK_HEIGHT, this.y) || (this.occupied[i+x][j+y]!=null);});
        return (offendingValues.length === 0);
    }
    isStuck(i: number, j: number, brick: Brick): boolean {
        return !this.fits(i, j+1, brick);
    }     
    static create(x: number, y: number): Grid {
        return new Grid( Array(x).fill (Array(y).fill(null) ) );
    }
    clone(): Grid {
        return new Grid(this.occupied.slice().map( (x)=>x.slice()));
    }
    equal(other: Grid): boolean {
        if (this.x !== other.x) return false;
        if (this.y !== other.y) return false;
        if (this.occupied.length !== other.occupied.length) return false;
        for (let i = 0 ; i < this.occupied.length ; i++) {
            for (let j = 0 ; j < this.occupied[i].length ; j++) {
                if (this.occupied[i].length !== other.occupied[i].length)
                    return false;
                if (this.occupied[i][j]!==other.occupied[i][j])
                    return false;
            }
        }
        return true;
    }
}

class Brick {
    points: Array<Point>;
    v: number;
    rotationPivot: Point;
    static MAX_BRICK_HEIGHT = 4;
    static rotate90Right = function (pivot) {return new Brick(this.points.map( x => x.rotate90Right(pivot)), this.v, pivot); };
    static rotate90Left = function (pivot) {return new Brick(this.points.map( x => x.rotate90Left(pivot)), this.v, pivot); };
    static createSquare: (v: number)=>Brick  = function(v) {
        return new Brick([new Point(0,0), new Point(1,0), new Point(0,-1), new Point(1, -1)], v, new Point(0.5, -0.5));
    };
    static createBracket: (v: number)=>Brick  = function(v) {
        return new Brick([new Point(0,0), new Point(0,-1), new Point(1,-1)], v, new Point(0.5, -0.5));
    };
    static createRafter: (v: number)=>Brick = function (v) {
        return new Brick([new Point(0,0), new Point(0,-1), new Point(0,-2), new Point(0,-3)], v, new Point(0, -1));
    }
    static createS1: (v: number)=>Brick = function (v) {
        return new Brick([new Point(0,0), new Point(0,-1), new Point(1,-1), new Point(1,-2)], v, new Point(0.5, -0.5));
    }
    static createS2: (v: number)=>Brick = function (v) {
        return new Brick([new Point(1,0), new Point(1,-1), new Point(0,-1), new Point(0,-2)], v, new Point(0.5, -0.5));
    }
    static gammaR: (v: number)=>Brick = function (v) {
        return new Brick([new Point(0,0), new Point(0,-1), new Point(0,-2), new Point(1,-2)], v, new Point(0.5, -0.5));
    }
    static gammaL: (v: number)=>Brick = function (v) {
        return new Brick([new Point(1,0), new Point(1,-1), new Point(1,-2), new Point(0,-2)], v, new Point(0.5, -0.5));
    }    
    static randomBrick: ()=>Brick = function() {
        const BRICKS = [Brick.createSquare, Brick.createRafter, Brick.createBracket, Brick.createS1, Brick.createS2, Brick.gammaR, Brick.gammaL];
        return BRICKS[Math.floor(Math.random()*BRICKS.length)](Math.floor(Math.random()*1000*1000));
    };
    clone(): Brick {
        return new Brick(this.points.map( (x)=>x.clone()), this.v, this.rotationPivot.clone());
    }
    breadth(): number {
        const minX = Math.min.apply(null, this.points.map( p => p.x ));
        const maxX = Math.max.apply(null, this.points.map( p => p.x ));
        return maxX - minX;
    }
    height(): number {
        const minY = Math.min.apply(null, this.points.map( p => p.y ));
        const maxY = Math.max.apply(null, this.points.map( p => p.y ));
        return maxY - minY;
    }    
    constructor(points: Array<Point>, v: number, rotationPivot: ?Point) {
        assert(_.every(points, (x)=>x instanceof Point));
        assert(_.every(points, ({x,y})=>Number.isInteger(x) && Number.isInteger(y)));
        assert(typeof v === typeof 0);
        this.points = points;
        this.v = v;
        this.rotationPivot = rotationPivot || new Point(0,0);
    }
    rotate90Right(): Brick {
        return Brick.rotate90Right.apply(this, [this.rotationPivot]);
    }
    rotate90Left(): Brick {
        return Brick.rotate90Left.apply(this, [this.rotationPivot]);
    }
    projectAt(point: Point): Brick {
        assert(point instanceof Point);
        return new Brick(this.points.map( (x)=>x.add(point)), this.v);
    }
}

class GridWithBrick {
    grid: Grid;
    brick: ?Brick;
    brickLocation: ?Point;
    constructor(grid: Grid, brick: ?Brick, brickLocation: ?Point) {
        assert(grid instanceof Grid);
        if (!((brick!==null) && (brickLocation!==null)))
            assert ((brick===null) && (brickLocation===null));
        this.grid = grid;
        this.brick = brick;
        this.brickLocation = brickLocation;
    }
    clone(): GridWithBrick {
        return new GridWithBrick(this.grid.clone(),
                                 this.brick==null?null:this.brick.clone(),
                                 this.brickLocation==null?null:this.brickLocation.clone());
    }
    static createEmpty(grid: Grid): GridWithBrick {
        return new GridWithBrick(grid, null, null);
    }
    isStuck(): boolean {
        if (this.brick != null) {
            assert(this.brick!==null, 'bug');
            if (this.brickLocation != null) {
                assert(this.brickLocation!==null, 'bug');
                return this.grid.isStuck(this.brickLocation.x, this.brickLocation.y, this.brick);
            } else throw new Error('when brick is not null, so should brickLocation');
        } else throw new Error('bad choreography calling isStuck on grid with no brikc');
    }
    removeHorizontalFills(): GridWithBrick {
        if ((this.brick!=null) || (this.brickLocation!==null))
            throw new Error('bad choreography');
        else
            return GridWithBrick.createEmpty(this.grid.removeHorizontalFills());
    }
    brickFullyInsideGrid(): boolean {
        if (this.brick) {
            const thisBrick: Brick = this.brick || (()=>{throw new Error('should have escaped by now');})();
            const brickLocation: Point = this.brickLocation || (()=>{throw new Error('should have escaped by now');})();
            const projectedBrick = thisBrick.projectAt(brickLocation);
            return _.every(projectedBrick.points, (p)=>this.grid.inGrid(p));
        } else throw new Error('illegal choreography');
    }
    rotate90Right(): GridWithBrickAndActionResult {
        return this.reportRotationalResult( Brick.rotate90Right );
    }

    rotate90Left(): GridWithBrickAndActionResult {
        return this.reportRotationalResult( Brick.rotate90Left );
    }
    introduceNewBrick(brick: Brick): GridWithBrick {
        assert(this.brick==null);
//        const brick = Brick.randomBrick();
        const brickLocation = new Point(Math.floor(this.grid.x/2), Brick.MAX_BRICK_HEIGHT-1);
        return new GridWithBrick(this.grid.clone(), brick, brickLocation);
    }
    reportRotationalResult(f: (pivot: Point)=>Brick): GridWithBrickAndActionResult { // in a rotational brick transformation the location of the brick does not change
        if (this.brick===null)
            return new GridWithBrickAndActionResult(this.clone(), true);
        else {
            const thisBrick: Brick = this.brick || (()=>{throw new Error('cannot be null at this point');})();
            const brickNewShape = f.apply(this.brick, [thisBrick.rotationPivot]);
            if (this.brickLocation!=null) {
                if (this.grid.fits(this.brickLocation.x, this.brickLocation.y, brickNewShape))
                    return new GridWithBrickAndActionResult(
                        new GridWithBrick(this.grid.clone(), brickNewShape, this.brickLocation)
                        , true);
                else
                    return new GridWithBrickAndActionResult(
                        this.clone()
                        , false);
            } else
                throw new Error('it is not possible for brick to be present and brickLocation to be null');
        }
    }
    ossify(): GridWithBrick | ExceptionalOssificationResult {
        if (this.brick) {
            const brickLocation: Point = this.brickLocation || (()=>{throw new Error('should have escaped by now');})();
            const brick: Brick         = this.brick         || (()=>{throw new Error('should have escaped by now');})();
            if (this.grid.isStuck(brickLocation.x, brickLocation.y, brick)) {
                const projectedBrick = brick.projectAt(brickLocation);
                const newOccupiedMap = this.grid.occupied.slice();
                for (let point of projectedBrick.points) {
                    assert(this.grid.occupied[point.x][point.y]===null);
                    newOccupiedMap[point.x][point.y] = brick.v;
                }
                return new GridWithBrick(new Grid(newOccupiedMap), null, null);
            }
            else
                return ExceptionalOssificationResult.FLUID;
        } else
            return ExceptionalOssificationResult.MOOT;
    }

    lower(): GridWithBrickAndActionResult {
        if (this.brick===null)
            return new GridWithBrickAndActionResult(this, true);
        else {
            const brickLocation: Point = this.brickLocation || (()=>{throw new Error('should have already escaped at this point');})();
            const brick: Brick         = this.brick         || (()=>{throw new Error('should have already escaped at this point');})();
            if (this.grid.isStuck(brickLocation.x, brickLocation.y, brick))
                return new GridWithBrickAndActionResult(this.clone(), false);
            else {
                assert(this.grid.fits(brickLocation.x, brickLocation.y+1, brick));
                const newBrickLocation = brickLocation.lower();
                return new GridWithBrickAndActionResult(
                    new GridWithBrick(this.grid.clone(), brick.clone(), newBrickLocation)
                    , true);
            }
        }
    }
    drop(): GridWithBrickAndActionResultAndDropVector {
        if (this.brick===null)
            throw new Error('bad choreography'); // TODO: compare with lower()
        const breadth = this.brick.breadth();
        const height  = this.brick.height();
        const pointA: Point = this.brickLocation.clone();
        let pointB: Point;
        let lowerResult: GridWithBrickAndActionResult = this.lower();
        let initialLowerResult: boolean = lowerResult.actionResult;
        for (; !lowerResult.gridWithBrick.grid.isStuck(lowerResult.gridWithBrick.brickLocation.x
                                                      , lowerResult.gridWithBrick.brickLocation.y
                                                      , lowerResult.gridWithBrick.brick)
             ; lowerResult = lowerResult.gridWithBrick.lower()) {
            pointB = lowerResult.gridWithBrick.brickLocation;
        }
        const shiftX = ((breadth)=>{
            switch (breadth) {
            case 0: return 0;
            case 1: return 0.5;
            case 2: return 0.5;
            case 3: return 0.5;
            default:
                throw new Error(`unhandled case: [${breadh}]`);
            }
        })(breadth);
        const shiftY = ((height)=>{
            switch (height) {
            case 0: return 0.5;
            case 1: return 0.5;
            case 2: return 1.5;
            case 3: return 2.5;
            default:
                throw new Error(`unhandled case: [${height}]`);
            }
        })(height);
                       
        const dropVector = new Vector(pointA.moveX(shiftX), pointB.moveX(shiftX).moveY(-shiftY));
        assert(dropVector.isVertical());
        return new GridWithBrickAndActionResultAndDropVector(
            lowerResult.gridWithBrick,
            initialLowerResult,
            dropVector);
    }
    moveLeft() : GridWithBrickAndActionResult {return this.moveX(true);}
    moveRight(): GridWithBrickAndActionResult {return this.moveX(false);}    
    moveX(leftOrRight: boolean): GridWithBrickAndActionResult {
        if (this.brick===null)
            return new GridWithBrickAndActionResult(this, true);
        else {
            const xdelta = leftOrRight?-1:1;
            const brickLocation: Point = this.brickLocation || (()=>{throw new Error('should have already escaped at this point');})();
            const brick: Brick         = this.brick         || (()=>{throw new Error('should have already escaped at this point');})();
            if (this.grid.fits(brickLocation.x+xdelta, brickLocation.y, brick)) {
                const newBrickLocation = brickLocation.moveX(xdelta);
                return new GridWithBrickAndActionResult(
                    new GridWithBrick(this.grid.clone(), brick.clone(), newBrickLocation)
                    , true);
            } else
                return new GridWithBrickAndActionResult(this.clone(), false);            
        }
    }        

    stuffInCoords(i: number, j: number): number | null {
        if (this.grid.occupied[i][j]!==null) {
            return this.grid.occupied[i][j];
        }
        else if (this.brick) {
            const brickLocation: Point = this.brickLocation || (()=>{throw new Error('should have already escaped at this point');})();
            const brick: Brick         = this.brick         || (()=>{throw new Error('should have already escaped at this point');})();
            const projectedBrick: Brick = brick.projectAt(brickLocation);
            for (let point of projectedBrick.points) {
                if (point.equals(new Point(i, j)))
                    return projectedBrick.v;
            }
        }
        return null;
    }
    toString() {
        const lines = [];
        for (let j = 0 ; j < this.grid.occupied[0].length ; j++) {
            const symbolsOnLine = [];
            for (let i = 0 ; i < this.grid.occupied.length; i++) {
                symbolsOnLine.push(this.stuffInCoords(i, j)===null?'.':this.stuffInCoords(i, j));
            }
            lines.push(symbolsOnLine.join('-'));
        }
        return lines.join('\n');
    }
    toStringDetailed(){
        const report = [];
        if (!this.brick)
            report.push(`no brick`);
        else {
            report.push(`brick: ${JSON.stringify(this.brick)}`);
            report.push(`brickLocation: ${JSON.stringify(this.brickLocation)}`);
        }
        report.push(this.toString());
        return `-------\n${report.join('\n')}\n----------`;
    }
}


class GridWithBrickAndActionResult {
    gridWithBrick: GridWithBrick;
    actionResult: boolean;
    constructor(gridWithBrick: GridWithBrick, actionResult: boolean) {
        assert((gridWithBrick instanceof GridWithBrick) && (typeof actionResult === typeof true));
        this.gridWithBrick = gridWithBrick;
        this.actionResult = actionResult;
    }
}

class GridWithBrickAndActionResultAndDropVector {
    gridWithBrick: GridWithBrick;
    actionResult: boolean;
    dropVector: Vector;
    constructor(gridWithBrick: GridWithBrick, actionResult: boolean, dropVector: Vector) {
        assert((gridWithBrick instanceof GridWithBrick) && (typeof actionResult === typeof true));
        assert(dropVector.isVertical());
        this.gridWithBrick = gridWithBrick;
        this.actionResult = actionResult;
        this.dropVector = dropVector;
    }
}

class ExceptionalOssificationResult {
    v: string;
    constructor(_v: string) {
        this.v = _v;
    }
    toString(): string {
        return this.v;
    }
    static MOOT              = new ExceptionalOssificationResult('moot');
    static FLUID             = new ExceptionalOssificationResult('fluid');
}

exports.transpose = transpose;
exports.Grid  = Grid;
exports.Point = Point;
exports.Brick = Brick;
exports.GridWithBrick = GridWithBrick;
exports.GridWithBrickAndActionResult = GridWithBrickAndActionResult;
exports.Vector = Vector;
exports.ExceptionalOssificationResult = ExceptionalOssificationResult;
