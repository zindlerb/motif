import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { leftPanelTypes } from '../constants';
import HorizontalSelect from '../components/HorizontalSelect';
import FormLabel from '../components/forms/FormLabel';
import TextField from '../components/forms/TextField';
import SidebarHeader from '../components/SidebarHeader';
import ComponentTree from '../components/ComponentTree';
import { renderTreeSelector } from '../selectors';

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
      func(renderTree, () => isCanceled = false);
    }

    renderTree.children.forEach((child) => {
      if (!isCanceled) {
        this.walkRenderTree(child, func, true);
      }
    });
  },

  initializeDropSpots(
    draggedComponentId,
    draggedComponentParentId,
    draggedComponentIndex
  ) {
    let insertionPoints = [];
    const beforeIndex = draggedComponentIndex;
    const afterIndex = beforeIndex + 1;

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


    if (!_.every(
      this.state.closestInsertionPoints,
      (stateInsertionPoint, ind) => {
        return stateInsertionPoint.id === newClosestInsertionPoints.id;
      }
    )) {
      this.setState({
        closestInsertionPoints: newClosestInsertionPoints
      })
    }
  },

  resetDropSpots() {
    this.setState({
      insertionPointCache: undefined,
      closestInsertionPoints: undefined
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
      closestInsertionPoints
    } = this.state;

    return (
      <div>
        <SidebarHeader text="Component Tree" />
        <ComponentTree
            node={renderTree}
            actions={actions}
            context={{
              otherPossibleTreeViewDropSpots: _.rest(closestInsertionPoints),
              selectedTreeViewDropSpot: _.first(closestInsertionPoints),
              activeComponentId,
              hoveredComponentId
            }}
        />
      </div>
    )

  }
});

const LeftPanel = React.createClass({
  render() {
    console.log('LEFT_PANEL Render');
    let body;
    let {
      actions,
      activePanel,
      activeComponentId,
      hoveredComponentId,
      renderTree,
      currentPage,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot
    } = this.props;

    if (!currentPage) {
      body = (
        <h2 className="suggestion">No Page Selected</h2>
      );
    } else if (activePanel === leftPanelTypes.TREE) {
      body = (
        <div>
          <SidebarHeader text="Component Tree" />
          <ComponentTree
              node={renderTree}
              actions={this.props.actions}
              context={{
                otherPossibleTreeViewDropSpots,
                selectedTreeViewDropSpot,
                activeComponentId,
                hoveredComponentId,
              }}
          />
        </div>
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
    state => state.get('otherPossibleTreeViewDropSpots'),
    state => state.get('selectedTreeViewDropSpot'),
  ],
  (
    activePanel, activeComponentId,
    hoveredComponentId, renderTree, currentPage,
    otherPossibleTreeViewDropSpots, selectedTreeViewDropSpot
  ) => {

    console.log(activePanel, activeComponentId,
                hoveredComponentId, renderTree, currentPage,
                otherPossibleTreeViewDropSpots, selectedTreeViewDropSpot);

    return {
      activePanel,
      activeComponentId,
      hoveredComponentId,
      renderTree,
      currentPage,
      otherPossibleTreeViewDropSpots: otherPossibleTreeViewDropSpots && otherPossibleTreeViewDropSpots.toJS(),
      selectedTreeViewDropSpot: selectedTreeViewDropSpot && selectedTreeViewDropSpot.toJS()
    }
  }
)

export default connect((state) => {
  return leftPanelSelector(state);
})(LeftPanel);
