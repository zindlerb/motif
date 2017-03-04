import { ComponentsContainer } from './base_components';
import { createImmutableJSSelector } from './utils';

export const renderTreeSelector = createImmutableJSSelector(
  [
    state => state.getIn(['pages', state.getIn(['editorView', 'currentPageId']), 'componentTreeId']),
    state => state.get('componentsMap'),
  ],
  (componentTreeId, componentsMap) => {
    return ComponentsContainer.getRenderTree(componentsMap, componentTreeId);
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
