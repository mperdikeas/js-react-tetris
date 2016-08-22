//@flow
'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';




const ArrowBand = React.createClass({
    propTypes: {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        highlighted: React.PropTypes.number.isRequired
    },    
    arrowDownStyle: function (i: number): {display: string, width: number, height: number, borderRight: string, borderTop: string, borderBottom: string, margin: string} {
        if (!( (i>=-1) && (i<4) )) throw new Error(`${i} has to lie in [0, 4)`);
        //  highlighted value of -1 means no arrow is highlighted
        const color = i===this.props.highlighted?'#5cfa00':'#1c4d00'; // http://hslpicker.com/
        const numOfArrows =  4;
        const marginHoriz = 10;
        const marginVert  =  2;
        const arrowLength = (this.props.width-(numOfArrows+numOfArrows-2)*marginHoriz)/(numOfArrows);
        const arrowHeight = (this.props.height-2*marginVert)/2;
        return {
            display: 'inline-block',
            width: 0,
            height: 0,
            borderRight: `${arrowLength}px solid ${color}`,
            borderTop: `${arrowHeight}px solid transparent`,
            borderBottom: `${arrowHeight}px solid transparent`,
            margin: `${marginVert}px ${marginHoriz}px ${marginHoriz}px ${marginVert}px`
        };
    },
    render: function() {
        let containerStyle = {
            position: 'relative',
            width : this.props.width,
            height: this.props.height
        };
        return (
            <div style={containerStyle}>
                <div style={this.arrowDownStyle(0)}/>
                <div style={this.arrowDownStyle(1)}/>
                <div style={this.arrowDownStyle(2)}/>
                <div style={this.arrowDownStyle(3)}/>                
            </div>                
        );
    }
});

export default ArrowBand;
