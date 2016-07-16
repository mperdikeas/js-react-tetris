'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';

import TimerMixin    from 'react-timer-mixin';
import keycode       from 'keycode';
import {Howl}        from 'howler';

import Cell          from './cell.js';
import {DropVector}  from './dropvector.js';
const {Point, Brick, Grid, GridWithBrick, Vector, ExceptionalOssificationResult} = require( '../modules/grid-brick/es5/index.js');

import {sound} from './sounds.js';
import {TestGround} from './testGround.js';
import {CELL_SIDE, WELL_INFO_BORDER, GAME_BORDER} from './constants.js';
import NextBricks from './nextBricks.js';
import {CellInfo} from './cell-info.js';
import CellContainer from './cell-container.js';
import ArrowBand from './arrowband.js';
import Score from './score.js';
import Help from './help.js';
import HelpContainer from './help-container.js';
import Messages from './messages.js';
import Message  from './message.js';
import {scoringTable} from './scoring-table.js';
import GameState from './game-state.js';
import HelpScreen from './help-screen.js';
import LoseScreen from './lose-screen.js';


function addMessage(messages, message) {
    const rv = messages.slice();
    rv.unshift(message);
    if (rv.length > 7)
        rv.splice(-1, 1);
    return rv;
}

const Game = React.createClass({
    propTypes: {
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired
    },
    getInitialState: function() {
        const grid = Grid.create(this.props.x, this.props.y);
        return {
            gameState: GameState.RUNNING,
            gameGrid : new GridWithBrick.createEmpty(grid),
            flash: [],
            highlighted: -1,
            nextBricks: [Brick.randomBrick(), Brick.randomBrick(), Brick.randomBrick(), Brick.randomBrick()],
            dropVector: null,
            lowerEveryMs: 250,
            waterLine: Brick.MAX_BRICK_HEIGHT+1,
            score: 0,
            linesCleared: 0,
            messages: []
        };
    },
    mixins: [TimerMixin],
    handleKeyboard(event) {
        switch (event.keyCode) {
        case keycode('k'): this.rotate90Left();break;
        case keycode('l'): this.rotate90Right();break;
        case keycode('j'): this.moveLeft();break;            
        case keycode(';'): this.moveRight();break;
        case keycode('space'):
            if (this.state.gameGrid.brick)
                this.drop();
            break;
        }
        event.stopPropagation();
        event.preventDefault();
    },
    rotate90Left() {
        if ((this.state.gameGrid.brick!==null) && (!this.state.gameGrid.brickFullyInsideGrid()))
            sound.notAllowed();
        else
            this.coreSimpleAction('rotate90Left');
    },
    rotate90Right() {
        if ((this.state.gameGrid.brick!==null) && (!this.state.gameGrid.brickFullyInsideGrid()))
            sound.notAllowed();
        else
            this.coreSimpleAction('rotate90Right');        
    },
    moveLeft() {
        this.coreSimpleAction('moveLeft');
    },
    moveRight() {
        this.coreSimpleAction('moveRight');
    },
    coreSimpleAction(method) {
        const {gridWithBrick, actionResult} = this.state.gameGrid[method]();
        if (!actionResult) {
            this.setState({score: this.state.score+scoringTable.brickScraped,
                           messages: addMessage(this.state.messages,
                                                new Message(scoringTable.brickScraped,
                                                            `penalty for scraping brick`))});
            sound.notAllowed();
        } else {
            sound.done();
            this.setState({gameGrid: gridWithBrick});
        }
    },
    drop() {
        const {gridWithBrick, actionResult, dropVector} = this.state.gameGrid.drop();
        assert(dropVector.isVertical());
        const dropN = Math.ceil(dropVector.verticalDrop());
        let bonusState = {};
        if (dropN >= scoringTable.shortestDrop) {
            sound.swooshAndThud(dropN);
            const dropBonusAndAdjective = scoringTable.dropBonusFunction(dropN);
            bonusState = (()=> {
                if (dropBonusAndAdjective!==null) {
                    const scoreDelta = dropBonusAndAdjective.bonus;
                    return {score: this.state.score+scoreDelta,
                            messages: addMessage(this.state.messages,
                                                 new Message(scoreDelta,
                                                             `${dropBonusAndAdjective.adjective} drop of ${dropN} squares`))}
                } else
                    return {};
            })();
        } else
            sound.drop(0);
        const baseState = {gameGrid: gridWithBrick};
        const effectiveState = Object.assign({}, baseState, bonusState);
        if (actionResult) {
            this.setState(effectiveState);
            this.flashDropVector(dropVector);
        } else {
            sound.notAllowed();
        }
    },
    flashDropVector(dropVector) {
        const states = [];
        states.push({dropVector: dropVector});
        states.push({dropVector: null});
        this.executeStateTransitionPath(states, 1000);
    },
    lower() {
        this.setState({gameGrid: this.state.gameGrid.lower().gridWithBrick});            
    },    
    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyboard);
        const intervalId = this.setInterval(
            () => {
                this.nextGameStep();
            }
            ,this.state.lowerEveryMs
        );
        this.setState({intervalId: intervalId});
    },    
    createCellsInfo: function() {
        const cells = [];
        for (let i = 0 ; i < this.props.x ;i++) {
            for (let j = 0 ; j < this.props.y; j++) {
                let v = this.state.gameGrid.stuffInCoords(i, j);
                if (this.state.flash.includes(j))
                    v = Cell.flash(v);
                const waterLine = this.state.waterLine===j;
                cells.push(new CellInfo(i, j, v, waterLine));
            }
        }
        return cells;
    },    
    executeStateTransitionPath(states, interval, fToCallAtTheEnd) {
        this.inTheMiddleOfTransition = true;
        this._executeStateTransitionPath(states, interval, fToCallAtTheEnd);
    },
    _executeStateTransitionPath(states, interval, fToCallAtTheEnd) {
        console.log(`transition to state: ${JSON.stringify(states[0])}`);
        this.setState(states[0]);
        if (states.length > 1)
            this.setTimeout( ()=>{
                this._executeStateTransitionPath(states.slice(1), interval, fToCallAtTheEnd);
            }, interval);
        else {
            if (fToCallAtTheEnd) fToCallAtTheEnd();
            this.inTheMiddleOfTransition = false;
        }
    },
    showHelp() {
        assert(this.state.gameState === GameState.RUNNING);
        this.setState({gameState: GameState.HELP});
    },
    dismissHelp() {
        assert(this.state.gameState === GameState.HELP);        
        this.setState({gameState: GameState.RUNNING});
    },
    newGame() {
        console.log('new game called');
        assert(this.state.gameState === GameState.LOST);
        this.inTheMiddleOfNextStep = false;
        this.inTheMiddleOfTransition = false;
        this.setState(this.getInitialState());
    },
    nextGameStep: function() {
        if (this.state.gameState!==GameState.RUNNING)
            return;
        if (this.inTheMiddleOfNextStep) {
            console.log('aborting because in the middle of next step');
            return;
        }
        if (this.inTheMiddleOfTransition) {
            console.log('aborting because in the middle of transition');
            return;
        }
        this.inTheMiddleOfNextStep = true;
        if (!this.state.gameGrid.brick) {
            const brick = this.state.nextBricks[0];
            const newNextBricks = this.state.nextBricks.slice(1);
            {
                const states = [];
                states.push({highlighted: 3});
                states.push({highlighted: 2});
                states.push({highlighted: 1});
                states.push({highlighted: 0});
                states.push({highlighted: -1});
                this.executeStateTransitionPath(states, 10, ()=> {
                    newNextBricks.push(Brick.randomBrick());
                    const gridWithBrick = this.state.gameGrid.introduceNewBrick(brick);
                    this.setState({gameGrid: gridWithBrick, nextBricks: newNextBricks});
                });
            }
            this.inTheMiddleOfNextStep = false;
            return;
        } else {
            const ossificationResult = this.state.gameGrid.ossify();
            if (ossificationResult instanceof GridWithBrick) {
                assert(ossificationResult.brick === null);
                const lowestShaft = this.state.gameGrid.grid.lowestDepth();
                if (lowestShaft<this.state.waterLine)
                    this.setState({gameState: GameState.LOST});
                else {
                    const horizontalFills = this.state.gameGrid.grid.horizontalFills();
                    if (horizontalFills.length === 0)
                        this.setState({gameGrid: ossificationResult});
                    else {
                        const states = [];
                        states.push({gameGrid: ossificationResult});
                        const horizontalFills = this.state.gameGrid.grid.horizontalFills();
                        assert(horizontalFills.length<=4, `Expected horizontal fills to be <=4, yet it was: ${horizontalFills.length}`);
                        console.log(`${horizontalFills.length} horizontal fills found`);
                        if (horizontalFills.length > 0) {
                            states.push({flash: horizontalFills});
                            states.push({flash: []});
                            states.push({flash: horizontalFills});
                            states.push({flash: []});
                            states.push({flash: horizontalFills});
                            states.push({flash: []});
                            states.push({gameGrid: ossificationResult.removeHorizontalFills()});
                        }
                        this.executeStateTransitionPath(states, 40, ()=>{
                            const scoreDelta = horizontalFills.length*scoringTable.eachLine;
                            sound.cashRegister(horizontalFills.length);
                            this.setState({score: this.state.score+scoreDelta,
                                           messages: addMessage(this.state.messages,
                                                                new Message(scoreDelta,
                                                                            `${horizontalFills.length} lines cleared`)),
                                           linesCleared: this.state.linesCleared+horizontalFills.length});
                            if (horizontalFills.length>1) {
                                    
                                const lineBonus = scoringTable.bonusForLineClearance(horizontalFills.length);
                            this.setState({score: this.state.score+lineBonus,
                                           messages: addMessage(this.state.messages,
                                                                new Message(lineBonus,
                                                                            `${horizontalFills.length} line simultaneous clearence bonus`))});
                            }
                        });
                        sound.annihilate(horizontalFills.length);
                    }
                }
            } else {
                assert(ossificationResult instanceof ExceptionalOssificationResult);
                switch (ossificationResult) {
                case ExceptionalOssificationResult.MOOT:
                    throw new Error('impossible');
                    break;
                case ExceptionalOssificationResult.FLUID:
                    const gridWithBrickAndActionResult = this.state.gameGrid.lower();
                    assert(gridWithBrickAndActionResult.actionResult);
                    if (gridWithBrickAndActionResult.gridWithBrick.isStuck())
                        sound.drop(0);
                    this.setState({gameGrid: gridWithBrickAndActionResult.gridWithBrick});
                    break;
                default:
                    throw new Error(ossificationResult);
                }
            }
        }
        this.inTheMiddleOfNextStep = false;
    },
    render: function() {
            const cells = this.createCellsInfo();
            let dropVector = null;
            if (this.state.dropVector) {
                dropVector = <DropVector vector={this.state.dropVector}/>;
            }
            const testGround = (<TestGround></TestGround>);
            const gameStyle = {
                border: `${GAME_BORDER}px solid black`,
                position: 'relative',
                width: `${2*this.props.x*CELL_SIDE+4*WELL_INFO_BORDER}px`,
                height: `${this.props.y*CELL_SIDE+2*WELL_INFO_BORDER}px`,
                margin: 0,
                padding: 0
            };
            const wellStyle={border: `${WELL_INFO_BORDER}px solid yellow`,
                             display: 'inline-block',
                             position: 'relative',
                             float: 'left',
                             padding: 0,
                             margin: 0,
                             width: `${this.props.x*CELL_SIDE}`,
                             height: `${this.props.y*CELL_SIDE}`
                             };
            const infoStyle={border: `${WELL_INFO_BORDER}px solid yellow`,
                             display: 'inline-block',
                             float: 'left',                             
                             padding: 0,
                             margin: 0,
                             width: `${this.props.x*CELL_SIDE}`,
                             height: `${this.props.y*CELL_SIDE}`,
                             background: 'black'};
            const scoreHelpStyle = {
                borderBottom: '1px solid yellow',
                padding: 0,
                margin: 0,
                height: 2*CELL_SIDE
            };
            let help=null;
            if (this.state.gameState === GameState.HELP)
                help=(<HelpScreen
                      wellWidth={this.props.x}
                      wellHeight={this.props.y}
                      dismissHelp={this.dismissHelp}
                      />);
            let lose = null;
            if (this.state.gameState === GameState.LOST)
                lose = (<LoseScreen
                      wellWidth={this.props.x}
                      wellHeight={this.props.y}
                      newGame={this.newGame}
                      />);
            return (
                    <div style={gameStyle}>
                    <h1>No more maintained, a dedicated <a href='https://github.com/mperdikeas/js-react-tetris'>github repo</a> has been created for future development!</h1>
                <div style={wellStyle}>                    
                    <CellContainer
                        cells={cells}
                        widthCells    = {this.props.x}
                        heightCells   = {this.props.y}
                        widthPx       = {this.props.x*CELL_SIDE}
                        heightPx      = {this.props.y*CELL_SIDE}
                        paddingPx     = {0}>
                    </CellContainer>
                    {dropVector}
                </div>
                <div style={infoStyle}>
                    <ArrowBand
                        width={this.props.x*CELL_SIDE}
                        height={1*CELL_SIDE}
                        highlighted={this.state.highlighted}/>       
                    <NextBricks
                        bricks={this.state.nextBricks}
                        x={this.props.x*CELL_SIDE}
                        y={4*CELL_SIDE}
                    />
                    <div style={scoreHelpStyle}>
                        <Score
                            width={(this.props.x-4)*CELL_SIDE}
                            height={2*CELL_SIDE}
                            score={this.state.score}
                            linesCleared={this.state.linesCleared}
                        />
                        <HelpContainer
                            width={4*CELL_SIDE}
                            height={2*CELL_SIDE}
                            showHelp={this.showHelp}
                        />
                    </div>
                    <Messages
                        width={this.props.x*CELL_SIDE}
                        height={10*CELL_SIDE}
                        messages={this.state.messages}
                    />
                </div>
                {help}
                {lose}
                </div>
            );
    }
});
 
export default Game;

