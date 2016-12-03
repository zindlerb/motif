// State manager class
import {Container, Header, Text, Image} from './base_components.js';
import createStore from 'redux/lib/createStore';
import {Map, List, fromJS} from 'immutable';
import {componentTreeReducerObj} from './reducersActions/componentTree.js';

var sampleComponentTree = new Container({
    root: true,
    style: {
        height: "100%"                
    }
}, [
    new Header(),
    new Container({style: {flexDirection: "row"}}, [
        new Container({style: {width: "33%"}}, [new Text()]),
        new Container({style: {width: "33%"}}, [new Text()]),
        new Container({style: {width: "33%"}}, [new Text()])
    ])
]);

class Page {
    constructor(name) {
        this.name = name;
        this.componentTree = new Container({
            root: true,
            style: {
                height: "100%"                
            }
        });

        /*

           
           possible attrs:
              last edited
              
         */
    }
}

class Site {
    constructor(name) {
        this.name = name;
        this.pages = [new Page("Starter Page")];
        this.components = [
            Container,
            Header,
            Text,
            Image
        ];
    }

    toJSON() {
        
    }

    fromJSON() {
        
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
