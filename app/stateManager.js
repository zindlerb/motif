import Immutable from 'immutable';
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
  ComponentsContainer,
  container,
  header,
  text,
  image,
  root
} from './base_components';

let undoStack = [];
let redoStack = [];

let initialState = Immutable.fromJS({
  siteName: 'Something',
  recentSites: [],
  ourComponentBoxes: [
    container.get('id'),
    header.get('id'),
    text.get('id'),
    image.get('id'),
  ],
  yourComponentBoxes: [],
  pages: {},
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

  otherPossibleComponentViewDropSpots: undefined,
  selectedComponentViewDropSpot: undefined,

  selectedTreeViewDropSpot: undefined,
  otherPossibleTreeViewDropSpots: undefined,

  activeComponentBreakpoint: NONE,
  activeComponentState: NONE,

  // TD: dynamically set initial renderer width
  rendererWidth: 200,

  fileMetaData: {}
}).set('componentsContainer', new ComponentsContainer());

/* Constants */
const UNDO = 'UNDO';
const REDO = 'REDO';

const SET_PAGE_VALUE = 'SET_PAGE_VALUE';
const DELETE_PAGE = 'DELETE_PAGE';
const UPDATE_ASSET_NAME = 'UPDATE_ASSET_NAME';

const SET_ACTIVE_COMPONENT_STATE = 'SET_ACTIVE_COMPONENT_STATE';
const SET_ACTIVE_COMPONENT_BREAKPOINT = 'SET_ACTIVE_COMPONENT_BREAKPOINT';

const SITE_SAVE_ATTEMPT = 'SITE_SAVE_ATTEMPT';
const SITE_SAVE_SUCCESS = 'SITE_SAVE_SUCCESS';
const SITE_SAVE_FAILURE = 'SITE_SAVE_FAILURE';

const SITE_LOAD_ATTEMPT = 'SITE_LOAD_ATTEMPT';
const SITE_LOAD_SUCCESS = 'SITE_LOAD_SUCCESS';
const SITE_LOAD_FAILURE = 'SITE_LOAD_FAILURE';

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
  undo() {
    return {
      type: UNDO,
      _noUndo: true
    }
  },
  redo() {
    return {
      type: REDO,
      _noUndo: true
    }
  },
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
      newView,
      _noUndo: true
    }
  },

  siteLoadFailure() {
    return {
      type: SITE_LOAD_FAILURE,
      _noUndo: true
    }
  },

  siteLoadSuccess(filename, fileStr) {
    return {
      type: SITE_LOAD_SUCCESS,
      fileStr,
      filename,
      _noUndo: true
    };
  },

  saveSite(filename) {
    return function (dispatch, getState) {
      dispatch({ type: SITE_SAVE_ATTEMPT });
      return fs.writeFile(filename, serializer.serialize(getState()), function (err) {
        if (err) {
          dispatch({
            type: SITE_SAVE_FAILURE,
            _noUndo: true
          });
        } else {
          dispatch({
            type: SITE_SAVE_SUCCESS,
            filename,
            _noUndo: true
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
      _noUndo: true
    }
  },
  setActiveComponentBreakpoint(newBreakpoint) {
    return {
      type: SET_ACTIVE_COMPONENT_BREAKPOINT,
      newBreakpoint,
      _noUndo: true
    }
  },
  setRendererWidth(newWidth) {
    return {
      type: SET_RENDERER_WIDTH,
      newWidth,
      _noUndo: true
    }
  },
  openMenu(componentId, componentX, componentY) {
    return {
      type: OPEN_MENU,
      componentId,
      componentX,
      componentY,
      _noUndo: true
    };
  },
  closeMenu() {
    return {
      type: CLOSE_MENU,
      _noUndo: true
    };
  },
  addAsset(filename) {
    return {
      type: ADD_ASSET,
      filename,
      _noUndo: true
    }
  },
  changePanel(panelConst, panelSide) {
    return {
      type: CHANGE_PANEL,
      panelConst,
      panelSide,
      _noUndo: true
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
      _noUndo: true
    };
  },
  selectView(viewName) {
    return {
      type: SELECT_VIEW,
      viewName,
      _noUndo: true
    };
  },
  deletePage(pageId) {
    return {
      type: DELETE_PAGE,
      pageId
    }
  }
}, componentTreeActions);

function stateToUndoFormat(state) {
  return state.withMutations((state) => {
    state.updateIn(['componentsContainer'], (componentsContainer) => {
      return componentsContainer.components;
    });

    // Fields unaffected by undo.
    [
      'menu'
    ].forEach((field) => {
      state.delete(field);
    });
  });
}

function undoFormatToState(undoFormatState, prevState) {
  return prevState.merge(
    undoFormatState.updateIn(['componentsContainer'], (components) => {
      return new ComponentsContainer(components);
    })
  );
}

const reducerObj = Object.assign({
  [UNDO](state) {
    redoStack.push(stateToUndoFormat(state));
    return undoFormatToState(undoStack.pop(), state);
  },
  [REDO](state) {
    if (redoStack.length) {
      undoStack.push(stateToUndoFormat(state));
      return undoFormatToState(redoStack.pop(), state);
    }

    return state;
  },
  [SET_PAGE_VALUE](state, action) {
    state.get('pages').get(state.get('currentPageId'));
    return state.updateIn(['pages', state.get('currentPageId')], (currentPage) => {
      return currentPage.set(action.key, action.newValue);
    });
  },

  [OPEN_MENU](state, action) {
    // TD: maybe move to local state?
    return state.update('menu', (menu) => {
      return menu.merge({
        isOpen: true,
        componentId: action.componentId,
        componentX: action.componentX,
        componentY: action.componentY
      });
    });
  },

  [CLOSE_MENU](state) {
    return state.update('menu', () => {
      return Immutable.Map({
        isOpen: false
      })
    });
  },

  [SELECT_VIEW](state, action) {
    return state.set('activeView', action.viewName);
  },

  [DELETE_PAGE](state, action) {
    // TD: need to remove all the components from site components
    return state.update('pages', (pages) => {
      return pages.delete(action.pageId);
    }).update('currentPageId', (currentPageId) => {
      if (currentPageId === action.pageId) {
        if (state.pages.length) {
          return state.getIn(['pages', 0, 'id']);
        } else {
          return undefined;
        }
      } else {
        return currentPageId;
      }
    });
  },

  [ADD_NEW_PAGE](state) {
    const componentsContainer = state.get('componentsContainer');
    const rvId = componentsContainer.createVariant(root.get('id'));
    const cvId = componentsContainer.createVariant(container.get('id'));
    componentsContainer.addChild(rvId, cvId);

    const newPageId = guid();
    const newPage = Immutable.Map({
      name: hri.random(),
      id: newPageId,
      componentTreeId: rvId,
    });

    return state.set('currentPageId', newPageId)
                .update('pages', (pages) => {
                  return pages.set(newPageId, newPage);
                });
  },

  [CHANGE_PANEL](state, action) {
    const { panelConst, panelSide } = action;
    return state.set(({
      right: 'activeRightPanel',
      left: 'activeLeftPanel'
    })[panelSide], panelConst)
  },

  [CHANGE_PAGE](state, action) {
    return state.set('currentPageId', action.pageId);
  },

  [ADD_ASSET](state, action) {
    const { filename } = action;
    const id = guid();
    return state.update('assets', (assets) => {
      return assets.set(id, Immutable.Map({
        src: filename,
        name: path.parse(filename).name,
        id
      }));
    });
  },

  [SET_RENDERER_WIDTH](state, action) {
    return state.set('rendererWidth', action.newWidth);
  },

  [SET_ACTIVE_COMPONENT_STATE](state, action) {
    return state.set('activeComponentState', action.newState);
  },

  [SET_ACTIVE_COMPONENT_BREAKPOINT](state, action) {
    return state.set('activeComponentBreakpoint', action.newBreakpoint)
  },

  [SITE_SAVE_SUCCESS](state, action) {
    return state.update('fileMetaData', (fileMetaData) => {
      return fileMetaData.set('filename', action.filename);
    });
  },

  [SITE_LOAD_SUCCESS](state, action) {
    /*
       TD: Revisit. This is more complicated
     */

    return state.merge(state, serializer.deserialize(action.fileStr))
                .setIn(['fileMetaData', 'filename'], action.filename);
  },

  [CHANGE_MAIN_VIEW](state, action) {
    return state.set('currentMainView', action.newView);
  },

  [UPDATE_ASSET_NAME](state, action) {
    return state.update('assets', (assets) => {
      return assets.setIn([action.assetId, 'name'], action.newName);
    });
  }
}, componentTreeReducer);

// because componentsContainer is mutable there are issues


function reducer(state, action) {
  //  console.log(action.type, action, state.toJS());
  if (reducerObj[action.type]) {
    if (!action._noUndo) {
      undoStack.push(stateToUndoFormat(state));
      redoStack = [];
    }

    return reducerObj[action.type](state, action);
  }

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
