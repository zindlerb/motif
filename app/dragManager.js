// Taken from https://github.com/zindlerb/apparatus/blob/master/src/View/Manager/DragManager.coffee
import _ from 'lodash';
import {guid} from './utils.js';

var DragManager = function () {
  this.drag = null;
  this.listeners = {};
  window.addEventListener("mousemove", this._onMouseMove.bind(this));
  window.addEventListener("mouseup", this._onMouseUp.bind(this));
}

DragManager.prototype.start = function(mouseDownEvent, spec) {
  /*
     dragType
     onDrag
     onEnd
   */
  this.drag = new Drag(mouseDownEvent, spec);
  this.fireListeners('onStart', mouseDownEvent);
}

DragManager.prototype.fireListeners = function (eventName, mouseEvent) {
  var dTypeListeners = this.listeners[this.drag.dragType];
  if (dTypeListeners) {
    dTypeListeners.forEach(function(listener) {
      if (listener[eventName]) {
        listener[eventName](mouseEvent);
      }
    });
  }
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
  } else {
    this.fireListeners('onDrag', mouseMoveEvent);

    if(this.drag.onDrag) {
      this.drag.onDrag(mouseMoveEvent);
    }
  }
}

DragManager.prototype._onMouseUp = function(mouseUpEvent) {
  if (!this.drag) return;

  if(this.drag.onEnd) {
    this.drag.onEnd(mouseUpEvent);
  }

  this.fireListeners('onEnd', mouseUpEvent);

  this.drag = null;
}

DragManager.prototype._consummate = function(mouseMoveEvent) {
  this.drag.consummated = true;
  if (this.drag.onConsummate) {
    this.drag.onConsummate(mouseMoveEvent);
  }
}

DragManager.prototype.subscribe = function (dragType, eventListeners) {
  /*
     onStart
     onDrag
     onEnd
   */
  eventListeners._id = guid();

  if (!this.listeners[dragType]) {
    this.listeners[dragType] = [];
  }

  this.listeners[dragType].push(eventListeners);

  return eventListeners._id;
}

DragManager.prototype.unsubscribe = function (id) {
  var didFind = false;
  /* TD: update perf */
  _.forEach(this.listeners, function (typeListeners) {
    if (!didFind) {
      didFind = _.remove(typeListeners, function (listener) {
        return listener._id === id;
      }).length > 0;
    }
  });

  return didFind;
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
