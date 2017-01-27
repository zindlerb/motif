import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { DragSource } from 'react-dnd';

import { dragTypes } from '../constants';

/* import { createDraggableComponent } from '../dragManager';*/
import { wasRightButtonPressed } from '../utils';

const Spacer = function (props) {
  let sx;
  if (props.isActive) {
    sx = {
      border: '1px solid orange',
      marginTop: 1,
      marginBottom: 1,
    };
  } else if (props.isNear) {
    sx = {
      border: '1px solid blue',
      marginTop: 1,
      marginBottom: 1,
    };
  }

  return (
    <div style={sx} />
  );
};

const ComponentTree = React.createClass({
  render() {
    let children;
    let afterSpacer, beforeSpacer, afterSpacerInd;
    let {
      context,
      node,
      actions
    } = this.props;

    const {
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      activeComponentId,
      hoveredComponentId
    } = context;

    const treeItemIsActive = node.id === activeComponentId;
    const treeItemIsHovered = node.id === hoveredComponentId;

    function checkActive(dropPoint, ind) {
      if (!dropPoint) { return false; }

      return (dropPoint.parent.id === node.parent.id &&
              dropPoint.insertionIndex === ind);
    }

    if (node.parent) {
      if (this.props.node.index === 0) {
        beforeSpacer = (
          <Spacer
              isActive={checkActive(selectedTreeViewDropSpot, 0)}
              isNear={_.some(otherPossibleTreeViewDropSpots, (dspot) => {
                  return checkActive(dspot, 0);
                })}
          />
        );
      }

      afterSpacerInd = node.index + 1;
      afterSpacer = (
        <Spacer
            isActive={checkActive(selectedTreeViewDropSpot, afterSpacerInd)}
            isNear={_.some(otherPossibleTreeViewDropSpots, (dspot) => {
                return checkActive(dspot, afterSpacerInd);
              })}
        />
      );
    }

    if (node.children && node.children.length) {
      children = (
        <TreeChildren
            children={node.children}
            context={context}
            actions={actions}
        />
      );
    }

    return (
      <div
          className="mt1"
          ref={(ref) => { this.props.node.domElements.treeView = ref; }}
      >
        {beforeSpacer}
        <TreeItem
            {...this.props}
            isActive={treeItemIsActive}
            isHovered={treeItemIsHovered}
            actions={actions}
        />
        {children}
        {afterSpacer}
      </div>
    );
  },
});
/*
   createDraggableComponent(
   {
   dragType: 'moveComponent',
   onDrag(props, pos) {
   this.props.actions.updateTreeViewDropSpots(pos, props.node);
   },
   onEnd(props) {
   const { node, selectedTreeViewDropSpot } = props;
   if (selectedTreeViewDropSpot) {
   this.props.actions.moveComponent(
   node,
   selectedTreeViewDropSpot.parent,
   selectedTreeViewDropSpot.insertionIndex
   );
   }

   this.props.actions.resetTreeViewDropSpots();
   },
   },
*/

const TreeItem = DragSource(
  dragTypes.MOVE_ITEM,
  {
    beginDrag(props, monitor) {
      let eventListenerArgs = ['mousemove', (e) => {
        // in here update the highlight
        console.log('mousemove');
      }];
      window.addEventListener.apply(window, evenListenerArgs);

      return {eventListenerArgs};
    },
    endDrag(props, monitor) {
      let eventListenerArgs = monitor.getItem().eventListenerArgs;
      window.removeEventListener.apply(window, eventListenerArgs);
      // in here trigger the component move if the conditions are right
    }
  },
  function (connect) {
    return {
      connectDragSource: connect.dragSource()
    }
  }
)(
  React.createClass({
    onMouseUp(e) {
      if (wasRightButtonPressed(e)) {
        this.props.actions.openMenu(this.props.node, e.clientX, e.clientY);
      } else {
        this.props.actions.selectComponent(this.props.node.id);
      }
      e.stopPropagation();
    },
    render() {
      const {
        node,
        className,
        isActive,
        isHovered,
        onMouseDown
      } = this.props;

      const treeItemClassName = classnames(
        'treeItem',
        className,
        'outline_' + node.id,
        {
          highlightBottom: false,
          isActive,
          isHovered
        },
        'db'
      );

      return this.props.connectDragSource(
        <span
            onMouseDown={onMouseDown}
            onMouseEnter={() => {
                this.props.actions.hoverComponent(node.id)
              }}
            onMouseLeave={() => { this.props.actions.unHoverComponent() }}
            onMouseUp={this.onMouseUp}
            className={treeItemClassName}>
          {node.name}
        </span>
      );
    },
  })
);


const TreeChildren = React.createClass({
  render() {
    const children = _.map(this.props.children, (child) => {
      return (
        <ComponentTree
            context={this.props.context}
            actions={this.props.actions}
            node={child}
            key={child.id}
        />
      );
    });

    return (
      <div className="ml3">
        {children}
      </div>
    );
  },
});

export default ComponentTree;
