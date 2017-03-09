import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import classnames from 'classnames';

import { wasRightButtonPressed } from '../utils';
import { componentTypes } from '../constants';
import TreeItem from './TreeItem';

const Spacer = React.createClass({
  checkActive(dropPoint) {
    if (!dropPoint) { return false; }

    return (
      dropPoint.parentId === this.props.parentId &&
      dropPoint.insertionIndex === this.props.index &&
      !dropPoint.isDraggedComponent
    );
  },
  render() {
    let sx, indexMarker;
    const { index, parentId, activeDropSpot, nearDropSpots } = this.props;
    const isActive = this.checkActive(activeDropSpot);
    const isNear = _.some(nearDropSpots, dspot => this.checkActive(dspot));

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
          className={'spacer treeDropSpot_' + parentId + '_' + indexMarker}
      />
    );
  }
});

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
    let afterSpacer, afterSpacerInd, treeItemElement;
    let {
      context,
      node,
      containerMethods,
      actions
    } = this.props;

    const {
      activeDropSpot,
      nearDropSpots,
      activeComponentId,
      hoveredComponentId
    } = context;

    const isOpen = context.openComponents[node.id];
    const isRoot = node.componentType === componentTypes.ROOT;
    const isEmpty = node.children.length === 0;

    if (node.parentId) {
      afterSpacerInd = node.index + 1;
      afterSpacer = (
        <Spacer
            parentId={node.parentId}
            index={afterSpacerInd}
            activeDropSpot={activeDropSpot}
            nearDropSpots={nearDropSpots}

        />
      );
    }

    if (isRoot || isEmpty || isOpen) {
      const childItems = _.map(node.children, (child) => {
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

      children = (
        <div className="ml2">
          <Spacer
              parentId={node.id}
              index={0}
              activeDropSpot={context.activeDropSpot}
              nearDropSpots={context.nearDropSpots}
          />
          {childItems}
        </div>
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
                    node.parentId,
                    node.index + 1,
                    e.clientX,
                    e.clientY
                  );
                } else {
                  actions.selectComponent(node.id);
                }

                e.stopPropagation();
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
        {treeItemElement}
        {children}
        {afterSpacer}
      </div>
    );
  },
});

export default ComponentTree;
