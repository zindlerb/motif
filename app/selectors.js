import { ComponentsContainer } from './base_components';
import { createImmutableJSSelector } from './utils';

export const renderTreeSelector = createImmutableJSSelector(
  [
    state => state.getIn(['pages', state.get('currentPageId'), 'componentTreeId']),
    state => state.get('componentsMap'),
  ],
  (componentTreeId, componentsMap) => {
    return ComponentsContainer.getRenderTree(componentsMap, componentTreeId);
  }
);

export const contextSelector = createImmutableJSSelector(
  [
    state => state.get('hoveredComponentId'),
    state => state.get('activeComponentId'),
    state => state.get('selectedComponentViewDropSpot')
  ],
  (hoveredComponentId, activeComponentId, selectedComponentViewDropSpot) => {
    return {
      hoveredComponentId,
      activeComponentId,
      selectedComponentViewDropSpot
    }
  }
);
