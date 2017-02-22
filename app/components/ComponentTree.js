import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import classnames from 'classnames';

import { wasRightButtonPressed } from '../utils';
import TreeItem from './TreeItem';

const Spacer = function (props) {
  let sx, indexMarker;
  const { index, nodeId, isActive, isNear } = props;

  if (isActive) {
    sx = {
      border: '1px solid #FF8D80',
      marginTop: 1
    };
  } else if (isNear) {
    sx = {
      border: '1px solid #FFDCD8',
      marginTop: 1
    };
  } else {
    sx = {
      border: '0px solid #FFDCD8',
      height: 1
    };
  }

  if (index === undefined) {
    indexMarker = 'emptyChild';
  } else {
    indexMarker = index;
  }

  return (
    <div
        style={sx}
        className={'spacer treeDropSpot_' + nodeId + '_' + indexMarker}
    />
  );
};

function checkActive(parentId, dropPoint, ind) {
  if (!dropPoint) { return false; }

  return (
    dropPoint.parentId === parentId &&
    dropPoint.insertionIndex === ind &&
    !dropPoint.isDraggedComponent
  );
}

const ComponentTree = React.createClass({
  shouldComponentUpdate(nextProps) {
    // TD: change this so there is less coupling with container
    if (nextProps.isDragging) {
      // Assumes component tree cannot change mid drag
      return nextProps.shouldUpdate;
    } else {
      return true;
    }
  },
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

    if (node.parent) {
      if (node.index === 0) {
        beforeSpacer = (
          <Spacer
              nodeId={node.id}
              index={node.index}
              isActive={checkActive(node.parent.id, selectedTreeViewDropSpot, 0)}
              isNear={_.some(otherPossibleTreeViewDropSpots, (dspot) => {
                  return checkActive(node.parent.id, dspot, 0);
                })}
          />
        );
      }

      afterSpacerInd = node.index + 1;
      afterSpacer = (
        <Spacer
            nodeId={node.id}
            index={afterSpacerInd}
            isActive={checkActive(
                node.parent.id,
                selectedTreeViewDropSpot,
                afterSpacerInd
              )}
            isNear={_.some(otherPossibleTreeViewDropSpots, (dspot) => {
                return checkActive(node.parent.id, dspot, afterSpacerInd);
              })}
        />
      );
    }

    children = (
      <TreeChildren
          parentId={node.id}
          children={node.children}
          context={context}
          actions={actions}
      />
    );

    const treeItemIsActive = node.id === activeComponentId;
    const treeItemIsHovered = node.id === hoveredComponentId;

    return (
      <div>
        {beforeSpacer}
        <TreeItem
            className={classnames('c-grab', {
                isActive: treeItemIsActive,
                isHovered: !treeItemIsActive && treeItemIsHovered
              })}
            onMouseEnter={() => actions.hoverComponent(node.id)}
            onMouseLeave={() => actions.unHoverComponent()}
            onMouseUp={(e) => {
                if (wasRightButtonPressed(e)) {
                  actions.openMenu(
                    node.id,
                    e.clientX,
                    e.clientY
                  );
                } else {
                  actions.selectComponent(node.id);
                }
              }}
            onMouseDown={(e) => {
                const target = $(e.target);
                const targetPos = target.position();

                context.beginDrag(
                  e,
                  node,
                  target.width(),
                  targetPos.left,
                  targetPos.top
                );
              }}
        >
          {node.name}
        </TreeItem>
        {children}
        {afterSpacer}
      </div>
    );
  },
});

const TreeChildren = React.createClass({
  render() {
    let emptySpacer;
    const { parentId, context } = this.props;
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

    if (this.props.children.length === 0) {
        emptySpacer = (
          <Spacer
              nodeId={this.props.parentId}
              isActive={checkActive(
                  parentId,
                  context.selectedTreeViewDropSpot,
                  0
                )}
              isNear={_.some(context.otherPossibleTreeViewDropSpots, (dspot) => {
                  return checkActive(
                    parentId,
                    dspot,
                    0
                  );
                })}
          />
        );
    }

    return (
      <div className="ml2">
        {emptySpacer}
        {children}
      </div>
    );
  },
});

export default ComponentTree;
