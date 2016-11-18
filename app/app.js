// ES6 Component
// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

// Base Components

/* 

  Attrs:
    displayType:
       container | content | inline (goes inside content)
    
  
    What must the super div satisfy:
      - must be able to build up bootstrap and other up component library primatives
      - must be as simple as possible without losing the power of all the other div props
      - must be built with responsiveness in mind from the beginning
      - simple means of aligning in both directions...

   What properties are used for layout?
     - float, clearfix
     - width: 100%; max, min 
     - height % min max
     - flex
     - upcoming grid
     - relative + absolute + fixed
     - margin: auto;
     - media queries

     - important concepts:
       - parent child relationship
         - how big is my parent?
         - how is my parent positioned?
         - what is my parents layout style
       - the nature of the content inside the element

     need to simplify overflow..
     
     possible idea:
       - layered doms - just put a dom on top of another one...
          - how would the scrolling work?
          - how is a paralax done?
       - 


 */

class ComponentBaseClass {
    constructor(name, baseStyle, attrs) {        
        this.name = name;
        this.attrs = attrs;
        this.sx = Object.assign({}, baseStyle, attrs.style);
    }

    render() {
        
    }
}

class Container extends ComponentBaseClass {
    constructor(attrs, children) {
        super("container", {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }, attrs || {});

        this.displayType = "container";

        this.children = children || [];
    }

    render() {
        var children = _.map(this.children, function (child) {
            return child.render();
        });
        
        
        return (
            <div style={this.sx}>
                {children}
            </div>
        )
    }
}


class Text extends ComponentBaseClass {
    constructor(attrs) {
        super("text", {
            
        }, attrs);
        
        this.displayType = "content";
    }

    render() {
        return (
            <p style={this.sx}>
                {this.attrs.text}
            </p>
        )
    }
}



class Header extends ComponentBaseClass {
    constructor(attrs) {
        super("header", {},  attrs);

        this.dispayType = "content";
    }

    render() {
        return (
            <h1 style={sx}>
                {this.attrs.text}
            </h1>
        )
    }
}


class Image extends ComponentBaseClass {
    constructor(attrs) {
        super("image", {}, attrs);

        this.displayType = "content";
    }

    render() {
        return (
            <img style={this.sx} src={this.attrs.src} />
        )
    }
}

/*

  - Add the dragging on
  - Add tree view
  - Allow building of components and adding straight attrs

 */

function StateManager() {
    // Later can convert into more of a redux like store
    var changeCallbacks = [];
    var state = {
        components: [
            Container,
            Header,
            Text,
            Image
        ],
        currentPage: new Container()
    };

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
        }
    }
}

var stateManager = StateManager();

var ComponentSidebar = React.createClass({
    render: function() {
        var items = _.map(this.props.components, function (component) {
            return <li className="">{component.name}</li>
        })
        return (
            <ul className="list">
                {items}
            </ul>
        )
    }
});



var TreeView = React.createClass({    
    render: function() {
        function walkNode(node) {
            var children = [];
            if (node.children) {
               children = _.map(node.children, walkNode);
            }
            return (
                <div>
                    <span>{node.name}</span>
                    <div className="ml3">{children}</div>
                </div>
            )
        }
       
        return (                       
            <div>
                {walkNode(this.props.page)}
            </div>
        )
    }
});

// Search component created as a class
class StaticRenderer extends React.Component {
    render() {
        return (
            <div>
              {this.props.currentPage ? this.props.currentPage.render() : ""}
            </div>
        );
    }
}

var App = React.createClass({
    getInitialState: function() {
        return stateManager.getState();
    },

    componentDidMount: function() {
        stateManager.registerChangeCallback(function(newState) {
            this.setState(newState);
        });
    },
    
    render: function() {
        return (
            <div className="flex debug">
                <div className="w4">
                    <ComponentSidebar components={this.state.components} />
                </div>
                <div className="flex-auto">
                    <StaticRenderer page={this.state.currentPage}/>
                </div>
                <div className="w5">
                    <TreeView page={this.state.currentPage}/>
                </div>                
            </div>
        );
    }
})

// Render to ID content in the DOM
ReactDOM.render( < App / > ,
                 document.getElementById('content')
);

/*

   Make tree view for adding
   Make attr editing box
   Allow creation of components
   Allow saving of state

   Try to create slack

   Proposed superdiv spec
     - Horizontal or Vertical
     - Fills 100% of the width
     - When horizontal
       - Non fixed sizes fill the rest of the width
       - Can set the distribution along both axis like in flex.


    - if it hits the side evenly distribute the elements?


    - What if it is justified left and you don't hit the side of the containing element?
        

*/




