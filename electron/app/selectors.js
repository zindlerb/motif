import { ComponentsContainer } from './base_components';
import { createImmutableJSSelector } from './utils';
import { stateTypes } from './constants';

// For editor only
export const renderTreeSelector = createImmutableJSSelector(
  [
    state => state.getIn(['pages', state.getIn(['editorView', 'currentPageId']), 'componentTreeId']),
    state => state.get('componentsMap'),
    state => state.get('hoveredComponentId'),
    state => state.getIn(['editorView', 'rendererWidth']),
  ],
  (componentTreeId, componentsMap, hoveredComponentId, rendererWidth) => {
    return ComponentsContainer.getRenderTree(componentsMap, componentTreeId, {
      width: rendererWidth,
      states: {
        [hoveredComponentId]: stateTypes.HOVER
      }
    });
  }
);

export const componentTreeMetadataSelector = createImmutableJSSelector(
  [
    state => state.get('hoveredComponentId'),
    state => state.get('activeComponentId'),
    state => state.get('activeComponentBreakpoint'),
    state => state.get('activeComponentState'),
  ],
  (hoveredComponentId,
   activeComponentId,
   activeComponentBreakpoint,
   activeComponentState) => {
     return {
       hoveredComponentId,
       activeComponentId,
       activeComponentBreakpoint,
       activeComponentState
     }
  }
)
