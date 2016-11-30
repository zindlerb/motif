// State manager class
import {Container, Header, Text, Image} from './base_components.js';

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

function StateManager() {
    // Later can convert into more of a redux like store
    var changeCallbacks = [];

    var site = new Site("test site");
    
    var state = {
        activeSite: site,
        currentPage: site.pages[0],        
        activePagePanelTab: ""

        // State that is permenant is commited to active site. Temp view state goes here in global or in components.
    }

    function triggerReRender() {
        changeCallbacks.forEach(function(cb) {
            cb(state);
        });
    }
    
    return {
        registerChangeCallback: function(cb) {
            changeCallbacks.push(cb);
        },
        setState: function(newState) {
            Object.assign(state, newState);
            triggerReRender();
        },
        updateState: function(cb) {
            cb(state);
            triggerReRender();
        },
        getState: function () {
            return state;
        },
        triggerUpdate: triggerReRender,
        state: state
    }
}

var stateManager = StateManager();

export default stateManager;

/*
  What would it mean to organize my data in a functional way?
   What is actually good about immutability and functional programming?

   Serializability
   Control over time
   Easier to reason about where things happened.


   But getting these things in js comes at great cost..

   What is the clojure style?
   I don't think I really understand what it is all about...


   Do in style that I think makes most sense.
   Then look at functional js and joy of clojure and clojure talks and some clojure projects and compare pros cons
*/
