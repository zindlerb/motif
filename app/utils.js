import _ from 'lodash';

export function distanceBetweenPoints(p1, p2) {
    return Math.abs(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));
}

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
}


export class Rect {
    constructor(attrs) {
        if (attrs) {
            this.x = attrs.x;
            this.y = attrs.y;
            this.w = attrs.w;
            this.h = attrs.h;
            this.computeDerivedProperties();
        }
    }

    computeDerivedProperties() {        
        this.middleX = this.x + this.w/2;
        this.middleY = this.y + this.h/2;
    }

    getHandles() {
        throw "not implemented";
        return {
            topLeft: "" ,
            topCenter: "",
            topRight: "",
            middleLeft: "",
            middleCenter: "",
            middleRight: "",
            bottomrLeft: "",
            bottomCenter: "",
            bottomRight: ""
        };
    }

    fromElement(el) {
        var height = el.height();
        var width = el.width();
        var offset = el.offset();

        this.x = offset.left;
        this.y = offset.top;
        this.w = width;
        this.h = height;

        this._el = el;

        this.computeDerivedProperties();
        return this;
    }
}
export function getGlobalPosFromSyntheticEvent(e) {
    return {x: e.clientX, y: e.clientY};
}
