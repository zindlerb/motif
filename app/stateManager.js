// State manager class
import {Container, Header, Text, Image} from './base_components.js';
import createStore from 'redux/lib/createStore';
import {Map, List, fromJS} from 'immutable';
import {componentTreeReducerObj} from './reducersActions/componentTree.js';

/* 
   page:
     name
     rootId

   on creation need to init the component tree
     

   Add in redux.
 */

var state = {
    mutable: {
    },
    immutable: {
        // Persistant state 
        siteName: "Something",
        componentBoxes: [] // Add component ids via action,
        pages: [],
        pageMap: {
            
        },

        // Temp State
        currentPage: undefined, // Page id.
    }
}


function reducer(state, action) {
    var actionResponses = Object.assign({}, componentTreeReducerObj);

    if (actionResponses[action.type]) {
        return actionResponses[action.type](state, action);
    } else {
        return state;
    }
}

var site = new Site("test site");

// Try to make as much immutable as possible.
var state = {
    mutable: {
        activeSite: site,
        currentPage: site.pages[0],    
    },
    immutable: {
        
    }
};



var store = createStore(reducer, state);


export default store;
