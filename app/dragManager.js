// Taken from https://github.com/zindlerb/apparatus/blob/master/src/View/Manager/DragManager.coffee
import React from 'react';
import classnames from 'classnames';
import $ from 'jquery';

import _ from 'lodash';
import { actionDispatch } from './stateManager';
import { guid, getGlobalPosFromSyntheticEvent, globalEventManager } from './utils';

const LISTEN_ALL = '$$$LISTEN_TO_ALL';

const Drag = function (mouseDownEvent, spec) {
  _.extend(this, spec);
  this.originalX = mouseDownEvent.clientX;
  this.originalY = mouseDownEvent.clientY;

  if (this.consummated === undefined) {
    this.consummated = false;
  }
};

const DragManager = function () {
  this.drag = null;
  this.listeners = {
    [LISTEN_ALL]: [],
  };

  globalEventManager.addListener('mousemove', this._onMouseMove.bind(this), 1);
  globalEventManager.addListener('mouseup', this._onMouseUp.bind(this), 1);
};

DragManager.prototype.start = function (mouseDownEvent, spec) {
  /*
     dragType
     onDrag
     onEnd
   */
  this.drag = new Drag(mouseDownEvent, spec);
  this.fireListeners('onStart', mouseDownEvent);
};

DragManager.prototype.fireListeners = function (eventName, mouseEvent) {
  const that = this;
  const dTypeListeners = this.listeners[this.drag.dragType] || [];
  const allListeners = this.listeners[LISTEN_ALL];

  dTypeListeners.concat(allListeners).forEach(function (listener) {
    if (listener[eventName]) {
      listener[eventName](mouseEvent, that);
    }
  });
};

DragManager.prototype._onMouseMove = function (mouseMoveEvent) {
  if (!this.drag) return;
  if (!this.drag.consummated) {
    // Check if we should consummate.
    const dx = mouseMoveEvent.clientX - this.drag.originalX;
    const dy = mouseMoveEvent.clientY - this.drag.originalY;
    const d = Math.max(Math.abs(dx), Math.abs(dy));

    if (d > 3) {
      this._consummate(mouseMoveEvent);
    }
  } else {
    this.fireListeners('onDrag', mouseMoveEvent);

    if (this.drag.onDrag) {
      this.drag.onDrag(mouseMoveEvent);
    }
  }
};

DragManager.prototype._onMouseUp = function (mouseUpEvent, cancel) {
  if (!this.drag) return;

  if (this.drag.onEnd) {
    this.drag.onEnd(mouseUpEvent);
  }

  this.fireListeners('onEnd', mouseUpEvent);

  this.drag = null;

  cancel();
};

DragManager.prototype._consummate = function (mouseMoveEvent) {
  this.drag.consummated = true;
  if (this.drag.onConsummate) {
    this.drag.onConsummate(mouseMoveEvent);
  }
};

DragManager.prototype.subscribe = function (...args) {
  let dragType, listenerSpec;

  /*
     Spec:

     onStart
     onDrag
     onEnd
   */

  if (args.length === 1) {
    dragType = LISTEN_ALL;
    listenerSpec = args[0];
  } else if (args.length === 1) {
    dragType = args[0];
    listenerSpec = args[1];
  }

  if (!this.listeners[dragType]) {
    this.listeners[dragType] = [];
  }

  listenerSpec._id = guid();
  this.listeners[dragType].push(listenerSpec);

  return listenerSpec._id;
};

DragManager.prototype.unsubscribe = function (id) {
  let didFind = false;
  /* TD: update perf */
  _.forEach(this.listeners, function (typeListeners) {
    if (!didFind) {
      didFind = _.remove(typeListeners, function (listener) {
        return listener._id === id;
      }).length > 0;
    }
  });

  return didFind;
};

export const dragManager = new DragManager();

export function createDraggableComponent(spec, Component) {
  /*
     Draggable Must implement:
     className
     onMouseDown
   */

  return React.createClass({
    onMouseDown(e) {
      const that = this;

      const dragSpec = {
        dragType: spec.dragType,
        dragCtx: spec.dragCtx || {},

        onDrag(e) {
          const pos = getGlobalPosFromSyntheticEvent(e);

          if (spec.onDrag) {
            spec.onDrag(that.props, pos, this.dragCtx);
          }

          that.setState(pos);
        },
        onEnd(e) {
          const pos = getGlobalPosFromSyntheticEvent(e);

          if (spec.onEnd) {
            spec.onEnd(that.props, pos, this.dragCtx);
          }
        },
        dragImage: {
          /* This kinda sketchy */
          element: <Component {...that.props} />,
        },
      };

      if (spec.onStart) {
        spec.onStart(that.props, getGlobalPosFromSyntheticEvent(e), dragSpec);
      }

      dragManager.start(e, dragSpec);
      e.stopPropagation();
    },

    render() {
      return (
        <Component
          {...this.props}
          onMouseDown={this.onMouseDown}
          className={classnames('c-default noselect c-grab', this.props.className)}
        />
      );
    },
  });
}

export const DragImage = React.createClass({
  getInitialState() {
    return {
      isDragging: false,
      isConsumated: false,
    };
  },

  componentDidMount() {
    const that = this;
    let isDragging = false;
    dragManager.subscribe({
      onStart(e, ctx) {
        if (ctx.drag.dragImage) {
          isDragging = true;
          actionDispatch.setGlobalCursor('c-grabbing');
          that.setState({
            element: ctx.drag.dragImage.element,
            isDragging: true,
          });
        }
      },

      onDrag(e) {
        if (isDragging) {
          const newState = that.getPosition(e);
          if (!that.state.isConsumated) {
            newState.isConsumated = true;
          }

          that.setState(newState);
        }
      },

      onEnd() {
        if (isDragging) {
          actionDispatch.setGlobalCursor(undefined);
          that.setState({
            isConsumated: false,
            isDragging: false,
          });
        }
      },
    });
  },

  getPosition(e) {
    const rootEl = $(this._el).children();
    return {
      x: (e.clientX - (rootEl.width() / 2)),
      y: (e.clientY - (rootEl.height() / 2)),
    };
  },

  render() {
    if (this.state.isDragging) {
      return (
        <div
          ref={(ref) => { this._el = ref; }}
          className={classnames({ hidden: !this.state.isConsumated }, 'absolute click-through')}
          style={{
            left: this.state.x,
            top: this.state.y,
          }}
        >
          {this.state.element}
        </div>
      );
    } else {
      return <div />;
    }
  },
});
