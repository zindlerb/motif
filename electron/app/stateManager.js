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
  root,
  defaultComponentsMap
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

  componentsMap: defaultComponentsMap,

  activeComponentBreakpoint: NONE,
  activeComponentState: NONE,

  // TD: dynamically set initial renderer width
  rendererWidth: 200,

  fileMetadata: {},
  componentMap: defaultComponentsMap
});

/* Constants */
const UNDO = 'UNDO';
const REDO = 'REDO';

const SET_PAGE_VALUE = 'SET_PAGE_VALUE';
const DELETE_PAGE = 'DELETE_PAGE';

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
const UPDATE_ASSET_NAME = 'UPDATE_ASSET_NAME';
const DELETE_ASSET = 'DELETE_ASSET';

const EXPORT_SITE = 'EXPORT_SITE';

const SET_RENDERER_WIDTH = 'SET_RENDERER_WIDTH';

function writeSiteFile(dirname, state, cb) {
  fs.writeFile(
    path.join(dirname, 'site.json'),
    serializer.serialize(state),
    (err) => {
      if (cb) {
        cb(err);
      }
    }
  );
}

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

  exportSite(newSitePath) {
    return (dispatch, getState) => {
      fs.mkdir(newSitePath, () => {
        const state = getState();
        state.get('pages').forEach((pageMap) => {
          pageMap.get('componentTreeId')
        });
      });
    }
  },

  deleteAsset(assetId) {
    return (dispatch, getState) => {
      const assetPath = getState().getIn(['assets', assetId, 'src']);
      fs.unlink(assetPath, (err) => {
        if (!err) {
          dispatch({
            type: DELETE_ASSET,
            assetId
          })
        }
      })
    }
  },

  updateAssetName(assetId, newName) {
    return {
      type: UPDATE_ASSET_NAME,
      newName,
      assetId
    }
  },

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
      newView,
      _noUndo: true
    }
  },

  saveSite(dirname) {
    // TD: clean this mess
    function finished(err, dispatch) {
      if (err) {
        dispatch({
          type: SITE_SAVE_FAILURE,
          _noUndo: true
        });
      } else {
        dispatch({
          type: SITE_SAVE_SUCCESS,
          dirname,
          _noUndo: true
        });
      }
    }

    return function (dispatch, getState) {
      dispatch({ type: SITE_SAVE_ATTEMPT });

      if (!dirname) {
        dirname = getState().getIn(['fileMetadata', 'dirname']);
      }

      fs.access(dirname, (err) => {
        if (err && err.code === "ENOENT") {
          return fs.mkdir(dirname, () => {
            writeSiteFile(dirname, getState(), (err) => {
              fs.mkdir(path.join(dirname, 'assets'), (err) => {
                finished(err, dispatch);
              });
            });
          });
        } else {
          writeSiteFile(dirname, getState(), (err) => {
            finished(err, dispatch);
          });
        }
      });
    }
  },

  loadSite(dirname) {
    return (dispatch) => {
      dispatch({ type: SITE_LOAD_ATTEMPT });
      return fs.readFile(path.join(dirname, 'site.json'), 'utf8', (err, fileStr) => {
        if (err) {
          dispatch({
            type: SITE_LOAD_FAILURE,
            _noUndo: true
          })
        } else {
          dispatch({
            type: SITE_LOAD_SUCCESS,
            fileStr,
            dirname,
            _noUndo: true
          });
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
    return (dispatch, getState) => {
      fs.readFile(filename, (err, file) => {
        const assetPath = path.join(
          getState().getIn(['fileMetadata', 'dirname']),
          'assets',
          path.basename(filename)
        );

        fs.writeFile(assetPath, file, (err) => {
          if (!err) {
            dispatch({
              type: ADD_ASSET,
              assetPath,
              _noUndo: true
            })
          }
        })
      });
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
    undoFormatState
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
    }).update((state) => {
      if (state.get('currentPageId') === action.pageId) {
        return state.set(
          'currentPageId',
          state.get('pages').keys().next().value
        );
      } else {
        return state;
      }
    });
  },

  [ADD_NEW_PAGE](state) {
    const componentsContainer = new ComponentsContainer(state.get('componentsMap'));
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
                })
                .set('componentsMap', componentsContainer.components);
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
    const { assetPath } = action;
    const id = guid();
    return state.update('assets', (assets) => {
      return assets.set(id, Immutable.Map({
        src: assetPath,
        name: path.basename(assetPath),
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
    return state.setIn(['fileMetadata', 'dirname'], action.dirname);
  },

  [SITE_LOAD_SUCCESS](state, action) {
    /*
       TD: Add recent sites
     */
    return state.merge(state, serializer.deserialize(action.fileStr))
                .setIn(['fileMetadata', 'dirname'], action.dirname);
  },

  [CHANGE_MAIN_VIEW](state, action) {
    return state.set('currentMainView', action.newView);
  },

  [UPDATE_ASSET_NAME](state, action) {
    return state.update('assets', (assets) => {
      return assets.setIn([action.assetId, 'name'], action.newName);
    });
  },
  [DELETE_ASSET](state, action) {
    // TD: figure out the idiomatic way to do this.
    // This is very hacky. But changes to assets must be atomic...
    const newState = state.deleteIn(['assets', action.assetId]);
    writeSiteFile(newState.getIn(['fileMetadata', 'dirname']), newState);
    return newState;
  }
}, componentTreeReducer);

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
