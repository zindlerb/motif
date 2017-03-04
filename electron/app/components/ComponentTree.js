import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import classnames from 'classnames';

import { wasRightButtonPressed } from '../utils';
import { componentTypes } from '../constants';
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
    if (nextProps.isDragging && nextProps.shouldNotUpdate) {
      // Assumes component tree cannot change mid drag
      return false;
    } else {
      return true;
    }
  },
  render() {
    let children;
    let afterSpacer, beforeSpacer, afterSpacerInd, treeItemElement;
    let {
      context,
      node,
      containerMethods,
      actions
    } = this.props;

    const {
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      activeComponentId,
      hoveredComponentId
    } = context;

    const isOpen = context.openComponents[node.id];
    const isRoot = node.componentType === componentTypes.ROOT;
    const isEmpty = node.children.length == 0;

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

    if (isRoot || isEmpty || isOpen ) {
      children = (
        <TreeChildren
            parentId={node.id}
            children={node.children}
            containerMethods={containerMethods}
            context={context}
            actions={actions}
        />
      );
    }


    const treeItemIsActive = node.id === activeComponentId;
    const treeItemIsHovered = node.id === hoveredComponentId;

    if (!isRoot) {
      treeItemElement = (
        <TreeItem
            isContainer={node.componentType === componentTypes.CONTAINER}
            isEmpty={isEmpty}
            isOpen={isOpen}
            nodeId={node.id}
            toggleTreeItem={containerMethods.toggleTreeItem}
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

                containerMethods.beginDrag(
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
      );
    }

    return (
      <div>
        {beforeSpacer}
        {treeItemElement}
        {children}
        {afterSpacer}
      </div>
    );
  },
});

const TreeChildren = React.createClass({
  render() {
    let emptySpacer;
    const { parentId, context, actions, containerMethods } = this.props;
    const children = _.map(this.props.children, (child) => {
      return (
        <ComponentTree
            containerMethods={containerMethods}
            context={context}
            actions={actions}
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
