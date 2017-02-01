import _ from 'lodash';
import { hri } from 'human-readable-ids';
import path from 'path';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'
import fs from 'fs';

import serializer from './serializer';
import {
  componentTreeActions,
  componentTreeReducer
} from './stateManagers/componentTreeStateManager';
import { guid } from './utils';
import { mainViewTypes } from './constants';
import {
  SiteComponents,
  container,
  header,
  text,
  image,
  root
} from './base_components';

const initialState = {
  siteName: 'Something',
  recentSites: [],
  componentBoxes: {
    ours: [
      container.id,
      header.id,
      text.id,
      image.id,
    ],
    yours: [],
  },
  pages: [],
  assets: [],
  currentPageId: undefined,
  activeComponentId: undefined,
  hoveredComponentId: undefined,
  activeView: 'BORDER',
  activeBreakpoint: 'NONE',
  activeLeftPanel: 'COMPONENTS',
  activeRightPanel: 'DETAILS',
  currentMainView: mainViewTypes.EDITOR,
  menu: { isOpen: false },

  siteComponents: new SiteComponents(),

  otherPossibleComponentViewDropSpots: undefined,
  selectedComponentViewDropSpot: undefined,

  selectedTreeViewDropSpot: undefined,
  otherPossibleTreeViewDropSpots: undefined,

  // TD: dynamically set initial renderer width
  rendererWidth: 200,

  fileMetaData: {}
};

/* Constants */
const SET_PAGE_VALUE = 'SET_PAGE_VALUE';
const SET_ACTIVE_COMPONENT_STATE = 'SET_ACTIVE_COMPONENT_STATE';
const SELECT_BREAKPOINT = 'SELECT_BREAKPOINT';

const SITE_SAVE_ATTEMPT = 'SITE_SAVE_ATTEMPT';
const SITE_SAVE_SUCCESS = 'SITE_SAVE_SUCCESS';
const SITE_SAVE_FAILURE = 'SITE_SAVE_FAILURE';

const SITE_LOAD_ATTEMPT = 'SITE_LOAD_ATTEMPT';
const SITE_LOAD_SUCCESS = 'SITE_LOAD_SUCCESS';
const SITE_LOAD_FAILURE = 'SITE_LOAD_FAILURE';

const SET_GLOBAL_CURSOR = 'SET_GLOBAL_CURSOR';
const ADD_NEW_PAGE = 'ADD_NEW_PAGE';
const CHANGE_PANEL = 'CHANGE_PANEL';
const CHANGE_PAGE = 'CHANGE_PAGE';
const SELECT_VIEW = 'SELECT_VIEW';
const OPEN_MENU = 'OPEN_MENU';
const CLOSE_MENU = 'CLOSE_MENU';
const CHANGE_MAIN_VIEW = 'CHANGE_MAIN_VIEW';

const ADD_ASSET = 'ADD_ASSET';
const SET_RENDERER_WIDTH = 'SET_RENDERER_WIDTH';

export const actions = Object.assign({
  setPageValue(key, newValue) {
    return {
      type: SET_PAGE_VALUE,
      key,
      newValue
    }
  },
  changeMainView(newView) {
    return {
      type: CHANGE_MAIN_VIEW,
      newView
    }
  },

  siteLoadFailure() {
    return {
      type: SITE_LOAD_FAILURE
    }
  },

  siteLoadSuccess(filename, fileStr) {
    return {
      type: SITE_LOAD_SUCCESS,
      fileStr,
      filename
    };
  },

  saveSite(filename) {
    return function (dispatch, getState) {
      dispatch({ type: SITE_SAVE_ATTEMPT });
      return fs.writeFile(filename, serializer.serialize(getState()), function (err) {
        if (err) {
          dispatch({
            type: SITE_SAVE_FAILURE,
          });
        } else {
          dispatch({
            type: SITE_SAVE_SUCCESS,
            filename
          });
        }
      });
    }
  },

  loadSite(filename) {
    return function (dispatch) {
      dispatch({ type: SITE_LOAD_ATTEMPT });

      return fs.readFile(filename, 'utf8', function (err, file) {
        if (err) {
          this.siteLoadFailure();
        } else {
          this.siteLoadSuccess(filename, file);
        }
      });
    }
  },

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
  changePage(pageId) {
    return {
      type: CHANGE_PAGE,
      pageId,
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
  [SET_PAGE_VALUE](state, action) {
    const currentPage = _.find(state.pages, (page) => {
      return page.id === state.currentPageId;
    });
    currentPage[action.key] = action.newValue;
  },
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
    // TD: FIX
    const rv = state.siteComponents.createVariant(root.id);
    const cv = state.siteComponents.createVariant(container.id);
    state.siteComponents.addChild(rv.id, cv.id);

    const newPage = {
      name: hri.random(),
      id: guid(),
      componentTreeId: rv.id,
    };

    state.activeRightPanel = 'DETAILS';
    state.pages.push(newPage);
    state.currentPageId = newPage.id;
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
    state.currentPageId = action.pageId;
  },

  [ADD_ASSET](state, action) {
    const { filename } = action;
    state.assets.push({
      src: filename,
      name: path.parse(filename).name
    });
  },

  [SELECT_BREAKPOINT](state, action) {
    let widths = {
      TABLET: 640,
      LAPTOP: 1024,
      DESKTOP: 1824,
    }

    let newWidth = widths[action.newBreakpoint];

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
  },

  [SITE_SAVE_SUCCESS](state, action) {
    state.fileMetaData.filename = action.filename;
  },

  [SITE_LOAD_SUCCESS](state, action) {
    Object.assign(state, serializer.deserialize(action.fileStr));

    state.fileMetaData.filename = action.filename;
  },

  [CHANGE_MAIN_VIEW](state, action) {
    state.currentMainView = action.newView;
  }
}, componentTreeReducer);

function reducer(state, action) {
  if (reducerObj[action.type]) {
    reducerObj[action.type](state, action);
  }

  console.log(action.type, action, _.cloneDeep(state));
  return state;
}

export const store = createStore(
  reducer,
  initialState,
  applyMiddleware(thunk)
);

store.dispatch(actions.addPage());
