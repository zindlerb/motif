nimport _ from "lodash";
import React from "react";
import {Rect} from "./utils.js";
import $ from 'jquery';

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
}

/* Un-Normalized */

class ComponentBaseClass {
    /* Due to the complex nature of component cannot mutate in any other way besides the methods */
    constructor() {
        /* Defaults */
        this.isRoot = false;
        this.isBlock = false;
        this.master = undefined;
        this.parent = undefined;
        this.children = [];
        this.attributes = {};
        this.variables = {};
        this._variants = [];
        this.childrenAllowed = false;

        Object.assign(this, spec)
        
        this.id = guid();
    }

    createVariant() {
        if (this.isBlock) {
            // Currently returns with no parent.
            var variant = new Component(this);

            _.forEach(variant.children, function(vChild) {
                variant.addChild(vChild.createVariant(variant))
            });
            
            this._variants.push(variant);

            return variant;
        } else {
            throw "Only blocks can create variants";
        }
    }

    makeBlock(name, blocks) {
        // Not a good method on obj. Needs to do something else with other state.
        /* 
           This needs to do more.
           It needs to clone itself and remove _el and then set the existing self on the blocks obj.
         */
        this.name = name;
        delete this.master;
        this.isBlock = true;
        
        blocks[this.id] = this;        
    }

    addChild(child, ind) {
        this.variants.forEach(function(variant) {
           variant.addChild(child, ind);
        });
        
        child.parent = this;
        if (ind === undefined) {
            this.children.push(child);
        } else {
            this.children.splice(ind, 0, child);
        }
    }

    removeChild(child) {
        /* 
           May have an issue with things not getting gc'd might be refs still from something that considers this a variant. 
         */
        
        _.remove(this.children, function(parentsChild) {
            return parentsChild.id === child.id;
        });
        
        delete child.parent;

        return child;
    }

    deleteSelf() {
        this.parent.removeChild(this);
        _.remove(this.master._variants, (variant) => {
           return variant === this.id; 
        });
    }

    getAllAttrs() {
        return Object.assign({}, this.master.attributes, this.attributes);
    }

    getCss() {
        /* attrName: func => css obj */
        var attrToCssLookup = {
            
        }
        
        /* Compile attrs into css */
    }

    getRect() {
        return new Rect().fromElement($(this._el));
    }

    getDropPoints(ind) {
        var beforePoint, afterPoint, highlightType;

        if (this.attrs.root) {
            return [];
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

        return [
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
        ];
    }
    
    isLastChild() {
        return _.last(this.parent.children).id === this.id;
    }

    isFirstChild() {     
        return _.first(this.parent.children).id === this.id;
    }

    walkChildren() {
        
    }

    render: function () {
        /* Implement on child */
        /* Must set this._el */
    }
}

export class Container extends ComponentBaseClass {
    constructor(spec) {
        var initialSpec = {
            attributes: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            },
            childrenAllowed: true
        }
        
        super(Object.assign(initialSpec, spec));
    }

    getDropPoints(ind) {
        return super.getDropPoints(ind).push({
            point: {x: this.middleX, y: this.middleY},
            parent: this,
            insertionIndex: 0,
            highlightType: "center"
        });        
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
}

export class Text extends ComponentBaseClass {
    constructor(spec) {
        var defaultSpec = {
            attributes: {
                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis libero at libero dictum tempor. Cras ut odio erat. Fusce semper odio ac dignissim sollicitudin. Vivamus in tortor lobortis, bibendum lacus feugiat, vestibulum magna. Vivamus pellentesque mollis turpis, at consequat nisl tincidunt at. Nullam finibus cursus varius. Nam id consequat nunc, vitae accumsan metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse fringilla sed lorem eleifend porta. Vivamus euismod, sapien at pretium convallis, elit libero auctor felis, id porttitor dui leo id ipsum. Etiam urna velit, ornare condimentum tincidunt quis, tincidunt a dolor. Morbi at ex hendrerit, vestibulum tellus eu, rhoncus est. In rutrum, diam dignissim condimentum tristique, ante odio rhoncus justo, quis maximus elit orci id orci."
            },
        };
        
        super(Object.assign(defaultSpec, spec));
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
    constructor(spec) {
        var defaultSpec = {
            attributes: {
                text: "I am a header"
            }
        }
        super(Object.assign(defaultSpec, spec));
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
    constructor(spec) {
        var defaultSpec = {
            name: "Image"
            attributes: {
                src: './public/img/slack/everywhere.png'
            },
        }

        this.displayType = "content";
    }

    render() {
        return (
            <img ref={(r) => this._el = r} style={this.sx} className={"node_" + this.id} src=this.src.attrs />
        )
    }
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
