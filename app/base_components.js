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
export const ROOT = 'ROOT';

export const getInsertionSpacerId = function (parent, insertionInd, view) {
  return [parent, insertionInd, view].join('_');
};

// States
export const DEFAULT = 'DEFAULT';
export const HOVER = 'HOVER';

export class Component {
  constructor(spec) {
    this.attributes = {
      [DEFAULT]: {}
    };
    this.children = [];
    this._variants = [];
    this.master = undefined;
    this.parent = undefined;

    this.fields = [
      {name: 'position', fieldType: DROPDOWN, choices: ['static', 'absolute']},
      {name: 'margin', fieldType: TEXT_FIELD},
      {name: 'padding', fieldType: TEXT_FIELD},
      {name: 'height', fieldType: TEXT_FIELD},
      {name: 'width', fieldType: TEXT_FIELD},
      {name: 'backgroundColor', fieldType: COLOR},
    ];

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
    state = state || DEFAULT;
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

  getRenderableProperties(state) {
    /* Func transform goes here */
    let attrToCssLookup = {
    };

    let attrToHtmlPropertyLookup = {
      text: true,
      src: true
    };

    return _.reduce(this.getAllAttrs(state), function (renderableAttributes, attrVal, attrKey) {
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
    this.fields = this.fields.concat([
      { name: 'flexDirection', fieldType: DROPDOWN, choices: ['row', 'column'] },
      {
        name: 'justifyContent',
        fieldType: DROPDOWN,
        choices: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around']
      },
      {
        name: 'alignItems',
        fieldType: DROPDOWN,
        choices: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch']
      }
    ]);
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

export class Root extends Container {
  constructor(...args) {
    super(...args);
    this.name = 'Root';
    this.componentType = ROOT;
  }
}

export class Text extends Component {
  constructor(...args) {
    super(...args);
    this.componentType = TEXT;
    this.fields = this.fields.concat([
      {name: 'text', fieldType: TEXT_FIELD}
    ]);
  }
}

export class Header extends Component {
  constructor(...args) {
    super(...args);
    this.componentType = HEADER;
    this.fields = this.fields.concat([
      {name: 'text', fieldType: TEXT_FIELD}
    ]);
  }
}

export class Image extends Component {
  constructor(...args) {
    super(...args);
    this.componentType = IMAGE;
    this.fields = this.fields.concat([
      {name: 'src', fieldType: TEXT_FIELD}
    ]);
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

export const containerAttributes = {
  [DEFAULT]: Object.assign({}, defaultAttributes, {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  })
}

export const root = new Root({
  attributes: {
    [DEFAULT]: {
      height: '100%'
    }
  }
})

export const container = new Container({
  name: 'Container',
  attributes: containerAttributes,
  childrenAllowed: true
});

export const text = new Text({
  name: 'Text',
  attributes: {
    [DEFAULT]: Object.assign({}, defaultAttributes, {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis libero at libero dictum tempor. Cras ut odio erat. Fusce semper odio ac dignissim sollicitudin. Vivamus in tortor lobortis, bibendum lacus feugiat, vestibulum magna. Vivamus pellentesque mollis turpis, at consequat nisl tincidunt at. Nullam finibus cursus varius. Nam id consequat nunc, vitae accumsan metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse fringilla sed lorem eleifend porta. Vivamus euismod, sapien at pretium convallis, elit libero auctor felis, id porttitor dui leo id ipsum. Etiam urna velit, ornare condimentum tincidunt quis, tincidunt a dolor. Morbi at ex hendrerit, vestibulum tellus eu, rhoncus est. In rutrum, diam dignissim condimentum tristique, ante odio rhoncus justo, quis maximus elit orci id orci.'
    })
  }
});

export const header = new Header({
  name: 'Header',
  attributes: {
    [DEFAULT]: Object.assign({}, defaultAttributes, {
      text: 'I am a header'
    })
  }
});

export const image = new Image({
  name: 'Image',
  attributes: {
    [DEFAULT]: Object.assign({}, defaultAttributes, {
      src: ''
    })
  },
});

export function createNewAsset(asset) {
  return image.createVariant({
    name: asset.name,
    attributes: {
      [DEFAULT]: { src: asset.src }
    }
  })
}
