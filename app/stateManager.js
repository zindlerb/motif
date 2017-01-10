import createStore from 'redux/lib/createStore';
import bindActionCreators from 'redux/lib/bindActionCreators';
import _ from 'lodash';

import {
  componentTreeActions,
  componentTreeReducer
} from './stateManagers/componentTreeStateManager.js';

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
  menu: { isOpen: false },

  otherPossibleComponentViewDropSpots: undefined,
  selectedComponentViewDropSpot: undefined,

  selectedTreeViewDropSpot: undefined,
  otherPossibleTreeViewDropSpots: undefined
};

/* Constants */
const OPEN_SITE = 'OPEN_SITE';
const SET_GLOBAL_CURSOR = 'SET_GLOBAL_CURSOR';
const ADD_NEW_PAGE = 'ADD_NEW_PAGE';
const CHANGE_PANEL = 'CHANGE_PANEL';
const CHANGE_PAGE = 'CHANGE_PAGE';
const SELECT_VIEW = 'SELECT_VIEW';
const OPEN_MENU = 'OPEN_MENU';
const CLOSE_MENU = 'CLOSE_MENU';


export const actions = Object.assign({
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

  openSite(state) {
    return {
      type: OPEN_SITE,
      state
    }
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
}, componentTreeActions);


const reducerObj = Object.assign({
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
  [SELECT_VIEW](state, action) {
    state.activeView = action.viewName;
  },

  [SET_GLOBAL_CURSOR](state, action) {
    state.globalCursor = action.cl;
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


  [OPEN_SITE](state, action) {
    Object.assign(state, action.state);
  },
}, componentTreeReducer);

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
