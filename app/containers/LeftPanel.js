import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import $ from 'jquery';
import _ from 'lodash';

import { leftPanelTypes, componentTypes } from '../constants';
import dragManager from '../dragManager';
import { guid } from '../utils';
import HorizontalSelect from '../components/HorizontalSelect';
import FormLabel from '../components/forms/FormLabel';
import TextField from '../components/forms/TextField';
import SidebarHeader from '../components/SidebarHeader';
import ComponentTree from '../components/ComponentTree';
import TreeItem from '../components/TreeItem';
import { renderTreeSelector } from '../selectors';

function DragShadow(props) {
  const sx = {
    opacity: 0.5,
    position: 'absolute',
    top: props.y - props.offsetY,
    left: props.x - props.offsetX,
    width: props.width,
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

const ComponentTreeContainer = React.createClass({
  getInitialState() {
    return {
      insertionPointCache: undefined,
      closestInsertionPoints: undefined
    }
  },

  walkRenderTree(renderTree, func, ...internal) {
    const isChild = internal[0];
    let isCanceled = false;

    if (isChild) {
      func(renderTree, () => { isCanceled = true });
    }

    renderTree.children.forEach((child) => {
      if (!isCanceled) {
        this.walkRenderTree(child, func, true);
      }
    });
  },

  beginDrag(e, node) {
    const that = this;
    dragManager.start(e, {
      dragType: 'treeItem',
      onConsummate(e) {
        const target = $(e.target);
        const targetPos = target.position();

        this.setState({
          isDragging: true,
          shouldUpdate: true,
          nodeText: node.name,
          width: target.width(),
          shadowOffsetX: e.clientX - targetPos.left,
          shadowOffsetY: e.clientY - targetPos.top,
          x: e.clientX,
          y: e.clientY
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
        that.setState(pos);
        that.props.context.updateDropSpots(pos);
      },
      onEnd() {
        if (this.state.closestInsertionPoints &&
            this.state.closestInsertionPoints.length) {
          that.props.actions.moveComponent(
            node.id,
            this.state.closestInsertionPoints[0].parentId,
            this.state.closestInsertionPoints[0].insertionIndex,
          );
        }

        this.setState(_.keys(this.state).reduce((obj, key) => {
          obj[key] = undefined;
          return obj;
        }, {}));
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
      draggedComponentId,
      insertionPointCache: insertionPoints
    });
  },

  updateDropSpots(pos) {
    // Binary search to find 3 closest nodes
    const insertionPoints = this.state.insertionPointCache;
    let left = 0, right = insertionPoints.length - 1;
    let middle;
    let shouldUpdate = true;

    // TD: remove check
    let count = 0;

    while (left < right) {
      middle = Math.floor((right + left) / 2);
      let point = insertionPoints[middle];
      let pointY = point.getY();

      if (pointY === pos.y) {
        break;
      } else if (pos.y < pointY) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }

      if (count > 200) {
        throw new Error(left + '_' + right);
      }

      count++
    }

    let minDist = Math.abs(pos.y - insertionPoints[middle].getY());
    let closestIndex = [
      middle - 1,
      middle + 1
    ].reduce((closestIndex, ind) => {
      if (insertionPoints[ind]) {
        let dist = Math.abs(pos.y - insertionPoints[ind].getY());
        if (dist < minDist) {
          minDist = dist;
          return ind;
        }
      }

      return closestIndex;
    }, middle);

    // Check if drop spots have changed
    const newClosestInsertionPoints = [
      closestIndex,
      closestIndex - 1,
      closestIndex + 1
    ].reduce((closestInsertionPoints, ind) => {
      if (insertionPoints[ind]) {
        closestInsertionPoints.push(insertionPoints[ind]);
      }

      return closestInsertionPoints;
    }, []);

    if (this.state.closestInsertionPoints) {
      shouldUpdate = !_.every(
        this.state.closestInsertionPoints,
        (stateInsertionPoint, ind) => {
          return stateInsertionPoint.id === newClosestInsertionPoints[ind].id;
        }
      );
    }

    this.setState(Object.assign({
      closestInsertionPoints: newClosestInsertionPoints,
      shouldUpdate
    }, pos));
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
      shouldUpdate,
      width,
      shadowOffsetX,
      shadowOffsetY,
      x,
      y,
      nodeText,
    } = this.state;
    let shadow;

    const closestInsertionPoints = this.state.closestInsertionPoints || [];

    if (isDragging) {
      shadow = (
        <DragShadow>
          <TreeItem
              className="isHovered"
              isDragging={isDragging}
              shouldUpdate={shouldUpdate}
              width={width}
              shadowOffsetX={shadowOffsetX}
              shadowOffsetY={shadowOffsetY}
              x={x}
              y={y}
          >
            {nodeText}
          </TreeItem>
        </DragShadow>
      );
    }

    return (
      <div>
        <SidebarHeader text="Component Tree" />
        <ComponentTree
            node={renderTree}
            actions={actions}
            context={{
              otherPossibleTreeViewDropSpots: _.tail(closestInsertionPoints),
              selectedTreeViewDropSpot: _.first(closestInsertionPoints),
              activeComponentId,
              hoveredComponentId,
              beginDrag: this.beginDrag
            }}
        />
        { shadow }
      </div>
    )
  }
});

const LeftPanel = React.createClass({
  render() {
    //console.log('LEFT_PANEL Render');
    let body;
    let {
      actions,
      activePanel,
      activeComponentId,
      hoveredComponentId,
      renderTree,
      currentPage,
    } = this.props;

    if (!currentPage) {
      body = (
        <h2 className="suggestion">No Page Selected</h2>
      );
    } else if (activePanel === leftPanelTypes.TREE) {
      body = (
        <ComponentTreeContainer
            actions={actions}
            renderTree={renderTree}
            activeComponentId={activeComponentId}
            hoveredComponentId={hoveredComponentId}
        />
      );
    } else if (activePanel === leftPanelTypes.DETAILS) {
      const inputs = [
        { name: 'name', key: 'metaName' },
        { name: 'url', key: 'url' },
        { name: 'author', key: 'author' },
        { name: 'title', key: 'title' },
        { name: 'description', key: 'description', large: true },
        { name: 'keywords', key: 'keywords', large: true },
      ].map((input) => {
        return (
          <FormLabel name={input.name}>
            <TextField
                value={currentPage.get(input.key)}
                onSubmit={(value) => {
                    this.props.actions.setPageValue(input.key, value);
                  }}
                isLarge={input.large}
            />
          </FormLabel>
        );
      });

      body = (
        <div>
          <SidebarHeader text="Page Settings" />
          { inputs }
        </div>
      );
    }

    return (
      <div>
        <HorizontalSelect
            className="w-100"
            options={[
              { value: leftPanelTypes.TREE, src: 'public/img/assets/tree-icon.svg' },
              { value: leftPanelTypes.DETAILS, faClass: 'fa-info-circle' },
            ]}
            activePanel={this.props.activePanel}
            onClick={(name) => { actions.changePanel(name, 'left'); }}
        />
        <div className="ph1">
          {body}
        </div>
      </div>
    );
  },
});

const leftPanelSelector = createSelector(
  [
    state => state.get('activeLeftPanel'),
    state => state.get('activeComponentId'),
    state => state.get('hoveredComponentId'),
    renderTreeSelector,
    state => state.getIn(['pages', state.get('currentPageId')]),
  ],
  (
    activePanel, activeComponentId,
    hoveredComponentId, renderTree, currentPage,
  ) => {
    return {
      activePanel,
      activeComponentId,
      hoveredComponentId,
      renderTree,
      currentPage
    }
  }
)

export default connect((state) => {
  return leftPanelSelector(state);
})(LeftPanel);
