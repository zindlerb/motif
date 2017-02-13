import $ from 'jquery';
import _ from 'lodash';
import Immutable from 'immutable';
import { componentTypes, NONE } from '../constants';

const UNHOVER_COMPONENT = 'UNHOVER_COMPONENT';
const HOVER_COMPONENT = 'HOVER_COMPONENT';

const ADD_VARIANT = 'ADD_VARIANT';
const MOVE_COMPONENT = 'MOVE_COMPONENT';
const DELETE_COMPONENT = 'DELETE_COMPONENT';

const SELECT_COMPONENT = 'SELECT_COMPONENT';

const UPDATE_TREE_VIEW_DROP_SPOTS = 'UPDATE_TREE_VIEW_DROP_SPOTS';
const RESET_TREE_VIEW_DROP_SPOTS = 'RESET_TREE_VIEW_DROP_SPOTS';

const CHANGE_COMPONENT_NAME = 'CHANGE_COMPONENT_NAME';
const CREATE_COMPONENT_BLOCK = 'CREATE_COMPONENT_BLOCK';
const SET_COMPONENT_ATTRIBUTE = 'SET_COMPONENT_ATTRIBUTE';

const privateCache = {};

// test for optional argument
export const componentTreeActions = {
  moveComponent(componentId, parentComponentId, insertionIndex) {
    return {
      type: MOVE_COMPONENT,
      componentId,
      parentComponentId,
      insertionIndex
    };
  },

  addVariant(componentId, parentComponentId, insertionIndex, spec) {
    return {
      type: ADD_VARIANT,
      componentId,
      parentComponentId,
      insertionIndex,
      spec: spec || {},
    };
  },

  deleteComponent(componentId) {
    return {
      type: DELETE_COMPONENT,
      componentId
    };
  },

  selectComponent(componentId) {
    return {
      type: SELECT_COMPONENT,
      componentId,
      _noUndo: true
    };
  },

  hoverComponent(componentId) {
    return {
      type: HOVER_COMPONENT,
      componentId,
      _noUndo: true
    }
  },

  unHoverComponent() {
    return {
      type: UNHOVER_COMPONENT,
      _noUndo: true
    }
  },

  updateTreeViewDropSpots(pos, draggedComponentId) {
    return {
      type: UPDATE_TREE_VIEW_DROP_SPOTS,
      pos,
      draggedComponentId,
      _noUndo: true
    };
  },

  resetTreeViewDropSpots() {
    return {
      type: RESET_TREE_VIEW_DROP_SPOTS,
      _noUndo: true
    };
  },

  changeComponentName(componentId, newName) {
    return {
      type: CHANGE_COMPONENT_NAME,
      componentId,
      newName
    };
  },

  createComponentBlock(newBlockId) {
    return {
      type: CREATE_COMPONENT_BLOCK,
      newBlockId
    };
  },

  setComponentAttribute(componentId, attrKey, newAttrValue) {
    return {
      type: SET_COMPONENT_ATTRIBUTE,
      componentId,
      attrKey,
      newAttrValue,
    };
  },
};

export const componentTreeReducer = {
  [ADD_VARIANT](state, action) {
    let { componentId, parentComponentId, insertionIndex, spec } = action;
    let componentsContainer = state.get('componentsContainer');

    componentsContainer.addChild(
      parentComponentId,
      componentsContainer.createVariant(componentId, spec),
      insertionIndex
    );

    return state;
  },

  [MOVE_COMPONENT](state, action) {
    state.get('componentsContainer').moveComponent(
      action.componentId,
      action.parentComponentId,
      action.insertionIndex
    );

    return state;
  },

  [DELETE_COMPONENT](state, action) {
    let { componentId } = action;
    state.get('componentsContainer').deleteComponent(componentId);

    return state.update('activeComponentId', (activeComponentId) => {
      if (activeComponentId === componentId) {
        return undefined;
      } else {
        return activeComponentId;
      }
    });
  },

  [SELECT_COMPONENT](state, action) {
    return state.merge({
      activeComponentState: NONE,
      activeComponentBreakpoint: NONE,
      activeComponentId: action.componentId
    });
  },

  [UPDATE_TREE_VIEW_DROP_SPOTS](state, action) {

    // TD: fix strange freezing here

    const { pos, draggedComponentId } = action;
    const componentsContainer = state.get('componentsContainer');

    const componentTreeId = state.getIn([
      'pages',
      state.get('currentPageId'),
      'componentTreeId'
    ]);

    if (!privateCache.treeViewInsertionPoints) {
      const insertionPoints = [];
      const draggedComponentParentId = componentsContainer.components
                                                          .getIn([draggedComponentId, 'parentId']);
      const beforeComponentIndex = componentsContainer.getIndex(draggedComponentId);
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

        return Immutable.Map({
          insertionIndex: nodeIndex,
          parentId,
          y: pos.top,
          points: [
            { x: pos.left, y: pos.top },
            { x: pos.left + w, y: pos.top }
          ],
          isDraggedComponent: (
            parentId === draggedComponentParentId &&
            (nodeIndex === beforeComponentIndex || nodeIndex === afterComponentIndex)
          )
        });
      }

      componentsContainer.walkChildren(componentTreeId, function (node, ind, cancel) {
        // Before
        let nodeParentId = node.get('parentId');
        let nodeId = node.get('id');

        if (ind === 0) {
          insertionPoints.push(getInsertionPoint(nodeId, ind, nodeParentId));
        }

        // After
        insertionPoints.push(getInsertionPoint(nodeId, ind + 1, nodeParentId));

        if (node.get('id') === draggedComponentId) {
          // Can't drag component inside itself
          cancel();
        } else if (node.get('componentType') === componentTypes.CONTAINER &&
                   node.get('childIds').size === 0) {
          // Inside
          insertionPoints.push(getInsertionPoint(undefined, 0, nodeId));
        }
      });

      privateCache.treeViewInsertionPoints = _.sortBy(insertionPoints, function (insertionPoint) {
        return insertionPoint.get('y');
      });
    }

    // Binary search to find 3 closest nodes
    const insertionPoints = privateCache.treeViewInsertionPoints;
    let left = 0, right = insertionPoints.length - 1;
    let middle;

    // This does not terminate

    while (left < right) {
      middle = Math.floor((right - left) / 2);
      let point = insertionPoints[middle];

      console.log(left, right);

      if (point.get('y') === pos.y) {
        break;
      } else if (pos.y < point.get('y')) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    }

    let minDist = Math.abs(pos.y - insertionPoints[middle].get('y'));
    let closestIndex = [
      middle - 1,
      middle + 1
    ].reduce((closestIndex, ind) => {
      let dist = Math.abs(pos.y - insertionPoints[ind].get('y'));
      if (dist < minDist) {
        minDist = dist;
        return ind;
      } else {
        return closestIndex;
      }
    }, middle);

    return state.merge({
      otherPossibleTreeViewDropSpots: Immutable.List([
        insertionPoints[closestIndex - 1],
        insertionPoints[closestIndex + 1],
      ]),
      selectedTreeViewDropSpot: insertionPoints[closestIndex]
    })
  },

  [RESET_TREE_VIEW_DROP_SPOTS](state) {
    delete privateCache.treeViewInsertionPoints;
    return state.merge({
      otherPossibleTreeViewDropSpots: undefined,
      selectedTreeViewDropSpot: undefined
    });
  },

  [CHANGE_COMPONENT_NAME](state, action) {
    let componentsContainer = state.get('componentsContainer');
    componentsContainer.components = componentsContainer.components.setIn(
      [action.componentId, 'name'],
      action.newName
    );

    return state;
  },

  [CREATE_COMPONENT_BLOCK](state, action) {
    const { newBlockId } = action;
    const componentsContainer = state.get('componentsContainer');

    let newComponents = componentsContainer.components.withMutations((components) => {
      const newBlockParentId = components.getIn([newBlockId, 'parentId']);
      components.mergeIn([newBlockId, 'name'],
                         {
                           name: 'New Component',
                           parentId: undefined
                         });

      /* Replace self with a variant */
      const variantId = components.createVariant(newBlockId, {
        parentId: newBlockParentId
      });

      components.updateIn([newBlockParentId, 'childIds'], (childIds) => {
        return childIds.map((childId) => {
          if (childId === newBlockId) {
            return variantId;
          } else {
            return childId;
          }
        });
      });
    });

    componentsContainer.components = newComponents;

    return state.update('yourComponentBoxes', (yourComponentBoxes) => {
      return yourComponentBoxes.push(newBlockId);
    });
  },

  [SET_COMPONENT_ATTRIBUTE](state, action) {
    state.get('componentsContainer').setAttribute(
      action.componentId,
      action.attrKey,
      action.newAttrValue,
      {
        breakpoint: state.activeComponentBreakpoint,
        state: state.activeComponentState
      }
    )

    return state;
  },

  [UNHOVER_COMPONENT](state) {
    return state.set('hoveredComponentId', undefined);
  },

  [HOVER_COMPONENT](state, action) {
    return state.set('hoveredComponentId', action.componentId);
  },
};
