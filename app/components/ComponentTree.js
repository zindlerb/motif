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
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      node,
      activeComponent
    } = this.props;

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
            otherPossibleTreeViewDropSpots={otherPossibleTreeViewDropSpots}
            selectedTreeViewDropSpot={selectedTreeViewDropSpot}
            activeComponent={activeComponent}
        />
      );
    }

    return (
      <div
          className="mt1"
          ref={(ref) => { this.props.node['###domElements'].treeView = ref; }}
      >
        {beforeSpacer}
        <TreeItem {...this.props} isActive={activeComponent && activeComponent.id === node.id} />
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
      const className = classnames(
        this.props.className,
        'outline_' + this.props.node.id,
        { highlightBottom: false, isActive: this.props.isActive },
        'db'
      );

      return (
        <span
            onMouseDown={this.props.onMouseDown}
            onMouseUp={this.onClick}
            className={className}>
          {this.props.node.name}
        </span>
      );
    },
  }),
);

const TreeChildren = React.createClass({
  render() {
    let { otherPossibleTreeViewDropSpots, selectedTreeViewDropSpot, activeComponent } = this.props;
    const children = _.map(this.props.children, function (child, ind) {
      return (
        <ComponentTree
            selectedTreeViewDropSpot={selectedTreeViewDropSpot}
            otherPossibleTreeViewDropSpots={otherPossibleTreeViewDropSpots}
            activeComponent={activeComponent}
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
