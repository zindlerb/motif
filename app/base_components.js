import _ from 'lodash';
import $ from 'jquery';

import { guid, Rect } from './utils';

/* Field Types */
export const TEXT_FIELD = 'TEXT_FIELD'; /* fieldSettings:  */
export const LARGE_TEXT_FIELD = 'LARGE_TEXT_FIELD'; /* fieldSettings:  */
export const NUMBER = 'NUMBER'; /* fieldSettings: eventually allow for multi-value */
export const COLOR = 'COLOR'; /* fieldSettings:  */
export const DROPDOWN = 'DROPDOWN'; /* fieldSettings: choices - {name: , value: } */
export const TOGGLE = 'TOGGLE'; /*  */

/* Component Types */
export const CONTAINER = 'CONTAINER';
export const HEADER = 'HEADER';
export const TEXT = 'TEXT';
export const IMAGE = 'IMAGE';

export const getInsertionSpacerId = function (parent, insertionInd, view) {
  return [parent, insertionInd, view].join('_');
};

/*
Attrs and children can be altered with attrs

attributes: {
  state: {attributes, children}
}

Lets say a component is

Container
  Container
    Header

I want to say on hover the header gets an underline

Where do I specify that?

On the header component then that propegates to the children.

But!

If a component can have diff children based on their state how does this workShop

For a state are you choosing the existance of components or their ful state

If it is the existance then what about new components?



A new state is a variant?

State A
C
  C

State B
C
 C

Add H to 2nd C

State B
C
 C
  H

What is A?
- Unchanged under the aparatus model
What if I delete A?
- The C -> H gets deleted in B




What would things look like if I went more of the react model?

Component Instances Cannot be Mutated

Components Expose Arguments - these arguments can be edited from the outside
Components Expose Types - dropdown of types

Need to prototype workflow of building up components

What is the actual diff between the aparatus model and the react model?



In css how would you declare multiple layouts for different states?


*/

/* Attribute Fieldset */
export const attributeFieldset = {
  position: {
    fieldType: DROPDOWN,
    fieldSettings: {
      choices: [
        'static',
        'absolute'
      ]
    }
  },
  flexDirection: {
    fieldType: DROPDOWN,
    fieldSettings: {
      choices: [
        'column',
        'row'
      ]
    }
  },
  justifyContent: {
    fieldType: DROPDOWN,
    fieldSettings: {
      choices: [
        'flex-start',
        'flex-end',
        'center',
        'space-between',
        'space-around'
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
};

// States
export const DEFAULT = 'DEFAULT';
export const HOVER = 'HOVER';
// State managed outside component and passed in.

/*
   change get css to handle states
   change change attr
   change get attr


 */

export class Component {
  constructor(spec) {

    this.attributes = {};
    this.children = [];
    this._variants = [];
    this.master = undefined;
    this.parent = undefined;

    _.merge(this, spec);

    this.id = guid();
    this['###domElements'] = {};
  }

  getSerializableData() {
    return [
      'attributes',
      'children',
      'master',
      'parent',
      '_variants',
      'id',
      'componentType',
      'name',
    ].reduce((dataObj, key) => {
      dataObj[key] = _.clone(this[key]);

      return dataObj;
    }, {});
  }

  createVariant(spec) {
    let variant = Object.create(this);

    variant.constructor(Object.assign(spec || {}, {
      master: this
    }));

    //If children in spec. For debugging
    variant.children.forEach((child) => {
      child.parent = variant;
    });

    _.forEach(this.children, function (child) {
      variant.addChild(child.createVariant());
    });

    this._variants.push(variant);

    return variant;
  }

  addChild(child, ind) {
    this._variants.forEach(function (variant) {
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
    _.remove(this.children, function (parentsChild) {
      return parentsChild.id === child.id;
    });

    delete child.parent;

    this._variants.forEach(function(variant) {
      variant.removeChild(child);
    });

    return child;
  }

  removeSelf() {
    this.parent.removeChild(this);
    _.remove(this.master._variants, variant => variant.id === this.id);
    this.master = undefined;
  }

  getAllAttrs(state) {
    let masterAttrs = {};
    if (this.master) {
      masterAttrs = this.master.getAllAttrs(state);
    }

    return Object.assign({}, masterAttrs, this.attributes[state]);
  }

  setAttr(state, key, newVal) {
    if (!this.attributes[state]) {
      this.attributes[state] = {};
    }

    this.attributes[state][key] = newVal;
  }

  getName() {
    if (!this.name) {
      return this.master.name;
    }

    return this.name;
  }

  getRenderableProperties() {
    /* Func transform goes here */
    let attrToCssLookup = {
    };

    let attrToHtmlPropertyLookup = {
      text: true,
    };

    return _.reduce(this.getAllAttrs(), function (stateAttrs, attrs, state) {
      stateAttrs[state] = _.reduce(attrs, function (renderableAttributes, attrVal, attrKey) {
        if (attrToHtmlPropertyLookup[attrKey]) {
          renderableAttributes.htmlProperties[attrKey] = attrVal;
        } else if (attrToCssLookup[attrKey]) {
          Object.assign(renderableAttributes.sx, attrToCssLookup[attrKey](attrVal));
        } else {
          renderableAttributes.sx[attrKey] = attrVal;
        }
      }, {htmlProperties: [], sx: []});

      return renderableAttributes;
    }, {});
  }

  getRect(elementType) {
    // treeView, componentView
    let el = this['###domElements'][elementType];

    if (!el) {
      return false;
    }

    return new Rect().fromElement($(el));
  }

  isLastChild() {
    if (!this.parent) {
      return false;
    }
    return _.last(this.parent.children).id === this.id;
  }

  isFirstChild() {
    if (!this.parent) {
      return false;
    }
    return _.first(this.parent.children).id === this.id;
  }

  getInd() {
    return _.findIndex(this.parent.children, child => child.id === this.id);
  }

  walkChildren(func, ind, isChild) {
    if (isChild) {
      func(this, ind);
    }

    this.children.forEach(function (child, ind) {
      child.walkChildren(func, ind, true);
    });
  }
}



export class Container extends Component {
  constructor(...args) {
    super(...args);
    this.componentType = CONTAINER;
  }

  getDropPoints() {
    let rect = this.getRect('pageView');
    let attrs = this.getAllAttrs();
    let flexDirection = attrs.flexDirection;
    let initialPoints;
    let padding = 2;

    if (flexDirection === 'column') {
      initialPoints = [
        { x: rect.x, y: rect.y + padding },
        { x: rect.x + rect.w, y: rect.y + padding }
      ];
    } else if (flexDirection === 'row') {
      initialPoints = [
        { x: rect.x + padding, y: rect.y },
        { x: rect.x + padding, y: rect.y + rect.h }
      ];
    }

    let dropPoints = [
      {
        insertionIndex: 0,
        parent: this,
        points: initialPoints
      }
    ];

    this.children.forEach((child, ind) => {
      let rect = child.getRect('pageView');
      let points;

      if (flexDirection === 'column') {
        points = [{ x: rect.x, y: rect.y + rect.h }, { x: rect.x + rect.w, y: rect.y + rect.h }];
      } else if (flexDirection === 'row') {
        points = [{ x: rect.x + rect.w, y: rect.y }, { x: rect.x + rect.w, y: rect.y + rect.h }];
      }

      dropPoints.push({
        insertionIndex: ind + 1,
        parent: this,
        points
      });
    });

    return dropPoints;
  }
}

export class Text extends Component {
  constructor(...args) {
    super(...args);
    this.componentType = TEXT;
  }
}

export class Header extends Component {
  constructor(...args) {
    super(...args);
    this.componentType = HEADER;
  }
}

export class Image extends Component {
  constructor(...args) {
    super(...args)
    this.componentType = IMAGE;
  }
}

const defaultAttributes = {
  position: 'static',
  margin: '0px',
  padding: '0px',
  height: 'auto',
  width: 'auto',
  backgroundColor: 'transparent'
};

export const container = new Container({
  name: 'Container',
  attributes: _.extend(defaultAttributes, {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  }),
  childrenAllowed: true
});

export const text = new Text({
  name: 'Text',
  attributes: _.extend(defaultAttributes, {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis libero at libero dictum tempor. Cras ut odio erat. Fusce semper odio ac dignissim sollicitudin. Vivamus in tortor lobortis, bibendum lacus feugiat, vestibulum magna. Vivamus pellentesque mollis turpis, at consequat nisl tincidunt at. Nullam finibus cursus varius. Nam id consequat nunc, vitae accumsan metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse fringilla sed lorem eleifend porta. Vivamus euismod, sapien at pretium convallis, elit libero auctor felis, id porttitor dui leo id ipsum. Etiam urna velit, ornare condimentum tincidunt quis, tincidunt a dolor. Morbi at ex hendrerit, vestibulum tellus eu, rhoncus est. In rutrum, diam dignissim condimentum tristique, ante odio rhoncus justo, quis maximus elit orci id orci.'
  })
});

export const header = new Header({
  name: 'Header',
  attributes: _.extend(defaultAttributes, {
    text: 'I am a header'
  })
});

export const image = new Image({
  name: 'Image',
  attributes: _.extend(defaultAttributes, {
    src: ''
  }),
});
