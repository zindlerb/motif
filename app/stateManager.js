import createStore from 'redux/lib/createStore';
import bindActionCreators from 'redux/lib/bindActionCreators';

import { Container, Header, Text, Image } from './base_components';
import { distanceBetweenPoints, guid } from './utils';

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
  activeView: "BORDER",
  activeLeftPanel: 'COMPONENTS',
  activeRightPanel: 'ATTRIBUTES',
  nodeIdsInHoverRadius: {}
};

/* Constants */
const SET_HOVERED_NODES = 'SET_HOVERED_NODES';
const SET_COMPONENT_TREE_HIGHLIGHT = 'SET_COMPONENT_TREE_HIGHLIGHT';
const RESET_COMPONENT_TREE_HIGHLIGHT = 'RESET_COMPONENT_TREE_HIGHLIGHT';

const ADD_NEW_COMPONENT = 'ADD_NEW_COMPONENT';
const ADD_NEW_PAGE = 'ADD_NEW_PAGE';

const CHANGE_PANEL = 'CHANGE_PANEL';
const CHANGE_PAGE = 'CHANGE_PAGE';

const SELECT_COMPONENT = 'SELECT_COMPONENT';
const SET_COMPONENT_ATTRIBUTE = 'SET_COMPONENT_ATTRIBUTE';

const SELECT_VIEW = "SELECT_VIEW";

function findDropSpot(mousePos, nodeTree) {
  const DIST_RANGE = 100;

  let minDist = DIST_RANGE;
  let closestNode;
  const nodesInMin = [];

  nodeTree.walkChildren(function (node) {
    if (node.getDropPoints) {
      node.getDropPoints().forEach(function (dropPoint) {
        const dist = distanceBetweenPoints(mousePos, dropPoint.point);

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
    return { closestNode, nodesInMin };
  } else {
    return {};
  }
}

export const actions = {
  setHoveredNodes(x, y) {
    return {
      type: SET_HOVERED_NODES,
      mousePosition: {x, y}
    }
  },
  setComponentMoveHighlight(pos) {
    return {
      type: SET_COMPONENT_TREE_HIGHLIGHT,
      pos,
    };
  },
  addComponent(Component) {
    return {
      type: ADD_NEW_COMPONENT,
      Component,
    };
  },

  selectComponent(component) {
    return {
      type: SELECT_COMPONENT,
      component,
    };
  },

  changePanel(panelConst) {
    return {
      type: CHANGE_PANEL,
      panelConst,
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
      viewName
    }
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

  [SET_COMPONENT_TREE_HIGHLIGHT](state, action) {
    const dropSpots = findDropSpot(action.pos, state.currentPage.componentTree);

    state.dropPoints = dropSpots.nodesInMin;
    state.selectedDropPoint = dropSpots.closestNode;
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
      parent.addChild(
        action.Component.createVariant(),
        insertionIndex,
      );
    }

    /* state.dropPoints = undefined;
     * state.selectedDropPoint = undefined;*/

    /* Can't use delete because setState will keep the old state when merged */
    state.dropPoints = undefined;
    state.selectedDropPoint = undefined;
  },

  [SELECT_COMPONENT](state, action) {
    state.activeComponent = action.component;
  },

  [ADD_NEW_PAGE](state) {
    var fakePage = container.createVariant(
      {
        attributes: {
          height: "100%"
        },
        isRoot: true,
        children: [
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
          container.createVariant(
            {
              attributes: {height: "100px"}
            }
          )
        ]
      }
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
    state.activeLeftPanel = action.panelConst;
  },

  [CHANGE_PAGE](state, action) {
    state.currentPage = action.page;
  },

  [SET_HOVERED_NODES](state, action) {
    const HOVER_RADIUS = 100;
    const nodesInRadius = {};
    state.currentPage.componentTree.walkChildren(function(node) {
      var {middleX, middleY} = node.getRect();

      if (distanceBetweenPoints({x: middleX, y: middleY}, action.mousePosition) < HOVER_RADIUS) {
        nodesInRadius[node.id] = true;
      }
    });

    state.nodeIdsInHoverRadius = nodesInRadius;
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
