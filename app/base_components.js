import _ from "lodash";
import React from "react";
import {Rect} from "./utils.js";
import $ from 'jquery';

/* Data for component tree */
/* 
   Write the data for components in normalized and un-normalized way.
 */


/* Un-Normalized */

class Component {
    constructor(master, head, parent, children) {
        this.id = genId();
        
        this.isRoot = isRoot || false;
        this.canHaveChildren = false;
        
        this.master = master;
        this.children = children || [];
        this.parent = parent;
        this.head = head;
        this.attributes = attrs;
    }

    getCss() {
        /* returns css from attrs */
    }

    createVariant() {
        
    }

    addChild() {
        
    }
}

class Container extends Component {
    
}

class Paragraph extends Component {
    
}



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

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
}

class CSSProperty {
    constructor(name, args) {
        this.name = name;
        this.args = args;
    }
}

// CSS Property Types
const COLOR = "COLOR";
const SELECT = "SELECT";
/* expects choices array */
const NUMBER = "NUMBER";



class ComponentBaseClass {
    constructor(name, baseStyle, attrs, parent) {
        attrs = attrs || {};
        this.name = name;
        this.attrs = attrs;
        this.sx = Object.assign({}, baseStyle, attrs.style);
        this.id = guid();
        this.parent = parent;

        /* 
           Need to add non css properties
           like abs and flex
         */

        this.cssProperties = [
            new CSSProperty("width"),
            new CSSProperty("height"),
            new CSSProperty("padding"),
            new CSSProperty("margin"),
            new CSSProperty("border"),
            new CSSProperty("backgroundColor"),
            new CSSProperty("boxShadow"),
            new CSSProperty("overflow"),
        ];

        this.outlineViewClassNames = {};
    }

    render() {
        throw "Not Implemented";
    }

    getRect() {
        return new Rect().fromElement($(this._el));
    }

    getDropPoints(ind) {
        var beforePoint, afterPoint, highlightType;

        if (this.attrs.root) {
            return List();
        }
        
        var rect = this.getRect();
        if (this.parent.attrs.style.flexDirection === "column") {
            beforePoint = {x: rect.middleX, y: rect.y};
            afterPoint = {x: rect.middleX, y: rect.y + rect.h};
            highlightType = "top";
        } else if (rect.parent.attrs.style.flexDirection === "row") {
            beforePoint = {x: rect.x, y: rect.middleY};
            afterPoint = {x: rect.x + rect.w, y: rect.middleY};
            highlightType = "left";
        }

        return fromJS([
            {
                insertionIndex: ind,
                parent: this.parent,
                point: beforePoint,
                highlightType: highlightType
            },
            {
                parent: this.parent,
                insertionIndex: ind + 1,
                point: afterPoint,
                highlightType: highlightType
            }
        ]);
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

export class Container extends ComponentBaseClass {
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

    getDropPoints(ind) {
        return super.getDropPoints(ind).push(Map({
            point: {x: this.middleX, y: this.middleY},
            parent: this,
            insertionIndex: 0,
            highlightType: "center"
        }));        
    }

    render() {
        var children = _.map(this.children, function (child) {
            return child.render();
        });
        
        return (
            <div ref={(r) => this._el = r} style={this.sx} className={"node_" + this.id}>
                {children}
            </div>
        )
    }

    addChild(node, index) {
        node.parent = this;        
        this.children.splice(index, 0, node);
    }
}


export class Text extends ComponentBaseClass {
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
            <p ref={(r) => this._el = r} style={this.sx} className={"node_" + this.id}>
                {this.attrs.text}
            </p>
        )
    }
}

export class Header extends ComponentBaseClass {
    constructor(attrs) {
        attrs = Object.assign({text: "I am a header", attrs});
        
        super("header", {},  attrs);
        this.dispayType = "content";
    }

    render() {
        return (
            <h1 ref={(r) => this._el = r} style={this.sx} className={"node_" + this.id}>
                {this.attrs.text}
            </h1>
        )
    }
}


export class Image extends ComponentBaseClass {
    constructor(attrs) {
        super("image", {src: './public/img/slack/everywhere.png'}, attrs);

        this.displayType = "content";
    }

    render() {
        return (
            <img ref={(r) => this._el = r} style={this.sx} className={"node_" + this.id} src={this.attrs.src} />
        )
    }
}

export function walkComponentTree(node, cb, ind) {
    cb(node, ind);

    if (node.children) {
        node.children.forEach(function(child, ind) {
            walkNodeTree(child, cb, ind);
        });
    }
}
