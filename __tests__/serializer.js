window['_'] = require('lodash');

var serializer = require('../app/serializer.js').default;
var stateManager = require('../app/stateManager.js');
var baseComponents = require('../app/base_components.js');

var store = stateManager.store;
var actionDispatch = stateManager.actionDispatch;
