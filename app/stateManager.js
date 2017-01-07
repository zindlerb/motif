import createStore from 'redux/lib/createStore';
import bindActionCreators from 'redux/lib/bindActionCreators';
import _ from 'lodash';

import {
  Component,
  container,
  header,
  text,
  image,
  Container,
  Header,
  Text,
  Image,
  CONTAINER,
  HEADER,
  TEXT,
  IMAGE
} from './base_components';
import { minDistanceBetweenPointAndLine, guid } from './utils';

const initialState = {
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
  menu: { isOpen: false }
};

function serializerFactory() {
  // serializableKeys ['siteName', 'componentBoxes', 'pages', 'currentPage'];

  function replaceComponentsOnComponentDatum(componentData, cb) {
    _.forEach(componentData, function(val, key) {
      if (_.includes(['master', 'parent'], key)) {
        componentData[key] = cb(val);
      } else if (_.includes(['_variants', 'children'], key)) {
        componentData[key] = _.map(componentData[key], function(compData) {
          return cb(compData);
        });
      }
    });
  }

  function serialize(state) {
    var componentMap = {};
    var newPages = [];
    var newComponentBoxes = {
      ours: [],
      yours: []
    }

    function putSelfAndAllChildrenInComponentMap(component) {
      componentMap[component.id] = component.getSerializableData();

      component.walkChildren(function(childComponent) {
        componentMap[childComponent.id] = childComponent.getSerializableData();
      });
    }

    // Put all components and their children in component map.
    state.pages.forEach(function(page) {
      let newPage = Object.assign({}, page);
      putSelfAndAllChildrenInComponentMap(page.componentTree);

      newPage.componentTree = page.componentTree.id
      newPages.push(newPage);
    });

    ['ours', 'yours'].forEach(function (key) {
      newComponentBoxes[key] = _.map(state.componentBoxes[key], function (component) {
        putSelfAndAllChildrenInComponentMap(component);
        return component.id;
      });
    });

    // Within component map transform all component references into ids
    _.forEach(componentMap, function(component) {
      replaceComponentsOnComponentDatum(component, function (childComponent) {
        if (childComponent) {
          return childComponent.id;
        } else {
          return childComponent;
        }
      });
    });

    return JSON.stringify({
      siteName: state.siteName,
      pages: newPages,
      componentMap,
      componentBoxes: newComponentBoxes,
      currentPage: state.currentPage.id
    })
  }

  function deserialize(jsonState) {
    let {
      siteName,
      pages,
      componentMap,
      componentBoxes,
      currentPage
    } = JSON.parse(jsonState);

    function componentDataToClass(componentData) {
      if (componentData.componentType === CONTAINER) {
        return new Container(componentData);
      } else if (componentData.componentType === TEXT) {
        return new Text(componentData);
      } else if (componentData.componentType === IMAGE) {
        return new Image(componentData);
      } else if (componentData.componentType === HEADER) {
        return new Header(componentData);
      }
    }

    let componentClassMap = {};

    _.forEach(componentMap, function(componentData, key) {
      componentClassMap[key] = componentDataToClass(componentData);
    });

    _.forEach(componentClassMap, function(component, key) {
      replaceComponentsOnComponentDatum(
        component,
        function(id) {
          return componentClassMap[id];
        }
      );
    });

    let newPages = _.map(pages, function(page) {
      page.componentTree = componentClassMap[page.componentTree];
      return page;
    });

    _.forEach(componentBoxes, function (val, key) {
      componentBoxes[key] = _.map(val, function(componentId) {
        return componentClassMap[componentId];
      });
    });

    let currentPageObj = _.find(newPages, function (page) {
      return page.id === currentPage;
    });

    return {
      siteName,
      pages: newPages,
      componentBoxes,
      currentPage: currentPageObj
    }
  }

  return {serialize, deserialize};
}

export let serializer = serializerFactory();

/* Constants */
const WRAP_COMPONENT = 'WRAP_COMPONENT';
const INSERT_COMPONENT = 'INSERT_COMPONENT';
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
const DELETE_COMPONENT = 'DELETE_COMPONENT';

const SELECT_VIEW = 'SELECT_VIEW';
const OPEN_MENU = 'OPEN_MENU';
const CLOSE_MENU = 'CLOSE_MENU';

export const actions = {
  openMenu(component, componentX, componentY) {
    return {
      type: OPEN_MENU,
      component,
      componentX,
      componentY
    }
  },
  closeMenu() {
    return {
      type: CLOSE_MENU
    }
  },
  deleteActiveComponent(component) {
    return {
      type: DELETE_COMPONENT,
      component
    }
  },
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

  wrapComponent(parentComponent) {
    return {
      type: WRAP_COMPONENT,
      parentComponent
    }
  },

  insertComponent(childComponent) {
    return {
      type: INSERT_COMPONENT,
      childComponent
    }
  }
};


const reducerObj = {
  [OPEN_MENU](state, action) {
    state.menu.isOpen = true;
    state.menu.component = action.component;
    state.menu.componentX = action.componentX;
    state.menu.componentY = action.componentY;
  },

  [CLOSE_MENU](state) {
    state.menu.isOpen = false;
    state.menu.component = undefined;
  },

  [WRAP_COMPONENT](state, action) {
    let component = state.menu.component;
    let componentParent = component.parent;
    let newParent = action.parentComponent.createVariant();

    component.parent.removeChild(component);
    newParent.addChild(component);
    componentParent.addChild(newParent);
  },

  [INSERT_COMPONENT](state, action) {
    let component = state.menu.component;
    component.addChild(action.childComponent.createVariant(), 0);
  },

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
    const fakePage = container.createVariant(
      {
        attributes: {
          height: '100%',
        },
        isRoot: true,
      },
    );

    fakePage.addChild(container.createVariant());

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

    insertionPoints.forEach(function(insertionPoint) {
      var distFromNode = minDistanceBetweenPointAndLine(pos, insertionPoint.points);

      if (closestInsertionPoints.length < 3) {
        closestInsertionPoints.push(insertionPoint);
        closestDistances.push(distFromNode);
      } else {
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
    Object.assign(state, action.state);
  },
  [DELETE_COMPONENT](state, action) {
    let {component} = action;
    component.deleteSelf();

    if (component.id === state.activeComponent.id) {
      state.activeComponent = undefined;
    }
  }
};

function reducer(state, action) {
  if (reducerObj[action.type]) {
    reducerObj[action.type](state, action);
  }

  /*   console.log(action.type, _.cloneDeep(state));*/

  return state;
}

export const store = createStore(reducer, initialState);
export const actionDispatch = bindActionCreators(actions, store.dispatch);

actionDispatch.addPage();
