import _ from "lodash";
import React from "react";
import {Rect} from "./utils.js";
import $ from 'jquery';
import {guid} from './utils.js'
import classnames from 'classnames';
/* TD: fix circular deps */
import {actionDispatch} from './stateManager.js';
import {dragManager} from './dragManager.js';

/* Field Types */
export const TEXT_FIELD = "TEXT_FIELD"; /* fieldSettings:  */
export const LARGE_TEXT_FIELD = "LARGE_TEXT_FIELD"; /* fieldSettings:  */
export const NUMBER = "NUMBER"; /* fieldSettings: eventually allow for multi-value */
export const COLOR = "COLOR"; /* fieldSettings:  */
export const DROPDOWN = "DROPDOWN"; /* fieldSettings: choices - {name: , value: } */
export const TOGGLE = "TOGGLE" /*  */

/* Component Types */
export const CONTAINER = "CONTAINER";
export const HEADER = "HEADER";
export const PARAGRAPH = "PARAGRAPH";
export const IMAGE = "IMAGE";

export var getInsertionSpacerId = function (parent, insertionInd, view) {
  return [parent, insertionInd, view].join("_");
}

/* Attribute Fieldset */
export var attributeFieldset = {
  position: {
    fieldType: DROPDOWN,
    fieldSettings: {
      choices: [
        "static",
        "absolute"
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
  },
  width: {
    fieldType: TEXT_FIELD,
    fieldSetting: {}
  },
  minWidth: {
    fieldType: TEXT_FIELD,
    fieldSetting: {}
  },
  maxWidth: {
    fieldType: TEXT_FIELD,
    fieldSettings: {}
  },
  height: {
    fieldType: TEXT_FIELD,
    fieldSettings: {}
  },
  backgroundColor: {
    fieldType: COLOR,
    fieldSettings: {}
  }
}

var ComponentBaseClass = {
  createVariant(spec) {
    /*
       Attributes and Variables have the prototype of the master's attributes and variables
       Adding and removing children is synced in api
     */
    var variant = Object.create(this);
    spec = spec || {};

    /* Setup new component */
    variant.master = this;
    variant.variables = {};
    variant.attributes = {
      position: "static",
      margin: "0px",
      padding: "0px",
      height: "auto",
      width: "auto",
      backgroundColor: "transparent"
    };
    variant.children = [];
    variant._variants = [];
    variant.id = guid();
    variant._domElements = {};

    if (spec.children) {
      spec.children.forEach(function(child) {
        child.parent = variant;
      });
    }

    _.merge(variant, spec);

    _.forEach(this.children, function(child) {
      variant.addChild(child.createVariant());
    });

    if (this._variants /* Don't keep track of variants on base */) {
      this._variants.push(variant);
    }


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
    var masterAttrs = {};
    if (this.master) {
      masterAttrs = this.master.getAllAttrs();
    }

    return Object.assign({}, masterAttrs, this.attributes);
  },

  getRenderableProperties() {
    /* Func transform goes here */
    var attrToCssLookup = {
    }

    var attrToHtmlPropertyLookup = {
      text: true,
    }

    return _.reduce(this.getAllAttrs(), function(renderableAttributes, attrVal, attrKey) {
      if (attrToHtmlPropertyLookup[attrKey]) {
        renderableAttributes.htmlProperties[attrKey] = attrVal;
      } else if (attrToCssLookup[attrKey]) {
        Object.assign(renderableAttributes.sx, attrToCssLookup[attrKey](attrVal));
      } else {
        renderableAttributes.sx[attrKey] = attrVal;
      }

      return renderableAttributes;
    }, {
      htmlProperties: {},
      sx: {}
    });
  },

  getRect(elementType) {
    var el = this._domElements[elementType];

    if (!el) {
      throw "Element Missing!"
    }

    return new Rect().fromElement($(el));
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
  var rect = this.getRect("pageView");
  var attrs = this.getAllAttrs();
  var flexDirection = attrs.flexDirection;
  var initialPoints;
  var hasNoChildren = this.children.length === 0;
  var padding = 1;

  if (flexDirection === "column") {
    initialPoints = [{x: rect.x, y: rect.y + padding}, {x: rect.x + rect.w, y: rect.y + padding}];
  } else if (flexDirection === "row") {
    initialPoints = [{x: rect.x + padding, y: rect.y}, {x: rect.x + padding, y: rect.y + rect.h}];
  }

  var dropPoints = [
    {
      insertionIndex: 0,
      parent: this,
      points: initialPoints
    }
  ];

  this.children.forEach((child, ind) => {
    var rect = child.getRect("pageView");
    var points;

    if (flexDirection === "column") {
      points = [{x: rect.x, y: rect.y + rect.h}, {x: rect.x + rect.w, y: rect.y + rect.h}];
    } else if (flexDirection === "row") {
      points = [{x: rect.x + rect.w, y: rect.y}, {x: rect.x + rect.w, y: rect.y + rect.h}];
    }

    dropPoints.push({
      insertionIndex: ind + 1,
      parent: this,
      points: points
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
