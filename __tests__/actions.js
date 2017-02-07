// Lookup best way to test reducer redux.
// Do after making state immutable

var _ = require('lodash');

var { getNewStore, actions } = require('../app/stateManager.js');
var { componentTypes } = require('../app/constants.js');

describe('Creates variants correctly', () => {
  const store = getNewStore();
  const state = store.getState();
  let rootComponent;
  const currentPage = _.find(state.pages, (page) => {
    return page.id === state.currentPageId;
  });

  const rootComponentId = currentPage.componentTreeId;

  store.dispatch(actions.addVariant(componentTypes.HEADER, rootComponentId));
  const headerVariantId = state.siteComponents._lastCreatedId;
  rootComponent = state.siteComponents.components[rootComponentId];

  it('Adds variant', () => {
    expect(_.some(rootComponent.childIds, (childId) => {
      return childId === headerVariantId;
    })).toBeTruthy();
  });

  it('replaces self with variant', () => {
    store.dispatch(actions.createComponentBlock(headerVariantId));
    rootComponent = store.getState().siteComponents.components[rootComponentId];

    expect(_.some(rootComponent.childIds, (childId) => {
      return childId === headerVariantId;
    })).toBeFalsy();

    const newVariantId = state.siteComponents.components[headerVariantId].variantIds[0];
    const newVariant = state.siteComponents.components[newVariantId];

    expect(_.some(rootComponent.childIds, (childId) => {
      return childId === newVariantId;
    })).toBeTruthy();

    expect(newVariant.parentId).toBeDefined();
  });
});
