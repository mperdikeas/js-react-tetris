'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';

import Game from './game.js';

const App = React.createClass({
    render: function() {
        return (
                <Game x={10} y={20}>
                </Game>
        );
    }
});

export default App;

