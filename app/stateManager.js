import createStore from 'redux/lib/createStore';
import bindActionCreators from 'redux/lib/bindActionCreators';
import _ from 'lodash';

import { Container, Header, Text, Image } from './base_components';
import { minDistanceBetweenPointAndLine, guid } from './utils';

const container = Container;
const header = Header;
const text = Text;
const image = Image;

const initialState = {
  componentMap: {
    [container.id]: container,
    [header.id]: header,
    [text.id]: text,
    [image.id]: image,
  },
  siteName: 'Something',
  componentBoxes: {
    ours: [
      container,
      header,
      text,
      image,
    ],
    yours: [],
  },
  pages: [],
  currentPage: undefined,
  activeComponent: undefined,
  activeView: 'BORDER',
  activeLeftPanel: 'COMPONENTS',
  activeRightPanel: 'ATTRIBUTES',
  nodeIdsInHoverRadius: {},
};

/* Constants */
const OPEN_SITE = 'OPEN_SITE';
const RESET_TREE_MOVE_HIGHLIGHT = 'RESET_TREE_MOVE_HIGHLIGHT';
const CHANGE_COMPONENT_NAME = 'CHANGE_COMPONENT_NAME';
const CREATE_COMPONENT_BLOCK = 'CREATE_COMPONENT_BLOCK';
const SET_GLOBAL_CURSOR = 'SET_GLOBAL_CURSOR';
const SET_HOVERED_NODES = 'SET_HOVERED_NODES';
const SET_COMPONENT_TREE_HIGHLIGHT = 'SET_COMPONENT_TREE_HIGHLIGHT';
const RESET_COMPONENT_TREE_HIGHLIGHT = 'RESET_COMPONENT_TREE_HIGHLIGHT';
const SET_TREE_MOVE_HIGHLIGHT = 'SET_TREE_MOVE_HIGHLIGHT';

const ADD_NEW_COMPONENT = 'ADD_NEW_COMPONENT';
const ADD_NEW_PAGE = 'ADD_NEW_PAGE';

const CHANGE_PANEL = 'CHANGE_PANEL';
const CHANGE_PAGE = 'CHANGE_PAGE';

const SELECT_COMPONENT = 'SELECT_COMPONENT';
const SET_COMPONENT_ATTRIBUTE = 'SET_COMPONENT_ATTRIBUTE';

const SELECT_VIEW = 'SELECT_VIEW';

export const actions = {
  openSite(state) {
    return {
      type: OPEN_SITE,
      state
    }
  },
  resetTreeHighlight() {
    return {
      type: RESET_TREE_MOVE_HIGHLIGHT,
    }
  },
  changeComponentName(component, newName) {
    return {
      type: CHANGE_COMPONENT_NAME,
      component,
      newName
    }
  },
  setHoveredNodes(x, y) {
    return {
      type: SET_HOVERED_NODES,
      mousePosition: { x, y },
    };
  },
  setComponentMoveHighlight(pos) {
    return {
      type: SET_COMPONENT_TREE_HIGHLIGHT,
      pos,
    };
  },

  setTreeMoveHighlight(pos) {
    return {
      type: SET_TREE_MOVE_HIGHLIGHT,
      pos,
    };
  },

  createComponentBlock(component) {
    console.log("create comp")
    return {
      type: CREATE_COMPONENT_BLOCK,
      component
    }
  },

  addComponent(Component, isExistingComponent) {
    return {
      type: ADD_NEW_COMPONENT,
      Component,
      isExistingComponent,
    };
  },

  selectComponent(component) {
    return {
      type: SELECT_COMPONENT,
      component,
    };
  },

  setGlobalCursor(cl) {
    return {
      type: SET_GLOBAL_CURSOR,
      cl,
    };
  },

  changePanel(panelConst, panelSide) {
    return {
      type: CHANGE_PANEL,
      panelConst,
      panelSide,
    };
  },

  /* Pages */
  addPage() {
    return {
      type: ADD_NEW_PAGE,
    };
  },

  changePage(page) {
    return {
      type: CHANGE_PAGE,
      page,
    };
  },

  selectView(viewName) {
    return {
      type: SELECT_VIEW,
      viewName,
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


const reducerObj = {
  [SELECT_VIEW](state, action) {
    state.activeView = action.viewName;
  },

  [SET_GLOBAL_CURSOR](state, action) {
    state.globalCursor = action.cl;
  },

  [SET_COMPONENT_TREE_HIGHLIGHT](state, action) {
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

    state.dropPoints = nodesInMin;
    state.selectedDropPoint = closestNode;
  },

  [RESET_COMPONENT_TREE_HIGHLIGHT](state) {
    delete state.dropPoints;
  },

  [SET_COMPONENT_ATTRIBUTE](state, action) {
    action.component.attributes[action.attrKey] = action.newAttrValue;
  },

  [ADD_NEW_COMPONENT](state, action) {
    if (state.selectedDropPoint) {
      const { parent, insertionIndex } = state.selectedDropPoint;
      let addedComponent;

      if (action.isExistingComponent) {
        action.Component.deleteSelf();
        addedComponent = action.Component;
      } else {
        addedComponent = action.Component.createVariant();
      }

      parent.addChild(
        addedComponent,
        insertionIndex,
      );
    }

    /* Can't use delete because setState will keep the old state when merged */
    state.dropPoints = undefined;
    state.selectedDropPoint = undefined;
  },

  [SELECT_COMPONENT](state, action) {
    state.activeComponent = action.component;
  },

  [ADD_NEW_PAGE](state) {
    /*
       container.createVariant(
       {
       attributes: { height: "100px" },
       children: [header.createVariant()]
       }
       ),
       container.createVariant(
       {
       children: [
       container.createVariant(),
       container.createVariant()
       ]
       }
       ),
     */
    const fakePage = container.createVariant(
      {
        attributes: {
          height: '100%',
        },
        isRoot: true,
        children: [
          container.createVariant(
            {
              /*               attributes: {height: "100px"}*/
            },
          ),
        ],
      },
    );

    /*
       container.createVariant({
       attributes: {
       height: "100%"
       },
       isRoot: true,
       })
     */

    const newPage = {
      name: 'New Page',
      id: guid(),
      componentTree: fakePage,
    };

    state.pages.push(newPage);
    state.currentPage = newPage;
  },

  [CHANGE_PANEL](state, action) {
    if (action.panelSide) {
      state.activeRightPanel = action.panelConst;
    } else {
      state.activeLeftPanel = action.panelConst;
    }
  },

  [CHANGE_PAGE](state, action) {
    state.currentPage = action.page;
  },

  [SET_HOVERED_NODES](state, action) {
    const HOVER_RADIUS = 100;
    const nodesInRadius = {};
    state.currentPage.componentTree.walkChildren(function (node) {
      const { middleX, middleY } = node.getRect('pageView');

      if (distanceBetweenPoints({ x: middleX, y: middleY }, action.mousePosition) < HOVER_RADIUS) {
        nodesInRadius[node.id] = true;
      }
    });

    state.nodeIdsInHoverRadius = nodesInRadius;
  },
  [RESET_TREE_MOVE_HIGHLIGHT](state) {
    state.treeDropPoints = undefined;
    state.treeSelectedDropPoint = undefined;
  },
  [SET_TREE_MOVE_HIGHLIGHT](state, action) {
    const { pos } = action;
    const closestInsertionPoints = [];
    const closestDistances = [];
    /* Get Tree In Between Points */
    const componentTree = state.currentPage.componentTree;
    const insertionPoints = [];

    componentTree.walkChildren(function (node, ind) {
      const { x, y, w, h } = node.getRect('treeView');
      if (node.isFirstChild()) {
        insertionPoints.push({
          insertionIndex: ind,
          parent: node.parent,
          points: [{ x, y: y }, { x: x + w, y: y }],
        });
      } else {
        insertionPoints.push({
          insertionIndex: ind,
          parent: node.parent,
          points: [{ x, y: y + h }, { x: x + w, y: y + h }],
        });
      }
    });

    console.log("insertionPoints", insertionPoints);

    insertionPoints.forEach(function(insertionPoint) {
      var distFromNode = minDistanceBetweenPointAndLine(pos, insertionPoint.points);

      if (closestInsertionPoints.length < 3) {
        closestInsertionPoints.push(insertionPoint);
        closestDistances.push(distFromNode);
      } else {
        console.log("loop");
        for (var i = 0; i < closestDistances.length; i++) {
          if (closestDistances[i] < distFromNode) {
            closestInsertionPoints.splice(i, 0, insertionPoint)
            closestDistances.splice(i, 0, distFromNode);
            break;
          }
        }

        if (closestInsertionPoints.length > 3) {
          closestInsertionPoints.pop();
          closestDistances.pop();
        }
      }
    });

    state.treeDropPoints = _.tail(closestInsertionPoints);
    state.treeSelectedDropPoint = _.first(closestInsertionPoints);

    console.log("closestInsertionPoints", closestInsertionPoints);
  },
  [CHANGE_COMPONENT_NAME](state, action) {
    action.component.name = action.newName;
  },
  [CREATE_COMPONENT_BLOCK](state, action) {
    const { component } = action;
    component.name = "New Component Block";
    const oldParent = component.parent;
    delete component.parent;
    /* Replace self with a variant */
    const variant = component.createVariant({
      parent: oldParent
    });

    oldParent.children.map(function(child) {
      if (child.id === component.id) {
        return variant;
      } else {
        return child
      }
    });

    state.componentBoxes.yours.push(component);
  },
  [OPEN_SITE](state, action) {
    for (var key in state) {
      delete state[key];
    }
    Object.assign(state, action.state);
  }
};


function reducer(state, action) {
  if (reducerObj[action.type]) {
    reducerObj[action.type](state, action);
  }

  return state;
}

export const store = createStore(reducer, initialState);
export const actionDispatch = bindActionCreators(actions, store.dispatch);

actionDispatch.addPage();
