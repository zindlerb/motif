import {List} from 'immutable';
import {walkComponentTree} from '../base_components.js';
import {logImmutable, distanceBetweenPoints} from '../utils.js';

/* Constants */
const SET_COMPONENT_TREE_HIGHLIGHT = "SET_COMPONENT_TREE_HIGHLIGHT";
const ADD_NEW_COMPONENT = "ADD_NEW_COMPONEN";

export var componentTreeActions = {
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
    }
};

function findDropSpot(mousePos, nodeTree) {
    var DIST_RANGE = 50;

    var minDist = DIST_RANGE;
    var closestNode;
    var nodesInMin = List();

    walkComponentTree(nodeTree, function (node, ind) {
        node.getDropPoints().forEach(function(dropPoint) {
            var nodeRect = node.getRect();
            var dist = distanceBetweenPoints(mousePos, dropPoint.get("point"));

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

export var componentTreeReducerObj = {
    [SET_COMPONENT_TREE_HIGHLIGHT]: function (state, action) {
        var dropSpot = findDropSpot(action.pos, state.currentPage.componentTree);
        state.immutable = state.immutable.merge(dropSpot);

        logImmutable(state);
        
        return state;
    },
    [ADD_NEW_COMPONENT]: function (state, action) {
        return state;
    }
};




