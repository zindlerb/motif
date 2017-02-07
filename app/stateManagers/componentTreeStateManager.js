import $ from 'jquery';
import _ from 'lodash';
import { minDistanceBetweenPointAndLine, Rect } from '../utils';
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
    };
  },

  hoverComponent(componentId) {
    return {
      type: HOVER_COMPONENT,
      componentId
    }
  },

  unHoverComponent() {
    return {
      type: UNHOVER_COMPONENT
    }
  },

  updateTreeViewDropSpots(pos, draggedComponentId) {
    return {
      type: UPDATE_TREE_VIEW_DROP_SPOTS,
      pos,
      draggedComponentId
    };
  },

  resetTreeViewDropSpots() {
    return {
      type: RESET_TREE_VIEW_DROP_SPOTS,
    };
  },

  changeComponentName(componentId, newName) {
    return {
      type: CHANGE_COMPONENT_NAME,
      componentId,
      newName
    };
  },

  createComponentBlock(componentId) {
    return {
      type: CREATE_COMPONENT_BLOCK,
      componentId
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
    let siteComponents = state.siteComponents;

    siteComponents.addChild(
      parentComponentId,
      siteComponents.createVariant(componentId, spec).id,
      insertionIndex
    );
  },

  [MOVE_COMPONENT](state, action) {
    let { componentId, parentComponentId, insertionIndex } = action;
    let siteComponents = state.siteComponents;

    siteComponents.moveComponent(componentId, parentComponentId, insertionIndex);
  },

  [DELETE_COMPONENT](state, action) {
    let { componentId } = action;
    let { siteComponents, activeComponentId } = state;

    siteComponents.deleteComponent(componentId);

    if (activeComponentId === componentId) {
      state.activeComponentId = undefined;
    }
  },

  [SELECT_COMPONENT](state, action) {
    state.activeComponentState = NONE;
    state.activeComponentBreakpoint = NONE;
    state.activeComponentId = action.componentId;
  },

  [UPDATE_TREE_VIEW_DROP_SPOTS](state, action) {
    const { pos, draggedComponentId } = action;
    const { siteComponents } = state;

    const currentPage = _.find(state.pages, page => page.id === state.currentPageId);
    /* Get Tree In Between Points */
    const componentTreeId = currentPage.componentTreeId;
    const insertionPoints = [];

    function getPoints(nodeId, index) {
      const { x, y, w } = new Rect($('.treeDropSpot_' + nodeId + '_' + index));

      return [
        { x, y },
        { x: x + w, y }
      ]
    }

    /*
       Need to add in a isDraggedComponent param to the insertion points
       Then not render and not move if the param is present

       get component indexs -
       use them to compare to the
     */
    const parentId = siteComponents.components[draggedComponentId].parentId;
    const beforeComponentIndex = siteComponents.getIndex(draggedComponentId);
    const afterComponentIndex = beforeComponentIndex + 1;

    function isDraggedComponent(node, ind) {
      return (
        node.parentId === parentId &&
        (ind === beforeComponentIndex || ind === afterComponentIndex)
      );
    }

    siteComponents.walkChildren(componentTreeId, function (node, ind) {
      // Before
      if (ind === 0) {
        insertionPoints.push({
          insertionIndex: ind,
          parentId: node.parentId,
          points: getPoints(node.id, 0),
          isDraggedComponent: isDraggedComponent(node, ind)
        });
      }

      // After
      insertionPoints.push({
        insertionIndex: ind + 1,
        parentId: node.parentId,
        points: getPoints(node.id, ind + 1),
        isDraggedComponent: isDraggedComponent(node, ind + 1)
      });

      // Inside
      if (node.componentType === componentTypes.CONTAINER &&
          node.childIds.length === 0 &&
          node.id !== draggedComponentId) {
        insertionPoints.push({
          insertionIndex: 0,
          parentId: node.id,
          points: getPoints(node.id, 'emptyChild')
        });
      }
    });

    let sortedInsertionPoints = _.sortBy(insertionPoints, function (insertionPoint) {
      return minDistanceBetweenPointAndLine(pos, insertionPoint.points);
    }).slice(0, 3);

    state.otherPossibleTreeViewDropSpots = _.tail(sortedInsertionPoints);
    state.selectedTreeViewDropSpot = _.first(sortedInsertionPoints);
  },

  [RESET_TREE_VIEW_DROP_SPOTS](state) {
    state.otherPossibleTreeViewDropSpots = undefined;
    state.selectedTreeViewDropSpot = undefined;
  },

  [CHANGE_COMPONENT_NAME](state, action) {
    state.siteComponents.components[action.componentId].name = action.newName;
  },

  [CREATE_COMPONENT_BLOCK](state, action) {
    const { componentId } = action;
    const { siteComponents } = state;

    let masterComponent = siteComponents.components[componentId];
    masterComponent.name = 'New Component Block'
    const oldParentId = masterComponent.parentId;
    delete masterComponent.parentId;
    /* Replace self with a variant */
    const variant = siteComponents.createVariant(componentId, {
      parentId: oldParentId
    });

    const parentComponent = siteComponents.components[oldParentId];

    parentComponent.childIds = parentComponent.childIds.map(function (childId) {
      if (childId === componentId) {
        return variant.id;
      } else {
        return childId;
      }
    });

    state.componentBoxes.yours.push(componentId);
  },

  [SET_COMPONENT_ATTRIBUTE](state, action) {
    state.siteComponents.setAttribute(
      action.componentId,
      action.attrKey,
      action.newAttrValue,
      {
        breakpoint: state.activeComponentBreakpoint,
        state: state.activeComponentState
      }
    )
  },

  [UNHOVER_COMPONENT](state) {
    state.hoveredComponentId = undefined;
  },

  [HOVER_COMPONENT](state, action) {
    state.hoveredComponentId = action.componentId;
  },
};
