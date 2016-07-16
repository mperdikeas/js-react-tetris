import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {transpose, Grid, Point, Brick, GridWithBrick, ExceptionalOssificationResult} from '../es6/app.js';

describe('Point', function () {
    describe('rotate90Right', function () {
        it('should work'
           , function () {
               const p = new Point(1,3);
               const expected = new Point(-3, 1);
               assert(p.rotate90Right().equals(expected));
               assert(_.isEqual(p.rotate90Right(), expected));
           });     
    });
    describe('rotate90Left', function () {
        it('should work'
           , function () {
               const p = new Point(1,3);
               const expected = new Point(3, -1);
               assert(p.rotate90Left().equals(expected));
               assert(_.isEqual(p.rotate90Left(), expected));
           });     
    });
    describe('rotate90Left and rotate90Right', function () {
        it('should cancel each other out', function () {
            const p = new Point(Math.random()*10-5, Math.random()*10-5);
            const p2 = p.rotate90Right().rotate90Left();
            const p3 = p.rotate90Left().rotate90Right();
            assert(p2.equals(p));
            assert(_.isEqual(p, p2));
            assert(p3.equals(p));
            assert(_.isEqual(p, p3));
        });
        describe ('four of the kind is back where we started', function() {
            it('rotate90Right', function() {
                const p = new Point(Math.random()*10-5, Math.random()*10-5);
                const p2 = p.rotate90Right().rotate90Right().rotate90Right().rotate90Right();
                assert(p2.equals(p));
                assert(_.isEqual(p, p2));
            });
            it('rotate90Left', function() {
                const p = new Point(Math.random()*10-5, Math.random()*10-5);
                const p2 = p.rotate90Left().rotate90Left().rotate90Left().rotate90Left();
                assert(p2.equals(p));
                assert(_.isEqual(p, p2));
            });            
        });
    });
});

describe('Global functions', function() {
    describe('transpose', function () {
        it('should work', function() {
            const ar1 = [ [1,2,3], [4,5,6] ] ;
            const ar2 = [ [1,4], [2, 5], [3, 6] ];
            assert.deepEqual(transpose(ar1) , ar2);
            assert.deepEqual(transpose(ar2) , ar1); 
            assert.deepEqual(transpose(transpose(ar1)) , ar1);
            assert.deepEqual(transpose(transpose(ar2)) , ar2);
        });
    });
});

describe('Grid', function () {
    describe('constructor', function () {
        it('should not fail if occupied array contains reasonable values'
           , function () {
               new Grid([[2]]);
               new Grid([[1], [2]]);
               new Grid([[1,2,3], [2,3,4]]);
               new Grid([[1,2,3], [2,3,4], [5,6,6]]);
           });     
        it('should fail if occupied array contains unreasonable values'
           , function () {
               assert.throws(()=>{
                   new Grid([[], [1]]);
               });
               assert.throws(()=>{
                   new Grid([[1,2,3], [2,3,4], [5,6,,6]]);
               });
               assert.throws(()=>{
                   new Grid([[1,2,3], [2,3,4], [5,6,7,6]]);
               });               
               assert.throws(()=>{
                   new Grid([[1,2,3], [2,3,4], [3,2]]);
               });
               assert.throws(()=>{
                   new Grid([[1,2,,3]]);
               });               
           });
    });
    describe('clone', function () {
        it('should work #1'
           , function () {
               const g1 = new Grid([[2]]);
               const g2 = g1.clone();
               assert(g2.equal(g1));
               g2.occupied[0][0]=1;
               assert(!g2.equal(g1));
           });
        it('should work #2'
           , function () {
               const g1 = new Grid([[2,1,3],[3,4,4],[6,3,1]]);
               const g2 = g1.clone();
               assert(g2.equal(g1));
               g2.occupied[0][0]++;
               assert(!g2.equal(g1));
           });             

    });
    describe('deepestShaftIndex', function() {
        it('should work #1', function() {
            const g = new Grid([[null,null,null],[null,null,4],[3,null,1]]);
            assert(g.deepestShaftIndex()===0);
        });
        it('should work #2', function() {
            const g = new Grid([[null,null,null],[null,null,null],[null,null,1]]);
            for (let i = 0 ; i < 20; i++)
                assert( [0,1].includes(g.deepestShaftIndex()) );
        });        
    });
    describe('create', function() {
        it ('should not fail', function() {
            const g = Grid.create(2, 3);
            assert.deepEqual([[null, null, null], [null, null, null]], g.occupied);
        });
    });
    describe('fits', function() {
        it('should work #1', function() {
            const grid = new Grid([[0, 0, 0], [null, null, null], [0, 0, 0]]);
            const brick = new Brick([new Point(0,1), new Point(0,0), new Point(0, -1)], 0);
            for (let i = 0 ; i < 2; i++) {
                for (let j = 0 ; j < 2; j++) {
                    if (i==1)
                        assert(grid.fits(i, j, brick));
                    else
                        assert(!grid.fits(i, j, brick));
                }
            }
        });
        it('should work #2', function() {
            const grid = new Grid([[0, 0, 0], [0, null, 0], [0, 0, 0]]);
            const brick = new Brick([new Point(0,0)], 0);
            for (let i = 0 ; i < 2; i++) {
                for (let j = 0 ; j < 2; j++) {
                    if ((i==1) && (j==1))
                        assert(grid.fits(i, j, brick));
                    else
                        assert(!grid.fits(i, j, brick));
                }
            }
        });
        it('should work #3', function() {
            const grid = new Grid([[0, null, 0], [0, null, 0], [0, null, 0]]);
            const brickOriginal = new Brick([new Point(0,1), new Point(0,0), new Point(0, -1)], 0);
            const bricks = [brickOriginal.rotate90Right(), brickOriginal.rotate90Left()];
            for (let brick of bricks) {
                for (let i = 0 ; i < 2; i++) {
                    for (let j = 0 ; j < 2; j++) {
                        if ((i==1) && (j==1))
                            assert(grid.fits(i, j, brick));
                        else
                            assert(!grid.fits(i, j, brick));
                    }
                }
            }
        });
    });
    describe('isStuck', function() {
        it('should work #1', function() {
            const grid = new Grid([[null, null, null], [null, null, null], [0, 0, 0]]);
            const brick = new Brick([new Point(0,-1), new Point(0,0), new Point(0, 1)], 0);
            assert(!grid.isStuck(0, 0, brick));
            assert( grid.isStuck(0, 1, brick));
            assert( grid.isStuck(0, 2, brick));
            assert(!grid.isStuck(1, 0, brick));
            assert( grid.isStuck(1, 1, brick));
            assert( grid.isStuck(1, 2, brick));
            assert( grid.isStuck(2, 0, brick));
            assert( grid.isStuck(2, 1, brick));
            assert( grid.isStuck(2, 2, brick));            
        });
    });
});


         

describe('GridWithBrick', function () {
    describe('rotate90Right or rotate90Left', function () {
        it('should work #1'
           , function () {
               const fs = ['rotate90Right', 'rotate90Left'];
               for (let f of fs) {
                   const grid = new Grid([[null, null, null], [null, null, null], [null, null, null],]);
                   const brick = new Brick([new Point(0, -1), new Point(0, 0), new Point(0, 1)], 0);
                   const gridWithBrick = new GridWithBrick(grid, brick, new Point(1,1));
                   assert.equal(gridWithBrick.toString(),
`.-0-.
.-0-.
.-0-.`);
                   const gridWithBrickAndActionResult = gridWithBrick[f]();
                   assert(gridWithBrickAndActionResult.actionResult);
                   assert.equal(gridWithBrickAndActionResult.gridWithBrick.toString(),
`.-.-.
0-0-0
.-.-.`);
               }
           });     
        it('should work #2'
           , function () {
               const fs = ['rotate90Right', 'rotate90Left'];
               for (let f of fs) {               
                   const grid = new Grid([[null, 1, null], [null, null, null], [null, null, null],]);
                   const brick = new Brick([new Point(0, -1), new Point(0, 0), new Point(0, 1)], 0);
                   const gridWithBrick = new GridWithBrick(grid, brick, new Point(1,1));
                   assert.equal(gridWithBrick.toString(),
`.-0-.
1-0-.
.-0-.`);
                   const gridWithBrickAndActionResult = gridWithBrick.rotate90Right();
                   assert(!gridWithBrickAndActionResult.actionResult);
                   assert.equal(gridWithBrickAndActionResult.gridWithBrick.toString(), gridWithBrick.toString());
               }
           });
        it('should work #3'
           , function () {
               const grid = new Grid([[null, null, null], [null, null, null], [null, null, null],]);
               const brick = new Brick([new Point(0, -1), new Point(1, -1), new Point(0, 0), new Point(0, 1)], 0);
               const gridWithBrick = new GridWithBrick(grid, brick, new Point(1,1));
               assert.equal(gridWithBrick.toString(),
`.-0-0
.-0-.
.-0-.`);
               const gridWithBrickAndActionResult = gridWithBrick.rotate90Right();
               assert(gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrickAndActionResult.gridWithBrick.toString(),
`.-.-.
0-0-0
.-.-0`);
           });
        it('should work #4'
           , function () {
               const grid = new Grid([[null, null, null], [null, null, null], [null, null, null],]);
               const brick = new Brick([new Point(0, -1), new Point(1, -1), new Point(0, 0), new Point(0, 1)], 0);
               const gridWithBrick = new GridWithBrick(grid, brick, new Point(1,0));
               assert.equal(gridWithBrick.toString(),
`.-0-.
.-0-.
.-.-.`);
               const gridWithBrickAndActionResult = gridWithBrick.rotate90Right();
               assert(gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrickAndActionResult.gridWithBrick.toString(),
`0-0-0
.-.-0
.-.-.`);
           });                     
    });

    describe('rotations of well-known bricks with non-default pivots', function () {
        describe('SQUARE', function() {
        it('should work',
           function () {
               const fs = ['rotate90Right', 'rotate90Left'];
               for (let f of fs) {
                   const grid = Grid.create(3,3);
                   const brick = Brick.createSquare(3);
                   const images = [
`3-3-.
.-.-.
.-.-.`,                       
`3-3-.
3-3-.
.-.-.`,
`3-3-.
3-3-.
.-.-.`,
`3-3-.
3-3-.
.-.-.`,
`3-3-.
3-3-.
.-.-.`];                                                     
                   const transformations = Array(images.length-1).fill(f);
                   transformations[0]='lower';
                   const gridWithBrick = new GridWithBrick(grid, brick, new Point(0,0));
                   assertSeriesOfTransformations(gridWithBrick, transformations, images);
               }
           });
        });
        describe('BRACKET', function() {
            it('should work on right turns'
               , function () {
                   const grid = Grid.create(3,3);
                   const brick = Brick.createBracket(3);
                   const gridWithBrick = new GridWithBrick(grid, brick, new Point(0,0));
                   const images = [
`3-.-.
.-.-.
.-.-.`,                       
`3-3-.
3-.-.
.-.-.`,
`3-3-.
.-3-.
.-.-.`,
`.-3-.
3-3-.
.-.-.`,
`3-.-.
3-3-.
.-.-.`,
`3-3-.
3-.-.
.-.-.`,
`3-3-.
.-3-.
.-.-.`
                   ];
                   const transformations = Array(images.length-1).fill('rotate90Right');
                   transformations[0]='lower';
                   assertSeriesOfTransformations(gridWithBrick, transformations, images);               
               });
            it('should work on left turns'
               , function () {
                   const grid = Grid.create(3,3);
                   const brick = Brick.createBracket(3);
                   const gridWithBrick = new GridWithBrick(grid, brick, new Point(0,0));
const images = [
`3-.-.
.-.-.
.-.-.`,                       
`3-3-.
3-.-.
.-.-.`,
`3-.-.
3-3-.
.-.-.`,
`.-3-.
3-3-.
.-.-.`,
`3-3-.
.-3-.
.-.-.`,
`3-3-.
3-.-.
.-.-.`,
`3-.-.
3-3-.
.-.-.`];
                   const transformations = Array(images.length-1).fill('rotate90Left');
                   transformations[0]='lower';
                   assertSeriesOfTransformations(gridWithBrick, transformations, images);
               });
            it('should work on left turns on other points too'
               , function () {
                   const grid = Grid.create(3,3);
                   const brick = Brick.createBracket(3);
                   const gridWithBrick = new GridWithBrick(grid, brick, new Point(1,0));
const images = [
`.-3-.
.-.-.
.-.-.`,
`.-3-3
.-3-.
.-.-.`,
`.-3-.
.-3-3
.-.-.`,
`.-.-3
.-3-3
.-.-.`,
`.-3-3
.-.-3
.-.-.`,
`.-3-3
.-3-.
.-.-.`
];
                   const transformations = Array(images.length-1).fill('rotate90Left');
                   transformations[0]='lower';
                   assertSeriesOfTransformations(gridWithBrick, transformations, images);
               });            
        });

        describe('RAFTER', function() {
            it('right turn should work'
               , function () {
                   const grid = Grid.create(5,5);
                   const brick = Brick.createRafter(3);
                   const gridWithBrick = new GridWithBrick(grid, brick, new Point(2,0));
                   const images = [
`.-.-3-.-.
.-.-.-.-.
.-.-.-.-.
.-.-.-.-.
.-.-.-.-.`,
`.-.-3-.-.
.-.-3-.-.
.-.-.-.-.
.-.-.-.-.
.-.-.-.-.`,
`.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-.-.-.
.-.-.-.-.`,
`.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-.-.-.`,
`.-.-.-.-.
.-.-.-.-.
.-3-3-3-3
.-.-.-.-.
.-.-.-.-.`,
`.-.-.-.-.
.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-3-.-.`,
`.-.-.-.-.
.-.-.-.-.
3-3-3-3-.
.-.-.-.-.
.-.-.-.-.`,
`.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-.-.-.`,
`.-.-.-.-.
.-.-.-.-.
.-3-3-3-3
.-.-.-.-.
.-.-.-.-.`                       
];
                   const transformations = Array(images.length-1).fill('rotate90Right');
                   transformations[0]='lower';
                   transformations[1]='lower';
                   transformations[2]='lower';
                   let latestGridWithBrick = assertSeriesOfTransformations(gridWithBrick, transformations, images);
               });
            it('left turn should work'
               , function () {
                   const grid = Grid.create(5,5);
                   const brick = Brick.createRafter(3);
                   const gridWithBrick = new GridWithBrick(grid, brick, new Point(2,0));
                   const images = [
`.-.-3-.-.
.-.-.-.-.
.-.-.-.-.
.-.-.-.-.
.-.-.-.-.`,
`.-.-3-.-.
.-.-3-.-.
.-.-.-.-.
.-.-.-.-.
.-.-.-.-.`,
`.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-.-.-.
.-.-.-.-.`,
`.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-.-.-.`,
`.-.-.-.-.
.-.-.-.-.
3-3-3-3-.
.-.-.-.-.
.-.-.-.-.`,
`.-.-.-.-.
.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-3-.-.`,
`.-.-.-.-.
.-.-.-.-.
.-3-3-3-3
.-.-.-.-.
.-.-.-.-.`,
`.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-3-.-.
.-.-.-.-.`,
`.-.-.-.-.
.-.-.-.-.
3-3-3-3-.
.-.-.-.-.
.-.-.-.-.`                       
];
                   const transformations = Array(images.length-1).fill('rotate90Left');
                   transformations[0]='lower';
                   transformations[1]='lower';
                   transformations[2]='lower';
                   let latestGridWithBrick = assertSeriesOfTransformations(gridWithBrick, transformations, images);
               });            
        });
    });

    describe('lower', function () {
        it('should work #1'
           , function () {
               const grid = new Grid([[null, null, null], [null, null, null], [null, null, null],]);
               const brick = new Brick([new Point(-1, 0), new Point(0, 0), new Point(1, 0)], 2);
               let gridWithBrick = new GridWithBrick(grid, brick, new Point(1,0));
               assert.equal(gridWithBrick.toString(),
`2-2-2
.-.-.
.-.-.`);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.FLUID);
               
               let gridWithBrickAndActionResult = gridWithBrick.lower();
               assert(gridWithBrickAndActionResult.actionResult);
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert.equal(gridWithBrick.toString(),
`.-.-.
2-2-2
.-.-.`);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.FLUID);
               gridWithBrickAndActionResult = gridWithBrick.lower();
               assert(gridWithBrickAndActionResult.actionResult);
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert.equal(gridWithBrick.toString(),
`.-.-.
.-.-.
2-2-2`);
               gridWithBrickAndActionResult = gridWithBrick.lower();
               assert(!gridWithBrickAndActionResult.actionResult);
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert.equal(gridWithBrick.toString(),
`.-.-.
.-.-.
2-2-2`);                              

               assert(gridWithBrick.brick);
               gridWithBrick = gridWithBrick.ossify();
               assert(gridWithBrick.brick===null);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.MOOT);
           });
        it('should work #2'
           , function () {
               const grid = new Grid([[null, null, null, null], [null, null, null, 1], [null, null, null, null],[0, 0, 0, 0]]);
               const brick = new Brick([new Point(-1, 0), new Point(0, 0), new Point(1, 0)], 2);
               let gridWithBrick = new GridWithBrick(grid, brick, new Point(1,0));
               assert.equal(gridWithBrick.toString(),
`2-2-2-0
.-.-.-0
.-.-.-0
.-1-.-0`);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.FLUID);
               let gridWithBrickAndActionResult = gridWithBrick.lower();
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert(gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrick.toString(),
`.-.-.-0
2-2-2-0
.-.-.-0
.-1-.-0`);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.FLUID);
               gridWithBrickAndActionResult = gridWithBrick.lower();
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert(gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrick.toString(),
`.-.-.-0
.-.-.-0
2-2-2-0
.-1-.-0`);
               gridWithBrickAndActionResult = gridWithBrick.lower();
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert(!gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrick.toString(),
`.-.-.-0
.-.-.-0
2-2-2-0
.-1-.-0`);

               assert(gridWithBrick.brick);
               gridWithBrick = gridWithBrick.ossify();
               assert(gridWithBrick.brick===null);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.MOOT);
           });
        it('should work #3'
           , function () {
               const grid = new Grid([[null, null, null, null], [null, null, null, 1], [null, null, null, null],[0, 0, 0, 0]]);
               const brick = new Brick([new Point(-1, 0), new Point(-1, 1), new Point(0, 0), new Point(1, 0), new Point(1,1)], 2);
               let gridWithBrick = new GridWithBrick(grid, brick, new Point(1,0));
               assert.equal(gridWithBrick.toString(),
`2-2-2-0
2-.-2-0
.-.-.-0
.-1-.-0`);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.FLUID);
               let gridWithBrickAndActionResult = gridWithBrick.lower();
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert(gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrick.toString(),
`.-.-.-0
2-2-2-0
2-.-2-0
.-1-.-0`);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.FLUID);
               gridWithBrickAndActionResult = gridWithBrick.lower();
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert(gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrick.toString(),
`.-.-.-0
.-.-.-0
2-2-2-0
2-1-2-0`);
               gridWithBrickAndActionResult = gridWithBrick.lower();
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert(!gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrick.toString(),
`.-.-.-0
.-.-.-0
2-2-2-0
2-1-2-0`);
               assert(gridWithBrick.brick);
               gridWithBrick = gridWithBrick.ossify();
               assert(gridWithBrick.brick===null);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.MOOT);
           });

       it('should work #4'
           , function () {
               const grid = new Grid([[null, null, null, null], [null, null, 1, 1], [null, null, null, null],[0, 0, 0, 0]]);
               const brick = Brick.createRafter(9);
               let gridWithBrick = new GridWithBrick(grid, brick, new Point(1,0));
               assert.equal(gridWithBrick.toString(),
`.-9-.-0
.-.-.-0
.-1-.-0
.-1-.-0`);
               assert(gridWithBrick.ossify()===ExceptionalOssificationResult.FLUID);

               let gridWithBrickAndActionResult = gridWithBrick.lower();
               gridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
               assert(gridWithBrickAndActionResult.actionResult);
               assert.equal(gridWithBrick.toString(),
`.-9-.-0
.-9-.-0
.-1-.-0
.-1-.-0`);
           });        
    });
});


function assertSeriesOfTransformations(gridWithBrick, _transformations, images) {
    assert(Array.isArray(images));
    let transformations;
    if (Array.isArray(_transformations)) {
        transformations = _transformations;
    } else {
        transformations = Array(images.length-1).fill(_transformations);
    }
    assert(images.length === transformations.length+1);
    let currentGridWithBrick = gridWithBrick;
    assert.equal(currentGridWithBrick.toString(), images[0]);
    for (let i = 1 ; i < images.length ; i++) {
        const gridWithBrickAndActionResult = currentGridWithBrick[transformations[i-1]]();
        assert(gridWithBrickAndActionResult.actionResult);
        currentGridWithBrick = gridWithBrickAndActionResult.gridWithBrick;
        assert.equal(currentGridWithBrick.toString(), images[i]);
    }
    return currentGridWithBrick;
}
