//@flow
'use strict';

class CellInfo {
    x: number;
    y: number;
    v: number;
    waterLine: boolean;
    constructor(x: number, y: number, v:number, waterLine: boolean) {
        this.x = x;
        this.y = y;
        this.v = v;
        this.waterLine = waterLine;
    }
}

exports.CellInfo = CellInfo;
