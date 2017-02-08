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
import {
  mainViewTypes,
  NONE
} from './constants';
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
  assets: {},
  currentPageId: undefined,
  activeComponentId: undefined,
  hoveredComponentId: undefined,
  activeView: 'MINIMAL',
  activeBreakpoint: 'NONE',
  activeLeftPanel: 'TREE',
  activeRightPanel: 'DETAILS',
  currentMainView: mainViewTypes.EDITOR,
  menu: { isOpen: false },

  siteComponents: new SiteComponents(),

  otherPossibleComponentViewDropSpots: undefined,
  selectedComponentViewDropSpot: undefined,

  selectedTreeViewDropSpot: undefined,
  otherPossibleTreeViewDropSpots: undefined,

  activeComponentBreakpoint: NONE,
  activeComponentState: NONE,

  // TD: dynamically set initial renderer width
  rendererWidth: 200,

  fileMetaData: {}
};

/* Constants */
const SET_PAGE_VALUE = 'SET_PAGE_VALUE';
const DELETE_PAGE = 'DELETE_PAGE';
const SELECT_BREAKPOINT = 'SELECT_BREAKPOINT';
const UPDATE_ASSET_NAME = 'UPDATE_ASSET_NAME';

const SET_ACTIVE_COMPONENT_STATE = 'SET_ACTIVE_COMPONENT_STATE';
const SET_ACTIVE_COMPONENT_BREAKPOINT = 'SET_ACTIVE_COMPONENT_BREAKPOINT';

const SITE_SAVE_ATTEMPT = 'SITE_SAVE_ATTEMPT';
const SITE_SAVE_SUCCESS = 'SITE_SAVE_SUCCESS';
const SITE_SAVE_FAILURE = 'SITE_SAVE_FAILURE';

const SITE_LOAD_ATTEMPT = 'SITE_LOAD_ATTEMPT';
const SITE_LOAD_SUCCESS = 'SITE_LOAD_SUCCESS';
const SITE_LOAD_FAILURE = 'SITE_LOAD_FAILURE';

const SET_GLOBAL_CURSOR = 'SET_GLOBAL_CURSOR';
const ADD_NEW_PAGE = 'ADD_NEW_PAGE';
const CHANGE_PAGE = 'CHANGE_PAGE';
const CHANGE_PANEL = 'CHANGE_PANEL';
const SELECT_VIEW = 'SELECT_VIEW';
const OPEN_MENU = 'OPEN_MENU';
const CLOSE_MENU = 'CLOSE_MENU';
const CHANGE_MAIN_VIEW = 'CHANGE_MAIN_VIEW';

const ADD_ASSET = 'ADD_ASSET';
const SET_RENDERER_WIDTH = 'SET_RENDERER_WIDTH';

export const actions = Object.assign({
  updateAssetName(assetId, newName) {
    return {
      type: UPDATE_ASSET_NAME,
      newName,
      assetId
    }
  },
  setPageValue(pageId, key, newValue) {
    return {
      type: SET_PAGE_VALUE,
      pageId,
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
      newState,
    }
  },
  setActiveComponentBreakpoint(newBreakpoint) {
    return {
      type: SET_ACTIVE_COMPONENT_BREAKPOINT,
      newBreakpoint,
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
  openMenu(componentId, componentX, componentY) {
    return {
      type: OPEN_MENU,
      componentId,
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
  deletePage(pageId) {
    return {
      type: DELETE_PAGE,
      pageId
    }
  }
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
    state.menu.componentId = action.componentId;
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

  [DELETE_PAGE](state, action) {
    _.remove(state.pages, (page) => {
      return page.id === action.pageId;
    });

    if (state.currentPageId === action.pageId) {
      if (state.pages.length) {
        state.currentPageId = state.pages[0].id;
      } else {
        state.currentPageId = undefined;
      }

    }
  },

  [ADD_NEW_PAGE](state) {
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
    const id = guid();
    state.assets[id] = {
      src: filename,
      name: path.parse(filename).name,
      id
    }
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

  [SET_ACTIVE_COMPONENT_BREAKPOINT](state, action) {
    state.activeComponentBreakpoint = action.newBreakpoint;
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
  },

  [UPDATE_ASSET_NAME](state, action) {
    state.assets[action.assetId].name = action.newName;
  }
}, componentTreeReducer);

function reducer(state, action) {
  if (reducerObj[action.type]) {
    reducerObj[action.type](state, action);
  }

//  console.log(action.type, action, _.cloneDeep(state));
  return state;
}

export function getNewStore() {
  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(thunk)
  );

  store.dispatch(actions.addPage());

  return store;
}

export const store = getNewStore();
