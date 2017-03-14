import { NONE, mainViewTypes } from '../constants';
import { ComponentsContainer } from '../base_components';

const UNHOVER_COMPONENT = 'UNHOVER_COMPONENT';
const HOVER_COMPONENT = 'HOVER_COMPONENT';

const ADD_VARIANT = 'ADD_VARIANT';
const MOVE_COMPONENT = 'MOVE_COMPONENT';
const DELETE_COMPONENT = 'DELETE_COMPONENT';

const SELECT_COMPONENT = 'SELECT_COMPONENT';

const CHANGE_COMPONENT_NAME = 'CHANGE_COMPONENT_NAME';
const CREATE_COMPONENT_BLOCK = 'CREATE_COMPONENT_BLOCK';
const SET_COMPONENT_ATTRIBUTE = 'SET_COMPONENT_ATTRIBUTE';
const SYNC_COMPONENT = 'SYNC_COMPONENT';
const DELETE_CURRENT_COMPONENT_BOX = 'DELETE_CURRENT_COMPONENT_BOX';

export const componentTreeActions = {
  moveComponent(componentId, parentComponentId, insertionIndex) {
    return {
      type: MOVE_COMPONENT,
      componentId,
      parentComponentId,
      insertionIndex
    };
  },

  syncComponent(componentId) {
    return {
      type: SYNC_COMPONENT,
      componentId
    }
  },

  deleteCurrentComponentBox() {
    return {
      type: DELETE_CURRENT_COMPONENT_BOX
    }
  },

  addVariant(componentId, parentComponentId, insertionIndex, spec) {
    return {
      type: ADD_VARIANT,
      componentId,
      parentComponentId,
      insertionIndex,
      spec: spec || {},
    };
  },

  deleteComponent(componentId) {
    return {
      type: DELETE_COMPONENT,
      componentId
    };
  },

  selectComponent(componentId) {
    return {
      type: SELECT_COMPONENT,
      componentId,
      _noUndo: true
    };
  },

  hoverComponent(componentId) {
    return {
      type: HOVER_COMPONENT,
      componentId,
      _noUndo: true
    }
  },

  unHoverComponent() {
    return {
      type: UNHOVER_COMPONENT,
      _noUndo: true
    }
  },

  changeComponentName(componentId, newName) {
    return {
      type: CHANGE_COMPONENT_NAME,
      componentId,
      newName
    };
  },

  createComponentBlock(newBlockId) {
    return {
      type: CREATE_COMPONENT_BLOCK,
      newBlockId
    };
  },

  setComponentAttribute(componentId, attrKey, newAttrValue) {
    return {
      type: SET_COMPONENT_ATTRIBUTE,
      componentId,
      attrKey,
      newAttrValue,
    };
  },
};

export const componentTreeReducer = {
  [SYNC_COMPONENT](state, action) {
    return state.set(
      'componentsMap',
      ComponentsContainer.commitChanges(state.get('componentsMap'), action.componentId)
    );
  },

  [ADD_VARIANT](state, action) {
    let { componentId, parentComponentId, insertionIndex, spec } = action;
    let componentsContainer = new ComponentsContainer(state.get('componentsMap'));

    const variantId = componentsContainer.createVariant(componentId, spec);

    componentsContainer.addChild(
      parentComponentId,
      variantId,
      insertionIndex
    );

    return state.set('componentsMap', componentsContainer.components);
  },

  [MOVE_COMPONENT](state, action) {
    return state.set('componentsMap',
                     ComponentsContainer.moveComponent(
                       state.get('componentsMap'),
                       action.componentId,
                       action.parentComponentId,
                       action.insertionIndex
                     ));
  },

  [DELETE_COMPONENT](state, action) {
    let { componentId } = action;
    const componentsContainer = new ComponentsContainer(state.get('componentsMap'));
    componentsContainer.deleteComponent(componentId);

    return state.updateIn(['activeComponentId'], (activeComponentId) => {
      if (activeComponentId === componentId) {
        return undefined;
      } else {
        return activeComponentId;
      }
    }).set('componentsMap', componentsContainer.components);
  },

  [SELECT_COMPONENT](state, action) {
    return state.merge({
      activeComponentState: NONE,
      activeComponentBreakpoint: NONE,
      activeComponentId: action.componentId
    });
  },

  [CHANGE_COMPONENT_NAME](state, action) {
    const { componentId } = action;
    const parentId = state.getIn(['componentsMap', componentId, 'parentId']);
    const masterId = state.getIn(['componentsMap', componentId, 'masterId']);
    if (!parentId && state.get('currentMainView') === mainViewTypes.COMPONENTS) {
      // For components view the root *is* the component master
      return state.setIn(['componentsMap', componentId, 'name'], action.newName);
    } else {
      return state.setIn(
        ['componentsMap', masterId, 'name'],
        action.newName
      );
    }
  },

  [DELETE_CURRENT_COMPONENT_BOX](state) {
    return state.set('componentsMap', ComponentsContainer.deleteComponent(
      state.get('componentsMap'),
      state.getIn(['componentsView', 'currentComponentId'])
    )).update((state) => {
      return state.update('yourComponentBoxes', (yourComponentBoxes) => {
        return yourComponentBoxes.filter((id) => {
          return state.getIn(['componentsMap', id]);
        });
      });
    }).set('currentComponentId', state.getIn(['ourComponentBoxes', 0]));
  },

  [CREATE_COMPONENT_BLOCK](state, action) {
    const { newBlockId } = action;
    let variantId;

    const newComponentsMap = state.get('componentsMap').withMutations((componentsMap) => {
      const componentsContainer = new ComponentsContainer(componentsMap);
      const newBlockParentId = componentsMap.getIn([newBlockId, 'parentId']);
      componentsMap.mergeIn(
        [newBlockId],
        { name: 'new component', parentId: undefined }
      );

      variantId = componentsContainer.createVariant(newBlockId, {
        parentId: newBlockParentId
      });

      componentsMap.updateIn([newBlockParentId, 'childIds'], (childIds) => {
        return childIds.map((childId) => {
          if (childId === newBlockId) {
            return variantId;
          } else {
            return childId;
          }
        });
      });
    });

    return state.update('yourComponentBoxes', (yourComponentBoxes) => {
      return yourComponentBoxes.push(newBlockId);
    }).set('componentsMap', newComponentsMap).set('activeComponentId', variantId);
  },

  [SET_COMPONENT_ATTRIBUTE](state, action) {
    return state.update('componentsMap', (componentsMap) => {
      const newComponentMap = ComponentsContainer.setAttribute(
        componentsMap,
        action.componentId,
        action.attrKey,
        action.newAttrValue,
        {
          breakpoint: state.get('activeComponentBreakpoint'),
          state: state.get('activeComponentState')
        }
      );

      return newComponentMap;
    });
  },

  [UNHOVER_COMPONENT](state) {
    return state.set('hoveredComponentId', undefined);
  },

  [HOVER_COMPONENT](state, action) {
    return state.set('hoveredComponentId', action.componentId);
  },
};
