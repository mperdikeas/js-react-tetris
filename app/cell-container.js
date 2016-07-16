'use strict';
const     _ = require('lodash');
const React = require('react');
var      cx = require('classnames');
import assert from 'assert';

import Cell          from './cell.js';

const {Point, Brick, Grid, GridWithBrick, Vector, ExceptionalOssificationResult} = require( '../modules/grid-brick/es5/index.js');

import {createChainableTypeChecker} from './chainable-type-checker.js';
import {CellInfo} from './cell-info.js';

function isCellInfoArrayValidator(props, propName, componentName, location) {
    componentName = componentName || 'anonymous';
    const WIDTH_CELLS_PROP_NAME = 'widthCells';
    const widthCells = props[WIDTH_CELLS_PROP_NAME];
    if (widthCells===undefined)
        throw new Error(`property '${propName}' passed in '${componentName}' also expects a property '${WIDTH_CELLS_PROP_NAME}' passed alongside it which was not passed`);
    const HEIGHT_CELLS_PROP_NAME = 'heightCells';
    const heightCells = props[HEIGHT_CELLS_PROP_NAME];
    if (heightCells===undefined)
        throw new Error(`property '${propName}' passed in '${componentName}' also expects a property '${HEIGHT_CELLS_PROP_NAME}' passed alongside it which was not passed`);    
    const os = props[propName];
    if (!Array.isArray(os))
        throw new Error( `${propName} passed in ${componentName} is not an array` );
    else {
        for (let i = 0 ; i < os.length ; i++) {
            const o = os[i];
            if (! (o instanceof CellInfo))
                throw new Error(`The ${i}-th element of the array [${propName}] passed in ${componentName} is not a CellInfo`);
            else {
                if ((o.x===undefined) || (o.x<0) || (o.x>=widthCells) || (o.x % 1 !== 0))
                    throw new Error(`the ${i}-th element of the CellInfo array passed as property '${propName}' in component '${componentName}' has an x value of ${o.x} that does not lie in the [0, ${widthCells}) range or is not an integer or is undefined`);
                if ((o.y===undefined) || (o.y<0) || (o.y>=heightCells) || (o.y % 1 !== 0))
                    throw new Error(`the ${i}-th element of the CellInfo array passed as property '${propName}' in component '${componentName}' has a y value of ${o.y} that does not lie in the [0, ${heightCells}) range or is not an integer or is undefined`);
            }
        }
    }
    return null; // assume all OK
}

const cellInfoArray = createChainableTypeChecker(isCellInfoArrayValidator);

const CellContainer = React.createClass({
    propTypes: {
        cells : cellInfoArray.isRequired,
        widthCells: React.PropTypes.number.isRequired,
        heightCells: React.PropTypes.number.isRequired,
        widthPx : React.PropTypes.number.isRequired,
        heightPx: React.PropTypes.number.isRequired,
        paddingPx: React.PropTypes.number.isRequired
    },
    createCells: function(cellSideX, cellSideY) {
        const cells = [];
        for (let cell of this.props.cells) {
            const key = JSON.stringify({coord: cell.x*this.props.heightCells+cell.y, v: cell.v, waterLine: cell.waterLine});
            cells.push(
                    <Cell key={key}
                    x={cell.x}
                    y={cell.y}
                    cellSideX={cellSideX}
                    cellSideY={cellSideY}
                    v={cell.v}
                    waterLine={cell.waterLine}>
                    </Cell>
            );
        }
        return cells;
    },    
    render: function() {
        const cellSideX = (this.props.widthPx - 2*this.props.paddingPx) / this.props.widthCells;
        const cellSideY = (this.props.heightPx - 2*this.props.paddingPx) / this.props.heightCells;
        const cells = this.createCells(cellSideX, cellSideY);
        const containerStyle={border: 'none',
                              display: 'inline-block',
                              position: 'relative',
                              padding: `${this.props.paddingPx}px`,
                              margin: 0,
                              width: `${this.props.widthPx-2*this.props.paddingPx}px`,
                              height: `${this.props.heightPx-2*this.props.paddingPx}px`
                             };
        const relativelyPositionDivToTakeParentsPaddingIntoAccount={position: 'relative'}; // http://stackoverflow.com/a/30826028/274677
                       
        return (
                <div style={containerStyle}>
                    <div style={relativelyPositionDivToTakeParentsPaddingIntoAccount}>
                        {cells}
                    </div>
                </div>                    
        );
    }
});

export default CellContainer;

