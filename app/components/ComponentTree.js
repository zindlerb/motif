import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

import { createDraggableComponent } from '../dragManager';
import { wasRightButtonPressed } from '../utils';
import { actionDispatch } from '../stateManager';

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
    } = this.props;

    const {
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      activeComponent,
      hoveredComponent
    } = context;

    const treeItemIsActive = activeComponent && node.id === activeComponent.id;
    const treeItemIsHovered = hoveredComponent && node.id === hoveredComponent.id;

    function checkActive(dropPoint, ind) {
      if (!dropPoint) { return false; }

      return (dropPoint.parent.id === node.parent.id &&
              dropPoint.insertionIndex === ind);
    }

    if (node.parent) {
      if (this.props.node.isFirstChild()) {
        beforeSpacer = (
          <Spacer
              isActive={checkActive(selectedTreeViewDropSpot, 0)}
              isNear={_.some(otherPossibleTreeViewDropSpots, (dspot) => {
                  return checkActive(dspot, 0);
                })}
          />
        );
      }

      afterSpacerInd = node.getInd() + 1;
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
        />
        {children}
        {afterSpacer}
      </div>
    );
  },
});

const TreeItem = createDraggableComponent(
  {
    dragType: 'moveComponent',
    onDrag(props, pos) {
      actionDispatch.updateTreeViewDropSpots(pos, props.node);
    },
    onEnd(props) {
      const { node, selectedTreeViewDropSpot } = props;
      if (selectedTreeViewDropSpot) {
        actionDispatch.moveComponent(
          node,
          selectedTreeViewDropSpot.parent,
          selectedTreeViewDropSpot.insertionIndex
        );
      }

      actionDispatch.resetTreeViewDropSpots();
    },
  },
  React.createClass({
    onClick(e) {
      if (wasRightButtonPressed(e)) {
        actionDispatch.openMenu(this.props.node, e.clientX, e.clientY);
      } else {
        actionDispatch.selectComponent(this.props.node);
      }
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

      return (
        <span
            onMouseDown={onMouseDown}
            onMouseEnter={() => {
                actionDispatch.hoverComponent(node)
              }}
            onMouseLeave={() => { actionDispatch.unHoverComponent() }}
            onMouseUp={this.onClick}
            className={treeItemClassName}>
          {node.name}
        </span>
      );
    },
  }),
);

const TreeChildren = React.createClass({
  render() {
    const children = _.map(this.props.children, (child, ind) => {
      return (
        <ComponentTree
            context={this.props.context}
            node={child}
            key={child.id}
            isFirst={ind === 0}
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
