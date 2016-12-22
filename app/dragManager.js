// Taken from https://github.com/zindlerb/apparatus/blob/master/src/View/Manager/DragManager.coffee
import React from 'react';
import classnames from 'classnames';
import $ from 'jquery';

import _ from 'lodash';
import {actionDispatch} from './stateManager';
import {guid, getGlobalPosFromSyntheticEvent} from './utils.js';

const LISTEN_ALL = "$$$LISTEN_TO_ALL";

var DragManager = function () {
  this.drag = null;
  this.listeners = {
    [LISTEN_ALL]: []
  };
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
  var that = this;
  var dTypeListeners = this.listeners[this.drag.dragType] || [];
  var allListeners = this.listeners[LISTEN_ALL];

  dTypeListeners.concat(allListeners).forEach(function(listener) {
    if (listener[eventName]) {
      listener[eventName](mouseEvent, that);
    }
  });
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

DragManager.prototype.subscribe = function (dragType, listenerSpec) {
  var dragType, listenerSpec;

  /*
     dragType
     onStart
     onDrag
     onEnd
   */

  if (arguments.length === 1) {
    dragType = LISTEN_ALL;
    listenerSpec = arguments[0];
  } else if (arguments.length === 1) {
    dragType = arguments[0];
    listenerSpec = arguments[1];
  }

  if (!this.listeners[dragType]) {
    this.listeners[dragType] = [];
  }

  listenerSpec._id = guid();
  this.listeners[dragType].push(listenerSpec);

  return listenerSpec._id;
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

export var dragManager = new DragManager();

export function createDraggableComponent(spec, Component) {
  /*
     Draggable Must implement:
     className
     onMouseDown
   */

  return React.createClass({
    onMouseDown: function (e) {
      var that = this;

      var dragSpec = {
        dragType: spec.dragType,
        dragCtx: spec.dragCtx || {},

        onDrag: function (e) {
          var pos = getGlobalPosFromSyntheticEvent(e);

          if (spec.onDrag) {
            spec.onDrag(that.props, pos, this.dragCtx);
          }

          that.setState(pos);
        },
        onEnd: function (e) {
          var pos = getGlobalPosFromSyntheticEvent(e);

          if (spec.onEnd) {
            spec.onEnd(that.props, pos, this.dragCtx);
          }
        },
        dragImage: {
          /* This kinda sketchy */
          element: <Component {...that.props}/>
        }
      };

      if (spec.onStart) {
        spec.onStart(that.props, getGlobalPosFromSyntheticEvent(e), dragSpec);
      }

      dragManager.start(e, dragSpec);
      e.stopPropagation();
    },

    onMouseUp() {
      this.setState({isDragging: false});
    },

    render: function () {
      return (
        <Component
            {...this.props}
            onMouseDown={this.onMouseDown}
            className={classnames("c-default noselect c-grab", this.props.className)}
        />
      );
    }
  });
};

export var DragImage = React.createClass({
  getInitialState() {
    return {
      isDragging: false,
      isConsumated: false
    }
  },

  getPosition(e) {
    var rootEl = $(this._el).children();
    return {
      x: e.clientX - rootEl.outerWidth()/2,
      y: e.clientY - rootEl.outerHeight()/2,
    };
  },

  componentDidMount() {
    var that = this;

    dragManager.subscribe({
      onStart: function (e, ctx) {
        actionDispatch.setGlobalCursor("c-grabbing");
        that.setState({
          element: ctx.drag.dragImage.element,
          isDragging: true
        });
      },

      onDrag: function (e) {
        var newState = that.getPosition(e);
        if (!that.state.isConsumated) {
          newState.isConsumated = true;
        }

        that.setState(newState);
      },

      onEnd: function () {
        actionDispatch.setGlobalCursor(undefined);
        that.setState({
          isConsumated: false,
          isDragging: false
        });
      }
    });
  },

  render: function () {
    if (this.state.isDragging) {
      return (
          <div
              ref={(ref) => { this._el = ref }}
              className={classnames({hidden: !this.state.isConsumated}, "absolute click-through")}
              style={{
                left: this.state.x,
                top: this.state.y
              }}>
            {this.state.element}
          </div>

        );
    } else {
      return <div></div>;
    }
  }
});
