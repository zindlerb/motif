import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import mousetrap from 'mousetrap';

import dragManager from '../dragManager';
import { guid, wasRightButtonPressed } from '../utils';
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

class DropSpots {
  constructor() {
    this.dropSpots = [];
    this.prevClosestYIndex;
  }

  addDropSpot(parentId, nodeIndex, isDraggedComponent) {
    const el = $('.treeDropSpot_' + parentId + '_' + nodeIndex);
    const w = el.width();
    const pos = el.offset();

    this.dropSpots.push({
      id: guid(),
      insertionIndex: nodeIndex,
      parentId,
      getY: () => {
        return el.offset().top;
      },
      points: [
        { x: pos.left, y: pos.top },
        { x: pos.left + w, y: pos.top }
      ],
      isDraggedComponent
    });
  }

  sort() {
    this.dropSpots = _.sortBy(this.dropSpots, function (dropSpot) {
      return dropSpot.getY();
    });
  }

  findClosestYIndex(mouseY) {
    let closestIndex, direction, minDist;
    if (this.prevClosestYIndex) {
      closestIndex = this.prevClosestYIndex;
      direction = mouseY >= this.dropSpots[closestIndex].getY() ? 'right' : 'left';
    } else {
      closestIndex = 0;
      direction = 'right';
    }

    minDist = Math.abs(this.dropSpots[closestIndex].getY() - mouseY);

    let dspotDistFromMouse;
    if (direction === 'right') {
      for (; closestIndex < this.dropSpots.length - 1; closestIndex++) {
        dspotDistFromMouse = Math.abs(this.dropSpots[closestIndex + 1].getY() - mouseY);
        if (dspotDistFromMouse < minDist) {
          minDist = dspotDistFromMouse;
        } else {
          break;
        }
      }
    } else {
      for (; closestIndex > 0; closestIndex--) {
        dspotDistFromMouse = Math.abs(this.dropSpots[closestIndex - 1].getY() - mouseY);
        if (dspotDistFromMouse < minDist) {
          minDist = dspotDistFromMouse;
        } else {
          break;
        }
      }
    }

    this.prevClosestYIndex = closestIndex;
    return closestIndex;
  }
}

const renderTreeMethods = {
  walkTree(renderTree, func, openComponents, ...internal) {
    const isChild = internal[0];
    let isCanceled = false, isOpen = openComponents[renderTree.id];

    if (isChild) {
      func(renderTree, () => { isCanceled = true });
    }

    if (isOpen || renderTree.componentType === componentTypes.ROOT) {
      renderTree.children.forEach((child) => {
        if (!isCanceled) {
          this.walkTree(child, func, openComponents, true);
        }
      });
    }
  },

  getSortedDropSpots(renderTree, openComponents, draggedComponentId) {
    const dropSpots = new DropSpots();

    this.walkTree(renderTree, (node, cancel) => {
      let nodeParentId = node.parentId;
      let nodeId = node.id;
      let ind = node.index;

      const isDraggedComponent = nodeId === draggedComponentId;
      // Before
      if (ind === 0) {
        dropSpots.addDropSpot(nodeParentId, ind, isDraggedComponent);
      }

      // After
      dropSpots.addDropSpot(nodeParentId, ind + 1, isDraggedComponent)

      if (nodeId === draggedComponentId) {
        // Can't drag component inside itself
        cancel();
      } else if (node.componentType === componentTypes.CONTAINER &&
                 node.children.length === 0) {
        // Inside
        dropSpots.addDropSpot(nodeId, 0, false);
      }
    }, openComponents);

    dropSpots.sort();

    return dropSpots;
  }
};

const ComponentTreeContainer = React.createClass({
  getInitialState() {
    return {
      isDragging: false,
      dragData: {},
      hasOpenedMenu: false,
      openComponents: {}
    }
  },

  componentDidMount() {
    mousetrap.bind(['backspace', 'del'], () => {
      if (this.props.activeComponentId) {
        this.props.actions.deleteComponent(this.props.activeComponentId);
      }
    }, 'keyup');
  },

  beginDrag(e, node, itemWidth, itemX, itemY) {
    const that = this;
    dragManager.start(e, {
      dragType: 'treeItem',
      onConsummate(e) {
        const dropSpots = renderTreeMethods.getSortedDropSpots(
          that.props.renderTree,
          that.state.openComponents,
          node.id,
        );

        that.setState({
          isDragging: true,
          dragData: {
            shouldUpdate: true,
            nodeText: node.name,
            width: itemWidth,
            shadowOffsetX: e.clientX - itemX,
            shadowOffsetY: e.clientY - itemY,
            x: e.clientX,
            y: e.clientY,
            draggedComponentId: node.id,
            dropSpotsCache: dropSpots
          }
        });
      },
      onDrag(e) {
        const pos = {
          x: e.clientX,
          y: e.clientY
        };

        const { closestYInd, dropSpotsCache } = that.state.dragData;
        const newClosestYInd = dropSpotsCache.findClosestYIndex(pos.y);

        if (newClosestYInd === closestYInd) {
          that.setState({
            dragData: Object.assign(
              that.state.dragData,
              {
                shouldNotUpdate: true,
                x: pos.x,
                y: pos.y
              }
            )
          });

          return;
        }

        const newActiveDropSpot = dropSpotsCache.dropSpots[newClosestYInd];
        const newNearDropSpots = [];

        if (dropSpotsCache.dropSpots[newClosestYInd - 1]) {
          newNearDropSpots.push(dropSpotsCache.dropSpots[newClosestYInd - 1]);
        }

        if (dropSpotsCache.dropSpots[newClosestYInd + 1]) {
          newNearDropSpots.push(dropSpotsCache.dropSpots[newClosestYInd + 1]);
        }

        that.setState({
          dragData: Object.assign(
            that.state.dragData,
            {
              closestYInd: newClosestYInd,
              activeDropSpot: newActiveDropSpot,
              nearDropSpots: newNearDropSpots,
              shouldNotUpdate: false,
              x: pos.x,
              y: pos.y
            }
          )
        });
      },
      onEnd() {
        const { activeDropSpot } = that.state.dragData;

        if (activeDropSpot && !activeDropSpot.isDraggedComponent) {
          const { parentId, insertionIndex } = activeDropSpot;

          // Initialize Empty Component
          if (insertionIndex === 0 && !that.state.openComponents[parentId]) {
            that.toggleTreeItem(parentId);
          }

          that.props.actions.moveComponent(
            node.id,
            parentId,
            insertionIndex,
          );
        }

        that.setState({
          isDragging: false,
          dragData: {}
        })
      }
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
      activeDropSpot,
      nearDropSpots
    } = dragData

    let shadow, hintText;
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
      <div
          className="h-100"
          onMouseUp={(e) => {
              if (wasRightButtonPressed(e)) {
                actions.openMenu(
                  undefined,
                  renderTree.id,
                  renderTree.children.length,
                  e.clientX,
                  e.clientY
                );
                e.stopPropagation();
              }
            }}
      >
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
              nearDropSpots,
              activeDropSpot,
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
