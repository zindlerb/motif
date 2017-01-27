import _ from 'lodash';
import { minDistanceBetweenPointAndLine } from '../utils';
import { DEFAULT } from '../base_components';

const UNHOVER_COMPONENT = 'UNHOVER_COMPONENT';
const HOVER_COMPONENT = 'HOVER_COMPONENT';

const ADD_VARIANT = 'ADD_VARIANT';
const MOVE_COMPONENT = 'MOVE_COMPONENT';
const DELETE_COMPONENT = 'DELETE_COMPONENT';

const SELECT_COMPONENT = 'SELECT_COMPONENT';

const UPDATE_COMPONENT_VIEW_DROP_SPOTS = 'UPDATE_COMPONENT_VIEW_DROP_SPOTS';
const RESET_COMPONENT_VIEW_DROP_SPOTS = 'RESET_COMPONENT_VIEW_DROPSPOTS';

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

  updateComponentViewDropSpots(pos) {
    return {
      type: UPDATE_COMPONENT_VIEW_DROP_SPOTS,
      pos,
    };
  },

  resetComponentViewDropSpots() {
    return {
      type: RESET_COMPONENT_VIEW_DROP_SPOTS,
    };
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
    state.activeComponentState = DEFAULT;
    state.activeComponentId = action.componentId;
  },

  [UPDATE_COMPONENT_VIEW_DROP_SPOTS](state, action) {
    const mousePos = action.pos;

    const currentPage = _.find(state.pages, (page) => {
      return page.id === state.currentPageId;
    });
    const nodeTreeId = currentPage.componentTreeId;

    const DIST_RANGE = 100;

    let minDist = DIST_RANGE;
    let closestNode;
    const nodesInMin = [];

    state.siteComponents.walkChildren(nodeTreeId, function (node) {
      this.getDropPoints(node.id).forEach(function (dropPoint) {
        const dist = minDistanceBetweenPointAndLine(mousePos, dropPoint.points);

        if (dist < DIST_RANGE) {
          nodesInMin.push(dropPoint);
          if (dist < minDist) {
            minDist = dist;
            closestNode = dropPoint;
          }
        }
      });
    });

    if (closestNode) {
      closestNode.isActive = true;
    }

    state.otherPossibleComponentViewDropSpots = nodesInMin;
    state.selectedComponentViewDropSpot = closestNode;
  },

  [RESET_COMPONENT_VIEW_DROP_SPOTS](state) {
    state.otherPossibleComponentViewDropSpots = undefined;
    state.selectedComponentViewDropSpot = undefined;
  },

  [UPDATE_TREE_VIEW_DROP_SPOTS](state, action) {
    const { pos, draggedComponentId } = action;
    const { siteComponents } = state;

    const currentPage = _.find(state.pages, page => page.id === state.currentPageId);
    /* Get Tree In Between Points */
    const componentTreeId = currentPage.componentTreeId;
    const insertionPoints = [];

    siteComponents.walkChildren(componentTreeId, function (node, ind) {
      if (node.id !== draggedComponentId) {
        const { x, y, w, h } = this.getRect(node.id, 'treeView');
        if (ind === 0) {
          insertionPoints.push({
            insertionIndex: ind,
            parentId: node.parentId,
            points: [{ x, y }, { x: x + w, y }],
          });
        }

        insertionPoints.push({
          insertionIndex: ind + 1,
          parentId: node.parentId,
          points: [{ x, y: y + h }, { x: x + w, y: y + h }],
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

    let component = siteComponents.components[componentId];
    siteComponents.components[componentId].name = 'New Component Block'
    const oldParentId = component.parentId;
    delete component.parentId;
    /* Replace self with a variant */
    const variant = siteComponents.createVariant(componentId, {
      parent: oldParentId
    });

    siteComponents.components[oldParentId].childIds.map(function (childId) {
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
      state.activeComponentState,
      action.attrKey,
      action.newAttrValue
    )
  },

  [UNHOVER_COMPONENT](state) {
    state.hoveredComponentId = undefined;
  },

  [HOVER_COMPONENT](state, action) {
    state.hoveredComponentId = action.componentId;
  },
};
