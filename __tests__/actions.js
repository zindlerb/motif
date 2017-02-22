// Lookup best way to test reducer redux.
// Do after making state immutable

var _ = require('lodash');

var { getNewStore, actions } = require('../app/stateManager.js');
var { componentTypes } = require('../app/constants.js');
var { container, ComponentsContainer } = require('../app/base_components.js');

// Requires mocking the file save...

describe('make component block', () => {
  var store = getNewStore();

  // add component
  // make component into component block
  // confirm that name works
  const state = store.getState();
  const currentPageId = state.get('currentPageId');
  const rootComponentTreeId = state.getIn([
    'pages',
    state.get('currentPageId'),
    'componentTreeId'
  ]);

  store.dispatch(actions.addVariant(
    container.get('id'),
    rootComponentTreeId,
  ));

  const newBlockId = store.getState().getIn([
    'componentsMap',
    rootComponentTreeId,
    'childIds',
    0
  ]);

  store.dispatch(actions.createComponentBlock(newBlockId));

  it('Correctly Sets the Name', () => {
    const state = store.getState();
    expect(ComponentsContainer.getName(state.get('componentsMap'), newBlockId)).toBe('New Component');
  });
});
