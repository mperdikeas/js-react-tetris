'use strict';

const React = require('react');


require('./testGround.css');
import {sound} from './sounds.js';

const TestGround = React.createClass({
    render: function() {
        const testGround={position: 'fixed', background: 'red', top: '300px', left: '300px'};        
        return (
                <div id='test' style={testGround}>
                    <button onClick={function(){sound.cashRegister(1);}}>cashRegister-1</button>
                    <button onClick={function(){sound.cashRegister(2);}}>cashRegister-1</button>
                    <button onClick={function(){sound.cashRegister(3);}}>cashRegister-1</button>
                    <button onClick={function(){sound.cashRegister(4);}}>cashRegister-1</button>
                </div>
        );
    }
});


exports.TestGround = TestGround;
