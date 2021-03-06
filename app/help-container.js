'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';
import Help from './help.js';


const HelpContainer = React.createClass({
    propTypes: {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        showHelp: React.PropTypes.func.isRequired
    },
    getInitialState: function () {
        return {hovered: false};
    },
    onMouseEnter: function() {
        this.setState({hovered: true});
    },
    onMouseLeave: function() {
        this.setState({hovered: false});
    },
    render: function() {
        let containerStyle = {
            position: 'relative',
            display: 'inline-block',
            width : this.props.width,
            height: this.props.height,
            padding: 0,
            verticalAlign: 'top'
        };
        return (
            <div style={containerStyle}
                 onMouseEnter={this.onMouseEnter}
                  onMouseLeave={this.onMouseLeave}
            >
                <Help width={this.props.width}
                      height={this.props.height}
                      showHelp={this.props.showHelp}
                      hovered={this.state.hovered}
                 />
            </div>                
        );
    }
});

export default HelpContainer;
