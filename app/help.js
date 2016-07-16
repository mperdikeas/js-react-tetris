'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';



const Help = React.createClass({
    propTypes: {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        showHelp: React.PropTypes.func.isRequired,
        hovered: React.PropTypes.bool.isRequired
    },

    render: function() {
        let style=() => {
            const base = {
                fontSize: `${this.props.height*0.5}px`,
                height: `${this.props.height}px`,
                fontWeight: 'bold',
                paddingTop: `${this.props.height*0.2}px`,
                paddingLeft: `${this.props.height*0.3}px`,
                boxSizing: 'border-box',
                cursor: 'help'
            };
            if (!this.props.hovered)
                return Object.assign({}, base,
                                     {
                                         backgroundColor: 'black',
                                         color: '#11b0ee'
                                     });
            else
                return Object.assign({}, base,
                                     {
                                         color: 'black',
                                         backgroundColor: '#11b0ee'
                                     });
        };
        return (
            <div style={style()} onClick={this.props.showHelp}>
                HELP
            </div>
        );
    }
});

export default Help;
