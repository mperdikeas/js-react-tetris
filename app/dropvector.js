'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';


const {Point, Vector} = require( '../modules/grid-brick/es5/index.js');
import {CELL_SIDE} from './constants.js';

function verticalVectorValidator(props, propName, componentName) {
    if (!(props[propName] instanceof Vector)) throw new Error(`Property [${propName}] supplied to component [${componentName}] is not a Vector`);
    if (!(props[propName].isVertical())) throw new Error(`Property [${propName}] supplied to component [${componentName}] is not a vertical Vector`);
}


const DropVector = React.createClass({
    propTypes: {
        vector: verticalVectorValidator
    },
    render: function() {
        const left =  this.props.vector.pointA.x * CELL_SIDE+CELL_SIDE/4;
        const topShaft  =  this.props.vector.pointA.y * CELL_SIDE;
        const shaftLength = this.props.vector.verticalLength()*CELL_SIDE;
        const topArrow = topShaft+shaftLength;
        let divStyle={
            position: 'absolute',
            top: 0,
            left: 0
        }
        let shaftStyle={
            position: 'absolute',
            width: `${CELL_SIDE/2}px`,
            top: `${topShaft}px`,
            height: `${shaftLength}px`,
            left: `${left}px`,
            background: 'linear-gradient(transparent, rgba(255, 0, 0, 0.3) 80%, red)',
            margin: 0,
            padding: 0
        };
        let arrowDownStyle = {
            position: 'absolute',
            top: `${topArrow}px`,
            left: `${left-CELL_SIDE/4}px`,
            width: 0,
            height: 0,
            borderLeft: `${CELL_SIDE/2}px solid transparent`,
            borderRight: `${CELL_SIDE/2}px solid transparent`,
            borderTop: `${CELL_SIDE/2}px solid #f00`,
            margin: 0,
            padding: 0
        };
        console.log('ffoo');
        return (
                <div style={divStyle}>
                <div style={shaftStyle}/>
                <div style={arrowDownStyle}/>
                </div>
        );
    }
});

exports.DropVector = DropVector;
