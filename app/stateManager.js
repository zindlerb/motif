// State manager class
import {Container, Header, Text, Image} from './base_components.js';
import createStore from 'redux/lib/createStore';
import bindActionCreators from 'redux/lib/bindActionCreators';
import {componentTreeReducerObj} from './reducersActions/componentTree.js';
import {distanceBetweenPoints} from '../utils.js';
import u from 'updeep';

var container = new Container();
var header = new Header();
var text = new Text();
var image = new Image();

var state = {
    mutable: {
        componentMap: {
            [container.id]: container,
            [header.id]: header,
            [text.id]: text,
            [image.id]: image
        }
    },
    immutable: {
        // Persistant state 
        siteName: "Something",
        componentBoxes: {
            ours: [
                container.id,
                header.id,
                text.id,
                image.id
            ],
            yours: [
                
            ]
        }, // Add component ids via action,
        pages: [],
        currentPage: undefined, // Page id.
    }
    
}

/* Constants */
const SET_COMPONENT_TREE_HIGHLIGHT = "SET_COMPONENT_TREE_HIGHLIGHT";
const ADD_NEW_COMPONENT = "ADD_NEW_COMPONEN";
const ADD_PAGE = "ADD_PAGE";

/* Mutation Types */
var IMMUTABLE = "IMMUTABLE";
var MUTABLE = "MUTABLE";

function findDropSpot(mousePos, nodeTree) {
    var DIST_RANGE = 50;

    var minDist = DIST_RANGE;
    var closestNode;
    var nodesInMin = [];

    walkComponentTree(nodeTree, function (node, ind) {
        node.getDropPoints().forEach(function(dropPoint) {
            var nodeRect = node.getRect();
            var dist = distanceBetweenPoints(mousePos, dropPoint.point);

            if (dist < DIST_RANGE) {
                nodesInMin = nodesInMin.push(dropPoint);
                if (dist < minDist) {
                    minDist = dist;
                    closestNode = dropPoint;
                }
            }
        });
    });

    
    if (closestNode) {
        return {closestNode, nodesInMin};
    } else {
        return;
    }
}

export var actions = {
    setComponentMoveHighlight: function (pos) {
        return {
            type: SET_COMPONENT_TREE_HIGHLIGHT,
            pos
        }
    },
    addComponent: function (Component) {
        return {
            type: ADD_NEW_COMPONENT,
            Component
        }
    },

    /* Pages */
    addPage: function () {
        return {
            type: ADD_PAGE,
            mutationType: IMMUTABLE
        }
    }
};


var reducerObj = {
    [MUTABLE]: {
        
    },
    [IMMUTABLE]: {
        [SET_COMPONENT_TREE_HIGHLIGHT]: function (mutable, immutable, action) {
            return immutable;
        },
        [ADD_NEW_COMPONENT]: function (mutable, immutable, action) {
            
            return immutable;
        },
        [ADD_NEW_PAGE]: function (mutable, immutable, action) {
            var container = new Container();
            var pageId =  genId();

            mutable.componentMap[container.id] = container;

            return u({
                pages: (pages) => {pages.concat(container.id)},
                pageMap: {
                    [pageId]: {
                        name: "New Page",
                        componentTreeId: container.id
                    }
                }
            }, immutable);
            
            return immutable;
        }    
    }
};

function reducer(state, action) {
    var reducerFunc = reducerObj[action.mutationType][action.type];
    if (reducerFunc) {
        return {
            mutable: state.mutable,
            immutable: reducerFunc(state.mutable, state.immutable, action),
        };
    } else {
        return state;
    }
}

export var store = createStore(reducer, state);
export var actionDispatch = bindActionCreators(actions, store.dispatch);
