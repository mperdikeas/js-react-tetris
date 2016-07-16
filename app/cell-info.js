//@flow
'use strict';

class CellInfo {
    constructor(x, y, v, waterLine) {
        this.x = x;
        this.y = y;
        this.v = v;
        this.waterLine = waterLine;
    }
}

exports.CellInfo = CellInfo;
