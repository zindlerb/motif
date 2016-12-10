import _ from "lodash";
import React from "react";
import {Rect} from "./utils.js";
import $ from 'jquery';
import {guid} from './utils.js'
import classnames from 'classnames';
/* TD: fix circular deps */
import {actionDispatch} from './stateManager.js';
import dragManager from './dragManager.js';

/* Field Types */
export const TEXT_FIELD = "TEXT_FIELD"; /* fieldSettings:  */
export const NUMBER = "NUMBER"; /* fieldSettings: eventually allow for multi-value */
export const COLOR = "COLOR"; /* fieldSettings:  */
export const DROPDOWN = "DROPDOWN"; /* fieldSettings: choices - {name: , value: } */

/* Component Types */
export const CONTAINER = "CONTAINER";
export const HEADER = "HEADER";
export const PARAGRAPH = "PARAGRAPH";
export const IMAGE = "IMAGE";



/* Attribute Fieldset */
export var attributeFieldset = {
  position: {
    fieldType: DROPDOWN,
    fieldSettings: {
      choices: [
        "flow",
        "anchored"
      ]
    }
  },
  flexDirection: {
    fieldType: DROPDOWN,
    fieldSettings: {
      choices: [
        "column",
        "row"
      ]
    }
  },
  justifyContent: {
    fieldType: DROPDOWN,
    fieldSettings: {
      choices: [
        "flex-start",
        "flex-end",
        "center",
        "space-between",
        "space-around"
      ]
    }
  }

}

var ComponentBaseClass = {
  /* Due to the complex nature of component cannot mutate in any other way besides the methods */
  constructor(master) {
    this.master = master;
    this.childrenAllowed = false;

    this.children = [];
    this._variants = [];

    this.id = guid();
  },

  createVariant(spec) {
    /*
       Attributes and Variables have the prototype of the master's attributes and variables
       Adding and removing children is synced in api
     */

    var variant = Object.create(this);
    variant.constructor(this);
    object.assign(variant, spec);

    _.forEach(this.children, function(child) {
      variant.addChild(child.createVariant());
    });

    this._variants.push(variant);

    return variant;
  },

  addChild(child, ind) {
    this._variants.forEach(function(variant) {
      variant.addChild(child, ind);
    });

    child.parent = this;
    if (ind === undefined) {
      this.children.push(child);
    } else {
      this.children.splice(ind, 0, child);
    }
  },

  removeChild(child) {
    /*
       May have an issue with things not getting gc'd might be refs still from something that considers this a variant.
     */

    _.remove(this.children, function(parentsChild) {
      return parentsChild.id === child.id;
    });

    delete child.parent;

    return child;
  },

  deleteSelf() {
    this.parent.removeChild(this);
    _.remove(this.master._variants, (variant) => {
      return variant === this.id;
    });
  },

  getAllAttrs() {
    return Object.assign({}, this.master.attributes, this.attributes);
  },

  getCss() {
    var attrToCssLookup = {
      position: function(value) {
        /*
           flow: layout is based on the parents flex flow
           anchored: layout is based on a fixed position from the parent.

           CSS Equivalent:
           display
           position
         */
        if (value === "flow") {
          /* Relative in case child is absolutely positioned */
          return {
            position: "relative",
            left: 0,
            top: 0
          }
        } else if (value === "anchored") {
          /* TD: in order to position child in parent parent has to be positioned with relative. */
          return {};
        }
      },
    }

    /*
       - All
       - Z-index
       - Opacity
       - Background color
       - Border/Border Radius
       - Box Shadow
       - Positioning
       - Hidden (T/F)
       - Height
       - Width
       - Margin/Padding
       - Overflow
       - Filter?? (might only be useful on images V2)
       - Text
       - Text color
       - Font
       - Font-Size
       - Line Height
       - Text align vertical or horizontal
       - Other text stuff...

       - Block
       - Child flex layout (spacing)
       - Child flex direction (vertical horizontal)

     */

    var cssStyles = _.reduce(this.attributes, function(css, attrVal, attrKey) {
      if (attrToCssLookup[attrKey]) {
        Object.assign(css, attrToCssLookup[attrKey](attrVal));
      } else {
        css[attrKey] = attrVal;
      }
      return css;
    }, {});

    return Object.assign({}, this.defaultCSS, cssStyles);
  },

  getRect() {
    return new Rect().fromElement($(this._el));
  },

  isLastChild() {
    return _.last(this.parent.children).id === this.id;
  },

  isFirstChild() {
    return _.first(this.parent.children).id === this.id;
  },

  walkChildren(func, ind) {
    func(this, ind);

    this.children.forEach(function (child, ind) {
      child.walkChildren(func, ind);
    });
  },
}

export var Container = ComponentBaseClass.createVariant({
  componentType: CONTAINER,
  name: "Container",
  attributes: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  childrenAllowed: true
});

Container.getDropPoints = function() {
  var rect = this.getRect();
  var flexDirection = this.attributes.flexDirection;
  var initialPoint;
  var hasNoChildren = this.children.length === 0;
  var padding = 10;
  if (flexDirection === "column") {
    if (hasNoChildren) {
      initialPoint = {x: rect.middleX, y: rect.y + padding};
    } else {
      initialPoint = {x: rect.middleX, y: rect.y};
    }
  } else if (flexDirection === "row") {
    if (hasNoChildren) {
      initialPoint = {x: rect.x + padding, y: rect.middleY};
    } else {
      initialPoint = {x: rect.x, y: rect.middleY};
    }
  }

  var dropPoints = [
    {
      insertionIndex: 0,
      parent: this,
      point: initialPoint
    }
  ];

  this.children.forEach((child, ind) => {
    var rect = child.getRect();
    var point;

    if (flexDirection === "column") {
      point = {x: rect.middleX, y: rect.y + rect.h};
    } else if (flexDirection === "row") {
      point = {x: rect.x + rect.w, y: rect.middleY};
    }

    dropPoints.push({
      insertionIndex: ind + 1,
      parent: this,
      point: point
    })
  });

  return dropPoints;
}


export var Text = ComponentBaseClass.createVariant({
  componentType: PARAGRAPH,
  name: "Text",
  attributes: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis libero at libero dictum tempor. Cras ut odio erat. Fusce semper odio ac dignissim sollicitudin. Vivamus in tortor lobortis, bibendum lacus feugiat, vestibulum magna. Vivamus pellentesque mollis turpis, at consequat nisl tincidunt at. Nullam finibus cursus varius. Nam id consequat nunc, vitae accumsan metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse fringilla sed lorem eleifend porta. Vivamus euismod, sapien at pretium convallis, elit libero auctor felis, id porttitor dui leo id ipsum. Etiam urna velit, ornare condimentum tincidunt quis, tincidunt a dolor. Morbi at ex hendrerit, vestibulum tellus eu, rhoncus est. In rutrum, diam dignissim condimentum tristique, ante odio rhoncus justo, quis maximus elit orci id orci."
  }
});

export var Header = ComponentBaseClass.createVariant({
  componentType: HEADER,
  name: "Header",
  attributes: {
    text: "I am a header"
  }
});

export var Image = ComponentBaseClass.createVariant({
  componentType: IMAGE,
  name: "Image",
  attributes: {
    src: './public/img/slack/everywhere.png'
  },
  isBlock: true,
});

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
