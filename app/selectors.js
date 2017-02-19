import { createSelector } from 'reselect';
import { ComponentsContainer } from './base_components';

export const renderTreeSelector = createSelector(
  [
    state => state.getIn(['pages', state.get('currentPageId'), 'componentTreeId']),
    state => state.get('componentsMap'),
  ],
  (componentTreeId, componentsMap) => {
    return ComponentsContainer.getRenderTree(componentsMap, componentTreeId);
  }
)
