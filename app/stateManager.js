import _ from 'lodash';
import {Container, Header, Text, Image} from './base_components.js';
import createStore from 'redux/lib/createStore';
import bindActionCreators from 'redux/lib/bindActionCreators';
import {distanceBetweenPoints, guid} from './utils.js';

var container = new Container();
var header = new Header();
var text = new Text();
var image = new Image();

var state = {
    componentMap: {
        [container.id]: container,
        [header.id]: header,
        [text.id]: text,
        [image.id]: image
    },
    siteName: "Something",
    componentBoxes: {
        ours: [
            container,
            header,
            text,
            image
        ],
        yours: [
            
        ]
    },
    pages: [],
    currentPage: undefined,
    activeLeftPanel: "COMPONENTS",
    activeRightPanel: "ATTRIBUTES"
}

/* Constants */
const SET_COMPONENT_TREE_HIGHLIGHT = "SET_COMPONENT_TREE_HIGHLIGHT";
const RESET_COMPONENT_TREE_HIGHLIGHT = "RESET_COMPONENT_TREE_HIGHLIGHT";

const ADD_NEW_COMPONENT = "ADD_NEW_COMPONENT";
const ADD_NEW_PAGE = "ADD_NEW_PAGE";

const CHANGE_PANEL = "CHANGE_PANEL";
const CHANGE_PAGE = "CHANGE_PAGE";

const SELECT_COMPONENT = "SELECT_COMPONENT";

function findDropSpot(mousePos, nodeTree) {
    var DIST_RANGE = 100;

    var minDist = DIST_RANGE;
    var closestNode;
    var nodesInMin = [];

    nodeTree.walkChildren(function (node, ind) {
        if (node.getDropPoints) {
            node.getDropPoints().forEach(function(dropPoint) {                
                var nodeRect = node.getRect();
                var dist = distanceBetweenPoints(mousePos, dropPoint.point);
                

                if (dist < DIST_RANGE) {
                    nodesInMin.push(dropPoint);
                    if (dist < minDist) {
                        minDist = dist;
                        closestNode = dropPoint;
                    }
                }
            });
        }
    });

    
    if (closestNode) {
        closestNode.isActive = true;
        return {closestNode, nodesInMin};
    } else {
        return {};
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

    selectComponent: function(Component) {
        return {
            type: SELECT_COMPONENT,
            Component
        }
    },

    changePanel: function (panelConst) {
        return {
            type: CHANGE_PANEL,
            panelConst
        }
    },
    

    /* Pages */
    addPage: function () {
        return {
            type: ADD_NEW_PAGE,
        }
    },

    changePage: function (page) {
        return {
            type: CHANGE_PAGE,
            page
        }
    }
};


var reducerObj = {
    [SET_COMPONENT_TREE_HIGHLIGHT]: function (state, action) {
        var dropSpots = findDropSpot(action.pos, state.currentPage.componentTree);

        state.dropPoints = dropSpots.nodesInMin;
        state.selectedDropPoint = dropSpots.closestNode;
    },
    [RESET_COMPONENT_TREE_HIGHLIGHT]: function (state) {
        delete state.dropPoints;
    },
    [ADD_NEW_COMPONENT]: function (state, action) {
        if (state.selectedDropPoint) {
            var {parent, insertionIndex} = state.selectedDropPoint;
            parent.addChild(
                action.Component.createVariant(),
                insertionIndex
            );
        }
        
        /* state.dropPoints = undefined;
         * state.selectedDropPoint = undefined;*/

        /* Can't use delete because setState will keep the old state when merged */
        state.dropPoints = undefined;
        state.selectedDropPoint = undefined;
        
    },
    [ADD_NEW_PAGE]: function (state, action) {
        var newPage = {
            name: "New Page",
            id: guid(),
            componentTree: container.createVariant({
                isRoot: true,
            })
        };

        state.pages.push(newPage);
        state.currentPage = newPage;
    },
    [CHANGE_PANEL]: function (state, action) {
        state.activeLeftPanel = action.panelConst;
    },
    [CHANGE_PAGE]: function (state, action) {        
        state.currentPage = action.page;
    }
};

function reducer(state, action) {    
    if (reducerObj[action.type]) {
        reducerObj[action.type](state, action);
    }

    return state;
}

export var store = createStore(reducer, state);
export var actionDispatch = bindActionCreators(actions, store.dispatch);

actionDispatch.addPage();
