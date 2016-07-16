'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';

import {CELL_SIDE, WELL_INFO_BORDER, GAME_BORDER} from './constants.js';
require('./help-screen.css');

const HelpScreen = React.createClass({
    propTypes: {
        wellWidth: React.PropTypes.number.isRequired,
        wellHeight: React.PropTypes.number.isRequired,
        dismissHelp: React.PropTypes.func.isRequired
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
                To play the game you use the following keys:
                <dl>
                <dt><span className='key'>J</span></dt><dd>move brick left</dd>
                <dt><span className='key'>K</span></dt><dd>rotate brick left-wise</dd>
                <dt><span className='key'>L</span></dt><dd>rotate brick right-wise</dd>
                <dt><span className='key'>;</span></dt><dd>move brick right</dd>
                <br/>
                <dt><span className='key'>SpaceBar</span></dt><dd>drop brick (drop height is rewarded)</dd>
                </dl>
                </p>
                <button onClick={this.props.dismissHelp}>Got that!</button>
                </div>
        );
    }
});

export default HelpScreen;
