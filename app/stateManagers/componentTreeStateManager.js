import _ from 'lodash';
import { minDistanceBetweenPointAndLine } from '../utils';

const WRAP_COMPONENT = 'WRAP_COMPONENT';
const ADD_COMPONENT = 'ADD_COMPONENT';
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
  wrapComponent(parentComponent, childComponent) {
    return {
      type: WRAP_COMPONENT,
      parentComponent,
      childComponent
    };
  },

  moveComponent(component, parentComponent, insertionIndex) {
    return {
      type: MOVE_COMPONENT,
      component,
      parentComponent,
      insertionIndex
    };
  },

  addComponent(component, parentComponent, insertionIndex) {
    return {
      type: ADD_COMPONENT,
      component,
      parentComponent,
      insertionIndex
    };
  },

  deleteComponent(component) {
    return {
      type: DELETE_COMPONENT,
      component
    };
  },

  selectComponent(component) {
    return {
      type: SELECT_COMPONENT,
      component,
    };
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

  updateTreeViewDropSpots(pos, draggedComponent) {
    return {
      type: UPDATE_TREE_VIEW_DROP_SPOTS,
      pos,
      draggedComponent
    };
  },

  resetTreeViewDropSpots() {
    return {
      type: RESET_TREE_VIEW_DROP_SPOTS,
    };
  },

  changeComponentName(component, newName) {
    return {
      type: CHANGE_COMPONENT_NAME,
      component,
      newName
    };
  },

  createComponentBlock(component) {
    return {
      type: CREATE_COMPONENT_BLOCK,
      component
    };
  },

  setComponentAttribute(component, attrKey, newAttrValue) {
    return {
      type: SET_COMPONENT_ATTRIBUTE,
      component,
      attrKey,
      newAttrValue,
    };
  },
};


export const componentTreeReducer = {
  [WRAP_COMPONENT](state, action) {
    let component = action.childComponent;
    let componentParent = component.parent;
    let newParent = action.parentComponent.createVariant();

    component.parent.removeChild(component);
    newParent.addChild(component);
    componentParent.addChild(newParent);
  },

  [ADD_COMPONENT](state, action) {
    let { component, parentComponent, insertionIndex } = action;

    parentComponent.addChild(component.createVariant(), insertionIndex);
  },

  [MOVE_COMPONENT](state, action) {
    let { component, parentComponent, insertionIndex } = action;
    component.removeSelf();
    parentComponent.addChild(component, insertionIndex);
  },

  [DELETE_COMPONENT](state, action) {
    let { component } = action;
    component.removeSelf();

    if (state.activeComponent && component.id === state.activeComponent.id) {
      state.activeComponent = undefined;
    }
  },

  [SELECT_COMPONENT](state, action) {
    state.activeComponent = action.component;
  },

  [UPDATE_COMPONENT_VIEW_DROP_SPOTS](state, action) {
    const mousePos = action.pos;
    const nodeTree = state.currentPage.componentTree;

    const DIST_RANGE = 100;

    let minDist = DIST_RANGE;
    let closestNode;
    const nodesInMin = [];

    nodeTree.walkChildren(function (node) {
      if (node.getDropPoints) {
        node.getDropPoints().forEach(function (dropPoint) {
          const dist = minDistanceBetweenPointAndLine(mousePos, dropPoint.points);

          if (dist < DIST_RANGE) {
            nodesInMin.push(dropPoint);
            if (dist < minDist) {
              minDist = dist;
              closestNode = dropPoint;
            }
          }
        });
      }
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
    const { pos, draggedComponent } = action;
    const closestInsertionPoints = [];
    const closestDistances = [];
    /* Get Tree In Between Points */
    const componentTree = state.currentPage.componentTree;
    const insertionPoints = [];

    componentTree.walkChildren(function (node, ind) {
      if (node.id !== draggedComponent.id) {
        const { x, y, w, h } = node.getRect('treeView');
        if (node.isFirstChild()) {
          insertionPoints.push({
            insertionIndex: ind,
            parent: node.parent,
            points: [{ x, y }, { x: x + w, y }],
          });
        }

        insertionPoints.push({
          insertionIndex: ind + 1,
          parent: node.parent,
          points: [{ x, y: y + h }, { x: x + w, y: y + h }],
        });
      }
    });

    let sortedInsertionPoints = _.sortBy(insertionPoints, function(insertionPoint) {
      return minDistanceBetweenPointAndLine(pos, insertionPoint.points);
    }).slice(0,3);

    state.otherPossibleTreeViewDropSpots = _.tail(sortedInsertionPoints);
    state.selectedTreeViewDropSpot = _.first(sortedInsertionPoints);
  },

  [RESET_TREE_VIEW_DROP_SPOTS](state) {
    state.otherPossibleTreeViewDropSpots = undefined;
    state.selectedTreeViewDropSpot = undefined;
  },

  [CHANGE_COMPONENT_NAME](state, action) {
    action.component.name = action.newName;
  },

  [CREATE_COMPONENT_BLOCK](state, action) {
    const { component } = action;
    component.name = 'New Component Block';
    const oldParent = component.parent;
    delete component.parent;
    /* Replace self with a variant */
    const variant = component.createVariant({
      parent: oldParent
    });

    oldParent.children.map(function (child) {
      if (child.id === component.id) {
        return variant;
      } else {
        return child;
      }
    });

    state.componentBoxes.yours.push(component);
  },

  [SET_COMPONENT_ATTRIBUTE](state, action) {
    action.component.attributes[action.attrKey] = action.newAttrValue;
  },
};
