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
    // TD: fix
    // where to put tree view dropspots?

    const { pos, draggedComponentId } = action;
    const { componentsContainer } = state;

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
    const parentId = componentsContainer.components[draggedComponentId].parentId;
    const beforeComponentIndex = componentsContainer.getIndex(draggedComponentId);
    const afterComponentIndex = beforeComponentIndex + 1;

    function isDraggedComponent(node, ind) {
      return (
        node.parentId === parentId &&
        (ind === beforeComponentIndex || ind === afterComponentIndex)
      );
    }

    componentsContainer.walkChildren(componentTreeId, function (node, ind, cancel) {
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

      if (node.id === draggedComponentId) {
        // Can't drag component inside itself
        cancel();
      } else if (node.componentType === componentTypes.CONTAINER &&
                 node.childIds.length === 0) {
        // Inside
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
    const { componentId } = action;
    const componentsContainer = state.get('componentsContainer');

    /*
       need to:
         - remove the parent of the new component block
         - make variant of component block
         - set parent to variants parent
         - set child of parent to variant
         - add variant id to component blocks
     */

    // fix bad undo!!!!
    let newComponents = componentsContainer.components.withMutations((components) => {
      const newBlockParentId = masterComponent.parentId;
      components.merge(
        newBlockId,
        {
          name: 'New Component'
        }
      )

      delete masterComponent.parentId;
      /* Replace self with a variant */
      const variant = componentsContainer.createVariant(componentId, {
        parentId: oldParentId
      });

      const parentComponent = componentsContainer.components[oldParentId];

      parentComponent.childIds = parentComponent.childIds.map(function (childId) {
        if (childId === componentId) {
          return variant.id;
        } else {
          return childId;
        }
      });
    });

    componentsContainer.components = newComponents;

    return state.update('yourComponentBoxes', (yourComponentBoxes) => {
      return yourComponentBoxes.push(componentId);
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
