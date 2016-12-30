/* @flow */
'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';

import {CELL_SIDE, WELL_INFO_BORDER, GAME_BORDER} from './constants.js';
require('./help-screen.css');

const scores=[{n: 100, desc: 'pathetic'},
              {n: 200, desc: 'miserable'},
              {n: 500, desc: 'paltry'},
              {n: 1000, desc: 'meager'},
              {n: 2000, desc: 'unremarkable'},
              {n: 3000, desc: 'commendable'},
              {n: 4000, desc: 'respectable'},
              {n: 5000, desc: 'notable'},
              {n: 6000, desc: 'memorable'},
              {n: 7000, desc: 'remarkable'},
              {n: 8000, desc: 'outstanding'},
              {n: 9000, desc: 'exceptional'},
              {n: 10000, desc: 'impressive'},
              {n: 13000, desc: 'magnificent'},
              {n: 16000, desc: 'phenomenal'},
              {n: 19000, desc: 'heroic'},
              {n: Infinity, desc: 'epic'}];

function scoreAdjective(n: number): string {
    let i = 0;
    for ( ; i < scores.length ; i++)
        if (scores[i].n > n)
            break;
    return scores[i].desc;
}

const LoseScreen = React.createClass({
    propTypes: {
        wellWidth: React.PropTypes.number.isRequired,
        wellHeight: React.PropTypes.number.isRequired,
        score: React.PropTypes.number.isRequired,
        linesCleared: React.PropTypes.number.isRequired,
        newGame: React.PropTypes.func.isRequired
    },

    render: function() {
        const style={
            width: `${2*this.props.wellWidth*CELL_SIDE+4*WELL_INFO_BORDER+2*GAME_BORDER}px`,
            height: `${this.props.wellHeight*CELL_SIDE+2*WELL_INFO_BORDER+2*GAME_BORDER}px`,
            position: 'absolute',
            top: -GAME_BORDER,
            left: -GAME_BORDER,
            background: 'rgba(255, 0, 255, 0.85)',
            boxSizing: 'border-box',
            fontSize: `${CELL_SIDE*0.8}px`,
            fontWeight: 'bold',
            color: 'white',
            padding: '1em'
        };
        const numberStyle = {fontWeight: 'bold', fontFamily: 'monospace', color: 'navy'};
        return (
                <div style={style}>
                <p>
                After fighting against impossible odds, you eventually succumb
                to the inevitable.
                </p>
                <p>
                    You cleared
                &nbsp;<span style={numberStyle}>{this.props.linesCleared}</span>&nbsp;
                    lines
                </p>
                <p>
                    Your score was a {scoreAdjective(this.props.score)}
                &nbsp;<span style={numberStyle}>{this.props.score}</span>&nbsp;
                </p>
                <button onClick={this.props.newGame}>Let's do it again!</button>
                </div>
        );
    }
});

export default LoseScreen;
