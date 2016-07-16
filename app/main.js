const     _ = require('lodash');
const     $ = require('jquery');
import React    from 'react';
import ReactDOM from 'react-dom';
import App      from './app.js';

$(document).ready(doStuff);


function doStuff() {
    ReactDOM.render(<App/>
                    , $('#app')[0]);

}
