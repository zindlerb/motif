// ES6 Component
// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import dragManager from './dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';

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
    constructor(name, baseStyle, attrs, parent) {        
        this.name = name;
        this.attrs = attrs;
        this.sx = Object.assign({}, baseStyle, attrs.style);
        this.id = guid();
        this.parent = parent;

        this.outlineViewClassNames = {};
    }

    render() {
        
    }
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
}

class Container extends ComponentBaseClass {
    constructor(attrs, parent, children) {
        super("container", {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }, attrs || {}, parent);

        this.displayType = "container";        
        this.children = children || [];
    }

    setDropHighlight(ind, val) {
        if (ind === 0) {
            this.outlineViewClassNames.highlightBottom = val;
        } else {
            this.children[ind].outlineViewClassNames.highlightBottom = val;
        }
    }

    showDropHighlight(ind) {
        this.setDropHighlight(ind, true);
    }

    hideDropHighlight(ind) {
        this.setDropHighlight(ind, false);
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

    addChild(node, index) {
        node.parent = this;
        if (index) {
            this.children.splice(index, 0, node);
        } else {            
            this.children.push(node);
        }
    }
}


class Text extends ComponentBaseClass {
    constructor(attrs, parent) {
        super("text", {
            
        }, attrs, parent);
        
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
    constructor(attrs, parent) {
        super("header", {},  attrs, parent);

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
    constructor(attrs, parent) {
        super("image", {}, attrs, parent);

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
        },
        triggerUpdate: triggerReRender
    }
}

var stateManager = StateManager();

function getGlobalPosFromSyntheticEvent(e) {
    return {x: e.clientX, y: e.clientY};
}

function walkNodeTree(node, cb, ind) {
    cb(node);

    if (node.children) {
        node.children.forEach(function(child, ind) {
            walkNodeTree(child, cb, ind);
        });
    }
}

function distanceBetweenPoints(p1, p2) {
    return Math.abs(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));
}

function findDropSpot(mousePos, nodeTree) {
    var closestNodeDist = 50;
    var closestNode;
    var closestNodeEl;
    var overUnder;
    var closestNodeIndex;

    walkNodeTree(nodeTree, function (node, ind) {
        var el = $(".outline_" + node.id)
        var nodePos = el.offset();
        var dist = distanceBetweenPoints(mousePos, {x: nodePos.left, y: nodePos.top + el.height()/2});

        if (dist < closestNodeDist) {
            closestNodeDist = dist;
            closestNode = node;
            closestNodeEl = el;
            closestNodeIndex = ind;
        }
    });

    if (closestNode) {
        /* Cant go above the initial node */
        var height = closestNodeEl.height();
        var yPos = closestNodeEl.offset().top;
        var yMidPoint = yPos + height/2;
        var yBottom = yPos + height;

        var insertionIndex;
        var insertionParent;
        if (mousePos.y < yMidPoint && closestNodeIndex) {
            insertionParent = closestNode.parent;
            insertionIndex = closestNodeIndex -  1;
        } else if (!closestNodeIndex /* if root */ || (closestNode.dispayType === "container" && mousePos.y > yMidPoint && mousePos.y < yBottom)) {
            insertionParent = closestNode;
            insertionIndex = 0;
        } else {
            insertionParent = closestNode.parent;
            insertionIndex = closestNodeIndex;
        }
        return {insertionParent: closestNode, insertionIndex: insertionIndex};
    } else {
        return;
    }
}

var ComponentSidebar = React.createClass({
    getInitialState: function () {
      return {};
    },
    makeOnMouseDown: function (Component) {
        var name = Component.name
        var that = this;
        return function (e) {
            that.setState({draggedComponent: name});
            dragManager.start(e, {
                dragType: "addComponent",
                onMove: function (e) {
                    var pos = getGlobalPosFromSyntheticEvent(e);
                    if (this.dropSpot) {
                        this.dropSpot.insertionParent.hideDropHighlight(this.dropSpot.insertionIndex);
                    }
                    this.dropSpot = findDropSpot(pos, stateManager.getState().currentPage);

                    stateManager.updateState(function(state) {
                        
                        if (this.dropSpot) {
                            var insertionIndex = this.dropSpot.insertionIndex;
                            if (insertionIndex === 0) {
                                state.dropHighlightId = this.dropSpot.insertionParent.id;
                            } else {
                                state.dropHighlightId = this.dropSpot.children[insertionIndex].id;
                            }                                                        
                        } else {
                            state.dropHighlightId = undefined;
                        }
                    })
                    
                    
                    that.setState(pos);
                    stateManager.triggerUpdate();
                },
                onUp: function () {
                    if (this.dropSpot) {
                        this.dropSpot.insertionParent.addChild(new Component(), this.dropSpot.insertionIndex);
                        stateManager.triggerUpdate();
                    }
                    that.setState({draggedComponent: ""});
                }
            });
        }
        
    },
    render: function() {
        var draggingComponent;
        var items = _.map(this.props.components, (component, ind) => {
            return (
                <li className={classnames("c-default noselect",{dragged: component.name === this.state.draggedComponent})}
                    onMouseDown={this.makeOnMouseDown(component)}>
                    {component.name}
                </li>
            )
        });

        if (dragManager.drag && dragManager.drag.dragType === "addComponent" && dragManager.drag.consummated) {
            draggingComponent = <div className="absolute" style={{
                left: this.state.x,
                top: this.state.y
            }}>{this.state.draggedComponent}</div>
        }
        
        return (
            <div>
                <ul className="list">
                    {items}
                </ul>
                {draggingComponent}
            </div>
        );
    }
});

var ComponentTree = React.createClass({
    render: function() {
        var children;

        if (this.props.node.children.length) {
            children = <TreeChildren children={this.props.node.children}/>;
        }
        
        return (
            <div>
                <TreeItem node={this.props.node} />
                {children}
            </div>
        )
    }
});

var TreeItem = React.createClass({
    render: function() {
        return <span className={classnames("mb2 outline_" + this.props.node.id, this.props.node.outlineViewClassNames)}>{this.props.node.name}</span>
    }
});

var TreeChildren = React.createClass({
    render: function() {
        var children = _.map(this.props.children, function(child) {
            return <ComponentTree node={child} />
        });
        
        return (
            <div className="ml3">
                {children}
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
        stateManager.registerChangeCallback((newState) => {
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
                    <ComponentTree node={this.state.currentPage}/>
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

   Create Slack.


   Need to revise the flex grow flex shrink ideas.... Growing is natural in many cases. Should closer map to how it is set up like I want this constant and I want this not...

   Proposed superdiv spec
     - Horizontal or Vertical
     - Fills 100% of the width
     - When horizontal
       - Non fixed sizes fill the rest of the width
       - Can set the distribution along both axis like in flex.


    - if it hits the side evenly distribute the elements?


    - What if it is justified left and you don't hit the side of the containing element?
        

*/




