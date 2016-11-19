// Taken from https://github.com/zindlerb/apparatus/blob/master/src/View/Manager/DragManager.coffee
import _ from 'lodash';

var DragManager = function () {
    this.drag = null;
    window.addEventListener("mousemove", this._onMouseMove.bind(this));
    window.addEventListener("mouseup", this._onMouseUp.bind(this));
}

DragManager.prototype.start = function(mouseDownEvent, spec) {
    /*
      type
      onMove
      onUp
    */
    this.drag = new Drag(mouseDownEvent, spec);
}

DragManager.prototype._onMouseMove = function(mouseMoveEvent) {
    if (!this.drag) return;
    if (!this.drag.consummated) {
        // Check if we should consummate.
        var dx = mouseMoveEvent.clientX - this.drag.originalX;
        var dy = mouseMoveEvent.clientY - this.drag.originalY;
        var d  = Math.max(Math.abs(dx), Math.abs(dy));

        if (d > 3) {
            this._consummate(mouseMoveEvent);
        }
    } else if(this.drag.onMove) {
        this.drag.onMove(mouseMoveEvent);
    }
}

DragManager.prototype._onMouseUp = function(mouseUpEvent) {
    if (!this.drag) return;

    if(this.drag.consummated && this.drag.onDrop) {
        this.drag.onDrop(mouseUpEvent);
    } else if(this.drag.onCancel) {
        this.drag.onCancel(mouseUpEvent);
    }

    if(this.drag.onUp) {
        this.drag.onUp(mouseUpEvent);
    }

    this.drag = null;
}

DragManager.prototype._consummate = function(mouseMoveEvent) {
    this.drag.consummated = true;
    if (this.drag.onConsummate) {
        this.drag.onConsummate(mouseMoveEvent);
    }
}

var Drag = function(mouseDownEvent, spec) {
    _.extend(this, spec);
    this.originalX = mouseDownEvent.clientX;
    this.originalY = mouseDownEvent.clientY;

    if (this.consummated === undefined) {
        this.consummated = false;
    }
}

export default new DragManager();
