'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';


import {CELL_SIDE, WELL_INFO_BORDER} from './constants.js';
const {Brick} = require( '../modules/grid-brick/es5/index.js');
import {CellInfo}      from './cell-info.js';
import CellContainer      from './cell-container.js';
import Cell          from './cell.js';

const minimizationFactor = 1.6;
const cellSide = CELL_SIDE / minimizationFactor;
const border = 1;
const NextBricks = React.createClass({
    propTypes: {
        bricks: React.PropTypes.array.isRequired,
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired
    },
    createCellsForBrick(i, brick) {
        const cells = [];if (false)
        for (let point of brick.points) {
            cells.push(
                    <Cell key={ JSON.stringify({i: i, point: point})}
                x={ 1+i*3+point.x}
                    y={ 3+point.y}
                cellSide={Math.min( (this.props.y-2*border)/7
                                    , (this.props.x-2*border)/(4*3))}
                    v={brick.v}
                    waterLine={false}>
                        </Cell>
            );
        }if (true)
        for (let point of brick.points) {
            cells.push(new CellInfo(1+i*3+point.x,
                                    3+point.y,
                                    brick.v, false));
        }        
        return cells;
    },
    createCellsForAllBricks(nextBricks) {
        const cells = [];
        for (let i = 0 ;i < nextBricks.length ; i++) {
            Array.prototype.push.apply(cells, this.createCellsForBrick(i, nextBricks[i]));
        }
        return cells;
    },
    render: function(){
        const style={
            color: 'white',
            position: 'relative',
            padding: 0,
            margin: 0,
            width: `${this.props.x}px`,
            height: `${this.props.y}px`,
            borderBottom: `${border}px solid yellow`,
            boxSizing: 'border-box'
        };
        const cells = this.createCellsForAllBricks(this.props.bricks);
        const containerX = this.props.x - 2*border;
        const containerY = this.props.y - 2*border;
        return (
                <div style={style}>
                    <CellContainer cells={cells}
            widthCells    = {13}
            heightCells   = {4}
            widthPx       = {containerX}
            heightPx      = {containerY}
            paddingPx     = {10}>
                {cells}                
                </CellContainer>

                </div>
        );
    }
});

export default NextBricks;

