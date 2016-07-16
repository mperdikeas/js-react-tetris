'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';

import {CELL_SIDE, WELL_INFO_BORDER, GAME_BORDER} from './constants.js';
require('./help-screen.css');

const LoseScreen = React.createClass({
    propTypes: {
        wellWidth: React.PropTypes.number.isRequired,
        wellHeight: React.PropTypes.number.isRequired,
        newGame: React.PropTypes.func.isRequired
    },

    render: function() {
        const style={
            width: `${2*this.props.wellWidth*CELL_SIDE+4*WELL_INFO_BORDER+2*GAME_BORDER}px`,
            height: `${this.props.wellHeight*CELL_SIDE+2*WELL_INFO_BORDER+2*GAME_BORDER}px`,
            position: 'absolute',
            top: -GAME_BORDER,
            left: -GAME_BORDER,
            background: 'rgba(255, 0, 255, 0.8)',
            boxSizing: 'border-box',
            fontSize: `${CELL_SIDE*0.8}px`,
            fontWeight: 'bold',
            color: 'white',
            padding: '1em'
        };

        return (
                <div style={style}>
                <p>
                After fighting against impossible odds, you eventually succumb
                to the inevitable.
                </p>
                <button onClick={this.props.newGame}>Let's do it again!</button>
                </div>
        );
    }
});

export default LoseScreen;
