import React from 'react';
import $ from 'jquery';
import _ from 'lodash';

import dragManager from '../dragManager';
import { guid } from '../utils';
import { componentTypes } from '../constants';

import TreeItem from './TreeItem';
import ComponentTree from './ComponentTree';

function DragShadow(props) {
  const padding = 100;
  const sx = {
    opacity: 0.5,
    position: 'absolute',
    top: props.y - props.offsetY - padding,
    left: props.x - props.offsetX - padding,
    width: props.width,
    padding: 100,
    zIndex: 3
  };

  return (
    <div
        className="c-grabbing"
        style={sx}>
      {props.children}
    </div>
  );
}

/*

   What determines if something is open?
     - isOpen
     - isEmpty
     - isRoot

*/

const ComponentTreeContainer = React.createClass({
  getInitialState() {
    return {
      isDragging: false,
      dragData: {},
      hasOpenedMenu: false,
      openComponents: {}
    }
  },

  walkRenderTree(renderTree, func, ...internal) {
    const isChild = internal[0];
    let isCanceled = false, isOpen, isEmpty, isRoot;

    if (isChild) {
      func(renderTree, () => { isCanceled = true });
    }

    renderTree.children.forEach((child) => {
      // TD: clean up
      isOpen = this.state.openComponents[child.id];
      isEmpty = !child.children.length;
      isRoot = child.componentType === componentTypes.ROOT;

      if (!isCanceled && (isOpen || isEmpty || isRoot)) {
        this.walkRenderTree(child, func, true);
      }
    });
  },

  beginDrag(e, node, itemWidth, itemX, itemY) {
    const that = this;
    dragManager.start(e, {
      dragType: 'treeItem',
      onConsummate(e) {
        that.setState({
          isDragging: true,
          dragData: {
            shouldUpdate: true,
            nodeText: node.name,
            width: itemWidth,
            shadowOffsetX: e.clientX - itemX,
            shadowOffsetY: e.clientY - itemY,
            x: e.clientX,
            y: e.clientY
          }
        });

        that.initializeDropSpots(
          node.id,
          node.parentId,
          node.index
        );
      },
      onDrag(e) {
        const pos = {
          x: e.clientX,
          y: e.clientY
        };
        that.updateDropSpots(pos);
      },
      onEnd() {
        const { closestInsertionPoints } = that.state.dragData;
        if (closestInsertionPoints &&
            closestInsertionPoints.length) {
          const closestInsertionPoint = closestInsertionPoints[0];
          // TD: refactor. I'm unhappy with the open/close setup
          if (closestInsertionPoint.isEmptyChild) {
            that.toggleTreeItem(closestInsertionPoint.parentId);
          }

          that.props.actions.moveComponent(
            node.id,
            closestInsertionPoint.parentId,
            closestInsertionPoint.insertionIndex,
          );
        }

        that.setState({
          isDragging: false,
          dragData: {}
        })
      }
    });
  },

  initializeDropSpots(
    draggedComponentId,
    draggedComponentParentId,
    draggedComponentIndex
  ) {
    let insertionPoints = [];
    const beforeComponentIndex = draggedComponentIndex;
    const afterComponentIndex = beforeComponentIndex + 1;

    function getInsertionPoint(nodeId, nodeIndex, parentId) {
      let el;
      if (!nodeId) {
        el = $('.treeDropSpot_' + parentId + '_emptyChild');
      } else {
        el = $('.treeDropSpot_' + nodeId + '_' + nodeIndex);
      }

      const w = el.width();
      const pos = el.offset();

      return {
        id: guid(),
        isEmptyChild: !nodeId,
        insertionIndex: nodeIndex,
        parentId,
        getY: () => {
          return el.offset().top;
        },
        points: [
          { x: pos.left, y: pos.top },
          { x: pos.left + w, y: pos.top }
        ],
        isDraggedComponent: (
          parentId === draggedComponentParentId &&
          (nodeIndex === beforeComponentIndex || nodeIndex === afterComponentIndex)
        )
      };
    }

    this.walkRenderTree(this.props.renderTree, (node, cancel) => {
      // Before
      let nodeParentId = node.parentId;
      let nodeId = node.id;
      let ind = node.index;

      if (ind === 0) {
        insertionPoints.push(getInsertionPoint(nodeId, ind, nodeParentId));
      }

      // After
      insertionPoints.push(getInsertionPoint(nodeId, ind + 1, nodeParentId));

      if (nodeId === draggedComponentId) {
        // Can't drag component inside itself
        cancel();
      } else if (node.componentType === componentTypes.CONTAINER &&
                 node.children.length === 0) {
        // Inside
        insertionPoints.push(getInsertionPoint(undefined, 0, nodeId));
      }
    });

    insertionPoints = _.sortBy(insertionPoints, function (insertionPoint) {
      return insertionPoint.getY();
    });

    this.setState({
      dragData: Object.assign(
        this.state.dragData,
        {
          draggedComponentId,
          insertionPointCache: insertionPoints
        }
      )
    });
  },

  binarySearchClosestIndex(insertionPoints, y) {
    let bounds = { left: 0, right: insertionPoints.length - 1 };
    let middle, direction;

    while (bounds.left <= bounds.right) {
      middle = Math.floor((bounds.right + bounds.left) / 2);
      let pointY = insertionPoints[middle].getY();
      direction = y > pointY ? 'right' : 'left';

      if ((bounds.right - bounds.left) === 1) {
        middle = bounds[direction];
        break;
      } else if (direction === 'left') {
        bounds.right = middle - 1;
      } else {
        bounds.left = middle + 1;
      }
    }

    return middle;
  },

  updateDropSpots(pos) {
    // Binary search to find 3 closest nodes
    const insertionPoints = this.state.dragData.insertionPointCache;
    let shouldNotUpdate = false;

    const closestYInd = this.binarySearchClosestIndex(insertionPoints, pos.y);

    const newClosestInsertionPoints = [
      closestYInd,
      closestYInd - 1,
      closestYInd + 1
    ].reduce((closestInsertionPoints, ind) => {
      if (insertionPoints[ind]) {
        closestInsertionPoints.push(insertionPoints[ind]);
      }

      return closestInsertionPoints;
    }, []);

    if (this.state.dragData.closestInsertionPoints && this.state.dragData.closestInsertionPoints.length) {
      shouldNotUpdate = _.every(
        this.state.dragData.closestInsertionPoints,
        (stateInsertionPoint, ind) => {
          return stateInsertionPoint.id === newClosestInsertionPoints[ind].id;
        }
      );
    }

    this.setState({
      dragData: Object.assign(
        {},
        this.state.dragData,
        {
          closestInsertionPoints: newClosestInsertionPoints,
          shouldNotUpdate,
          x: pos.x,
          y: pos.y
        }
      )
    });
  },

  toggleTreeItem(nodeId) {
    this.setState({
      openComponents: Object.assign(
        this.state.openComponents,
        { [nodeId]: !this.state.openComponents[nodeId] }
      )
    });
  },

  render() {
    const {
      actions,
      activeComponentId,
      hoveredComponentId,
      renderTree
    } = this.props;

    const {
      isDragging,
      openComponents,
      hasOpenedMenu,
      dragData
    } = this.state;

    const {
      shouldNotUpdate,
      width,
      shadowOffsetX,
      shadowOffsetY,
      x,
      y,
      nodeText,
    } = dragData

    let shadow, hintText;

    const closestInsertionPoints = this.state.dragData.closestInsertionPoints || [];

    if (isDragging) {
      shadow = (
        <DragShadow
            width={width}
            offsetX={shadowOffsetX}
            offsetY={shadowOffsetY}
            x={x}
            y={y}
        >
          <TreeItem className="c-grabbing">
            {nodeText}
          </TreeItem>
        </DragShadow>
      );
    }

    if (!hasOpenedMenu) {
      hintText = <span className="hint f7 ml2 mt2 dib">Right click components for menu</span>;
    }

    return (
      <div>
        { hintText }
        <ComponentTree
            node={renderTree}
            actions={actions}
            isDragging={isDragging}
            shouldNotUpdate={shouldNotUpdate}
            containerMethods={{
              beginDrag: this.beginDrag,
              toggleTreeItem: this.toggleTreeItem
            }}
            context={{
              otherPossibleTreeViewDropSpots: _.tail(closestInsertionPoints),
              selectedTreeViewDropSpot: _.first(closestInsertionPoints),
              activeComponentId,
              hoveredComponentId,
              openComponents
            }}
        />
        { shadow }
      </div>
    )
  }
});

export default ComponentTreeContainer;
