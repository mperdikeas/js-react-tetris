//@flow
'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');

import tinycolor from "tinycolor2";

import assert from 'assert';

function rainbow(numOfSteps: number, step: number): string { // http://stackoverflow.com/a/7419630/274677
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r: ?number, g:?number, b:?number;
    var h: number = step / numOfSteps;
    var i: number = ~~(h * 6);
    var f: number = h * 6 - i;
    var q: number = 1 - f;
    switch(i % 6){
    case 0: r = 1; g = f; b = 0; break;
    case 1: r = q; g = 1; b = 0; break;
    case 2: r = 0; g = 1; b = f; break;
    case 3: r = 0; g = q; b = 1; break;
    case 4: r = f; g = 0; b = 1; break;
    case 5: r = 1; g = 0; b = q; break;
    }
    if (r!=null) {
        if (g!=null) {
            if (b!=null) {
                var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
            } else {
                throw new Error('impossible that b==null');
            }
        } else {
            throw new Error('impossible that g==null');
        }
    } else {
        throw new Error('impossible that r==null');
    }
    return (c);
}

const hsvToRgb = function (h,s,v) { // https://github.com/sterlingwes/RandomColor/blob/master/rcolor.js
                                    // http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
    var h_i= Math.floor(h*6),
    f = h*6 - h_i,
    p= v * (1-s),
    q= v * (1-f*s),
    t= v * (1-(1-f)*s),
    r= 255,
    g= 255,
    b= 255;
    switch(h_i) {
    case 0:r = v, g = t, b = p;break;
    case 1:r = q, g = v, b = p;break;
    case 2:r = p, g = v, b = t;break;
    case 3:r = p, g = q, b = v;break;
    case 4: r = t, g = p, b = v;break;
    case 5: r = v, g = p, b = q;break;
    }
    return [Math.floor(r*256),Math.floor(g*256),Math.floor(b*256)];
};
const rgbValuesToColor = function (r, g, b) {
    return "#"+(r).toString(16)+(g).toString(16)+(b).toString(16);
};

// const COLORS = ['blue', 'red', 'black', 'white', 'pink', 'brown'];

const SPAN: number = 30;

const COLORS: Array<string> = [];
_.times(SPAN, (i)=>{
    //    COLORS.push(rgbValuesToColor.apply(null, hsvToRgb(Math.random(), 0.5, 0.95)));
    COLORS.push(rainbow(SPAN, i));
});



const Cell = React.createClass({
    propTypes: {
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
        cellSideX: React.PropTypes.number.isRequired,
        cellSideY: React.PropTypes.number.isRequired,
        v: React.PropTypes.number,
        waterLine: React.PropTypes.bool.isRequired
    },
    statics: {
        flash: function(v) {
            return (v+Math.floor(SPAN/2)) % COLORS.length;
        }
    },
    shouldComponentUpdate(nextProps: any, nextState: any) {
        return (this.props.v!==nextProps.v);
    },
    render: function() {
        let borderStyle = {
            border: 'none'
        };

        const borderStyleWaterLine = {
            borderTop: 'solid 3px red'
        };
        if (this.props.waterLine) {
            borderStyle = Object.assign({}, borderStyle, borderStyleWaterLine);
        }
        if (this.props.v!=null) {
            const brickColor = tinycolor(COLORS[this.props.v % COLORS.length]);
            const brickColorTop   = brickColor.clone().darken (10).toHexString();
            const brickColorLeft  = brickColor.clone().darken (20).toHexString();
            const brickColorRight = brickColor.clone().lighten(10).toHexString();
            const brickColorBottom= brickColor.clone().lighten(20).toHexString();
            const borderStyleOccupied = {
                borderTop   : `solid 8px ${brickColorTop}`,
                borderLeft  : `solid 8px ${brickColorLeft}`,
                borderBottom: `solid 8px ${brickColorBottom}`,
                borderRight : `solid 8px ${brickColorRight}`
            };            
            borderStyle = Object.assign({}, borderStyle, borderStyleOccupied);
        }
        const brickColorString = (()=> {
            if (this.props.v!=null) {
                return tinycolor(COLORS[this.props.v % COLORS.length]).toHexString();
            } else {
                return '#000';
            }
        })();
        const cellStyle = Object.assign({}, {
            boxSizing: 'border-box',
            left: this.props.x*this.props.cellSideX,
            top: this.props.y*this.props.cellSideY,
            width:this.props.cellSideX,
            height: this.props.cellSideY,
            background: brickColorString,
            position: 'absolute'
        }, borderStyle);
        return (
                <div style={cellStyle}>
                </div>
        );
    }
});

export default Cell;

