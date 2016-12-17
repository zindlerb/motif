import React from 'react';
import _ from 'lodash';
import dragManager from '../dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';

import {Rect, getGlobalPosFromSyntheticEvent, distanceBetweenPoints} from '../utils.js';
import stateManager from '../stateManager.js';

function createDraggableComponent(Component, spec) {
  /*
     Draggable Must implement:
       this._el = ref
       className
       onMouseDown
   */

  render: function() {
    return React.createClass({
      setDragImage: function (el, dragCtx) {
        var rootEl = $(el).children();
        dragCtx.dragImage = {
          left: pos.x - rootEl.outerWidth()/2,
          top: pos.y - rootEl.outerHeight()/2
        };
      },
      onMouseDown: function (e) {
        var that = this;
        that.setState(Object.assign({isDragging: true}, getGlobalPosFromSyntheticEvent(e)));

        var dragSpec = {
          dragType: spec.dragType,
          dragCtx: spec.dragCtx || {},

          onDrag: function (e) {
            var pos = getGlobalPosFromSyntheticEvent(e);

            if (spec.onDrag) {
              spec.onDrag(pos, this.dragCtx);
            }

            that.setState(pos);
            that.setDragImage(that._el, this.drag);
          },
          onEnd: function (e) {
            var pos = getGlobalPosFromSyntheticEvent(e);

            if (this.props.onEnd) {
              this.props.onEnd(pos, this.dragCtx);
            }

            this.setState({isDragging: false});
          }
        };

        this.setDragImage(that._el, dragSpec);

        dragManager.start(e, dragSpec);

        e.stopPropagation();
      },

      getInitialState: function () {
        return {isDragging: false};
      },

      render: function () {
        return (
          <Component
              onMouseDown={mouseMove}
              className={classnames("c-default noselect", {
                  "c-grab": !this.state.isDragging,
                  "c-grabbing": this.state.isDragging,
                })}
          />
        );
      }
    })
};

var DragImage = React.createClass({
  getInitialState() {
    return {
      isDragging: false
    }
  },

  componentDidMount() {
    var that = this;
    dragManager.subscribe({
      onStart: function () {
        that.setState({
          isDragging: true,
          element: this.drag.dragImage.element;
          x: this.drag.dragImage.left,
          y: this.drag.dragImage.top,
        });
      },

      onDrag: function () {
        that.setState({
          x: this.drag.dragImage.left,
          y: this.drag.dragImage.top,
        });
      },

      onEnd: function () {
        that.setState({
          isDragging: false
        });
      }
    });
  },

  render: function () {
    if (this.state.isDragging) {
      return (
        <div className={classnames("absolute", draggingClassNames, "click-through")} style={{
          left: this.state.x,
          top: this.state.y
        }}>
          {this.state.element}
        </div>
      );
    } else {
      return <div></div>;
    }
});




//Takes a component and makes it draggable
var DraggableComponent = React.createClass({

});

/*
   Needs to work like react dnd where it statically wraps component.
   - but this does not solve the issue of wrapping in div!

   2 kinds of dragging. What is shared accross them? What is different?

- Component Dragging
   - Cannot be wrapped in div

- Component Block Dragging

- Both:
   - listen for drag start
     - register onDrag and onEnd with dragManager
   - have grabby hand
   - have some image while dragging
 */

export default DraggableComponent;
p
