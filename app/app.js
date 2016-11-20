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
        attrs = attrs || {};
        this.name = name;
        this.attrs = attrs;
        this.sx = Object.assign({}, baseStyle, attrs.style);
        this.id = guid();
        this.parent = parent;

        this.outlineViewClassNames = {};
    }

    render() {
        
    }

    _notImplementedOnRoot() {
        if (this.attrs.root) {
            throw "Not Implemented On Root";
        }
    }

    isLastChild() {
        this._notImplementedOnRoot();
        return _.last(this.parent.children).id === this.id;
    }

    isFirstChild() {
        this._notImplementedOnRoot();
        return _.first(this.parent.children).id === this.id;
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
    constructor(attrs, children) {
        super("container", {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }, attrs);

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
        this.children.splice(index, 0, node);
    }
}


class Text extends ComponentBaseClass {
    constructor(attrs) {
        attrs = Object.assign({
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis libero at libero dictum tempor. Cras ut odio erat. Fusce semper odio ac dignissim sollicitudin. Vivamus in tortor lobortis, bibendum lacus feugiat, vestibulum magna. Vivamus pellentesque mollis turpis, at consequat nisl tincidunt at. Nullam finibus cursus varius. Nam id consequat nunc, vitae accumsan metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse fringilla sed lorem eleifend porta. Vivamus euismod, sapien at pretium convallis, elit libero auctor felis, id porttitor dui leo id ipsum. Etiam urna velit, ornare condimentum tincidunt quis, tincidunt a dolor. Morbi at ex hendrerit, vestibulum tellus eu, rhoncus est. In rutrum, diam dignissim condimentum tristique, ante odio rhoncus justo, quis maximus elit orci id orci.",
            attrs
        });
        
        super("text", {}, attrs);
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
        attrs = Object.assign({text: "I am a header", attrs});
        
        super("header", {},  attrs);
        this.dispayType = "content";
    }

    render() {
        return (
            <h1 style={this.sx}>
                {this.attrs.text}
            </h1>
        )
    }
}


class Image extends ComponentBaseClass {
    constructor(attrs) {
        super("image", {src: './public/img/slack/everywhere.png'}, attrs);

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
        currentPage: new Container({root: true})
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
        triggerUpdate: triggerReRender,
        state: state
    }
}

var stateManager = StateManager();

function getGlobalPosFromSyntheticEvent(e) {
    return {x: e.clientX, y: e.clientY};
}

function walkNodeTree(node, cb, ind) {
    cb(node, ind);

    if (node.children) {
        node.children.forEach(function(child, ind) {
            walkNodeTree(child, cb, ind);
        });
    }
}

function distanceBetweenPoints(p1, p2) {
    return Math.abs(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));
}

class Rect {
    constructor(attrs) {
        if (attrs) {
            this.x = attrs.x;
            this.y = attrs.y;
            this.w = attrs.w;
            this.h = attrs.h;
        }
    }

    getHandles() {
        throw "not implemented";
        return {
            topLeft: "" ,
            topCenter: "",
            topRight: "",
            middleLeft: "",
            middleCenter: "",
            middleRight: "",
            bottomrLeft: "",
            bottomCenter: "",
            bottomRight: ""
        };
    }

    fromElement(el) {
        var height = el.height();
        var width = el.width();
        var offset = el.offset();

        this.x = offset.left;
        this.y = offset.top;
        this.w = width;
        this.h = height;

        this._el = el;

        return this;
    }
}

function findDropSpot(mousePos, nodeTree) {
    var closestNodeDist = 50;
    var foundANode = false;
    /* {dist:, el: , ind:, node:} */
    var closestNodes = {
        above: {dist: closestNodeDist},
        below: {dist: closestNodeDist}
    }

    walkNodeTree(nodeTree, function (node, ind) {
        var el = $(".outline_" + node.id)
        var nodePos = el.offset();
        var nodeMidPoint = nodePos.top + el.height()/2;
        var dist = distanceBetweenPoints(mousePos, {x: nodePos.left, y: nodePos.top + el.height()/2});

        var closestNode = closestNodes["below"];
        if (mousePos.y > nodeMidPoint) {
            closestNode = closestNodes["above"];
        }
        
        if (dist < closestNode.dist) {
            foundANode = true;
            closestNode.dist = dist;
            closestNode.node = node;
            closestNode.el = el;
            closestNode.ind = ind;
        }
    });

    if (foundANode) {
        var {above, below} = closestNodes;

        if (above.node) {
            var aboveRect = new Rect().fromElement(above.el);            
        }

        console.log("above.children", above.node.children.length, above.node.children);
        
        var dropType;
        if (above.node.attrs.root) {
            dropType = "child";
        } else if (below.node && above.node.isLastChild()) {
            dropType = "sibling";
            
        } else if (above.node.displayType === "container" && (above.node.children.length || (mousePos.y > aboveRect.y +  aboveRect.h/2 && mousePos.y < aboveRect.y + aboveRect.h))) {
            dropType = "child";
        } else {
            dropType = "sibling";
        }
        
        return {node: above.node, ind: above.ind, dropType: dropType};
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
                    this.dropSpot = findDropSpot(pos, stateManager.state.currentPage);

                    stateManager.updateState((state) => {
                        if (this.dropSpot) {
                            state.dropHighlightId = this.dropSpot.node.id;
                            state.highlightType = this.dropSpot.dropType;
                        }
                    })
                    
                    that.setState(pos);
                    stateManager.triggerUpdate();
                },
                onUp: function () {
                    stateManager.updateState((state) => {
                        if (this.dropSpot) {
                            var {dropType, node, ind} = this.dropSpot;
                            if (dropType === "child") {
                                node.addChild(new Component());                            
                            } else if (dropType === "sibling") {
                                node.parent.addChild(new Component(), ind + 1);
                            }
                        }

                        state.dropHighlightId = undefined;
                        state.highlightType = undefined;
                    });
                    
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
        
        if (this.props.node.children && this.props.node.children.length) {
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
        return <span className={classnames(
                "mb2 outline_" + this.props.node.id,
                {
                    highlightBottom: stateManager.state.dropHighlightId === this.props.node.id
                },
                stateManager.state.highlightType,
                "db"
            )}>{this.props.node.name}</span>
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
var StaticRenderer = React.createClass({
    render: function() {
        return (
            <div>
              {this.props.page ? this.props.page.render() : ""}
            </div>
        );
    }
});

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
            <div className="flex">
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




