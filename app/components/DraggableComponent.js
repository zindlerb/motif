import React from 'react';
import _ from 'lodash';
import dragManager from '../dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';

import {Rect, getGlobalPosFromSyntheticEvent, distanceBetweenPoints} from '../utils.js';
import stateManager from '../stateManager.js';


//Takes a component and makes it draggable
var DraggableComponent = React.createClass({
  getInitialState: function () {
    return {isDragging: false};
  },
  makeOnMouseDown: function (Component) {
    var that = this;

    return (e) => {
      that.setState(Object.assign({isDragging: true}, getGlobalPosFromSyntheticEvent(e)));
      dragManager.start(e, {
        dragType: that.props.dragType,
        dragCtx: that.props.dragCtx || {},
        onDrag: function (e) {
          var pos = getGlobalPosFromSyntheticEvent(e);

          if (that.props.onDrag) {
            that.props.onDrag(pos, this.dragCtx);
          }

          that.setState(pos);
        },
        onEnd: function (e) {
          var pos = getGlobalPosFromSyntheticEvent(e);

          if (that.props.onEnd) {
            that.props.onEnd(pos, this.dragCtx);
          }

          that.setState({isDragging: false});
        }
      });

      e.stopPropagation();
    }
  },
  render: function() {
    var draggingComponent;
    var draggingClassNames = classnames("c-default noselect", {
      "c-grab": !this.state.isDragging,
      "c-grabbing": this.state.isDragging,
    });

    var sx

    if (this.state.isDragging) {
      var rootEl = $(this._el).children();
      draggingComponent = <div className={classnames("absolute", draggingClassNames, "click-through")} style={{
        left: this.state.x - rootEl.outerWidth()/2,
        top: this.state.y - rootEl.outerHeight()/2
      }}>{this.props.children}</div>
    }

    return (
      <div>
        <div
            ref={(ref) => { this._el = ref }}
            className={draggingClassNames}
            onMouseDown={this.makeOnMouseDown(this.props.component)}>
          {this.props.children}
        </div>
        {draggingComponent}
      </div>
    );
  }
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
