import { hri } from 'human-readable-ids';
import path from 'path';
import createStore from 'redux/lib/createStore';
import bindActionCreators from 'redux/lib/bindActionCreators';

import {
  componentTreeActions,
  componentTreeReducer
} from './stateManagers/componentTreeStateManager';
import {DEFAULT} from './base_components.js';

import { guid } from './utils';

import {
  container,
  header,
  text,
  image,
  root
} from './base_components';

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
  assets: [],
  currentPage: undefined,
  activeComponent: undefined,
  activeView: 'BORDER',
  activeBreakpoint: 'NONE',
  activeLeftPanel: 'PAGES',
  activeRightPanel: 'ATTRIBUTES',
  menu: { isOpen: false },

  otherPossibleComponentViewDropSpots: undefined,
  selectedComponentViewDropSpot: undefined,

  selectedTreeViewDropSpot: undefined,
  otherPossibleTreeViewDropSpots: undefined,

  // TD: dynamically set initial renderer width
  rendererWidth: 200,
};

/* Constants */
const SET_ACTIVE_COMPONENT_STATE = 'SET_ACTIVE_COMPONENT_STATE';
const SELECT_BREAKPOINT = 'SELECT_BREAKPOINT';
const OPEN_SITE = 'OPEN_SITE';
const SET_GLOBAL_CURSOR = 'SET_GLOBAL_CURSOR';
const ADD_NEW_PAGE = 'ADD_NEW_PAGE';
const CHANGE_PANEL = 'CHANGE_PANEL';
const CHANGE_PAGE = 'CHANGE_PAGE';
const SELECT_VIEW = 'SELECT_VIEW';
const OPEN_MENU = 'OPEN_MENU';
const CLOSE_MENU = 'CLOSE_MENU';
const SET_ACTIVE_FILENAME = 'SET_ACTIVE_FILENAME';
const ADD_ASSET = 'ADD_ASSET';
const SET_RENDERER_WIDTH = 'SET_RENDERER_WIDTH';

export const actions = Object.assign({
  setActiveComponentState(newState) {
    return {
      type: SET_ACTIVE_COMPONENT_STATE,
      newState
    }
  },
  setRendererWidth(newWidth) {
    return {
      type: SET_RENDERER_WIDTH,
      newWidth
    }
  },
  selectBreakpoint(newBreakpoint) {
    return {
      type: SELECT_BREAKPOINT,
      newBreakpoint
    }
  },
  openMenu(component, componentX, componentY) {
    return {
      type: OPEN_MENU,
      component,
      componentX,
      componentY
    };
  },
  closeMenu() {
    return {
      type: CLOSE_MENU
    };
  },
  addAsset(filename) {
    return {
      type: ADD_ASSET,
      filename
    }
  },
  openSite(state) {
    return {
      type: OPEN_SITE,
      state,
    };
  },
  setActiveFilename(filename) {
    return {
      type: SET_ACTIVE_FILENAME,
      filename
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
    const fakePage = root.createVariant();


    fakePage.addChild(container.createVariant());

    const newPage = {
      name: hri.random(),
      id: guid(),
      componentTree: fakePage,
    };
    state.activeRightPanel = 'DETAILS';
    state.pages.push(newPage);
    state.currentPage = newPage;
  },

  [CHANGE_PANEL](state, action) {
    const { panelSide, panelConst } = action;

    if (panelSide === 'right') {
      state.activeRightPanel = panelConst;
    } else if (panelSide === 'left') {
      state.activeLeftPanel = panelConst;
    }
  },

  [CHANGE_PAGE](state, action) {
    state.currentPage = action.page;
  },

  [OPEN_SITE](state, action) {
    Object.assign(state, action.state);
  },

  [SET_ACTIVE_FILENAME](state, action) {
    state.nonSerializable = { filename: action.filename };
  },

  [ADD_ASSET](state, action) {
    const { filename } = action;
    state.assets.push({
      src: filename,
      name: path.parse(filename).name
    });
  },
  [SELECT_BREAKPOINT](state, action) {
    var widths = {
      'TABLET': 640,
      'LAPTOP': 1024,
      'DESKTOP': 1824,
    }

    var newWidth = widths[action.newBreakpoint];

    if (newWidth) {
      state.rendererWidth = newWidth;
    }

    state.activeBreakpoint = action.newBreakpoint;
  },
  [SET_RENDERER_WIDTH](state, action) {
    state.rendererWidth = action.newWidth;
  },
  [SET_ACTIVE_COMPONENT_STATE](state, action) {
    state.activeComponentState = action.newState;
  }

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
