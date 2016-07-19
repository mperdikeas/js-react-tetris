'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';

const NBSP = '\u00A0';

function numberWithCommas(x) { // http://stackoverflow.com/a/2901298/274677
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

function padLeft(padCharacter, score) {
    const LENGTH = 8;
    const scoreS = numberWithCommas(score); // score.toString();

    const pad = Array(80).join(padCharacter);
    return pad.substring(0, LENGTH-scoreS.length)+scoreS;
}

const Score = React.createClass({
    propTypes: {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        score: React.PropTypes.number.isRequired,
        linesCleared: React.PropTypes.number.isRequired
    },    

    render: function() {
        let containerStyle = {
            position: 'relative',
            display: 'inline-block',
            width : this.props.width,
            height: this.props.height,
            verticalAlign: 'top'
        };
        let scoreStyle = {
            color: '#a0ff47',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: `${this.props.height/2*0.6}px`,
            padding: `${this.props.height/2*0.15}px`,
            textAlign: 'left',
            paddingLeft:`${this.props.height/2*0.3}px`
        };
        let scoreValueStyle = function(score) {
            if (score>=0)
                return {color: '#a0ff47'};
            else
                return {color: 'red'};
        };
        return (
            <div style={containerStyle}>
                <div style={scoreStyle}>Score: <span style={scoreValueStyle(this.props.score)}>{padLeft(NBSP, this.props.score)}</span></div>
                <div style={scoreStyle}>Lines: {padLeft(NBSP, this.props.linesCleared)}</div>                
            </div>                
        );
    }
});

export default Score;
