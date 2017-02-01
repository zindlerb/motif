import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { DragSource } from 'react-dnd';

import { dragTypes } from '../constants';
import { wasRightButtonPressed, globalEventManager } from '../utils';

const Spacer = function (props) {
  let sx;
  const { index, node, isActive, isNear } = props;
  if (isActive) {
    sx = {
      border: '1px solid orange',
      marginTop: 1,
      marginBottom: 1,
    };
  } else if (isNear) {
    sx = {
      border: '1px solid blue',
      marginTop: 1,
      marginBottom: 1,
    };
  }

  return (
    <div
        style={sx}
        className={'treeDropSpot_' + node.id + '_' + (index || 'emptyChild')}
    />
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

      return (dropPoint.parentId === node.parent.id &&
              dropPoint.insertionIndex === ind);
    }

    if (node.parent) {
      if (this.props.node.index === 0) {
        beforeSpacer = (
          <Spacer
              node={node}
              index={node.index}
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
            node={node}
            index={node.index}
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

const TreeItem = DragSource(
  dragTypes.MOVE_COMPONENT,
  {
    beginDrag(props) {
      const id = globalEventManager.addListener('drag', (e) => {
        props.actions.updateTreeViewDropSpots(
          {
            x: e.clientX,
            y: e.clientY,
          },
          props.node.id
        );
      }, 1);

      return { id };
    },
    endDrag(props, monitor) {
      globalEventManager.removeListener('drag', monitor.getItem().id);
      const selectedTreeViewDropSpot = props.context.selectedTreeViewDropSpot;
      if (selectedTreeViewDropSpot) {
        props.actions.moveComponent(
          props.node.id,
          selectedTreeViewDropSpot.parentId,
          selectedTreeViewDropSpot.insertionIndex,
        );
      }
      props.actions.resetTreeViewDropSpots();
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
        'treeItem w-100 pv1',
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
