window['_'] = require('lodash');

var serializer = require('../app/serializer.js').default;
var stateManager = require('../app/stateManager.js');
var baseComponents = require('../app/base_components.js');

var store = stateManager.store;
var actionDispatch = stateManager.actionDispatch;

describe('serializer', () => {
  var state = store.getState();
  actionDispatch.addComponent(
    baseComponents.container,
    state.currentPage.componentTree
  );

  actionDispatch.addComponent(
    baseComponents.header,
    state.currentPage.componentTree.children[0]
  );

  it('state is the same before and after serialization', () => {
    var oldState = _.cloneDeep(store);

    var serializedState = serializer.serialize(store.getState());
    actionDispatch.openSite(serializer.deserialize(serializedState), 'fake_file');
    var newState = store.getState();
  });
});
